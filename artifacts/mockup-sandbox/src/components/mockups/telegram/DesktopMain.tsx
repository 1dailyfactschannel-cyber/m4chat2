import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  MessageCircle, Phone, Bookmark, Settings, Users, Search, Edit3,
  Video, MoreHorizontal, Paperclip, Smile, Send, CheckCheck, Play,
  X, Reply, Trash2, Copy, Forward, Pin, Mic, BellOff, Star,
  Moon, Sun, Image, ChevronRight, Info, MoreVertical, Check,
  UserCheck, Mail, Hash, Clock, Camera
} from 'lucide-react';

type Reaction = { emoji: string; count: number; mine: boolean };
type Message = {
  id: number; text: string; time: string; outgoing: boolean;
  type: 'text' | 'image' | 'voice'; read?: boolean;
  replyTo?: number; edited?: boolean;
  reactions?: Reaction[];
};
type Chat = {
  id: number; name: string; avatar: string; color: string;
  status: string; statusColor: string; time: string;
  unread: number | null; muted?: boolean;
  bio?: string; phone?: string; username?: string;
  pinnedMsgId?: number;
  messages: Message[];
};

const now = () => {
  const d = new Date();
  return d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0');
};

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
  { id: 'default', label: 'Default', preview: '#F0F2F5' },
  { id: 'pattern', label: 'Pattern', preview: 'dots' },
  { id: 'gradient', label: 'Gradient', preview: 'linear-gradient(135deg,#667eea,#764ba2)' },
  { id: 'nature', label: 'Nature', preview: 'linear-gradient(135deg,#56ab2f,#a8e063)' },
  { id: 'dark', label: 'Dark', preview: '#1a1a2e' },
];

const INITIAL_CHATS: Chat[] = [
  { id:1, name:'Telegram', avatar:'T', color:'from-blue-400 to-blue-500', status:'bot', statusColor:'#8E8E93', time:'10:42', unread:null,
    bio:'Official Telegram notifications.', phone:'', username:'@telegram',
    messages:[
      {id:1,text:'Welcome to Telegram! This is the official notification channel.',time:'10:40',outgoing:false,type:'text'},
      {id:2,text:'Your account has been successfully set up.',time:'10:42',outgoing:false,type:'text'},
    ]},
  { id:2, name:'Night Owl Club', avatar:'N', color:'from-purple-400 to-purple-600', status:'14 members', statusColor:'#8E8E93', time:'9:15', unread:3,
    bio:'We stay up late and code things.', phone:'', username:'@nightowls',
    messages:[
      {id:1,text:'Are we still on for tonight?',time:'9:10',outgoing:false,type:'text'},
      {id:2,text:'Yes! I will bring snacks.',time:'9:12',outgoing:true,type:'text',read:true},
      {id:3,text:'David: Awesome, see you at 9!',time:'9:15',outgoing:false,type:'text'},
    ]},
  { id:3, name:'Alice', avatar:'A', color:'from-pink-400 to-pink-500', status:'online', statusColor:'#4DCA65', time:'Yesterday', unread:null,
    bio:'Designer & coffee lover. Always looking for new inspiration.', phone:'+1 (555) 234-5678', username:'@alicejohnson',
    pinnedMsgId: 3,
    messages:[
      {id:1,text:'Hi there! Did you get a chance to look at the project files?',time:'10:20',outgoing:false,type:'text'},
      {id:2,text:'Yes, I just finished reviewing them. Looking good so far!',time:'10:25',outgoing:true,type:'text',read:true},
      {id:3,text:'Here is the mockup for the new dashboard.',time:'10:26',outgoing:false,type:'image'},
      {id:4,text:'',time:'10:30',outgoing:true,type:'voice',read:true},
      {id:5,text:'Awesome, let me know if you need any changes.',time:'10:32',outgoing:false,type:'text', reactions:[{emoji:'❤️',count:1,mine:true}]},
      {id:6,text:'I sent you the documents you requested. Check your email too!',time:'10:45',outgoing:false,type:'text'},
    ]},
  { id:4, name:'Bob Smith', avatar:'B', color:'from-green-400 to-green-600', status:'last seen 2h ago', statusColor:'#8E8E93', time:'Yesterday', unread:null,
    bio:'Software engineer. Coffee addict. Open source enthusiast.', phone:'+1 (555) 345-6789', username:'@bobsmith',
    messages:[
      {id:1,text:'Hey, are you free tomorrow for a quick call?',time:'14:00',outgoing:true,type:'text',read:true},
      {id:2,text:'Sure! What time works for you?',time:'14:05',outgoing:false,type:'text'},
      {id:3,text:'How about 3 PM?',time:'14:07',outgoing:true,type:'text',read:true},
      {id:4,text:'Sounds good to me! See you then.',time:'14:10',outgoing:false,type:'text'},
    ]},
  { id:5, name:'Work Team', avatar:'W', color:'from-orange-400 to-orange-500', status:'8 members', statusColor:'#8E8E93', time:'Mon', unread:12,
    bio:'Our product team workspace.', phone:'', username:'@workteam',
    messages:[
      {id:1,text:'Please review the latest PRs before EOD.',time:'9:00',outgoing:false,type:'text'},
      {id:2,text:'On it!',time:'9:05',outgoing:true,type:'text',read:true},
      {id:3,text:'Sarah: The new design looks great, nice work everyone!',time:'9:20',outgoing:false,type:'text'},
      {id:4,text:'Mike: Can we schedule a standup for tomorrow?',time:'9:35',outgoing:false,type:'text'},
      {id:5,text:'Sure, 10 AM works for me.',time:'9:40',outgoing:true,type:'text',read:false},
    ]},
  { id:6, name:'Mom', avatar:'M', color:'from-yellow-400 to-yellow-600', status:'last seen yesterday', statusColor:'#8E8E93', time:'Sun', unread:null,
    bio:'', phone:'+1 (555) 567-8901', username:'',
    messages:[
      {id:1,text:'Are you coming for dinner on Sunday?',time:'18:00',outgoing:false,type:'text'},
      {id:2,text:'Yes, I will be there at 7!',time:'18:05',outgoing:true,type:'text',read:true},
      {id:3,text:'Call me when you get home.',time:'22:30',outgoing:false,type:'text'},
    ]},
];

const AUTO_REPLIES = ['Got it, thanks!','Sure, sounds good.','I will check that out.','Thanks for letting me know!','On it.','Will do!','Perfect, thanks.','Interesting!','Makes sense!','I agree.'];

export function DesktopMain() {
  const [chats, setChats] = useState<Chat[]>(INITIAL_CHATS);
  const [activeChatId, setActiveChatId] = useState(3);
  const [inputText, setInputText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchMsg, setSearchMsg] = useState('');
  const [contextMenu, setContextMenu] = useState<{x:number;y:number;msgId:number}|null>(null);
  const [replyTo, setReplyTo] = useState<Message|null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [chatBg, setChatBg] = useState('default');
  const [showProfile, setShowProfile] = useState(false);
  const [forwardMsgId, setForwardMsgId] = useState<number|null>(null);
  const [editingMsgId, setEditingMsgId] = useState<number|null>(null);
  const [editText, setEditText] = useState('');
  const [showEmojiPanel, setShowEmojiPanel] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showBgPicker, setShowBgPicker] = useState(false);
  const [reactionPicker, setReactionPicker] = useState<number|null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  const d = darkMode;
  const activeChat = chats.find(c => c.id === activeChatId)!;
  const pinnedMsg = activeChat.pinnedMsgId
    ? activeChat.messages.find(m => m.id === activeChat.pinnedMsgId) : null;

  const filteredChats = chats.filter(c =>
    c.name.toLowerCase().includes(searchText.toLowerCase())
  );
  const filteredMessages = searchMsg
    ? activeChat.messages.filter(m => m.text.toLowerCase().includes(searchMsg.toLowerCase()))
    : activeChat.messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [activeChatId, activeChat?.messages.length]);

  useEffect(() => {
    if (editingMsgId) editInputRef.current?.focus();
  }, [editingMsgId]);

  const getBgStyle = (): React.CSSProperties => {
    if (chatBg === 'pattern') return {
      backgroundColor: d ? '#1a1a2e' : '#dfe6e9',
      backgroundImage: `radial-gradient(${d?'#ffffff18':'#00000010'} 1px, transparent 1px)`,
      backgroundSize: '20px 20px'
    };
    if (chatBg === 'gradient') return { background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)' };
    if (chatBg === 'nature') return { background:'linear-gradient(135deg,#56ab2f 0%,#a8e063 100%)' };
    if (chatBg === 'dark') return { backgroundColor:'#1a1a2e' };
    return { backgroundColor: d ? '#0d1117' : '#F0F2F5' };
  };

  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    const newMsg: Message = { id: Date.now(), text, time: now(), outgoing:true, type:'text', read:false, replyTo: replyTo?.id };
    setChats(prev => prev.map(c => c.id !== activeChatId ? c : { ...c, time: now(), messages:[...c.messages, newMsg] }));
    setInputText(''); setReplyTo(null); setShowEmojiPanel(false);
    inputRef.current?.focus();
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const reply: Message = { id: Date.now()+1, text: AUTO_REPLIES[Math.floor(Math.random()*AUTO_REPLIES.length)], time: now(), outgoing:false, type:'text' };
      setChats(prev => prev.map(c => c.id === activeChatId ? { ...c, messages:[...c.messages, reply] } : c));
    }, 2000);
  }, [inputText, activeChatId, replyTo]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
    if (e.key === 'Escape') { setReplyTo(null); setShowEmojiPanel(false); }
  };

  const saveEdit = () => {
    if (!editingMsgId) return;
    setChats(prev => prev.map(c => c.id !== activeChatId ? c : {
      ...c, messages: c.messages.map(m => m.id === editingMsgId ? { ...m, text: editText, edited:true } : m)
    }));
    setEditingMsgId(null); setEditText('');
  };

  const addReaction = (msgId: number, emoji: string) => {
    setChats(prev => prev.map(c => {
      if (c.id !== activeChatId) return c;
      return { ...c, messages: c.messages.map(m => {
        if (m.id !== msgId) return m;
        const existing = (m.reactions||[]).find(r => r.emoji === emoji);
        let reactions: Reaction[];
        if (existing) {
          reactions = existing.mine
            ? (m.reactions||[]).filter(r => r.emoji !== emoji)
            : (m.reactions||[]).map(r => r.emoji === emoji ? {...r, count:r.count+1, mine:true} : r);
        } else {
          reactions = [...(m.reactions||[]), {emoji, count:1, mine:true}];
        }
        return {...m, reactions};
      })};
    }));
    setReactionPicker(null);
  };

  const deleteMessage = (msgId: number) => {
    setChats(prev => prev.map(c => c.id !== activeChatId ? c : { ...c, messages: c.messages.filter(m => m.id !== msgId) }));
    setContextMenu(null);
  };

  const pinMessage = (msgId: number) => {
    setChats(prev => prev.map(c => c.id !== activeChatId ? c : { ...c, pinnedMsgId: c.pinnedMsgId === msgId ? undefined : msgId }));
    setContextMenu(null);
  };

  const openChat = (id: number) => {
    setActiveChatId(id);
    setChats(prev => prev.map(c => c.id === id ? {...c, unread:null} : c));
    setContextMenu(null); setReplyTo(null); setShowProfile(false);
    setEditingMsgId(null); setShowEmojiPanel(false);
  };

  const handleContextMenu = (e: React.MouseEvent, msgId: number) => {
    e.preventDefault();
    setContextMenu({x: Math.min(e.clientX, 1080), y: Math.min(e.clientY, 660), msgId});
    setReactionPicker(null);
  };

  // Theme helpers
  const bg = {
    nav: d ? '#0d1117' : '#17212B',
    panel: d ? '#161b22' : '#FFFFFF',
    panelBorder: d ? '#30363d' : '#EDEDED',
    panelHover: d ? '#21262d' : '#F5F5F5',
    activeChat: d ? '#2481CC' : '#2481CC',
    header: d ? '#161b22' : '#FFFFFF',
    msgIn: d ? '#2d333b' : '#FFFFFF',
    msgOut: '#2481CC',
    input: d ? '#21262d' : '#FFFFFF',
    inputField: d ? '#0d1117' : '#F1F1F1',
    text: d ? '#e6edf3' : '#1C1C1E',
    textSec: '#8E8E93',
    divider: d ? '#30363d' : '#EDEDED',
  };

  return (
    <div
      style={{width:'1280px',height:'800px',display:'flex',overflow:'hidden',fontFamily:'Inter, system-ui, sans-serif'}}
      onClick={() => { setContextMenu(null); setShowEmojiPanel(false); setReactionPicker(null); setShowBgPicker(false); }}
    >
      {/* Column 1 — Icon Nav */}
      <div className="w-[72px] shrink-0 flex flex-col items-center py-3 justify-between" style={{background:bg.nav}}>
        <div className="flex flex-col items-center w-full gap-0.5">
          <div className="w-9 h-9 flex items-center justify-center mb-4 mt-1">
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </div>
          {([
            {icon:MessageCircle, active:true},
            {icon:Phone, active:false},
            {icon:Users, active:false},
            {icon:Bookmark, active:false},
            {icon:Settings, active:false},
          ] as const).map(({icon:Icon, active}, idx) => (
            <div key={idx} className="w-full flex justify-center py-3 relative group cursor-pointer">
              {active && <div className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#2481CC] rounded-r-full"/>}
              <Icon className={`w-6 h-6 transition-colors ${active?'text-[#2481CC]':'text-[#8E8E93] group-hover:text-white'}`}/>
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center gap-3 mb-1">
          <button
            onClick={e => { e.stopPropagation(); setDarkMode(m => !m); }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8E8E93] hover:text-white transition-colors"
            title="Toggle dark mode"
          >
            {d ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
          </button>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer">JD</div>
        </div>
      </div>

      {/* Column 2 — Chat List */}
      <div className="w-[320px] shrink-0 flex flex-col" style={{background:bg.panel, borderRight:`1px solid ${bg.panelBorder}`}}>
        <div className="h-[54px] flex items-center justify-between px-4 shrink-0" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
          <h1 className="font-semibold text-[16px]" style={{color:bg.text}}>Telegram</h1>
          <div className="flex items-center gap-4" style={{color:bg.textSec}}>
            <Search className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors"/>
            <Edit3 className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors"/>
          </div>
        </div>
        <div className="px-3 py-2 shrink-0">
          <div className="rounded-full h-8 flex items-center px-3 gap-2" style={{background:bg.inputField}}>
            <Search className="w-4 h-4 shrink-0" style={{color:bg.textSec}}/>
            <input type="text" placeholder="Search" value={searchText} onChange={e=>setSearchText(e.target.value)}
              className="bg-transparent border-none outline-none text-[14px] w-full" style={{color:bg.text}}/>
            {searchText && <X className="w-4 h-4 cursor-pointer shrink-0" style={{color:bg.textSec}} onClick={()=>setSearchText('')}/>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map(chat => {
            const isActive = chat.id === activeChatId;
            const lastMsg = chat.messages.at(-1);
            return (
              <div key={chat.id} onClick={()=>openChat(chat.id)}
                className="flex items-center px-3 py-[5px] cursor-pointer transition-colors"
                style={{background: isActive ? bg.activeChat : 'transparent'}}
                onMouseEnter={e=>{if(!isActive)(e.currentTarget as HTMLDivElement).style.background=bg.panelHover;}}
                onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background=isActive?bg.activeChat:'transparent';}}>
                <div className="relative shrink-0 mr-3">
                  <div className={`w-[44px] h-[44px] rounded-full bg-gradient-to-br ${chat.color} flex items-center justify-center text-white font-semibold text-[14px]`}>{chat.avatar}</div>
                  {chat.status==='online' && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#4DCA65] border-2 border-white"/>}
                </div>
                <div className="flex-1 min-w-0 py-1" style={{borderBottom: isActive?'none':`1px solid ${bg.panelBorder}`}}>
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3 className="font-semibold text-[14px] truncate pr-2" style={{color: isActive?'white':bg.text}}>{chat.name}</h3>
                    <span className="text-[11px] whitespace-nowrap shrink-0" style={{color: isActive?'rgba(255,255,255,0.7)':bg.textSec}}>{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-[13px] truncate pr-2" style={{color: isActive?'rgba(255,255,255,0.75)':bg.textSec}}>
                      {lastMsg?.type==='image'?'Photo':lastMsg?.type==='voice'?'Voice message':lastMsg?.text}
                    </p>
                    <div className="flex items-center gap-1 shrink-0">
                      {chat.muted && <BellOff className="w-3 h-3" style={{color:bg.textSec}}/>}
                      {chat.unread ? (
                        <div className={`text-white text-[11px] font-semibold px-1.5 rounded-full min-w-[18px] text-center ${chat.muted?'bg-[#8E8E93]':'bg-[#2481CC]'} ${isActive?'!bg-white !text-[#2481CC]':''}`}>
                          {chat.unread}
                        </div>
                      ):null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Column 3 — Chat View */}
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Chat Header */}
        <div className="h-[54px] flex items-center justify-between px-5 shrink-0 z-10 shadow-sm"
          style={{background:bg.header, borderBottom:`1px solid ${bg.panelBorder}`}}>
          <button className="flex flex-col text-left hover:opacity-80 transition-opacity" onClick={e=>{e.stopPropagation();setShowProfile(p=>!p);}}>
            <h2 className="font-semibold text-[15px] leading-tight" style={{color:bg.text}}>{activeChat.name}</h2>
            <span className="text-[12px] leading-tight" style={{color: isTyping?'#4DCA65':activeChat.statusColor}}>
              {isTyping ? (
                <span className="flex items-center gap-1">
                  typing
                  <span className="flex gap-[2px] items-end h-3">
                    {[0,1,2].map(i=>(
                      <span key={i} className="w-[3px] h-[3px] rounded-full bg-[#4DCA65] animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>
                    ))}
                  </span>
                </span>
              ) : activeChat.status}
            </span>
          </button>
          <div className="flex items-center gap-4" style={{color:bg.textSec}}>
            {showSearchBar && (
              <input autoFocus type="text" placeholder="Search messages..." value={searchMsg}
                onChange={e=>setSearchMsg(e.target.value)}
                onKeyDown={e=>e.key==='Escape'&&(setShowSearchBar(false),setSearchMsg(''))}
                className="border rounded-full px-3 py-1 text-[13px] outline-none transition-colors"
                style={{borderColor:bg.panelBorder, background:bg.inputField, color:bg.text, width:180}}
                onClick={e=>e.stopPropagation()}/>
            )}
            <Search className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors"
              onClick={e=>{e.stopPropagation();setShowSearchBar(s=>!s);if(showSearchBar)setSearchMsg('');}}/>
            <Phone className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors"/>
            <Video className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors"/>
            <div className="relative">
              <MoreHorizontal className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors"
                onClick={e=>{e.stopPropagation();setShowBgPicker(p=>!p);}}/>
              {showBgPicker && (
                <div className="absolute right-0 top-7 bg-white rounded-xl shadow-2xl border border-[#EDEDED] p-3 z-50 w-[220px]"
                  onClick={e=>e.stopPropagation()}>
                  <div className="text-[13px] font-semibold text-[#1C1C1E] mb-2">Chat background</div>
                  <div className="grid grid-cols-5 gap-2">
                    {CHAT_BACKGROUNDS.map(bg2=>(
                      <button key={bg2.id} onClick={()=>{setChatBg(bg2.id);setShowBgPicker(false);}}
                        className={`w-10 h-10 rounded-lg border-2 transition-all ${chatBg===bg2.id?'border-[#2481CC] scale-110':'border-transparent hover:border-[#2481CC]/50'}`}
                        style={bg2.id==='dots'?{backgroundColor:'#dfe6e9'}:
                          bg2.preview.startsWith('linear')||bg2.preview.startsWith('radial')
                            ?{background:bg2.preview}:{backgroundColor:bg2.preview}}
                        title={bg2.label}/>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Info className="w-5 h-5 cursor-pointer hover:text-[#2481CC] transition-colors"
              onClick={e=>{e.stopPropagation();setShowProfile(p=>!p);}}/>
          </div>
        </div>

        {/* Pinned message */}
        {pinnedMsg && (
          <div className="flex items-center px-4 py-2 shrink-0 z-10 cursor-pointer hover:opacity-90 transition-opacity"
            style={{background: d?'#21262d':'#f0f7ff', borderBottom:`2px solid #2481CC`}}>
            <Pin className="w-4 h-4 text-[#2481CC] mr-2 shrink-0"/>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-[#2481CC]">Pinned message</div>
              <div className="text-[13px] truncate" style={{color:bg.text}}>
                {pinnedMsg.type==='text'?pinnedMsg.text:pinnedMsg.type==='image'?'Photo':'Voice message'}
              </div>
            </div>
            <button onClick={e=>{e.stopPropagation();setChats(prev=>prev.map(c=>c.id!==activeChatId?c:{...c,pinnedMsgId:undefined}));}}
              className="ml-2 text-[#8E8E93] hover:text-[#1C1C1E] transition-colors">
              <X className="w-4 h-4"/>
            </button>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-1" style={getBgStyle()}>
          <div className="flex justify-center mb-2">
            <div className="text-[12px] font-medium px-3 py-0.5 rounded-full"
              style={{background: chatBg==='gradient'||chatBg==='nature'||chatBg==='dark'?'rgba(0,0,0,0.35)':'rgba(0,0,0,0.12)', color:'white'}}>
              Today
            </div>
          </div>

          {filteredMessages.map(msg => {
            const replyMsg = msg.replyTo ? activeChat.messages.find(m=>m.id===msg.replyTo) : null;
            const highlighted = searchMsg && msg.text.toLowerCase().includes(searchMsg.toLowerCase());
            const isEditing = editingMsgId === msg.id;

            return (
              <div key={msg.id} className={`flex w-full group mb-0.5 ${msg.outgoing?'justify-end':'justify-start'}`}
                onContextMenu={e=>handleContextMenu(e,msg.id)}
                onDoubleClick={()=>{if(msg.outgoing&&msg.type==='text'){setEditingMsgId(msg.id);setEditText(msg.text);}}}
              >
                <div className="relative max-w-[65%]">
                  {/* Quick reaction bar on hover */}
                  {!isEditing && (
                    <div className={`absolute -top-8 ${msg.outgoing?'right-0':'left-0'} hidden group-hover:flex items-center gap-0.5 bg-white rounded-full shadow-lg px-2 py-1 z-20 border border-[#EDEDED]`}>
                      {QUICK_REACTIONS.map(emoji=>(
                        <button key={emoji} onClick={()=>addReaction(msg.id,emoji)}
                          className="text-[16px] w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F1F1F1] transition-colors hover:scale-125 transition-transform">
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Hover action buttons */}
                  {!isEditing && (
                    <div className={`absolute top-1/2 -translate-y-1/2 ${msg.outgoing?'-left-[72px]':'-right-[72px]'} hidden group-hover:flex items-center gap-1 z-10`}>
                      <button onClick={()=>{setReplyTo(msg);setContextMenu(null);}} className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center hover:bg-blue-50 transition-colors border border-[#EDEDED]">
                        <Reply className="w-3 h-3 text-[#8E8E93]"/>
                      </button>
                      <button onClick={e=>{e.stopPropagation();handleContextMenu(e as any, msg.id);}} className="w-6 h-6 rounded-full bg-white shadow flex items-center justify-center hover:bg-blue-50 transition-colors border border-[#EDEDED]">
                        <MoreHorizontal className="w-3 h-3 text-[#8E8E93]"/>
                      </button>
                    </div>
                  )}

                  {/* Edit mode */}
                  {isEditing ? (
                    <div className="flex items-center gap-2 bg-white rounded-2xl px-3 py-2 shadow-md border-2 border-[#2481CC]">
                      <input ref={editInputRef} value={editText} onChange={e=>setEditText(e.target.value)}
                        onKeyDown={e=>{if(e.key==='Enter')saveEdit();if(e.key==='Escape'){setEditingMsgId(null);setEditText('');}}}
                        className="border-none outline-none text-[15px] text-[#1C1C1E] flex-1 min-w-[200px]"/>
                      <button onClick={saveEdit} className="w-7 h-7 bg-[#2481CC] rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white"/>
                      </button>
                      <button onClick={()=>{setEditingMsgId(null);setEditText('');}} className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-[#F1F1F1]">
                        <X className="w-4 h-4 text-[#8E8E93]"/>
                      </button>
                    </div>
                  ) : msg.type==='text' ? (
                    <div className={`rounded-2xl px-4 py-2 shadow-sm ${highlighted?'ring-2 ring-yellow-400':''} ${msg.outgoing?'rounded-br-sm':'rounded-bl-sm'}`}
                      style={{background: msg.outgoing?bg.msgOut:bg.msgIn}}>
                      {replyMsg && (
                        <div className={`text-[12px] mb-2 pl-2 border-l-2 ${msg.outgoing?'border-blue-200 text-blue-100':'border-[#2481CC] text-[#2481CC]'} opacity-90`}>
                          <div className="font-semibold">{replyMsg.outgoing?'You':activeChat.name}</div>
                          <div className="truncate opacity-80">{replyMsg.type==='text'?replyMsg.text:replyMsg.type==='image'?'Photo':'Voice'}</div>
                        </div>
                      )}
                      <p className={`text-[15px] leading-relaxed pr-16 ${msg.outgoing?'text-white':''}`.trim()} style={!msg.outgoing?{color:bg.text}:{}}>{msg.text}</p>
                      <div className={`absolute bottom-1.5 right-2 flex items-center gap-1 ${msg.outgoing?'text-blue-100':'text-[#8E8E93]'}`}>
                        {msg.edited && <span className="text-[10px] opacity-70">edited</span>}
                        <span className="text-[11px]">{msg.time}</span>
                        {msg.outgoing && <CheckCheck className={`w-3.5 h-3.5 ${msg.read?'text-blue-200':'text-blue-200/60'}`}/>}
                      </div>
                    </div>
                  ) : msg.type==='image' ? (
                    <div className="rounded-2xl rounded-bl-sm shadow-sm overflow-hidden" style={{background:bg.msgIn}}>
                      <div className="w-[220px] h-[150px] bg-gradient-to-tr from-purple-400 to-pink-400 flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                        <Camera className="w-8 h-8 text-white opacity-70"/>
                      </div>
                      <div className="px-3 py-2 relative">
                        <p className="text-[14px] pr-12" style={{color:bg.text}}>Here is the mockup for the new dashboard.</p>
                        <span className="absolute bottom-2 right-3 text-[11px]" style={{color:bg.textSec}}>{msg.time}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl rounded-br-sm px-3 py-2.5 shadow-sm min-w-[220px]" style={{background:bg.msgOut}}>
                      <div className="flex items-center gap-3 pr-14">
                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shrink-0 cursor-pointer hover:scale-105 transition-transform">
                          <Play className="w-4 h-4 ml-0.5 text-[#2481CC]"/>
                        </div>
                        <div className="flex-1 flex gap-[2px] items-center h-7">
                          {[3,5,8,6,10,7,4,9,6,8,5,7,9,4,6,8,5,7,6,4].map((h,i)=>(
                            <div key={i} className="w-[3px] bg-blue-200 rounded-full" style={{height:`${h*9}%`}}/>
                          ))}
                        </div>
                        <span className="text-[12px] text-blue-100 shrink-0">0:12</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-100 mt-1 justify-end">
                        <span className="text-[11px]">{msg.time}</span>
                        <CheckCheck className="w-3.5 h-3.5"/>
                      </div>
                    </div>
                  )}

                  {/* Reactions display */}
                  {(msg.reactions||[]).length > 0 && (
                    <div className={`flex flex-wrap gap-1 mt-1 ${msg.outgoing?'justify-end':'justify-start'}`}>
                      {(msg.reactions||[]).map(r=>(
                        <button key={r.emoji} onClick={()=>addReaction(msg.id,r.emoji)}
                          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[13px] border transition-all hover:scale-110 ${r.mine?'bg-[#E8F4FF] border-[#2481CC]':'bg-white border-[#EDEDED]'}`}>
                          {r.emoji}<span className="text-[12px] font-medium text-[#1C1C1E]">{r.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {searchMsg && filteredMessages.length===0 && (
            <div className="flex flex-col items-center justify-center flex-1 gap-2" style={{color:bg.textSec}}>
              <Search className="w-10 h-10 opacity-30"/>
              <span className="text-[14px]">No messages found for "{searchMsg}"</span>
            </div>
          )}
          <div ref={messagesEndRef}/>
        </div>

        {/* Reply Banner */}
        {replyTo && (
          <div className="flex items-center gap-3 px-4 py-2 shrink-0" style={{background:bg.input, borderTop:`1px solid ${bg.panelBorder}`}}>
            <div className="w-1 h-8 bg-[#2481CC] rounded-full shrink-0"/>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-[#2481CC]">Reply to {replyTo.outgoing?'Yourself':activeChat.name}</div>
              <div className="text-[13px] truncate" style={{color:bg.textSec}}>
                {replyTo.type==='text'?replyTo.text:replyTo.type==='image'?'Photo':'Voice'}
              </div>
            </div>
            <button onClick={()=>setReplyTo(null)} style={{color:bg.textSec}} className="hover:text-[#EF4444] transition-colors">
              <X className="w-5 h-5"/>
            </button>
          </div>
        )}

        {/* Emoji Panel */}
        {showEmojiPanel && (
          <div className="absolute bottom-[70px] right-4 z-50 rounded-2xl shadow-2xl p-3 border"
            style={{background:bg.input, borderColor:bg.panelBorder, width:320}}
            onClick={e=>e.stopPropagation()}>
            <div className="grid grid-cols-8 gap-1">
              {EMOJI_GRID.map((emoji,i)=>(
                <button key={i} onClick={()=>{setInputText(t=>t+emoji); inputRef.current?.focus();}}
                  className="w-8 h-8 flex items-center justify-center text-[18px] rounded-lg hover:bg-[#F1F1F1] transition-colors hover:scale-125">
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{background:bg.input, borderTop:`1px solid ${bg.panelBorder}`}}>
          <button className="hover:text-[#2481CC] transition-colors shrink-0" style={{color:bg.textSec}}>
            <Paperclip className="w-5 h-5"/>
          </button>
          <div className="flex-1 flex items-center px-4 h-10 gap-2 rounded-2xl" style={{background:bg.inputField}}>
            <input ref={inputRef} type="text" placeholder="Write a message..." value={inputText}
              onChange={e=>setInputText(e.target.value)} onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-[15px]"
              style={{color:bg.text}} onClick={e=>e.stopPropagation()}/>
            <button onClick={e=>{e.stopPropagation();setShowEmojiPanel(p=>!p);}}
              className="hover:text-[#2481CC] transition-colors shrink-0" style={{color:bg.textSec}}>
              <Smile className="w-5 h-5"/>
            </button>
          </div>
          <button onClick={sendMessage}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${inputText.trim()?'bg-[#2481CC] hover:bg-[#1f73b8]':'hover:bg-[#F1F1F1]'}`}
            style={!inputText.trim()?{background:bg.inputField}:{}}>
            {inputText.trim() ? <Send className="w-4 h-4 text-white ml-0.5"/> : <Mic className="w-4 h-4" style={{color:bg.textSec}}/>}
          </button>
        </div>
      </div>

      {/* Right — Contact Profile Panel */}
      {showProfile && (
        <div className="w-[280px] shrink-0 flex flex-col overflow-y-auto" style={{background:bg.panel, borderLeft:`1px solid ${bg.panelBorder}`}}>
          <div className="flex items-center justify-between px-4 h-[54px] shrink-0" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
            <span className="font-semibold text-[15px]" style={{color:bg.text}}>Profile</span>
            <button onClick={()=>setShowProfile(false)} style={{color:bg.textSec}} className="hover:text-[#EF4444] transition-colors">
              <X className="w-5 h-5"/>
            </button>
          </div>
          <div className="flex flex-col items-center px-4 pt-6 pb-4">
            <div className={`w-[80px] h-[80px] rounded-full bg-gradient-to-br ${activeChat.color} flex items-center justify-center text-white font-bold text-2xl mb-3`}>
              {activeChat.avatar}
            </div>
            <h3 className="font-bold text-[18px] mb-0.5" style={{color:bg.text}}>{activeChat.name}</h3>
            {activeChat.status==='online'
              ? <span className="text-[13px] font-medium text-[#4DCA65]">online</span>
              : <span className="text-[13px]" style={{color:bg.textSec}}>{activeChat.status}</span>}
            <div className="flex gap-4 mt-4">
              {[{icon:MessageCircle,label:'Message'},{icon:Phone,label:'Call'},{icon:Video,label:'Video'}].map(({icon:Icon,label})=>(
                <div key={label} className="flex flex-col items-center gap-1 cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-[#E8F4FF] flex items-center justify-center group-hover:bg-[#2481CC] transition-colors">
                    <Icon className="w-5 h-5 text-[#2481CC] group-hover:text-white transition-colors"/>
                  </div>
                  <span className="text-[11px] text-[#2481CC]">{label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-4 space-y-0 flex-1">
            {activeChat.phone && (
              <div className="flex items-center gap-3 py-3" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
                <Phone className="w-4 h-4 shrink-0" style={{color:bg.textSec}}/>
                <div>
                  <div className="text-[14px]" style={{color:bg.text}}>{activeChat.phone}</div>
                  <div className="text-[11px]" style={{color:bg.textSec}}>Mobile</div>
                </div>
              </div>
            )}
            {activeChat.username && (
              <div className="flex items-center gap-3 py-3" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
                <Hash className="w-4 h-4 shrink-0" style={{color:bg.textSec}}/>
                <div>
                  <div className="text-[14px]" style={{color:bg.text}}>{activeChat.username}</div>
                  <div className="text-[11px]" style={{color:bg.textSec}}>Username</div>
                </div>
              </div>
            )}
            {activeChat.bio && (
              <div className="flex items-start gap-3 py-3" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
                <Info className="w-4 h-4 shrink-0 mt-0.5" style={{color:bg.textSec}}/>
                <div>
                  <div className="text-[14px] leading-snug" style={{color:bg.text}}>{activeChat.bio}</div>
                  <div className="text-[11px]" style={{color:bg.textSec}}>Bio</div>
                </div>
              </div>
            )}
            <div className="py-3" style={{borderBottom:`1px solid ${bg.panelBorder}`}}>
              <div className="text-[13px] font-semibold mb-2" style={{color:bg.text}}>Shared media <span className="font-normal" style={{color:bg.textSec}}>{activeChat.messages.filter(m=>m.type==='image').length * 12}</span></div>
              <div className="grid grid-cols-3 gap-1">
                {['from-purple-400 to-pink-400','from-blue-400 to-cyan-400','from-green-400 to-teal-400','from-orange-400 to-red-400','from-indigo-400 to-purple-400','from-yellow-400 to-orange-400'].map((g,i)=>(
                  <div key={i} className={`h-16 rounded-lg bg-gradient-to-tr ${g} cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center`}>
                    <Image className="w-5 h-5 text-white opacity-70"/>
                  </div>
                ))}
              </div>
            </div>
            <div className="py-3">
              <button className="w-full text-left text-[14px] text-[#EF4444] hover:opacity-80 transition-opacity flex items-center gap-2">
                <X className="w-4 h-4"/> Block user
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div className="fixed rounded-xl shadow-2xl py-1 z-50 min-w-[190px] border overflow-hidden"
          style={{left:contextMenu.x, top:contextMenu.y, background:bg.panel, borderColor:bg.panelBorder}}
          onClick={e=>e.stopPropagation()}>
          {[
            {icon:Reply, label:'Reply', action:()=>{const m=activeChat.messages.find(x=>x.id===contextMenu.msgId);if(m)setReplyTo(m);setContextMenu(null);}},
            {icon:Edit3, label:'Edit', action:()=>{const m=activeChat.messages.find(x=>x.id===contextMenu.msgId);if(m?.outgoing&&m.type==='text'){setEditingMsgId(m.id);setEditText(m.text);}setContextMenu(null);}, show: activeChat.messages.find(m=>m.id===contextMenu.msgId)?.outgoing},
            {icon:Copy, label:'Copy text', action:()=>{const m=activeChat.messages.find(x=>x.id===contextMenu.msgId);if(m)navigator.clipboard?.writeText(m.text);setContextMenu(null);}},
            {icon:Forward, label:'Forward', action:()=>{setForwardMsgId(contextMenu.msgId);setContextMenu(null);}},
            {icon:Pin, label: activeChat.pinnedMsgId===contextMenu.msgId?'Unpin':'Pin message', action:()=>pinMessage(contextMenu.msgId)},
            {icon:Star, label:'Save to Saved', action:()=>setContextMenu(null)},
            {icon:Trash2, label:'Delete', action:()=>deleteMessage(contextMenu.msgId), danger:true},
          ].filter(item=>item.show!==false).map(({icon:Icon,label,action,danger})=>(
            <button key={label} onClick={action}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-[14px] transition-colors text-left`}
              style={{color:danger?'#EF4444':bg.text}}
              onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background=bg.panelHover}
              onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background='transparent'}>
              <Icon className="w-4 h-4 shrink-0"/>{label}
            </button>
          ))}
        </div>
      )}

      {/* Forward Modal */}
      {forwardMsgId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={()=>setForwardMsgId(null)}>
          <div className="rounded-2xl shadow-2xl p-5 w-[380px]" style={{background:bg.panel}} onClick={e=>e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[16px]" style={{color:bg.text}}>Forward message</h3>
              <button onClick={()=>setForwardMsgId(null)} style={{color:bg.textSec}} className="hover:text-[#EF4444] transition-colors"><X className="w-5 h-5"/></button>
            </div>
            <div className="rounded-full h-9 flex items-center px-3 gap-2 mb-3" style={{background:bg.inputField}}>
              <Search className="w-4 h-4" style={{color:bg.textSec}}/>
              <input type="text" placeholder="Search chats..." className="bg-transparent border-none outline-none text-[14px] flex-1" style={{color:bg.text}}/>
            </div>
            <div className="space-y-0 max-h-[280px] overflow-y-auto">
              {chats.filter(c=>c.id!==activeChatId).map(chat=>(
                <div key={chat.id} className="flex items-center gap-3 px-2 py-2.5 rounded-xl cursor-pointer transition-colors"
                  style={{}}
                  onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.background=bg.panelHover}
                  onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.background='transparent'}
                  onClick={()=>{
                    const fwd = activeChat.messages.find(m=>m.id===forwardMsgId);
                    if(fwd){
                      const newMsg: Message = {...fwd, id:Date.now(), time:now(), outgoing:true, read:false, replyTo:undefined};
                      setChats(prev=>prev.map(c=>c.id!==chat.id?c:{...c,messages:[...c.messages,newMsg]}));
                    }
                    setForwardMsgId(null);
                  }}>
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${chat.color} flex items-center justify-center text-white font-semibold text-[13px] shrink-0`}>{chat.avatar}</div>
                  <div>
                    <div className="text-[14px] font-semibold" style={{color:bg.text}}>{chat.name}</div>
                    <div className="text-[12px]" style={{color:bg.textSec}}>{chat.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
