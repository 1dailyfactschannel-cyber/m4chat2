import React from 'react';
import { MessageCircle, Phone, Bookmark, Settings, Users, Search, Edit3, Video, MoreHorizontal, Paperclip, Smile, Send, CheckCheck, Play } from 'lucide-react';

export function DesktopMain() {
  return (
    <div style={{ width: '1280px', height: '800px', display: 'flex', overflow: 'hidden', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Column 1 - Icon Nav */}
      <div className="w-[72px] shrink-0 bg-[#1C2733] flex flex-col items-center py-4 justify-between">
        <div className="flex flex-col items-center w-full">
          {/* Telegram Logo */}
          <div className="w-10 h-10 rounded-full flex items-center justify-center mb-6 text-white mt-2">
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
            </svg>
          </div>
          
          {/* Nav Icons */}
          <div className="w-full flex justify-center py-3 relative">
            <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#2481CC] rounded-r-md"></div>
            <MessageCircle className="w-6 h-6 text-[#2481CC]" />
          </div>
          <div className="w-full flex justify-center py-3">
            <Phone className="w-6 h-6 text-[#8E8E93] hover:text-white transition-colors cursor-pointer" />
          </div>
          <div className="w-full flex justify-center py-3">
            <Users className="w-6 h-6 text-[#8E8E93] hover:text-white transition-colors cursor-pointer" />
          </div>
          <div className="w-full flex justify-center py-3">
            <Bookmark className="w-6 h-6 text-[#8E8E93] hover:text-white transition-colors cursor-pointer" />
          </div>
          <div className="w-full flex justify-center py-3">
            <Settings className="w-6 h-6 text-[#8E8E93] hover:text-white transition-colors cursor-pointer" />
          </div>
        </div>
        
        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm mt-4 cursor-pointer">
          JD
        </div>
      </div>

      {/* Column 2 - Chat List */}
      <div className="w-[340px] shrink-0 bg-[#FFFFFF] border-r border-[#EDEDED] flex flex-col">
        {/* Header */}
        <div className="h-[60px] flex items-center justify-between px-4 shrink-0">
          <h1 className="font-semibold text-[16px] text-[#1C1C1E]">Telegram</h1>
          <div className="flex items-center gap-4 text-[#8E8E93]">
            <Search className="w-5 h-5 cursor-pointer hover:text-[#1C1C1E]" />
            <Edit3 className="w-5 h-5 cursor-pointer hover:text-[#1C1C1E]" />
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-3 shrink-0">
          <div className="bg-[#F1F1F1] rounded-full h-9 flex items-center px-3">
            <Search className="w-4 h-4 text-[#8E8E93] mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search" 
              className="bg-transparent border-none outline-none text-[14px] w-full text-[#1C1C1E] placeholder:text-[#8E8E93]"
            />
          </div>
        </div>

        {/* Chats List */}
        <div className="flex-1 overflow-y-auto">
          {[
            { name: "Telegram", text: "Service notifications", time: "10:42 AM", avatar: "T", color: "from-blue-400 to-blue-500", unread: null, active: false },
            { name: "Night Owl Club", text: "David: Are we still on for tonight?", time: "9:15 AM", avatar: "N", color: "from-purple-400 to-purple-600", unread: 3, active: false },
            { name: "Alice", text: "I sent you the documents you requested.", time: "Yesterday", avatar: "A", color: "from-pink-400 to-pink-500", unread: null, active: true },
            { name: "Bob Smith", text: "Sounds good to me! See you then.", time: "Yesterday", avatar: "B", color: "from-green-400 to-green-600", unread: null, active: false },
            { name: "Work Team", text: "Sarah: The new design looks great.", time: "Mon", avatar: "W", color: "from-orange-400 to-orange-500", unread: 12, active: false },
            { name: "Durov", text: "New features coming soon.", time: "Mon", avatar: "D", color: "from-blue-500 to-blue-700", unread: null, active: false },
            { name: "News Channel", text: "Market updates for this week.", time: "Sun", avatar: "NC", color: "from-red-400 to-red-600", unread: 1, active: false },
            { name: "Mom", text: "Call me when you get home.", time: "Sun", avatar: "M", color: "from-yellow-400 to-yellow-600", unread: null, active: false },
            { name: "Designer Chat", text: "Check out this new font.", time: "Last week", avatar: "DC", color: "from-indigo-400 to-indigo-600", unread: null, active: false }
          ].map((chat, i) => (
            <div key={i} className={`flex items-center px-3 py-2 cursor-pointer ${chat.active ? 'bg-[#E8F4FF]' : 'hover:bg-[#F1F1F1]'}`}>
              <div className={`w-[46px] h-[46px] rounded-full bg-gradient-to-br ${chat.color} flex items-center justify-center text-white font-medium text-lg shrink-0 mr-3`}>
                {chat.avatar}
              </div>
              <div className="flex-1 min-w-0 border-b border-[#EDEDED] pb-3 pt-1 relative">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-semibold text-[15px] truncate pr-2 text-[#1C1C1E]">{chat.name}</h3>
                  <span className="text-[12px] whitespace-nowrap text-[#8E8E93]">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center pr-1">
                  <p className="text-[14px] truncate pr-2 text-[#8E8E93]">{chat.text}</p>
                  {chat.unread && (
                    <div className="bg-[#2481CC] text-white text-[12px] font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {chat.unread}
                    </div>
                  )}
                </div>
                {chat.active && <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-[#E8F4FF]"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column 3 - Main Content (Chat View) */}
      <div className="flex-1 bg-[#F1F1F1] flex flex-col relative min-w-0">
        {/* Header */}
        <div className="h-[60px] bg-[#FFFFFF] border-b border-[#EDEDED] flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex flex-col">
            <h2 className="font-bold text-[15px] text-[#1C1C1E]">Alice</h2>
            <span className="text-[13px] text-[#4DCA65]">online</span>
          </div>
          <div className="flex items-center gap-6 text-[#8E8E93]">
            <Phone className="w-5 h-5 cursor-pointer hover:text-[#1C1C1E]" />
            <Video className="w-5 h-5 cursor-pointer hover:text-[#1C1C1E]" />
            <Search className="w-5 h-5 cursor-pointer hover:text-[#1C1C1E]" />
            <MoreHorizontal className="w-5 h-5 cursor-pointer hover:text-[#1C1C1E]" />
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 relative">
          <div className="flex justify-center mb-2 mt-4">
            <div className="bg-[#E4E4E4] text-[#1C1C1E] text-[13px] font-medium px-3 py-1 rounded-full opacity-60">
              Today
            </div>
          </div>

          {/* Incoming */}
          <div className="flex w-full mb-1">
            <div className="bg-[#FFFFFF] rounded-2xl rounded-bl-sm px-4 py-2 max-w-[70%] shadow-sm relative">
              <p className="text-[#1C1C1E] text-[15px] leading-relaxed pr-10">Hi there! Did you get a chance to look at the project files?</p>
              <span className="absolute bottom-1.5 right-2 text-[12px] text-[#8E8E93]">10:20 AM</span>
            </div>
          </div>

          {/* Outgoing */}
          <div className="flex w-full justify-end mb-1">
            <div className="bg-[#2481CC] rounded-2xl rounded-br-sm px-4 py-2 max-w-[70%] shadow-sm relative">
              <p className="text-white text-[15px] leading-relaxed pr-14">Yes, I just finished reviewing them. Looking good so far!</p>
              <div className="absolute bottom-1.5 right-2 flex items-center gap-1 text-blue-100">
                <span className="text-[12px]">10:25 AM</span>
                <CheckCheck className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* Incoming Image */}
          <div className="flex w-full mb-1">
            <div className="bg-[#FFFFFF] rounded-2xl rounded-bl-sm p-1.5 max-w-[70%] shadow-sm relative pb-7">
              <div className="w-[200px] h-[140px] rounded-xl bg-gradient-to-tr from-purple-400 to-pink-500 mb-1"></div>
              <p className="text-[#1C1C1E] text-[15px] px-2 pt-1 pb-1">Here is the mockup for the new dashboard.</p>
              <span className="absolute bottom-1.5 right-2 text-[12px] text-[#8E8E93]">10:26 AM</span>
            </div>
          </div>

          {/* Outgoing Voice */}
          <div className="flex w-full justify-end mb-1">
            <div className="bg-[#2481CC] rounded-2xl rounded-br-sm px-3 py-2 max-w-[70%] shadow-sm relative min-w-[220px]">
              <div className="flex items-center gap-3 pr-14 pb-1">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 cursor-pointer">
                  <Play className="w-5 h-5 ml-1 text-[#2481CC]" />
                </div>
                <div className="flex-1 flex gap-[3px] items-end h-6">
                  {[...Array(18)].map((_, i) => (
                    <div key={i} className="w-[3px] bg-blue-200 rounded-full" style={{ height: `${Math.max(20, Math.random() * 100)}%` }}></div>
                  ))}
                </div>
              </div>
              <div className="absolute bottom-1 right-2 flex items-center gap-1 text-blue-100">
                <span className="text-[12px]">10:30 AM</span>
                <CheckCheck className="w-4 h-4" />
              </div>
            </div>
          </div>
          
          {/* Incoming */}
          <div className="flex w-full mb-4">
            <div className="bg-[#FFFFFF] rounded-2xl rounded-bl-sm px-4 py-2 max-w-[70%] shadow-sm relative">
              <p className="text-[#1C1C1E] text-[15px] leading-relaxed pr-10">Awesome, let me know if you need any changes.</p>
              <span className="absolute bottom-1.5 right-2 text-[12px] text-[#8E8E93]">10:32 AM</span>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="bg-[#FFFFFF] px-4 py-3 flex items-center gap-3 shrink-0 shadow-[0_-1px_10px_rgba(0,0,0,0.03)] z-10">
          <Paperclip className="w-6 h-6 text-[#8E8E93] cursor-pointer hover:text-[#2481CC] shrink-0" />
          <div className="flex-1 bg-[#FFFFFF] rounded-xl flex items-center px-4 h-12 shadow-sm border border-transparent focus-within:border-[#2481CC] transition-colors">
            <input 
              type="text" 
              placeholder="Write a message..." 
              className="flex-1 bg-transparent border-none outline-none text-[15px] text-[#1C1C1E] placeholder:text-[#8E8E93]"
            />
            <Smile className="w-6 h-6 text-[#8E8E93] cursor-pointer hover:text-[#2481CC] ml-2 shrink-0" />
          </div>
          <div className="w-12 h-12 rounded-full bg-[#2481CC] flex items-center justify-center cursor-pointer hover:bg-[#1f73b8] shrink-0 shadow-sm">
            <Send className="w-5 h-5 text-white mr-0.5 mt-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
