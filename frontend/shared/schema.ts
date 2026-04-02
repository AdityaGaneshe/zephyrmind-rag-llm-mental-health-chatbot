import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const stressEntries = pgTable("stress_entries", {
  id: varchar("id").primaryKey(),
  date: text("date").notNull(),
  level: integer("level").notNull(),
  mood: text("mood").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  minStressLevel: integer("min_stress_level").notNull(),
  maxStressLevel: integer("max_stress_level").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  icon: text("icon").notNull(),
});

export const userTaskCompletions = pgTable("user_task_completions", {
  id: varchar("id").primaryKey(),
  taskId: text("task_id").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const videos = pgTable("videos", {
  id: varchar("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  youtubeId: text("youtube_id").notNull(),
  thumbnail: text("thumbnail").notNull(),
  category: text("category").notNull(),
  minStressLevel: integer("min_stress_level").notNull(),
  maxStressLevel: integer("max_stress_level").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
});

export const insertStressEntrySchema = createInsertSchema(stressEntries).omit({ id: true, createdAt: true });
export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({ id: true, timestamp: true });
export const insertTaskCompletionSchema = createInsertSchema(userTaskCompletions).omit({ id: true, completedAt: true });

export type InsertUser = { username: string; password: string };
export type User = typeof users.$inferSelect;
export type StressEntry = typeof stressEntries.$inferSelect;
export type InsertStressEntry = z.infer<typeof insertStressEntrySchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type Task = typeof tasks.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type UserTaskCompletion = typeof userTaskCompletions.$inferSelect;
