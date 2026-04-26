import { Router, type IRouter } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { usersTable, sessionsTable } from "@workspace/db/schema";
import { eq, and, gt } from "drizzle-orm";

const router: IRouter = Router();

// Register
router.post("/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.username, username));
    if (existing.length > 0) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");

    const [user] = await db.insert(usersTable).values({
      username,
      email: email || null,
      passwordHash,
    }).returning();

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(sessionsTable).values({
      userId: user.id,
      token,
      expiresAt,
    });

    res.status(201).json({
      user: { id: user.id, username: user.username, email: user.email },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const passwordHash = crypto.createHash("sha256").update(password).digest("hex");
    if (user.passwordHash !== passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.insert(sessionsTable).values({
      userId: user.id,
      token,
      expiresAt,
    });

    res.json({
      user: { id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl },
      token,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post("/auth/logout", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) {
      await db.delete(sessionsTable).where(eq(sessionsTable.token, token));
    }
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
router.get("/auth/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [session] = await db.select().from(sessionsTable).where(
      and(eq(sessionsTable.token, token), gt(sessionsTable.expiresAt, new Date()))
    );

    if (!session) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, session.userId));
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json({ id: user.id, username: user.username, email: user.email, avatarUrl: user.avatarUrl });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
