import React from 'react';
import { MessageCircle, Phone, Bookmark, Settings, Users, Search, Edit3, Bell, Shield, Database, Palette, Globe, Star, Monitor, HelpCircle, LogOut, ChevronRight } from 'lucide-react';

export function DesktopSettings() {
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
          <div className="w-full flex justify-center py-3">
            <Users className="w-6 h-6 text-[#8E8E93] hover:text-white transition-colors cursor-pointer" />
          </div>
          <div className="w-full flex justify-center py-3">
            <Bookmark className="w-6 h-6 text-[#8E8E93] hover:text-white transition-colors cursor-pointer" />
          </div>
          <div className="w-full flex justify-center py-3 relative">
            <div className="absolute left-0 top-1 bottom-1 w-1 bg-[#2481CC] rounded-r-md"></div>
            <Settings className="w-6 h-6 text-[#2481CC]" />
          </div>
        </div>
        
        {/* User Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium text-sm mt-4 cursor-pointer ring-2 ring-[#2481CC] ring-offset-2 ring-offset-[#1C2733]">
          JD
        </div>
      </div>

      {/* Column 2 - Settings Navigation */}
      <div className="w-[340px] shrink-0 bg-[#FFFFFF] border-r border-[#EDEDED] flex flex-col">
        {/* Header */}
        <div className="h-[60px] flex items-center px-4 shrink-0">
          <h1 className="font-semibold text-[16px] text-[#1C1C1E]">Settings</h1>
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

        {/* User Profile Summary */}
        <div className="flex items-center px-4 py-3 border-b border-[#EDEDED] cursor-pointer hover:bg-[#F1F1F1]">
          <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-xl shrink-0 mr-4">
            JD
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[15px] text-[#1C1C1E] truncate">John Doe</h3>
            <p className="text-[13px] text-[#8E8E93] truncate">+1 (555) 012-3456</p>
            <p className="text-[13px] text-[#8E8E93] truncate">@johndoe</p>
          </div>
        </div>

        {/* Settings List */}
        <div className="flex-1 overflow-y-auto py-2">
          {[
            { icon: Settings, label: "My Account", active: true },
            { icon: Bell, label: "Notifications", active: false },
            { icon: Shield, label: "Privacy and Security", active: false },
            { icon: Database, label: "Data and Storage", active: false },
            { icon: Palette, label: "Appearance", active: false },
            { icon: Globe, label: "Language", active: false, extra: "English" },
            { icon: Star, label: "Telegram Premium", active: false, color: "text-[#8B5CF6]" },
            { icon: Monitor, label: "Devices", active: false, extra: "3" },
          ].map((item, i) => (
            <div key={i} className={`flex items-center px-4 py-2.5 cursor-pointer ${item.active ? 'bg-[#E8F4FF]' : 'hover:bg-[#F1F1F1]'}`}>
              <item.icon className={`w-[22px] h-[22px] mr-4 ${item.active ? 'text-[#2481CC]' : (item.color || 'text-[#8E8E93]')}`} />
              <span className="flex-1 font-medium text-[15px] text-[#1C1C1E]">{item.label}</span>
              {item.extra && (
                <span className="text-[14px] mr-2 text-[#8E8E93]">{item.extra}</span>
              )}
            </div>
          ))}

          <div className="h-2 bg-[#F1F1F1] my-2"></div>
          
          <div className="flex items-center px-4 py-2.5 cursor-pointer hover:bg-[#F1F1F1]">
            <HelpCircle className="w-[22px] h-[22px] text-[#8E8E93] mr-4" />
            <span className="flex-1 font-medium text-[15px] text-[#1C1C1E]">Telegram FAQ</span>
          </div>
        </div>
      </div>

      {/* Column 3 - Settings Detail (My Account) */}
      <div className="flex-1 bg-[#F1F1F1] flex flex-col">
        {/* Header */}
        <div className="h-[60px] bg-white border-b border-[#EDEDED] flex items-center justify-between px-6 shrink-0">
          <h2 className="font-bold text-[15px] text-[#1C1C1E]">My Account</h2>
          <Edit3 className="w-5 h-5 text-[#8E8E93] cursor-pointer hover:text-[#1C1C1E]" />
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
          <div className="w-full max-w-xl">
            
            {/* Profile Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#EDEDED] overflow-hidden mb-6">
              <div className="p-8 flex flex-col items-center border-b border-[#EDEDED]">
                <div className="w-[96px] h-[96px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-4xl mb-2 relative group cursor-pointer">
                  JD
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>

              <div className="p-2">
                <div className="px-6 py-4 hover:bg-[#F8F8F8] cursor-pointer rounded-lg flex items-center justify-between group border-b border-transparent">
                  <div className="flex-1">
                    <p className="text-[#1C1C1E] font-medium text-[15px] mb-0.5">John Doe</p>
                    <p className="text-[#8E8E93] text-[13px]">Name</p>
                  </div>
                  <Edit3 className="w-5 h-5 text-[#8E8E93] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="h-[1px] bg-[#F1F1F1] mx-6"></div>

                <div className="px-6 py-4 hover:bg-[#F8F8F8] cursor-pointer rounded-lg flex items-center justify-between group">
                  <div className="flex-1">
                    <p className="text-[#1C1C1E] font-medium text-[15px] mb-0.5">@johndoe</p>
                    <p className="text-[#8E8E93] text-[13px]">Username</p>
                  </div>
                  <Edit3 className="w-5 h-5 text-[#8E8E93] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                
                <div className="h-[1px] bg-[#F1F1F1] mx-6"></div>

                <div className="px-6 py-4 hover:bg-[#F8F8F8] cursor-pointer rounded-lg flex items-center justify-between group">
                  <div className="flex-1">
                    <p className="text-[#1C1C1E] font-medium text-[15px] mb-0.5">+1 (555) 012-3456</p>
                    <p className="text-[#8E8E93] text-[13px]">Phone</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
                </div>

                <div className="h-[1px] bg-[#F1F1F1] mx-6"></div>

                <div className="px-6 py-4 hover:bg-[#F8F8F8] cursor-pointer rounded-lg group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-[#1C1C1E] font-medium text-[15px] mb-0.5 pr-8">Software Engineer. Tech enthusiast.</p>
                      <p className="text-[#8E8E93] text-[13px]">Bio</p>
                    </div>
                    <Edit3 className="w-5 h-5 text-[#8E8E93] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                  </div>
                  <p className="text-[#8E8E93] text-[12px] mt-3">Any details such as age, occupation or city.</p>
                </div>
              </div>
            </div>

            {/* Account Settings */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#EDEDED] overflow-hidden mb-6">
              <div className="p-2">
                <div className="px-6 py-4 hover:bg-[#F8F8F8] cursor-pointer rounded-lg flex items-center text-[#2481CC]">
                  <Phone className="w-5 h-5 mr-4" />
                  <span className="font-medium text-[15px]">Add Another Account</span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#EDEDED] overflow-hidden">
              <div className="p-2">
                <div className="px-6 py-4 hover:bg-[#FEF2F2] cursor-pointer rounded-lg flex items-center text-[#EF4444]">
                  <LogOut className="w-5 h-5 mr-4" />
                  <span className="font-medium text-[15px]">Log Out</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
