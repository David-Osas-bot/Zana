import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./zana";

export const sessionsTable = pgTable("zana_sessions", {
    id: text("id").primaryKey(),
    userId: text("user_id")
        .notNull()
        .references(() => usersTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});