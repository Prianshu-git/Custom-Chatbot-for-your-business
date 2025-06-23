import { 
  ChatSession, 
  Document, 
  ChatMessage, 
  WebsiteContent,
  InsertChatSession, 
  InsertDocument, 
  InsertChatMessage, 
  InsertWebsiteContent,
  User,
  InsertUser
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Chat session methods
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(sessionId: string): Promise<ChatSession | undefined>;
  updateChatSession(sessionId: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined>;
  
  // Document methods
  createDocument(document: InsertDocument): Promise<Document>;
  getDocumentsBySessionId(sessionId: string): Promise<Document[]>;
  updateDocumentEmbedding(id: number, embedding: number[]): Promise<void>;
  
  // Chat message methods
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessagesBySessionId(sessionId: string): Promise<ChatMessage[]>;
  
  // Website content methods
  createWebsiteContent(content: InsertWebsiteContent): Promise<WebsiteContent>;
  getWebsiteContentBySessionId(sessionId: string): Promise<WebsiteContent[]>;
  updateWebsiteContentEmbedding(id: number, embedding: number[]): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private chatSessions: Map<string, ChatSession> = new Map();
  private documents: Map<number, Document> = new Map();
  private chatMessages: Map<number, ChatMessage> = new Map();
  private websiteContent: Map<number, WebsiteContent> = new Map();
  
  private currentUserId = 1;
  private currentDocumentId = 1;
  private currentMessageId = 1;
  private currentWebsiteContentId = 1;

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Chat session methods
  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const session: ChatSession = {
      id: this.chatSessions.size + 1,
      ...insertSession,
      websiteUrl: insertSession.websiteUrl || null,
      documentIds: insertSession.documentIds || null,
      createdAt: new Date(),
    };
    this.chatSessions.set(session.sessionId, session);
    return session;
  }

  async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
    return this.chatSessions.get(sessionId);
  }

  async updateChatSession(sessionId: string, updates: Partial<ChatSession>): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(sessionId);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...updates };
    this.chatSessions.set(sessionId, updatedSession);
    return updatedSession;
  }

  // Document methods
  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    const document: Document = {
      id: this.currentDocumentId++,
      ...insertDocument,
      embedding: null,
      createdAt: new Date(),
    };
    this.documents.set(document.id, document);
    return document;
  }

  async getDocumentsBySessionId(sessionId: string): Promise<Document[]> {
    return Array.from(this.documents.values()).filter(doc => doc.sessionId === sessionId);
  }

  async updateDocumentEmbedding(id: number, embedding: number[]): Promise<void> {
    const document = this.documents.get(id);
    if (document) {
      document.embedding = embedding;
      this.documents.set(id, document);
    }
  }

  // Chat message methods
  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const message: ChatMessage = {
      id: this.currentMessageId++,
      ...insertMessage,
      timestamp: new Date(),
    };
    this.chatMessages.set(message.id, message);
    return message;
  }

  async getChatMessagesBySessionId(sessionId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }

  // Website content methods
  async createWebsiteContent(insertContent: InsertWebsiteContent): Promise<WebsiteContent> {
    const content: WebsiteContent = {
      id: this.currentWebsiteContentId++,
      ...insertContent,
      title: insertContent.title || null,
      embedding: null,
      createdAt: new Date(),
    };
    this.websiteContent.set(content.id, content);
    return content;
  }

  async getWebsiteContentBySessionId(sessionId: string): Promise<WebsiteContent[]> {
    return Array.from(this.websiteContent.values()).filter(content => content.sessionId === sessionId);
  }

  async updateWebsiteContentEmbedding(id: number, embedding: number[]): Promise<void> {
    const content = this.websiteContent.get(id);
    if (content) {
      content.embedding = embedding;
      this.websiteContent.set(id, content);
    }
  }
}

export const storage = new MemStorage();
