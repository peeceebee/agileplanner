import { pgTable, text, serial, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const statusEnum = pgEnum("status", ["new", "in-progress", "complete", "deleted"]);
export const refinementStatusEnum = pgEnum("refinement_status", ["none", "drafting", "designing", "refined"]);

export const sprintItems = pgTable("sprint_items", {
  id: serial("id").primaryKey(),
  itemId: text("item_id").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  assignedUser: text("assigned_user"),
  status: statusEnum("status").notNull().default("new"),
  refinementStatus: refinementStatusEnum("refinement_status").notNull().default("none"),
  sprintNumber: integer("sprint_number"),
  hoursOfEffort: integer("hours_of_effort"),
  points: integer("points"),
  createDate: timestamp("create_date").notNull().defaultNow(),
  startDate: timestamp("start_date"),
  plannedCompleteDate: timestamp("planned_complete_date"),
  actualCompleteDate: timestamp("actual_complete_date"),
  readyDate: timestamp("ready_date"),
  doneDate: timestamp("done_date"),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
});

export const insertSprintItemSchema = createInsertSchema(sprintItems).omit({
  id: true,
  itemId: true,
  createDate: true,
}).extend({
  title: z.string().min(1, "Title is required"),
  hoursOfEffort: z.number().min(0).optional(),
  points: z.number().min(0).optional(),
  sprintNumber: z.number().min(1).optional(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export type InsertSprintItem = z.infer<typeof insertSprintItemSchema>;
export type SprintItem = typeof sprintItems.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
