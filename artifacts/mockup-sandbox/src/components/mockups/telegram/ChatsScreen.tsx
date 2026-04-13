import React from "react";
import { 
  Menu, 
  Search, 
  Edit3, 
  BellOff, 
  Pin,
  MessageCircle,
  PhoneCall,
  Users,
  Settings
} from "lucide-react";

export function ChatsScreen() {
  const chats = [
    {
      id: 1,
      name: "Telegram",
      message: "Telegram Desktop was updated to version 4.14...",
      time: "10:23",
      unread: 0,
      avatar: "bg-blue-500",
      initials: "T",
      isPinned: true,
      isVerified: true
    },
    {
      id: 2,
      name: "Night Owl Club",
      message: "Anyone up for some coding?",
      time: "02:14",
      unread: 5,
      avatar: "bg-purple-500",
      initials: "NO",
      isMuted: true
    },
    {
      id: 3,
      name: "Alice",
      message: "Sure, let's meet at 5 PM tomorrow. See you then!",
      time: "Yesterday",
      unread: 1,
      avatar: "bg-pink-500",
      initials: "A",
      isOnline: true
    },
    {
      id: 4,
      name: "Bob Smith",
      message: "Got the documents, thanks.",
      time: "Yesterday",
      unread: 0,
      avatar: "bg-green-500",
      initials: "BS"
    },
    {
      id: 5,
      name: "Work Team",
      message: "Please review the latest PRs before the meeting.",
      time: "Mon",
      unread: 12,
      avatar: "bg-indigo-500",
      initials: "WT"
    },
    {
      id: 6,
      name: "Durov",
      message: "We are launching a new feature next week.",
      time: "Sun",
      unread: 0,
      avatar: "bg-sky-500",
      initials: "D",
      isVerified: true,
      isOnline: true
    },
    {
      id: 7,
      name: "News Channel",
      message: "Breaking: Tech stocks rally after positive earnings.",
      time: "Sat",
      unread: 145,
      avatar: "bg-orange-500",
      initials: "NC",
      isMuted: true
    },
    {
      id: 8,
      name: "Mom",
      message: "Call me when you get home.",
      time: "Fri",
      unread: 0,
      avatar: "bg-rose-500",
      initials: "M"
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
        <button className="p-2 text-[#1C1C1E]">
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-[20px] font-semibold text-[#1C1C1E]">Telegram</h1>
        <div className="flex gap-1 text-[#8E8E93]">
          <button className="p-2">
            <Search className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2 bg-white">
        <div className="flex items-center bg-[#F2F3F5] rounded-full px-3 py-1.5">
          <Search className="w-5 h-5 text-[#8E8E93] mr-2" />
          <input 
            type="text" 
            placeholder="Search" 
            className="bg-transparent border-none outline-none text-[16px] text-[#1C1C1E] placeholder:text-[#8E8E93] w-full"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto pb-[83px] bg-white">
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
      <button className="absolute bottom-[99px] right-4 w-[56px] h-[56px] bg-[#2481CC] rounded-full flex items-center justify-center text-white shadow-[0_4px_14px_rgba(36,129,204,0.4)] hover:bg-[#1E70B3] transition-colors">
        <Edit3 className="w-6 h-6 text-white" />
      </button>

      {/* Bottom Tab Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[83px] bg-white border-t border-[#E5E5EA] flex justify-between px-6 pt-2 pb-8 z-10">
        <button className="flex flex-col items-center gap-1 text-[#8E8E93]">
          <PhoneCall className="w-6 h-6" />
          <span className="text-[10px] font-medium">Calls</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#2481CC]">
          <MessageCircle className="w-6 h-6 fill-current" />
          <span className="text-[10px] font-medium text-[#2481CC]">Chats</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#8E8E93]">
          <Users className="w-6 h-6" />
          <span className="text-[10px] font-medium">Contacts</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#8E8E93]">
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}