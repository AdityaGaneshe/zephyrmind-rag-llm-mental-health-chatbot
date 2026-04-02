import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStressEntrySchema, insertChatMessageSchema } from "@shared/schema";
import { generateCounselorResponse } from "./counselor";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/stress-entries", async (req, res) => {
    try {
      const entries = await storage.getStressEntries();
      res.json(entries);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch stress entries" });
    }
  });

  app.post("/api/stress-entries", async (req, res) => {
    try {
      const parsed = insertStressEntrySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Invalid data", errors: parsed.error.flatten() });
      }
      const entry = await storage.createStressEntry(parsed.data);
      res.status(201).json(entry);
    } catch (e) {
      res.status(500).json({ message: "Failed to create stress entry" });
    }
  });

  app.delete("/api/stress-entries/:id", async (req, res) => {
    try {
      await storage.deleteStressEntry(req.params.id);
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ message: "Failed to delete stress entry" });
    }
  });

  app.get("/api/chat/:sessionId", async (req, res) => {
    try {
      const messages = await storage.getChatMessages(req.params.sessionId);
      res.json(messages);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/:sessionId", async (req, res) => {
    try {
      const { content } = req.body;
      if (!content || typeof content !== "string") {
        return res.status(400).json({ message: "Content is required" });
      }

      const userMsg = await storage.createChatMessage({
        sessionId: req.params.sessionId,
        role: "user",
        content: content.trim(),
      });

      const history = await storage.getChatMessages(req.params.sessionId);
      const { response, analysis } = await generateCounselorResponse(content, history, req.params.sessionId);

      const assistantMsg = await storage.createChatMessage({
        sessionId: req.params.sessionId,
        role: "assistant",
        content: response,
      });

      res.json({ userMessage: userMsg, assistantMessage: assistantMsg, analysis });
    } catch (e) {
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  app.delete("/api/chat/:sessionId", async (req, res) => {
    try {
      await storage.clearChatSession(req.params.sessionId);
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ message: "Failed to clear chat" });
    }
  });

  app.get("/api/tasks", async (req, res) => {
    try {
      const level = req.query.level ? parseInt(req.query.level as string) : undefined;
      const tasks = level !== undefined
        ? await storage.getTasksByStressLevel(level)
        : await storage.getTasks();
      res.json(tasks);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.get("/api/task-completions", async (req, res) => {
    try {
      const completions = await storage.getTaskCompletions();
      res.json(completions);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch completions" });
    }
  });

  app.post("/api/task-completions", async (req, res) => {
    try {
      const { taskId } = req.body;
      if (!taskId) return res.status(400).json({ message: "taskId is required" });
      const completion = await storage.completeTask(taskId);
      res.status(201).json(completion);
    } catch (e) {
      res.status(500).json({ message: "Failed to complete task" });
    }
  });

  app.delete("/api/task-completions/:taskId", async (req, res) => {
    try {
      await storage.uncompleteTask(req.params.taskId);
      res.status(204).send();
    } catch (e) {
      res.status(500).json({ message: "Failed to uncomplete task" });
    }
  });

  app.get("/api/videos", async (req, res) => {
    try {
      const level = req.query.level ? parseInt(req.query.level as string) : undefined;
      const videos = level !== undefined
        ? await storage.getVideosByStressLevel(level)
        : await storage.getVideos();
      res.json(videos);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch videos" });
    }
  });

  return httpServer;
}
