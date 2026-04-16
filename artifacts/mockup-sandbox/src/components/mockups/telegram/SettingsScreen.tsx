import React, { useState } from "react";
import { 
  Settings as SettingsIcon,
  User,
  Shield,
  MonitorSmartphone,
  Bell,
  Database,
  Palette,
  Globe,
  Star,
  HelpCircle,
  MessageSquare,
  Bug,
  ChevronRight,
  Camera,
  ArrowLeft
} from "lucide-react";

export function SettingsScreen() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="w-[390px] h-[844px] bg-[#F2F3F5] overflow-hidden flex flex-col relative" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Status Bar */}
      <div className="flex justify-between items-center px-6 pt-3 pb-2 text-[15px] font-semibold text-[#1C1C1E] bg-[#F2F3F5]">
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
      <div className="flex justify-between items-center px-4 py-2 bg-[#F2F3F5]">
        <button className="p-2 text-[#2481CC] flex items-center gap-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[20px] font-semibold text-[#1C1C1E]">Настройки</h1>
        <button className="p-2 text-[#2481CC] w-10 flex justify-end font-semibold text-[16px]">
          Изменить
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Profile Section */}
        <div className="bg-white px-4 py-6 flex flex-col items-center border-y border-[#E5E5EA] mt-2">
          <div className="relative mb-4">
            <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-tr from-[#2481CC] to-blue-400 flex items-center justify-center text-white text-[32px] font-bold">
              ИИ
            </div>
            <button className="absolute bottom-0 right-0 w-[28px] h-[28px] bg-white rounded-full flex items-center justify-center shadow-sm border border-[#E5E5EA]">
              <Camera className="w-[14px] h-[14px] text-[#2481CC]" />
            </button>
          </div>
          <h2 className="text-[20px] font-bold text-[#1C1C1E] mb-1">Иван Иванов</h2>
          <p className="text-[15px] text-[#8E8E93]">+7 (999) 012-34-56 • @ivanov</p>
        </div>

        {/* Settings Groups */}
        <div className="mt-8 bg-white border-y border-[#E5E5EA]">
          <SettingRow icon={<User className="w-5 h-5 text-[#2481CC]" />} label="Редактировать профиль" />
          <SettingRow icon={<Shield className="w-5 h-5 text-[#8E8E93]" />} label="Конфиденциальность и безопасность" />
          <SettingRow icon={<MonitorSmartphone className="w-5 h-5 text-orange-500" />} label="Активные сессии" noBorder />
        </div>

        <div className="mt-8 bg-white border-y border-[#E5E5EA]">
          <SettingRow icon={<Bell className="w-5 h-5 text-[#EF4444]" />} label="Уведомления" />
          <SettingRow icon={<Database className="w-5 h-5 text-[#40C351]" />} label="Данные и хранилище" />
          <SettingRow icon={<Palette className="w-5 h-5 text-[#2481CC]" />} label="Оформление" />
          <SettingRow icon={<Globe className="w-5 h-5 text-purple-500" />} label="Язык" value="Русский" noBorder />
        </div>

        <div className="mt-8 bg-white border-y border-[#E5E5EA]">
          <div className="flex items-center px-4 py-3 cursor-pointer active:bg-[#F2F3F5] bg-gradient-to-r from-purple-50 to-transparent">
            <div className="mr-3 text-purple-500"><Star className="w-5 h-5 fill-current" /></div>
            <div className="flex-1 flex items-center justify-between py-1">
              <span className="text-[16px] text-[#1C1C1E]">Telegram Premium</span>
              <ChevronRight className="w-5 h-5 text-[#8E8E93]" />
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white border-y border-[#E5E5EA]">
          <SettingRow icon={<HelpCircle className="w-5 h-5 text-orange-500" />} label="Задать вопрос" />
          <SettingRow icon={<MessageSquare className="w-5 h-5 text-[#2481CC]" />} label="Telegram FAQ" />
          <SettingRow icon={<Bug className="w-5 h-5 text-[#8E8E93]" />} label="Сообщить об ошибке" noBorder />
        </div>

        {/* Dark Mode */}
        <div className="mt-8 bg-white border-y border-[#E5E5EA]">
          <div className="flex items-center px-4 py-3 cursor-pointer" onClick={() => setDarkMode(m => !m)}>
            <span className="flex-1 text-[16px] text-[#1C1C1E]">Ночной режим</span>
            <div className={`w-[50px] h-[30px] rounded-full relative transition-colors ${darkMode ? 'bg-[#2481CC]' : 'bg-[#E5E5EA]'}`}>
              <div className={`absolute top-[2px] w-[26px] h-[26px] bg-white rounded-full shadow-sm transition-all ${darkMode ? 'left-[22px]' : 'left-[2px]'}`}></div>
            </div>
          </div>
        </div>

        {/* Log Out */}
        <div className="mt-8 mb-12">
          <button className="w-full bg-white border-y border-[#E5E5EA] py-3 text-center text-[#EF4444] text-[16px] font-semibold active:bg-[#F2F3F5]">
            Выйти
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingRow({ icon, label, badge, value, noBorder }: { icon: React.ReactNode, label: string, badge?: string, value?: string, noBorder?: boolean }) {
  return (
    <div className="flex items-center pl-4 cursor-pointer active:bg-[#F2F3F5]">
      <div className="mr-3">{icon}</div>
      <div className={`flex-1 flex items-center justify-between pr-4 py-3 ${!noBorder ? 'border-b border-[#E5E5EA]' : ''}`}>
        <span className="text-[16px] text-[#1C1C1E]">{label}</span>
        <div className="flex items-center gap-2 text-[#8E8E93]">
          {badge && (
            <div className="bg-[#2481CC] text-white text-[12px] font-bold rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1.5">
              {badge}
            </div>
          )}
          {value && <span className="text-[16px]">{value}</span>}
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
