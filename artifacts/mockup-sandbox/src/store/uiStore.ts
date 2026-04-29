import { create } from 'zustand';

interface UIState {
  // Active chat
  activeChatId: number | null;
  setActiveChatId: (id: number | null) => void;

  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Sidebar / Drawer
  showBurger: boolean;
  setShowBurger: (show: boolean) => void;

  // Profile panel
  showProfile: boolean;
  setShowProfile: (show: boolean) => void;
  profileTab: 'media' | 'files' | 'links' | 'audio';
  setProfileTab: (tab: 'media' | 'files' | 'links' | 'audio') => void;

  // Search
  searchText: string;
  setSearchText: (text: string) => void;
  showSearchBar: boolean;
  setShowSearchBar: (show: boolean) => void;
  searchMsg: string;
  setSearchMsg: (text: string) => void;

  // Input
  replyTo: { id: number; text: string; senderName: string } | null;
  setReplyTo: (reply: { id: number; text: string; senderName: string } | null) => void;
  editingMsgId: number | null;
  setEditingMsgId: (id: number | null) => void;

  // Emoji
  showEmojiPanel: boolean;
  setShowEmojiPanel: (show: boolean) => void;

  // Multi-select
  selectMode: boolean;
  setSelectMode: (mode: boolean) => void;
  selectedMsgs: Set<number>;
  toggleSelectedMsg: (id: number) => void;
  clearSelectedMsgs: () => void;

  // Call
  callState: { type: 'audio' | 'video'; status: 'ringing' | 'active'; seconds: number } | null;
  setCallState: (state: { type: 'audio' | 'video'; status: 'ringing' | 'active'; seconds: number } | null) => void;

  // Notifications
  toasts: { id: number; chatName: string; text: string; avatar: string; color: string }[];
  addToast: (toast: { chatName: string; text: string; avatar: string; color: string }) => void;
  removeToast: (id: number) => void;

  // Font size
  fontSize: number;
  setFontSize: (size: number) => void;

  // Chat background
  chatBgId: string;
  setChatBgId: (id: string) => void;

  // Active folder
  activeFolder: string;
  setActiveFolder: (folder: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeChatId: null,
  setActiveChatId: (id) => set({ activeChatId: id }),

  darkMode: false,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

  showBurger: false,
  setShowBurger: (show) => set({ showBurger: show }),

  showProfile: false,
  setShowProfile: (show) => set({ showProfile: show }),
  profileTab: 'media',
  setProfileTab: (tab) => set({ profileTab: tab }),

  searchText: '',
  setSearchText: (text) => set({ searchText: text }),
  showSearchBar: false,
  setShowSearchBar: (show) => set({ showSearchBar: show }),
  searchMsg: '',
  setSearchMsg: (text) => set({ searchMsg: text }),

  replyTo: null,
  setReplyTo: (reply) => set({ replyTo: reply }),
  editingMsgId: null,
  setEditingMsgId: (id) => set({ editingMsgId: id }),

  showEmojiPanel: false,
  setShowEmojiPanel: (show) => set({ showEmojiPanel: show }),

  selectMode: false,
  setSelectMode: (mode) => set({ selectMode: mode }),
  selectedMsgs: new Set(),
  toggleSelectedMsg: (id) =>
    set((state) => {
      const next = new Set(state.selectedMsgs);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return { selectedMsgs: next };
    }),
  clearSelectedMsgs: () => set({ selectedMsgs: new Set() }),

  callState: null,
  setCallState: (state) => set({ callState: state }),

  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: Date.now() }],
    })),
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  fontSize: 15,
  setFontSize: (size) => set({ fontSize: size }),

  chatBgId: 'default',
  setChatBgId: (id) => set({ chatBgId: id }),

  activeFolder: 'Все',
  setActiveFolder: (folder) => set({ activeFolder: folder }),
}));
