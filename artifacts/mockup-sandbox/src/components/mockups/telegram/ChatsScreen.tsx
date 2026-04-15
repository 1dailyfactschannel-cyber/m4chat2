import React, { useState } from "react";
import { 
  Search, 
  Edit3, 
  BellOff, 
  Pin,
  MessageCircle,
  PhoneCall,
  Users,
  Settings,
  X,
  Bookmark,
  Moon,
  User,
  ChevronRight,
  FolderOpen,
  Archive,
} from "lucide-react";

const FOLDERS = [
  { id: 'all', label: 'Все чаты' },
  { id: 'personal', label: 'Личные' },
  { id: 'work', label: 'Работа' },
  { id: 'unread', label: 'Непрочитанные' },
];

const NAV_ITEMS = [
  { icon: MessageCircle, label: 'Чаты', active: true },
  { icon: PhoneCall, label: 'Звонки', active: false },
  { icon: Users, label: 'Контакты', active: false },
  { icon: Bookmark, label: 'Избранное', active: false },
  { icon: Settings, label: 'Настройки', active: false },
];

export function ChatsScreen() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState('all');

  const chats = [
    {
      id: 1,
      name: "Telegram",
      message: "Telegram Desktop обновлён до версии 4.14...",
      time: "10:23",
      unread: 0,
      avatar: "bg-blue-500",
      initials: "T",
      isPinned: true,
      isVerified: true
    },
    {
      id: 2,
      name: "Ночная сова",
      message: "Кто хочет покодить?",
      time: "02:14",
      unread: 5,
      avatar: "bg-purple-500",
      initials: "НС",
      isMuted: true
    },
    {
      id: 3,
      name: "Алиса",
      message: "Конечно, давай встретимся в 17:00!",
      time: "Вчера",
      unread: 1,
      avatar: "bg-pink-500",
      initials: "А",
      isOnline: true
    },
    {
      id: 4,
      name: "Боб Смит",
      message: "Документы получил, спасибо.",
      time: "Вчера",
      unread: 0,
      avatar: "bg-green-500",
      initials: "БС"
    },
    {
      id: 5,
      name: "Рабочая группа",
      message: "Пожалуйста, проверьте PR до встречи.",
      time: "Пн",
      unread: 12,
      avatar: "bg-indigo-500",
      initials: "РГ"
    },
    {
      id: 6,
      name: "Дуров",
      message: "На следующей неделе запускаем новую функцию.",
      time: "Вс",
      unread: 0,
      avatar: "bg-sky-500",
      initials: "Д",
      isVerified: true,
      isOnline: true
    },
    {
      id: 7,
      name: "Новостной канал",
      message: "Срочно: акции технологических компаний выросли.",
      time: "Сб",
      unread: 145,
      avatar: "bg-orange-500",
      initials: "НК",
      isMuted: true
    },
    {
      id: 8,
      name: "Мама",
      message: "Позвони, когда доберёшься домой.",
      time: "Пт",
      unread: 0,
      avatar: "bg-rose-500",
      initials: "М"
    }
  ];

  return (
    <div className="w-[390px] h-[844px] bg-white overflow-hidden flex flex-col relative" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 pt-3 pb-2 text-[15px] font-semibold text-[#1C1C1E] bg-white">
        <div className="w-14">9:41</div>
        <div className="flex gap-1.5 items-center">
          <svg width="18" height="12" viewBox="0 0 18 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.5 10.5C11.5 11.0523 11.0523 11.5 10.5 11.5H1.5C0.947715 11.5 0.5 11.0523 0.5 10.5V1.5C0.5 0.947715 0.947715 0.5 1.5 0.5H10.5C11.0523 0.5 11.5 0.947715 11.5 1.5V10.5Z" stroke="currentColor"/>
            <rect x="2" y="2" width="8" height="8" rx="0.5" fill="currentColor"/>
            <path d="M13 4V8" stroke="currentColor" strokeLinecap="round"/>
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.5 11.5H15.5V0.5L0.5 11.5Z" fill="currentColor"/>
          </svg>
          <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 0.5C4.5 0.5 1.5 2 0 4L8 11.5L16 4C14.5 2 11.5 0.5 8 0.5Z" fill="currentColor"/>
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-[#E5E5EA]">
        <button className="p-2 text-[#1C1C1E]" onClick={() => setDrawerOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <h1 className="text-[20px] font-semibold text-[#1C1C1E]">Telegram</h1>
        <div className="flex gap-1 text-[#8E8E93]">
          <button className="p-2">
            <Search className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Folder Tabs */}
      <div className="flex overflow-x-auto bg-white border-b border-[#E5E5EA] shrink-0" style={{ scrollbarWidth: 'none' }}>
        {FOLDERS.map(f => (
          <button
            key={f.id}
            onClick={() => setActiveFolder(f.id)}
            className="px-4 py-2.5 text-[13px] font-medium whitespace-nowrap relative shrink-0 transition-colors"
            style={{ color: activeFolder === f.id ? '#2481CC' : '#8E8E93' }}
          >
            {f.label}
            {activeFolder === f.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#2481CC] rounded-t" />
            )}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2 bg-white">
        <div className="flex items-center bg-[#F2F3F5] rounded-full px-3 py-1.5">
          <Search className="w-5 h-5 text-[#8E8E93] mr-2" />
          <input 
            type="text" 
            placeholder="Поиск" 
            className="bg-transparent border-none outline-none text-[16px] text-[#1C1C1E] placeholder:text-[#8E8E93] w-full"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto bg-white">
        {chats.map((chat, index) => (
          <div key={chat.id} className="flex items-center px-4 py-2 cursor-pointer active:bg-[#F2F3F5]">
            <div className="relative mr-3 flex-shrink-0">
              <div className={`w-[56px] h-[56px] rounded-full flex items-center justify-center text-white text-[20px] font-semibold ${chat.avatar}`}>
                {chat.initials}
              </div>
              {chat.isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#40C351] border-2 border-white rounded-full"></div>
              )}
            </div>
            
            <div className={`flex-1 min-w-0 py-2 ${index !== chats.length - 1 ? 'border-b border-[#E5E5EA]' : ''}`}>
              <div className="flex justify-between items-baseline mb-1">
                <div className="flex items-center gap-1 min-w-0">
                  <h2 className="text-[16px] font-bold text-[#1C1C1E] truncate">{chat.name}</h2>
                  {chat.isMuted && <BellOff className="w-3.5 h-3.5 text-[#8E8E93] flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <span className="text-[12px] font-medium text-[#8E8E93]">{chat.time}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-[14px] text-[#8E8E93] truncate mr-2">{chat.message}</p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {chat.isPinned && <Pin className="w-3.5 h-3.5 text-[#8E8E93] rotate-45" />}
                  {chat.unread > 0 && (
                    <div className="bg-[#2481CC] text-white text-[12px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5">
                      {chat.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAB */}
      <button className="absolute bottom-6 right-4 w-[56px] h-[56px] bg-[#2481CC] rounded-full flex items-center justify-center text-white shadow-[0_4px_14px_rgba(36,129,204,0.4)] hover:bg-[#1E70B3] transition-colors">
        <Edit3 className="w-6 h-6 text-white" />
      </button>

      {/* Drawer Overlay */}
      {drawerOpen && (
        <div className="absolute inset-0 z-50 flex">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          
          {/* Drawer */}
          <div className="relative w-[300px] h-full bg-white flex flex-col shadow-2xl z-10">
            {/* Drawer Header / Profile */}
            <div className="bg-[#2481CC] px-5 pt-10 pb-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-[64px] h-[64px] rounded-full bg-white/20 flex items-center justify-center text-white text-[24px] font-bold">
                  JD
                </div>
                <button onClick={() => setDrawerOpen(false)} className="text-white/70 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="text-white font-bold text-[18px]">Иван Иванов</div>
              <div className="text-white/70 text-[14px] mt-0.5">@ivanov</div>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 overflow-y-auto py-2">
              {NAV_ITEMS.map(({ icon: Icon, label, active }) => (
                <button
                  key={label}
                  className="w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-[#F2F3F5]"
                  style={{ color: active ? '#2481CC' : '#1C1C1E' }}
                >
                  <Icon className="w-5 h-5 shrink-0" style={{ color: active ? '#2481CC' : '#8E8E93' }} />
                  <span className="text-[16px] font-medium">{label}</span>
                  {active && <div className="ml-auto w-2 h-2 rounded-full bg-[#2481CC]" />}
                </button>
              ))}

              <div className="mx-5 my-2 border-t border-[#E5E5EA]" />

              {/* Folders Section */}
              <div className="px-5 py-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wider">Папки</span>
                  <button className="text-[#2481CC] text-[12px] font-medium">Изменить</button>
                </div>
              </div>
              {FOLDERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => { setActiveFolder(f.id); setDrawerOpen(false); }}
                  className="w-full flex items-center gap-4 px-5 py-3 text-left transition-colors hover:bg-[#F2F3F5]"
                  style={{ color: activeFolder === f.id ? '#2481CC' : '#1C1C1E' }}
                >
                  <FolderOpen className="w-5 h-5 shrink-0" style={{ color: activeFolder === f.id ? '#2481CC' : '#8E8E93' }} />
                  <span className="text-[16px]">{f.label}</span>
                  {activeFolder === f.id && <ChevronRight className="ml-auto w-4 h-4 text-[#2481CC]" />}
                </button>
              ))}

              <div className="mx-5 my-2 border-t border-[#E5E5EA]" />

              <button className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-[#F2F3F5] transition-colors">
                <Archive className="w-5 h-5 text-[#8E8E93]" />
                <span className="text-[16px] text-[#1C1C1E]">Архив</span>
              </button>
              <button className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-[#F2F3F5] transition-colors">
                <Moon className="w-5 h-5 text-[#8E8E93]" />
                <span className="text-[16px] text-[#1C1C1E]">Ночной режим</span>
              </button>
              <button className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-[#F2F3F5] transition-colors">
                <User className="w-5 h-5 text-[#8E8E93]" />
                <span className="text-[16px] text-[#1C1C1E]">Добавить аккаунт</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
