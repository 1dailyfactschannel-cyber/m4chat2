import React from "react";
import { 
  Search,
  MessageCircle,
  PhoneCall,
  Users,
  Settings,
  UserPlus,
  Radar
} from "lucide-react";

export function ContactsScreen() {
  const contacts = [
    { id: 1, name: "Alice", phone: "+1 (555) 123-4567", avatar: "bg-pink-500", initials: "A", online: true, letter: "A" },
    { id: 2, name: "Andrew", phone: "last seen recently", avatar: "bg-orange-500", initials: "A", online: false, letter: "A" },
    { id: 3, name: "Bob Smith", phone: "last seen 2 mins ago", avatar: "bg-green-500", initials: "BS", online: false, letter: "B" },
    { id: 4, name: "Charlie", phone: "+1 (555) 987-6543", avatar: "bg-purple-500", initials: "C", online: false, letter: "C" },
    { id: 5, name: "Chris", phone: "online", avatar: "bg-teal-500", initials: "C", online: true, letter: "C" },
    { id: 6, name: "David", phone: "last seen yesterday", avatar: "bg-blue-500", initials: "D", online: false, letter: "D" },
    { id: 7, name: "Durov", phone: "@durov", avatar: "bg-sky-500", initials: "D", online: true, letter: "D" },
    { id: 8, name: "Mom", phone: "+1 (555) 000-0000", avatar: "bg-rose-500", initials: "M", online: false, letter: "M" },
    { id: 9, name: "Zack", phone: "last seen recently", avatar: "bg-yellow-500", initials: "Z", online: false, letter: "Z" },
  ];

  const groupedContacts = contacts.reduce((acc, contact) => {
    if (!acc[contact.letter]) acc[contact.letter] = [];
    acc[contact.letter].push(contact);
    return acc;
  }, {} as Record<string, typeof contacts>);

  return (
    <div className="w-[390px] h-[844px] bg-white overflow-hidden flex flex-col relative" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 pt-3 pb-2 text-[15px] font-semibold text-[#1C1C1E] bg-white z-10">
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
      <div className="flex justify-between items-center px-4 py-2 bg-white border-b border-[#E5E5EA] z-10">
        <div className="w-10"></div>
        <h1 className="text-[20px] font-semibold text-[#1C1C1E]">Contacts</h1>
        <button className="p-2 text-[#2481CC] w-10 flex justify-end">
          <UserPlus className="w-6 h-6" />
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-2 bg-white z-10">
        <div className="flex items-center bg-[#F2F3F5] rounded-full px-3 py-1.5">
          <Search className="w-5 h-5 text-[#8E8E93] mr-2" />
          <input 
            type="text" 
            placeholder="Search" 
            className="bg-transparent border-none outline-none text-[16px] text-[#1C1C1E] placeholder:text-[#8E8E93] w-full"
          />
        </div>
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto pb-[83px] bg-white relative">
        <div className="flex items-center px-4 py-3 cursor-pointer active:bg-[#F2F3F5] border-b border-[#E5E5EA]">
          <div className="w-[44px] h-[44px] rounded-full bg-[#2481CC] flex items-center justify-center text-white mr-3">
            <Radar className="w-[22px] h-[22px]" />
          </div>
          <span className="text-[16px] font-semibold text-[#2481CC]">Find People Nearby</span>
        </div>

        {Object.entries(groupedContacts).map(([letter, items]) => (
          <div key={letter}>
            <div className="bg-[#F2F3F5] px-4 py-1 text-[14px] font-bold text-[#8E8E93]">
              {letter}
            </div>
            {items.map((contact, index) => (
              <div key={contact.id} className="flex items-center px-4 py-2 cursor-pointer active:bg-[#F2F3F5]">
                <div className="relative mr-3">
                  <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center text-white text-[16px] font-semibold ${contact.avatar}`}>
                    {contact.initials}
                  </div>
                  {contact.online && (
                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#40C351] border-2 border-white rounded-full"></div>
                  )}
                </div>
                
                <div className={`flex-1 min-w-0 py-2 ${index !== items.length - 1 ? 'border-b border-[#E5E5EA]' : ''}`}>
                  <h2 className="text-[16px] font-bold text-[#1C1C1E] truncate leading-tight">{contact.name}</h2>
                  <p className={`text-[14px] truncate leading-tight ${contact.online ? 'text-[#2481CC]' : 'text-[#8E8E93]'}`}>
                    {contact.phone}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ))}
        
        {/* A-Z Index Overlay */}
        <div className="absolute top-1/2 right-1 -translate-y-1/2 flex flex-col items-center gap-1 text-[10px] font-bold text-[#2481CC]">
          {['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','#'].map(char => (
            <span key={char} className="w-4 h-4 flex items-center justify-center">{char}</span>
          ))}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[83px] bg-white border-t border-[#E5E5EA] flex justify-between px-6 pt-2 pb-8 z-10">
        <button className="flex flex-col items-center gap-1 text-[#8E8E93]">
          <PhoneCall className="w-6 h-6" />
          <span className="text-[10px] font-medium">Calls</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#8E8E93]">
          <MessageCircle className="w-6 h-6" />
          <span className="text-[10px] font-medium">Chats</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#2481CC]">
          <Users className="w-6 h-6 fill-current" />
          <span className="text-[10px] font-medium text-[#2481CC]">Contacts</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-[#8E8E93]">
          <Settings className="w-6 h-6" />
          <span className="text-[10px] font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
}