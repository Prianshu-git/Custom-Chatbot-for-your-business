import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { ragService } from "./services/rag";
import { scraperService } from "./services/scraper";
import { geminiService } from "./services/gemini";
import { insertChatSessionSchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create chat session
  app.post("/api/chat/session", async (req, res) => {
    try {
      const validatedData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(validatedData);
      
      // If website URL is provided, scrape it
      if (validatedData.websiteUrl) {
        try {
          await scraperService.scrapeWebsite(validatedData.sessionId, validatedData.websiteUrl);
        } catch (error) {
          console.error("Failed to scrape website:", error);
          // Continue without website content
        }
      }
      
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      res.status(500).json({ error: "Failed to create chat session" });
    }
  });

  // Upload documents
  app.post("/api/chat/documents", upload.array('documents', 5), async (req, res) => {
    try {
      const { sessionId } = req.body;
      if (!sessionId) {
        return res.status(400).json({ error: "Session ID is required" });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const documents = [];
      for (const file of files) {
        const content = await ragService.extractTextFromFile(file);
        const document = await storage.createDocument({
          sessionId,
          filename: file.originalname,
          content,
        });
        
        // Generate embeddings for the document
        await ragService.generateEmbeddings(document.id, content);
        documents.push(document);
      }

      res.json({ documents, message: "Documents uploaded and processed successfully" });
    } catch (error) {
      console.error("Document upload error:", error);
      res.status(500).json({ error: "Failed to process documents" });
    }
  });

  // Send chat message
  app.post("/api/chat/message", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      
      // Store user message
      const userMessage = await storage.createChatMessage(validatedData);
      
      // Get chat session to access API key
      const session = await storage.getChatSession(validatedData.sessionId);
      if (!session) {
        return res.status(404).json({ error: "Chat session not found" });
      }

      // Generate AI response using RAG
      const aiResponse = await ragService.generateResponse(
        validatedData.sessionId,
        validatedData.content,
        session.apiKey
      );

      // Store AI message
      const aiMessage = await storage.createChatMessage({
        sessionId: validatedData.sessionId,
        role: "assistant",
        content: aiResponse,
      });

      res.json({ userMessage, aiMessage });
    } catch (error) {
      console.error("Chat message error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: fromZodError(error).toString() });
      }
      res.status(500).json({ error: "Failed to process message" });
    }
  });

  // Get chat history
  app.get("/api/chat/history/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages = await storage.getChatMessagesBySessionId(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Get chat history error:", error);
      res.status(500).json({ error: "Failed to retrieve chat history" });
    }
  });

  // Get chat session
  app.get("/api/chat/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getChatSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Chat session not found" });
      }
      res.json(session);
    } catch (error) {
      console.error("Get chat session error:", error);
      res.status(500).json({ error: "Failed to retrieve chat session" });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
