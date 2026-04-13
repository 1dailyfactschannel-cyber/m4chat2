import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle, Phone, Bookmark, Settings, Users, Search, Edit3,
  Video, MoreHorizontal, Paperclip, Smile, Send, CheckCheck, Play,
  X, Reply, Trash2, Copy, Forward, Pin, Mic, BellOff, Star,
  Moon, Sun, Image, Info, Hash, Check, Camera,
  MicOff, VideoOff, PhoneOff, Volume2, VolumeX, ZoomIn, ZoomOut,
  ChevronDown, Slash, AtSign, Type, ArrowDown,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type Reaction = { emoji: string; count: number; mine: boolean };
type Message = {
  id: number; text: string; time: string; outgoing: boolean;
  type: 'text' | 'image' | 'voice'; read?: boolean;
  replyTo?: number; edited?: boolean; reactions?: Reaction[];
  gradient?: string;
};
type Chat = {
  id: number; name: string; avatar: string; color: string;
  status: string; statusColor: string; time: string;
  unread: number | null; muted?: boolean; folder?: string;
  bio?: string; phone?: string; username?: string;
  pinnedMsgId?: number; members?: string[];
  messages: Message[];
};
type Toast = { id: number; chatName: string; text: string; avatar: string; color: string };

// ─── Constants ────────────────────────────────────────────────────────────────
const now = () => { const d = new Date(); return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}`; };
const QUICK_REACTIONS = ['❤️','👍','😂','😮','😢','🔥','👏','🎉'];
const EMOJI_GRID = [
  '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩',
  '😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐',
  '😐','😑','😶','😏','😒','🙄','😬','🤥','😔','😪','🤤','😴','😷','🤒','🤕','🤢',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖',
  '👍','👎','👊','✊','🤛','🤜','🤞','✌️','🤟','🤘','🤙','👌','🤌','🤏','👈','👉',
  '🔥','⭐','💫','✨','🎉','🎊','🎈','🎁','🏆','🥇','🎯','🚀','💡','💎','🌈','❄️',
];
const CHAT_BACKGROUNDS = [
  { id:'default', label:'Default', style:{ backgroundColor:'#F0F2F5' } },
  { id:'pattern', label:'Pattern', style:{ backgroundColor:'#dfe6e9', backgroundImage:'radial-gradient(#00000012 1px,transparent 1px)', backgroundSize:'20px 20px' } },
  { id:'gradient', label:'Gradient', style:{ background:'linear-gradient(135deg,#667eea,#764ba2)' } },
  { id:'nature', label:'Nature', style:{ background:'linear-gradient(135deg,#56ab2f,#a8e063)' } },
  { id:'dark', label:'Dark', style:{ backgroundColor:'#1a1a2e' } },
];
const BOT_COMMANDS = ['/start','  Start the bot','/help','  Show help','/settings','  Open settings','/mute','  Mute notifications','/unmute','  Unmute','/info','  Show bot info'];
const FOLDERS = ['All','Personal','Work','Unread'] as const;
const AUTO_REPLIES = ['Got it, thanks!','Sure, sounds good.','I will check that out.','Thanks for letting me know!','On it.','Will do!','Perfect, thanks.','Interesting!','Makes sense!','I agree.'];
const GRADIENTS = ['from-purple-400 to-pink-400','from-blue-400 to-cyan-400','from-green-400 to-teal-400','from-orange-400 to-red-400','from-indigo-400 to-purple-400','from-yellow-400 to-orange-400'];

const INITIAL_CHATS: Chat[] = [
  { id:1, name:'Telegram', avatar:'T', color:'from-blue-400 to-blue-500', status:'bot', statusColor:'#8E8E93', time:'10:42', unread:null, folder:'personal', bio:'Official Telegram notifications.', phone:'', username:'@telegram',
    messages:[{id:1,text:'Welcome to Telegram!',time:'10:40',outgoing:false,type:'text'},{id:2,text:'Your account has been successfully set up.',time:'10:42',outgoing:false,type:'text'}]},
  { id:2, name:'Night Owl Club', avatar:'N', color:'from-purple-400 to-purple-600', status:'14 members', statusColor:'#8E8E93', time:'9:15', unread:3, folder:'personal', bio:'We stay up late and code things.', username:'@nightowls', members:['Alice','Bob','David','Sarah','Mike'],
    messages:[{id:1,text:'Are we still on for tonight?',time:'9:10',outgoing:false,type:'text'},{id:2,text:'Yes! I will bring snacks.',time:'9:12',outgoing:true,type:'text',read:true},{id:3,text:'David: Awesome, see you at 9!',time:'9:15',outgoing:false,type:'text'}]},
  { id:3, name:'Alice', avatar:'A', color:'from-pink-400 to-pink-500', status:'online', statusColor:'#4DCA65', time:'Yesterday', unread:null, folder:'personal', bio:'Designer & coffee lover. Always looking for new inspiration.', phone:'+1 (555) 234-5678', username:'@alicejohnson', pinnedMsgId:3,
    messages:[
      {id:1,text:'Hi there! Did you get a chance to look at the project files?',time:'10:20',outgoing:false,type:'text'},
      {id:2,text:'Yes, I just finished reviewing them. Looking good so far!',time:'10:25',outgoing:true,type:'text',read:true},
      {id:3,text:'Here is the mockup for the new dashboard.',time:'10:26',outgoing:false,type:'image',gradient:'from-purple-400 to-pink-400'},
      {id:4,text:'',time:'10:30',outgoing:true,type:'voice',read:true},
      {id:5,text:'Awesome, let me know if you need any changes.',time:'10:32',outgoing:false,type:'text',reactions:[{emoji:'❤️',count:1,mine:true}]},
      {id:6,text:'I sent you the documents you requested. Check your email too!',time:'10:45',outgoing:false,type:'text'},
    ]},
  { id:4, name:'Bob Smith', avatar:'B', color:'from-green-400 to-green-600', status:'last seen 2h ago', statusColor:'#8E8E93', time:'Yesterday', unread:null, folder:'personal', bio:'Software engineer. Coffee addict.', phone:'+1 (555) 345-6789', username:'@bobsmith',
    messages:[{id:1,text:'Hey, are you free tomorrow?',time:'14:00',outgoing:true,type:'text',read:true},{id:2,text:'Sure! What time?',time:'14:05',outgoing:false,type:'text'},{id:3,text:'How about 3 PM?',time:'14:07',outgoing:true,type:'text',read:true},{id:4,text:'Sounds good!',time:'14:10',outgoing:false,type:'text'}]},
  { id:5, name:'Work Team', avatar:'W', color:'from-orange-400 to-orange-500', status:'8 members', statusColor:'#8E8E93', time:'Mon', unread:12, folder:'work', bio:'Our product team.', username:'@workteam', members:['Alice','Bob','Sarah','Mike','Dan','Kate'],
    messages:[{id:1,text:'Please review the latest PRs before EOD.',time:'9:00',outgoing:false,type:'text'},{id:2,text:'On it!',time:'9:05',outgoing:true,type:'text',read:true},{id:3,text:'Sarah: The new design looks great!',time:'9:20',outgoing:false,type:'text'},{id:4,text:'Mike: Can we schedule a standup?',time:'9:35',outgoing:false,type:'text'},{id:5,text:'Sure, 10 AM works.',time:'9:40',outgoing:true,type:'text',read:false}]},
  { id:6, name:'Mom', avatar:'M', color:'from-yellow-400 to-yellow-600', status:'last seen yesterday', statusColor:'#8E8E93', time:'Sun', unread:null, folder:'personal', phone:'+1 (555) 567-8901',
    messages:[{id:1,text:'Are you coming for dinner Sunday?',time:'18:00',outgoing:false,type:'text'},{id:2,text:'Yes, I will be there at 7!',time:'18:05',outgoing:true,type:'text',read:true},{id:3,text:'Call me when you get home.',time:'22:30',outgoing:false,type:'text'}]},
];

// ─── Component ────────────────────────────────────────────────────────────────
export function DesktopMain() {
  // Core state
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState(3);
  const [inputText, setInputText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchMsg, setSearchMsg] = useState('');
  const [contextMenu, setContextMenu] = useState<{x:number;y:number;msgId:number}|null>(null);
  const [replyTo, setReplyTo] = useState<Message|null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [chatBgId, setChatBgId] = useState('default');
  const [showProfile, setShowProfile] = useState(false);
  const [forwardMsgId, setForwardMsgId] = useState<number|null>(null);
  const [editingMsgId, setEditingMsgId] = useState<number|null>(null);
  const [editText, setEditText] = useState('');
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  // New features
  const [callState, setCallState] = useState<{type:'audio'|'video';status:'ringing'|'active';seconds:number}|null>(null);
  const [lightbox, setLightbox] = useState<{gradient:string}|null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeFolder, setActiveFolder] = useState<typeof FOLDERS[number]>('All');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [unreadBelow, setUnreadBelow] = useState(0);
  const [suggestions, setSuggestions] = useState<{type:'command'|'mention';items:string[]}|null>(null);
  const [readReceiptMsg, setReadReceiptMsg] = useState<number|null>(null);
  const [fontSize, setFontSize] = useState(15);
  const [showFontSlider, setShowFontSlider] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval>|null>(null);

  const d = darkMode;
  const activeChat = chats.find(c => c.id === activeChatId)!;
  const pinnedMsg = activeChat.pinnedMsgId ? activeChat.messages.find(m => m.id === activeChat.pinnedMsgId) : null;
  const isGroup = !!activeChat.members;

  const folderChats = chats.filter(c => {
    if (searchText) return c.name.toLowerCase().includes(searchText.toLowerCase());
    if (activeFolder === 'Personal') return c.folder === 'personal';
    if (activeFolder === 'Work') return c.folder === 'work';
    if (activeFolder === 'Unread') return (c.unread ?? 0) > 0;
    return true;
  });
  const filteredMessages = searchMsg ? activeChat.messages.filter(m => m.text.toLowerCase().includes(searchMsg.toLowerCase())) : activeChat.messages;

  const chatBgStyle = CHAT_BACKGROUNDS.find(b => b.id === chatBgId)?.style ?? {};
  const isDarkBg = chatBgId === 'dark' || chatBgId === 'gradient' || chatBgId === 'nature';

  // Themes
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
    divider: d ? '#30363d' : '#EDEDED',
  };

  // Scroll to bottom
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }); }, [activeChatId, activeChat?.messages.length]);
  useEffect(() => { if (editingMsgId) editInputRef.current?.focus(); }, [editingMsgId]);

  // Scroll detection
  const handleScroll = () => {
    const el = messagesScrollRef.current; if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
  };

  // Call timer
  useEffect(() => {
    if (callState?.status === 'active') {
      callTimerRef.current = setInterval(() => setCallState(s => s ? {...s, seconds: s.seconds+1} : null), 1000);
    } else { if (callTimerRef.current) clearInterval(callTimerRef.current); }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [callState?.status]);

  // Recording timer
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => setRecordingSeconds(s => s+1), 1000);
    } else { if (recordingTimerRef.current) clearInterval(recordingTimerRef.current); setRecordingSeconds(0); }
    return () => { if (recordingTimerRef.current) clearInterval(recordingTimerRef.current); };
  }, [isRecording]);

  const fmtTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;

  // Input suggestions
  const handleInputChange = (val: string) => {
    setInputText(val);
    if (val.startsWith('/') && val.length >= 1) {
      const cmds = ['/start','/help','/settings','/mute','/unmute','/info'].filter(c => c.startsWith(val));
      setSuggestions(cmds.length ? {type:'command', items:cmds} : null);
    } else if (val.includes('@') && isGroup) {
      const q = val.split('@').pop()?.toLowerCase() ?? '';
      const members = (activeChat.members||[]).filter(m => m.toLowerCase().startsWith(q) && q.length > 0);
      setSuggestions(members.length ? {type:'mention', items:members} : null);
    } else setSuggestions(null);
  };

  // Send message
  const sendMessage = useCallback(() => {
    const text = inputText.trim(); if (!text) return;
    const newMsg: Message = { id:Date.now(), text, time:now(), outgoing:true, type:'text', read:false, replyTo:replyTo?.id };
    setChats(prev => prev.map(c => c.id !== activeChatId ? c : { ...c, time:now(), messages:[...c.messages, newMsg] }));
    setInputText(''); setReplyTo(null); setShowEmojiPanel(false); setSuggestions(null);
    inputRef.current?.focus();
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = { id:Date.now()+1, text:AUTO_REPLIES[Math.floor(Math.random()*AUTO_REPLIES.length)], time:now(), outgoing:false, type:'text' };
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages:[...c.messages, reply] } : c));
      // Occasionally show toast from a different chat
      if (Math.random() > 0.5) {
        const others = chats.filter(c => c.id !== activeChatId);
        const rnd = others[Math.floor(Math.random()*others.length)];
        if (rnd) {
          const toast: Toast = { id:Date.now()+2, chatName:rnd.name, text:AUTO_REPLIES[Math.floor(Math.random()*AUTO_REPLIES.length)], avatar:rnd.avatar, color:rnd.color };
          setToasts(prev => [...prev, toast]);
          setTimeout(() => setToasts(prev => prev.filter(t => t.id !== toast.id)), 4000);
        }
      }
    }, 2000);
  }, [inputText, activeChatId, replyTo, chats]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === 'Escape') { setReplyTo(null); setShowEmojiPanel(false); setSuggestions(null); }
  };

  const sendVoice = () => {
    setIsRecording(false);
    const msg: Message = { id:Date.now(), text:'', time:now(), outgoing:true, type:'voice', read:false };
    setChats(prev => prev.map(c => c.id !== activeChatId ? c : { ...c, messages:[...c.messages, msg] }));
  };

  const saveEdit = () => {
    if (!editingMsgId) return;
    setChats(prev => prev.map(c => c.id !== activeChatId ? c : { ...c, messages:c.messages.map(m => m.id === editingMsgId ? {...m, text:editText, edited:true} : m) }));
    setEditingMsgId(null); setEditText('');
  };

  const addReaction = (msgId: number, emoji: string) => {
    setChats(prev => prev.map(c => { if (c.id !== activeChatId) return c;
      return { ...c, messages:c.messages.map(m => { if (m.id !== msgId) return m;
        const ex = (m.reactions||[]).find(r => r.emoji===emoji);
        let reactions: Reaction[];
        if (ex) reactions = ex.mine ? (m.reactions||[]).filter(r=>r.emoji!==emoji) : (m.reactions||[]).map(r=>r.emoji===emoji?{...r,count:r.count+1,mine:true}:r);
        else reactions = [...(m.reactions||[]), {emoji,count:1,mine:true}];
        return {...m,reactions};
      })};
    }));
    setReadReceiptMsg(null);
  };

  const deleteMessage = (msgId: number) => { setChats(prev => prev.map(c => c.id!==activeChatId?c:{...c,messages:c.messages.filter(m=>m.id!==msgId)})); setContextMenu(null); };
  const pinMessage = (msgId: number) => { setChats(prev => prev.map(c => c.id!==activeChatId?c:{...c,pinnedMsgId:c.pinnedMsgId===msgId?undefined:msgId})); setContextMenu(null); };
  const openChat = (id: number) => { setActiveChatId(id); setChats(prev=>prev.map(c=>c.id===id?{...c,unread:null}:c)); setContextMenu(null); setReplyTo(null); setShowProfile(false); setEditingMsgId(null); setShowEmojiPanel(false); setSuggestions(null); };
  const handleContextMenu = (e: React.MouseEvent, msgId: number) => { e.preventDefault(); setContextMenu({x:Math.min(e.clientX,1060),y:Math.min(e.clientY,650),msgId}); };
  const closeAll = () => { setContextMenu(null); setShowEmojiPanel(false); setSuggestions(null); setShowBgPicker(false); setShowFontSlider(false); setReadReceiptMsg(null); };

  const startCall = (type:'audio'|'video') => { setCallState({type,status:'ringing',seconds:0}); setTimeout(()=>setCallState(s=>s?{...s,status:'active'}:null),2000); };

  return (
    <div style={{width:'1280px',height:'800px',display:'flex',overflow:'hidden',fontFamily:'Inter,system-ui,sans-serif',position:'relative'}} onClick={closeAll}>

      {/* ── Column 1: Nav ── */}
      <div className="w-[68px] shrink-0 flex flex-col items-center py-3 justify-between" style={{background:bg.nav}}>
        <div className="flex flex-col items-center w-full gap-0.5">
          <div className="w-9 h-9 flex items-center justify-center mb-4 mt-1">
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </div>
          {([{icon:MessageCircle,active:true},{icon:Phone,active:false},{icon:Users,active:false},{icon:Bookmark,active:false},{icon:Settings,active:false}] as const).map(({icon:Icon,active},idx)=>(
            <div key={idx} className="w-full flex justify-center py-3 relative group cursor-pointer">
              {active && <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#2481CC] rounded-r-full"/>}
              <Icon className={`w-6 h-6 transition-colors ${active?'text-[#2481CC]':'text-[#8E8E93] group-hover:text-white'}`}/>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center gap-2 mb-1">
          <button onClick={e=>{e.stopPropagation();setDarkMode(m=>!m);}} className="w-8 h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors" title="Toggle dark mode">
            {d?<Sun className="w-4 h-4"/>:<Moon className="w-4 h-4"/>}
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer">JD</div>
        </div>
      </div>

      {/* ── Column 2: Chat List ── */}
      <div className="w-[300px] shrink-0 flex flex-col" style={{background:bg.panel,borderRight:`1px solid ${bg.panelBorder}`}}>
        <div className="h-[52px] flex items-center justify-between px-4 shrink-0" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
          <h1 className="font-semibold text-[16px]" style={{color:bg.text}}>Telegram</h1>
          <div className="flex items-center gap-3" style={{color:bg.textSec}}>
            <Search className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors"/>
            <Edit3 className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors"/>
          </div>
        </div>
        {/* Folder Tabs */}
        <div className="flex shrink-0 overflow-x-auto" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
          {FOLDERS.map(f => (
            <button key={f} onClick={()=>setActiveFolder(f)}
              className={`px-3 py-2 text-[13px] font-medium whitespace-nowrap transition-colors relative`}
              style={{color:activeFolder===f?'#2481CC':bg.textSec}}>
              {f}
              {activeFolder===f && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2481CC] rounded-t"/>}
              {f==='Unread' && chats.filter(c=>(c.unread??0)>0).length>0 && (
                <span className="ml-1 bg-[#2481CC] text-white text-[10px] px-1 rounded-full">{chats.filter(c=>(c.unread??0)>0).length}</span>
              )}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="px-3 py-2 shrink-0">
          <div className="rounded-full h-8 flex items-center px-3 gap-2" style={{background:bg.inputField}}>
            <Search className="w-4 h-4 shrink-0" style={{color:bg.textSec}}/>
            <input type="text" placeholder="Search" value={searchText} onChange={e=>setSearchText(e.target.value)} className="bg-transparent border-none outline-none text-[13px] w-full" style={{color:bg.text}}/>
            {searchText && <X className="w-4 h-4 cursor-pointer shrink-0" style={{color:bg.textSec}} onClick={()=>setSearchText('')}/>}
          </div>
        </div>
        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {folderChats.length===0 && (
            <div className="flex flex-col items-center py-10 gap-2" style={{color:bg.textSec}}>
              <Search className="w-8 h-8 opacity-30"/><span className="text-[13px]">No chats</span>
            </div>
          )}
          {folderChats.map(chat => {
            const isActive = chat.id === activeChatId;
            const lastMsg = chat.messages.at(-1);
            return (
              <div key={chat.id} onClick={()=>openChat(chat.id)}
                className="flex items-center px-3 py-[5px] cursor-pointer transition-colors"
                style={{background:isActive?'#2481CC':'transparent'}}
                onMouseEnter={e=>{if(!isActive)(e.currentTarget as HTMLDivElement).style.background=bg.panelHover;}}
                onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background=isActive?'#2481CC':'transparent';}}>
                <div className="relative shrink-0 mr-2.5">
                  <div className={`w-[42px] h-[42px] rounded-full bg-gradient-to-br ${chat.color} flex items-center justify-center text-white font-semibold text-[13px]`}>{chat.avatar}</div>
                  {chat.status==='online' && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#4DCA65] border-2 border-white"/>}
                </div>
                <div className="flex-1 min-w-0 py-1" style={{borderBottom:isActive?'none':`1px solid ${bg.panelBorder}`}}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-semibold text-[14px] truncate pr-1" style={{color:isActive?'white':bg.text}}>{chat.name}</h3>
                    <span className="text-[11px] whitespace-nowrap shrink-0" style={{color:isActive?'rgba(255,255,255,0.7)':bg.textSec}}>{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[12px] truncate pr-1" style={{color:isActive?'rgba(255,255,255,0.75)':bg.textSec}}>
                      {lastMsg?.type==='image'?'Photo':lastMsg?.type==='voice'?'Voice message':lastMsg?.text}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      {chat.muted&&<BellOff className="w-3 h-3" style={{color:bg.textSec}}/>}
                      {chat.unread?<div className={`text-white text-[11px] font-semibold px-1.5 rounded-full min-w-[18px] text-center ${chat.muted?'bg-[#8E8E93]':'bg-[#2481CC]'} ${isActive?'!bg-white !text-[#2481CC]':''}`}>{chat.unread}</div>:null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Column 3: Chat ── */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <div className="h-[52px] flex items-center justify-between px-4 shrink-0 z-10 shadow-sm" style={{background:bg.header,borderBottom:`1px solid ${bg.panelBorder}`}}>
          <button className="flex flex-col text-left hover:opacity-70 transition-opacity" onClick={e=>{e.stopPropagation();setShowProfile(p=>!p);}}>
            <h2 className="font-semibold text-[14px] leading-tight" style={{color:bg.text}}>{activeChat.name}</h2>
            <span className="text-[12px] leading-tight" style={{color:isTyping?'#4DCA65':activeChat.statusColor}}>
              {isTyping ? <span className="flex items-center gap-1">typing<span className="flex gap-[2px] items-end h-3">{[0,1,2].map(i=><span key={i} className="w-[3px] h-[3px] rounded-full bg-[#4DCA65] animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}</span></span> : activeChat.status}
            </span>
          </button>
          <div className="flex items-center gap-3" style={{color:bg.textSec}}>
            {showSearchBar && (
              <input autoFocus type="text" placeholder="Search messages..." value={searchMsg} onChange={e=>setSearchMsg(e.target.value)}
                onKeyDown={e=>e.key==='Escape'&&(setShowSearchBar(false),setSearchMsg(''))}
                className="border rounded-full px-3 py-1 text-[13px] outline-none" style={{borderColor:bg.panelBorder,background:bg.inputField,color:bg.text,width:160}} onClick={e=>e.stopPropagation()}/>
            )}
            <Search className="w-4 h-4 cursor-pointer hover:text-[#2481CC] transition-colors" onClick={e=>{e.stopPropagation();setShowSearchBar(s=>!s);if(showSearchBar)setSearchMsg('');}}/>
            <Phone className="w-4 h-4 cursor-pointer hover:text-[#2481CC] transition-colors" onClick={e=>{e.stopPropagation();startCall('audio');}}/>
            <Video className="w-4 h-4 cursor-pointer hover:text-[#2481CC] transition-colors" onClick={e=>{e.stopPropagation();startCall('video');}}/>
            {/* Font size */}
            <div className="relative">
              <button onClick={e=>{e.stopPropagation();setShowFontSlider(p=>!p);}} className="hover:text-[#2481CC] transition-colors" title="Font size">
                <Type className="w-4 h-4"/>
              </button>
              {showFontSlider && (
                <div className="absolute right-0 top-7 rounded-xl shadow-xl border p-3 z-50 flex flex-col gap-2" style={{background:bg.panel,borderColor:bg.panelBorder,width:180}} onClick={e=>e.stopPropagation()}>
                  <div className="text-[12px] font-semibold" style={{color:bg.text}}>Font size: {fontSize}px</div>
                  <input type="range" min={12} max={20} value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} className="w-full accent-[#2481CC]"/>
                  <div className="flex justify-between text-[11px]" style={{color:bg.textSec}}><span>Aa</span><span style={{fontSize:16}}>Aa</span></div>
                </div>
              )}
            </div>
            <div className="relative">
              <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-[#2481CC] transition-colors" onClick={e=>{e.stopPropagation();setShowBgPicker(p=>!p);}}/>
              {showBgPicker && (
                <div className="absolute right-0 top-7 rounded-xl shadow-xl border p-3 z-50" style={{background:bg.panel,borderColor:bg.panelBorder,width:200}} onClick={e=>e.stopPropagation()}>
                  <div className="text-[12px] font-semibold mb-2" style={{color:bg.text}}>Chat background</div>
                  <div className="grid grid-cols-5 gap-2">
                    {CHAT_BACKGROUNDS.map(b=>(
                      <button key={b.id} onClick={()=>{setChatBgId(b.id);setShowBgPicker(false);}}
                        className={`w-9 h-9 rounded-lg border-2 transition-all ${chatBgId===b.id?'border-[#2481CC] scale-110':'border-transparent hover:border-[#2481CC]/50'}`}
                        style={b.style} title={b.label}/>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Info className="w-4 h-4 cursor-pointer hover:text-[#2481CC] transition-colors" onClick={e=>{e.stopPropagation();setShowProfile(p=>!p);}}/>
          </div>
        </div>

        {/* Pinned */}
        {pinnedMsg && (
          <div className="flex items-center px-4 py-1.5 shrink-0 z-10 cursor-pointer" style={{background:d?'#21262d':'#f0f7ff',borderBottom:'2px solid #2481CC'}}>
            <Pin className="w-3.5 h-3.5 text-[#2481CC] mr-2 shrink-0"/>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-[#2481CC]">Pinned message</div>
              <div className="text-[12px] truncate" style={{color:bg.text}}>{pinnedMsg.type==='text'?pinnedMsg.text:pinnedMsg.type==='image'?'Photo':'Voice'}</div>
            </div>
            <button onClick={e=>{e.stopPropagation();setChats(prev=>prev.map(c=>c.id!==activeChatId?c:{...c,pinnedMsgId:undefined}));}} style={{color:bg.textSec}} className="hover:text-[#EF4444] transition-colors"><X className="w-4 h-4"/></button>
          </div>
        )}

        {/* Messages */}
        <div ref={messagesScrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1" style={chatBgStyle}>
          <div className="flex justify-center mb-2">
            <div className="text-[11px] font-medium px-3 py-0.5 rounded-full" style={{background:isDarkBg?'rgba(0,0,0,0.4)':'rgba(0,0,0,0.1)',color:'white'}}>Today</div>
          </div>
          {filteredMessages.map(msg => {
            const replyMsg = msg.replyTo ? activeChat.messages.find(m=>m.id===msg.replyTo) : null;
            const highlighted = searchMsg && msg.text.toLowerCase().includes(searchMsg.toLowerCase());
            const isEditing = editingMsgId === msg.id;
            return (
              <div key={msg.id} className={`flex w-full group mb-1 ${msg.outgoing?'justify-end':'justify-start'}`}
                onContextMenu={e=>handleContextMenu(e,msg.id)}
                onDoubleClick={()=>{if(msg.outgoing&&msg.type==='text'){setEditingMsgId(msg.id);setEditText(msg.text);}}}>
                <div className="relative max-w-[62%]">
                  {/* Reaction picker on hover */}
                  {!isEditing && (
                    <div className={`absolute -top-8 ${msg.outgoing?'right-0':'left-0'} hidden group-hover:flex items-center gap-0.5 bg-white rounded-full shadow-lg px-1.5 py-0.5 z-20 border border-[#EDEDED]`}>
                      {QUICK_REACTIONS.map(emoji=>(
                        <button key={emoji} onClick={()=>addReaction(msg.id,emoji)} className="text-[15px] w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#F1F1F1] hover:scale-125 transition-all">{emoji}</button>
                      ))}
                    </div>
                  )}
                  {/* Hover actions */}
                  {!isEditing && (
                    <div className={`absolute top-1/2 -translate-y-1/2 ${msg.outgoing?'-left-16':'-right-16'} hidden group-hover:flex gap-1 z-10`}>
                      <button onClick={()=>{setReplyTo(msg);setContextMenu(null);}} className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center hover:bg-blue-50 border border-[#EDEDED]"><Reply className="w-3 h-3 text-[#8E8E93]"/></button>
                      <button onClick={e=>{e.stopPropagation();handleContextMenu(e as any,msg.id);}} className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center hover:bg-blue-50 border border-[#EDEDED]"><MoreHorizontal className="w-3 h-3 text-[#8E8E93]"/></button>
                    </div>
                  )}
                  {/* Bubble */}
                  {isEditing ? (
                    <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow-md border-2 border-[#2481CC]">
                      <input ref={editInputRef} value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')saveEdit();if(e.key==='Escape'){setEditingMsgId(null);setEditText('');}}} className="border-none outline-none flex-1 min-w-[180px]" style={{fontSize,color:bg.text}}/>
                      <button onClick={saveEdit} className="w-6 h-6 bg-[#2481CC] rounded-full flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white"/></button>
                      <button onClick={()=>{setEditingMsgId(null);setEditText('');}} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#F1F1F1]"><X className="w-3.5 h-3.5 text-[#8E8E93]"/></button>
                    </div>
                  ) : msg.type==='text' ? (
                    <div className={`rounded-2xl px-4 py-2 shadow-sm ${highlighted?'ring-2 ring-yellow-400':''} ${msg.outgoing?'rounded-br-sm':'rounded-bl-sm'}`} style={{background:msg.outgoing?bg.msgOut:bg.msgIn}}>
                      {replyMsg && (
                        <div className={`text-[11px] mb-1.5 pl-2 border-l-2 ${msg.outgoing?'border-blue-200 text-blue-100':'border-[#2481CC] text-[#2481CC]'}`}>
                          <div className="font-semibold">{replyMsg.outgoing?'You':activeChat.name}</div>
                          <div className="truncate opacity-80">{replyMsg.type==='text'?replyMsg.text:'Media'}</div>
                        </div>
                      )}
                      <p className="leading-relaxed pr-14" style={{fontSize,color:msg.outgoing?'white':bg.text}}>{msg.text}</p>
                      <div className={`absolute bottom-1.5 right-2 flex items-center gap-1 ${msg.outgoing?'text-blue-100':'text-[#8E8E93]'}`}>
                        {msg.edited && <span className="text-[10px] opacity-70">edited</span>}
                        <span className="text-[11px]">{msg.time}</span>
                        {msg.outgoing && (
                          <button onClick={e=>{e.stopPropagation();setReadReceiptMsg(r=>r===msg.id?null:msg.id);}} className="relative">
                            <CheckCheck className={`w-3.5 h-3.5 ${msg.read?'text-blue-200':'text-blue-200/60'}`}/>
                            {readReceiptMsg===msg.id && (
                              <div className="absolute bottom-5 right-0 bg-white rounded-lg shadow-xl border border-[#EDEDED] p-2 text-left whitespace-nowrap z-30" style={{minWidth:150}}>
                                <div className="text-[11px] font-semibold text-[#1C1C1E] mb-1">Read by</div>
                                {(activeChat.members||[activeChat.name]).slice(0,3).map(m=>(
                                  <div key={m} className="text-[12px] text-[#1C1C1E] flex items-center gap-1.5 py-0.5"><CheckCheck className="w-3 h-3 text-[#2481CC]"/>{m} <span className="text-[#8E8E93] text-[10px]">at {msg.time}</span></div>
                                ))}
                              </div>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : msg.type==='image' ? (
                    <div className="rounded-2xl rounded-bl-sm shadow-sm overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" style={{background:bg.msgIn}} onClick={()=>setLightbox({gradient:msg.gradient||'from-purple-400 to-pink-400'})}>
                      <div className={`w-[200px] h-[140px] bg-gradient-to-tr ${msg.gradient||'from-purple-400 to-pink-400'} flex items-center justify-center`}>
                        <Camera className="w-7 h-7 text-white opacity-60"/>
                      </div>
                      <div className="px-3 py-1.5 relative">
                        <p style={{fontSize:fontSize-1,color:bg.text}} className="pr-10">Tap to view</p>
                        <span className="absolute bottom-1.5 right-2 text-[11px]" style={{color:bg.textSec}}>{msg.time}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl rounded-br-sm px-3 py-2 shadow-sm min-w-[200px]" style={{background:bg.msgOut}}>
                      <div className="flex items-center gap-2.5 pr-12">
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform"><Play className="w-3.5 h-3.5 ml-0.5 text-[#2481CC]"/></div>
                        <div className="flex-1 flex gap-[2px] items-center h-6">
                          {[3,5,8,6,10,7,4,9,6,8,5,7,9,4,6,8,5,7,6,4].map((h,i)=><div key={i} className="w-[2px] bg-blue-200 rounded-full" style={{height:`${h*9}%`}}/>)}
                        </div>
                        <span className="text-[11px] text-blue-100 shrink-0">0:{recordingSeconds>0?String(recordingSeconds).padStart(2,'0'):'12'}</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-100 mt-0.5 justify-end"><span className="text-[11px]">{msg.time}</span><CheckCheck className="w-3 h-3"/></div>
                    </div>
                  )}
                  {/* Reactions */}
                  {(msg.reactions||[]).length>0 && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${msg.outgoing?'justify-end':'justify-start'}`}>
                      {(msg.reactions||[]).map(r=>(
                        <button key={r.emoji} onClick={()=>addReaction(msg.id,r.emoji)}
                          className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[12px] border hover:scale-110 transition-all ${r.mine?'bg-[#E8F4FF] border-[#2481CC]':'bg-white border-[#EDEDED]'}`}>
                          {r.emoji}<span className="text-[11px] font-medium text-[#1C1C1E]">{r.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {searchMsg&&filteredMessages.length===0 && (
            <div className="flex flex-col items-center justify-center flex-1 gap-2" style={{color:bg.textSec}}>
              <Search className="w-8 h-8 opacity-30"/><span className="text-[13px]">No messages found</span>
            </div>
          )}
          <div ref={messagesEndRef}/>
        </div>

        {/* Scroll to bottom button */}
        {showScrollBtn && (
          <button onClick={()=>messagesEndRef.current?.scrollIntoView({behavior:'smooth'})}
            className="absolute bottom-[76px] right-4 w-10 h-10 rounded-full bg-[#2481CC] text-white flex items-center justify-center shadow-lg hover:bg-[#1f73b8] transition-colors z-20">
            <ArrowDown className="w-5 h-5"/>
            {unreadBelow>0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{unreadBelow}</span>}
          </button>
        )}

        {/* Reply banner */}
        {replyTo && (
          <div className="flex items-center gap-3 px-4 py-2 shrink-0" style={{background:bg.input,borderTop:`1px solid ${bg.panelBorder}`}}>
            <div className="w-1 h-8 bg-[#2481CC] rounded-full shrink-0"/>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-[#2481CC]">Reply to {replyTo.outgoing?'Yourself':activeChat.name}</div>
              <div className="text-[12px] truncate" style={{color:bg.textSec}}>{replyTo.type==='text'?replyTo.text:'Media'}</div>
            </div>
            <button onClick={()=>setReplyTo(null)} style={{color:bg.textSec}} className="hover:text-[#EF4444] transition-colors"><X className="w-4 h-4"/></button>
          </div>
        )}

        {/* Suggestions (commands / mentions) */}
        {suggestions && (
          <div className="mx-4 mb-1 rounded-xl border shadow-lg overflow-hidden z-30" style={{background:bg.panel,borderColor:bg.panelBorder}} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center gap-2 px-3 py-1.5" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
              {suggestions.type==='command'?<Slash className="w-3.5 h-3.5 text-[#2481CC]"/>:<AtSign className="w-3.5 h-3.5 text-[#2481CC]"/>}
              <span className="text-[11px] font-semibold text-[#2481CC]">{suggestions.type==='command'?'Commands':'Mentions'}</span>
            </div>
            {suggestions.items.map(item=>(
              <button key={item} onClick={()=>{
                if(suggestions.type==='command') setInputText(item+' ');
                else setInputText(t=>t.replace(/@\w*$/,'@'+item+' '));
                setSuggestions(null); inputRef.current?.focus();
              }} className="w-full flex items-center gap-3 px-3 py-2 text-[13px] transition-colors text-left hover:bg-[#F1F1F1]" style={{color:bg.text}}>
                {suggestions.type==='command' ? <>
                  <span className="font-medium text-[#2481CC]">{item}</span>
                  <span style={{color:bg.textSec}} className="text-[12px]">{item==='/start'?'Start the bot':item==='/help'?'Get help':item==='/settings'?'Open settings':item==='/mute'?'Mute chat':item==='/unmute'?'Unmute chat':'Info'}</span>
                </> : <>
                  <div className="w-6 h-6 rounded-full bg-[#2481CC] flex items-center justify-center text-white text-[11px]">{item[0]}</div>
                  <span>@{item}</span>
                </>}
              </button>
            ))}
          </div>
        )}

        {/* Emoji Panel */}
        {showEmojiPanel && (
          <div className="absolute bottom-[68px] right-16 z-50 rounded-2xl shadow-2xl p-2.5 border" style={{background:bg.input,borderColor:bg.panelBorder,width:300}} onClick={e=>e.stopPropagation()}>
            <div className="grid grid-cols-8 gap-0.5">
              {EMOJI_GRID.map((emoji,i)=>(
                <button key={i} onClick={()=>{setInputText(t=>t+emoji);inputRef.current?.focus();}} className="w-8 h-8 flex items-center justify-center text-[16px] rounded-lg hover:bg-[#F1F1F1] hover:scale-125 transition-all">{emoji}</button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 shrink-0" style={{background:bg.input,borderTop:`1px solid ${bg.panelBorder}`}}>
          <button className="hover:text-[#2481CC] transition-colors shrink-0" style={{color:bg.textSec}}><Paperclip className="w-5 h-5"/></button>
          <div className="flex-1 flex items-center px-3 h-9 gap-2 rounded-2xl" style={{background:bg.inputField}}>
            <input ref={inputRef} type="text" placeholder="Write a message..." value={inputText}
              onChange={e=>handleInputChange(e.target.value)} onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none" style={{fontSize,color:bg.text}} onClick={e=>e.stopPropagation()}/>
            <button onClick={e=>{e.stopPropagation();setShowEmojiPanel(p=>!p);}} className="hover:text-[#2481CC] transition-colors shrink-0" style={{color:bg.textSec}}><Smile className="w-4 h-4"/></button>
          </div>
          {/* Voice recording button */}
          {!inputText.trim() ? (
            <button
              onMouseDown={()=>setIsRecording(true)} onMouseUp={sendVoice} onMouseLeave={()=>{if(isRecording){setIsRecording(false);}}}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${isRecording?'bg-red-500 scale-110':'hover:bg-[#F1F1F1]'}`}
              style={!isRecording?{background:bg.inputField}:{}} title="Hold to record">
              <Mic className={`w-4 h-4 ${isRecording?'text-white':''}`.trim()} style={!isRecording?{color:bg.textSec}:{}}/>
            </button>
          ) : (
            <button onClick={sendMessage} className="w-9 h-9 rounded-full bg-[#2481CC] flex items-center justify-center shrink-0 hover:bg-[#1f73b8] transition-all"><Send className="w-4 h-4 text-white ml-0.5"/></button>
          )}
        </div>

        {/* Recording overlay */}
        {isRecording && (
          <div className="absolute inset-x-0 bottom-0 h-[52px] flex items-center justify-between px-5 z-30" style={{background:'#EF4444'}}>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"/>
              <span className="text-white font-semibold text-[14px]">Recording... {fmtTime(recordingSeconds)}</span>
              <div className="flex gap-[2px] items-center h-5 ml-2">
                {[...Array(16)].map((_,i)=><div key={i} className="w-[2px] bg-white/60 rounded-full animate-pulse" style={{height:`${20+Math.random()*80}%`,animationDelay:`${i*0.05}s`}}/>)}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={()=>setIsRecording(false)} className="text-white/80 hover:text-white transition-colors text-[13px] flex items-center gap-1"><X className="w-4 h-4"/> Cancel</button>
              <button onClick={sendVoice} className="bg-white text-red-500 font-semibold text-[13px] px-3 py-1 rounded-full hover:bg-red-50 transition-colors flex items-center gap-1"><Send className="w-3.5 h-3.5"/> Send</button>
            </div>
          </div>
        )}
      </div>

      {/* ── Right: Profile Panel ── */}
      {showProfile && (
        <div className="w-[260px] shrink-0 flex flex-col overflow-y-auto" style={{background:bg.panel,borderLeft:`1px solid ${bg.panelBorder}`}}>
          <div className="flex items-center justify-between px-4 h-[52px] shrink-0" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
            <span className="font-semibold text-[14px]" style={{color:bg.text}}>Profile</span>
            <button onClick={()=>setShowProfile(false)} style={{color:bg.textSec}} className="hover:text-[#EF4444] transition-colors"><X className="w-5 h-5"/></button>
          </div>
          <div className="flex flex-col items-center px-4 pt-5 pb-3">
            <div className={`w-[72px] h-[72px] rounded-full bg-gradient-to-br ${activeChat.color} flex items-center justify-center text-white font-bold text-xl mb-2`}>{activeChat.avatar}</div>
            <h3 className="font-bold text-[16px] mb-0.5" style={{color:bg.text}}>{activeChat.name}</h3>
            {activeChat.status==='online' ? <span className="text-[12px] text-[#4DCA65] font-medium">online</span> : <span className="text-[12px]" style={{color:bg.textSec}}>{activeChat.status}</span>}
            <div className="flex gap-3 mt-3">
              {[{icon:MessageCircle,label:'Message'},{icon:Phone,label:'Call'},{icon:Video,label:'Video'}].map(({icon:Icon,label})=>(
                <div key={label} className="flex flex-col items-center gap-1 cursor-pointer group">
                  <div className="w-9 h-9 rounded-full bg-[#E8F4FF] flex items-center justify-center group-hover:bg-[#2481CC] transition-colors"><Icon className="w-4 h-4 text-[#2481CC] group-hover:text-white transition-colors"/></div>
                  <span className="text-[10px] text-[#2481CC]">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-4 flex-1">
            {activeChat.phone && <div className="flex items-center gap-2.5 py-2.5" style={{borderBottom:`1px solid ${bg.panelBorder}`}}><Phone className="w-3.5 h-3.5 shrink-0" style={{color:bg.textSec}}/><div><div className="text-[13px]" style={{color:bg.text}}>{activeChat.phone}</div><div className="text-[10px]" style={{color:bg.textSec}}>Mobile</div></div></div>}
            {activeChat.username && <div className="flex items-center gap-2.5 py-2.5" style={{borderBottom:`1px solid ${bg.panelBorder}`}}><Hash className="w-3.5 h-3.5 shrink-0" style={{color:bg.textSec}}/><div><div className="text-[13px]" style={{color:bg.text}}>{activeChat.username}</div><div className="text-[10px]" style={{color:bg.textSec}}>Username</div></div></div>}
            {activeChat.bio && <div className="flex items-start gap-2.5 py-2.5" style={{borderBottom:`1px solid ${bg.panelBorder}`}}><Info className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{color:bg.textSec}}/><div><div className="text-[13px] leading-snug" style={{color:bg.text}}>{activeChat.bio}</div><div className="text-[10px]" style={{color:bg.textSec}}>Bio</div></div></div>}
            {/* Shared media */}
            <div className="py-3" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold" style={{color:bg.text}}>Shared media</span>
                <span className="text-[12px] text-[#2481CC]">142</span>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {GRADIENTS.map((g,i)=>(
                  <div key={i} onClick={()=>setLightbox({gradient:g})} className={`h-14 rounded-lg bg-gradient-to-tr ${g} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}>
                    <Image className="w-4 h-4 text-white opacity-60"/>
                  </div>
                ))}
              </div>
            </div>
            {activeChat.members && (
              <div className="py-3" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
                <div className="text-[12px] font-semibold mb-2" style={{color:bg.text}}>{activeChat.members.length} members</div>
                {activeChat.members.map(m=>(
                  <div key={m} className="flex items-center gap-2 py-1.5">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[11px] font-semibold shrink-0">{m[0]}</div>
                    <span className="text-[13px]" style={{color:bg.text}}>{m}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="py-3"><button className="text-[13px] text-[#EF4444] hover:opacity-80 transition-opacity flex items-center gap-1.5"><X className="w-3.5 h-3.5"/> Block user</button></div>
          </div>
        </div>
      )}

      {/* ── Context Menu ── */}
      {contextMenu && (
        <div className="fixed rounded-xl shadow-2xl py-1 z-50 min-w-[180px] border overflow-hidden" style={{left:contextMenu.x,top:contextMenu.y,background:bg.panel,borderColor:bg.panelBorder}} onClick={e=>e.stopPropagation()}>
          {[
            {icon:Reply,label:'Reply',action:()=>{const m=activeChat.messages.find(x=>x.id===contextMenu.msgId);if(m)setReplyTo(m);setContextMenu(null);}},
            {icon:Edit3,label:'Edit',action:()=>{const m=activeChat.messages.find(x=>x.id===contextMenu.msgId);if(m?.outgoing&&m.type==='text'){setEditingMsgId(m.id);setEditText(m.text);}setContextMenu(null);},show:activeChat.messages.find(m=>m.id===contextMenu.msgId)?.outgoing},
            {icon:Copy,label:'Copy text',action:()=>{const m=activeChat.messages.find(x=>x.id===contextMenu.msgId);if(m)navigator.clipboard?.writeText(m.text);setContextMenu(null);}},
            {icon:Forward,label:'Forward',action:()=>{setForwardMsgId(contextMenu.msgId);setContextMenu(null);}},
            {icon:Pin,label:activeChat.pinnedMsgId===contextMenu.msgId?'Unpin':'Pin',action:()=>pinMessage(contextMenu.msgId)},
            {icon:Star,label:'Save',action:()=>setContextMenu(null)},
            {icon:Trash2,label:'Delete',action:()=>deleteMessage(contextMenu.msgId),danger:true},
          ].filter(i=>i.show!==false).map(({icon:Icon,label,action,danger})=>(
            <button key={label} onClick={action} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors text-left"
              style={{color:danger?'#EF4444':bg.text}}
              onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background=bg.panelHover}
              onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='transparent'}>
              <Icon className="w-3.5 h-3.5 shrink-0"/>{label}
            </button>
          ))}
        </div>
      )}

      {/* ── Forward Modal ── */}
      {forwardMsgId!==null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={()=>setForwardMsgId(null)}>
          <div className="rounded-2xl shadow-2xl p-5 w-[360px]" style={{background:bg.panel}} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[15px]" style={{color:bg.text}}>Forward message</h3>
              <button onClick={()=>setForwardMsgId(null)} style={{color:bg.textSec}} className="hover:text-[#EF4444] transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <div className="rounded-full h-8 flex items-center px-3 gap-2 mb-3" style={{background:bg.inputField}}>
              <Search className="w-4 h-4" style={{color:bg.textSec}}/><input type="text" placeholder="Search chats..." className="bg-transparent border-none outline-none text-[13px] flex-1" style={{color:bg.text}}/>
            </div>
            <div className="max-h-[260px] overflow-y-auto space-y-0.5">
              {chats.filter(c=>c.id!==activeChatId).map(chat=>(
                <div key={chat.id} className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors"
                  onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background=bg.panelHover}
                  onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='transparent'}
                  onClick={()=>{
                    const fwd=activeChat.messages.find(m=>m.id===forwardMsgId);
                    if(fwd){const nm:Message={...fwd,id:Date.now(),time:now(),outgoing:true,read:false,replyTo:undefined};setChats(prev=>prev.map(c=>c.id!==chat.id?c:{...c,messages:[...c.messages,nm]}));}
                    setForwardMsgId(null);
                  }}>
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${chat.color} flex items-center justify-center text-white font-semibold text-[12px] shrink-0`}>{chat.avatar}</div>
                  <div><div className="text-[13px] font-semibold" style={{color:bg.text}}>{chat.name}</div><div className="text-[11px]" style={{color:bg.textSec}}>{chat.status}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Image Lightbox ── */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={()=>setLightbox(null)}>
          <div className="relative" onClick={e=>e.stopPropagation()}>
            <div className={`w-[600px] h-[420px] rounded-2xl bg-gradient-to-tr ${lightbox.gradient} flex items-center justify-center`}>
              <Camera className="w-16 h-16 text-white opacity-40"/>
            </div>
            <div className="absolute top-3 right-3 flex gap-2">
              <button className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"><ZoomIn className="w-4 h-4"/></button>
              <button className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"><ZoomOut className="w-4 h-4"/></button>
              <button onClick={()=>setLightbox(null)} className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"><X className="w-4 h-4"/></button>
            </div>
            <div className="absolute bottom-3 left-0 right-0 flex justify-center">
              <div className="bg-black/50 rounded-full px-4 py-1.5 text-white text-[12px]">Click outside to close · Use zoom controls above</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Call Overlay ── */}
      {callState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:callState.type==='video'?'#0a0a0a':'linear-gradient(135deg,#1a237e,#283593)'}}>
          {callState.type==='video' && !isCamOff && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
              <div className="text-white/10 text-[80px] font-bold">VIDEO</div>
            </div>
          )}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${activeChat.color} flex items-center justify-center text-white font-bold text-3xl shadow-2xl`}>{activeChat.avatar}</div>
            <h2 className="text-white font-bold text-[24px]">{activeChat.name}</h2>
            <p className="text-white/70 text-[16px]">
              {callState.status==='ringing' ? (callState.type==='video'?'Video calling...':'Calling...') : fmtTime(callState.seconds)}
            </p>
            {callState.status==='active' && (
              <div className="flex items-center gap-4 mt-4">
                <button onClick={()=>setIsMuted(m=>!m)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted?'bg-white text-slate-800':'bg-white/20 text-white hover:bg-white/30'}`}>
                  {isMuted?<MicOff className="w-6 h-6"/>:<Mic className="w-6 h-6"/>}
                </button>
                {callState.type==='video' && (
                  <button onClick={()=>setIsCamOff(c=>!c)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isCamOff?'bg-white text-slate-800':'bg-white/20 text-white hover:bg-white/30'}`}>
                    {isCamOff?<VideoOff className="w-6 h-6"/>:<Video className="w-6 h-6"/>}
                  </button>
                )}
                <button onClick={()=>setIsSpeakerOff(s=>!s)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isSpeakerOff?'bg-white text-slate-800':'bg-white/20 text-white hover:bg-white/30'}`}>
                  {isSpeakerOff?<VolumeX className="w-6 h-6"/>:<Volume2 className="w-6 h-6"/>}
                </button>
                <button onClick={()=>{setCallState(null);setIsMuted(false);setIsCamOff(false);setIsSpeakerOff(false);}} className="w-14 h-14 rounded-full bg-[#EF4444] flex items-center justify-center text-white hover:bg-red-600 transition-colors">
                  <PhoneOff className="w-6 h-6"/>
                </button>
              </div>
            )}
            {callState.status==='ringing' && (
              <div className="flex items-center gap-8 mt-6">
                <button onClick={()=>{setCallState(null);}} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-[#EF4444] flex items-center justify-center"><PhoneOff className="w-6 h-6 text-white"/></div>
                  <span className="text-white/70 text-[13px]">Decline</span>
                </button>
                <button onClick={()=>setCallState(s=>s?{...s,status:'active'}:null)} className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-full bg-[#4DCA65] flex items-center justify-center"><Phone className="w-6 h-6 text-white"/></div>
                  <span className="text-white/70 text-[13px]">Accept</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Toast Notifications ── */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast=>(
          <div key={toast.id} className="flex items-center gap-3 rounded-2xl shadow-2xl px-4 py-3 pointer-events-auto animate-bounce" style={{background:bg.panel,border:`1px solid ${bg.panelBorder}`,minWidth:280,animationDuration:'0.3s',animationIterationCount:1}}>
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${toast.color} flex items-center justify-center text-white font-semibold text-[13px] shrink-0`}>{toast.avatar}</div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[13px]" style={{color:bg.text}}>{toast.chatName}</div>
              <div className="text-[12px] truncate" style={{color:bg.textSec}}>{toast.text}</div>
            </div>
            <button onClick={()=>setToasts(prev=>prev.filter(t=>t.id!==toast.id))} style={{color:bg.textSec}} className="hover:text-[#EF4444] transition-colors shrink-0"><X className="w-4 h-4"/></button>
          </div>
        ))}
      </div>
    </div>
  );
}
