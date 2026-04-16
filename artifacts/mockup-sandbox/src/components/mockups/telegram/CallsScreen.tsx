import React from "react";
import { 
  Search,
  MessageCircle,
  PhoneCall,
  Users,
  Settings,
  Filter,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Info
} from "lucide-react";

export function CallsScreen() {
  const calls = [
    { id: 1, name: "Alice", time: "10:14 AM", type: "missed", avatar: "bg-pink-500", initials: "A" },
    { id: 2, name: "Bob Smith", time: "Yesterday", duration: "5:20", type: "incoming", avatar: "bg-green-500", initials: "BS" },
    { id: 3, name: "Work Team", time: "Monday", duration: "12:45", type: "outgoing", avatar: "bg-indigo-500", initials: "WT" },
    { id: 4, name: "Mom", time: "Sunday", duration: "8:10", type: "incoming", avatar: "bg-rose-500", initials: "M" },
    { id: 5, name: "Durov", time: "Last week", type: "missed", avatar: "bg-sky-500", initials: "D" },
    { id: 6, name: "Alice", time: "Last week", duration: "1:05", type: "outgoing", avatar: "bg-pink-500", initials: "A" },
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
        <div className="w-10"></div>
        <h1 className="text-[20px] font-semibold text-[#1C1C1E]">Calls</h1>
        <button className="p-2 text-[#2481CC] w-10 flex justify-end">
          <Filter className="w-6 h-6" />
        </button>
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

      {/* Calls List */}
      <div className="flex-1 overflow-y-auto pb-[83px] bg-white">
        {calls.map((call, index) => (
          <div key={call.id} className="flex items-center px-4 py-2 cursor-pointer active:bg-[#F2F3F5]">
            <div className={`w-[48px] h-[48px] rounded-full flex items-center justify-center text-white text-[18px] font-semibold mr-3 ${call.avatar}`}>
              {call.initials}
            </div>
            
            <div className={`flex-1 min-w-0 py-2 flex items-center justify-between ${index !== calls.length - 1 ? 'border-b border-[#E5E5EA]' : ''}`}>
              <div className="flex flex-col">
                <span className={`text-[16px] font-bold ${call.type === 'missed' ? 'text-[#EF4444]' : 'text-[#1C1C1E]'}`}>
                  {call.name}
                </span>
                <div className="flex items-center gap-1 text-[14px] text-[#8E8E93] mt-0.5">
                  {call.type === 'missed' && <PhoneMissed className="w-[14px] h-[14px] text-[#EF4444]" />}
                  {call.type === 'incoming' && <PhoneIncoming className="w-[14px] h-[14px]" />}
                  {call.type === 'outgoing' && <PhoneOutgoing className="w-[14px] h-[14px]" />}
                  <span>{call.type === 'missed' ? 'Missed' : `Duration: ${call.duration}`}</span>
                  <span className="mx-1">•</span>
                  <span>{call.time}</span>
                </div>
              </div>
              
              <button className="p-2 text-[#2481CC]">
                <Info className="w-[22px] h-[22px]" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Tab Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[83px] bg-white border-t border-[#E5E5EA] flex justify-between px-6 pt-2 pb-8 z-10">
        <button className="flex flex-col items-center gap-1 text-[#2481CC]">
          <PhoneCall className="w-6 h-6 fill-current" />
          <span className="text-[10px] font-medium text-[#2481CC]">Calls</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#8E8E93]">
          <MessageCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium">Chats</span>
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