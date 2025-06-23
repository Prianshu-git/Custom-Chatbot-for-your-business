import { GoogleGenAI } from "@google/genai";

class GeminiService {
  private getAI(apiKey: string) {
    return new GoogleGenAI({ apiKey: apiKey || process.env.GEMINI_API_KEY || "" });
  }

  async generateChatResponse(userQuery: string, context: string, apiKey: string): Promise<string> {
    try {
      const ai = this.getAI(apiKey);
      
      // Determine if we should use context or provide a general response
      const shouldUseContext = context && context.trim().length > 0;
      
      let systemPrompt = `You are a helpful business assistant AI. You help customers with their questions about the business.

IMPORTANT INSTRUCTIONS:
1. If you have relevant context from business documents or website content, use it to provide accurate, helpful answers
2. If you don't have enough information to answer confidently, say "I don't have enough information about that in our documentation. Would you like me to connect you with a human agent who can provide more detailed assistance?"
3. Be professional, friendly, and concise
4. If the question is about something completely unrelated to business (like personal advice, jokes, etc.), politely redirect: "I'm here to help with questions about our business. Is there something specific about our products or services I can help you with?"
5. Never make up or hallucinate information that isn't in the provided context`;

      let prompt = userQuery;
      
      if (shouldUseContext) {
        systemPrompt += `\n\nYou have access to the following business context from documents and website content. Use this information to answer the user's question:\n\n${context}`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt,
        },
        contents: prompt,
      });

      const responseText = response.text;
      
      if (!responseText) {
        return "I apologize, but I'm having trouble processing your request right now. Would you like me to connect you with a human agent for assistance?";
      }

      // Check if the response seems to indicate lack of knowledge
      const lowConfidenceIndicators = [
        "I don't know",
        "I'm not sure",
        "I don't have information",
        "I cannot find",
        "unclear",
        "uncertain"
      ];
      
      const seemsUncertain = lowConfidenceIndicators.some(indicator => 
        responseText.toLowerCase().includes(indicator.toLowerCase())
      );
      
      if (seemsUncertain && !responseText.includes("human agent")) {
        return responseText + " If you need more specific information, I can connect you with a human agent who can provide detailed assistance.";
      }
      
      return responseText;
      
    } catch (error) {
      console.error("Gemini API error:", error);
      
      // Check if it's an API key issue
      if (error instanceof Error && error.message.includes("API_KEY")) {
        return "It seems there's an issue with the API configuration. Please check your API key and try again, or contact support for assistance.";
      }
      
      // Generic error response
      return "I apologize, but I'm experiencing technical difficulties right now. Would you like me to connect you with a human agent who can help you immediately?";
    }
  }

  async testApiKey(apiKey: string): Promise<boolean> {
    try {
      const ai = this.getAI(apiKey);
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Hello, this is a test message. Please respond with 'API key is working'.",
      });
      
      return response.text !== null && response.text !== undefined;
    } catch (error) {
      console.error("API key test failed:", error);
      return false;
    }
  }

  async analyzeSentiment(text: string, apiKey: string): Promise<{ rating: number; confidence: number }> {
    try {
      const ai = this.getAI(apiKey);
      
      const systemPrompt = `You are a sentiment analysis expert. 
Analyze the sentiment of the text and provide a rating from 1 to 5 stars and a confidence score between 0 and 1.
1 star = very negative, 2 stars = negative, 3 stars = neutral, 4 stars = positive, 5 stars = very positive.
Respond with JSON in this format: {'rating': number, 'confidence': number}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              rating: { type: "number" },
              confidence: { type: "number" },
            },
            required: ["rating", "confidence"],
          },
        },
        contents: text,
      });

      const rawJson = response.text;
      
      if (rawJson) {
        const data = JSON.parse(rawJson);
        return {
          rating: Math.max(1, Math.min(5, data.rating)),
          confidence: Math.max(0, Math.min(1, data.confidence))
        };
      } else {
        throw new Error("Empty response from model");
      }
    } catch (error) {
      console.error("Sentiment analysis failed:", error);
      // Return neutral sentiment as fallback
      return { rating: 3, confidence: 0.5 };
    }
  }

  async summarizeText(text: string, apiKey: string): Promise<string> {
    try {
      const ai = this.getAI(apiKey);
      
      const prompt = `Please provide a concise summary of the following text, focusing on the key points and main ideas:\n\n${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return response.text || "Unable to generate summary";
    } catch (error) {
      console.error("Text summarization failed:", error);
      return "Unable to generate summary due to technical issues";
    }
  }

  async extractKeyTopics(text: string, apiKey: string): Promise<string[]> {
    try {
      const ai = this.getAI(apiKey);
      
      const systemPrompt = `Extract the main topics and themes from the given text. Return only a JSON array of strings, each representing a key topic or theme. Limit to maximum 10 topics.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: "array",
            items: {
              type: "string",
            },
          },
        },
        contents: text,
      });

      const rawJson = response.text;
      
      if (rawJson) {
        const topics = JSON.parse(rawJson);
        return Array.isArray(topics) ? topics.slice(0, 10) : [];
      }
      
      return [];
    } catch (error) {
      console.error("Topic extraction failed:", error);
      return [];
    }
  }
}

export const geminiService = new GeminiService();
