import { Router } from "express";
import { db } from "@workspace/db";
import {
  signalIdentityTable,
  signalSignedPreKeyTable,
  signalPreKeyTable,
  signalSessionTable,
  sessionsTable,
} from "@workspace/db/schema";
import { eq, and, sql } from "drizzle-orm";

const router = Router();

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

// Register Signal keys (identity, signed pre-key, one-time pre-keys)
router.post("/keys/register", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const {
      registrationId,
      identityPublicKey,
      signedPreKey,
      oneTimePreKeys,
    } = req.body;

    if (!registrationId || !identityPublicKey || !signedPreKey) {
      return res.status(400).json({ error: "Missing required key fields" });
    }

    // Upsert identity key
    await db
      .insert(signalIdentityTable)
      .values({
        userId,
        registrationId,
        publicKey: identityPublicKey,
        privateKey: req.body.identityPrivateKey || "", // client should NOT send this to server in real impl
      })
      .onConflictDoUpdate({
        target: signalIdentityTable.userId,
        set: {
          registrationId,
          publicKey: identityPublicKey,
          updatedAt: new Date(),
        },
      });

    // Upsert signed pre-key
    await db
      .insert(signalSignedPreKeyTable)
      .values({
        userId,
        keyId: signedPreKey.keyId,
        publicKey: signedPreKey.publicKey,
        privateKey: signedPreKey.privateKey || "",
        signature: signedPreKey.signature,
      })
      .onConflictDoUpdate({
        target: [signalSignedPreKeyTable.userId, signalSignedPreKeyTable.keyId],
        set: {
          publicKey: signedPreKey.publicKey,
          signature: signedPreKey.signature,
        },
      });

    // Insert one-time pre-keys
    if (Array.isArray(oneTimePreKeys) && oneTimePreKeys.length > 0) {
      await db.insert(signalPreKeyTable).values(
        oneTimePreKeys.map((pk: any) => ({
          userId,
          keyId: pk.keyId,
          publicKey: pk.publicKey,
          privateKey: pk.privateKey || "",
          used: false,
        }))
      );
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error("[Signal] Register keys error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get key bundle for a user (X3DH initial handshake)
router.get("/keys/bundle/:userId", requireAuth, async (req: any, res) => {
  try {
    const targetUserId = parseInt(req.params.userId, 10);

    const [identity] = await db
      .select()
      .from(signalIdentityTable)
      .where(eq(signalIdentityTable.userId, targetUserId));

    if (!identity) {
      return res.status(404).json({ error: "User has no Signal keys" });
    }

    const [signedPreKey] = await db
      .select()
      .from(signalSignedPreKeyTable)
      .where(eq(signalSignedPreKeyTable.userId, targetUserId))
      .orderBy(signalSignedPreKeyTable.keyId);

    if (!signedPreKey) {
      return res.status(404).json({ error: "User has no signed pre-key" });
    }

    // Get one unused one-time pre-key
    const [preKey] = await db
      .select()
      .from(signalPreKeyTable)
      .where(and(eq(signalPreKeyTable.userId, targetUserId), eq(signalPreKeyTable.used, false)))
      .limit(1);

    const bundle: any = {
      registrationId: identity.registrationId,
      identityKey: identity.publicKey,
      signedPreKey: {
        keyId: signedPreKey.keyId,
        publicKey: signedPreKey.publicKey,
        signature: signedPreKey.signature,
      },
    };

    if (preKey) {
      bundle.preKey = {
        keyId: preKey.keyId,
        publicKey: preKey.publicKey,
      };
      // Mark as used
      await db
        .update(signalPreKeyTable)
        .set({ used: true })
        .where(eq(signalPreKeyTable.id, preKey.id));
    }

    res.json(bundle);
  } catch (error: any) {
    console.error("[Signal] Get bundle error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get current user's keys (for backup / re-auth)
router.get("/keys/me", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const [identity] = await db
      .select()
      .from(signalIdentityTable)
      .where(eq(signalIdentityTable.userId, userId));

    const signedPreKeys = await db
      .select()
      .from(signalSignedPreKeyTable)
      .where(eq(signalSignedPreKeyTable.userId, userId));

    const preKeys = await db
      .select()
      .from(signalPreKeyTable)
      .where(and(eq(signalPreKeyTable.userId, userId), eq(signalPreKeyTable.used, false)));

    res.json({
      identity,
      signedPreKeys,
      remainingPreKeys: preKeys.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Store a session (Double Ratchet state) — client can sync state across devices
router.post("/sessions", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const {
      chatId,
      remoteUserId,
      remoteRegistrationId,
      remoteIdentityPublic,
      rootKey,
      sendingChainKey,
      receivingChainKey,
      sendingMessageNumber,
      receivingMessageNumber,
      skippedMessageKeys,
    } = req.body;

    await db
      .insert(signalSessionTable)
      .values({
        userId,
        chatId,
        remoteUserId,
        remoteRegistrationId,
        remoteIdentityPublic,
        rootKey,
        sendingChainKey,
        receivingChainKey,
        sendingMessageNumber,
        receivingMessageNumber,
        skippedMessageKeys: JSON.stringify(skippedMessageKeys || {}),
      })
      .onConflictDoUpdate({
        target: [signalSessionTable.userId, signalSessionTable.chatId],
        set: {
          remoteRegistrationId,
          remoteIdentityPublic,
          rootKey,
          sendingChainKey,
          receivingChainKey,
          sendingMessageNumber,
          receivingMessageNumber,
          skippedMessageKeys: JSON.stringify(skippedMessageKeys || {}),
          updatedAt: new Date(),
        },
      });

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get session for a chat
router.get("/sessions/:chatId", requireAuth, async (req: any, res) => {
  try {
    const userId = req.userId;
    const chatId = parseInt(req.params.chatId, 10);

    const [session] = await db
      .select()
      .from(signalSessionTable)
      .where(and(eq(signalSessionTable.userId, userId), eq(signalSessionTable.chatId, chatId)));

    if (!session) {
      return res.status(404).json({ error: "No session found" });
    }

    res.json({
      ...session,
      skippedMessageKeys: JSON.parse(session.skippedMessageKeys || "{}"),
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
