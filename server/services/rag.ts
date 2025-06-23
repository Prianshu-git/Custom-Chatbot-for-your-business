import { storage } from "../storage";
import { geminiService } from "./gemini";

interface DocumentChunk {
  content: string;
  embedding?: number[];
  source: string;
}

class RAGService {
  private async chunkText(text: string, chunkSize: number = 1000): Promise<string[]> {
    const chunks: string[] = [];
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    let currentChunk = "";
    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = sentence.trim();
      } else {
        currentChunk += (currentChunk ? " " : "") + sentence.trim();
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk);
    }
    
    return chunks;
  }

  async extractTextFromFile(file: Express.Multer.File): Promise<string> {
    const buffer = file.buffer;
    const mimetype = file.mimetype;
    
    try {
      switch (mimetype) {
        case 'text/plain':
          return buffer.toString('utf-8');
        
        case 'application/pdf':
          try {
            const pdfParse = (await import('pdf-parse')).default;
            const pdfData = await pdfParse(buffer);
            return pdfData.text || '';
          } catch (pdfError) {
            console.warn('PDF parsing failed, using fallback:', pdfError);
            // Fallback: simple text extraction
            const text = buffer.toString('utf-8');
            const matches = text.match(/[a-zA-Z0-9\s.,!?;:'"()-]+/g);
            return matches ? matches.join(' ').replace(/\s+/g, ' ').trim() : '';
          }
        
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          try {
            const mammoth = await import('mammoth');
            const docxResult = await mammoth.extractRawText({ buffer });
            return docxResult.value || '';
          } catch (docxError) {
            console.warn('DOCX parsing failed, using fallback:', docxError);
            // Fallback: simple XML text extraction
            const text = buffer.toString('utf-8');
            const matches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
            if (matches) {
              return matches.map(match => match.replace(/<[^>]+>/g, '')).join(' ');
            }
            return '';
          }
        
        default:
          throw new Error(`Unsupported file type: ${mimetype}`);
      }
    } catch (error) {
      console.error(`Failed to extract text from ${file.originalname}:`, error);
      throw new Error(`Failed to extract text from ${file.originalname}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateEmbeddings(documentId: number, content: string): Promise<void> {
    try {
      // For this demo, we'll use a simple text-based similarity approach
      // In production, you'd use proper embedding models
      const chunks = await this.chunkText(content);
      
      // Store chunks with basic "embeddings" (simplified for demo)
      const embeddings = chunks.map(chunk => this.simpleTextEmbedding(chunk));
      
      // Store the first embedding as representative
      if (embeddings.length > 0) {
        await storage.updateDocumentEmbedding(documentId, embeddings[0]);
      }
    } catch (error) {
      console.error('Failed to generate embeddings:', error);
    }
  }

  private simpleTextEmbedding(text: string): number[] {
    // Simple text embedding based on character frequencies
    // In production, use proper embedding models
    const embedding = new Array(100).fill(0);
    const normalized = text.toLowerCase();
    
    for (let i = 0; i < normalized.length; i++) {
      const charCode = normalized.charCodeAt(i);
      if (charCode >= 97 && charCode <= 122) { // a-z
        embedding[charCode - 97] += 1;
      }
    }
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding;
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async findRelevantContent(sessionId: string, query: string): Promise<DocumentChunk[]> {
    const queryEmbedding = this.simpleTextEmbedding(query);
    const documents = await storage.getDocumentsBySessionId(sessionId);
    const websiteContent = await storage.getWebsiteContentBySessionId(sessionId);
    
    const chunks: DocumentChunk[] = [];
    
    // Add document chunks
    for (const doc of documents) {
      if (doc.embedding) {
        const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding as number[]);
        if (similarity > 0.1) { // Threshold for relevance
          chunks.push({
            content: doc.content,
            embedding: doc.embedding as number[],
            source: `Document: ${doc.filename}`,
          });
        }
      }
    }
    
    // Add website content chunks
    for (const content of websiteContent) {
      if (content.embedding) {
        const similarity = this.cosineSimilarity(queryEmbedding, content.embedding as number[]);
        if (similarity > 0.1) {
          chunks.push({
            content: content.content,
            embedding: content.embedding as number[],
            source: `Website: ${content.url}`,
          });
        }
      }
    }
    
    // Sort by relevance (simplified)
    return chunks.slice(0, 5); // Return top 5 relevant chunks
  }

  async generateResponse(sessionId: string, userQuery: string, apiKey: string): Promise<string> {
    try {
      // Find relevant content
      const relevantChunks = await this.findRelevantContent(sessionId, userQuery);
      
      // Create context from relevant chunks
      const context = relevantChunks.length > 0 
        ? relevantChunks.map(chunk => `Source: ${chunk.source}\nContent: ${chunk.content}`).join('\n\n')
        : '';
      
      // Generate response using Gemini
      const response = await geminiService.generateChatResponse(userQuery, context, apiKey);
      
      return response;
    } catch (error) {
      console.error('Failed to generate response:', error);
      return "I apologize, but I'm having trouble processing your request right now. Would you like me to connect you with a human agent for assistance?";
    }
  }
}

export const ragService = new RAGService();
