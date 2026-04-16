import React from 'react';
import { MessageCircle, Phone, Bookmark, Settings, Users, Search, UserPlus, MapPin, Video, Bell, Ban, Info } from 'lucide-react';

export function DesktopContacts() {
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
          <div className="w-full flex justify-center py-3">
            <Phone className="w-6 h-6 text-[#8E8E93] hover:text-white transition-colors cursor-pointer" />
          </div>
          <div className="w-full flex justify-center py-3 relative">
            <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#2481CC] rounded-r-md"></div>
            <Users className="w-6 h-6 text-[#2481CC]" />
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

      {/* Column 2 - Contacts List */}
      <div className="w-[340px] shrink-0 bg-[#FFFFFF] border-r border-[#EDEDED] flex flex-col relative">
        {/* Header */}
        <div className="h-[60px] flex items-center justify-between px-4 shrink-0">
          <h1 className="font-semibold text-[16px] text-[#1C1C1E]">Contacts</h1>
          <div className="flex items-center text-[#8E8E93]">
            <UserPlus className="w-5 h-5 cursor-pointer hover:text-[#1C1C1E]" />
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-3 shrink-0">
          <div className="bg-[#F1F1F1] rounded-full h-9 flex items-center px-3">
            <Search className="w-4 h-4 text-[#8E8E93] mr-2 shrink-0" />
            <input 
              type="text" 
              placeholder="Search contacts" 
              className="bg-transparent border-none outline-none text-[14px] w-full text-[#1C1C1E] placeholder:text-[#8E8E93]"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto pr-6">
          {/* Special Action */}
          <div className="flex items-center px-4 py-3 cursor-pointer hover:bg-[#F1F1F1]">
            <div className="w-[44px] h-[44px] rounded-full bg-[#2481CC] flex items-center justify-center text-white shrink-0 mr-4">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="font-medium text-[15px] text-[#2481CC]">Find People Nearby</span>
          </div>

          <div className="h-2 bg-[#F1F1F1]"></div>

          {[
            { letter: "A", items: [
              { name: "Alice Johnson", info: "@alicejohnson", avatar: "AJ", color: "from-pink-400 to-pink-500", online: true, active: true },
              { name: "Andrew Smith", info: "last seen recently", avatar: "AS", color: "from-blue-400 to-blue-600", online: false, active: false }
            ]},
            { letter: "B", items: [
              { name: "Bob Martin", info: "last seen at 10:45 AM", avatar: "BM", color: "from-green-400 to-green-600", online: false, active: false },
              { name: "Brenda Lee", info: "last seen yesterday", avatar: "BL", color: "from-purple-400 to-purple-600", online: false, active: false }
            ]},
            { letter: "C", items: [
              { name: "Charlie Davis", info: "online", avatar: "CD", color: "from-orange-400 to-orange-500", online: true, active: false }
            ]},
            { letter: "D", items: [
              { name: "David Wilson", info: "last seen recently", avatar: "DW", color: "from-red-400 to-red-600", online: false, active: false },
              { name: "Diana Prince", info: "last seen a week ago", avatar: "DP", color: "from-pink-400 to-pink-500", online: false, active: false }
            ]},
          ].map((section, idx) => (
            <div key={idx}>
              <div className="bg-[#F8F8F8] px-4 py-1.5 text-[13px] font-semibold text-[#8E8E93]">
                {section.letter}
              </div>
              {section.items.map((contact, i) => (
                <div key={i} className={`flex items-center px-4 py-2 cursor-pointer ${contact.active ? 'bg-[#E8F4FF]' : 'hover:bg-[#F1F1F1]'}`}>
                  <div className="relative shrink-0 mr-4">
                    <div className={`w-[44px] h-[44px] rounded-full bg-gradient-to-br ${contact.color} flex items-center justify-center text-white font-medium text-lg`}>
                      {contact.avatar}
                    </div>
                    {contact.online && (
                      <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#4DCA65] border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 border-b border-transparent pb-1">
                    <h3 className="font-semibold text-[15px] truncate text-[#1C1C1E]">
                      {contact.name}
                    </h3>
                    <p className={`text-[13px] truncate ${contact.online ? 'text-[#2481CC]' : 'text-[#8E8E93]'}`}>
                      {contact.info}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Alphabet Index */}
        <div className="absolute right-0 top-32 bottom-8 w-6 flex flex-col justify-between items-center text-[10px] font-semibold text-[#8E8E93]">
          {['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'].map(l => (
            <span key={l} className="hover:text-[#2481CC] cursor-pointer w-full text-center">{l}</span>
          ))}
        </div>
      </div>

      {/* Column 3 - Contact Detail */}
      <div className="flex-1 bg-[#F1F1F1] flex flex-col">
        {/* Header */}
        <div className="h-[60px] bg-white border-b border-[#EDEDED] flex items-center px-6 shrink-0">
          <h2 className="font-bold text-[15px] text-[#1C1C1E]">Contact Info</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-[#EDEDED] overflow-hidden">
            {/* Profile Header */}
            <div className="p-8 flex flex-col items-center border-b border-[#EDEDED]">
              <div className="w-[96px] h-[96px] rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white font-bold text-4xl mb-4 relative">
                AJ
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-[#4DCA65] border-[3px] border-white rounded-full"></div>
              </div>
              <h2 className="text-[24px] font-bold text-[#1C1C1E] mb-1">Alice Johnson</h2>
              <p className="text-[#8E8E93] text-[15px] mb-6">online</p>

              <div className="flex gap-3 w-full justify-center">
                <button className="flex flex-col items-center justify-center gap-2 w-24 h-20 rounded-xl hover:bg-[#F1F1F1] text-[#2481CC] transition-colors">
                  <div className="bg-[#E8F4FF] p-3 rounded-full">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[13px] font-medium">Message</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 w-24 h-20 rounded-xl hover:bg-[#F1F1F1] text-[#2481CC] transition-colors">
                  <div className="bg-[#E8F4FF] p-3 rounded-full">
                    <Phone className="w-5 h-5" />
                  </div>
                  <span className="text-[13px] font-medium">Call</span>
                </button>
                <button className="flex flex-col items-center justify-center gap-2 w-24 h-20 rounded-xl hover:bg-[#F1F1F1] text-[#2481CC] transition-colors">
                  <div className="bg-[#E8F4FF] p-3 rounded-full">
                    <Video className="w-5 h-5" />
                  </div>
                  <span className="text-[13px] font-medium">Video</span>
                </button>
              </div>
            </div>

            {/* Info Section */}
            <div className="p-2">
              <div className="flex items-center px-6 py-4 hover:bg-[#F8F8F8] cursor-pointer rounded-lg">
                <div className="w-8 shrink-0 flex justify-center text-[#8E8E93]">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1 ml-4">
                  <p className="text-[#1C1C1E] font-medium text-[15px]">+1 (555) 234-5678</p>
                  <p className="text-[#8E8E93] text-[13px]">Mobile</p>
                </div>
              </div>
              <div className="flex items-center px-6 py-4 hover:bg-[#F8F8F8] cursor-pointer rounded-lg">
                <div className="w-8 shrink-0 flex justify-center text-[#8E8E93]">
                  <span className="font-bold text-lg">@</span>
                </div>
                <div className="flex-1 ml-4">
                  <p className="text-[#1C1C1E] font-medium text-[15px]">@alicejohnson</p>
                  <p className="text-[#8E8E93] text-[13px]">Username</p>
                </div>
              </div>
              <div className="flex items-center px-6 py-4 hover:bg-[#F8F8F8] cursor-pointer rounded-lg">
                <div className="w-8 shrink-0 flex justify-center text-[#8E8E93]">
                  <Info className="w-5 h-5" />
                </div>
                <div className="flex-1 ml-4">
                  <p className="text-[#1C1C1E] font-medium text-[15px]">Designer, coffee lover. Always looking for new inspiration.</p>
                  <p className="text-[#8E8E93] text-[13px]">Bio</p>
                </div>
              </div>
            </div>

            <div className="h-2 bg-[#F1F1F1] w-full border-t border-b border-[#EDEDED]"></div>

            {/* Shared Media */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[#1C1C1E] text-[15px]">Shared Media</h3>
                <span className="text-[#2481CC] text-[14px] cursor-pointer hover:underline font-medium">142</span>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="aspect-square bg-gradient-to-br from-indigo-100 to-purple-200 rounded-md cursor-pointer hover:opacity-90"></div>
                ))}
              </div>
            </div>

            <div className="h-2 bg-[#F1F1F1] w-full border-t border-b border-[#EDEDED]"></div>

            {/* Settings */}
            <div className="p-2">
              <div className="flex items-center justify-between px-6 py-4 hover:bg-[#F8F8F8] cursor-pointer rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 shrink-0 flex justify-center text-[#8E8E93]">
                    <Bell className="w-5 h-5" />
                  </div>
                  <span className="ml-4 text-[#1C1C1E] font-medium text-[15px]">Notifications</span>
                </div>
                <div className="w-9 h-5 bg-[#4DCA65] rounded-full relative">
                  <div className="w-[18px] h-[18px] bg-white rounded-full absolute right-[2px] top-[1px] shadow-sm"></div>
                </div>
              </div>
            </div>

            <div className="h-2 bg-[#F1F1F1] w-full border-t border-b border-[#EDEDED]"></div>

            {/* Actions */}
            <div className="p-2">
              <div className="flex items-center px-6 py-4 hover:bg-[#FEF2F2] cursor-pointer rounded-lg text-[#EF4444]">
                <div className="w-8 shrink-0 flex justify-center">
                  <Ban className="w-5 h-5" />
                </div>
                <span className="ml-4 font-medium text-[15px]">Block User</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
