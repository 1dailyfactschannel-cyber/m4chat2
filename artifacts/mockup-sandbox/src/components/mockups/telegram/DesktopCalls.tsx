import React from 'react';
import { MessageCircle, Phone, Bookmark, Settings, Users, Search, Filter, ArrowUpRight, ArrowDownLeft, Info, Video } from 'lucide-react';

export function DesktopCalls() {
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
          <div className="w-full flex justify-center py-3">
            <MessageCircle className="w-6 h-6 text-[#8E8E93] hover:text-white transition-colors cursor-pointer" />
          </div>
          <div className="w-full flex justify-center py-3 relative">
            <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#2481CC] rounded-r-md"></div>
            <Phone className="w-6 h-6 text-[#2481CC]" />
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

      {/* Column 2 - Calls List */}
      <div className="w-[340px] shrink-0 bg-[#FFFFFF] border-r border-[#EDEDED] flex flex-col">
        {/* Header */}
        <div className="h-[60px] flex items-center justify-between px-4 shrink-0">
          <h1 className="font-semibold text-[16px] text-[#1C1C1E]">Calls</h1>
          <div className="flex items-center text-[#8E8E93]">
            <Filter className="w-5 h-5 cursor-pointer hover:text-[#1C1C1E]" />
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-3 shrink-0">
          <div className="bg-[#F1F1F1] rounded-full h-9 flex items-center px-3">
            <Search className="w-4 h-4 text-[#8E8E93] mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search calls" 
              className="bg-transparent border-none outline-none text-[14px] w-full text-[#1C1C1E] placeholder:text-[#8E8E93]"
            />
          </div>
        </div>

        {/* Calls List */}
        <div className="flex-1 overflow-y-auto">
          {[
            { name: "Alice", status: "Outgoing, 5:23", time: "10:30 AM", avatar: "A", color: "from-pink-400 to-pink-500", type: "out", active: true },
            { name: "Bob Smith", status: "Missed", time: "Yesterday", avatar: "B", color: "from-green-400 to-green-600", type: "missed", active: false },
            { name: "Work Team", status: "Incoming, 12:40", time: "Mon", avatar: "W", color: "from-orange-400 to-orange-500", type: "in", active: false },
            { name: "Alice", status: "Incoming, 2:15", time: "Sun", avatar: "A", color: "from-pink-400 to-pink-500", type: "in", active: false },
            { name: "Mom", status: "Outgoing, 45:10", time: "Sun", avatar: "M", color: "from-yellow-400 to-yellow-600", type: "out", active: false },
            { name: "David", status: "Missed", time: "Last week", avatar: "D", color: "from-purple-400 to-purple-600", type: "missed", active: false },
            { name: "Alice", status: "Outgoing, 1:02", time: "Last week", avatar: "A", color: "from-pink-400 to-pink-500", type: "out", active: false },
          ].map((call, i) => (
            <div key={i} className={`flex items-center px-3 py-2 cursor-pointer ${call.active ? 'bg-[#E8F4FF]' : 'hover:bg-[#F1F1F1]'}`}>
              <div className={`w-[44px] h-[44px] rounded-full bg-gradient-to-br ${call.color} flex items-center justify-center text-white font-medium text-lg shrink-0 mr-3`}>
                {call.avatar}
              </div>
              <div className="flex-1 min-w-0 border-b border-[#EDEDED] pb-3 pt-1 relative flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-semibold text-[15px] truncate ${call.type === 'missed' ? 'text-[#EF4444]' : 'text-[#1C1C1E]'}`}>
                      {call.name}
                    </h3>
                  </div>
                  <div className="flex items-center text-[14px]">
                    {call.type === 'out' && <ArrowUpRight className="w-4 h-4 mr-1 text-[#4DCA65]" />}
                    {call.type === 'in' && <ArrowDownLeft className="w-4 h-4 mr-1 text-[#2481CC]" />}
                    {call.type === 'missed' && <ArrowDownLeft className="w-4 h-4 mr-1 text-[#EF4444]" />}
                    <span className={`truncate ${call.type === 'missed' ? 'text-[#EF4444]' : 'text-[#8E8E93]'}`}>
                      {call.status}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[12px] whitespace-nowrap text-[#8E8E93]">{call.time}</span>
                  <Info className="w-5 h-5 text-[#8E8E93] hover:text-[#2481CC]" />
                </div>
                {call.active && <div className="absolute bottom-[-1px] left-0 right-0 h-[1px] bg-[#E8F4FF]"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Column 3 - Call Detail / New Call Panel */}
      <div className="flex-1 bg-[#F8F8F8] flex flex-col items-center justify-center">
        <div className="flex flex-col items-center max-w-md w-full p-8 rounded-2xl">
          {/* Big Avatar */}
          <div className="w-[100px] h-[100px] rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white font-bold text-4xl mb-6 shadow-sm">
            A
          </div>
          
          <h2 className="text-[28px] font-bold text-[#1C1C1E] mb-2">Alice</h2>
          <p className="text-[#8E8E93] text-[15px] mb-8">last seen recently</p>

          <div className="flex gap-4 w-full">
            <button className="flex-1 bg-[#2481CC] hover:bg-[#1f73b8] text-white py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors">
              <Phone className="w-5 h-5" />
              Voice Call
            </button>
            <button className="flex-1 bg-white border border-[#EDEDED] hover:bg-[#F1F1F1] text-[#1C1C1E] py-3.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors">
              <Video className="w-5 h-5 text-[#2481CC]" />
              Video Call
            </button>
          </div>

          <div className="w-full mt-10">
            <h3 className="text-[#8E8E93] text-[13px] font-semibold uppercase tracking-wider mb-3 px-1">Recent Calls</h3>
            <div className="bg-white rounded-xl border border-[#EDEDED] overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-[#EDEDED]">
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="w-5 h-5 text-[#4DCA65]" />
                  <div>
                    <p className="text-[#1C1C1E] font-medium text-[15px]">Outgoing Call</p>
                    <p className="text-[#8E8E93] text-[13px]">Today, 10:30 AM</p>
                  </div>
                </div>
                <span className="text-[#1C1C1E] text-[14px]">5:23</span>
              </div>
              <div className="flex items-center justify-between p-4 border-b border-[#EDEDED]">
                <div className="flex items-center gap-3">
                  <ArrowDownLeft className="w-5 h-5 text-[#2481CC]" />
                  <div>
                    <p className="text-[#1C1C1E] font-medium text-[15px]">Incoming Call</p>
                    <p className="text-[#8E8E93] text-[13px]">Sun, 2:15 PM</p>
                  </div>
                </div>
                <span className="text-[#1C1C1E] text-[14px]">2:15</span>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <ArrowUpRight className="w-5 h-5 text-[#4DCA65]" />
                  <div>
                    <p className="text-[#1C1C1E] font-medium text-[15px]">Outgoing Call</p>
                    <p className="text-[#8E8E93] text-[13px]">Last week</p>
                  </div>
                </div>
                <span className="text-[#1C1C1E] text-[14px]">1:02</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
