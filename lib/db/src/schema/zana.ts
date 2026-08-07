import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("zana_users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  initials: text("initials").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projectsTable = pgTable("zana_projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  color: text("color").notNull().default("ink"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projectMembersTable = pgTable("zana_project_members", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  userId: text("user_id"),
  email: text("email").notNull(),
  name: text("name").notNull(),
  initials: text("initials").notNull(),
  role: text("role").notNull().default("member"),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const tasksTable = pgTable("zana_tasks", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("not_done"),
  assigneeId: text("assignee_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  position: integer("position").notNull().default(0),
});

export const activityTable = pgTable("zana_activity", {
  id: text("id").primaryKey(),
  text: text("text").notNull(),
  time: text("time").notNull(),
  kind: text("kind").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable);
export const insertProjectSchema = createInsertSchema(projectsTable);
export const insertProjectMemberSchema = createInsertSchema(projectMembersTable);
export const insertTaskSchema = createInsertSchema(tasksTable);
export const insertActivitySchema = createInsertSchema(activityTable);

export type User = z.infer<typeof insertUserSchema>;
export type Project = z.infer<typeof insertProjectSchema>;
export type ProjectMember = z.infer<typeof insertProjectMemberSchema>;
export type Task = z.infer<typeof insertTaskSchema>;
export type Activity = z.infer<typeof insertActivitySchema>;