import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageCircle, Phone, Bookmark, Settings, Users, Search, Edit3,
  Bell, Shield, Database, Palette, Globe, Star, Monitor, HelpCircle,
  LogOut, ChevronRight, Camera, Check, X, Smartphone, Laptop, Tablet,
  Moon, Sun, Volume2, VolumeX, Image, Type, Smile, Eye, EyeOff,
  Lock, Key, UserX, Wifi, HardDrive, Trash2, Download, Upload,
  AlertCircle, Plus, Crown, Zap, Clock, MapPin, Bot, Copy, RefreshCw,
} from 'lucide-react';
import { api } from '../../../lib/api';
import { useSettings } from '../../../hooks/useSettings';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { useTranslation } from '../../../hooks/useTranslation';

// ─── Toggle Component ─────────────────────────────────────────────────────────
const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
  <button onClick={() => onChange(!value)}
    className={`w-11 h-6 rounded-full transition-colors shrink-0 relative ${value ? 'bg-[#2481CC]' : 'bg-[#D1D1D6]'}`}>
    <div className={`absolute top-[2px] w-5 h-5 bg-white rounded-full shadow transition-all ${value ? 'left-[22px]' : 'left-[2px]'}`}/>
  </button>
);

// ─── Section Row ──────────────────────────────────────────────────────────────
const Row = ({ label, sub, value, chevron, danger, onClick, children }:
  { label: string; sub?: string; value?: string; chevron?: boolean; danger?: boolean; onClick?: () => void; children?: React.ReactNode }) => (
  <div onClick={onClick} className={`flex items-center px-5 py-3 group transition-colors ${onClick ? 'cursor-pointer hover:bg-[#F5F5F5]' : ''}`}>
    <div className="flex-1 min-w-0">
      <div className={`text-[14px] font-medium ${danger ? 'text-[#EF4444]' : 'text-[#1C1C1E]'}`}>{label}</div>
      {sub && <div className="text-[12px] text-[#8E8E93] mt-0.5">{sub}</div>}
    </div>
    {value && <span className="text-[13px] text-[#8E8E93] mr-2 shrink-0">{value}</span>}
    {children}
    {chevron && <ChevronRight className="w-4 h-4 text-[#C7C7CC] shrink-0 ml-1"/>}
  </div>
);

const Divider = () => <div className="h-px mx-5 bg-[#F0F0F0]"/>;
const SectionTitle = ({ label }: { label: string }) => <div className="px-5 pt-5 pb-1 text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wide">{label}</div>;

// ─── Card wrapper ─────────────────────────────────────────────────────────────
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-[#EDEDED] ${className}`}>{children}</div>
);

type Section = 'account' | 'notifications' | 'privacy' | 'data' | 'appearance' | 'language' | 'premium' | 'devices' | 'bots';

// ─── Account Section ──────────────────────────────────────────────────────────
const AccountSection = ({ onLogout }: { onLogout: () => void }) => {
  const { t } = useTranslation();
  const { profile, loading, updateProfile, uploadAvatar } = useUserProfile();
  const [editPhone, setEditPhone] = useState(false);
  const [editPhoneValue, setEditPhoneValue] = useState('');
  const [editEmail, setEditEmail] = useState(false);
  const [editEmailValue, setEditEmailValue] = useState('');
  const [editBio, setEditBio] = useState(false);
  const [editBioValue, setEditBioValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profile) {
      setEditPhoneValue(profile.phone || '');
      setEditEmailValue(profile.email || '');
      setEditBioValue(profile.bio || '');
    }
  }, [profile]);

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await uploadAvatar(file);
  };

  const savePhone = async () => {
    await updateProfile({ phone: editPhoneValue });
    setEditPhone(false);
  };
  const saveEmail = async () => {
    await updateProfile({ email: editEmailValue });
    setEditEmail(false);
  };
  const saveBio = async () => {
    await updateProfile({ bio: editBioValue });
    setEditBio(false);
  };

  const initials = profile?.username ? profile.username.slice(0, 2).toUpperCase() : '??';

  if (loading || !profile) {
    return (
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="text-[14px] text-[#8E8E93]">{t('general.loading')}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-[520px] mx-auto space-y-4">
        {/* Profile card */}
        <Card>
          <div className="flex flex-col items-center pt-8 pb-6 px-6 border-b border-[#F0F0F0]">
            <div onClick={handleAvatarClick} className="relative group cursor-pointer mb-4">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="avatar" className="w-[96px] h-[96px] rounded-full object-cover"/>
              ) : (
                <div className="w-[96px] h-[96px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-4xl">{initials}</div>
              )}
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-7 h-7 text-white"/>
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#2481CC] rounded-full flex items-center justify-center border-2 border-white">
                <Camera className="w-4 h-4 text-white"/>
              </div>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange}/>
            <h2 className="font-bold text-[20px] text-[#1C1C1E]">{profile.username}</h2>
            <p className="text-[13px] text-[#4DCA65] font-medium">
              {profile.isOnline ? t('chatHeader.online') : profile.lastSeenAt ? `${new Date(profile.lastSeenAt).toLocaleString()}` : 'offline'}
            </p>
          </div>
          {/* Name */}
          <div className="border-b border-[#F0F0F0]">
            <div className="flex items-center px-5 py-3 group cursor-pointer hover:bg-[#F5F5F5]">
              <div className="flex-1"><div className="text-[14px] font-medium text-[#1C1C1E]">{profile.username}</div><div className="text-[12px] text-[#8E8E93]">{t('account.name')}</div></div>
              <Edit3 className="w-4 h-4 text-[#8E8E93] opacity-0 group-hover:opacity-100 transition-opacity"/>
            </div>
          </div>
          {/* Username */}
          <div className="border-b border-[#F0F0F0]">
            <div className="flex items-center px-5 py-3 group cursor-pointer hover:bg-[#F5F5F5]">
              <div className="flex-1"><div className="text-[14px] font-medium text-[#1C1C1E]">@{profile.username}</div><div className="text-[12px] text-[#8E8E93]">{t('account.username')}</div></div>
              <Edit3 className="w-4 h-4 text-[#8E8E93] opacity-0 group-hover:opacity-100 transition-opacity"/>
            </div>
          </div>
          {/* Phone */}
          <div className="border-b border-[#F0F0F0]">
            {editPhone ? (
              <div className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1"><div className="text-[11px] text-[#2481CC] font-semibold mb-0.5">{t('account.phone')}</div><input autoFocus value={editPhoneValue} onChange={e=>setEditPhoneValue(e.target.value)} className="text-[14px] text-[#1C1C1E] w-full border-none outline-none bg-transparent"/></div>
                <button onClick={savePhone} className="w-7 h-7 bg-[#2481CC] rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white"/></button>
                <button onClick={()=>setEditPhone(false)} className="w-7 h-7 bg-[#F1F1F1] rounded-full flex items-center justify-center"><X className="w-4 h-4 text-[#8E8E93]"/></button>
              </div>
            ) : (
              <div className="flex items-center px-5 py-3 cursor-pointer hover:bg-[#F5F5F5]" onClick={()=>setEditPhone(true)}>
                <div className="flex-1"><div className="text-[14px] font-medium text-[#1C1C1E]">{profile.phone || t('account.notSet')}</div><div className="text-[12px] text-[#8E8E93]">{t('account.changePhone')}</div></div>
                <ChevronRight className="w-4 h-4 text-[#C7C7CC]"/>
              </div>
            )}
          </div>
          {/* Email */}
          <div className="border-b border-[#F0F0F0]">
            {editEmail ? (
              <div className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1"><div className="text-[11px] text-[#2481CC] font-semibold mb-0.5">{t('account.email')}</div><input autoFocus value={editEmailValue} onChange={e=>setEditEmailValue(e.target.value)} className="text-[14px] text-[#1C1C1E] w-full border-none outline-none bg-transparent"/></div>
                <button onClick={saveEmail} className="w-7 h-7 bg-[#2481CC] rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white"/></button>
                <button onClick={()=>setEditEmail(false)} className="w-7 h-7 bg-[#F1F1F1] rounded-full flex items-center justify-center"><X className="w-4 h-4 text-[#8E8E93]"/></button>
              </div>
            ) : (
              <div className="flex items-center px-5 py-3 cursor-pointer hover:bg-[#F5F5F5]" onClick={()=>setEditEmail(true)}>
                <div className="flex-1"><div className="text-[14px] font-medium text-[#1C1C1E]">{profile.email || t('account.notSet')}</div><div className="text-[12px] text-[#8E8E93]">{t('account.changeEmail')}</div></div>
                <ChevronRight className="w-4 h-4 text-[#C7C7CC]"/>
              </div>
            )}
          </div>
          {/* Bio */}
          <div>
            {editBio ? (
              <div className="px-5 py-3 flex items-start gap-3">
                <div className="flex-1"><div className="text-[11px] text-[#2481CC] font-semibold mb-0.5">{t('account.bio')}</div><textarea autoFocus value={editBioValue} onChange={e=>setEditBioValue(e.target.value)} rows={3} className="text-[14px] text-[#1C1C1E] w-full border-none outline-none bg-transparent resize-none"/></div>
                <div className="flex flex-col gap-1.5 pt-3"><button onClick={saveBio} className="w-7 h-7 bg-[#2481CC] rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white"/></button><button onClick={()=>setEditBio(false)} className="w-7 h-7 bg-[#F1F1F1] rounded-full flex items-center justify-center"><X className="w-4 h-4 text-[#8E8E93]"/></button></div>
              </div>
            ) : (
              <div className="flex items-start px-5 py-3 group cursor-pointer hover:bg-[#F5F5F5]" onClick={()=>setEditBio(true)}>
                <div className="flex-1"><div className="text-[14px] font-medium text-[#1C1C1E] mb-0.5">{profile.bio || t('account.noBio')}</div><div className="text-[12px] text-[#8E8E93]">{t('account.bio')}</div><div className="text-[11px] text-[#C7C7CC] mt-1">{t('account.bioHint')}</div></div>
                <Edit3 className="w-4 h-4 text-[#8E8E93] opacity-0 group-hover:opacity-100 mt-1 shrink-0"/>
              </div>
            )}
          </div>
        </Card>
        {/* Add account */}
        <Card>
          <div className="flex items-center px-5 py-3.5 cursor-pointer hover:bg-[#F5F5F5] transition-colors">
            <div className="w-9 h-9 rounded-full bg-[#E8F4FF] flex items-center justify-center mr-4 shrink-0"><Plus className="w-5 h-5 text-[#2481CC]"/></div>
            <span className="text-[14px] font-medium text-[#2481CC]">{t('account.addAccount')}</span>
          </div>
        </Card>
        {/* Log out */}
        <Card>
          <div className="flex items-center px-5 py-3.5 cursor-pointer hover:bg-[#FEF2F2] transition-colors" onClick={onLogout}>
            <div className="w-9 h-9 rounded-full bg-[#FEE2E2] flex items-center justify-center mr-4 shrink-0"><LogOut className="w-5 h-5 text-[#EF4444]"/></div>
            <span className="text-[14px] font-medium text-[#EF4444]">{t('account.logout')}</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Notifications Section ────────────────────────────────────────────────────
const NotificationsSection = () => {
  const { t } = useTranslation();
  const { settings, loading, updateSettings } = useSettings();
  if (loading || !settings?.notifications) {
    return (
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="text-[14px] text-[#8E8E93]">{t('general.loading')}</div>
      </div>
    );
  }
  const s = settings.notifications;
  const doToggle = (k: keyof typeof s) => updateSettings('notifications', { [k]: !s[k] } as any);
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-[520px] mx-auto space-y-4">
        <Card>
          <SectionTitle label={t('notif.privateChats')}/>
          <Row label={t('notif.enable')} onClick={()=>doToggle('privateChats')}><Toggle value={s.privateChats} onChange={()=>doToggle('privateChats')}/></Row>
          <Divider/>
          <Row label={t('notif.sound')} value="Default" chevron onClick={()=>{}}/>
          <Divider/>
          <Row label={t('notif.preview')} onClick={()=>doToggle('privatePreview')}><Toggle value={s.privatePreview} onChange={()=>doToggle('privatePreview')}/></Row>
          <Divider/>
          <Row label={t('notif.badge')} onClick={()=>doToggle('privateBadge')}><Toggle value={s.privateBadge} onChange={()=>doToggle('privateBadge')}/></Row>
        </Card>
        <Card>
          <SectionTitle label={t('notif.groups')}/>
          <Row label={t('notif.enable')} onClick={()=>doToggle('groups')}><Toggle value={s.groups} onChange={()=>doToggle('groups')}/></Row>
          <Divider/>
          <Row label={t('notif.sound')} value="None" chevron onClick={()=>{}}/>
          <Divider/>
          <Row label={t('notif.preview')} onClick={()=>doToggle('groupPreview')}><Toggle value={s.groupPreview} onChange={()=>doToggle('groupPreview')}/></Row>
          <Divider/>
          <Row label={t('notif.badge')} onClick={()=>doToggle('groupBadge')}><Toggle value={s.groupBadge} onChange={()=>doToggle('groupBadge')}/></Row>
        </Card>
        <Card>
          <SectionTitle label={t('notif.channels')}/>
          <Row label={t('notif.enable')} onClick={()=>doToggle('channels')}><Toggle value={s.channels} onChange={()=>doToggle('channels')}/></Row>
          <Divider/>
          <Row label={t('notif.sound')} value="None" chevron onClick={()=>{}}/>
          <Divider/>
          <Row label={t('notif.preview')} onClick={()=>doToggle('channelPreview')}><Toggle value={s.channelPreview} onChange={()=>doToggle('channelPreview')}/></Row>
          <Divider/>
          <Row label={t('notif.badge')} onClick={()=>doToggle('channelBadge')}><Toggle value={s.channelBadge} onChange={()=>doToggle('channelBadge')}/></Row>
        </Card>
        <Card>
          <SectionTitle label={t('notif.general')}/>
          <Row label={t('notif.countUnread')} sub={t('notif.countUnreadSub')} onClick={()=>doToggle('countUnread')}><Toggle value={s.countUnread} onChange={()=>doToggle('countUnread')}/></Row>
          <Divider/>
          <Row label={t('notif.includeArchived')} onClick={()=>doToggle('includeArchived')}><Toggle value={s.includeArchived} onChange={()=>doToggle('includeArchived')}/></Row>
        </Card>
      </div>
    </div>
  );
};

// ─── Privacy Section ──────────────────────────────────────────────────────────
const PrivacySection = () => {
  const { t } = useTranslation();
  const [twoStep, setTwoStep] = useState(false);
  const { settings, loading, updateSettings } = useSettings();
  if (loading || !settings?.privacy) {
    return (
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="text-[14px] text-[#8E8E93]">{t('general.loading')}</div>
      </div>
    );
  }
  const p = settings.privacy;
  const opts = ['Everyone','My Contacts','Nobody'];
  const Select = ({value, settingKey}: {value:string; settingKey: string}) => (
    <select value={value} onChange={e=>updateSettings('privacy', {[settingKey]: e.target.value})} className="text-[13px] text-[#8E8E93] bg-transparent border-none outline-none cursor-pointer" onClick={e=>e.stopPropagation()}>
      {opts.map(o=><option key={o}>{o}</option>)}
    </select>
  );
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-[520px] mx-auto space-y-4">
        <Card>
          <SectionTitle label={t('privacy.title')}/>
          <Row label={t('privacy.lastSeen')} sub={t('privacy.lastSeenSub')}><Select value={p.lastSeen} settingKey="lastSeen"/><ChevronRight className="w-4 h-4 text-[#C7C7CC] ml-1 shrink-0"/></Row>
          <Divider/>
          <Row label={t('privacy.profilePhoto')} sub={t('privacy.profilePhotoSub')}><Select value={p.profilePhoto} settingKey="profilePhoto"/><ChevronRight className="w-4 h-4 text-[#C7C7CC] ml-1 shrink-0"/></Row>
          <Divider/>
          <Row label={t('privacy.forwarded')} sub={t('privacy.forwardedSub')}><Select value={p.forwardedFrom} settingKey="forwardedFrom"/><ChevronRight className="w-4 h-4 text-[#C7C7CC] ml-1 shrink-0"/></Row>
          <Divider/>
          <Row label={t('privacy.phoneNumber')} sub={t('privacy.phoneNumberSub')}><Select value={p.phoneNumber} settingKey="phoneNumber"/><ChevronRight className="w-4 h-4 text-[#C7C7CC] ml-1 shrink-0"/></Row>
          <Divider/>
          <Row label={t('privacy.calls')} sub={t('privacy.callsSub')}><Select value={p.calls} settingKey="calls"/><ChevronRight className="w-4 h-4 text-[#C7C7CC] ml-1 shrink-0"/></Row>
          <Divider/>
          <Row label={t('privacy.groupAdd')} sub={t('privacy.groupAddSub')}><Select value={p.groupAdd} settingKey="groupAdd"/><ChevronRight className="w-4 h-4 text-[#C7C7CC] ml-1 shrink-0"/></Row>
        </Card>
        <Card>
          <SectionTitle label={t('privacy.security')}/>
          <Row label={t('privacy.2fa')} sub={twoStep?t('privacy.2faEnabled'):t('privacy.2faDisabled')} chevron onClick={()=>{}}><Toggle value={twoStep} onChange={setTwoStep}/></Row>
          <Divider/>
          <Row label={t('privacy.sessions')} value="2 sessions" chevron onClick={()=>{}}/>
          <Divider/>
          <Row label={t('privacy.passcode')} value="Off" chevron onClick={()=>{}}/>
        </Card>
        <Card>
          <SectionTitle label={t('privacy.advanced')}/>
          <Row label={t('privacy.deleteAccount')} value={t('privacy.deleteAccountValue')} chevron onClick={()=>{}}/>
          <Divider/>
          <Row label={t('privacy.blocked')} value="0" chevron onClick={()=>{}}/>
        </Card>
        <Card>
          <SectionTitle label={t('privacy.botsWebsites')}/>
          <Row label={t('privacy.connectedWebsites')} value="0" chevron onClick={()=>{}}/>
          <Divider/>
          <Row label={t('privacy.connectedApps')} value="0" chevron onClick={()=>{}}/>
        </Card>
      </div>
    </div>
  );
};

// ─── Data & Storage Section ───────────────────────────────────────────────────
const DEFAULT_DATA_STATE = {
  dlPhotoPrivate: true,
  dlVideoPrivate: false,
  dlFilePrivate: false,
  dlPhotoGroup: true,
  dlVideoGroup: false,
  dlFileGroup: false,
  dlPhotoChannel: true,
  dlVideoChannel: false,
  dlFileChannel: false,
  proxyOn: false,
  proxyHost: '',
  proxyPort: '',
  proxyUser: '',
  proxyPass: '',
  roaming: false,
  maxFileSize: 10,
  useLessData: false,
  bytesSent: 24.5,
  bytesReceived: 142,
};

const DataSection = () => {
  const { t } = useTranslation();
  const { settings, loading } = useSettings();
  const [d, setD] = useState<Record<string, any>>(() => {
    const serverData = settings?.data || {};
    return { ...DEFAULT_DATA_STATE, ...serverData };
  });
  const [clearingCache, setClearingCache] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [clearOptions, setClearOptions] = useState({ photos: true, videos: true, files: true, music: true, voice: true, stickers: true });
  const [proxyHost, setProxyHost] = useState(d.proxyHost || '');
  const [proxyPort, setProxyPort] = useState(d.proxyPort || '');
  const [proxyUser, setProxyUser] = useState(d.proxyUser || '');
  const [proxyPass, setProxyPass] = useState(d.proxyPass || '');
  const [showProxyForm, setShowProxyForm] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with server settings when they load
  useEffect(() => {
    if (settings?.data) {
      setD(prev => ({ ...prev, ...settings.data }));
    }
  }, [settings?.data]);

  const updateField = useCallback((key: string, value: any) => {
    setD(prev => {
      const next = { ...prev, [key]: value };
      // Debounced save to server
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => {
        api.updateSettings({ data: next }).catch((err: any) => {
          console.error("Failed to save data settings:", err);
        });
      }, 500);
      return next;
    });
  }, []);

  const usedGB = 1.42;
  const totalGB = 8;
  const storageBreakdown = [
    { label: t('data.photos'), size: '0.8 GB', pct: 56, color: '#2481CC' },
    { label: t('data.videos'), size: '0.3 GB', pct: 21, color: '#4DA6E8' },
    { label: t('data.files'), size: '0.2 GB', pct: 14, color: '#7BC4F0' },
    { label: t('data.music'), size: '0.05 GB', pct: 4, color: '#A0D8F5' },
    { label: t('data.other'), size: '0.07 GB', pct: 5, color: '#D1E9F8' },
  ];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="text-[14px] text-[#8E8E93]">{t('general.loading')}</div>
      </div>
    );
  }

  const handleClearCache = async () => {
    setClearingCache(true);
    await new Promise(r => setTimeout(r, 1500));
    setClearingCache(false);
    setShowClearModal(false);
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-[520px] mx-auto space-y-4">
        {/* Storage usage */}
        <Card>
          <SectionTitle label={t('data.title')} />
          <div className="px-5 pb-4">
            <div className="flex justify-between text-[12px] text-[#8E8E93] mb-2">
              <span>{t('data.used')} <span className="text-[#1C1C1E] font-medium">{usedGB} GB</span></span>
              <span>{t('data.total')} {totalGB} GB</span>
            </div>
            <div className="w-full h-3 bg-[#F1F1F1] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#2481CC] to-[#4DA6E8] rounded-full transition-all duration-500" style={{ width: `${(usedGB / totalGB) * 100}%` }} />
            </div>
            <div className="mt-4 space-y-2">
              {storageBreakdown.map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
                  <span className="flex-1 text-[13px] text-[#1C1C1E]">{item.label}</span>
                  <span className="text-[12px] text-[#8E8E93]">{item.size}</span>
                </div>
              ))}
            </div>
          </div>
          <Divider />
          <div className="flex items-center px-5 py-3 cursor-pointer hover:bg-[#F5F5F5] transition-colors" onClick={() => setShowClearModal(true)}>
            <Trash2 className="w-4 h-4 text-[#EF4444] mr-3" />
            <span className="text-[14px] font-medium text-[#EF4444]">{t('data.clearCache')}</span>
            <span className="ml-auto text-[13px] text-[#8E8E93]">1.42 GB</span>
          </div>
          <Divider />
          <Row label={t('data.storagePath')} value="~/Downloads" chevron onClick={() => {}} />
        </Card>

        {/* Auto-download */}
        <Card>
          <SectionTitle label={t('data.autoDownload')} />
          <div className="px-5 py-3">
            <div className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wide mb-2">{t('data.privateChats')}</div>
            <div className="flex gap-3">
              {[
                [t('data.photos'), d.dlPhotoPrivate, 'dlPhotoPrivate'],
                [t('data.videos'), d.dlVideoPrivate, 'dlVideoPrivate'],
                [t('data.files'), d.dlFilePrivate, 'dlFilePrivate'],
              ].map(([label, val, key]) => (
                <button key={key as string} onClick={() => updateField(key as string, !val)}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-medium border transition-all ${val ? 'border-[#2481CC] bg-[#E8F4FF] text-[#2481CC]' : 'border-[#EDEDED] text-[#8E8E93]'}`}>
                  {label as string}
                </button>
              ))}
            </div>
          </div>
          <Divider />
          <div className="px-5 py-3">
            <div className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wide mb-2">{t('data.groupChats')}</div>
            <div className="flex gap-3">
              {[
                [t('data.photos'), d.dlPhotoGroup, 'dlPhotoGroup'],
                [t('data.videos'), d.dlVideoGroup, 'dlVideoGroup'],
                [t('data.files'), d.dlFileGroup, 'dlFileGroup'],
              ].map(([label, val, key]) => (
                <button key={key as string} onClick={() => updateField(key as string, !val)}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-medium border transition-all ${val ? 'border-[#2481CC] bg-[#E8F4FF] text-[#2481CC]' : 'border-[#EDEDED] text-[#8E8E93]'}`}>
                  {label as string}
                </button>
              ))}
            </div>
          </div>
          <Divider />
          <div className="px-5 py-3">
            <div className="text-[12px] font-semibold text-[#8E8E93] uppercase tracking-wide mb-2">{t('data.channels')}</div>
            <div className="flex gap-3">
              {[
                [t('data.photos'), d.dlPhotoChannel ?? true, 'dlPhotoChannel'],
                [t('data.videos'), d.dlVideoChannel ?? false, 'dlVideoChannel'],
                [t('data.files'), d.dlFileChannel ?? false, 'dlFileChannel'],
              ].map(([label, val, key]) => (
                <button key={key as string} onClick={() => updateField(key as string, !val)}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-medium border transition-all ${val ? 'border-[#2481CC] bg-[#E8F4FF] text-[#2481CC]' : 'border-[#EDEDED] text-[#8E8E93]'}`}>
                  {label as string}
                </button>
              ))}
            </div>
          </div>
          <Divider />
          <Row label={t('data.autoDownloadRoaming')} sub={t('data.autoDownloadRoamingSub')}>
            <Toggle value={d.roaming ?? false} onChange={() => updateField('roaming', !d.roaming)} />
          </Row>
          <Divider />
          <Row label={t('data.maxFileSize')} value={`${d.maxFileSize ?? 10} MB`} chevron onClick={() => {}} />
        </Card>

        {/* Network & Proxy */}
        <Card>
          <SectionTitle label={t('data.network')} />
          <Row label={t('data.bytesSent')} value={`${d.bytesSent ?? 0} MB`} />
          <Divider />
          <Row label={t('data.bytesReceived')} value={`${d.bytesReceived ?? 0} MB`} />
          <Divider />
          <Row label={t('data.useLessData')} sub={t('data.useLessDataSub')}>
            <Toggle value={d.useLessData ?? false} onChange={() => updateField('useLessData', !d.useLessData)} />
          </Row>
          <Divider />
          <Row label={t('data.resetStats')} danger onClick={() => { updateField('bytesSent', 0); updateField('bytesReceived', 0); }} />
        </Card>

        {/* Proxy */}
        <Card>
          <SectionTitle label={t('data.connectionType')} />
          <Row label={t('data.proxy')} onClick={() => { if (!d.proxyOn) { setShowProxyForm(true); } updateField('proxyOn', !d.proxyOn); }}>
            <Toggle value={d.proxyOn ?? false} onChange={() => { updateField('proxyOn', !d.proxyOn); if (d.proxyOn) setShowProxyForm(false); }} />
          </Row>
          {d.proxyOn && showProxyForm && (
            <>
              <Divider />
              <div className="px-5 py-4 space-y-3">
                <div className="text-[13px] font-medium text-[#1C1C1E]">{t('data.proxySetup')}</div>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" placeholder={t('data.proxyHost')} value={proxyHost} onChange={e => setProxyHost(e.target.value)}
                    className="col-span-2 bg-[#F1F1F1] rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#2481CC]" />
                  <input type="number" placeholder="Port" value={proxyPort} onChange={e => setProxyPort(e.target.value)}
                    className="bg-[#F1F1F1] rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#2481CC]" />
                </div>
                <input type="text" placeholder={t('data.proxyUser')} value={proxyUser} onChange={e => setProxyUser(e.target.value)}
                  className="w-full bg-[#F1F1F1] rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#2481CC]" />
                <input type="password" placeholder={t('data.proxyPass')} value={proxyPass} onChange={e => setProxyPass(e.target.value)}
                  className="w-full bg-[#F1F1F1] rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-[#2481CC]" />
                <div className="flex gap-2 pt-1">
                  <button className="flex-1 py-2 rounded-lg bg-[#2481CC] text-white text-[13px] font-medium hover:bg-[#1a6baa] transition-colors"
                    onClick={() => { updateField('proxyHost', proxyHost); updateField('proxyPort', proxyPort); updateField('proxyUser', proxyUser); updateField('proxyPass', proxyPass); setShowProxyForm(false); }}>
                    {t('general.save')}
                  </button>
                  <button className="flex-1 py-2 rounded-lg bg-[#F1F1F1] text-[#1C1C1E] text-[13px] font-medium hover:bg-[#E5E5E5] transition-colors"
                    onClick={() => setShowProxyForm(false)}>
                    {t('general.cancel')}
                  </button>
                </div>
              </div>
            </>
          )}
        </Card>

        {/* Data management */}
        <Card>
          <SectionTitle label={t('data.management')} />
          <Row label={t('data.exportData')} sub={t('data.exportDataSub')} chevron onClick={() => {}} />
          <Divider />
          <Row label={t('data.deleteAll')} danger sub={t('data.deleteAllSub')} onClick={() => {}} />
        </Card>
      </div>

      {/* Clear cache modal */}
      {showClearModal && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center" onClick={() => setShowClearModal(false)}>
          <div className="bg-white rounded-2xl w-[400px] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-[#EDEDED]">
              <h3 className="font-bold text-[16px] text-[#1C1C1E]">{t('data.clearCache')}</h3>
            </div>
            <div className="px-6 py-4 space-y-3">
              <p className="text-[13px] text-[#8E8E93]">{t('data.clearCacheDesc')}</p>
              <div className="space-y-2">
                {[
                  { key: 'photos', label: t('data.photos') },
                  { key: 'videos', label: t('data.videos') },
                  { key: 'files', label: t('data.files') },
                  { key: 'music', label: t('data.music') },
                  { key: 'voice', label: t('data.voiceMessages') },
                  { key: 'stickers', label: t('data.stickers') },
                ].map(opt => (
                  <label key={opt.key} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={clearOptions[opt.key as keyof typeof clearOptions]}
                      onChange={e => setClearOptions(prev => ({ ...prev, [opt.key]: e.target.checked }))}
                      className="w-4 h-4 rounded border-[#C7C7CC] text-[#2481CC] focus:ring-[#2481CC]" />
                    <span className="text-[14px] text-[#1C1C1E]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="px-6 py-3 bg-[#F5F5F5] flex gap-2">
              <button className="flex-1 py-2 rounded-lg text-[13px] font-medium text-[#8E8E93] hover:bg-[#E5E5E5] transition-colors"
                onClick={() => setShowClearModal(false)}>
                {t('general.cancel')}
              </button>
              <button className="flex-1 py-2 rounded-lg bg-[#EF4444] text-white text-[13px] font-medium hover:bg-[#DC2626] transition-colors disabled:opacity-50"
                onClick={handleClearCache} disabled={clearingCache}>
                {clearingCache ? t('general.clearing') : t('general.clear')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Appearance Section ───────────────────────────────────────────────────────
const AppearanceSection = () => {
  const { t } = useTranslation();
  const { settings, loading, updateSettings } = useSettings();
  const THEMES = [{id:'day',label:t('appearance.day')||'Day',icon:Sun,color:'#FDB022'},{id:'night',label:t('appearance.night')||'Night',icon:Moon,color:'#8E8E93'},{id:'system',label:t('appearance.system')||'System',icon:Monitor,color:'#2481CC'}] as const;
  const BGOPTS = [{id:'default',color:'#F0F2F5'},{id:'pattern',color:'#dfe6e9'},{id:'gradient',color:'linear-gradient(135deg,#667eea,#764ba2)'},{id:'nature',color:'linear-gradient(135deg,#56ab2f,#a8e063)'},{id:'dark',color:'#1a1a2e'}];
  if (loading || !settings?.appearance) {
    return (
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="text-[14px] text-[#8E8E93]">{t('general.loading')}</div>
      </div>
    );
  }
  const a = settings.appearance;
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-[520px] mx-auto space-y-4">
        {/* Theme */}
        <Card>
          <SectionTitle label={t('appearance.colorTheme')}/>
          <div className="flex gap-3 px-5 py-4">
            {THEMES.map(th=>(
              <button key={th.id} onClick={()=>updateSettings('appearance', {theme: th.id})}
                className={`flex-1 py-3 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${a.theme===th.id?'border-[#2481CC] bg-[#E8F4FF]':'border-transparent bg-[#F5F5F5] hover:bg-[#EBEBEB]'}`}>
                <th.icon className="w-6 h-6" style={{color:th.color}}/>
                <span className={`text-[12px] font-semibold ${a.theme===th.id?'text-[#2481CC]':'text-[#8E8E93]'}`}>{th.label}</span>
              </button>
            ))}
          </div>
          <Divider/>
          <Row label={t('appearance.chatBg')} chevron onClick={()=>{}}>
            <div className="flex gap-1 mr-2">
              {BGOPTS.map(b=>(
                <button key={b.id} onClick={e=>{e.stopPropagation();updateSettings('appearance', {chatBg: b.id});}}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${a.chatBg===b.id?'border-[#2481CC] scale-110':'border-transparent'}`}
                  style={b.color.startsWith('linear')?{background:b.color}:{backgroundColor:b.color}}/>
              ))}
            </div>
          </Row>
        </Card>
        {/* Text size */}
        <Card>
          <SectionTitle label={t('appearance.messages')}/>
          <div className="px-5 py-4">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-[13px] text-[#8E8E93]">{t('appearance.textSize')}</span>
              <span className="text-[13px] font-semibold text-[#2481CC]">{a.fontSize}px</span>
            </div>
            <input type="range" min={12} max={20} value={a.fontSize} onChange={e=>updateSettings('appearance', {fontSize: Number(e.target.value)})} className="w-full accent-[#2481CC]"/>
            <div className="flex justify-between mt-2 px-1">
              <span style={{fontSize:12}} className="text-[#8E8E93]">Aa</span>
              <p className="text-[#1C1C1E] leading-relaxed" style={{fontSize: a.fontSize}}>The quick brown fox…</p>
              <span style={{fontSize:20}} className="text-[#8E8E93]">Aa</span>
            </div>
          </div>
          <Divider/>
          <Row label={t('appearance.largeEmoji')} sub={t('appearance.largeEmojiSub')} onClick={()=>updateSettings('appearance', {bigEmoji: !a.bigEmoji})}><Toggle value={a.bigEmoji} onChange={()=>updateSettings('appearance', {bigEmoji: !a.bigEmoji})}/></Row>
          <Divider/>
          <Row label={t('appearance.animateEmoji')} sub={t('appearance.animateEmojiSub')} onClick={()=>updateSettings('appearance', {animateEmoji: !a.animateEmoji})}><Toggle value={a.animateEmoji} onChange={()=>updateSettings('appearance', {animateEmoji: !a.animateEmoji})}/></Row>
          <Divider/>
          <Row label={t('appearance.bubbles')} sub={t('appearance.bubblesSub')} onClick={()=>updateSettings('appearance', {bubbles: !a.bubbles})}><Toggle value={a.bubbles} onChange={()=>updateSettings('appearance', {bubbles: !a.bubbles})}/></Row>
        </Card>
        {/* Accessibility */}
        <Card>
          <SectionTitle label={t('appearance.accessibility')}/>
          <Row label={t('appearance.reduceMotion')} sub={t('appearance.reduceMotionSub')} onClick={()=>updateSettings('appearance', {reduceMotion: !a.reduceMotion})}><Toggle value={a.reduceMotion} onChange={()=>updateSettings('appearance', {reduceMotion: !a.reduceMotion})}/></Row>
          <Divider/>
          <Row label={t('appearance.increaseContrast')} onClick={()=>updateSettings('appearance', {increaseContrast: !a.increaseContrast})}><Toggle value={a.increaseContrast} onChange={()=>updateSettings('appearance', {increaseContrast: !a.increaseContrast})}/></Row>
        </Card>
      </div>
    </div>
  );
};

// ─── Language Section ─────────────────────────────────────────────────────────
const LanguageSection = () => {
  const { t } = useTranslation();
  const { settings, loading, updateSettings } = useSettings();
  const LANGS = [
    {code:'🇺🇸',name:'English',native:'English'},
    {code:'🇷🇺',name:'Russian',native:'Русский'},
    {code:'🇩🇪',name:'German',native:'Deutsch'},
    {code:'🇫🇷',name:'French',native:'Français'},
    {code:'🇪🇸',name:'Spanish',native:'Español'},
    {code:'🇮🇹',name:'Italian',native:'Italiano'},
    {code:'🇵🇹',name:'Portuguese',native:'Português'},
    {code:'🇨🇳',name:'Chinese (Simplified)',native:'中文(简体)'},
    {code:'🇯🇵',name:'Japanese',native:'日本語'},
    {code:'🇰🇷',name:'Korean',native:'한국어'},
    {code:'🇸🇦',name:'Arabic',native:'العربية'},
    {code:'🇹🇷',name:'Turkish',native:'Türkçe'},
  ];
  if (loading || !settings?.language) {
    return (
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="text-[14px] text-[#8E8E93]">{t('general.loading')}</div>
      </div>
    );
  }
  const l = settings.language;
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-[520px] mx-auto space-y-4">
        <Card>
          <SectionTitle label={t('language.interface')}/>
          {LANGS.map((lang,i)=>(
            <React.Fragment key={lang.name}>
              {i>0&&<Divider/>}
              <div onClick={()=>updateSettings('language', {lang: lang.name})} className="flex items-center px-5 py-3 cursor-pointer hover:bg-[#F5F5F5] transition-colors">
                <span className="text-[20px] mr-4">{lang.code}</span>
                <div className="flex-1"><div className="text-[14px] font-medium text-[#1C1C1E]">{lang.name}</div><div className="text-[12px] text-[#8E8E93]">{lang.native}</div></div>
                {l.lang===lang.name&&<div className="w-5 h-5 rounded-full bg-[#2481CC] flex items-center justify-center"><Check className="w-3 h-3 text-white"/></div>}
              </div>
            </React.Fragment>
          ))}
        </Card>
        <Card>
          <Row label={t('language.translate')} sub={t('language.translateSub')} onClick={()=>updateSettings('language', {translateMessages: !l.translateMessages})}>
            <Toggle value={l.translateMessages} onChange={()=>updateSettings('language', {translateMessages: !l.translateMessages})}/>
          </Row>
          <Divider/>
          <Row label={t('language.showTranslate')} onClick={()=>updateSettings('language', {showTranslateButton: !l.showTranslateButton})}><Toggle value={l.showTranslateButton} onChange={()=>updateSettings('language', {showTranslateButton: !l.showTranslateButton})}/></Row>
        </Card>
      </div>
    </div>
  );
};

// ─── Premium Section ──────────────────────────────────────────────────────────
const PremiumSection = () => (
  <div className="flex-1 overflow-y-auto p-5">
    <div className="max-w-[520px] mx-auto space-y-4">
      {/* Hero */}
      <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-violet-500 via-purple-600 to-pink-500 p-8 text-center shadow-lg">
        <div className="text-[48px] mb-2">⭐</div>
        <h2 className="font-bold text-white text-[22px] mb-1">Telegram Premium</h2>
        <p className="text-white/80 text-[14px] mb-6">Subscribe to Telegram Premium to unlock exclusive features</p>
        <button className="bg-white text-purple-600 font-bold px-8 py-3 rounded-full text-[15px] hover:bg-purple-50 transition-colors shadow-lg">Subscribe · $4.99/month</button>
      </div>
      {/* Features */}
      <Card>
        <SectionTitle label="Premium Features"/>
        {[
          {icon:'📁',title:'4 GB File Uploads',sub:'Share files up to 4 GB each'},
          {icon:'⚡',title:'Faster Downloads',sub:'No speed limits'},
          {icon:'🚫',title:'No Ads',sub:'Enjoy Telegram ad-free'},
          {icon:'🔖',title:'Unlimited Bookmarks',sub:'Bookmark any message in any chat'},
          {icon:'😀',title:'Premium Stickers',sub:'Exclusive animated sticker packs'},
          {icon:'🎭',title:'Unique Reactions',sub:'React with any emoji'},
          {icon:'🔤',title:'Premium App Icons',sub:'Change the app icon'},
          {icon:'👤',title:'Profile Badge',sub:'Show a premium badge on your profile'},
          {icon:'📝',title:'Longer Captions',sub:'Write captions up to 2048 characters'},
          {icon:'📌',title:'More Pinned Chats',sub:'Pin up to 10 chats'},
        ].map((f,i,arr)=>(
          <React.Fragment key={f.title}>
            <div className="flex items-center px-5 py-3">
              <span className="text-[22px] mr-4 shrink-0">{f.icon}</span>
              <div><div className="text-[14px] font-medium text-[#1C1C1E]">{f.title}</div><div className="text-[12px] text-[#8E8E93]">{f.sub}</div></div>
            </div>
            {i<arr.length-1&&<Divider/>}
          </React.Fragment>
        ))}
      </Card>
    </div>
  </div>
);

// ─── Devices Section ──────────────────────────────────────────────────────────
const DevicesSection = () => {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const data = await api.getDevices();
      setSessions(data || []);
    } catch (err) {
      console.error('Failed to load devices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const getDeviceIcon = (ua: string) => {
    const s = (ua || '').toLowerCase();
    if (s.includes('iphone') || s.includes('android') || s.includes('mobile')) return Smartphone;
    if (s.includes('ipad') || s.includes('tablet')) return Tablet;
    return Laptop;
  };

  const getDeviceName = (session: any) => {
    if (session.deviceInfo) return session.deviceInfo;
    const ua = session.userAgent || '';
    if (ua.includes('Mac')) return 'Mac';
    if (ua.includes('Windows')) return 'Windows PC';
    if (ua.includes('iPhone')) return 'iPhone';
    if (ua.includes('iPad')) return 'iPad';
    if (ua.includes('Android')) return 'Android';
    return 'Unknown Device';
  };

  const getAppName = (session: any) => {
    const ua = session.userAgent || '';
    if (ua.includes('Telegram')) return ua;
    return `Telegram Web / ${ua.slice(0, 40)}`;
  };

  const handleRevoke = async (id: number) => {
    try {
      await api.revokeDevice(id);
      loadDevices();
    } catch (err) {
      console.error('Failed to revoke device:', err);
    }
  };

  const handleRevokeAll = async () => {
    const others = sessions.filter(s => !s.current);
    for (const s of others) {
      try {
        await api.revokeDevice(s.id);
      } catch (err) {
        console.error('Failed to revoke device:', err);
      }
    }
    loadDevices();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-5">
        <div className="text-[14px] text-[#8E8E93]">{t('general.loading')}</div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-[520px] mx-auto space-y-4">
        {/* Current */}
        <Card>
          <SectionTitle label={t('devices.current')}/>
          {sessions.filter(s=>s.current).map(s=>{
            const Icon = getDeviceIcon(s.userAgent);
            return (
              <div key={s.id} className="flex items-start px-5 py-4 gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#E8F4FF] flex items-center justify-center shrink-0"><Icon className="w-5 h-5 text-[#2481CC]"/></div>
                <div className="flex-1">
                  <div className="font-semibold text-[14px] text-[#1C1C1E]">{getDeviceName(s)}</div>
                  <div className="text-[12px] text-[#8E8E93]">{getAppName(s)}</div>
                  <div className="flex items-center gap-1 mt-1"><div className="w-2 h-2 rounded-full bg-[#4DCA65]"/><span className="text-[12px] text-[#4DCA65] font-medium">Online</span></div>
                </div>
                <div className="text-right"><div className="text-[11px] text-[#8E8E93]">{s.location || s.ipAddress || ''}</div></div>
              </div>
            );
          })}
        </Card>
        {/* Other */}
        <Card>
          <SectionTitle label="Other Sessions"/>
          {sessions.filter(s=>!s.current).map((s,i,arr)=>{
            const Icon = getDeviceIcon(s.userAgent);
            return (
              <React.Fragment key={s.id}>
                <div className="flex items-start px-5 py-3.5 gap-4 group hover:bg-[#F5F5F5] cursor-pointer transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#F1F1F1] flex items-center justify-center shrink-0"><Icon className="w-4.5 h-4.5 text-[#8E8E93]"/></div>
                  <div className="flex-1">
                    <div className="font-semibold text-[13px] text-[#1C1C1E]">{getDeviceName(s)}</div>
                    <div className="text-[11px] text-[#8E8E93]">{getAppName(s)}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#C7C7CC]"/>
                      <span className="text-[11px] text-[#8E8E93]">{s.location || s.ipAddress || ''}</span>
                      <span className="text-[#C7C7CC]">·</span>
                      <Clock className="w-3 h-3 text-[#C7C7CC]"/>
                      <span className="text-[11px] text-[#8E8E93]">{s.createdAt ? new Date(s.createdAt).toLocaleString() : ''}</span>
                    </div>
                  </div>
                  <button onClick={e=>{e.stopPropagation();handleRevoke(s.id);}} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#EF4444] hover:text-red-600">
                    <X className="w-4 h-4"/>
                  </button>
                </div>
                {i<arr.length-1&&<Divider/>}
              </React.Fragment>
            );
          })}
        </Card>
        {sessions.filter(s=>!s.current).length>0 && (
          <Card>
            <div className="flex items-center px-5 py-3.5 cursor-pointer hover:bg-[#FEF2F2] transition-colors" onClick={handleRevokeAll}>
              <UserX className="w-4 h-4 text-[#EF4444] mr-3 shrink-0"/>
              <span className="text-[14px] font-medium text-[#EF4444]">{t('devices.terminateAll')}</span>
            </div>
          </Card>
        )}
        {sessions.filter(s=>!s.current).length===0 && (
          <div className="text-center py-8 text-[#8E8E93] text-[14px]">{t('devices.noOther')}</div>
        )}
      </div>
    </div>
  );
};

// ─── Bots Section ─────────────────────────────────────────────────────────────
const BotsSection = () => {
  const [bots, setBots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newBotName, setNewBotName] = useState("");
  const [newBotUsername, setNewBotUsername] = useState("");
  const [newBotDesc, setNewBotDesc] = useState("");
  const [editingBot, setEditingBot] = useState<any | null>(null);
  const [commands, setCommands] = useState<{ command: string; description: string }[]>([]);
  const [newCommand, setNewCommand] = useState("");
  const [newCommandDesc, setNewCommandDesc] = useState("");

  const loadBots = async () => {
    setLoading(true);
    try {
      const data = await api.getBots();
      setBots(data);
    } catch (err) {
      console.error("Failed to load bots:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBots();
  }, []);

  const handleCreate = async () => {
    if (!newBotName.trim() || !newBotUsername.trim()) return;
    try {
      await api.createBot({
        name: newBotName.trim(),
        username: newBotUsername.trim(),
        description: newBotDesc.trim() || undefined,
      });
      setShowCreate(false);
      setNewBotName("");
      setNewBotUsername("");
      setNewBotDesc("");
      loadBots();
    } catch (err: any) {
      alert(err.message || "Failed to create bot");
    }
  };

  const handleDelete = async (botId: number) => {
    if (!confirm("Удалить бота? Это действие нельзя отменить.")) return;
    try {
      await api.deleteBot(botId);
      loadBots();
    } catch (err) {
      console.error("Failed to delete bot:", err);
    }
  };

  const handleRegenerateToken = async (botId: number) => {
    if (!confirm("Пересоздать токен? Старый токен перестанет работать.")) return;
    try {
      await api.regenerateBotToken(botId);
      loadBots();
    } catch (err) {
      console.error("Failed to regenerate token:", err);
    }
  };

  const loadCommands = async (botId: number) => {
    try {
      const data = await api.getBotCommands(botId);
      setCommands(data.map((c: any) => ({ command: c.command, description: c.description })));
    } catch (err) {
      console.error("Failed to load commands:", err);
      setCommands([]);
    }
  };

  const handleAddCommand = async () => {
    if (!editingBot || !newCommand.trim() || !newCommandDesc.trim()) return;
    const updated = [...commands, { command: newCommand.trim(), description: newCommandDesc.trim() }];
    try {
      await api.setBotCommands(editingBot.id, updated);
      setCommands(updated);
      setNewCommand("");
      setNewCommandDesc("");
    } catch (err) {
      console.error("Failed to set commands:", err);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-[520px] mx-auto space-y-4">
        <Card>
          <div className="flex items-center justify-between px-5 py-3">
            <span className="text-[14px] font-bold text-[#1C1C1E]">Мои боты</span>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#2481CC] text-white text-[12px] font-medium hover:bg-[#1f73b8] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Создать бота
            </button>
          </div>

          {showCreate && (
            <div className="px-5 pb-4 space-y-2">
              <input
                type="text"
                placeholder="Имя бота"
                value={newBotName}
                onChange={(e) => setNewBotName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#EDEDED] text-[13px] outline-none focus:border-[#2481CC]"
              />
              <input
                type="text"
                placeholder="Username (без @)"
                value={newBotUsername}
                onChange={(e) => setNewBotUsername(e.target.value.replace(/[^a-z0-9_]/gi, "").toLowerCase())}
                className="w-full px-3 py-2 rounded-xl border border-[#EDEDED] text-[13px] outline-none focus:border-[#2481CC]"
              />
              <input
                type="text"
                placeholder="Описание (необязательно)"
                value={newBotDesc}
                onChange={(e) => setNewBotDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#EDEDED] text-[13px] outline-none focus:border-[#2481CC]"
              />
              <div className="flex gap-2">
                <button onClick={handleCreate} className="px-4 py-2 rounded-xl bg-[#2481CC] text-white text-[12px] font-medium hover:bg-[#1f73b8]">Создать</button>
                <button onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-xl bg-[#F1F1F1] text-[#8E8E93] text-[12px] font-medium">Отмена</button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="px-5 py-8 text-center text-[13px] text-[#8E8E93]">Загрузка...</div>
          ) : bots.length === 0 ? (
            <div className="px-5 py-8 text-center text-[13px] text-[#8E8E93]">
              У вас пока нет ботов. Создайте первого!
            </div>
          ) : (
            <div className="divide-y divide-[#F0F0F0]">
              {bots.map((bot) => (
                <div key={bot.id} className="px-5 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F1F1F1] flex items-center justify-center">
                        <Bot className="w-5 h-5 text-[#8E8E93]" />
                      </div>
                      <div>
                        <div className="text-[14px] font-medium text-[#1C1C1E]">{bot.name}</div>
                        <div className="text-[12px] text-[#8E8E93]">@{bot.username}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditingBot(bot); loadCommands(bot.id); }}
                        className="p-1.5 rounded-lg hover:bg-[#F5F5F5] text-[#8E8E93]"
                        title="Команды"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRegenerateToken(bot.id)}
                        className="p-1.5 rounded-lg hover:bg-[#F5F5F5] text-[#8E8E93]"
                        title="Новый токен"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(bot.id)}
                        className="p-1.5 rounded-lg hover:bg-[#F5F5F5] text-[#EF4444]"
                        title="Удалить"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {bot.description && (
                    <div className="mt-1 text-[12px] text-[#8E8E93]">{bot.description}</div>
                  )}
                  <div className="mt-2 flex items-center gap-2">
                    <code className="text-[11px] bg-[#F1F1F1] px-2 py-1 rounded text-[#8E8E93] truncate flex-1">{bot.token}</code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(bot.token); }}
                      className="p-1 rounded hover:bg-[#F5F5F5] text-[#8E8E93]"
                      title="Копировать токен"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Commands editor */}
        {editingBot && (
          <Card>
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#F0F0F0]">
              <span className="text-[14px] font-bold text-[#1C1C1E]">Команды @{editingBot.username}</span>
              <button onClick={() => setEditingBot(null)} className="text-[12px] text-[#8E8E93]">Закрыть</button>
            </div>
            <div className="px-5 py-3 space-y-2">
              {commands.map((cmd, idx) => (
                <div key={idx} className="flex items-center justify-between text-[13px]">
                  <span className="font-mono text-[#2481CC]">/{cmd.command}</span>
                  <span className="text-[#8E8E93]">{cmd.description}</span>
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="команда"
                  value={newCommand}
                  onChange={(e) => setNewCommand(e.target.value.replace(/^\//, ""))}
                  className="flex-1 px-3 py-2 rounded-xl border border-[#EDEDED] text-[13px] outline-none focus:border-[#2481CC]"
                />
                <input
                  type="text"
                  placeholder="описание"
                  value={newCommandDesc}
                  onChange={(e) => setNewCommandDesc(e.target.value)}
                  className="flex-[2] px-3 py-2 rounded-xl border border-[#EDEDED] text-[13px] outline-none focus:border-[#2481CC]"
                />
                <button onClick={handleAddCommand} className="px-3 py-2 rounded-xl bg-[#2481CC] text-white text-[12px] font-medium hover:bg-[#1f73b8]">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export function DesktopSettings() {
  const { t, locale } = useTranslation();
  const [active, setActive] = useState<Section>('account');
  const [search, setSearch] = useState('');
  const { profile, loading: profileLoading } = useUserProfile();

  const handleLogout = async () => {
    try {
      await api.logout();
      window.location.reload();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const initials = profile?.username ? profile.username.slice(0, 2).toUpperCase() : '??';

  const NAV_ITEMS: {id:Section; icon:React.ComponentType<{className?:string}>; label:string; badge?:string; color?:string}[] = [
    { id:'account', icon:Settings, label:t('settings.account') },
    { id:'notifications', icon:Bell, label:t('settings.notifications') },
    { id:'privacy', icon:Shield, label:t('settings.privacy') },
    { id:'data', icon:Database, label:t('settings.data') },
    { id:'appearance', icon:Palette, label:t('settings.appearance') },
    { id:'language', icon:Globe, label:t('settings.language'), badge: locale === 'ru' ? 'Русский' : 'English' },
    { id:'bots', icon:Bot, label:t('settings.bots') },
    { id:'premium', icon:Crown, label:t('settings.premium'), color:'text-[#8B5CF6]' },
    { id:'devices', icon:Monitor, label:t('settings.devices'), badge:'4' },
  ];

  const SECTION_TITLES: Record<Section,string> = {
    account:t('settings.account'), notifications:t('settings.notifications'), privacy:t('settings.privacy'),
    data:t('settings.data'), appearance:t('settings.appearance'), language:t('settings.language'), bots:t('settings.bots'), premium:t('settings.premium'), devices:t('settings.devices'),
  };

  return (
    <div className="w-full h-full flex overflow-hidden" style={{fontFamily:'Inter,system-ui,sans-serif'}}>
      {/* Nav column */}
      <div className="w-[68px] shrink-0 flex flex-col items-center py-3 justify-between" style={{background:'#17212B'}}>
        <div className="flex flex-col items-center w-full gap-0.5">
          <div className="w-9 h-9 flex items-center justify-center mb-4 mt-1">
            <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </div>
          {([{icon:MessageCircle,act:false},{icon:Phone,act:false},{icon:Users,act:false},{icon:Bookmark,act:false},{icon:Settings,act:true}] as const).map(({icon:Icon,act},idx)=>(
            <div key={idx} className="w-full flex justify-center py-3 relative group cursor-pointer">
              {act&&<div className="absolute left-0 top-2 bottom-2 w-[3px] bg-[#2481CC] rounded-r-full"/>}
              <Icon className={`w-6 h-6 ${act?'text-[#2481CC]':'text-[#8E8E93] group-hover:text-white'}`}/>
            </div>
          ))}
        </div>
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer mb-1 ring-2 ring-[#2481CC] ring-offset-2 ring-offset-[#17212B]">
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} className="w-full h-full rounded-full object-cover" alt=""/>
          ) : (
            initials
          )}
        </div>
      </div>

      {/* Settings list column */}
      <div className="w-[300px] shrink-0 flex flex-col bg-white border-r border-[#EDEDED]">
        <div className="h-[52px] flex items-center px-5 shrink-0 border-b border-[#EDEDED]">
          <h1 className="font-bold text-[17px] text-[#1C1C1E]">{t('settings.title')}</h1>
        </div>
        {/* Search */}
        <div className="px-4 py-2 shrink-0">
          <div className="bg-[#F1F1F1] rounded-full h-8 flex items-center px-3 gap-2">
            <Search className="w-3.5 h-3.5 text-[#8E8E93] shrink-0"/>
            <input type="text" placeholder={t('sidebar.search')} value={search} onChange={e=>setSearch(e.target.value)} className="bg-transparent border-none outline-none text-[13px] w-full text-[#1C1C1E] placeholder:text-[#8E8E93]"/>
          </div>
        </div>
        {/* User card */}
        <div className="flex items-center px-4 py-3 cursor-pointer hover:bg-[#F5F5F5] transition-colors border-b border-[#EDEDED]" onClick={()=>setActive('account')}>
          <div className="relative shrink-0 mr-3">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} className="w-[46px] h-[46px] rounded-full object-cover" alt=""/>
            ) : (
              <div className="w-[46px] h-[46px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-[16px]">{initials}</div>
            )}
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#4DCA65] border-2 border-white"/>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[14px] text-[#1C1C1E] truncate">{profile?.username || t('general.loading')}</h3>
            <p className="text-[12px] text-[#8E8E93] truncate">{profile?.phone || ''}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-[#C7C7CC] shrink-0"/>
        </div>
        {/* Nav list */}
        <div className="flex-1 overflow-y-auto py-1">
          {NAV_ITEMS.filter(item=>!search||item.label.toLowerCase().includes(search.toLowerCase())).map(item=>(
            <div key={item.id} onClick={()=>setActive(item.id)}
              className={`flex items-center px-4 py-2.5 cursor-pointer transition-colors ${active===item.id?'bg-[#E8F4FF]':'hover:bg-[#F5F5F5]'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 shrink-0 ${active===item.id?'bg-[#2481CC]':item.id==='premium'?'bg-gradient-to-br from-violet-500 to-purple-600':'bg-[#F1F1F1]'}`}>
                <item.icon className={`w-4 h-4 ${active===item.id?'text-white':item.id==='premium'?'text-white':(item.color||'text-[#8E8E93]')}`}/>
              </div>
              <span className={`flex-1 text-[13px] font-medium ${active===item.id?'text-[#2481CC]':item.color||'text-[#1C1C1E]'}`}>{item.label}</span>
              {item.badge&&<span className="text-[12px] text-[#8E8E93] mr-1">{item.badge}</span>}
              <ChevronRight className={`w-3.5 h-3.5 ${active===item.id?'text-[#2481CC]':'text-[#C7C7CC]'}`}/>
            </div>
          ))}
          <div className="h-px bg-[#F0F0F0] mx-4 my-2"/>
          <div className="flex items-center px-4 py-2.5 cursor-pointer hover:bg-[#F5F5F5] transition-colors">
            <div className="w-8 h-8 rounded-xl bg-[#F1F1F1] flex items-center justify-center mr-3 shrink-0"><HelpCircle className="w-4 h-4 text-[#8E8E93]"/></div>
            <span className="flex-1 text-[13px] font-medium text-[#1C1C1E]">{t('settings.faq')}</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#C7C7CC]"/>
          </div>
        </div>
      </div>

      {/* Detail column */}
      <div className="flex-1 flex flex-col bg-[#F5F5F5] min-w-0">
        {/* Section header */}
        <div className="h-[52px] flex items-center justify-between px-6 shrink-0 bg-white border-b border-[#EDEDED]">
          <h2 className="font-bold text-[16px] text-[#1C1C1E]">{SECTION_TITLES[active]}</h2>
          {active==='account'&&<Edit3 className="w-5 h-5 text-[#8E8E93] cursor-pointer hover:text-[#1C1C1E] transition-colors"/>}
          {active==='devices'&&<button className="text-[13px] text-[#2481CC] hover:opacity-70 font-medium">{t('general.refresh')}</button>}
        </div>
        {active==='account'&&<AccountSection onLogout={handleLogout}/>}
        {active==='notifications'&&<NotificationsSection/>}
        {active==='privacy'&&<PrivacySection/>}
        {active==='data'&&<DataSection/>}
        {active==='appearance'&&<AppearanceSection/>}
        {active==='language'&&<LanguageSection/>}
        {active==='bots'&&<BotsSection/>}
        {active==='premium'&&<PremiumSection/>}
        {active==='devices'&&<DevicesSection/>}
      </div>
    </div>
  );
}
