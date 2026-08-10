import type { Request, Response, NextFunction } from "express";
import { and, eq, gt } from "drizzle-orm";
import { db, sessionsTable } from "@workspace/db";

export const SESSION_COOKIE = "zana_session";

declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.cookies?.[SESSION_COOKIE];
    if (!token) {
        res.status(401).json({ error: "Not authenticated" });
        return;
    }
    const [session] = await db
        .select()
        .from(sessionsTable)
        .where(and(eq(sessionsTable.id, token), gt(sessionsTable.expiresAt, new Date())));
    if (!session) {
        res.status(401).json({ error: "Session expired" });
        return;
    }
    req.userId = session.userId;
    next();
}