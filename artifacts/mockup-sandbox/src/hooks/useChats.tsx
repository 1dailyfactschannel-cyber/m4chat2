import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export type ChatMessage = {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  messageType: string;
  mediaUrl?: string;
  replyTo?: number;
  isEdited: boolean;
  createdAt: string;
  senderName?: string;
  senderAvatar?: string;
};

export type ChatItem = {
  id: number;
  name: string;
  type: string;
  createdAt: string;
  role: string;
  lastMessage?: {
    id: number;
    content: string;
    messageType: string;
    senderId: number;
    createdAt: string;
    senderName: string;
  };
  unreadCount: number;
};

export function useChats() {
  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChats = useCallback(async () => {
    try {
      const data = await api.getChats();
      setChats(data);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChats();
    const interval = setInterval(fetchChats, 5000);
    return () => clearInterval(interval);
  }, [fetchChats]);

  const createChat = async (name: string, type = 'private', participantIds: number[] = []) => {
    const chat = await api.createChat({ name, type, participantIds });
    await fetchChats();
    return chat;
  };

  return { chats, loading, createChat, refresh: fetchChats };
}

export function useMessages(chatId: number | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!chatId) return;
    setLoading(true);
    try {
      const data = await api.getMessages(chatId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  useEffect(() => {
    fetchMessages();
    if (chatId) {
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [chatId, fetchMessages]);

  const sendMessage = async (content: string, messageType = 'text', replyTo?: number) => {
    if (!chatId) return null;
    const message = await api.sendMessage(chatId, content, messageType, replyTo);
    setMessages(prev => [...prev, message]);
    return message;
  };

  return { messages, loading, sendMessage, refresh: fetchMessages };
}
