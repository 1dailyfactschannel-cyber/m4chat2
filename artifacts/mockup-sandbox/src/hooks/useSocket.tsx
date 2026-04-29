import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { api } from '../lib/api';

const SOCKET_PATH = '/socket';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = api.getToken();
    if (!token) return;

    const socket = io(import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:8080'), {
      path: SOCKET_PATH,
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected');
    });

    socket.on('disconnect', () => {
      console.log('[Socket] Disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinChat = useCallback((chatId: number) => {
    socketRef.current?.emit('chat:join', chatId);
  }, []);

  const leaveChat = useCallback((chatId: number) => {
    socketRef.current?.emit('chat:leave', chatId);
  }, []);

  const startTyping = useCallback((chatId: number) => {
    socketRef.current?.emit('typing:start', chatId);
  }, []);

  const stopTyping = useCallback((chatId: number) => {
    socketRef.current?.emit('typing:stop', chatId);
  }, []);

  const onMessageNew = useCallback((handler: (msg: any) => void) => {
    socketRef.current?.on('message:new', handler);
    return () => { socketRef.current?.off('message:new', handler); };
  }, []);

  const onMessageEdited = useCallback((handler: (msg: any) => void) => {
    socketRef.current?.on('message:edited', handler);
    return () => { socketRef.current?.off('message:edited', handler); };
  }, []);

  const onMessageDeleted = useCallback((handler: (data: { id: number }) => void) => {
    socketRef.current?.on('message:deleted', handler);
    return () => { socketRef.current?.off('message:deleted', handler); };
  }, []);

  const onMessageReactions = useCallback((handler: (data: { messageId: number; reactions: any[] }) => void) => {
    socketRef.current?.on('message:reactions', handler);
    return () => { socketRef.current?.off('message:reactions', handler); };
  }, []);

  const onTypingStart = useCallback((handler: (data: { chatId: number; userId: number }) => void) => {
    socketRef.current?.on('typing:start', handler);
    return () => { socketRef.current?.off('typing:start', handler); };
  }, []);

  const onTypingStop = useCallback((handler: (data: { chatId: number; userId: number }) => void) => {
    socketRef.current?.on('typing:stop', handler);
    return () => { socketRef.current?.off('typing:stop', handler); };
  }, []);

  const onUserOnline = useCallback((handler: (data: { userId: number }) => void) => {
    socketRef.current?.on('user:online', handler);
    return () => { socketRef.current?.off('user:online', handler); };
  }, []);

  const onUserOffline = useCallback((handler: (data: { userId: number; lastSeenAt: string }) => void) => {
    socketRef.current?.on('user:offline', handler);
    return () => { socketRef.current?.off('user:offline', handler); };
  }, []);

  const onMention = useCallback((handler: (data: { messageId: number; chatId: number; senderName: string; text: string }) => void) => {
    socketRef.current?.on('mention', handler);
    return () => { socketRef.current?.off('mention', handler); };
  }, []);

  return {
    socket: socketRef.current,
    joinChat,
    leaveChat,
    startTyping,
    stopTyping,
    onMessageNew,
    onMessageEdited,
    onMessageDeleted,
    onMessageReactions,
    onTypingStart,
    onTypingStop,
    onUserOnline,
    onUserOffline,
    onMention,
  };
}
