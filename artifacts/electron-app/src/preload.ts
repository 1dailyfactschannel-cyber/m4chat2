import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  platform: process.platform,
  version: process.versions.electron,

  // Notifications
  showNotification: (title: string, body: string) =>
    ipcRenderer.invoke('show-notification', title, body),

  // Badge
  updateBadge: (count: number) =>
    ipcRenderer.send('update-badge', count),

  // App version
  getAppVersion: () =>
    ipcRenderer.invoke('get-app-version'),

  // Protocol handler
  onProtocolOpenChat: (callback: (chatId: string) => void) =>
    ipcRenderer.on('protocol-open-chat', (_event, chatId) => callback(chatId)),

  // Spellcheck
  setSpellCheckerLanguages: (languages: string[]) =>
    ipcRenderer.send('set-spell-checker-languages', languages),
});
