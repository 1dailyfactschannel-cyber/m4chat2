import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, sessionsTable } from "@workspace/db/schema";
import { eq, and, sql, ilike } from "drizzle-orm";

const router: IRouter = Router();

async function requireAuth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(
      and(
        eq(sessionsTable.token, token),
        sql`${sessionsTable.expiresAt} > NOW()`
      )
    );

  if (!session) return res.status(401).json({ error: "Invalid session" });
  req.userId = session.userId;
  next();
}

// Search users
router.get("/users/search", requireAuth, async (req: any, res) => {
  try {
    const { q } = req.query;
    if (!q || String(q).length < 2) {
      return res.json([]);
    }

    const users = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        avatarUrl: usersTable.avatarUrl,
        bio: usersTable.bio,
        isOnline: usersTable.isOnline,
        lastSeenAt: usersTable.lastSeenAt,
      })
      .from(usersTable)
      .where(ilike(usersTable.username, `%${q}%`))
      .limit(20);

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID
router.get("/users/:id", requireAuth, async (req: any, res) => {
  try {
    const { id } = req.params;

    const [user] = await db
      .select({
        id: usersTable.id,
        username: usersTable.username,
        avatarUrl: usersTable.avatarUrl,
        bio: usersTable.bio,
        isOnline: usersTable.isOnline,
        lastSeenAt: usersTable.lastSeenAt,
      })
      .from(usersTable)
      .where(eq(usersTable.id, Number(id)));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update own profile
router.put("/users/me", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const { email, phone, bio, avatarUrl } = req.body;

    const [updated] = await db
      .update(usersTable)
      .set({
        email: email || undefined,
        phone: phone || undefined,
        bio: bio || undefined,
        avatarUrl: avatarUrl || undefined,
      })
      .where(eq(usersTable.id, userId))
      .returning();

    res.json({
      id: updated.id,
      username: updated.username,
      email: updated.email,
      phone: updated.phone,
      avatarUrl: updated.avatarUrl,
      bio: updated.bio,
      isOnline: updated.isOnline,
      lastSeenAt: updated.lastSeenAt,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
