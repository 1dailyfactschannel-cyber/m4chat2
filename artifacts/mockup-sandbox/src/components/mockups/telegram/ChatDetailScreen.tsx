import React, { useState } from "react";
import { 
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Mic,
  Send,
  CheckCheck
} from "lucide-react";

export function ChatDetailScreen() {
  const [inputText, setInputText] = useState("");

  const messages = [
    { id: 1, text: "Hey! Are we still on for today?", time: "10:14 AM", isOut: false },
    { id: 2, text: "Yes, definitely!", time: "10:15 AM", isOut: true, read: true },
    { id: 3, text: "What time works best for you?", time: "10:15 AM", isOut: true, read: true },
    { id: 4, text: "How about 2 PM? We can meet at the coffee shop downtown.", time: "10:16 AM", isOut: false },
    { id: 5, text: "Sounds perfect. I'll bring the documents.", time: "10:18 AM", isOut: true, read: true },
    { id: 6, type: "image", time: "10:20 AM", isOut: false },
    { id: 7, text: "Wait, have you seen this? It's hilarious", time: "10:20 AM", isOut: false },
    { id: 8, text: "Haha! Yes, someone showed me that yesterday. Classic.", time: "10:22 AM", isOut: true, read: true },
    { id: 9, type: "voice", time: "10:25 AM", duration: "0:14", isOut: false },
    { id: 10, text: "Got it. See you at 2!", time: "10:26 AM", isOut: true, read: true },
    { id: 11, text: "See you! 👋", time: "10:27 AM", isOut: false },
  ];

  return (
    <div className="w-[390px] h-[844px] bg-[#F2F3F5] overflow-hidden flex flex-col relative" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Header Area */}
      <div className="bg-white border-b border-[#E5E5EA] z-10">
        {/* Status Bar */}
        <div className="flex justify-between items-center px-6 pt-3 pb-2 text-[15px] font-semibold text-[#1C1C1E]">
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
        <div className="flex justify-between items-center px-2 py-2">
          <div className="flex items-center gap-2">
            <button className="p-2 text-[#2481CC]">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-semibold">
                A
              </div>
              <div className="flex flex-col">
                <span className="text-[16px] font-bold text-[#1C1C1E] leading-tight">Alice</span>
                <span className="text-[12px] text-[#40C351] leading-tight">online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center text-[#2481CC]">
            <button className="p-2"><Video className="w-[22px] h-[22px]" /></button>
            <button className="p-2"><Phone className="w-[22px] h-[22px]" /></button>
            <button className="p-2"><MoreVertical className="w-[22px] h-[22px]" /></button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        <div className="flex justify-center my-2">
          <div className="bg-[#8E8E93]/20 px-3 py-1 rounded-full text-[12px] font-medium text-[#8E8E93]">
            Today
          </div>
        </div>

        {messages.map((msg) => (
          <div key={msg.id} className={`flex max-w-[80%] ${msg.isOut ? 'self-end' : 'self-start'}`}>
            <div 
              className={`relative px-3 py-2 ${
                msg.isOut 
                  ? 'bg-[#E1F3F4] rounded-[18px] rounded-br-sm' 
                  : 'bg-white rounded-[18px] rounded-bl-sm'
              } shadow-sm`}
            >
              {msg.type === 'image' ? (
                <div className="w-[200px] h-[150px] bg-purple-200 rounded-lg mb-1 flex items-center justify-center text-purple-700 font-semibold">
                  Image Attachment
                </div>
              ) : msg.type === 'voice' ? (
                <div className="flex items-center gap-2 mb-1 w-[200px]">
                  <button className="w-10 h-10 rounded-full bg-[#2481CC] flex items-center justify-center text-white">
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                  </button>
                  <div className="flex-1 flex gap-[3px] items-center h-6">
                    {[2, 4, 3, 5, 8, 4, 6, 2, 7, 3, 4, 2].map((h, i) => (
                      <div key={i} className="w-[3px] bg-[#2481CC]" style={{ height: `${h * 3}px`, borderRadius: '2px' }}></div>
                    ))}
                  </div>
                  <span className="text-[12px] font-medium text-[#2481CC]">{msg.duration}</span>
                </div>
              ) : (
                <p className="text-[16px] text-[#1C1C1E] leading-snug break-words pr-12 pb-2">{msg.text}</p>
              )}
              
              <div className={`absolute bottom-1 right-2 flex items-center gap-1 text-[12px] text-[#8E8E93]`}>
                <span>{msg.time}</span>
                {msg.isOut && msg.read && <CheckCheck className="w-[14px] h-[14px] text-[#2481CC]" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-[#F2F3F5] px-2 py-2 pb-8 flex items-end gap-2">
        <button className="p-2 text-[#8E8E93] mb-1">
          <Paperclip className="w-6 h-6" />
        </button>
        <div className="flex-1 bg-white rounded-full border border-[#E5E5EA] flex items-center px-1 min-h-[40px] py-1">
          <input 
            type="text" 
            placeholder="Message..." 
            className="flex-1 bg-transparent border-none outline-none px-3 text-[16px] text-[#1C1C1E] py-1"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
          <button className="p-2 text-[#8E8E93]">
            <Smile className="w-6 h-6" />
          </button>
        </div>
        <button className={`w-[40px] h-[40px] rounded-full flex items-center justify-center text-white transition-colors mb-1 ${inputText.trim() ? 'bg-[#2481CC]' : 'bg-transparent text-[#8E8E93]'}`}>
          {inputText.trim() ? <Send className="w-[20px] h-[20px] ml-1" /> : <Mic className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
}