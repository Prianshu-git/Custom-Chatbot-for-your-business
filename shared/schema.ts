import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  apiKey: text("api_key").notNull(),
  websiteUrl: text("website_url"),
  documentIds: text("document_ids").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  filename: text("filename").notNull(),
  content: text("content").notNull(),
  embedding: jsonb("embedding"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const websiteContent = pgTable("website_content", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  url: text("url").notNull(),
  title: text("title"),
  content: text("content").notNull(),
  embedding: jsonb("embedding"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  sessionId: true,
  apiKey: true,
  websiteUrl: true,
  documentIds: true,
});

export const insertDocumentSchema = createInsertSchema(documents).pick({
  sessionId: true,
  filename: true,
  content: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).pick({
  sessionId: true,
  role: true,
  content: true,
});

export const insertWebsiteContentSchema = createInsertSchema(websiteContent).pick({
  sessionId: true,
  url: true,
  title: true,
  content: true,
});

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type InsertWebsiteContent = z.infer<typeof insertWebsiteContentSchema>;

export type ChatSession = typeof chatSessions.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type WebsiteContent = typeof websiteContent.$inferSelect;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
