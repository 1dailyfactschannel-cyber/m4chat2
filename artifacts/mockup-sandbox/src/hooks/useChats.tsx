import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useSocket } from './useSocket';
import { cacheDB } from '../lib/cache';
import type { MessageEntity } from '../types/entities';

export type ChatMessage = {
  id: number;
  chatId: number;
  senderId: number;
  senderName?: string;
  senderAvatar?: string;
  content: string;
  entities?: MessageEntity[] | null;
  encryptedPayload?: string | null;
  messageType: string;
  mediaUrl?: string;
  replyTo?: number;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  reactions?: { emoji: string; count: number; mine: boolean }[];
};

export type ChatItem = {
  id: number;
  name: string;
  type: string;
  photo?: string;
  isArchived?: boolean;
  createdAt: string;
  role?: string;
  pinnedAt?: string | null;
  archivedAt?: string | null;
  isSelfChat?: boolean;
  isSecret?: boolean;
  autoDeleteTimer?: number | null;
  lastMessage?: {
    id: number;
    content: string;
    messageType: string;
    senderId: number;
    senderName: string;
    createdAt: string;
  };
  unreadCount: number;
};

export type ChatFolder = {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  includeTypes?: string;
  excludeMuted?: boolean;
  sortOrder?: number;
  chatCount?: number;
};

export function useChats() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [folders, setFolders] = useState<ChatFolder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    try {
      const [data, folderData] = await Promise.all([
        api.getChats(),
        api.getFolders().catch(() => []),
      ]);
      setChats(data);
      setFolders(folderData);
      await cacheDB.saveChats(data);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
      // Fallback to cache on network error
      const cached = await cacheDB.getChats();
      if (cached.length > 0) setChats(cached);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await cacheDB.open();
      if (!mounted) return;
      const cached = await cacheDB.getChats();
      if (cached.length > 0) setChats(cached);
      setLoading(false);
      await fetchChats();
    })();
    const interval = setInterval(fetchChats, 10000);
    return () => { mounted = false; clearInterval(interval); };
  }, [fetchChats]);

  const createChat = async (name: string, type = 'private', participantIds: number[] = []) => {
    const chat = await api.createChat({ name, type, participantIds });
    await fetchChats();
    return chat;
  };

  return { chats, folders, loading, createChat, refresh: fetchChats };
}

export function useMessages(chatId: number | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const socket = useSocket();

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);
    try {
      const data = await api.getMessages(chatId);
      setMessages(data);
      await cacheDB.saveMessages(chatId, data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      const cached = await cacheDB.getMessages(chatId);
      if (cached.length > 0) setMessages(cached);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await cacheDB.open();
      if (!mounted || !chatId) return;
      const cached = await cacheDB.getMessages(chatId);
      if (cached.length > 0) setMessages(cached);
      await fetchMessages();
    })();
    if (!chatId) return;

    socket.joinChat(chatId);

    const unsubNew = socket.onMessageNew((msg) => {
      if (msg.chatId === chatId) {
        setMessages((prev) => {
          const next = [...prev, msg];
          cacheDB.saveMessages(chatId, next).catch(() => {});
          return next;
        });
      }
    });

    const unsubEdited = socket.onMessageEdited((msg) => {
      setMessages((prev) => {
        const next = prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m));
        if (chatId) cacheDB.saveMessages(chatId, next).catch(() => {});
        return next;
      });
    });

    const unsubDeleted = socket.onMessageDeleted(({ id }) => {
      setMessages((prev) => prev.filter((m) => m.id !== id));
    });

    const unsubReactions = socket.onMessageReactions(({ messageId, reactions }) => {
      setMessages((prev) => {
        const next = prev.map((m) => (m.id === messageId ? { ...m, reactions } : m));
        if (chatId) cacheDB.saveMessages(chatId, next).catch(() => {});
        return next;
      });
    });

    const unsubTypingStart = socket.onTypingStart(({ chatId: cid, userId }) => {
      if (cid === chatId) {
        setTypingUsers((prev) => new Set(prev).add(userId));
      }
    });

    const unsubTypingStop = socket.onTypingStop(({ chatId: cid, userId }) => {
      if (cid === chatId) {
        setTypingUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      }
    });

    const interval = setInterval(fetchMessages, 10000);

    return () => {
      socket.leaveChat(chatId);
      unsubNew();
      unsubEdited();
      unsubDeleted();
      unsubReactions();
      unsubTypingStart();
      unsubTypingStop();
      clearInterval(interval);
    };
  }, [chatId, fetchMessages, socket]);

  const sendMessage = async (content: string, messageType = 'text', replyTo?: number, mediaUrl?: string, isSilent?: boolean, encryptedPayload?: string) => {
    if (!chatId) return null;
    const message = await api.sendMessage(chatId, content, messageType, replyTo, mediaUrl, isSilent, encryptedPayload);
    setMessages((prev) => [...prev, message]);
    return message;
  };

  const editMessage = async (messageId: number, content: string) => {
    const updated = await api.editMessage(messageId, content);
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, ...updated } : m))
    );
    return updated;
  };

  const deleteMessage = async (messageId: number) => {
    await api.deleteMessage(messageId);
    setMessages((prev) => prev.filter((m) => m.id !== messageId));
  };

  const addReaction = async (messageId: number, emoji: string) => {
    const result = await api.addReaction(messageId, emoji);
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, reactions: result.reactions } : m))
    );
  };

  return {
    messages,
    loading,
    typingUsers,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    refresh: fetchMessages,
  };
}
