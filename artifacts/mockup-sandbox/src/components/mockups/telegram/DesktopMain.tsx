import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle, Phone, Bookmark, Settings, Users, Search, Edit3,
  Video, MoreHorizontal, Paperclip, Smile, Send, CheckCheck, Play,
  X, Reply, Trash2, Copy, Forward, Pin, Mic, BellOff, Star
} from 'lucide-react';

type Message = {
  id: number;
  text: string;
  time: string;
  outgoing: boolean;
  type: 'text' | 'image' | 'voice';
  read?: boolean;
  replyTo?: number;
};

type Chat = {
  id: number;
  name: string;
  avatar: string;
  color: string;
  status: string;
  statusColor: string;
  time: string;
  unread: number | null;
  muted?: boolean;
  messages: Message[];
};

const now = () => {
  const d = new Date();
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
};

const INITIAL_CHATS: Chat[] = [
  {
    id: 1, name: 'Telegram', avatar: 'T', color: 'from-blue-400 to-blue-500',
    status: 'bot', statusColor: '#8E8E93', time: '10:42', unread: null,
    messages: [
      { id: 1, text: 'Welcome to Telegram! This is the official notification channel.', time: '10:40', outgoing: false, type: 'text' },
      { id: 2, text: 'Your account has been successfully set up.', time: '10:42', outgoing: false, type: 'text' },
    ]
  },
  {
    id: 2, name: 'Night Owl Club', avatar: 'N', color: 'from-purple-400 to-purple-600',
    status: '14 members', statusColor: '#8E8E93', time: '9:15', unread: 3,
    messages: [
      { id: 1, text: 'Are we still on for tonight?', time: '9:10', outgoing: false, type: 'text' },
      { id: 2, text: 'Yes! I will bring snacks.', time: '9:12', outgoing: true, type: 'text', read: true },
      { id: 3, text: 'David: Awesome, see you at 9!', time: '9:15', outgoing: false, type: 'text' },
    ]
  },
  {
    id: 3, name: 'Alice', avatar: 'A', color: 'from-pink-400 to-pink-500',
    status: 'online', statusColor: '#4DCA65', time: 'Yesterday', unread: null,
    messages: [
      { id: 1, text: 'Hi there! Did you get a chance to look at the project files?', time: '10:20', outgoing: false, type: 'text' },
      { id: 2, text: 'Yes, I just finished reviewing them. Looking good so far!', time: '10:25', outgoing: true, type: 'text', read: true },
      { id: 3, text: 'Here is the mockup for the new dashboard.', time: '10:26', outgoing: false, type: 'image' },
      { id: 4, text: '', time: '10:30', outgoing: true, type: 'voice', read: true },
      { id: 5, text: 'Awesome, let me know if you need any changes.', time: '10:32', outgoing: false, type: 'text' },
      { id: 6, text: 'I sent you the documents you requested. Check your email too!', time: '10:45', outgoing: false, type: 'text' },
    ]
  },
  {
    id: 4, name: 'Bob Smith', avatar: 'B', color: 'from-green-400 to-green-600',
    status: 'last seen 2 hours ago', statusColor: '#8E8E93', time: 'Yesterday', unread: null,
    messages: [
      { id: 1, text: 'Hey, are you free tomorrow for a quick call?', time: '14:00', outgoing: true, type: 'text', read: true },
      { id: 2, text: 'Sure! What time works for you?', time: '14:05', outgoing: false, type: 'text' },
      { id: 3, text: 'How about 3 PM?', time: '14:07', outgoing: true, type: 'text', read: true },
      { id: 4, text: 'Sounds good to me! See you then.', time: '14:10', outgoing: false, type: 'text' },
    ]
  },
  {
    id: 5, name: 'Work Team', avatar: 'W', color: 'from-orange-400 to-orange-500',
    status: '8 members', statusColor: '#8E8E93', time: 'Mon', unread: 12,
    messages: [
      { id: 1, text: 'Please review the latest PRs before EOD.', time: '9:00', outgoing: false, type: 'text' },
      { id: 2, text: 'On it!', time: '9:05', outgoing: true, type: 'text', read: true },
      { id: 3, text: 'Sarah: The new design looks great, nice work everyone!', time: '9:20', outgoing: false, type: 'text' },
      { id: 4, text: 'Mike: Can we schedule a standup for tomorrow?', time: '9:35', outgoing: false, type: 'text' },
      { id: 5, text: 'Sure, 10 AM works for me.', time: '9:40', outgoing: true, type: 'text', read: false },
    ]
  },
  {
    id: 6, name: 'Durov', avatar: 'D', color: 'from-blue-500 to-blue-700',
    status: 'last seen recently', statusColor: '#8E8E93', time: 'Mon', unread: null,
    messages: [
      { id: 1, text: 'New features coming soon. Stay tuned!', time: '11:00', outgoing: false, type: 'text' },
    ]
  },
  {
    id: 7, name: 'News Channel', avatar: 'NC', color: 'from-red-400 to-red-600',
    status: 'channel', statusColor: '#8E8E93', time: 'Sun', unread: 1, muted: true,
    messages: [
      { id: 1, text: 'Market updates for this week: Tech stocks rally after positive earnings.', time: '8:00', outgoing: false, type: 'text' },
    ]
  },
  {
    id: 8, name: 'Mom', avatar: 'M', color: 'from-yellow-400 to-yellow-600',
    status: 'last seen yesterday', statusColor: '#8E8E93', time: 'Sun', unread: null,
    messages: [
      { id: 1, text: 'Are you coming for dinner on Sunday?', time: '18:00', outgoing: false, type: 'text' },
      { id: 2, text: 'Yes, I will be there at 7!', time: '18:05', outgoing: true, type: 'text', read: true },
      { id: 3, text: 'Call me when you get home.', time: '22:30', outgoing: false, type: 'text' },
    ]
  },
];

export function DesktopMain() {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState<number>(3);
  const [inputText, setInputText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; msgId: number } | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [searchMsg, setSearchMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId)!;

  const filteredChats = chats.filter(c =>
    c.name.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatId, activeChat?.messages.length]);

  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;

    const newMsg: Message = {
      id: Date.now(),
      text,
      time: now(),
      outgoing: true,
      type: 'text',
      read: false,
      replyTo: replyTo?.id,
    };

    setChats(prev => prev.map(c => {
      if (c.id !== activeChatId) return c;
      return { ...c, time: now(), messages: [...c.messages, newMsg] };
    }));
    setInputText('');
    setReplyTo(null);
    inputRef.current?.focus();

    // Simulate reply after 1.5s
    setTimeout(() => {
      const replies = [
        'Got it, thanks!',
        'Sure, sounds good.',
        'I will check that out.',
        'Thanks for letting me know!',
        'OK!',
        'On it.',
        'Will do!',
        'Perfect, thank you.',
      ];
      const reply: Message = {
        id: Date.now() + 1,
        text: replies[Math.floor(Math.random() * replies.length)],
        time: now(),
        outgoing: false,
        type: 'text',
      };
      setChats(prev => prev.map(c =>
        c.id === activeChatId ? { ...c, messages: [...c.messages, reply] } : c
      ));
    }, 1500);
  }, [inputText, activeChatId, replyTo]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleContextMenu = (e: React.MouseEvent, msgId: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, msgId });
  };

  const deleteMessage = (msgId: number) => {
    setChats(prev => prev.map(c =>
      c.id === activeChatId
        ? { ...c, messages: c.messages.filter(m => m.id !== msgId) }
        : c
    ));
    setContextMenu(null);
  };

  const replyToMessage = (msgId: number) => {
    const msg = activeChat.messages.find(m => m.id === msgId);
    if (msg) setReplyTo(msg);
    setContextMenu(null);
    inputRef.current?.focus();
  };

  const openChat = (id: number) => {
    setActiveChatId(id);
    setChats(prev => prev.map(c => c.id === id ? { ...c, unread: null } : c));
    setContextMenu(null);
    setReplyTo(null);
  };

  const msgSearch = searchMsg.toLowerCase();
  const filteredMessages = searchMsg
    ? activeChat.messages.filter(m => m.text.toLowerCase().includes(msgSearch))
    : activeChat.messages;

  return (
    <div
      style={{ width: '1280px', height: '800px', display: 'flex', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}
      onClick={() => setContextMenu(null)}
    >
      {/* Column 1 - Icon Nav */}
      <div className="w-[72px] shrink-0 bg-[#17212B] flex flex-col items-center py-4 justify-between">
        <div className="flex flex-col items-center w-full gap-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-5 text-white mt-1">
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </div>
          {[
            { icon: MessageCircle, label: 'Chats', active: true },
            { icon: Phone, label: 'Calls', active: false },
            { icon: Users, label: 'Contacts', active: false },
            { icon: Bookmark, label: 'Saved', active: false },
            { icon: Settings, label: 'Settings', active: false },
          ].map(({ icon: Icon, active }, idx) => (
            <div key={idx} className="w-full flex justify-center py-3 relative group cursor-pointer">
              {active && <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#2481CC] rounded-r-full" />}
              <Icon className={`w-6 h-6 transition-colors ${active ? 'text-[#2481CC]' : 'text-[#8E8E93] group-hover:text-white'}`} />
            </div>
          ))}
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer">
          JD
        </div>
      </div>

      {/* Column 2 - Chat List */}
      <div className="w-[340px] shrink-0 bg-white border-r border-[#EDEDED] flex flex-col">
        <div className="h-[56px] flex items-center justify-between px-4 shrink-0">
          <h1 className="font-semibold text-[16px] text-[#1C1C1E]">Telegram</h1>
          <div className="flex items-center gap-4 text-[#8E8E93]">
            <Search className="w-5 h-5 cursor-pointer hover:text-[#1C1C1E] transition-colors" onClick={() => setShowSearch(s => !s)} />
            <Edit3 className="w-5 h-5 cursor-pointer hover:text-[#1C1C1E] transition-colors" />
          </div>
        </div>

        <div className="px-3 pb-2 shrink-0">
          <div className="bg-[#F1F1F1] rounded-full h-8 flex items-center px-3 gap-2">
            <Search className="w-4 h-4 text-[#8E8E93] shrink-0" />
            <input
              type="text"
              placeholder="Search"
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              className="bg-transparent border-none outline-none text-[14px] w-full text-[#1C1C1E] placeholder:text-[#8E8E93]"
            />
            {searchText && (
              <X className="w-4 h-4 text-[#8E8E93] cursor-pointer shrink-0" onClick={() => setSearchText('')} />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map(chat => (
            <div
              key={chat.id}
              onClick={() => openChat(chat.id)}
              className={`flex items-center px-3 py-[6px] cursor-pointer transition-colors ${chat.id === activeChatId ? 'bg-[#2481CC]' : 'hover:bg-[#F5F5F5]'}`}
            >
              <div className="relative shrink-0 mr-3">
                <div className={`w-[46px] h-[46px] rounded-full bg-gradient-to-br ${chat.color} flex items-center justify-center text-white font-semibold text-[15px]`}>
                  {chat.avatar}
                </div>
                {chat.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#4DCA65] border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0 border-b border-[#EDEDED] pb-[10px] pt-[4px]" style={{ borderColor: chat.id === activeChatId ? 'transparent' : undefined }}>
                <div className="flex justify-between items-baseline mb-[2px]">
                  <h3 className={`font-semibold text-[15px] truncate pr-2 ${chat.id === activeChatId ? 'text-white' : 'text-[#1C1C1E]'}`}>{chat.name}</h3>
                  <span className={`text-[12px] whitespace-nowrap shrink-0 ${chat.id === activeChatId ? 'text-blue-100' : 'text-[#8E8E93]'}`}>{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-[13px] truncate pr-2 ${chat.id === activeChatId ? 'text-blue-100' : 'text-[#8E8E93]'}`}>
                    {chat.messages.at(-1)?.type === 'image' ? 'Photo' : chat.messages.at(-1)?.type === 'voice' ? 'Voice message' : chat.messages.at(-1)?.text}
                  </p>
                  <div className="flex items-center gap-1 shrink-0">
                    {chat.muted && <BellOff className="w-3 h-3 text-[#8E8E93]" />}
                    {chat.unread ? (
                      <div className={`text-white text-[12px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${chat.muted ? 'bg-[#8E8E93]' : 'bg-[#2481CC]'} ${chat.id === activeChatId ? 'bg-white !text-[#2481CC]' : ''}`}>
                        {chat.unread}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredChats.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-[#8E8E93] text-[14px]">
              <Search className="w-10 h-10 mb-3 opacity-30" />
              No chats found
            </div>
          )}
        </div>
      </div>

      {/* Column 3 - Chat View */}
      <div className="flex-1 bg-[#F0F2F5] flex flex-col relative min-w-0">
        {/* Chat Header */}
        <div className="h-[56px] bg-white border-b border-[#EDEDED] flex items-center justify-between px-5 shrink-0 shadow-sm z-10">
          <div className="flex flex-col">
            <h2 className="font-semibold text-[15px] text-[#1C1C1E] leading-tight">{activeChat.name}</h2>
            <span className="text-[13px] leading-tight" style={{ color: activeChat.statusColor }}>{activeChat.status}</span>
          </div>
          <div className="flex items-center gap-5 text-[#8E8E93]">
            {showSearch && (
              <input
                autoFocus
                type="text"
                placeholder="Search messages..."
                value={searchMsg}
                onChange={e => setSearchMsg(e.target.value)}
                className="border border-[#EDEDED] rounded-full px-3 py-1 text-[14px] outline-none focus:border-[#2481CC] transition-colors text-[#1C1C1E]"
              />
            )}
            <Search
              className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors"
              onClick={e => { e.stopPropagation(); setShowSearch(s => !s); if (showSearch) setSearchMsg(''); }}
            />
            <Phone className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors" />
            <Video className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors" />
            <MoreHorizontal className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors" />
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-[6px]">
          <div className="flex justify-center mb-2">
            <div className="bg-white/70 text-[#1C1C1E] text-[12px] font-medium px-3 py-1 rounded-full shadow-sm">
              Today
            </div>
          </div>

          {filteredMessages.map(msg => {
            const replyMsg = msg.replyTo ? activeChat.messages.find(m => m.id === msg.replyTo) : null;
            const highlighted = searchMsg && msg.text.toLowerCase().includes(searchMsg.toLowerCase());

            return (
              <div
                key={msg.id}
                className={`flex w-full ${msg.outgoing ? 'justify-end' : 'justify-start'} group`}
                onContextMenu={e => handleContextMenu(e, msg.id)}
              >
                <div className="relative max-w-[65%]">
                  {/* Hover actions */}
                  <div className={`absolute top-1/2 -translate-y-1/2 ${msg.outgoing ? '-left-16' : '-right-16'} hidden group-hover:flex items-center gap-1 z-10`}>
                    <button
                      onClick={() => replyToMessage(msg.id)}
                      className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-[#E8F4FF] transition-colors"
                    >
                      <Reply className="w-3.5 h-3.5 text-[#8E8E93]" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleContextMenu(e as any, msg.id); }}
                      className="w-7 h-7 rounded-full bg-white shadow flex items-center justify-center hover:bg-[#E8F4FF] transition-colors"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5 text-[#8E8E93]" />
                    </button>
                  </div>

                  {/* Bubble */}
                  {msg.type === 'text' && (
                    <div
                      className={`rounded-2xl px-4 py-2 shadow-sm relative transition-all ${
                        msg.outgoing
                          ? 'bg-[#2481CC] rounded-br-sm text-white'
                          : 'bg-white rounded-bl-sm text-[#1C1C1E]'
                      } ${highlighted ? 'ring-2 ring-yellow-400' : ''}`}
                    >
                      {replyMsg && (
                        <div className={`text-[12px] mb-2 pl-2 border-l-2 ${msg.outgoing ? 'border-blue-200 text-blue-100' : 'border-[#2481CC] text-[#2481CC]'} opacity-80`}>
                          <div className="font-semibold">{replyMsg.outgoing ? 'You' : activeChat.name}</div>
                          <div className="truncate">{replyMsg.type === 'text' ? replyMsg.text : replyMsg.type === 'image' ? 'Photo' : 'Voice message'}</div>
                        </div>
                      )}
                      <p className={`text-[15px] leading-relaxed pr-16 ${msg.outgoing ? 'text-white' : 'text-[#1C1C1E]'}`}>{msg.text}</p>
                      <div className={`absolute bottom-1.5 right-2 flex items-center gap-1 ${msg.outgoing ? 'text-blue-100' : 'text-[#8E8E93]'}`}>
                        <span className="text-[11px]">{msg.time}</span>
                        {msg.outgoing && <CheckCheck className={`w-4 h-4 ${msg.read ? 'text-blue-200' : 'text-blue-200/60'}`} />}
                      </div>
                    </div>
                  )}

                  {msg.type === 'image' && (
                    <div className="bg-white rounded-2xl rounded-bl-sm shadow-sm overflow-hidden">
                      <div className="w-[220px] h-[155px] bg-gradient-to-tr from-purple-400 to-pink-400 flex items-center justify-center text-white text-[13px] font-medium">
                        Photo
                      </div>
                      <div className="px-3 py-2 relative">
                        <p className="text-[15px] text-[#1C1C1E] pr-14">Here is the mockup for the new dashboard.</p>
                        <span className="absolute bottom-2 right-3 text-[11px] text-[#8E8E93]">{msg.time}</span>
                      </div>
                    </div>
                  )}

                  {msg.type === 'voice' && (
                    <div className="bg-[#2481CC] rounded-2xl rounded-br-sm px-3 py-2.5 shadow-sm min-w-[220px]">
                      <div className="flex items-center gap-3 pr-14">
                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform">
                          <Play className="w-4 h-4 ml-0.5 text-[#2481CC]" />
                        </div>
                        <div className="flex-1 flex gap-[2px] items-center h-7">
                          {[3,5,8,6,10,7,4,9,6,8,5,7,9,4,6,8,5,7,6,4].map((h, i) => (
                            <div key={i} className="w-[3px] bg-blue-200 rounded-full" style={{ height: `${h * 9}%` }} />
                          ))}
                        </div>
                        <span className="text-[12px] text-blue-100 shrink-0">0:12</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-100 mt-1 justify-end">
                        <span className="text-[11px]">{msg.time}</span>
                        <CheckCheck className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {searchMsg && filteredMessages.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 text-[#8E8E93] text-[14px]">
              <Search className="w-10 h-10 mb-3 opacity-30" />
              No messages found for "{searchMsg}"
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Reply banner */}
        {replyTo && (
          <div className="bg-white border-t border-[#EDEDED] px-4 py-2 flex items-center gap-3 shrink-0">
            <div className="w-1 h-8 bg-[#2481CC] rounded-full shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-[#2481CC]">Reply to {replyTo.outgoing ? 'Yourself' : activeChat.name}</div>
              <div className="text-[13px] text-[#8E8E93] truncate">
                {replyTo.type === 'text' ? replyTo.text : replyTo.type === 'image' ? 'Photo' : 'Voice message'}
              </div>
            </div>
            <button onClick={() => setReplyTo(null)} className="text-[#8E8E93] hover:text-[#1C1C1E] transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white px-4 py-3 flex items-center gap-3 shrink-0 border-t border-[#EDEDED]">
          <button className="text-[#8E8E93] hover:text-[#2481CC] transition-colors shrink-0">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1 bg-[#F1F1F1] rounded-2xl flex items-center px-4 h-10 gap-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Write a message..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#1C1C1E] placeholder:text-[#8E8E93]"
            />
            <button className="text-[#8E8E93] hover:text-[#2481CC] transition-colors shrink-0">
              <Smile className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={sendMessage}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
              inputText.trim()
                ? 'bg-[#2481CC] hover:bg-[#1f73b8] scale-100'
                : 'bg-[#8E8E93] cursor-default scale-95'
            }`}
          >
            {inputText.trim() ? (
              <Send className="w-4 h-4 text-white ml-0.5" />
            ) : (
              <Mic className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-xl shadow-2xl py-1 z-50 min-w-[180px] border border-[#EDEDED] overflow-hidden"
          style={{ left: Math.min(contextMenu.x, 1160), top: Math.min(contextMenu.y, 680) }}
          onClick={e => e.stopPropagation()}
        >
          {[
            { icon: Reply, label: 'Reply', action: () => replyToMessage(contextMenu.msgId) },
            { icon: Copy, label: 'Copy text', action: () => { const m = activeChat.messages.find(x => x.id === contextMenu.msgId); if (m) navigator.clipboard?.writeText(m.text); setContextMenu(null); } },
            { icon: Forward, label: 'Forward', action: () => setContextMenu(null) },
            { icon: Pin, label: 'Pin message', action: () => setContextMenu(null) },
            { icon: Star, label: 'Save to Saved', action: () => setContextMenu(null) },
            { icon: Trash2, label: 'Delete', action: () => deleteMessage(contextMenu.msgId), danger: true },
          ].map(({ icon: Icon, label, action, danger }) => (
            <button
              key={label}
              onClick={action}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-[14px] hover:bg-[#F5F5F5] transition-colors text-left ${danger ? 'text-[#EF4444]' : 'text-[#1C1C1E]'}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
