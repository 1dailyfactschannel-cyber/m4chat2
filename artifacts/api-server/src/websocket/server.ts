import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { db } from "@workspace/db";
import { sessionsTable, usersTable } from "@workspace/db/schema";
import { eq, and, gt } from "drizzle-orm";

export type TypedSocket = Socket;

export function createWebSocketServer(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN ?? "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: "/socket",
    transports: ["websocket", "polling"],
  });

  // Auth middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token =
        socket.handshake.auth.token ||
        socket.handshake.headers.authorization?.replace("Bearer ", "");

      if (!token) {
        return next(new Error("Authentication error: token required"));
      }

      const [session] = await db
        .select()
        .from(sessionsTable)
        .where(
          and(
            eq(sessionsTable.token, token),
            gt(sessionsTable.expiresAt, new Date()),
          ),
        );

      if (!session) {
        return next(new Error("Authentication error: invalid session"));
      }

      // Attach user info to socket
      socket.data.userId = session.userId;
      socket.data.sessionId = session.id;

      // Update online status
      await db
        .update(usersTable)
        .set({ isOnline: true, lastSeenAt: new Date() })
        .where(eq(usersTable.id, session.userId));

      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    const userId = socket.data.userId as number;

    console.log(`[WS] User ${userId} connected: ${socket.id}`);

    // Join personal room
    socket.join(`user:${userId}`);

    // Listen for chat room joins
    socket.on("chat:join", (chatId: number) => {
      socket.join(`chat:${chatId}`);
      console.log(`[WS] User ${userId} joined chat:${chatId}`);
    });

    socket.on("chat:leave", (chatId: number) => {
      socket.leave(`chat:${chatId}`);
      console.log(`[WS] User ${userId} left chat:${chatId}`);
    });

    // Typing indicators
    socket.on("typing:start", (chatId: number) => {
      socket.to(`chat:${chatId}`).emit("typing:start", { chatId, userId });
    });

    socket.on("typing:stop", (chatId: number) => {
      socket.to(`chat:${chatId}`).emit("typing:stop", { chatId, userId });
    });

    // WebRTC signaling relay
    socket.on("webrtc:offer", ({ chatId, offer, type }: { chatId: number; offer: any; type: string }) => {
      socket.to(`chat:${chatId}`).emit("webrtc:offer", { chatId, offer, type, senderId: userId });
    });

    socket.on("webrtc:answer", ({ chatId, answer }: { chatId: number; answer: any }) => {
      socket.to(`chat:${chatId}`).emit("webrtc:answer", { chatId, answer, senderId: userId });
    });

    socket.on("webrtc:ice-candidate", ({ chatId, candidate }: { chatId: number; candidate: any }) => {
      socket.to(`chat:${chatId}`).emit("webrtc:ice-candidate", { chatId, candidate, senderId: userId });
    });

    socket.on("webrtc:end", ({ chatId }: { chatId: number }) => {
      socket.to(`chat:${chatId}`).emit("webrtc:end", { chatId, senderId: userId });
    });

    // Online status broadcast
    socket.broadcast.emit("user:online", { userId });

    // Disconnect handling
    socket.on("disconnect", async () => {
      console.log(`[WS] User ${userId} disconnected: ${socket.id}`);

      await db
        .update(usersTable)
        .set({ isOnline: false, lastSeenAt: new Date() })
        .where(eq(usersTable.id, userId));

      socket.broadcast.emit("user:offline", { userId, lastSeenAt: new Date() });
    });
  });

  return io;
}

export type WebSocketServer = ReturnType<typeof createWebSocketServer>;
