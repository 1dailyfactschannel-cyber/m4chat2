import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  MessageCircle, Phone, Bookmark, Settings, Users, Search, Edit3,
  Video, MoreHorizontal, Paperclip, Smile, Send, CheckCheck, Play,
  X, Reply, Trash2, Copy, Forward, Pin, Mic, BellOff, Bell, Star,
  Moon, Sun, Image, Info, Hash, Check, Camera,
  MicOff, VideoOff, PhoneOff, Volume2, VolumeX, ZoomIn, ZoomOut, Monitor,
  ArrowDown, Slash, AtSign, Type, Clock, BarChart2, Link,
  Music, Archive, Eye, EyeOff, CheckSquare, Square,
  UserPlus, Download, ChevronRight, Loader2, Lock,
} from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useChats, useMessages } from '../../../hooks/useChats';
import { useSocket } from '../../../hooks/useSocket';
import { useSignalProtocol } from '../../../hooks/useSignalProtocol';
import { useUIStore } from '../../../store/uiStore';
import { api } from '../../../lib/api';
import { CreateChatModal } from '../../CreateChatModal';
import { MemberList } from '../../MemberList';
import { VoiceRecorder } from '../../VoiceRecorder';
import { FileUploadZone, Lightbox, FileMessage } from '../../MediaComponents';
import { useWebRTC } from '../../../hooks/useWebRTC';
import { cacheDB } from '../../../lib/cache';
import { MessageText } from '../../MessageText';
import { FormatToolbar } from '../../FormatToolbar';
import { DesktopSettings } from './DesktopSettings';
import { VoiceMessage } from '../../VoiceMessage';

// ─── Constants ────────────────────────────────────────────────────────────────
const nowStr = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const CHAT_BACKGROUNDS = [
  { id: 'default', style: { backgroundColor: '#F0F2F5' } },
  { id: 'pattern', style: { backgroundColor: '#dfe6e9', backgroundImage: 'radial-gradient(#00000012 1px,transparent 1px)', backgroundSize: '20px 20px' } },
  { id: 'gradient', style: { background: 'linear-gradient(135deg,#667eea,#764ba2)' } },
  { id: 'nature', style: { background: 'linear-gradient(135deg,#56ab2f,#a8e063)' } },
  { id: 'dark', style: { backgroundColor: '#1a1a2e' } },
];

const FOLDERS = ['Все', 'Личные', 'Работа', 'Непрочитанные'] as const;

const GRADIENTS = [
  'from-purple-400 to-pink-400', 'from-blue-400 to-cyan-400',
  'from-green-400 to-teal-400', 'from-orange-400 to-red-400',
  'from-indigo-400 to-purple-400', 'from-yellow-400 to-orange-400',
];

function getAvatarGradient(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function DesktopMain() {
  const { user, logout } = useAuth();
  const { chats, loading: chatsLoading, refresh: refreshChats } = useChats();
  const {
    activeChatId, setActiveChatId,
    darkMode, toggleDarkMode,
    showBurger, setShowBurger,
    showProfile, setShowProfile,
    profileTab, setProfileTab,
    searchText, setSearchText,
    showSearchBar, setShowSearchBar,
    searchMsg, setSearchMsg,
    replyTo, setReplyTo,
    editingMsgId, setEditingMsgId,
    showEmojiPanel, setShowEmojiPanel,
    selectMode, setSelectMode,
    selectedMsgs, toggleSelectedMsg, clearSelectedMsgs,
    callState, setCallState,
    toasts, addToast, removeToast,
    fontSize, setFontSize,
    chatBgId, setChatBgId,
    activeFolder, setActiveFolder,
  } = useUIStore();

  const [inputText, setInputText] = useState('');
  const [editText, setEditText] = useState('');
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [showFontSlider, setShowFontSlider] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; msgId: number } | null>(null);
  const [chatCtxMenu, setChatCtxMenu] = useState<{ x: number; y: number; chatId: number } | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSilent, setIsSilent] = useState(false);
  const [decryptedMessages, setDecryptedMessages] = useState<Record<number, string>>({});
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMemberList, setShowMemberList] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [incomingCall, setIncomingCall] = useState<{ chatId: number; type: 'audio' | 'video'; offer: RTCSessionDescriptionInit; senderName?: string } | null>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    messages, loading: messagesLoading, typingUsers,
    sendMessage, editMessage, deleteMessage, addReaction,
  } = useMessages(activeChatId);

  const socket = useSocket();
  const signalProtocol = useSignalProtocol();
  const webrtc = useWebRTC();

  const d = darkMode;
  const activeChat = chats.find((c) => c.id === activeChatId);
  const chatBgStyle = CHAT_BACKGROUNDS.find((b) => b.id === chatBgId)?.style ?? {};
  const isDarkBg = ['dark', 'gradient', 'nature'].includes(chatBgId);

  const bg = {
    nav: d ? '#0d1117' : '#17212B',
    panel: d ? '#161b22' : '#FFFFFF',
    panelBorder: d ? '#30363d' : '#EDEDED',
    panelHover: d ? '#21262d' : '#F5F5F5',
    header: d ? '#161b22' : '#FFFFFF',
    msgIn: d ? '#2d333b' : '#FFFFFF',
    msgOut: '#2481CC',
    input: d ? '#161b22' : '#FFFFFF',
    inputField: d ? '#0d1117' : '#F1F1F1',
    text: d ? '#e6edf3' : '#1C1C1E',
    textSec: '#8E8E93',
  };

  // Focus edit input
  useEffect(() => {
    if (editingMsgId) editInputRef.current?.focus();
  }, [editingMsgId]);

  // Attach WebRTC streams to video elements
  useEffect(() => {
    if (localVideoRef.current && webrtc.localStream) {
      localVideoRef.current.srcObject = webrtc.localStream;
    }
  }, [webrtc.localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && webrtc.remoteStream) {
      remoteVideoRef.current.srcObject = webrtc.remoteStream;
    }
  }, [webrtc.remoteStream]);

  // Call timer
  useEffect(() => {
    if (callState?.status === 'active') {
      callTimerRef.current = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      setCallSeconds(0);
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [callState?.status]);

  // Listen for incoming calls
  useEffect(() => {
    const unsub = socket.socket?.on('webrtc:offer', ({ chatId, offer, type }: { chatId: number; offer: RTCSessionDescriptionInit; type: 'audio' | 'video' }) => {
      const chat = chats.find((c) => c.id === chatId);
      setIncomingCall({ chatId, type, offer, senderName: chat?.name });
    });
    return () => { unsub?.off(); };
  }, [socket.socket, chats]);

  // Listen for mentions
  useEffect(() => {
    const unsub = socket.onMention(({ senderName, chatId }) => {
      const chat = chats.find((c) => c.id === chatId);
      addToast({
        chatName: senderName || 'Unknown',
        text: 'Упомянул(а) вас в чате',
        avatar: chat?.name?.slice(0, 2) || '??',
        color: 'from-blue-400 to-blue-600',
      });
      // Play notification sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    });
    return () => { unsub(); };
  }, [socket, addToast, chats]);

  // Decrypt secret chat messages
  useEffect(() => {
    const decryptSecretMessages = async () => {
      for (const msg of messages) {
        if (msg.encryptedPayload && !decryptedMessages[msg.id]) {
          try {
            const plaintext = await signalProtocol.decrypt(msg.chatId, msg.encryptedPayload);
            setDecryptedMessages((prev) => ({ ...prev, [msg.id]: plaintext }));
          } catch (err) {
            console.error('Failed to decrypt message:', err);
            setDecryptedMessages((prev) => ({ ...prev, [msg.id]: '🔒 Зашифрованное сообщение' }));
          }
        }
      }
    };
    decryptSecretMessages();
  }, [messages, signalProtocol, decryptedMessages]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      setRecordingSeconds(0);
    }
    return () => { if (recordingTimerRef.current) clearInterval(recordingTimerRef.current); };
  }, [isRecording]);

  // Typing indicator via WebSocket
  const handleInputChange = (val: string) => {
    setInputText(val);
    if (activeChatId && val.trim()) {
      socket.startTyping(activeChatId);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.stopTyping(activeChatId);
      }, 3000);
    }
  };

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || !activeChatId) return;

    // For secret chats, encrypt the message
    let encryptedPayload: string | undefined;
    if (activeChat?.isSecret) {
      try {
        encryptedPayload = await signalProtocol.encrypt(activeChatId, text);
      } catch (err) {
        console.error('Encryption failed:', err);
        alert('Не удалось зашифровать сообщение. Убедитесь, что сессия установлена.');
        return;
      }
    }

    await sendMessage(text, 'text', replyTo?.id, undefined, isSilent, encryptedPayload);
    setInputText('');
    setReplyTo(null);
    setShowEmojiPanel(false);
    setIsSilent(false);
    if (activeChatId) socket.stopTyping(activeChatId);
  }, [inputText, activeChatId, activeChat, replyTo, sendMessage, setReplyTo, socket, isSilent, signalProtocol]);

  const wrapSelection = (before: string, after: string = before) => {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const selected = inputText.slice(start, end);
    const newText = inputText.slice(0, start) + before + selected + after + inputText.slice(end);
    setInputText(newText);
    // Restore selection after symbols
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + before.length, end + before.length);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    if (e.key === 'Escape') { setReplyTo(null); setShowEmojiPanel(false); setSelectMode(false); clearSelectedMsgs(); }
    // Formatting shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b') { e.preventDefault(); wrapSelection('*'); }
      if (e.key === 'i') { e.preventDefault(); wrapSelection('_'); }
      if (e.key === 'u') { e.preventDefault(); wrapSelection('~'); }
      if (e.key === 'k') { e.preventDefault(); wrapSelection('||'); }
      if (e.shiftKey && e.key === 'M') { e.preventDefault(); wrapSelection('`'); }
    }
  };

  const handleSaveEdit = async () => {
    if (!editingMsgId || !editText.trim()) return;
    await editMessage(editingMsgId, editText);
    setEditingMsgId(null);
    setEditText('');
  };

  const handleDelete = async (msgId: number) => {
    await deleteMessage(msgId);
    setContextMenu(null);
  };

  const handleCtx = (e: React.MouseEvent, msgId: number) => {
    e.preventDefault();
    setContextMenu({ x: Math.min(e.clientX, window.innerWidth - 200), y: Math.min(e.clientY, window.innerHeight - 200), msgId });
  };

  const handleChatCtx = (e: React.MouseEvent, chatId: number) => {
    e.preventDefault();
    setChatCtxMenu({ x: Math.min(e.clientX, 300), y: Math.min(e.clientY, window.innerHeight - 200), chatId });
  };

  const handlePinChat = async (chatId: number) => {
    try {
      await api.pinChat(chatId);
      await refreshChats();
      setChatCtxMenu(null);
    } catch (err) {
      console.error('Failed to pin chat:', err);
    }
  };

  const handleUnpinChat = async (chatId: number) => {
    try {
      await api.unpinChat(chatId);
      await refreshChats();
      setChatCtxMenu(null);
    } catch (err) {
      console.error('Failed to unpin chat:', err);
    }
  };

  const handleArchiveChat = async (chatId: number) => {
    try {
      await api.archiveChat(chatId);
      await refreshChats();
      setChatCtxMenu(null);
    } catch (err) {
      console.error('Failed to archive chat:', err);
    }
  };

  const handleUnarchiveChat = async (chatId: number) => {
    try {
      await api.unarchiveChat(chatId);
      await refreshChats();
      setChatCtxMenu(null);
    } catch (err) {
      console.error('Failed to unarchive chat:', err);
    }
  };

  const openChat = (id: number) => {
    setActiveChatId(id);
    setShowProfile(false);
    setEditingMsgId(null);
    setShowEmojiPanel(false);
    setSelectMode(false);
    clearSelectedMsgs();
    setSearchMsg('');
    setShowSearchBar(false);
  };

  const startCall = async (type: 'audio' | 'video') => {
    if (!activeChatId) return;
    setCallState({ type, status: 'ringing', seconds: 0 });
    await webrtc.startCall(activeChatId, type);
    const current = useUIStore.getState().callState;
    if (current) setCallState({ ...current, status: 'active' });
  };

  const acceptIncomingCall = async () => {
    if (!incomingCall) return;
    setCallState({ type: incomingCall.type, status: 'active', seconds: 0 });
    await webrtc.acceptCall(incomingCall.chatId, incomingCall.offer, incomingCall.type);
    setIncomingCall(null);
  };

  const declineIncomingCall = () => {
    setIncomingCall(null);
  };

  const endActiveCall = () => {
    webrtc.endCall();
    setCallState(null);
    setCallSeconds(0);
  };

  const activeChats = chats.filter((c) => !c.archivedAt);
  const archivedChats = chats.filter((c) => c.archivedAt);

  const filteredChats = (showArchived ? archivedChats : activeChats).filter((c) => {
    if (searchText) return c.name?.toLowerCase().includes(searchText.toLowerCase());
    if (activeFolder === 'Личные') return c.type === 'private';
    if (activeFolder === 'Работа') return c.name?.toLowerCase().includes('работа');
    if (activeFolder === 'Непрочитанные') return (c.unreadCount ?? 0) > 0;
    return true;
  });

  const searchResults = searchMsg
    ? messages.filter((m) => m.content?.toLowerCase().includes(searchMsg.toLowerCase()))
    : [];

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (files: FileList) => {
    if (!activeChatId || files.length === 0) return;
    for (const file of Array.from(files)) {
      try {
        const result = await api.uploadFile(file, activeChatId);
        const messageType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'file';
        await sendMessage(file.name, messageType, replyTo?.id, result.url);
      } catch (e) {
        console.error('Upload failed:', e);
      }
    }
    setReplyTo(null);
  }, [activeChatId, replyTo, sendMessage, setReplyTo]);

  const openLightbox = (url: string) => {
    const mediaMessages = messages.filter((m) => m.messageType === 'image' || m.messageType === 'video');
    const index = mediaMessages.findIndex((m) => m.mediaUrl === url);
    setLightboxIndex(index >= 0 ? index : null);
  };

  const handleVoiceSend = useCallback(async (blob: Blob, duration: number) => {
    if (!activeChatId) return;
    try {
      const file = new File([blob], `voice_${Date.now()}.webm`, { type: 'audio/webm' });
      const result = await api.uploadFile(file, activeChatId);
      await sendMessage(`${Math.round(duration)}с`, 'audio', replyTo?.id, result.url);
    } catch (e) {
      console.error('Voice upload failed:', e);
    }
    setReplyTo(null);
  }, [activeChatId, replyTo, sendMessage, setReplyTo]);

  // Virtualizer for messages
  const messageVirtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => messagesScrollRef.current,
    estimateSize: () => 60,
    measureElement: (el) => el.getBoundingClientRect().height,
    overscan: 10,
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      messageVirtualizer.scrollToIndex(messages.length - 1, { align: 'end' });
    }
  }, [messages.length, messageVirtualizer]);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="w-full h-screen flex overflow-hidden" style={{ fontFamily: 'Inter,system-ui,sans-serif', position: 'relative' }}>
      {/* Burger Drawer */}
      <AnimatePresence>
        {showBurger && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex"
            onClick={() => setShowBurger(false)}
          >
            <div className="absolute inset-0 bg-black/40" />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="relative w-[260px] h-full flex flex-col shadow-2xl z-10"
              style={{ background: bg.panel }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 pt-5 pb-4" style={{ background: bg.nav }}>
                <label className="cursor-pointer group relative inline-block">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !user) return;
                      try {
                        const result = await api.uploadFile(file, 0);
                        await api.updateProfile({ avatarUrl: result.url });
                        // Refresh user data
                        const updated = await api.getMe();
                        if (updated) {
                          localStorage.setItem('user', JSON.stringify(updated));
                          window.location.reload();
                        }
                      } catch (err) {
                        console.error('Avatar upload failed:', err);
                      }
                      e.target.value = '';
                    }}
                  />
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="w-[52px] h-[52px] rounded-full object-cover mb-3 group-hover:opacity-80 transition-opacity" />
                  ) : (
                    <div className={`w-[52px] h-[52px] rounded-full bg-gradient-to-br ${getAvatarGradient(user?.username || 'U')} flex items-center justify-center text-white font-bold text-[18px] mb-3 group-hover:opacity-80 transition-opacity`}>
                      {getInitials(user?.username || 'U')}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-5 h-5 text-white drop-shadow-md" />
                  </div>
                </label>
                <div className="font-bold text-[16px] text-white">{user?.username || 'User'}</div>
                <div className="text-white/60 text-[13px]">@{user?.username?.toLowerCase() || 'user'}</div>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {[
                  { icon: MessageCircle, label: 'Чаты', active: true },
                  { icon: Phone, label: 'Звонки', active: false },
                  { icon: Users, label: 'Контакты', active: false },
                  { icon: Bookmark, label: 'Избранное', active: false },
                  { icon: Settings, label: 'Настройки', active: false },
                ].map(({ icon: Icon, label, active }) => (
                  <button
                    key={label}
                    className="w-full flex items-center gap-4 px-5 py-3 text-left transition-colors hover:opacity-80"
                    style={{ color: active ? '#2481CC' : bg.text }}
                    onClick={() => {
                      if (label === 'Избранное') {
                        const savedChat = chats.find((c) => c.isSelfChat);
                        if (savedChat) openChat(savedChat.id);
                      }
                      if (label === 'Настройки') { setShowSettings(true); }
                      setShowBurger(false);
                    }}
                  >
                    <Icon className="w-5 h-5 shrink-0" style={{ color: active ? '#2481CC' : bg.textSec }} />
                    <span className="text-[15px] font-medium">{label}</span>
                  </button>
                ))}
                <div className="mx-4 my-1" style={{ borderTop: `1px solid ${bg.panelBorder}` }} />
                <div className="px-5 py-1.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: bg.textSec }}>Папки</span>
                </div>
                {FOLDERS.map((f) => (
                  <button
                    key={f}
                    onClick={() => { setActiveFolder(f); setShowBurger(false); }}
                    className="w-full flex items-center gap-4 px-5 py-2.5 text-left hover:opacity-80 transition-colors"
                    style={{ color: activeFolder === f ? '#2481CC' : bg.text }}
                  >
                    <ChevronRight className="w-4 h-4 shrink-0" style={{ color: activeFolder === f ? '#2481CC' : bg.textSec }} />
                    <span className="text-[14px]">{f}</span>
                  </button>
                ))}
                <div className="mx-4 my-1" style={{ borderTop: `1px solid ${bg.panelBorder}` }} />
                <button
                  onClick={(e) => { e.stopPropagation(); toggleDarkMode(); }}
                  className="w-full flex items-center gap-4 px-5 py-3 text-left hover:opacity-80 transition-colors"
                  style={{ color: bg.text }}
                >
                  {d ? <Sun className="w-5 h-5 shrink-0" style={{ color: bg.textSec }} /> : <Moon className="w-5 h-5 shrink-0" style={{ color: bg.textSec }} />}
                  <span className="text-[15px]">{d ? 'Светлый режим' : 'Ночной режим'}</span>
                </button>
                <button
                  onClick={() => { logout(); setShowBurger(false); }}
                  className="w-full flex items-center gap-4 px-5 py-3 text-left hover:opacity-80 transition-colors text-red-500"
                >
                  <span className="text-[15px]">Выйти</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat List */}
      <div className="w-[300px] shrink-0 flex flex-col" style={{ background: bg.panel, borderRight: `1px solid ${bg.panelBorder}` }}>
        <div className="h-[52px] flex items-center gap-2 px-3 shrink-0" style={{ borderBottom: `1px solid ${bg.panelBorder}` }}>
            <button onClick={(e) => { e.stopPropagation(); setShowBurger(!showBurger); }} className="p-1.5 rounded-lg transition-colors hover:opacity-70" style={{ color: bg.textSec }}>
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="0" y1="1" x2="18" y2="1" /><line x1="0" y1="7" x2="18" y2="7" /><line x1="0" y1="13" x2="18" y2="13" />
            </svg>
          </button>
          <h1 className="font-semibold text-[16px] flex-1" style={{ color: bg.text }}>Telegram</h1>
          <div className="flex items-center gap-2" style={{ color: bg.textSec }}>
            <Search className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors" />
            <button onClick={() => setShowCreateModal(true)} title="Новый чат">
              <Edit3 className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors" />
            </button>
            <button
              onClick={async () => {
                const username = prompt('Введите username для секретного чата:');
                if (!username) return;
                try {
                  const users = await api.searchUsers(username);
                  if (users.length === 0) {
                    alert('Пользователь не найден');
                    return;
                  }
                  const targetUser = users[0];
                  const chat = await api.createChat({
                    type: 'secret',
                    participantIds: [targetUser.id],
                  });
                  // Establish Signal session
                  const signal = useSignalProtocol();
                  await signal.establishSession(chat.id, targetUser.id);
                  await refreshChats();
                  openChat(chat.id);
                } catch (err) {
                  console.error('Failed to create secret chat:', err);
                  alert('Ошибка создания секретного чата');
                }
              }}
              title="Секретный чат"
            >
              <Lock className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors" />
            </button>
          </div>
        </div>
        {/* Folder tabs */}
        <div className="flex shrink-0 overflow-x-auto" style={{ borderBottom: `1px solid ${bg.panelBorder}` }}>
          {FOLDERS.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFolder(f)}
              className="px-3 py-2 text-[12px] font-medium whitespace-nowrap transition-colors relative"
              style={{ color: activeFolder === f ? '#2481CC' : bg.textSec }}
            >
              {f}
              {activeFolder === f && <motion.div layoutId="folderTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2481CC] rounded-t" />}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="px-3 py-2 shrink-0">
          <div className="rounded-full h-8 flex items-center px-3 gap-2" style={{ background: bg.inputField }}>
            <Search className="w-4 h-4 shrink-0" style={{ color: bg.textSec }} />
            <input
              type="text"
              placeholder="Поиск"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="bg-transparent border-none outline-none text-[13px] w-full"
              style={{ color: bg.text }}
            />
            {searchText && <X className="w-4 h-4 cursor-pointer" style={{ color: bg.textSec }} onClick={() => setSearchText('')} />}
          </div>
        </div>
        {/* Chat items */}
        <div className="flex-1 overflow-y-auto">
          {chatsLoading && (
            <div className="flex justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin" style={{ color: bg.textSec }} />
            </div>
          )}
          {/* Archive toggle */}
          {!showArchived && archivedChats.length > 0 && (
            <button
              onClick={() => setShowArchived(true)}
              className="w-full flex items-center gap-3 px-3 py-2 text-[13px] hover:bg-[#2481CC]/10 transition-colors"
              style={{ color: bg.textSec, borderBottom: `1px solid ${bg.panelBorder}` }}
            >
              <Archive className="w-4 h-4" />
              <span className="flex-1 text-left">Архив</span>
              <span className="text-[11px] bg-[#2481CC] text-white px-1.5 rounded-full">{archivedChats.length}</span>
            </button>
          )}
          {showArchived && (
            <button
              onClick={() => setShowArchived(false)}
              className="w-full flex items-center gap-3 px-3 py-2 text-[13px] hover:bg-[#2481CC]/10 transition-colors"
              style={{ color: bg.textSec, borderBottom: `1px solid ${bg.panelBorder}` }}
            >
              <ArrowDown className="w-4 h-4" />
              <span className="flex-1 text-left">Назад к чатам</span>
            </button>
          )}
          <AnimatePresence>
            {filteredChats.map((chat) => {
              const isActive = chat.id === activeChatId;
              const lastMsg = chat.lastMessage;
              return (
                <motion.div
                  key={chat.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={() => openChat(chat.id)}
                  onContextMenu={(e) => handleChatCtx(e, chat.id)}
                  className="flex items-center px-3 py-[6px] cursor-pointer transition-colors"
                  style={{ background: isActive ? '#2481CC' : 'transparent' }}
                  whileHover={{ backgroundColor: isActive ? '#2481CC' : (d ? '#21262d' : '#F5F5F5') }}
                >
                  <div className="relative shrink-0 mr-2.5">
                    {chat.photo ? (
                      <img src={chat.photo} alt={chat.name} className="w-[42px] h-[42px] rounded-full object-cover" />
                    ) : (
                      <div className={`w-[42px] h-[42px] rounded-full bg-gradient-to-br ${getAvatarGradient(chat.name || '?')} flex items-center justify-center text-white font-semibold text-[13px]`}>
                        {getInitials(chat.name || '?')}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 py-1" style={{ borderBottom: isActive ? 'none' : `1px solid ${bg.panelBorder}` }}>
                    <div className="flex justify-between items-baseline mb-0.5">
                      <div className="flex items-center gap-1 truncate">
                        {chat.isSecret && <Lock className="w-3 h-3" style={{ color: isActive ? 'rgba(255,255,255,0.7)' : '#4DCA65' }} />}
                        <h3 className="font-semibold text-[14px] truncate pr-1" style={{ color: isActive ? 'white' : bg.text }}>{chat.name || 'Unknown'}</h3>
                      </div>
                      <div className="flex items-center gap-1">
                        {chat.pinnedAt && (
                          <Pin className="w-3 h-3 rotate-45" style={{ color: isActive ? 'rgba(255,255,255,0.7)' : bg.textSec }} />
                        )}
                        <span className="text-[11px] whitespace-nowrap" style={{ color: isActive ? 'rgba(255,255,255,0.7)' : bg.textSec }}>
                          {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-[12px] truncate pr-1" style={{ color: isActive ? 'rgba(255,255,255,0.75)' : bg.textSec }}>
                        {lastMsg?.messageType === 'image' ? 'Фото' : lastMsg?.content || 'Нет сообщений'}
                      </p>
                      <div className="flex items-center gap-1 shrink-0">
                        {(chat.unreadCount ?? 0) > 0 && (
                          <div className={`text-white text-[11px] font-semibold px-1.5 rounded-full min-w-[18px] text-center bg-[#2481CC] ${isActive ? '!bg-white !text-[#2481CC]' : ''}`}>
                            {chat.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <div className="h-[52px] flex items-center justify-between px-4 shrink-0 shadow-sm" style={{ background: bg.header, borderBottom: `1px solid ${bg.panelBorder}` }}>
          {selectMode ? (
            <div className="flex items-center gap-3">
              <button onClick={() => { setSelectMode(false); clearSelectedMsgs(); }} style={{ color: bg.textSec }}><X className="w-5 h-5" /></button>
              <span className="font-semibold text-[15px]" style={{ color: bg.text }}>{selectedMsgs.size} выбрано</span>
            </div>
          ) : (
            <button className="flex flex-col text-left hover:opacity-70 transition-opacity" onClick={(e) => { e.stopPropagation(); setShowProfile(!showProfile); }}>
              <div className="flex items-center gap-1.5">
                {activeChat?.isSecret && <Lock className="w-3.5 h-3.5 text-[#4DCA65]" />}
                <h2 className="font-semibold text-[14px] leading-tight" style={{ color: bg.text }}>{activeChat?.name || 'Выберите чат'}</h2>
              </div>
              <span className="text-[12px] leading-tight" style={{ color: typingUsers.size > 0 ? '#4DCA65' : bg.textSec }}>
                {typingUsers.size > 0 ? (
                  <span className="flex items-center gap-1">
                    печатает
                    <span className="flex gap-[2px] items-end h-3">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-[3px] h-[3px] rounded-full bg-[#4DCA65]"
                          animate={{ scaleY: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        />
                      ))}
                    </span>
                  </span>
                ) : activeChat?.type === 'private' ? 'онлайн' : `${activeChat?.type || ''}`}
              </span>
            </button>
          )}
          <div className="flex items-center gap-3" style={{ color: bg.textSec }}>
            {selectMode ? (
              <>
                <button onClick={async () => { for (const id of selectedMsgs) await deleteMessage(id); clearSelectedMsgs(); setSelectMode(false); }} className="flex items-center gap-1.5 text-[13px] text-[#EF4444] hover:opacity-80">
                  <Trash2 className="w-4 h-4" /> Удалить {selectedMsgs.size}
                </button>
              </>
            ) : (
              <>
                {showSearchBar && (
                  <div className="flex items-center gap-1">
                    <input
                      autoFocus
                      type="text"
                      placeholder="Поиск в чате..."
                      value={searchMsg}
                      onChange={(e) => setSearchMsg(e.target.value)}
                      className="border rounded-full px-3 py-1 text-[12px] outline-none"
                      style={{ borderColor: bg.panelBorder, background: bg.inputField, color: bg.text, width: 150 }}
                    />
                    {searchResults.length > 0 && <span className="text-[11px] whitespace-nowrap" style={{ color: bg.textSec }}>{searchResults.length}</span>}
                  </div>
                )}
                <Search className="w-4 h-4 cursor-pointer hover:text-[#2481CC]" onClick={(e) => { e.stopPropagation(); const next = !showSearchBar; setShowSearchBar(next); if (showSearchBar) setSearchMsg(''); }} />
                <Phone className="w-4 h-4 cursor-pointer hover:text-[#2481CC]" onClick={(e) => { e.stopPropagation(); startCall('audio'); }} />
                <Video className="w-4 h-4 cursor-pointer hover:text-[#2481CC]" onClick={(e) => { e.stopPropagation(); startCall('video'); }} />
                <Info className="w-4 h-4 cursor-pointer hover:text-[#2481CC]" onClick={(e) => { e.stopPropagation(); setShowProfile(!showProfile); }} />
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <FileUploadZone onFileSelect={handleFileSelect} darkMode={darkMode}>
          <div ref={messagesScrollRef} className="flex-1 overflow-y-auto px-5 py-4" style={chatBgStyle}>
            {!activeChatId ? (
              <div className="flex-1 flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4" style={{ color: bg.textSec, opacity: 0.3 }} />
                  <p className="text-[16px] font-medium" style={{ color: bg.textSec }}>Выберите чат чтобы начать общение</p>
                </div>
              </div>
            ) : (
              <>
                {messagesLoading && messages.length === 0 && (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: bg.textSec }} />
                  </div>
                )}
                <div
                  style={{
                    height: `${messageVirtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                  }}
                >
                  {messageVirtualizer.getVirtualItems().map((virtualItem) => {
                    const msg = messages[virtualItem.index];
                    if (!msg) return null;
                    const isEditing = editingMsgId === msg.id;
                    const isSelected = selectedMsgs.has(msg.id);
                    const highlighted = searchMsg && msg.content?.toLowerCase().includes(searchMsg.toLowerCase());
                    const replyMsg = msg.replyTo ? messages.find((m) => m.id === msg.replyTo) : null;
                    const isMedia = ['image', 'video', 'audio', 'file'].includes(msg.messageType);

                    return (
                      <div
                        key={msg.id}
                        ref={messageVirtualizer.measureElement}
                        data-index={virtualItem.index}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          transform: `translateY(${virtualItem.start}px)`,
                        }}
                        className="px-5"
                      >
                        <div className={`flex w-full group mb-1 ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'} ${selectMode ? 'cursor-pointer' : ''}`}
                          onContextMenu={(e) => !selectMode && handleCtx(e, msg.id)}
                          onClick={() => selectMode && toggleSelectedMsg(msg.id)}
                        >
                          {selectMode && (
                            <div className={`flex items-center ${msg.senderId === user?.id ? 'order-last ml-2' : 'mr-2'}`}>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-[#2481CC] border-[#2481CC]' : 'border-[#8E8E93]'}`}>
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </div>
                            </div>
                          )}
                          <div className="relative max-w-[62%]">
                            {/* Quick reactions on hover */}
                            {!isEditing && !selectMode && (
                              <div
                                className={`absolute -top-7 ${msg.senderId === user?.id ? 'right-0' : 'left-0'} hidden group-hover:flex items-center gap-0.5 bg-white rounded-full shadow-lg px-1.5 py-0.5 z-20 border border-[#EDEDED]`}
                              >
                                {['❤️', '👍', '😂', '🔥'].map((e) => (
                                  <button key={e} onClick={() => addReaction(msg.id, e)} className="text-[14px] w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#F1F1F1] hover:scale-125 transition-all">
                                    {e}
                                  </button>
                                ))}
                              </div>
                            )}
                            {/* Reply preview */}
                            {replyMsg && (
                              <div className={`text-[11px] mb-1 pl-2 border-l-2 ${msg.senderId === user?.id ? 'border-blue-200 text-blue-100' : 'border-[#2481CC] text-[#2481CC]'}`}>
                                <div className="font-semibold">{replyMsg.senderName || 'Unknown'}</div>
                                <div className="truncate opacity-80">{replyMsg.content || 'Медиа'}</div>
                              </div>
                            )}
                            {/* Bubble */}
                            {isEditing ? (
                              <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow-md border-2 border-[#2481CC]">
                                <input
                                  ref={editInputRef}
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(); if (e.key === 'Escape') { setEditingMsgId(null); setEditText(''); } }}
                                  className="border-none outline-none flex-1 min-w-[180px]"
                                  style={{ fontSize, color: bg.text }}
                                />
                                <button onClick={handleSaveEdit} className="w-6 h-6 bg-[#2481CC] rounded-full flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white" /></button>
                              </div>
                            ) : (
                              <div
                                className={`rounded-2xl px-4 py-2 shadow-sm ${highlighted ? 'ring-2 ring-yellow-400' : isSelected ? 'ring-2 ring-[#2481CC]' : ''} ${msg.senderId === user?.id ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                                style={{ background: msg.senderId === user?.id ? bg.msgOut : bg.msgIn }}
                              >
                                {isMedia && msg.mediaUrl ? (
                                  <div className="cursor-pointer" onClick={() => (msg.messageType === 'image' || msg.messageType === 'video') && msg.mediaUrl && openLightbox(msg.mediaUrl)}>
                                    {msg.messageType === 'audio' ? (
                                      <VoiceMessage
                                        url={msg.mediaUrl}
                                        duration={msg.content ? Number(msg.content) || 0 : 0}
                                        darkMode={darkMode}
                                        outgoing={msg.senderId === user?.id}
                                      />
                                    ) : (
                                      <FileMessage
                                        fileName={msg.content || 'file'}
                                        fileSize={0}
                                        mimeType={msg.messageType === 'image' ? 'image/jpeg' : msg.messageType === 'video' ? 'video/mp4' : 'application/octet-stream'}
                                        url={msg.mediaUrl}
                                        darkMode={darkMode}
                                        outgoing={msg.senderId === user?.id}
                                      />
                                    )}
                                  </div>
                                ) : (
                                  <p className="leading-relaxed pr-14" style={{ fontSize, color: msg.senderId === user?.id ? 'white' : bg.text }}>
                                    {msg.isDeleted ? (
                                      <span className="italic opacity-50">Сообщение удалено</span>
                                    ) : activeChat?.isSecret ? (
                                      <span>{decryptedMessages[msg.id] || '🔒 Расшифровка...'}</span>
                                    ) : (
                                      <MessageText content={msg.content} entities={msg.entities} darkMode={darkMode} />
                                    )}
                                  </p>
                                )}
                                {/* Reactions */}
                                {msg.reactions && msg.reactions.length > 0 && (
                                  <div className="flex gap-1 mt-1 flex-wrap">
                                    {msg.reactions.map((r) => (
                                      <button
                                        key={r.emoji}
                                        onClick={() => addReaction(msg.id, r.emoji)}
                                        className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] border transition-all ${r.mine ? 'bg-[#2481CC]/10 border-[#2481CC]' : 'bg-white/50 border-transparent'}`}
                                      >
                                        <span>{r.emoji}</span>
                                        <span className={r.mine ? 'text-[#2481CC] font-semibold' : ''}>{r.count}</span>
                                      </button>
                                    ))}
                                  </div>
                                )}
                                <div className={`flex items-center gap-1 ${msg.senderId === user?.id ? 'text-blue-100' : 'text-[#8E8E93]'} justify-end mt-0.5`}>
                                  {msg.isEdited && <span className="text-[10px] opacity-70">изм.</span>}
                                  <span className="text-[11px]">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  {msg.senderId === user?.id && <CheckCheck className="w-3 h-3" />}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </FileUploadZone>

        {/* Input Area */}
        {activeChatId && (
          <div className="px-3 py-2 flex flex-col gap-1 shrink-0 relative" style={{ background: bg.input, borderTop: `1px solid ${bg.panelBorder}` }}>
            <div className="flex items-center justify-between px-1">
              <FormatToolbar
                darkMode={darkMode}
                onFormat={(type) => {
                  const map: Record<string, { before: string; after: string }> = {
                    bold: { before: '*', after: '*' },
                    italic: { before: '_', after: '_' },
                    strikethrough: { before: '~', after: '~' },
                    code: { before: '`', after: '`' },
                    spoiler: { before: '||', after: '||' },
                  };
                  const fmt = map[type];
                  if (fmt) wrapSelection(fmt.before, fmt.after);
                }}
              />
              <label className="flex items-center gap-1.5 cursor-pointer select-none" style={{ color: bg.textSec }}>
                <input
                  type="checkbox"
                  checked={isSilent}
                  onChange={(e) => setIsSilent(e.target.checked)}
                  className="w-3.5 h-3.5 rounded accent-[#2481CC]"
                />
                <span className="text-[11px]">Без звука</span>
              </label>
            </div>
            <div className="flex items-end gap-2">
            {replyTo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-[60px] left-3 right-3 px-3 py-2 rounded-t-xl flex items-center justify-between"
                style={{ background: d ? '#21262d' : '#F5F5F5', borderLeft: '3px solid #2481CC' }}
              >
                <div>
                  <div className="text-[11px] font-semibold text-[#2481CC]">Ответить {replyTo.senderName}</div>
                  <div className="text-[12px] truncate" style={{ color: bg.textSec }}>{replyTo.text}</div>
                </div>
                <button onClick={() => setReplyTo(null)} className="p-1"><X className="w-4 h-4" style={{ color: bg.textSec }} /></button>
              </motion.div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) handleFileSelect(e.target.files); e.target.value = ''; }}
            />
            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-full hover:bg-[#F1F1F1]/10 transition-colors shrink-0" style={{ color: bg.textSec }}>
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 rounded-full flex items-center px-3 gap-2" style={{ background: bg.inputField }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Сообщение..."
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-none outline-none text-[14px] flex-1 py-2"
                style={{ color: bg.text }}
              />
              <button className="p-1.5 hover:opacity-70 transition-opacity shrink-0" style={{ color: bg.textSec }}>
                <Smile className="w-5 h-5" />
              </button>
            </div>
            <AnimatePresence mode="wait">
              {inputText.trim() ? (
                <motion.button
                  key="send"
                  initial={{ scale: 0.8, rotate: -45, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.8, rotate: -45, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={handleSend}
                  className="w-10 h-10 rounded-full bg-[#2481CC] flex items-center justify-center text-white hover:bg-[#1f73b8] transition-colors shrink-0"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </motion.button>
              ) : (
                <VoiceRecorder
                  key="recorder"
                  onSend={handleVoiceSend}
                  onCancel={() => {}}
                  darkMode={darkMode}
                />
              )}
            </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* Profile Side Panel */}
      <AnimatePresence>
        {showProfile && activeChat && (
          <motion.div
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-[320px] shrink-0 flex flex-col overflow-y-auto"
            style={{ background: bg.panel, borderLeft: `1px solid ${bg.panelBorder}` }}
          >
            <div className="p-4 flex items-center gap-3 shrink-0" style={{ borderBottom: `1px solid ${bg.panelBorder}` }}>
              <button onClick={() => setShowProfile(false)}><X className="w-5 h-5" style={{ color: bg.textSec }} /></button>
              <span className="font-semibold text-[15px]" style={{ color: bg.text }}>Информация</span>
            </div>
            <div className="p-6 flex flex-col items-center">
              <label className="cursor-pointer group relative inline-block mb-3">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file || !activeChat) return;
                    try {
                      const result = await api.uploadFile(file, activeChat.id);
                      await api.updateChatPhoto(activeChat.id, result.url);
                      await refreshChats();
                    } catch (err) {
                      console.error('Chat photo upload failed:', err);
                    }
                    e.target.value = '';
                  }}
                />
                {activeChat.photo ? (
                  <img src={activeChat.photo} alt="chat" className="w-[80px] h-[80px] rounded-full object-cover group-hover:opacity-80 transition-opacity" />
                ) : (
                  <div className={`w-[80px] h-[80px] rounded-full bg-gradient-to-br ${getAvatarGradient(activeChat.name || '?')} flex items-center justify-center text-white font-bold text-[28px] group-hover:opacity-80 transition-opacity`}>
                    {getInitials(activeChat.name || '?')}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white drop-shadow-md" />
                </div>
              </label>
              <h3 className="font-bold text-[18px]" style={{ color: bg.text }}>{activeChat.name}</h3>
              <span className="text-[13px]" style={{ color: bg.textSec }}>{activeChat.type === 'private' ? 'онлайн' : `${activeChat.type}`}</span>
            </div>
            {/* Invite Link */}
            {activeChat?.type !== 'private' && (
              <div className="px-4 py-3" style={{ borderTop: `1px solid ${bg.panelBorder}` }}>
                <button
                  onClick={async () => {
                    try {
                      const result = await api.generateInviteLink(activeChat.id);
                      setInviteLink(result.inviteLink);
                      navigator.clipboard.writeText(`${window.location.origin}/join/${result.inviteLink}`);
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="w-full text-left py-2 text-[14px] text-[#2481CC] hover:opacity-80 transition-opacity"
                >
                  Создать ссылку-приглашение
                </button>
                {inviteLink && (
                  <div className="mt-2 p-2 rounded-lg text-[12px] break-all" style={{ background: darkMode ? '#0d1117' : '#F5F5F5', color: bg.textSec }}>
                    {`${window.location.origin}/join/${inviteLink}`}
                  </div>
                )}
              </div>
            )}
            {/* Auto-delete timer */}
            {activeChat?.type !== 'private' && (
              <div className="px-4 py-2" style={{ borderTop: `1px solid ${bg.panelBorder}` }}>
                <div className="text-[12px] font-medium mb-1" style={{ color: bg.textSec }}>Автоудаление сообщений</div>
                <select
                  value={activeChat.autoDeleteTimer || ''}
                  onChange={async (e) => {
                    const timer = e.target.value ? Number(e.target.value) : null;
                    try {
                      await api.updateAutoDeleteTimer(activeChat.id, timer);
                      await refreshChats();
                    } catch (err) {
                      console.error('Failed to update auto-delete timer:', err);
                    }
                  }}
                  className="w-full text-[13px] border rounded-lg px-2 py-1.5 outline-none"
                  style={{ background: darkMode ? '#0d1117' : '#fff', color: bg.text, borderColor: bg.panelBorder }}
                >
                  <option value="">Отключено</option>
                  <option value="86400">24 часа</option>
                  <option value="604800">7 дней</option>
                  <option value="2592000">1 месяц</option>
                </select>
              </div>
            )}

            {/* Members button */}
            {activeChat?.type !== 'private' && (
              <div className="px-4 py-2" style={{ borderTop: `1px solid ${bg.panelBorder}` }}>
                <button
                  onClick={() => setShowMemberList(true)}
                  className="w-full flex items-center justify-between py-2 text-left text-[14px] transition-colors hover:opacity-80"
                  style={{ color: bg.text }}
                >
                  <span>Участники</span>
                  <Users className="w-4 h-4" style={{ color: bg.textSec }} />
                </button>
              </div>
            )}
            <div className="px-4 py-2" style={{ borderTop: `1px solid ${bg.panelBorder}` }}>
              {['media', 'files', 'links', 'audio'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setProfileTab(tab as any)}
                  className="w-full text-left py-2 text-[14px] capitalize transition-colors"
                  style={{ color: profileTab === tab ? '#2481CC' : bg.text }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed z-50 rounded-xl shadow-xl border py-1 min-w-[160px]"
            style={{ left: contextMenu.x, top: contextMenu.y, background: bg.panel, borderColor: bg.panelBorder }}
            onClick={(e) => e.stopPropagation()}
          >
            {[
              { label: 'Ответить', icon: Reply, action: () => { const msg = messages.find((m) => m.id === contextMenu.msgId); if (msg) setReplyTo({ id: msg.id, text: msg.content || '', senderName: msg.senderName || '' }); setContextMenu(null); } },
              { label: 'Копировать', icon: Copy, action: () => { const msg = messages.find((m) => m.id === contextMenu.msgId); if (msg?.content) navigator.clipboard.writeText(msg.content); setContextMenu(null); } },
              { label: 'Редактировать', icon: Edit3, action: () => { const msg = messages.find((m) => m.id === contextMenu.msgId); if (msg) { setEditingMsgId(msg.id); setEditText(msg.content || ''); } setContextMenu(null); } },
              { label: 'Удалить', icon: Trash2, action: () => handleDelete(contextMenu.msgId) },
            ].map(({ label, icon: Icon, action }) => (
              <button key={label} onClick={action} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left hover:bg-[#2481CC]/10 transition-colors" style={{ color: label === 'Удалить' ? '#EF4444' : bg.text }}>
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Context Menu */}
      <AnimatePresence>
        {chatCtxMenu && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="fixed z-50 rounded-xl shadow-xl border py-1 min-w-[180px]"
            style={{ left: chatCtxMenu.x, top: chatCtxMenu.y, background: bg.panel, borderColor: bg.panelBorder }}
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const chat = chats.find((c) => c.id === chatCtxMenu.chatId);
              const isPinned = !!chat?.pinnedAt;
              const isArchived = !!chat?.archivedAt;
              return [
                { label: isPinned ? 'Открепить' : 'Закрепить', icon: Pin, action: () => isPinned ? handleUnpinChat(chatCtxMenu.chatId) : handlePinChat(chatCtxMenu.chatId) },
                { label: isArchived ? 'Разархивировать' : 'Архивировать', icon: Archive, action: () => isArchived ? handleUnarchiveChat(chatCtxMenu.chatId) : handleArchiveChat(chatCtxMenu.chatId) },
                { label: 'Удалить чат', icon: Trash2, action: () => { setChatCtxMenu(null); /* TODO: delete */ } },
              ].map(({ label, icon: Icon, action }) => (
                <button key={label} onClick={action} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-left hover:bg-[#2481CC]/10 transition-colors" style={{ color: label === 'Удалить чат' ? '#EF4444' : bg.text }}>
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ));
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            {(() => {
              const mediaMessages = messages.filter((m) => m.messageType === 'image' || m.messageType === 'video');
              const currentMsg = mediaMessages[lightboxIndex];
              if (!currentMsg) return null;
              return (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.max(0, lightboxIndex - 1)); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-30"
                    disabled={lightboxIndex <= 0}
                  >
                    <ChevronRight className="w-6 h-6 rotate-180" />
                  </button>
                  <motion.img
                    key={currentMsg.id}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0.9 }}
                    src={currentMsg.mediaUrl!}
                    className="max-w-[90%] max-h-[90%] rounded-lg"
                    alt="Preview"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(Math.min(mediaMessages.length - 1, lightboxIndex + 1)); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors disabled:opacity-30"
                    disabled={lightboxIndex >= mediaMessages.length - 1}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                    {lightboxIndex + 1} / {mediaMessages.length}
                  </div>
                </>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Incoming Call Modal */}
      <AnimatePresence>
        {incomingCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.85)' }}
          >
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getAvatarGradient(incomingCall.senderName || '?')} flex items-center justify-center text-white font-bold text-[32px]`}>
                  {getInitials(incomingCall.senderName || '?')}
                </div>
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-white/30"
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="text-white text-center">
                <h3 className="text-[20px] font-semibold">{incomingCall.senderName || 'Unknown'}</h3>
                <p className="text-[14px] opacity-70">{incomingCall.type === 'video' ? 'Видеозвонок...' : 'Входящий звонок...'}</p>
              </div>
              <div className="flex gap-6">
                <button onClick={declineIncomingCall} className="w-14 h-14 rounded-full bg-[#EF4444] flex items-center justify-center text-white hover:scale-110 transition-transform">
                  <PhoneOff className="w-6 h-6" />
                </button>
                <button onClick={acceptIncomingCall} className="w-14 h-14 rounded-full bg-[#4DCA65] flex items-center justify-center text-white hover:scale-110 transition-transform">
                  <Phone className="w-6 h-6" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Call Overlay */}
      <AnimatePresence>
        {callState && !incomingCall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ background: 'rgba(0,0,0,0.92)' }}
          >
            {/* Remote video / avatar */}
            <div className="flex-1 relative flex items-center justify-center">
              {callState.type === 'video' && webrtc.remoteStream ? (
                <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${getAvatarGradient(activeChat?.name || '?')} flex items-center justify-center text-white font-bold text-[36px]`}>
                    {getInitials(activeChat?.name || '?')}
                  </div>
                  <div className="text-white text-center">
                    <h3 className="text-[22px] font-semibold">{activeChat?.name}</h3>
                    <p className="text-[15px] opacity-70">{callState.status === 'ringing' ? 'Звонок...' : `${Math.floor(callSeconds / 60)}:${String(callSeconds % 60).padStart(2, '0')}`}</p>
                  </div>
                </div>
              )}
              {/* Local video pip */}
              {callState.type === 'video' && (
                <div className="absolute bottom-24 right-4 w-36 h-48 rounded-xl overflow-hidden shadow-lg border border-white/10 bg-black">
                  <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            {/* Call controls */}
            <div className="shrink-0 h-24 flex items-center justify-center gap-6 pb-4">
              <button onClick={webrtc.toggleMute} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                {webrtc.localStream?.getAudioTracks()[0]?.enabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              {callState.type === 'video' && (
                <button onClick={webrtc.toggleVideo} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
                  {webrtc.localStream?.getVideoTracks()[0]?.enabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </button>
              )}
              {callState.type === 'video' && (
                <button
                  onClick={webrtc.isScreenSharing ? webrtc.stopScreenShare : webrtc.startScreenShare}
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${webrtc.isScreenSharing ? 'bg-[#2481CC]' : 'bg-white/10 hover:bg-white/20'}`}
                >
                  <Monitor className="w-5 h-5" />
                </button>
              )}
              <button onClick={endActiveCall} className="w-14 h-14 rounded-full bg-[#EF4444] flex items-center justify-center text-white hover:scale-110 transition-transform">
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Chat Modal */}
      <CreateChatModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => { /* refresh chats */ }}
        darkMode={darkMode}
      />

      {/* Member List */}
      <MemberList
        chatId={activeChatId || 0}
        isOpen={showMemberList}
        onClose={() => setShowMemberList(false)}
        darkMode={darkMode}
        currentUserId={user?.id}
        userRole={activeChat?.role}
      />

      {/* Settings */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center" onClick={() => setShowSettings(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-[900px] h-[600px] rounded-xl overflow-hidden shadow-2xl">
            <DesktopSettings />
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border"
              style={{ background: bg.panel, borderColor: bg.panelBorder, minWidth: 280 }}
              onClick={() => removeToast(toast.id)}
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${toast.color} flex items-center justify-center text-white font-bold text-[13px] shrink-0`}>
                {toast.avatar}
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-[13px] truncate" style={{ color: bg.text }}>{toast.chatName}</div>
                <div className="text-[12px] truncate" style={{ color: bg.textSec }}>{toast.text}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
