import { Router, type IRouter, type Response } from "express";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, usersTable, sessionsTable, projectMembersTable } from "@workspace/db";
import { SESSION_COOKIE } from "../middlewares/requireAuth";

const router: IRouter = Router();

const SignupBody = z.object({
    name: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(8).max(200),
});

const LoginBody = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30;

const initialsFor = (value: string) =>
    value.split(/[.\s_-]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "NA";

async function createSession(userId: string) {
    const id = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
    await db.insert(sessionsTable).values({ id, userId, expiresAt });
    return { id, expiresAt };
}

function setSessionCookie(res: Response, token: string, expiresAt: Date) {
    res.cookie(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: expiresAt,
        path: "/",
    });
}

router.post("/signup", async (req, res): Promise<void> => {
    const parsed = SignupBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Please provide a valid name, email, and a password of at least 8 characters." });
        return;
    }
    const email = parsed.data.email.trim().toLowerCase();
    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing) {
        res.status(409).json({ error: "An account with this email already exists." });
        return;
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const id = randomUUID();
    const name = parsed.data.name.trim();
    await db.insert(usersTable).values({ id, name, email, initials: initialsFor(name), passwordHash });

    // Auto-link any pending invites sent to this email
    await db
        .update(projectMembersTable)
        .set({ userId: id, status: "active", name, initials: initialsFor(name) })
        .where(eq(projectMembersTable.email, email));

    const session = await createSession(id);
    setSessionCookie(res, session.id, session.expiresAt);
    res.status(201).json({ id, name, email });
});

router.post("/login", async (req, res): Promise<void> => {
    const parsed = LoginBody.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "Invalid email or password." });
        return;
    }
    const email = parsed.data.email.trim().toLowerCase();
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) {
        res.status(401).json({ error: "Invalid email or password." });
        return;
    }
    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) {
        res.status(401).json({ error: "Invalid email or password." });
        return;
    }
    const session = await createSession(user.id);
    setSessionCookie(res, session.id, session.expiresAt);
    res.json({ id: user.id, name: user.name, email: user.email });
});

router.post("/logout", async (req, res): Promise<void> => {
    const token = req.cookies?.[SESSION_COOKIE];
    if (token) {
        await db.delete(sessionsTable).where(eq(sessionsTable.id, token));
    }
    res.clearCookie(SESSION_COOKIE, { path: "/" });
    res.sendStatus(204);
});

export default router;