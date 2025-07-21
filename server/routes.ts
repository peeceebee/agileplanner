import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSprintItemSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all sprint items
  app.get("/api/sprint-items", async (req, res) => {
    try {
      const items = await storage.getSprintItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sprint items" });
    }
  });

  // Get single sprint item
  app.get("/api/sprint-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getSprintItem(id);
      if (!item) {
        return res.status(404).json({ message: "Sprint item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch sprint item" });
    }
  });

  // Create new sprint item
  app.post("/api/sprint-items", async (req, res) => {
    try {
      console.log("Received request body:", JSON.stringify(req.body, null, 2));
      const validatedData = insertSprintItemSchema.parse(req.body);
      const item = await storage.createSprintItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.log("Server error:", error);
      res.status(500).json({ message: "Failed to create sprint item" });
    }
  });

  // Update sprint item
  app.put("/api/sprint-items/:id", async (req, res) => {
    try {
      console.log("Update request body:", JSON.stringify(req.body, null, 2));
      const id = parseInt(req.params.id);
      const validatedData = insertSprintItemSchema.partial().parse(req.body);
      const item = await storage.updateSprintItem(id, validatedData);
      if (!item) {
        return res.status(404).json({ message: "Sprint item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.log("Update validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.log("Update server error:", error);
      res.status(500).json({ message: "Failed to update sprint item" });
    }
  });

  // Delete sprint item
  app.delete("/api/sprint-items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSprintItem(id);
      if (!success) {
        return res.status(404).json({ message: "Sprint item not found" });
      }
      res.json({ message: "Sprint item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete sprint item" });
    }
  });

  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
