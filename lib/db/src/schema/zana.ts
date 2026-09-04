import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const usersTable = pgTable("zana_users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  initials: text("initials").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessionsTable = pgTable("zana_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectsTable = pgTable("zana_projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  color: text("color").notNull().default("ink"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectMembersTable = pgTable("zana_project_members", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => usersTable.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  name: text("name"),
  initials: text("initials"),
  role: text("role").notNull().default("member"),
  status: text("status").notNull().default("invited"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasksTable = pgTable("zana_tasks", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  status: text("status").notNull().default("not_done"),
  assigneeId: text("assignee_id"),
  createdBy: text("created_by"),
  position: integer("position").notNull().default(0),
  dueDate: timestamp("due_date"),                    // ← NEW
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// NEW TABLE — one row per reminder offset a task creator adds
export const taskRemindersTable = pgTable("zana_task_reminders", {
  id: text("id").primaryKey(),
  taskId: text("task_id").notNull().references(() => tasksTable.id, { onDelete: "cascade" }),
  offsetMinutes: integer("offset_minutes").notNull(),   // e.g. 5, 10, 47 — whatever the user typed
  triggerAt: timestamp("trigger_at").notNull(),         // computed: dueDate - offsetMinutes
  firedAt: timestamp("fired_at"),
  ackedAt: timestamp("acked_at"),                       // null until sent; prevents double-send
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const activityTable = pgTable("zana_activity", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  time: text("time").notNull().default("Just now"),
  kind: text("kind").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});