import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle, Phone, Bookmark, Settings, Users, Search, Edit3,
  Video, MoreHorizontal, Paperclip, Smile, Send, CheckCheck, Play,
  X, Reply, Trash2, Copy, Forward, Pin, Mic, BellOff, Bell, Star,
  Moon, Sun, Image, Info, Hash, Check, Camera,
  MicOff, VideoOff, PhoneOff, Volume2, VolumeX, ZoomIn, ZoomOut,
  ArrowDown, Slash, AtSign, Type, Clock, BarChart2, Link,
  File, Music, Archive, Eye, EyeOff, CheckSquare, Square,
  UserPlus, Download, ChevronRight,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────
type Reaction = { emoji: string; count: number; mine: boolean };
type PollOption = { text: string; votes: number; voted: boolean };
type Message = {
  id: number; text: string; time: string; outgoing: boolean;
  type: 'text' | 'image' | 'voice' | 'poll';
  read?: boolean; replyTo?: number; edited?: boolean;
  reactions?: Reaction[]; gradient?: string;
  forwardedFrom?: string;
  linkPreview?: { url: string; title: string; description: string; color: string };
  poll?: { question: string; options: PollOption[]; totalVotes: number };
  scheduled?: boolean;
};
type Chat = {
  id: number; name: string; avatar: string; color: string;
  status: string; statusColor: string; time: string;
  unread: number | null; muted?: boolean; pinned?: boolean;
  folder?: string; bio?: string; phone?: string; username?: string;
  pinnedMsgId?: number; members?: string[];
  messages: Message[];
};
type Toast = { id: number; chatName: string; text: string; avatar: string; color: string };

// ─── Constants ────────────────────────────────────────────────────────────────
const nowStr = () => { const d = new Date(); return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`; };
const fmtSecs = (s: number) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
const QUICK_REACTIONS = ['❤️','👍','😂','😮','😢','🔥','👏','🎉'];
const EMOJI_GRID = [
  '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃','😉','😊','😇','🥰','😍','🤩',
  '😘','😗','😚','😙','🥲','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐',
  '😐','😑','😶','😏','😒','🙄','😬','🤥','😔','😪','🤤','😴','😷','🤒','🤕','🤢',
  '❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖',
  '👍','👎','👊','✊','🤛','🤜','🤞','✌️','🤟','🤘','🤙','👌','🤌','🤏','👈','👉',
  '🔥','⭐','💫','✨','🎉','🎊','🎈','🎁','🏆','🥇','🎯','🚀','💡','💎','🌈','❄️',
];
const GIF_COLORS = [
  'from-pink-400 to-red-400','from-blue-400 to-cyan-400','from-green-400 to-emerald-400',
  'from-purple-400 to-pink-400','from-yellow-400 to-orange-400','from-indigo-400 to-blue-400',
  'from-teal-400 to-green-400','from-red-400 to-pink-400','from-orange-400 to-yellow-400',
  'from-cyan-400 to-teal-400','from-violet-400 to-purple-400','from-rose-400 to-red-400',
];
const GIF_LABELS = ['😂 Laughing','🎉 Party!','👍 Nice','❤️ Love','🔥 Fire','😎 Cool','🙏 Please','😭 Sad','🤯 Mind blown','✨ Magic','🚀 Rocket','👀 Looking'];
const CHAT_BACKGROUNDS = [
  { id:'default', style:{ backgroundColor:'#F0F2F5' } },
  { id:'pattern', style:{ backgroundColor:'#dfe6e9', backgroundImage:'radial-gradient(#00000012 1px,transparent 1px)', backgroundSize:'20px 20px' } },
  { id:'gradient', style:{ background:'linear-gradient(135deg,#667eea,#764ba2)' } },
  { id:'nature', style:{ background:'linear-gradient(135deg,#56ab2f,#a8e063)' } },
  { id:'dark', style:{ backgroundColor:'#1a1a2e' } },
];
const GRADIENTS = ['from-purple-400 to-pink-400','from-blue-400 to-cyan-400','from-green-400 to-teal-400','from-orange-400 to-red-400','from-indigo-400 to-purple-400','from-yellow-400 to-orange-400'];
const AUTO_REPLIES = ['Got it, thanks!','Sure, sounds good.','I will check that out.','Thanks for letting me know!','On it.','Will do!','Perfect, thanks.','Interesting!','Makes sense!','I agree.'];
const FOLDERS = ['Все','Личные','Работа','Непрочитанные'] as const;
const LINK_PREVIEWS = [
  { url:'github.com', title:'GitHub · Build software', description:'Where the world builds software. Millions of developers use GitHub to discover, fork, and contribute.', color:'from-gray-700 to-gray-900' },
  { url:'youtube.com', title:'YouTube', description:'Enjoy the videos and music you love, upload original content.', color:'from-red-500 to-red-700' },
  { url:'medium.com', title:'Medium – Where good ideas find you', description:'Read and share new perspectives on just about any topic.', color:'from-green-600 to-green-800' },
];

const INITIAL_CHATS: Chat[] = [
  { id:1, name:'Telegram', avatar:'T', color:'from-blue-400 to-blue-500', status:'бот', statusColor:'#8E8E93', time:'10:42', unread:null, pinned:true, folder:'personal', bio:'Официальные уведомления Telegram.', username:'@telegram',
    messages:[{id:1,text:'Добро пожаловать в Telegram!',time:'10:40',outgoing:false,type:'text'},{id:2,text:'Ваш аккаунт успешно создан.',time:'10:42',outgoing:false,type:'text'}]},
  { id:2, name:'Ночные совы', avatar:'Н', color:'from-purple-400 to-purple-600', status:'14 участников', statusColor:'#8E8E93', time:'9:15', unread:3, folder:'personal', bio:'Сидим допоздна и пишем код.', username:'@nightowls', members:['Алиса','Боб','Давид','Сара','Миша'],
    messages:[{id:1,text:'Мы всё ещё встречаемся сегодня?',time:'9:10',outgoing:false,type:'text'},{id:2,text:'Да! Я принесу перекус.',time:'9:12',outgoing:true,type:'text',read:true},{id:3,text:'Давид: Отлично, увидимся в 9!',time:'9:15',outgoing:false,type:'text'}]},
  { id:3, name:'Алиса', avatar:'А', color:'from-pink-400 to-pink-500', status:'в сети', statusColor:'#4DCA65', time:'Вчера', unread:null, folder:'personal', bio:'Дизайнер и любительница кофе.', phone:'+7 (999) 234-56-78', username:'@alicejohnson', pinnedMsgId:3,
    messages:[
      {id:1,text:'Привет! Ты успел(а) посмотреть файлы проекта?',time:'10:20',outgoing:false,type:'text'},
      {id:2,text:'Да, только что закончил(а) проверку. Пока выглядит хорошо!',time:'10:25',outgoing:true,type:'text',read:true},
      {id:3,text:'Вот макет нового дашборда.',time:'10:26',outgoing:false,type:'image',gradient:'from-purple-400 to-pink-400'},
      {id:4,text:'',time:'10:30',outgoing:true,type:'voice',read:true},
      {id:5,text:'Отлично, дай знать, если нужно что-то изменить.',time:'10:32',outgoing:false,type:'text',reactions:[{emoji:'❤️',count:1,mine:true}]},
      {id:6,text:'Посмотри эту ссылку: https://github.com',time:'10:44',outgoing:false,type:'text',linkPreview:LINK_PREVIEWS[0]},
      {id:7,text:'Я отправила тебе запрошенные документы. Проверь также почту!',time:'10:45',outgoing:false,type:'text'},
    ]},
  { id:4, name:'Боб Смит', avatar:'Б', color:'from-green-400 to-green-600', status:'был 2ч назад', statusColor:'#8E8E93', time:'Вчера', unread:null, folder:'personal', bio:'Разработчик ПО. Любитель кофе.', phone:'+7 (999) 345-67-89', username:'@bobsmith',
    messages:[{id:1,text:'Привет, ты свободен завтра?',time:'14:00',outgoing:true,type:'text',read:true},{id:2,text:'Конечно! В какое время?',time:'14:05',outgoing:false,type:'text'},{id:3,text:'Как насчёт 15:00?',time:'14:07',outgoing:true,type:'text',read:true},{id:4,text:'Договорились!',time:'14:10',outgoing:false,type:'text'},
      {id:5,text:'',time:'14:12',outgoing:false,type:'poll',poll:{question:'Лучший фреймворк 2024?',options:[{text:'React',votes:42,voted:false},{text:'Vue',votes:18,voted:false},{text:'Svelte',votes:24,voted:false},{text:'Angular',votes:11,voted:false}],totalVotes:95}},
    ]},
  { id:5, name:'Рабочая группа', avatar:'Р', color:'from-orange-400 to-orange-500', status:'8 участников', statusColor:'#8E8E93', time:'Пн', unread:12, folder:'work', bio:'Наша продуктовая команда.', username:'@workteam', members:['Алиса','Боб','Сара','Миша','Дан','Катя'],
    messages:[{id:1,text:'Пожалуйста, проверьте PR до конца дня.',time:'9:00',outgoing:false,type:'text'},{id:2,text:'Уже делаю!',time:'9:05',outgoing:true,type:'text',read:true},{id:3,text:'Сара: Новый дизайн отлично выглядит!',time:'9:20',outgoing:false,type:'text'},{id:4,text:'Миша: Можем запланировать стендап?',time:'9:35',outgoing:false,type:'text'},{id:5,text:'Да, 10 утра подходит.',time:'9:40',outgoing:true,type:'text',read:false},
      {id:6,text:'Прикрепляю дизайн-макеты',time:'9:42',outgoing:false,type:'image',gradient:'from-orange-400 to-red-400',forwardedFrom:'Алиса'},
    ]},
  { id:6, name:'Мама', avatar:'М', color:'from-yellow-400 to-yellow-600', status:'была вчера', statusColor:'#8E8E93', time:'Вс', unread:null, folder:'personal', phone:'+7 (999) 567-89-01',
    messages:[{id:1,text:'Ты приедешь на ужин в воскресенье?',time:'18:00',outgoing:false,type:'text'},{id:2,text:'Да, буду в 19:00!',time:'18:05',outgoing:true,type:'text',read:true},{id:3,text:'Позвони, когда доберёшься домой.',time:'22:30',outgoing:false,type:'text'}]},
];

export default function DesktopMain() {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState(3);
  const [inputText, setInputText] = useState('');
  const [drafts, setDrafts] = useState<Record<number,string>>({});
  const [searchText, setSearchText] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchMsg, setSearchMsg] = useState('');
  const [searchMsgIdx, setSearchMsgIdx] = useState(0);
  const [contextMenu, setContextMenu] = useState<{x:number;y:number;msgId:number}|null>(null);
  const [chatCtxMenu, setChatCtxMenu] = useState<{x:number;y:number;chatId:number}|null>(null);
  const [replyTo, setReplyTo] = useState<Message|null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [chatBgId, setChatBgId] = useState('default');
  const [showProfile, setShowProfile] = useState(true);
  const [profileTab, setProfileTab] = useState<'media'|'files'|'links'|'audio'>('media');
  const [forwardMsgId, setForwardMsgId] = useState<number|null>(null);
  const [editingMsgId, setEditingMsgId] = useState<number|null>(null);
  const [editText, setEditText] = useState('');
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [emojiTab, setEmojiTab] = useState<'emoji'|'gif'>('emoji');
  const [isTyping, setIsTyping] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [callState, setCallState] = useState<{type:'audio'|'video';status:'ringing'|'active';seconds:number}|null>(null);
  const [lightbox, setLightbox] = useState<{gradient:string}|null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [activeFolder, setActiveFolder] = useState<typeof FOLDERS[number]>('Все');
  const [showBurger, setShowBurger] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [suggestions, setSuggestions] = useState<{type:'command'|'mention';items:string[]}|null>(null);
  const [readReceiptMsg, setReadReceiptMsg] = useState<number|null>(null);
  const [fontSize, setFontSize] = useState(15);
  const [showFontSlider, setShowFontSlider] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  // NEW: multi-select
  const [selectedMsgs, setSelectedMsgs] = useState<Set<number>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  // NEW: schedule
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  // NEW: new-messages divider (msgId after which divider appears)
  const [newMsgDivider, setNewMsgDivider] = useState<number|null>(activeFolder==='All'?7:null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const callTimerRef = useRef<ReturnType<typeof setInterval>|null>(null);
  const msgRefs = useRef<Record<number,HTMLDivElement|null>>({});

  const d = darkMode;
  const activeChat = chats.find(c => c.id === activeChatId)!;
  const pinnedMsg = activeChat.pinnedMsgId ? activeChat.messages.find(m => m.id === activeChat.pinnedMsgId) : null;
  const isGroup = !!activeChat.members;
  const sortedChats = [...chats].sort((a,b) => (b.pinned?1:0)-(a.pinned?1:0));
  const folderChats = sortedChats.filter(c => {
    if (searchText) return c.name.toLowerCase().includes(searchText.toLowerCase());
    if (activeFolder==='Личные') return c.folder==='personal';
    if (activeFolder==='Работа') return c.folder==='work';
    if (activeFolder==='Непрочитанные') return (c.unread??0)>0;
    return true;
  });
  const filteredMessages = searchMsg
    ? activeChat.messages.filter(m => m.text.toLowerCase().includes(searchMsg.toLowerCase()))
    : activeChat.messages;
  const searchResults = searchMsg ? filteredMessages : [];
  const chatBgStyle = CHAT_BACKGROUNDS.find(b=>b.id===chatBgId)?.style??{};
  const isDarkBg = ['dark','gradient','nature'].includes(chatBgId);

  const bg = {
    nav: d?'#0d1117':'#17212B', panel: d?'#161b22':'#FFFFFF',
    panelBorder: d?'#30363d':'#EDEDED', panelHover: d?'#21262d':'#F5F5F5',
    header: d?'#161b22':'#FFFFFF', msgIn: d?'#2d333b':'#FFFFFF',
    msgOut:'#2481CC', input: d?'#161b22':'#FFFFFF',
    inputField: d?'#0d1117':'#F1F1F1', text: d?'#e6edf3':'#1C1C1E',
    textSec:'#8E8E93',
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({behavior:'smooth'}); }, [activeChatId, activeChat?.messages.length]);
  useEffect(() => { if(editingMsgId) editInputRef.current?.focus(); }, [editingMsgId]);

  // Call timer
  useEffect(() => {
    if(callState?.status==='active') { callTimerRef.current = setInterval(()=>setCallState(s=>s?{...s,seconds:s.seconds+1}:null),1000); }
    else { if(callTimerRef.current)clearInterval(callTimerRef.current); }
    return ()=>{ if(callTimerRef.current)clearInterval(callTimerRef.current); };
  }, [callState?.status]);

  // Recording timer
  useEffect(() => {
    if(isRecording){ recordingTimerRef.current=setInterval(()=>setRecordingSeconds(s=>s+1),1000); }
    else { if(recordingTimerRef.current)clearInterval(recordingTimerRef.current); setRecordingSeconds(0); }
    return ()=>{ if(recordingTimerRef.current)clearInterval(recordingTimerRef.current); };
  }, [isRecording]);

  const handleScroll = () => {
    const el=messagesScrollRef.current; if(!el)return;
    setShowScrollBtn(el.scrollHeight-el.scrollTop-el.clientHeight>200);
  };

  const handleInputChange = (val:string) => {
    setInputText(val);
    if(val.startsWith('/')&&val.length>=1){
      const cmds=['/start','/help','/settings','/mute','/unmute','/info'].filter(c=>c.startsWith(val));
      setSuggestions(cmds.length?{type:'command',items:cmds}:null);
    } else if(val.includes('@')&&isGroup){
      const q=val.split('@').pop()?.toLowerCase()??'';
      const ms=(activeChat.members||[]).filter(m=>m.toLowerCase().startsWith(q)&&q.length>0);
      setSuggestions(ms.length?{type:'mention',items:ms}:null);
    } else setSuggestions(null);
  };

  const sendMessage = useCallback((scheduled=false) => {
    const text=inputText.trim(); if(!text)return;
    const newMsg:Message={ id:Date.now(), text, time:scheduled?scheduleTime||nowStr():nowStr(), outgoing:true, type:'text', read:false, replyTo:replyTo?.id, scheduled };
    setChats(prev=>prev.map(c=>c.id!==activeChatId?c:{...c,time:nowStr(),messages:[...c.messages,newMsg]}));
    setInputText(''); setReplyTo(null); setShowEmojiPanel(false); setSuggestions(null); setShowSchedule(false);
    setDrafts(prev=>({...prev,[activeChatId]:''}));
    inputRef.current?.focus();
    if(!scheduled){
      setIsTyping(true);
      setTimeout(()=>{
        setIsTyping(false);
        const reply:Message={id:Date.now()+1,text:AUTO_REPLIES[Math.floor(Math.random()*AUTO_REPLIES.length)],time:nowStr(),outgoing:false,type:'text'};
        setChats(prev=>prev.map(c=>c.id===activeChatId?{...c,messages:[...c.messages,reply]}:c));
        // random toast from another chat
        if(Math.random()>0.4){
          const others=chats.filter(c=>c.id!==activeChatId);
          const rnd=others[Math.floor(Math.random()*others.length)];
          if(rnd){
            const t:Toast={id:Date.now()+2,chatName:rnd.name,text:AUTO_REPLIES[Math.floor(Math.random()*AUTO_REPLIES.length)],avatar:rnd.avatar,color:rnd.color};
            setToasts(prev=>[...prev,t]);
            setTimeout(()=>setToasts(prev=>prev.filter(x=>x.id!==t.id)),4000);
          }
        }
      },2000);
    }
  },[inputText,activeChatId,replyTo,chats,scheduleTime]);

  const handleKeyDown = (e:React.KeyboardEvent<HTMLInputElement>) => {
    if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}
    if(e.key==='Escape'){setReplyTo(null);setShowEmojiPanel(false);setSuggestions(null);setSelectMode(false);setSelectedMsgs(new Set());}
  };

  const sendVoice = () => {
    setIsRecording(false);
    const msg:Message={id:Date.now(),text:'',time:nowStr(),outgoing:true,type:'voice',read:false};
    setChats(prev=>prev.map(c=>c.id!==activeChatId?c:{...c,messages:[...c.messages,msg]}));
  };

  const saveEdit = () => {
    if(!editingMsgId)return;
    setChats(prev=>prev.map(c=>c.id!==activeChatId?c:{...c,messages:c.messages.map(m=>m.id===editingMsgId?{...m,text:editText,edited:true}:m)}));
    setEditingMsgId(null); setEditText('');
  };

  const addReaction = (msgId:number,emoji:string) => {
    setChats(prev=>prev.map(c=>{if(c.id!==activeChatId)return c;
      return{...c,messages:c.messages.map(m=>{if(m.id!==msgId)return m;
        const ex=(m.reactions||[]).find(r=>r.emoji===emoji);
        let reactions:Reaction[];
        if(ex)reactions=ex.mine?(m.reactions||[]).filter(r=>r.emoji!==emoji):(m.reactions||[]).map(r=>r.emoji===emoji?{...r,count:r.count+1,mine:true}:r);
        else reactions=[...(m.reactions||[]),{emoji,count:1,mine:true}];
        return{...m,reactions};
      })};
    }));
  };

  const votePoll = (msgId:number,optIdx:number) => {
    setChats(prev=>prev.map(c=>{if(c.id!==activeChatId)return c;
      return{...c,messages:c.messages.map(m=>{if(m.id!==msgId||!m.poll)return m;
        if(m.poll.options.some(o=>o.voted))return m; // already voted
        const options=m.poll.options.map((o,i)=>i===optIdx?{...o,votes:o.votes+1,voted:true}:o);
        return{...m,poll:{...m.poll,options,totalVotes:m.poll.totalVotes+1}};
      })};
    }));
  };

  const deleteMessage = (msgId:number) => { setChats(prev=>prev.map(c=>c.id!==activeChatId?c:{...c,messages:c.messages.filter(m=>m.id!==msgId)})); setContextMenu(null); };
  const pinMessage = (msgId:number) => { setChats(prev=>prev.map(c=>c.id!==activeChatId?c:{...c,pinnedMsgId:c.pinnedMsgId===msgId?undefined:msgId})); setContextMenu(null); };

  const openChat = (id:number) => {
    // Save draft
    if(inputText.trim()) setDrafts(prev=>({...prev,[activeChatId]:inputText}));
    else setDrafts(prev=>({...prev,[activeChatId]:''}));
    setActiveChatId(id);
    setChats(prev=>prev.map(c=>c.id===id?{...c,unread:null}:c));
    // Restore draft
    setInputText(drafts[id]||'');
    setContextMenu(null); setChatCtxMenu(null); setReplyTo(null); setShowProfile(false);
    setEditingMsgId(null); setShowEmojiPanel(false); setSuggestions(null);
    setSelectMode(false); setSelectedMsgs(new Set());
    setNewMsgDivider(null);
  };

  const handleCtx = (e:React.MouseEvent,msgId:number) => { e.preventDefault(); setContextMenu({x:Math.min(e.clientX,1060),y:Math.min(e.clientY,650),msgId}); };
  const handleChatCtx = (e:React.MouseEvent,chatId:number) => { e.preventDefault(); setChatCtxMenu({x:Math.min(e.clientX,300),y:Math.min(e.clientY,720),chatId}); };

  const toggleSelect = (msgId:number) => {
    setSelectedMsgs(prev=>{ const n=new Set(prev); n.has(msgId)?n.delete(msgId):n.add(msgId); return n; });
  };

  const bulkDelete = () => {
    setChats(prev=>prev.map(c=>c.id!==activeChatId?c:{...c,messages:c.messages.filter(m=>!selectedMsgs.has(m.id))}));
    setSelectedMsgs(new Set()); setSelectMode(false);
  };

  const closeAll = () => { setContextMenu(null); setChatCtxMenu(null); setShowEmojiPanel(false); setSuggestions(null); setShowBgPicker(false); setShowFontSlider(false); setReadReceiptMsg(null); };

  const startCall = (type:'audio'|'video') => { setCallState({type,status:'ringing',seconds:0}); setTimeout(()=>setCallState(s=>s?{...s,status:'active'}:null),2000); };

  const scrollToMsg = (msgId:number) => {
    const el=msgRefs.current[msgId]; if(el) el.scrollIntoView({behavior:'smooth',block:'center'});
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{width:'1280px',height:'800px',display:'flex',overflow:'hidden',fontFamily:'Inter,system-ui,sans-serif',position:'relative'}} onClick={closeAll}>

      {/* Burger Drawer Overlay */}
      {showBurger&&(
        <div className="absolute inset-0 z-40 flex" onClick={()=>setShowBurger(false)}>
          <div className="absolute inset-0 bg-black/40"/>
          <div className="relative w-[260px] h-full flex flex-col shadow-2xl z-10" style={{background:bg.panel}} onClick={e=>e.stopPropagation()}>
            {/* Drawer header */}
            <div className="px-5 pt-5 pb-4" style={{background:bg.nav}}>
              <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-[18px] mb-3">ИИ</div>
              <div className="font-bold text-[16px] text-white">Иван Иванов</div>
              <div className="text-white/60 text-[13px]">@ivanov</div>
            </div>
            {/* Nav items */}
            <div className="flex-1 overflow-y-auto py-2">
              {([{icon:MessageCircle,label:'Чаты',active:true},{icon:Phone,label:'Звонки',active:false},{icon:Users,label:'Контакты',active:false},{icon:Bookmark,label:'Избранное',active:false},{icon:Settings,label:'Настройки',active:false}]).map(({icon:Icon,label,active})=>(
                <button key={label} className="w-full flex items-center gap-4 px-5 py-3 text-left transition-colors hover:opacity-80" style={{color:active?'#2481CC':bg.text}} onClick={()=>setShowBurger(false)}>
                  <Icon className="w-5 h-5 shrink-0" style={{color:active?'#2481CC':bg.textSec}}/>
                  <span className="text-[15px] font-medium">{label}</span>
                </button>
              ))}
              <div className="mx-4 my-1" style={{borderTop:`1px solid ${bg.panelBorder}`}}/>
              {/* Folders */}
              <div className="px-5 py-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider" style={{color:bg.textSec}}>Папки</span>
              </div>
              {FOLDERS.map(f=>(
                <button key={f} onClick={()=>{setActiveFolder(f);setShowBurger(false);}} className="w-full flex items-center gap-4 px-5 py-2.5 text-left hover:opacity-80 transition-colors"
                  style={{color:activeFolder===f?'#2481CC':bg.text}}>
                  <ChevronRight className="w-4 h-4 shrink-0" style={{color:activeFolder===f?'#2481CC':bg.textSec}}/>
                  <span className="text-[14px]">{f}
                    {f==='Непрочитанные'&&chats.filter(c=>(c.unread??0)>0).length>0&&(
                      <span className="ml-2 bg-[#2481CC] text-white text-[10px] px-1.5 py-0.5 rounded-full">{chats.filter(c=>(c.unread??0)>0).length}</span>
                    )}
                  </span>
                </button>
              ))}
              <div className="mx-4 my-1" style={{borderTop:`1px solid ${bg.panelBorder}`}}/>
              <button onClick={e=>{e.stopPropagation();setDarkMode(m=>!m);}} className="w-full flex items-center gap-4 px-5 py-3 text-left hover:opacity-80 transition-colors" style={{color:bg.text}}>
                {d?<Sun className="w-5 h-5 shrink-0" style={{color:bg.textSec}}/>:<Moon className="w-5 h-5 shrink-0" style={{color:bg.textSec}}/>}
                <span className="text-[15px]">{d?'Светлый режим':'Ночной режим'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat List */}
      <div className="w-[300px] shrink-0 flex flex-col" style={{background:bg.panel,borderRight:`1px solid ${bg.panelBorder}`}}>
        <div className="h-[52px] flex items-center gap-2 px-3 shrink-0" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
          <button onClick={e=>{e.stopPropagation();setShowBurger(b=>!b);}} className="p-1.5 rounded-lg transition-colors hover:opacity-70" style={{color:bg.textSec}}>
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="0" y1="1" x2="18" y2="1"/><line x1="0" y1="7" x2="18" y2="7"/><line x1="0" y1="13" x2="18" y2="13"/>
            </svg>
          </button>
          <h1 className="font-semibold text-[16px] flex-1" style={{color:bg.text}}>Telegram</h1>
          <div className="flex items-center gap-2" style={{color:bg.textSec}}>
            <Search className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors"/>
            <Edit3 className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors"/>
          </div>
        </div>
        {/* Folder tabs */}
        <div className="flex shrink-0 overflow-x-auto" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
          {FOLDERS.map(f=>(
            <button key={f} onClick={()=>setActiveFolder(f)} className="px-3 py-2 text-[12px] font-medium whitespace-nowrap transition-colors relative" style={{color:activeFolder===f?'#2481CC':bg.textSec}}>
              {f}{f==='Непрочитанные'&&chats.filter(c=>(c.unread??0)>0).length>0&&<span className="ml-1 bg-[#2481CC] text-white text-[10px] px-1 rounded-full">{chats.filter(c=>(c.unread??0)>0).length}</span>}
              {activeFolder===f&&<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2481CC] rounded-t"/>}
            </button>
          ))}
        </div>
        {/* Search */}
        <div className="px-3 py-2 shrink-0">
          <div className="rounded-full h-8 flex items-center px-3 gap-2" style={{background:bg.inputField}}>
            <Search className="w-4 h-4 shrink-0" style={{color:bg.textSec}}/>
            <input type="text" placeholder="Поиск" value={searchText} onChange={e=>setSearchText(e.target.value)} className="bg-transparent border-none outline-none text-[13px] w-full" style={{color:bg.text}}/>
            {searchText&&<X className="w-4 h-4 cursor-pointer" style={{color:bg.textSec}} onClick={()=>setSearchText('')}/>}
          </div>
        </div>
        {/* Chat items */}
        <div className="flex-1 overflow-y-auto">
          {folderChats.map(chat=>{
            const isActive=chat.id===activeChatId;
            const lastMsg=chat.messages.at(-1);
            const draft=drafts[chat.id];
            return(
              <div key={chat.id} onClick={()=>openChat(chat.id)} onContextMenu={e=>handleChatCtx(e,chat.id)}
                className="flex items-center px-3 py-[4px] cursor-pointer transition-colors"
                style={{background:isActive?'#2481CC':'transparent'}}
                onMouseEnter={e=>{if(!isActive)(e.currentTarget as HTMLDivElement).style.background=bg.panelHover;}}
                onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background=isActive?'#2481CC':'transparent';}}>
                <div className="relative shrink-0 mr-2.5">
                  <div className={`w-[42px] h-[42px] rounded-full bg-gradient-to-br ${chat.color} flex items-center justify-center text-white font-semibold text-[13px]`}>{chat.avatar}</div>
                  {chat.status==='в сети'&&<div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-[#4DCA65] border-2 border-white"/>}
                  {chat.pinned&&!isActive&&<div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#8E8E93] flex items-center justify-center"><Pin className="w-2 h-2 text-white"/></div>}
                </div>
                <div className="flex-1 min-w-0 py-1" style={{borderBottom:isActive?'none':`1px solid ${bg.panelBorder}`}}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-semibold text-[14px] truncate pr-1" style={{color:isActive?'white':bg.text}}>{chat.name}</h3>
                    <span className="text-[11px] whitespace-nowrap" style={{color:isActive?'rgba(255,255,255,0.7)':bg.textSec}}>{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[12px] truncate pr-1" style={{color:isActive?'rgba(255,255,255,0.75)':draft?'#2481CC':bg.textSec}}>
                      {draft?`Черновик: ${draft}`:lastMsg?.type==='image'?'Фото':lastMsg?.type==='voice'?'Голосовое':lastMsg?.type==='poll'?`📊 ${lastMsg.poll?.question}`:lastMsg?.text}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      {chat.muted&&<BellOff className="w-3 h-3" style={{color:bg.textSec}}/>}
                      {chat.unread?<div className={`text-white text-[11px] font-semibold px-1.5 rounded-full min-w-[18px] text-center ${chat.muted?'bg-[#8E8E93]':'bg-[#2481CC]'} ${isActive?'!bg-white !text-[#2481CC]':''}`}>{chat.unread}</div>:
                        lastMsg?.outgoing&&<CheckCheck className={`w-3 h-3 ${isActive?'text-white/70':lastMsg.read?'text-[#2481CC]':'text-[#8E8E93]'}`}/>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat View */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Header */}
        <div className="h-[52px] flex items-center justify-between px-4 shrink-0 shadow-sm" style={{background:bg.header,borderBottom:`1px solid ${bg.panelBorder}`}}>
          {selectMode?(
            <div className="flex items-center gap-3">
              <button onClick={()=>{setSelectMode(false);setSelectedMsgs(new Set());}} style={{color:bg.textSec}}><X className="w-5 h-5"/></button>
              <span className="font-semibold text-[15px]" style={{color:bg.text}}>{selectedMsgs.size} выбрано</span>
            </div>
          ):(
            <button className="flex flex-col text-left hover:opacity-70 transition-opacity" onClick={e=>{e.stopPropagation();setShowProfile(p=>!p);}}>
              <h2 className="font-semibold text-[14px] leading-tight" style={{color:bg.text}}>{activeChat.name}</h2>
              <span className="text-[12px] leading-tight" style={{color:isTyping?'#4DCA65':activeChat.statusColor}}>
                {isTyping?<span className="flex items-center gap-1">печатает<span className="flex gap-[2px] items-end h-3">{[0,1,2].map(i=><span key={i} className="w-[3px] h-[3px] rounded-full bg-[#4DCA65] animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}</span></span>:activeChat.status}
              </span>
            </button>
          )}
          <div className="flex items-center gap-3" style={{color:bg.textSec}}>
            {selectMode?(
              <>
                <button onClick={bulkDelete} className="flex items-center gap-1.5 text-[13px] text-[#EF4444] hover:opacity-80"><Trash2 className="w-4 h-4"/> Удалить {selectedMsgs.size}</button>
                <button onClick={()=>setForwardMsgId([...selectedMsgs][0])} className="flex items-center gap-1.5 text-[13px] text-[#2481CC] hover:opacity-80"><Forward className="w-4 h-4"/> Переслать</button>
              </>
            ):(
              <>
                {showSearchBar&&(
                  <div className="flex items-center gap-1">
                    <input autoFocus type="text" placeholder="Поиск в чате..." value={searchMsg} onChange={e=>{setSearchMsg(e.target.value);setSearchMsgIdx(0);}} onKeyDown={e=>e.key==='Escape'&&(setShowSearchBar(false),setSearchMsg(''))} className="border rounded-full px-3 py-1 text-[12px] outline-none" style={{borderColor:bg.panelBorder,background:bg.inputField,color:bg.text,width:150}} onClick={e=>e.stopPropagation()}/>
                    {searchResults.length>0&&<span className="text-[11px] whitespace-nowrap" style={{color:bg.textSec}}>{searchMsgIdx+1}/{searchResults.length}</span>}
                    {searchResults.length>1&&<><button onClick={()=>{const i=(searchMsgIdx-1+searchResults.length)%searchResults.length;setSearchMsgIdx(i);scrollToMsg(searchResults[i].id);}} className="hover:text-[#2481CC]">↑</button><button onClick={()=>{const i=(searchMsgIdx+1)%searchResults.length;setSearchMsgIdx(i);scrollToMsg(searchResults[i].id);}} className="hover:text-[#2481CC]">↓</button></>}
                  </div>
                )}
                <Search className="w-4 h-4 cursor-pointer hover:text-[#2481CC]" onClick={e=>{e.stopPropagation();setShowSearchBar(s=>!s);if(showSearchBar)setSearchMsg('');}}/>
                <Phone className="w-4 h-4 cursor-pointer hover:text-[#2481CC]" onClick={e=>{e.stopPropagation();startCall('audio');}}/>
                <Video className="w-4 h-4 cursor-pointer hover:text-[#2481CC]" onClick={e=>{e.stopPropagation();startCall('video');}}/>
                <div className="relative">
                  <button onClick={e=>{e.stopPropagation();setShowFontSlider(p=>!p);}} className="hover:text-[#2481CC] transition-colors"><Type className="w-4 h-4"/></button>
                  {showFontSlider&&(
                    <div className="absolute right-0 top-7 rounded-xl shadow-xl border p-3 z-50" style={{background:bg.panel,borderColor:bg.panelBorder,width:180}} onClick={e=>e.stopPropagation()}>
                      <div className="text-[12px] font-semibold mb-1" style={{color:bg.text}}>Размер шрифта: {fontSize}px</div>
                      <input type="range" min={12} max={20} value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} className="w-full accent-[#2481CC]"/>
                      <div className="flex justify-between text-[11px] mt-1" style={{color:bg.textSec}}><span>Aa</span><span style={{fontSize:16}}>Aa</span></div>
                    </div>
                  )}
                </div>
                <div className="relative">
                  <MoreHorizontal className="w-4 h-4 cursor-pointer hover:text-[#2481CC]" onClick={e=>{e.stopPropagation();setShowBgPicker(p=>!p);}}/>
                  {showBgPicker&&(
                    <div className="absolute right-0 top-7 rounded-xl shadow-xl border p-3 z-50" style={{background:bg.panel,borderColor:bg.panelBorder,width:190}} onClick={e=>e.stopPropagation()}>
                      <div className="text-[12px] font-semibold mb-2" style={{color:bg.text}}>Фон чата</div>
                      <div className="grid grid-cols-5 gap-2 mb-2">
                        {CHAT_BACKGROUNDS.map(b=><button key={b.id} onClick={()=>{setChatBgId(b.id);setShowBgPicker(false);}} className={`w-9 h-9 rounded-lg border-2 transition-all ${chatBgId===b.id?'border-[#2481CC] scale-110':'border-transparent hover:border-[#2481CC]/50'}`} style={b.style}/>)}
                      </div>
                      <button onClick={()=>{setSelectMode(true);setShowBgPicker(false);}} className="w-full text-left text-[12px] flex items-center gap-1.5 py-1 hover:text-[#2481CC] transition-colors" style={{color:bg.textSec}}><CheckSquare className="w-3.5 h-3.5"/> Выбрать сообщения</button>
                    </div>
                  )}
                </div>
                <Info className="w-4 h-4 cursor-pointer hover:text-[#2481CC]" onClick={e=>{e.stopPropagation();setShowProfile(p=>!p);}}/>
              </>
            )}
          </div>
        </div>

        {/* Pinned */}
        {pinnedMsg&&(
          <div className="flex items-center px-4 py-1.5 shrink-0 cursor-pointer hover:opacity-90" style={{background:d?'#21262d':'#f0f7ff',borderBottom:'2px solid #2481CC'}}
            onClick={()=>scrollToMsg(pinnedMsg.id)}>
            <Pin className="w-3.5 h-3.5 text-[#2481CC] mr-2 shrink-0"/>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold text-[#2481CC]">Закреплённое сообщение</div>
              <div className="text-[12px] truncate" style={{color:bg.text}}>{pinnedMsg.type==='text'?pinnedMsg.text:pinnedMsg.type==='image'?'Фото':'Голосовое'}</div>
            </div>
            <button onClick={e=>{e.stopPropagation();setChats(prev=>prev.map(c=>c.id!==activeChatId?c:{...c,pinnedMsgId:undefined}));}} style={{color:bg.textSec}} className="hover:text-[#EF4444]"><X className="w-4 h-4"/></button>
          </div>
        )}

        {/* Messages */}
        <div ref={messagesScrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1" style={chatBgStyle}>
          <div className="flex justify-center mb-2"><div className="text-[11px] font-medium px-3 py-0.5 rounded-full" style={{background:isDarkBg?'rgba(0,0,0,0.4)':'rgba(0,0,0,0.1)',color:'white'}}>Сегодня</div></div>

          {filteredMessages.map((msg,idx)=>{
            const replyMsg=msg.replyTo?activeChat.messages.find(m=>m.id===msg.replyTo):null;
            const highlighted=searchMsg&&msg.text.toLowerCase().includes(searchMsg.toLowerCase())&&searchResults[searchMsgIdx]?.id===msg.id;
            const isEditing=editingMsgId===msg.id;
            const isSelected=selectedMsgs.has(msg.id);
            const showDivider=newMsgDivider!==null&&msg.id===newMsgDivider;
            return(
              <React.Fragment key={msg.id}>
                {showDivider&&(
                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px" style={{background:'#4DCA65',opacity:0.4}}/>
                    <div className="text-[11px] font-semibold text-[#4DCA65] bg-white px-3 py-0.5 rounded-full border border-[#4DCA65]/30">Новые сообщения</div>
                    <div className="flex-1 h-px" style={{background:'#4DCA65',opacity:0.4}}/>
                  </div>
                )}
                <div ref={el=>{msgRefs.current[msg.id]=el;}}
                  className={`flex w-full group mb-0.5 ${msg.outgoing?'justify-end':'justify-start'} ${selectMode?'cursor-pointer':''} ${isSelected?'opacity-100':''}`.trim()}
                  onContextMenu={e=>!selectMode&&handleCtx(e,msg.id)}
                  onDoubleClick={()=>{if(!selectMode&&msg.outgoing&&msg.type==='text'){setEditingMsgId(msg.id);setEditText(msg.text);}}}
                  onClick={()=>selectMode&&toggleSelect(msg.id)}>
                  {/* Select checkbox */}
                  {selectMode&&(
                    <div className={`flex items-center ${msg.outgoing?'order-last ml-2':'mr-2'}`}>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected?'bg-[#2481CC] border-[#2481CC]':'border-[#8E8E93]'}`}>
                        {isSelected&&<Check className="w-3 h-3 text-white"/>}
                      </div>
                    </div>
                  )}
                  <div className="relative max-w-[62%]">
                    {/* Quick reactions */}
                    {!isEditing&&!selectMode&&(
                      <div className={`absolute -top-8 ${msg.outgoing?'right-0':'left-0'} hidden group-hover:flex items-center gap-0.5 bg-white rounded-full shadow-lg px-1.5 py-0.5 z-20 border border-[#EDEDED]`}>
                        {QUICK_REACTIONS.map(e=><button key={e} onClick={()=>addReaction(msg.id,e)} className="text-[14px] w-6 h-6 flex items-center justify-center rounded-full hover:bg-[#F1F1F1] hover:scale-125 transition-all">{e}</button>)}
                      </div>
                    )}
                    {/* Hover actions */}
                    {!isEditing&&!selectMode&&(
                      <div className={`absolute top-1/2 -translate-y-1/2 ${msg.outgoing?'-left-16':'-right-16'} hidden group-hover:flex gap-1 z-10`}>
                        <button onClick={()=>{setReplyTo(msg);setContextMenu(null);}} className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center border border-[#EDEDED] hover:bg-blue-50"><Reply className="w-3 h-3 text-[#8E8E93]"/></button>
                        <button onClick={e=>{e.stopPropagation();handleCtx(e as any,msg.id);}} className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center border border-[#EDEDED] hover:bg-blue-50"><MoreHorizontal className="w-3 h-3 text-[#8E8E93]"/></button>
                      </div>
                    )}

                    {/* Scheduled badge */}
                    {msg.scheduled&&(
                      <div className={`flex items-center gap-1 text-[10px] mb-0.5 ${msg.outgoing?'justify-end':'justify-start'}`}>
                        <Clock className="w-3 h-3 text-[#2481CC]"/><span className="text-[#2481CC] font-medium">Запланировано</span>
                      </div>
                    )}

                    {/* Forwarded label */}
                    {msg.forwardedFrom&&(
                      <div className={`text-[11px] font-semibold text-[#2481CC] mb-0.5 ${msg.outgoing?'text-right':'text-left'}`}>
                        ↗ Переслано от {msg.forwardedFrom}
                      </div>
                    )}

                    {/* Bubble */}
                    {isEditing?(
                      <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow-md border-2 border-[#2481CC]">
                        <input ref={editInputRef} value={editText} onChange={e=>setEditText(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')saveEdit();if(e.key==='Escape'){setEditingMsgId(null);setEditText('');}}} className="border-none outline-none flex-1 min-w-[180px]" style={{fontSize,color:bg.text}}/>
                        <button onClick={saveEdit} className="w-6 h-6 bg-[#2481CC] rounded-full flex items-center justify-center"><Check className="w-3.5 h-3.5 text-white"/></button>
                        <button onClick={()=>{setEditingMsgId(null);setEditText('');}} className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-[#F1F1F1]"><X className="w-3.5 h-3.5 text-[#8E8E93]"/></button>
                      </div>
                    ):msg.type==='poll'&&msg.poll?(
                      <div className="rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm min-w-[240px]" style={{background:bg.msgIn,border:`1px solid ${bg.panelBorder}`}}>
                        <div className="flex items-center gap-2 mb-2">
                          <BarChart2 className="w-4 h-4 text-[#2481CC]"/>
                          <span className="text-[11px] font-semibold text-[#2481CC]">{msg.poll.options.some(o=>o.voted)?'Анонимный опрос · Итоги':'Анонимный опрос'}</span>
                        </div>
                        <p className="font-semibold text-[14px] mb-3" style={{color:bg.text}}>{msg.poll.question}</p>
                        {msg.poll.options.map((opt,i)=>{
                          const pct=msg.poll.totalVotes>0?Math.round(opt.votes/msg.poll.totalVotes*100):0;
                          const voted=msg.poll?.options.some(o=>o.voted);
                          return(
                            <button key={i} onClick={()=>votePoll(msg.id,i)} disabled={voted||undefined as any}
                              className="w-full mb-2 text-left">
                              <div className="flex justify-between text-[13px] mb-0.5" style={{color:bg.text}}>
                                <span className={opt.voted?'font-semibold text-[#2481CC]':''}>{opt.text}</span>
                                {voted&&<span className={opt.voted?'font-bold text-[#2481CC]':'text-[#8E8E93]'}>{pct}%</span>}
                              </div>
                              {voted?(
                                <div className="w-full h-1.5 rounded-full" style={{background:bg.panelBorder}}>
                                  <div className="h-full rounded-full transition-all" style={{width:`${pct}%`,background:opt.voted?'#2481CC':'#8E8E93'}}/>
                                </div>
                              ):(
                                <div className="w-full h-1.5 rounded-full hover:bg-[#E8F4FF] transition-colors" style={{background:bg.panelBorder}}/>
                              )}
                            </button>
                          );
                        })}
                        <div className="text-[11px] mt-1" style={{color:bg.textSec}}>{msg.poll.totalVotes} голосов</div>
                      </div>
                    ):msg.type==='image'?(
                      <div className="rounded-2xl rounded-bl-sm shadow-sm overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" style={{background:bg.msgIn}} onClick={()=>setLightbox({gradient:msg.gradient||'from-purple-400 to-pink-400'})}>
                        <div className={`w-[200px] h-[135px] bg-gradient-to-tr ${msg.gradient||'from-purple-400 to-pink-400'} flex items-center justify-center`}>
                          <Camera className="w-7 h-7 text-white opacity-60"/>
                        </div>
                        <div className="px-3 py-1.5 relative">
                          <p style={{fontSize:fontSize-1,color:bg.text}} className="pr-10">Нажмите для просмотра</p>
                          <span className="absolute bottom-1.5 right-2 text-[11px]" style={{color:bg.textSec}}>{msg.time}</span>
                        </div>
                      </div>
                    ):msg.type==='voice'?(
                      <div className="rounded-2xl rounded-br-sm px-3 py-2 shadow-sm min-w-[200px]" style={{background:bg.msgOut}}>
                        <div className="flex items-center gap-2.5 pr-12">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 cursor-pointer hover:scale-105"><Play className="w-3.5 h-3.5 ml-0.5 text-[#2481CC]"/></div>
                          <div className="flex-1 flex gap-[2px] items-center h-6">{[3,5,8,6,10,7,4,9,6,8,5,7,9,4,6,8,5,7,6,4].map((h,i)=><div key={i} className="w-[2px] bg-blue-200 rounded-full" style={{height:`${h*9}%`}}/>)}</div>
                          <span className="text-[11px] text-blue-100 shrink-0">0:12</span>
                        </div>
                        <div className="flex items-center gap-1 text-blue-100 mt-0.5 justify-end"><span className="text-[11px]">{msg.time}</span><CheckCheck className="w-3 h-3"/></div>
                      </div>
                    ):(
                      <div className={`rounded-2xl px-4 py-2 shadow-sm ${highlighted?'ring-2 ring-yellow-400':isSelected?'ring-2 ring-[#2481CC]':''} ${msg.outgoing?'rounded-br-sm':'rounded-bl-sm'}`} style={{background:msg.outgoing?bg.msgOut:bg.msgIn}}>
                        {replyMsg&&(
                          <div className={`text-[11px] mb-1.5 pl-2 border-l-2 ${msg.outgoing?'border-blue-200 text-blue-100':'border-[#2481CC] text-[#2481CC]'}`}>
                            <div className="font-semibold">{replyMsg.outgoing?'Вы':activeChat.name}</div>
                            <div className="truncate opacity-80">{replyMsg.type==='text'?replyMsg.text:'Медиа'}</div>
                          </div>
                        )}
                        <p className="leading-relaxed pr-14" style={{fontSize,color:msg.outgoing?'white':bg.text}}>{msg.text}</p>
                        {/* Link preview */}
                        {msg.linkPreview&&(
                          <div className="mt-2 rounded-xl overflow-hidden border" style={{borderColor:msg.outgoing?'rgba(255,255,255,0.2)':bg.panelBorder}}>
                            <div className={`h-16 bg-gradient-to-tr ${msg.linkPreview.color} flex items-center justify-center`}><Link className="w-5 h-5 text-white opacity-70"/></div>
                            <div className="p-2" style={{background:msg.outgoing?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.03)'}}>
                              <div className="text-[12px] font-semibold truncate" style={{color:msg.outgoing?'white':bg.text}}>{msg.linkPreview.title}</div>
                              <div className="text-[11px] truncate" style={{color:msg.outgoing?'rgba(255,255,255,0.7)':bg.textSec}}>{msg.linkPreview.description}</div>
                              <div className="text-[10px] mt-0.5 text-[#2481CC]">{msg.linkPreview.url}</div>
                            </div>
                          </div>
                        )}
                        <div className={`absolute bottom-1.5 right-2 flex items-center gap-1 ${msg.outgoing?'text-blue-100':'text-[#8E8E93]'}`}>
                          {msg.edited&&<span className="text-[10px] opacity-70">изм.</span>}
                          <span className="text-[11px]">{msg.time}</span>
                          {msg.outgoing&&(
                            <button onClick={e=>{e.stopPropagation();setReadReceiptMsg(r=>r===msg.id?null:msg.id);}} className="relative">
                              <CheckCheck className={`w-3.5 h-3.5 ${msg.read?'text-blue-200':'text-blue-200/60'}`}/>
                              {readReceiptMsg===msg.id&&(
                                <div className="absolute bottom-5 right-0 bg-white rounded-xl shadow-xl border border-[#EDEDED] p-2.5 text-left whitespace-nowrap z-30" style={{minWidth:170}}>
                                  <div className="text-[11px] font-semibold text-[#1C1C1E] mb-1.5">Прочитано</div>
                                  {(activeChat.members||[activeChat.name]).slice(0,3).map(m=>(
                                    <div key={m} className="text-[12px] text-[#1C1C1E] flex items-center gap-1.5 py-0.5"><CheckCheck className="w-3 h-3 text-[#2481CC]"/>{m}<span className="text-[#8E8E93] text-[10px]">at {msg.time}</span></div>
                                  ))}
                                </div>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    {/* Reactions */}
                    {(msg.reactions||[]).length>0&&(
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
              </React.Fragment>
            );
          })}
          <div ref={messagesEndRef}/>
        </div>

        {/* Scroll to bottom */}
        {showScrollBtn&&(
          <button onClick={()=>messagesEndRef.current?.scrollIntoView({behavior:'smooth'})} className="absolute bottom-[76px] right-4 w-10 h-10 rounded-full bg-[#2481CC] text-white flex items-center justify-center shadow-lg hover:bg-[#1f73b8] z-20">
            <ArrowDown className="w-5 h-5"/>
          </button>
        )}

        {/* Reply banner */}
        {replyTo&&(
          <div className="flex items-center gap-3 px-4 py-2 shrink-0" style={{background:bg.input,borderTop:`1px solid ${bg.panelBorder}`}}>
            <div className="w-1 h-8 bg-[#2481CC] rounded-full shrink-0"/>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-[#2481CC]">Ответ {replyTo.outgoing?'себе':activeChat.name}</div>
              <div className="text-[12px] truncate" style={{color:bg.textSec}}>{replyTo.type==='text'?replyTo.text:'Медиа'}</div>
            </div>
            <button onClick={()=>setReplyTo(null)} style={{color:bg.textSec}} className="hover:text-[#EF4444]"><X className="w-4 h-4"/></button>
          </div>
        )}

        {/* Suggestions */}
        {suggestions&&(
          <div className="mx-4 mb-1 rounded-xl border shadow-lg overflow-hidden z-30" style={{background:bg.panel,borderColor:bg.panelBorder}} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center gap-2 px-3 py-1.5" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
              {suggestions.type==='command'?<Slash className="w-3.5 h-3.5 text-[#2481CC]"/>:<AtSign className="w-3.5 h-3.5 text-[#2481CC]"/>}
              <span className="text-[11px] font-semibold text-[#2481CC]">{suggestions.type==='command'?'Команды':'Упоминания'}</span>
            </div>
            {suggestions.items.map(item=>(
              <button key={item} onClick={()=>{
                if(suggestions.type==='command')setInputText(item+' ');
                else setInputText(t=>t.replace(/@\w*$/,'@'+item+' '));
                setSuggestions(null);inputRef.current?.focus();
              }} className="w-full flex items-center gap-3 px-3 py-2 text-[13px] transition-colors text-left hover:bg-[#F1F1F1]" style={{color:bg.text}}>
                {suggestions.type==='command'?<><span className="font-medium text-[#2481CC]">{item}</span><span style={{color:bg.textSec}} className="text-[12px]">{item==='/start'?'Запустить бота':item==='/help'?'Помощь':item==='/settings'?'Настройки':item==='/mute'?'Отключить звук':item==='/unmute'?'Включить звук':'Информация'}</span></>:
                  <><div className="w-6 h-6 rounded-full bg-[#2481CC] flex items-center justify-center text-white text-[11px]">{item[0]}</div><span>@{item}</span></>}
              </button>
            ))}
          </div>
        )}

        {/* Emoji / GIF Panel */}
        {showEmojiPanel&&(
          <div className="absolute bottom-[68px] right-14 z-50 rounded-2xl shadow-2xl border overflow-hidden" style={{background:bg.input,borderColor:bg.panelBorder,width:310}} onClick={e=>e.stopPropagation()}>
            <div className="flex border-b" style={{borderColor:bg.panelBorder}}>
              {(['emoji','gif'] as const).map(t=>(
                <button key={t} onClick={()=>setEmojiTab(t)} className="flex-1 py-2 text-[12px] font-semibold transition-colors relative" style={{color:emojiTab===t?'#2481CC':bg.textSec}}>
                  {t==='emoji'?'😀 Emoji':'🎬 GIF'}
                  {emojiTab===t&&<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2481CC]"/>}
                </button>
              ))}
            </div>
            {emojiTab==='emoji'?(
              <div className="p-2 grid grid-cols-8 gap-0.5">
                {EMOJI_GRID.map((e,i)=><button key={i} onClick={()=>{setInputText(t=>t+e);inputRef.current?.focus();}} className="w-8 h-8 flex items-center justify-center text-[16px] rounded-lg hover:bg-[#F1F1F1] hover:scale-125 transition-all">{e}</button>)}
              </div>
            ):(
              <div className="p-2">
                <div className="rounded-full h-7 flex items-center px-2 gap-1 mb-2" style={{background:bg.inputField}}>
                  <Search className="w-3.5 h-3.5" style={{color:bg.textSec}}/><input type="text" placeholder="Поиск GIF..." className="bg-transparent border-none outline-none text-[12px] flex-1" style={{color:bg.text}}/>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {GIF_COLORS.map((g,i)=>(
                    <div key={i} onClick={()=>{setShowEmojiPanel(false);const m:Message={id:Date.now(),text:'',time:nowStr(),outgoing:true,type:'image',gradient:g,read:false};setChats(prev=>prev.map(c=>c.id!==activeChatId?c:{...c,messages:[...c.messages,m]}));}}
                      className={`h-16 rounded-xl bg-gradient-to-tr ${g} flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}>
                      <span className="text-white text-[18px]">{GIF_LABELS[i].split(' ')[0]}</span>
                      <span className="text-white/70 text-[9px] mt-0.5">{GIF_LABELS[i].split(' ').slice(1).join(' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input area */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 shrink-0" style={{background:bg.input,borderTop:`1px solid ${bg.panelBorder}`}}>
          <button style={{color:bg.textSec}} className="hover:text-[#2481CC] transition-colors"><Paperclip className="w-5 h-5"/></button>
          <div className="flex-1 flex items-center px-3 h-9 gap-2 rounded-2xl" style={{background:bg.inputField}}>
            <input ref={inputRef} type="text" placeholder="Написать сообщение..." value={inputText} onChange={e=>handleInputChange(e.target.value)} onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none" style={{fontSize,color:bg.text}} onClick={e=>e.stopPropagation()}/>
            <button onClick={e=>{e.stopPropagation();setShowEmojiPanel(p=>!p);}} className="hover:text-[#2481CC] transition-colors shrink-0" style={{color:bg.textSec}}><Smile className="w-4 h-4"/></button>
          </div>
          {!inputText.trim()?(
            <button onMouseDown={()=>setIsRecording(true)} onMouseUp={sendVoice} onMouseLeave={()=>{if(isRecording)setIsRecording(false);}}
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all ${isRecording?'bg-red-500 scale-110':'hover:bg-[#F1F1F1]'}`}
              style={!isRecording?{background:bg.inputField}:{}}>
              <Mic className={`w-4 h-4 ${isRecording?'text-white':''}`.trim()} style={!isRecording?{color:bg.textSec}:{}}/>
            </button>
          ):(
            <div className="flex gap-1.5">
              {/* Long-press schedule via right click on send */}
              <button onClick={sendMessage} onContextMenu={e=>{e.preventDefault();e.stopPropagation();setShowSchedule(true);}}
                className="w-9 h-9 rounded-full bg-[#2481CC] flex items-center justify-center shrink-0 hover:bg-[#1f73b8] transition-all" title="Отправить · ПКМ для планирования">
                <Send className="w-4 h-4 text-white ml-0.5"/>
              </button>
            </div>
          )}
        </div>

        {/* Recording overlay */}
        {isRecording&&(
          <div className="absolute inset-x-0 bottom-0 h-[52px] flex items-center justify-between px-5 z-30" style={{background:'#EF4444'}}>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse"/>
              <span className="text-white font-semibold text-[14px]">Запись… {fmtSecs(recordingSeconds)}</span>
              <div className="flex gap-[2px] items-center h-5 ml-2">{[...Array(16)].map((_,i)=><div key={i} className="w-[2px] bg-white/60 rounded-full animate-pulse" style={{height:`${20+Math.random()*80}%`,animationDelay:`${i*0.05}s`}}/>)}</div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={()=>setIsRecording(false)} className="text-white/80 hover:text-white text-[13px] flex items-center gap-1"><X className="w-4 h-4"/> Отмена</button>
              <button onClick={sendVoice} className="bg-white text-red-500 font-semibold text-[13px] px-3 py-1 rounded-full flex items-center gap-1"><Send className="w-3.5 h-3.5"/> Отправить</button>
            </div>
          </div>
        )}
      </div>

      {/* Profile panel */}
      {showProfile&&(
        <div className="w-[320px] shrink-0 flex flex-col overflow-hidden" style={{background:bg.panel,borderLeft:`1px solid ${bg.panelBorder}`}}>
          {/* ── Cover area ───────────────────────────── */}
          <div className="relative shrink-0">
            <div className={`w-full bg-gradient-to-br ${activeChat.color}`} style={{height:160}}/>
            {/* top buttons */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 pt-3">
              <button onClick={()=>setShowProfile(false)} className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors">
                <X className="w-4 h-4"/>
              </button>
              <div className="flex gap-2">
                {!isGroup&&<button className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"><Edit3 className="w-4 h-4"/></button>}
                <button className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"><MoreHorizontal className="w-4 h-4"/></button>
              </div>
            </div>
            {/* avatar */}
            <div className="absolute left-1/2 -translate-x-1/2" style={{bottom:-36}}>
              <div className="relative">
                <div className={`w-[72px] h-[72px] rounded-full bg-gradient-to-br ${activeChat.color} flex items-center justify-center text-white font-bold text-[26px] border-[3px] shadow-lg`} style={{borderColor:bg.panel}}>{activeChat.avatar}</div>
                {activeChat.status==='в сети'&&<div className="absolute bottom-1 right-1 w-[14px] h-[14px] rounded-full bg-[#4DCA65] border-2 border-white"/>}
              </div>
            </div>
          </div>

          {/* ── Name & status ─────────────────────────── */}
          <div className="flex flex-col items-center pt-12 pb-3 px-4">
            <h3 className="font-bold text-[17px] leading-tight text-center mb-0.5" style={{color:bg.text}}>{activeChat.name}</h3>
            {activeChat.status==='в сети'
              ?<span className="text-[13px] text-[#4DCA65] font-medium">в сети</span>
              :<span className="text-[12px]" style={{color:bg.textSec}}>{activeChat.status}</span>
            }
          </div>

          {/* ── Action buttons ────────────────────────── */}
          <div className="flex justify-center gap-5 px-4 pb-4" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
            {([
              {icon:MessageCircle,label:'Сообщение',action:()=>setShowProfile(false)},
              {icon:Phone,label:'Звонок',action:()=>startCall('audio')},
              {icon:Video,label:'Видео',action:()=>startCall('video')},
              {icon:Search,label:'Поиск',action:()=>{setShowSearchBar(s=>!s);setShowProfile(false);}},
            ]).map(({icon:Icon,label,action})=>(
              <div key={label} className="flex flex-col items-center gap-1.5 cursor-pointer group" onClick={action}>
                <div className="w-[42px] h-[42px] rounded-full bg-[#E8F4FF] flex items-center justify-center group-hover:bg-[#2481CC] transition-colors">
                  <Icon className="w-[18px] h-[18px] text-[#2481CC] group-hover:text-white transition-colors"/>
                </div>
                <span className="text-[11px] font-medium text-[#2481CC]">{label}</span>
              </div>
            ))}
          </div>

          {/* ── Scrollable content ────────────────────── */}
          <div className="flex-1 overflow-y-auto">

            {/* Info rows */}
            <div className="py-1">
              {activeChat.phone&&(
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F5F5F5] group transition-colors" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
                  <div className="w-9 h-9 rounded-full bg-[#E8F4FF] flex items-center justify-center shrink-0"><Phone className="w-[18px] h-[18px] text-[#2481CC]"/></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium" style={{color:bg.text}}>{activeChat.phone}</div>
                    <div className="text-[12px]" style={{color:bg.textSec}}>Мобильный</div>
                  </div>
                  <Copy className="w-4 h-4 text-[#C7C7CC] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"/>
                </div>
              )}
              {activeChat.username&&(
                <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F5F5F5] group transition-colors" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
                  <div className="w-9 h-9 rounded-full bg-[#E8F4FF] flex items-center justify-center shrink-0"><AtSign className="w-[18px] h-[18px] text-[#2481CC]"/></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-[#2481CC]">{activeChat.username}</div>
                    <div className="text-[12px]" style={{color:bg.textSec}}>Имя пользователя</div>
                  </div>
                  <Copy className="w-4 h-4 text-[#C7C7CC] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"/>
                </div>
              )}
              {activeChat.bio&&(
                <div className="flex items-start gap-3 px-4 py-3" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
                  <div className="w-9 h-9 rounded-full bg-[#F1F1F1] flex items-center justify-center shrink-0"><Info className="w-[18px] h-[18px]" style={{color:bg.textSec}}/></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] leading-snug" style={{color:bg.text}}>{activeChat.bio}</div>
                    <div className="text-[12px] mt-0.5" style={{color:bg.textSec}}>О себе</div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F5F5F5] transition-colors" style={{borderBottom:`1px solid ${bg.panelBorder}`}}
                onClick={()=>setChats(prev=>prev.map(c=>c.id!==activeChatId?c:{...c,muted:!c.muted}))}>
                <div className="w-9 h-9 rounded-full bg-[#F1F1F1] flex items-center justify-center shrink-0">
                  {activeChat.muted?<BellOff className="w-[18px] h-[18px]" style={{color:bg.textSec}}/>:<Bell className="w-[18px] h-[18px]" style={{color:bg.textSec}}/>}
                </div>
                <span className="flex-1 text-[14px] font-medium" style={{color:bg.text}}>Уведомления</span>
                <div className={`w-10 h-[22px] rounded-full relative transition-colors shrink-0 ${!activeChat.muted?'bg-[#2481CC]':'bg-[#D1D1D6]'}`}>
                  <div className={`absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full shadow transition-all ${!activeChat.muted?'left-[20px]':'left-[2px]'}`}/>
                </div>
              </div>

              {/* Search in chat */}
              <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#F5F5F5] transition-colors" style={{borderBottom:`1px solid ${bg.panelBorder}`}}
                onClick={()=>{setShowSearchBar(true);setShowProfile(false);}}>
                <div className="w-9 h-9 rounded-full bg-[#F1F1F1] flex items-center justify-center shrink-0"><Search className="w-[18px] h-[18px]" style={{color:bg.textSec}}/></div>
                <span className="flex-1 text-[14px] font-medium" style={{color:bg.text}}>Поиск в чате</span>
                <ChevronRight className="w-4 h-4 text-[#C7C7CC] shrink-0"/>
              </div>

              {/* Shared media header row */}
              <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[#F5F5F5] transition-colors" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
                <span className="text-[14px] font-semibold" style={{color:bg.text}}>Общие медиа</span>
                <div className="flex items-center gap-1">
                  <span className="text-[13px]" style={{color:bg.textSec}}>{GRADIENTS.length + 4}</span>
                  <ChevronRight className="w-4 h-4 text-[#C7C7CC]"/>
                </div>
              </div>
            </div>

            {/* Media tabs */}
            <div className="flex shrink-0" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
              {([
                {id:'media',icon:Image,label:'Медиа',count:6},
                {id:'files',icon:File,label:'Файлы',count:5},
                {id:'links',icon:Link,label:'Ссылки',count:3},
                {id:'audio',icon:Music,label:'Аудио',count:3},
              ] as const).map(tab=>(
                <button key={tab.id} onClick={()=>setProfileTab(tab.id)}
                  className="flex-1 py-2.5 flex flex-col items-center gap-0.5 relative transition-colors"
                  style={{color:profileTab===tab.id?'#2481CC':bg.textSec}}>
                  <tab.icon className="w-4 h-4"/>
                  <span className="text-[10px] font-semibold">{tab.label}</span>
                  <span className="text-[9px]" style={{color:profileTab===tab.id?'#2481CC':'#C7C7CC'}}>{tab.count}</span>
                  {profileTab===tab.id&&<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2481CC]"/>}
                </button>
              ))}
            </div>

            {/* Media content */}
            <div className="p-3">
              {profileTab==='media'&&(
                <div className="grid grid-cols-3 gap-1">
                  {GRADIENTS.map((g,i)=>(
                    <div key={i} onClick={()=>setLightbox({gradient:g})}
                      className={`aspect-square rounded-lg bg-gradient-to-tr ${g} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}>
                      <Image className="w-5 h-5 text-white opacity-50"/>
                    </div>
                  ))}
                </div>
              )}

              {profileTab==='files'&&(
                <div className="space-y-1">
                  {(['Design_v2.fig','Report_Q4.pdf','Mockups.zip','Budget.xlsx','Presentation.pptx'] as const).map((f,i)=>(
                    <div key={f} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F1F1F1] cursor-pointer transition-colors group">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F4FF] flex items-center justify-center shrink-0"><File className="w-5 h-5 text-[#2481CC]"/></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium truncate" style={{color:bg.text}}>{f}</div>
                        <div className="text-[11px]" style={{color:bg.textSec}}>{['2.4 MB','1.1 MB','8.7 MB','340 KB','5.2 MB'][i]}</div>
                      </div>
                      <Download className="w-4 h-4 text-[#C7C7CC] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"/>
                    </div>
                  ))}
                </div>
              )}

              {profileTab==='links'&&(
                <div className="space-y-2">
                  {LINK_PREVIEWS.map((l,i)=>(
                    <div key={i} className="flex items-start gap-3 p-2 rounded-xl hover:bg-[#F1F1F1] cursor-pointer border transition-colors" style={{borderColor:bg.panelBorder}}>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${l.color} flex items-center justify-center shrink-0`}><Link className="w-4 h-4 text-white"/></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-semibold text-[#2481CC] truncate">{l.title}</div>
                        <div className="text-[11px] truncate" style={{color:bg.textSec}}>{l.url}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {profileTab==='audio'&&(
                <div className="space-y-1">
                  {(['Голосовое сообщение #1','Голосовое сообщение #2','Голосовое сообщение #3'] as const).map((a,i)=>(
                    <div key={a} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F1F1F1] cursor-pointer transition-colors">
                      <div className="w-10 h-10 rounded-full bg-[#2481CC] flex items-center justify-center shrink-0"><Play className="w-5 h-5 ml-0.5 text-white"/></div>
                      <div className="flex-1">
                        <div className="text-[13px] font-medium" style={{color:bg.text}}>{a}</div>
                        <div className="text-[11px]" style={{color:bg.textSec}}>{['0:12','0:28','0:07'][i]}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Members (groups only) */}
              {activeChat.members&&(
                <div className="mt-3 pt-3" style={{borderTop:`1px solid ${bg.panelBorder}`}}>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-[13px] font-semibold" style={{color:bg.text}}>{activeChat.members.length} участников</span>
                    <span className="text-[12px] text-[#2481CC] cursor-pointer hover:underline">Все</span>
                  </div>
                  {/* Add member */}
                  <div className="flex items-center gap-3 px-1 py-2 rounded-xl hover:bg-[#F1F1F1] cursor-pointer transition-colors mb-1">
                    <div className="w-10 h-10 rounded-full bg-[#E8F4FF] flex items-center justify-center shrink-0"><UserPlus className="w-[18px] h-[18px] text-[#2481CC]"/></div>
                    <span className="text-[13px] font-medium text-[#2481CC]">Добавить участника</span>
                  </div>
                  {/* Member list */}
                  {activeChat.members.map((m,i)=>{
                    const MCOLORS=['from-blue-400 to-cyan-500','from-pink-400 to-rose-500','from-green-400 to-emerald-500','from-orange-400 to-amber-500','from-purple-400 to-violet-500','from-teal-400 to-green-500'];
                    const online=i<2;
                    return(
                      <div key={m} className="flex items-center gap-3 px-1 py-2 rounded-xl hover:bg-[#F1F1F1] cursor-pointer transition-colors">
                        <div className="relative shrink-0">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${MCOLORS[i%MCOLORS.length]} flex items-center justify-center text-white text-[13px] font-semibold`}>{m[0]}</div>
                          {online&&<div className="absolute bottom-0 right-0 w-[10px] h-[10px] rounded-full bg-[#4DCA65] border-2 border-white"/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium truncate" style={{color:bg.text}}>{m}</div>
                          <div className="text-[11px]" style={{color:online?'#4DCA65':bg.textSec}}>{online?'в сети':'недавно был(а) в сети'}</div>
                        </div>
                        {i===0&&<span className="text-[10px] font-semibold text-[#8E8E93] bg-[#F1F1F1] px-1.5 py-0.5 rounded-full shrink-0">администратор</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Chat list context menu */}
      {chatCtxMenu&&(
        <div className="fixed rounded-xl shadow-2xl py-1 z-50 min-w-[180px] border" style={{left:chatCtxMenu.x,top:chatCtxMenu.y,background:bg.panel,borderColor:bg.panelBorder}} onClick={e=>e.stopPropagation()}>
          {[
            {icon:Pin,label:chats.find(c=>c.id===chatCtxMenu.chatId)?.pinned?'Открепить чат':'Закрепить чат',action:()=>{setChats(prev=>prev.map(c=>c.id!==chatCtxMenu.chatId?c:{...c,pinned:!c.pinned}));setChatCtxMenu(null);}},
            {icon:BellOff,label:chats.find(c=>c.id===chatCtxMenu.chatId)?.muted?'Включить уведомления':'Выключить уведомления',action:()=>{setChats(prev=>prev.map(c=>c.id!==chatCtxMenu.chatId?c:{...c,muted:!c.muted}));setChatCtxMenu(null);}},
            {icon:Eye,label:'Отметить как прочитанное',action:()=>{setChats(prev=>prev.map(c=>c.id!==chatCtxMenu.chatId?c:{...c,unread:null}));setChatCtxMenu(null);}},
            {icon:Archive,label:'Архивировать',action:()=>setChatCtxMenu(null)},
            {icon:Trash2,label:'Удалить чат',danger:true,action:()=>{setChats(prev=>prev.filter(c=>c.id!==chatCtxMenu.chatId));setChatCtxMenu(null);if(activeChatId===chatCtxMenu.chatId)setActiveChatId(chats.find(c=>c.id!==chatCtxMenu.chatId)?.id??1);}},
          ].map(({icon:Icon,label,action,danger})=>(
            <button key={label} onClick={action} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-left transition-colors"
              style={{color:danger?'#EF4444':bg.text}}
              onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background=bg.panelHover}
              onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='transparent'}>
              <Icon className="w-3.5 h-3.5 shrink-0"/>{label}
            </button>
          ))}
        </div>
      )}

      {/* Message context menu */}
      {contextMenu&&(
        <div className="fixed rounded-xl shadow-2xl py-1 z-50 min-w-[180px] border" style={{left:contextMenu.x,top:contextMenu.y,background:bg.panel,borderColor:bg.panelBorder}} onClick={e=>e.stopPropagation()}>
          {[
            {icon:Reply,label:'Ответить',action:()=>{const m=activeChat.messages.find(x=>x.id===contextMenu.msgId);if(m)setReplyTo(m);setContextMenu(null);}},
            {icon:Edit3,label:'Редактировать',action:()=>{const m=activeChat.messages.find(x=>x.id===contextMenu.msgId);if(m?.outgoing&&m.type==='text'){setEditingMsgId(m.id);setEditText(m.text);}setContextMenu(null);},show:activeChat.messages.find(m=>m.id===contextMenu.msgId)?.outgoing},
            {icon:Copy,label:'Копировать текст',action:()=>{const m=activeChat.messages.find(x=>x.id===contextMenu.msgId);if(m)navigator.clipboard?.writeText(m.text);setContextMenu(null);}},
            {icon:Forward,label:'Переслать',action:()=>{setForwardMsgId(contextMenu.msgId);setContextMenu(null);}},
            {icon:CheckSquare,label:'Выбрать',action:()=>{setSelectMode(true);setSelectedMsgs(new Set([contextMenu.msgId]));setContextMenu(null);}},
            {icon:Pin,label:activeChat.pinnedMsgId===contextMenu.msgId?'Открепить':'Закрепить',action:()=>pinMessage(contextMenu.msgId)},
            {icon:Star,label:'Сохранить',action:()=>setContextMenu(null)},
            {icon:Trash2,label:'Удалить',action:()=>deleteMessage(contextMenu.msgId),danger:true},
          ].filter(i=>i.show!==false).map(({icon:Icon,label,action,danger})=>(
            <button key={label} onClick={action} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-left transition-colors"
              style={{color:danger?'#EF4444':bg.text}}
              onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background=bg.panelHover}
              onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='transparent'}>
              <Icon className="w-3.5 h-3.5 shrink-0"/>{label}
            </button>
          ))}
        </div>
      )}

      {/* Forward modal */}
      {forwardMsgId!==null&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={()=>setForwardMsgId(null)}>
          <div className="rounded-2xl shadow-2xl p-5 w-[360px]" style={{background:bg.panel}} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-[15px]" style={{color:bg.text}}>Переслать сообщение</h3><button onClick={()=>setForwardMsgId(null)} style={{color:bg.textSec}} className="hover:text-[#EF4444]"><X className="w-5 h-5"/></button></div>
            <div className="max-h-[280px] overflow-y-auto space-y-0.5">
              {chats.filter(c=>c.id!==activeChatId).map(chat=>(
                <div key={chat.id} className="flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer transition-colors"
                  onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background=bg.panelHover}
                  onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='transparent'}
                  onClick={()=>{
                    const fwd=activeChat.messages.find(m=>m.id===forwardMsgId);
                    const nm:Message={...(fwd as Message),id:Date.now(),time:nowStr(),outgoing:true,read:false,replyTo:undefined,forwardedFrom:activeChat.name};
                    setChats(prev=>prev.map(c=>c.id!==chat.id?c:{...c,messages:[...c.messages,nm]}));
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

      {/* Schedule modal */}
      {showSchedule&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={()=>setShowSchedule(false)}>
          <div className="rounded-2xl shadow-2xl p-6 w-[340px]" style={{background:bg.panel}} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-4"><Clock className="w-5 h-5 text-[#2481CC]"/><h3 className="font-semibold text-[15px]" style={{color:bg.text}}>Запланировать сообщение</h3></div>
            <div className="space-y-3 mb-4">
              <div><label className="text-[12px] font-medium mb-1 block" style={{color:bg.textSec}}>Дата</label><input type="date" value={scheduleDate} onChange={e=>setScheduleDate(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-[13px] outline-none" style={{borderColor:bg.panelBorder,background:bg.inputField,color:bg.text}}/></div>
              <div><label className="text-[12px] font-medium mb-1 block" style={{color:bg.textSec}}>Время</label><input type="time" value={scheduleTime} onChange={e=>setScheduleTime(e.target.value)} className="w-full border rounded-xl px-3 py-2 text-[13px] outline-none" style={{borderColor:bg.panelBorder,background:bg.inputField,color:bg.text}}/></div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>setShowSchedule(false)} className="flex-1 py-2 rounded-xl border text-[13px] font-medium" style={{borderColor:bg.panelBorder,color:bg.textSec}}>Отмена</button>
              <button onClick={()=>sendMessage(true)} className="flex-1 py-2 rounded-xl bg-[#2481CC] text-white text-[13px] font-medium hover:bg-[#1f73b8] transition-colors">Запланировать</button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox&&(
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={()=>setLightbox(null)}>
          <div className="relative" onClick={e=>e.stopPropagation()}>
            <div className={`w-[580px] h-[400px] rounded-2xl bg-gradient-to-tr ${lightbox.gradient} flex items-center justify-center`}><Camera className="w-14 h-14 text-white opacity-40"/></div>
            <div className="absolute top-3 right-3 flex gap-2">
              <button className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"><ZoomIn className="w-4 h-4"/></button>
              <button className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70"><ZoomOut className="w-4 h-4"/></button>
              <button onClick={()=>setLightbox(null)} className="w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500"><X className="w-4 h-4"/></button>
            </div>
          </div>
        </div>
      )}

      {/* Call overlay */}
      {callState&&(
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:callState.type==='video'?'#111':'linear-gradient(135deg,#1a237e,#283593)'}}>
          <div className="flex flex-col items-center gap-4">
            <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${activeChat.color} flex items-center justify-center text-white font-bold text-3xl shadow-2xl`}>{activeChat.avatar}</div>
            <h2 className="text-white font-bold text-[24px]">{activeChat.name}</h2>
            <p className="text-white/70 text-[16px]">{callState.status==='ringing'?(callState.type==='video'?'Видеозвонок…':'Вызов…'):fmtSecs(callState.seconds)}</p>
            {callState.status==='active'&&(
              <div className="flex items-center gap-4 mt-4">
                <button onClick={()=>setIsMuted(m=>!m)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isMuted?'bg-white text-slate-800':'bg-white/20 text-white hover:bg-white/30'}`}>{isMuted?<MicOff className="w-6 h-6"/>:<Mic className="w-6 h-6"/>}</button>
                {callState.type==='video'&&<button onClick={()=>setIsCamOff(c=>!c)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isCamOff?'bg-white text-slate-800':'bg-white/20 text-white hover:bg-white/30'}`}>{isCamOff?<VideoOff className="w-6 h-6"/>:<Video className="w-6 h-6"/>}</button>}
                <button onClick={()=>setIsSpeakerOff(s=>!s)} className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${isSpeakerOff?'bg-white text-slate-800':'bg-white/20 text-white hover:bg-white/30'}`}>{isSpeakerOff?<VolumeX className="w-6 h-6"/>:<Volume2 className="w-6 h-6"/>}</button>
                <button onClick={()=>{setCallState(null);setIsMuted(false);setIsCamOff(false);setIsSpeakerOff(false);}} className="w-14 h-14 rounded-full bg-[#EF4444] flex items-center justify-center text-white hover:bg-red-600"><PhoneOff className="w-6 h-6"/></button>
              </div>
            )}
            {callState.status==='ringing'&&(
              <div className="flex items-center gap-8 mt-6">
                <button onClick={()=>setCallState(null)} className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-full bg-[#EF4444] flex items-center justify-center"><PhoneOff className="w-6 h-6 text-white"/></div><span className="text-white/70 text-[13px]">Отклонить</span></button>
                <button onClick={()=>setCallState(s=>s?{...s,status:'active'}:null)} className="flex flex-col items-center gap-2"><div className="w-14 h-14 rounded-full bg-[#4DCA65] flex items-center justify-center"><Phone className="w-6 h-6 text-white"/></div><span className="text-white/70 text-[13px]">Принять</span></button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(t=>(
          <div key={t.id} className="flex items-center gap-3 rounded-2xl shadow-2xl px-4 py-3 pointer-events-auto" style={{background:bg.panel,border:`1px solid ${bg.panelBorder}`,minWidth:270}}>
            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white font-semibold text-[13px] shrink-0`}>{t.avatar}</div>
            <div className="flex-1 min-w-0"><div className="font-semibold text-[13px]" style={{color:bg.text}}>{t.chatName}</div><div className="text-[12px] truncate" style={{color:bg.textSec}}>{t.text}</div></div>
            <button onClick={()=>setToasts(prev=>prev.filter(x=>x.id!==t.id))} style={{color:bg.textSec}} className="hover:text-[#EF4444] shrink-0"><X className="w-4 h-4"/></button>
          </div>
        ))}
      </div>
    </div>
  );
}
