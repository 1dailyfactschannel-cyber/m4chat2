import React, { useState } from 'react';
import {
  MessageCircle, Phone, Bookmark, Settings, Users, Search, Edit3,
  Bell, Shield, Database, Palette, Globe, Star, Monitor, HelpCircle,
  LogOut, ChevronRight, Camera, Check, X, Smartphone, Laptop, Tablet,
  Moon, Sun, Volume2, VolumeX, Image, Type, Smile, Eye, EyeOff,
  Lock, Key, UserX, Wifi, HardDrive, Trash2, Download, Upload,
  AlertCircle, Plus, Crown, Zap, Clock, MapPin,
} from 'lucide-react';

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

type Section = 'account' | 'notifications' | 'privacy' | 'data' | 'appearance' | 'language' | 'premium' | 'devices';

// ─── Account Section ──────────────────────────────────────────────────────────
const AccountSection = () => {
  const [editName, setEditName] = useState(false);
  const [name, setName] = useState('John Doe');
  const [editBio, setEditBio] = useState(false);
  const [bio, setBio] = useState('Software Engineer. Tech enthusiast. ☕');
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-[520px] mx-auto space-y-4">
        {/* Profile card */}
        <Card>
          <div className="flex flex-col items-center pt-8 pb-6 px-6 border-b border-[#F0F0F0]">
            <div className="relative group cursor-pointer mb-4">
              <div className="w-[96px] h-[96px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-4xl">JD</div>
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-7 h-7 text-white"/>
              </div>
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#2481CC] rounded-full flex items-center justify-center border-2 border-white">
                <Camera className="w-4 h-4 text-white"/>
              </div>
            </div>
            <h2 className="font-bold text-[20px] text-[#1C1C1E]">{name}</h2>
            <p className="text-[13px] text-[#4DCA65] font-medium">online</p>
          </div>
          {/* Name */}
          <div className="border-b border-[#F0F0F0]">
            {editName ? (
              <div className="px-5 py-3 flex items-center gap-3">
                <div className="flex-1"><div className="text-[11px] text-[#2481CC] font-semibold mb-0.5">Name</div><input autoFocus value={name} onChange={e=>setName(e.target.value)} className="text-[14px] text-[#1C1C1E] w-full border-none outline-none bg-transparent"/></div>
                <button onClick={()=>setEditName(false)} className="w-7 h-7 bg-[#2481CC] rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white"/></button>
                <button onClick={()=>setEditName(false)} className="w-7 h-7 bg-[#F1F1F1] rounded-full flex items-center justify-center"><X className="w-4 h-4 text-[#8E8E93]"/></button>
              </div>
            ) : (
              <div className="flex items-center px-5 py-3 group cursor-pointer hover:bg-[#F5F5F5]" onClick={()=>setEditName(true)}>
                <div className="flex-1"><div className="text-[14px] font-medium text-[#1C1C1E]">{name}</div><div className="text-[12px] text-[#8E8E93]">Name</div></div>
                <Edit3 className="w-4 h-4 text-[#8E8E93] opacity-0 group-hover:opacity-100 transition-opacity"/>
              </div>
            )}
          </div>
          {/* Username */}
          <div className="border-b border-[#F0F0F0]">
            <div className="flex items-center px-5 py-3 group cursor-pointer hover:bg-[#F5F5F5]">
              <div className="flex-1"><div className="text-[14px] font-medium text-[#1C1C1E]">@johndoe</div><div className="text-[12px] text-[#8E8E93]">Username</div></div>
              <Edit3 className="w-4 h-4 text-[#8E8E93] opacity-0 group-hover:opacity-100 transition-opacity"/>
            </div>
          </div>
          {/* Phone */}
          <div className="border-b border-[#F0F0F0]">
            <div className="flex items-center px-5 py-3 cursor-pointer hover:bg-[#F5F5F5]">
              <div className="flex-1"><div className="text-[14px] font-medium text-[#1C1C1E]">+1 (555) 012-3456</div><div className="text-[12px] text-[#8E8E93]">Phone (tap to change)</div></div>
              <ChevronRight className="w-4 h-4 text-[#C7C7CC]"/>
            </div>
          </div>
          {/* Bio */}
          <div>
            {editBio ? (
              <div className="px-5 py-3 flex items-start gap-3">
                <div className="flex-1"><div className="text-[11px] text-[#2481CC] font-semibold mb-0.5">Bio</div><textarea autoFocus value={bio} onChange={e=>setBio(e.target.value)} rows={3} className="text-[14px] text-[#1C1C1E] w-full border-none outline-none bg-transparent resize-none"/></div>
                <div className="flex flex-col gap-1.5 pt-3"><button onClick={()=>setEditBio(false)} className="w-7 h-7 bg-[#2481CC] rounded-full flex items-center justify-center"><Check className="w-4 h-4 text-white"/></button><button onClick={()=>setEditBio(false)} className="w-7 h-7 bg-[#F1F1F1] rounded-full flex items-center justify-center"><X className="w-4 h-4 text-[#8E8E93]"/></button></div>
              </div>
            ) : (
              <div className="flex items-start px-5 py-3 group cursor-pointer hover:bg-[#F5F5F5]" onClick={()=>setEditBio(true)}>
                <div className="flex-1"><div className="text-[14px] font-medium text-[#1C1C1E] mb-0.5">{bio}</div><div className="text-[12px] text-[#8E8E93]">Bio</div><div className="text-[11px] text-[#C7C7CC] mt-1">Any details such as age, occupation or city</div></div>
                <Edit3 className="w-4 h-4 text-[#8E8E93] opacity-0 group-hover:opacity-100 mt-1 shrink-0"/>
              </div>
            )}
          </div>
        </Card>
        {/* Add account */}
        <Card>
          <div className="flex items-center px-5 py-3.5 cursor-pointer hover:bg-[#F5F5F5] transition-colors">
            <div className="w-9 h-9 rounded-full bg-[#E8F4FF] flex items-center justify-center mr-4 shrink-0"><Plus className="w-5 h-5 text-[#2481CC]"/></div>
            <span className="text-[14px] font-medium text-[#2481CC]">Add Another Account</span>
          </div>
        </Card>
        {/* Log out */}
        <Card>
          <div className="flex items-center px-5 py-3.5 cursor-pointer hover:bg-[#FEF2F2] transition-colors">
            <div className="w-9 h-9 rounded-full bg-[#FEE2E2] flex items-center justify-center mr-4 shrink-0"><LogOut className="w-5 h-5 text-[#EF4444]"/></div>
            <span className="text-[14px] font-medium text-[#EF4444]">Log Out</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Notifications Section ────────────────────────────────────────────────────
const NotificationsSection = () => {
  const [s, setS] = useState({
    privateChats: true, privateSound: true, privatePreview: true, privateBadge: true,
    groups: true, groupSound: false, groupPreview: true, groupBadge: true,
    channels: true, channelSound: false, channelPreview: false, channelBadge: true,
    countUnread: true, includeArchived: false,
  });
  const t = (k: keyof typeof s) => setS(prev=>({...prev,[k]:!prev[k]}));
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-[520px] mx-auto space-y-4">
        <Card>
          <SectionTitle label="Private Chats"/>
          <Row label="Enable Notifications" onClick={()=>t('privateChats')}><Toggle value={s.privateChats} onChange={()=>t('privateChats')}/></Row>
          <Divider/>
          <Row label="Sound" value="Default" chevron onClick={()=>{}}/>
          <Divider/>
          <Row label="Message Preview" onClick={()=>t('privatePreview')}><Toggle value={s.privatePreview} onChange={()=>t('privatePreview')}/></Row>
          <Divider/>
          <Row label="Badge Counter" onClick={()=>t('privateBadge')}><Toggle value={s.privateBadge} onChange={()=>t('privateBadge')}/></Row>
        </Card>
        <Card>
          <SectionTitle label="Groups"/>
          <Row label="Enable Notifications" onClick={()=>t('groups')}><Toggle value={s.groups} onChange={()=>t('groups')}/></Row>
          <Divider/>
          <Row label="Sound" value="None" chevron onClick={()=>{}}/>
          <Divider/>
          <Row label="Message Preview" onClick={()=>t('groupPreview')}><Toggle value={s.groupPreview} onChange={()=>t('groupPreview')}/></Row>
          <Divider/>
          <Row label="Badge Counter" onClick={()=>t('groupBadge')}><Toggle value={s.groupBadge} onChange={()=>t('groupBadge')}/></Row>
        </Card>
        <Card>
          <SectionTitle label="Channels"/>
          <Row label="Enable Notifications" onClick={()=>t('channels')}><Toggle value={s.channels} onChange={()=>t('channels')}/></Row>
          <Divider/>
          <Row label="Sound" value="None" chevron onClick={()=>{}}/>
          <Divider/>
          <Row label="Message Preview" onClick={()=>t('channelPreview')}><Toggle value={s.channelPreview} onChange={()=>t('channelPreview')}/></Row>
          <Divider/>
          <Row label="Badge Counter" onClick={()=>t('channelBadge')}><Toggle value={s.channelBadge} onChange={()=>t('channelBadge')}/></Row>
        </Card>
        <Card>
          <SectionTitle label="General"/>
          <Row label="Count Unread Messages" sub="Count all unread messages, not just conversations" onClick={()=>t('countUnread')}><Toggle value={s.countUnread} onChange={()=>t('countUnread')}/></Row>
          <Divider/>
          <Row label="Include Archived Chats" onClick={()=>t('includeArchived')}><Toggle value={s.includeArchived} onChange={()=>t('includeArchived')}/></Row>
        </Card>
      </div>
    </div>
  );
};

// ─── Privacy Section ──────────────────────────────────────────────────────────
const PrivacySection = () => {
  const [twoStep, setTwoStep] = useState(false);
  const opts = ['Everyone','My Contacts','Nobody'];
  const [lastSeen, setLastSeen] = useState('Everyone');
  const [profilePhoto, setProfilePhoto] = useState('Everyone');
  const [forwardedFrom, setForwardedFrom] = useState('Everyone');
  const [phoneNumber, setPhoneNumber] = useState('My Contacts');
  const [calls, setCalls] = useState('Everyone');
  const [groupAdd, setGroupAdd] = useState('My Contacts');
  const Select = ({value, onChange}: {value:string; onChange:(v:string)=>void}) => (
    <select value={value} onChange={e=>onChange(e.target.value)} className="text-[13px] text-[#8E8E93] bg-transparent border-none outline-none cursor-pointer" onClick={e=>e.stopPropagation()}>
      {opts.map(o=><option key={o}>{o}</option>)}
    </select>
  );
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-[520px] mx-auto space-y-4">
        <Card>
          <SectionTitle label="Privacy"/>
          <Row label="Last Seen & Online" sub="Who can see when you were last online"><Select value={lastSeen} onChange={setLastSeen}/><ChevronRight className="w-4 h-4 text-[#C7C7CC] ml-1 shrink-0"/></Row>
          <Divider/>
          <Row label="Profile Photo" sub="Who can see your profile photo"><Select value={profilePhoto} onChange={setProfilePhoto}/><ChevronRight className="w-4 h-4 text-[#C7C7CC] ml-1 shrink-0"/></Row>
          <Divider/>
          <Row label="Forwarded Messages" sub="Who can forward your messages"><Select value={forwardedFrom} onChange={setForwardedFrom}/><ChevronRight className="w-4 h-4 text-[#C7C7CC] ml-1 shrink-0"/></Row>
          <Divider/>
          <Row label="Phone Number" sub="Who can see your phone number"><Select value={phoneNumber} onChange={setPhoneNumber}/><ChevronRight className="w-4 h-4 text-[#C7C7CC] ml-1 shrink-0"/></Row>
          <Divider/>
          <Row label="Calls" sub="Who can call you"><Select value={calls} onChange={setCalls}/><ChevronRight className="w-4 h-4 text-[#C7C7CC] ml-1 shrink-0"/></Row>
          <Divider/>
          <Row label="Group Chats & Channels" sub="Who can add you to groups"><Select value={groupAdd} onChange={setGroupAdd}/><ChevronRight className="w-4 h-4 text-[#C7C7CC] ml-1 shrink-0"/></Row>
        </Card>
        <Card>
          <SectionTitle label="Security"/>
          <Row label="Two-Step Verification" sub={twoStep?'Enabled — Password set':'Disabled'} chevron onClick={()=>{}}><Toggle value={twoStep} onChange={setTwoStep}/></Row>
          <Divider/>
          <Row label="Active Sessions" value="2 sessions" chevron onClick={()=>{}}/>
          <Divider/>
          <Row label="Passcode & Touch ID" value="Off" chevron onClick={()=>{}}/>
        </Card>
        <Card>
          <SectionTitle label="Advanced"/>
          <Row label="Delete My Account" value="If away for 1 year" chevron onClick={()=>{}}/>
          <Divider/>
          <Row label="Blocked Users" value="0" chevron onClick={()=>{}}/>
        </Card>
        <Card>
          <SectionTitle label="Bots & Websites"/>
          <Row label="Connected Websites" value="0" chevron onClick={()=>{}}/>
          <Divider/>
          <Row label="Connected Apps" value="0" chevron onClick={()=>{}}/>
        </Card>
      </div>
    </div>
  );
};

// ─── Data & Storage Section ───────────────────────────────────────────────────
const DataSection = () => {
  const [dlPhotoPrivate, setDlPhotoPrivate] = useState(true);
  const [dlVideoPrivate, setDlVideoPrivate] = useState(false);
  const [dlFilePrivate, setDlFilePrivate] = useState(false);
  const [dlPhotoGroup, setDlPhotoGroup] = useState(true);
  const [dlVideoGroup, setDlVideoGroup] = useState(false);
  const [dlFileGroup, setDlFileGroup] = useState(false);
  const [proxyOn, setProxyOn] = useState(false);
  const usedGB = 1.42; const totalGB = 8;
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-[520px] mx-auto space-y-4">
        {/* Storage usage */}
        <Card>
          <SectionTitle label="Storage Usage"/>
          <div className="px-5 pb-4">
            <div className="flex justify-between text-[12px] text-[#8E8E93] mb-2">
              <span>Used: <span className="text-[#1C1C1E] font-medium">{usedGB} GB</span></span>
              <span>Total: {totalGB} GB</span>
            </div>
            <div className="w-full h-2.5 bg-[#F1F1F1] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#2481CC] to-[#4DA6E8] rounded-full" style={{width:`${(usedGB/totalGB)*100}%`}}/>
            </div>
            <div className="flex gap-3 mt-3 text-[11px]">
              {[{label:'Photos',size:'0.8 GB',color:'#2481CC'},{label:'Videos',size:'0.3 GB',color:'#4DA6E8'},{label:'Files',size:'0.2 GB',color:'#7BC4F0'},{label:'Other',size:'0.12 GB',color:'#D1E9F8'}].map(c=>(
                <div key={c.label} className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full shrink-0" style={{background:c.color}}/><span className="text-[#8E8E93]">{c.label} {c.size}</span></div>
              ))}
            </div>
          </div>
          <Divider/>
          <div className="flex items-center px-5 py-3 cursor-pointer hover:bg-[#F5F5F5] transition-colors">
            <Trash2 className="w-4 h-4 text-[#EF4444] mr-3"/><span className="text-[14px] font-medium text-[#EF4444]">Clear Cache</span>
            <span className="ml-auto text-[13px] text-[#8E8E93]">1.42 GB</span>
          </div>
          <Divider/>
          <Row label="Storage Path" value="~/Downloads" chevron onClick={()=>{}}/>
        </Card>
        {/* Auto-download */}
        <Card>
          <SectionTitle label="Auto-Download Media"/>
          <div className="px-5 py-3">
            <div className="text-[12px] font-semibold text-[#8E8E93] mb-2">PRIVATE CHATS</div>
            <div className="flex gap-4">
              {[['Photos',dlPhotoPrivate,setDlPhotoPrivate],['Videos',dlVideoPrivate,setDlVideoPrivate],['Files',dlFilePrivate,setDlFilePrivate]].map(([label,val,fn])=>(
                <button key={label as string} onClick={()=>(fn as React.Dispatch<React.SetStateAction<boolean>>)(v=>!v)}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-medium border transition-all ${val?'border-[#2481CC] bg-[#E8F4FF] text-[#2481CC]':'border-[#EDEDED] text-[#8E8E93]'}`}>
                  {label as string}
                </button>
              ))}
            </div>
          </div>
          <Divider/>
          <div className="px-5 py-3">
            <div className="text-[12px] font-semibold text-[#8E8E93] mb-2">GROUP CHATS</div>
            <div className="flex gap-4">
              {[['Photos',dlPhotoGroup,setDlPhotoGroup],['Videos',dlVideoGroup,setDlVideoGroup],['Files',dlFileGroup,setDlFileGroup]].map(([label,val,fn])=>(
                <button key={label as string} onClick={()=>(fn as React.Dispatch<React.SetStateAction<boolean>>)(v=>!v)}
                  className={`flex-1 py-2 rounded-xl text-[12px] font-medium border transition-all ${val?'border-[#2481CC] bg-[#E8F4FF] text-[#2481CC]':'border-[#EDEDED] text-[#8E8E93]'}`}>
                  {label as string}
                </button>
              ))}
            </div>
          </div>
        </Card>
        {/* Network */}
        <Card>
          <SectionTitle label="Network Usage"/>
          {[{label:'Bytes Sent',val:'24.5 MB',icon:Upload},{label:'Bytes Received',val:'142 MB',icon:Download}].map(({label,val,icon:Icon})=>(
            <React.Fragment key={label}><Row label={label} value={val}/><Divider/></React.Fragment>
          ))}
          <Row label="Reset Statistics" danger onClick={()=>{}}/>
        </Card>
        {/* Proxy */}
        <Card>
          <SectionTitle label="Connection Type"/>
          <Row label="Use Proxy" onClick={()=>setProxyOn(p=>!p)}><Toggle value={proxyOn} onChange={setProxyOn}/></Row>
          {proxyOn && <><Divider/><Row label="Add Proxy" chevron onClick={()=>{}}/></>}
        </Card>
      </div>
    </div>
  );
};

// ─── Appearance Section ───────────────────────────────────────────────────────
const AppearanceSection = () => {
  const [theme, setTheme] = useState<'day'|'night'|'system'>('day');
  const [chatBg, setChatBg] = useState('default');
  const [fontSize, setFontSize] = useState(15);
  const [bigEmoji, setBigEmoji] = useState(true);
  const [bubbles, setBubbles] = useState(true);
  const [animateEmoji, setAnimateEmoji] = useState(true);
  const THEMES = [{id:'day',label:'Day',icon:Sun,color:'#FDB022'},{id:'night',label:'Night',icon:Moon,color:'#8E8E93'},{id:'system',label:'System',icon:Monitor,color:'#2481CC'}] as const;
  const BGOPTS = [{id:'default',color:'#F0F2F5'},{id:'pattern',color:'#dfe6e9'},{id:'gradient',color:'linear-gradient(135deg,#667eea,#764ba2)'},{id:'nature',color:'linear-gradient(135deg,#56ab2f,#a8e063)'},{id:'dark',color:'#1a1a2e'}];
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-[520px] mx-auto space-y-4">
        {/* Theme */}
        <Card>
          <SectionTitle label="Color Theme"/>
          <div className="flex gap-3 px-5 py-4">
            {THEMES.map(t=>(
              <button key={t.id} onClick={()=>setTheme(t.id)}
                className={`flex-1 py-3 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${theme===t.id?'border-[#2481CC] bg-[#E8F4FF]':'border-transparent bg-[#F5F5F5] hover:bg-[#EBEBEB]'}`}>
                <t.icon className="w-6 h-6" style={{color:t.color}}/>
                <span className={`text-[12px] font-semibold ${theme===t.id?'text-[#2481CC]':'text-[#8E8E93]'}`}>{t.label}</span>
              </button>
            ))}
          </div>
          <Divider/>
          <Row label="Chat Background" chevron onClick={()=>{}}>
            <div className="flex gap-1 mr-2">
              {BGOPTS.map(b=>(
                <button key={b.id} onClick={e=>{e.stopPropagation();setChatBg(b.id);}}
                  className={`w-6 h-6 rounded-full border-2 transition-all ${chatBg===b.id?'border-[#2481CC] scale-110':'border-transparent'}`}
                  style={b.color.startsWith('linear')?{background:b.color}:{backgroundColor:b.color}}/>
              ))}
            </div>
          </Row>
        </Card>
        {/* Text size */}
        <Card>
          <SectionTitle label="Messages"/>
          <div className="px-5 py-4">
            <div className="flex justify-between items-baseline mb-3">
              <span className="text-[13px] text-[#8E8E93]">Text Size</span>
              <span className="text-[13px] font-semibold text-[#2481CC]">{fontSize}px</span>
            </div>
            <input type="range" min={12} max={20} value={fontSize} onChange={e=>setFontSize(Number(e.target.value))} className="w-full accent-[#2481CC]"/>
            <div className="flex justify-between mt-2 px-1">
              <span style={{fontSize:12}} className="text-[#8E8E93]">Aa</span>
              <p className="text-[#1C1C1E] leading-relaxed" style={{fontSize}}>The quick brown fox…</p>
              <span style={{fontSize:20}} className="text-[#8E8E93]">Aa</span>
            </div>
          </div>
          <Divider/>
          <Row label="Large Emoji" sub="Show larger emoji in messages without text" onClick={()=>setBigEmoji(v=>!v)}><Toggle value={bigEmoji} onChange={setBigEmoji}/></Row>
          <Divider/>
          <Row label="Animate Emoji" sub="Show animated stickers and emoji" onClick={()=>setAnimateEmoji(v=>!v)}><Toggle value={animateEmoji} onChange={setAnimateEmoji}/></Row>
          <Divider/>
          <Row label="Message Bubbles" sub="Show colored bubbles for outgoing messages" onClick={()=>setBubbles(v=>!v)}><Toggle value={bubbles} onChange={setBubbles}/></Row>
        </Card>
        {/* Accessibility */}
        <Card>
          <SectionTitle label="Accessibility"/>
          <Row label="Reduce Motion" sub="Disable animations throughout the app" onClick={()=>{}}><Toggle value={false} onChange={()=>{}}/></Row>
          <Divider/>
          <Row label="Increase Contrast" onClick={()=>{}}><Toggle value={false} onChange={()=>{}}/></Row>
        </Card>
      </div>
    </div>
  );
};

// ─── Language Section ─────────────────────────────────────────────────────────
const LanguageSection = () => {
  const [lang, setLang] = useState('English');
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
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-[520px] mx-auto space-y-4">
        <Card>
          <SectionTitle label="Interface Language"/>
          {LANGS.map((l,i)=>(
            <React.Fragment key={l.name}>
              {i>0&&<Divider/>}
              <div onClick={()=>setLang(l.name)} className="flex items-center px-5 py-3 cursor-pointer hover:bg-[#F5F5F5] transition-colors">
                <span className="text-[20px] mr-4">{l.code}</span>
                <div className="flex-1"><div className="text-[14px] font-medium text-[#1C1C1E]">{l.name}</div><div className="text-[12px] text-[#8E8E93]">{l.native}</div></div>
                {lang===l.name&&<div className="w-5 h-5 rounded-full bg-[#2481CC] flex items-center justify-center"><Check className="w-3 h-3 text-white"/></div>}
              </div>
            </React.Fragment>
          ))}
        </Card>
        <Card>
          <Row label="Translate Messages" sub="Translate incoming messages automatically" chevron onClick={()=>{}}/>
          <Divider/>
          <Row label="Show Translate Button" onClick={()=>{}}><Toggle value={true} onChange={()=>{}}/></Row>
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
  const [sessions, setSessions] = useState([
    {id:1,icon:Laptop,device:'MacBook Pro 14"',app:'Telegram macOS 10.3.1',location:'San Francisco, US',time:'This device',current:true},
    {id:2,icon:Smartphone,device:'iPhone 15 Pro',app:'Telegram iOS 10.2.3',location:'San Francisco, US',time:'2 hours ago',current:false},
    {id:3,icon:Tablet,device:'iPad Air',app:'Telegram iOS 10.1.0',location:'New York, US',time:'3 days ago',current:false},
    {id:4,icon:Laptop,device:'Windows PC',app:'Telegram Desktop 4.11.1',location:'Chicago, US',time:'1 week ago',current:false},
  ]);
  return (
    <div className="flex-1 overflow-y-auto p-5">
      <div className="max-w-[520px] mx-auto space-y-4">
        {/* Current */}
        <Card>
          <SectionTitle label="Current Session"/>
          {sessions.filter(s=>s.current).map(s=>(
            <div key={s.id} className="flex items-start px-5 py-4 gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F4FF] flex items-center justify-center shrink-0"><s.icon className="w-5 h-5 text-[#2481CC]"/></div>
              <div className="flex-1">
                <div className="font-semibold text-[14px] text-[#1C1C1E]">{s.device}</div>
                <div className="text-[12px] text-[#8E8E93]">{s.app}</div>
                <div className="flex items-center gap-1 mt-1"><div className="w-2 h-2 rounded-full bg-[#4DCA65]"/><span className="text-[12px] text-[#4DCA65] font-medium">Online</span></div>
              </div>
              <div className="text-right"><div className="text-[11px] text-[#8E8E93]">{s.location}</div></div>
            </div>
          ))}
        </Card>
        {/* Other */}
        <Card>
          <SectionTitle label="Other Sessions"/>
          {sessions.filter(s=>!s.current).map((s,i,arr)=>(
            <React.Fragment key={s.id}>
              <div className="flex items-start px-5 py-3.5 gap-4 group hover:bg-[#F5F5F5] cursor-pointer transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#F1F1F1] flex items-center justify-center shrink-0"><s.icon className="w-4.5 h-4.5 text-[#8E8E93]"/></div>
                <div className="flex-1">
                  <div className="font-semibold text-[13px] text-[#1C1C1E]">{s.device}</div>
                  <div className="text-[11px] text-[#8E8E93]">{s.app}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#C7C7CC]"/>
                    <span className="text-[11px] text-[#8E8E93]">{s.location}</span>
                    <span className="text-[#C7C7CC]">·</span>
                    <Clock className="w-3 h-3 text-[#C7C7CC]"/>
                    <span className="text-[11px] text-[#8E8E93]">{s.time}</span>
                  </div>
                </div>
                <button onClick={e=>{e.stopPropagation();setSessions(prev=>prev.filter(x=>x.id!==s.id));}} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#EF4444] hover:text-red-600">
                  <X className="w-4 h-4"/>
                </button>
              </div>
              {i<arr.length-1&&<Divider/>}
            </React.Fragment>
          ))}
        </Card>
        {sessions.filter(s=>!s.current).length>0 && (
          <Card>
            <div className="flex items-center px-5 py-3.5 cursor-pointer hover:bg-[#FEF2F2] transition-colors" onClick={()=>setSessions(prev=>prev.filter(s=>s.current))}>
              <UserX className="w-4 h-4 text-[#EF4444] mr-3 shrink-0"/>
              <span className="text-[14px] font-medium text-[#EF4444]">Terminate All Other Sessions</span>
            </div>
          </Card>
        )}
        {sessions.filter(s=>!s.current).length===0 && (
          <div className="text-center py-8 text-[#8E8E93] text-[14px]">No other active sessions</div>
        )}
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
export function DesktopSettings() {
  const [active, setActive] = useState<Section>('account');
  const [search, setSearch] = useState('');

  const NAV_ITEMS: {id:Section; icon:React.ComponentType<{className?:string}>; label:string; badge?:string; color?:string}[] = [
    { id:'account', icon:Settings, label:'My Account' },
    { id:'notifications', icon:Bell, label:'Notifications and Sounds' },
    { id:'privacy', icon:Shield, label:'Privacy and Security' },
    { id:'data', icon:Database, label:'Data and Storage' },
    { id:'appearance', icon:Palette, label:'Appearance' },
    { id:'language', icon:Globe, label:'Language', badge:'English' },
    { id:'premium', icon:Crown, label:'Telegram Premium', color:'text-[#8B5CF6]' },
    { id:'devices', icon:Monitor, label:'Devices', badge:'4' },
  ];

  const SECTION_TITLES: Record<Section,string> = {
    account:'My Account', notifications:'Notifications and Sounds', privacy:'Privacy and Security',
    data:'Data and Storage', appearance:'Appearance', language:'Language', premium:'Telegram Premium', devices:'Active Sessions',
  };

  return (
    <div style={{width:'1280px',height:'800px',display:'flex',overflow:'hidden',fontFamily:'Inter,system-ui,sans-serif'}}>
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
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer mb-1 ring-2 ring-[#2481CC] ring-offset-2 ring-offset-[#17212B]">JD</div>
      </div>

      {/* Settings list column */}
      <div className="w-[300px] shrink-0 flex flex-col bg-white border-r border-[#EDEDED]">
        <div className="h-[52px] flex items-center px-5 shrink-0 border-b border-[#EDEDED]">
          <h1 className="font-bold text-[17px] text-[#1C1C1E]">Settings</h1>
        </div>
        {/* Search */}
        <div className="px-4 py-2 shrink-0">
          <div className="bg-[#F1F1F1] rounded-full h-8 flex items-center px-3 gap-2">
            <Search className="w-3.5 h-3.5 text-[#8E8E93] shrink-0"/>
            <input type="text" placeholder="Search" value={search} onChange={e=>setSearch(e.target.value)} className="bg-transparent border-none outline-none text-[13px] w-full text-[#1C1C1E] placeholder:text-[#8E8E93]"/>
          </div>
        </div>
        {/* User card */}
        <div className="flex items-center px-4 py-3 cursor-pointer hover:bg-[#F5F5F5] transition-colors border-b border-[#EDEDED]" onClick={()=>setActive('account')}>
          <div className="relative shrink-0 mr-3">
            <div className="w-[46px] h-[46px] rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-[16px]">JD</div>
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#4DCA65] border-2 border-white"/>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-[14px] text-[#1C1C1E] truncate">John Doe</h3>
            <p className="text-[12px] text-[#8E8E93] truncate">+1 (555) 012-3456</p>
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
            <span className="flex-1 text-[13px] font-medium text-[#1C1C1E]">Telegram FAQ</span>
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
          {active==='devices'&&<button className="text-[13px] text-[#2481CC] hover:opacity-70 font-medium">Refresh</button>}
        </div>
        {active==='account'&&<AccountSection/>}
        {active==='notifications'&&<NotificationsSection/>}
        {active==='privacy'&&<PrivacySection/>}
        {active==='data'&&<DataSection/>}
        {active==='appearance'&&<AppearanceSection/>}
        {active==='language'&&<LanguageSection/>}
        {active==='premium'&&<PremiumSection/>}
        {active==='devices'&&<DevicesSection/>}
      </div>
    </div>
  );
}
