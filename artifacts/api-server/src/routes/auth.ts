import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { db } from "@workspace/db";
import { usersTable, sessionsTable, chatsTable, chatMembersTable } from "@workspace/db/schema";
import { eq, and, gt, ne } from "drizzle-orm";
import { authRateLimiter } from "../middleware/rateLimit";

const router: IRouter = Router();

const SALT_ROUNDS = 12;
const SESSION_EXPIRY_DAYS = 30;

function generateTokens() {
  const token = crypto.randomUUID();
  const refreshToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
  return { token, refreshToken, expiresAt };
}

// Register
router.post("/auth/register", authRateLimiter, async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.username, username));
    if (existing.length > 0) {
      return res.status(409).json({ error: "Username already taken" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const [user] = await db.insert(usersTable).values({
      username,
      email: email || null,
      phone: phone || null,
      passwordHash,
    }).returning();

    // Create self-chat (Saved Messages)
    const [selfChat] = await db.insert(chatsTable).values({
      name: "Избранное",
      type: "private",
      isSelfChat: true,
      createdBy: user.id,
    }).returning();

    await db.insert(chatMembersTable).values({
      chatId: selfChat.id,
      userId: user.id,
      role: "creator",
    });

    const { token, refreshToken, expiresAt } = generateTokens();

    await db.insert(sessionsTable).values({
      userId: user.id,
      token,
      refreshToken,
      deviceInfo: req.headers["user-agent"] || null,
      ipAddress: req.ip || null,
      expiresAt,
    });

    res.status(201).json({
      user: { id: user.id, username: user.username, email: user.email, phone: user.phone, avatarUrl: user.avatarUrl },
      token,
      refreshToken,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post("/auth/login", authRateLimiter, async (req, res) => {
  try {
    const { username, password, twoFACode } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password required" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, username));
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check 2FA if enabled
    if (user.twoFAEnabled && user.twoFASecret) {
      if (!twoFACode) {
        return res.status(403).json({ error: "2FA code required", requires2FA: true });
      }
      const verified = speakeasy.totp.verify({
        secret: user.twoFASecret,
        encoding: "base32",
        token: twoFACode,
        window: 2,
      });
      if (!verified) {
        return res.status(401).json({ error: "Invalid 2FA code" });
      }
    }

    const { token, refreshToken, expiresAt } = generateTokens();

    await db.insert(sessionsTable).values({
      userId: user.id,
      token,
      refreshToken,
      deviceInfo: req.headers["user-agent"] || null,
      ipAddress: req.ip || null,
      expiresAt,
    });

    res.json({
      user: { id: user.id, username: user.username, email: user.email, phone: user.phone, avatarUrl: user.avatarUrl },
      token,
      refreshToken,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Refresh token
router.post("/auth/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    const [session] = await db.select().from(sessionsTable).where(
      and(eq(sessionsTable.refreshToken, refreshToken), gt(sessionsTable.expiresAt, new Date()))
    );

    if (!session) {
      return res.status(401).json({ error: "Invalid refresh token" });
    }

    const { token, refreshToken: newRefreshToken, expiresAt } = generateTokens();

    await db.update(sessionsTable)
      .set({ token, refreshToken: newRefreshToken, expiresAt })
      .where(eq(sessionsTable.id, session.id));

    res.json({ token, refreshToken: newRefreshToken });
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

// Logout all devices
router.post("/auth/logout-all", async (req, res) => {
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

    await db.delete(sessionsTable).where(eq(sessionsTable.userId, session.userId));

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

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      isOnline: user.isOnline,
      lastSeenAt: user.lastSeenAt,
      twoFAEnabled: user.twoFAEnabled,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// List devices / sessions
router.get("/auth/devices", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [currentSession] = await db.select().from(sessionsTable).where(
      and(eq(sessionsTable.token, token), gt(sessionsTable.expiresAt, new Date()))
    );

    if (!currentSession) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const sessions = await db.select({
      id: sessionsTable.id,
      deviceInfo: sessionsTable.deviceInfo,
      ipAddress: sessionsTable.ipAddress,
      createdAt: sessionsTable.createdAt,
      expiresAt: sessionsTable.expiresAt,
    }).from(sessionsTable).where(
      and(eq(sessionsTable.userId, currentSession.userId), gt(sessionsTable.expiresAt, new Date()))
    );

    res.json(sessions.map(s => ({ ...s, isCurrent: s.id === currentSession.id })));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Revoke a device/session
router.delete("/auth/devices/:id/revoke", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const [currentSession] = await db.select().from(sessionsTable).where(
      and(eq(sessionsTable.token, token), gt(sessionsTable.expiresAt, new Date()))
    );

    if (!currentSession) {
      return res.status(401).json({ error: "Invalid session" });
    }

    const sessionId = Number(req.params.id);

    // Ensure the session belongs to current user
    const [targetSession] = await db.select().from(sessionsTable).where(
      and(eq(sessionsTable.id, sessionId), eq(sessionsTable.userId, currentSession.userId))
    );

    if (!targetSession) {
      return res.status(404).json({ error: "Session not found" });
    }

    await db.delete(sessionsTable).where(eq(sessionsTable.id, sessionId));

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Setup 2FA
router.post("/auth/2fa/setup", async (req, res) => {
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

    if (user.twoFAEnabled) {
      return res.status(400).json({ error: "2FA is already enabled" });
    }

    const secret = speakeasy.generateSecret({
      name: `M4Chat:${user.username}`,
      length: 32,
    });

    // Save secret temporarily (not enabled until verified)
    await db.update(usersTable)
      .set({ twoFASecret: secret.base32 })
      .where(eq(usersTable.id, user.id));

    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || "");

    res.json({
      secret: secret.base32,
      qrCodeUrl,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Verify and enable 2FA
router.post("/auth/2fa/verify", async (req, res) => {
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

    if (!user.twoFASecret) {
      return res.status(400).json({ error: "2FA not set up" });
    }

    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Code required" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret,
      encoding: "base32",
      token: code,
      window: 2,
    });

    if (!verified) {
      return res.status(401).json({ error: "Invalid code" });
    }

    await db.update(usersTable)
      .set({ twoFAEnabled: true })
      .where(eq(usersTable.id, user.id));

    res.json({ verified: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Disable 2FA
router.post("/auth/2fa/disable", async (req, res) => {
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

    if (!user.twoFAEnabled) {
      return res.status(400).json({ error: "2FA is not enabled" });
    }

    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: "Code required" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFASecret || "",
      encoding: "base32",
      token: code,
      window: 2,
    });

    if (!verified) {
      return res.status(401).json({ error: "Invalid code" });
    }

    await db.update(usersTable)
      .set({ twoFAEnabled: false, twoFASecret: null })
      .where(eq(usersTable.id, user.id));

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
