const API_URL = '';

class ApiClient {
  private token: string | null = localStorage.getItem('token');
  private refreshToken: string | null = localStorage.getItem('refreshToken');

  private async request(path: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });

    if (res.status === 401 && this.refreshToken && !path.includes('/auth/refresh')) {
      // Try to refresh token
      try {
        const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
        if (refreshRes.ok) {
          const data = await refreshRes.json();
          this.setToken(data.token);
          this.setRefreshToken(data.refreshToken);
          headers['Authorization'] = `Bearer ${data.token}`;
          const retryRes = await fetch(`${API_URL}${path}`, { ...options, headers });
          if (!retryRes.ok) throw new Error((await retryRes.json()).error || 'Request failed');
          return retryRes.json();
        }
      } catch {
        this.setToken(null);
        this.setRefreshToken(null);
      }
    }

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(error.error || 'Request failed');
    }

    return res.json();
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  setRefreshToken(token: string | null) {
    this.refreshToken = token;
    if (token) {
      localStorage.setItem('refreshToken', token);
    } else {
      localStorage.removeItem('refreshToken');
    }
  }

  getToken() {
    return this.token;
  }

  getRefreshToken() {
    return this.refreshToken;
  }

  // Auth
  async register(username: string, password: string, email?: string, phone?: string) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email, phone }),
    });
    this.setToken(data.token);
    this.setRefreshToken(data.refreshToken);
    return data;
  }

  async login(username: string, password: string, twoFACode?: string) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password, twoFACode }),
    });
    this.setToken(data.token);
    this.setRefreshToken(data.refreshToken);
    return data;
  }

  async logout() {
    await this.request('/api/auth/logout', { method: 'POST' });
    this.setToken(null);
    this.setRefreshToken(null);
  }

  async logoutAll() {
    await this.request('/api/auth/logout-all', { method: 'POST' });
    this.setToken(null);
    this.setRefreshToken(null);
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  async getDevices() {
    return this.request('/api/auth/devices');
  }

  async revokeDevice(id: number) {
    return this.request(`/api/auth/devices/${id}/revoke`, { method: 'DELETE' });
  }

  async setup2FA() {
    return this.request('/api/auth/2fa/setup', { method: 'POST' });
  }

  async verify2FA(code: string) {
    return this.request('/api/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async disable2FA(code: string) {
    return this.request('/api/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  // Users
  async searchUsers(query: string) {
    return this.request(`/api/users/search?q=${encodeURIComponent(query)}`);
  }

  async getUser(id: number) {
    return this.request(`/api/users/${id}`);
  }

  async updateProfile(data: { email?: string; phone?: string; bio?: string; avatarUrl?: string }) {
    return this.request('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Chats
  async getChats() {
    return this.request('/api/chats');
  }

  async getChat(chatId: number) {
    return this.request(`/api/chats/${chatId}`);
  }

  async createChat(data: { name?: string; type: string; participantIds?: number[] }) {
    return this.request('/api/chats', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteChat(chatId: number) {
    return this.request(`/api/chats/${chatId}`, { method: 'DELETE' });
  }

  async getChatMembers(chatId: number) {
    return this.request(`/api/chats/${chatId}/members`);
  }

  async addChatMember(chatId: number, userId: number) {
    return this.request(`/api/chats/${chatId}/members`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  async removeChatMember(chatId: number, userId: number) {
    return this.request(`/api/chats/${chatId}/members/${userId}`, { method: 'DELETE' });
  }

  async generateInviteLink(chatId: number) {
    return this.request(`/api/chats/${chatId}/invite`, { method: 'POST' });
  }

  async joinByInvite(inviteLink: string) {
    return this.request(`/api/chats/join/${inviteLink}`, { method: 'POST' });
  }

  async updateMemberRole(chatId: number, userId: number, role: string) {
    return this.request(`/api/chats/${chatId}/members/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async pinChat(chatId: number) {
    return this.request(`/api/chats/${chatId}/pin`, { method: 'POST' });
  }

  async unpinChat(chatId: number) {
    return this.request(`/api/chats/${chatId}/unpin`, { method: 'POST' });
  }

  async archiveChat(chatId: number) {
    return this.request(`/api/chats/${chatId}/archive`, { method: 'POST' });
  }

  async unarchiveChat(chatId: number) {
    return this.request(`/api/chats/${chatId}/unarchive`, { method: 'POST' });
  }

  async updateChatPhoto(chatId: number, photo: string) {
    return this.request(`/api/chats/${chatId}/photo`, {
      method: 'PUT',
      body: JSON.stringify({ photo }),
    });
  }

  async updateAutoDeleteTimer(chatId: number, timer: number | null) {
    return this.request(`/api/chats/${chatId}/auto-delete`, {
      method: 'PUT',
      body: JSON.stringify({ timer }),
    });
  }

  // Signal Protocol
  async registerSignalKeys(keys: {
    registrationId: number;
    identityKey: string;
    signedPreKey: { keyId: number; publicKey: string; signature: string };
    preKeys: { keyId: number; publicKey: string }[];
  }) {
    return this.request('/api/keys/register', {
      method: 'POST',
      body: JSON.stringify(keys),
    });
  }

  async getSignalKeyBundle(userId: number) {
    return this.request(`/api/keys/bundle/${userId}`);
  }

  // Folders
  async getFolders() {
    return this.request('/api/folders');
  }

  async createFolder(data: { name: string; icon?: string; color?: string; includeTypes?: string; excludeMuted?: boolean }) {
    return this.request('/api/folders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateFolder(folderId: number, data: { name?: string; icon?: string; color?: string; includeTypes?: string; excludeMuted?: boolean; sortOrder?: number }) {
    return this.request(`/api/folders/${folderId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteFolder(folderId: number) {
    return this.request(`/api/folders/${folderId}`, { method: 'DELETE' });
  }

  async addChatToFolder(folderId: number, chatId: number) {
    return this.request(`/api/folders/${folderId}/chats/${chatId}`, { method: 'POST' });
  }

  async removeChatFromFolder(folderId: number, chatId: number) {
    return this.request(`/api/folders/${folderId}/chats/${chatId}`, { method: 'DELETE' });
  }

  // Link Preview
  async getLinkPreview(url: string) {
    return this.request(`/api/link-preview?url=${encodeURIComponent(url)}`);
  }

  // GIFs
  async searchGifs(query: string, limit = 20) {
    return this.request(`/api/gifs/search?q=${encodeURIComponent(query)}&limit=${limit}`);
  }

  async getTrendingGifs() {
    return this.request('/api/gifs/trending');
  }

  // Stickers
  async getStickerPacks() {
    return this.request('/api/sticker-packs');
  }

  async createStickerPack(data: { name: string; thumbnail?: string }) {
    return this.request('/api/sticker-packs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteStickerPack(packId: number) {
    return this.request(`/api/sticker-packs/${packId}`, { method: 'DELETE' });
  }

  async getStickers(packId: number) {
    return this.request(`/api/sticker-packs/${packId}/stickers`);
  }

  async addSticker(packId: number, data: { emoji: string; imageUrl: string }) {
    return this.request(`/api/sticker-packs/${packId}/stickers`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteSticker(stickerId: number) {
    return this.request(`/api/stickers/${stickerId}`, { method: 'DELETE' });
  }

  async getRecentStickers() {
    return this.request('/api/stickers/recent');
  }

  // Bots
  async getBots() {
    return this.request('/api/bots');
  }

  async createBot(data: { username: string; name: string; description?: string }) {
    return this.request('/api/bots', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteBot(botId: number) {
    return this.request(`/api/bots/${botId}`, { method: 'DELETE' });
  }

  async updateBot(botId: number, data: { name?: string; description?: string; avatarUrl?: string; webhookUrl?: string; isActive?: boolean }) {
    return this.request(`/api/bots/${botId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async regenerateBotToken(botId: number) {
    return this.request(`/api/bots/${botId}/regenerate-token`, { method: 'POST' });
  }

  async getBotCommands(botId: number) {
    return this.request(`/api/bots/${botId}/commands`);
  }

  async setBotCommands(botId: number, commands: { command: string; description: string }[]) {
    return this.request(`/api/bots/${botId}/commands`, {
      method: 'POST',
      body: JSON.stringify({ commands }),
    });
  }

  async getBotByUsername(username: string) {
    return this.request(`/api/bots/username/${username}`);
  }

  // Polls
  async createPoll(messageId: number, question: string, options: string[], isAnonymous = true, allowsMultiple = false) {
    return this.request(`/api/messages/${messageId}/poll`, {
      method: 'POST',
      body: JSON.stringify({ question, options, isAnonymous, allowsMultiple }),
    });
  }

  async getPoll(messageId: number) {
    return this.request(`/api/messages/${messageId}/poll`);
  }

  async votePoll(pollId: number, optionIndex: number) {
    return this.request(`/api/polls/${pollId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ optionIndex }),
    });
  }

  // Messages
  async getMessages(chatId: number, limit = 50, offset = 0) {
    return this.request(`/api/chats/${chatId}/messages?limit=${limit}&offset=${offset}`);
  }

  async sendMessage(chatId: number, content: string, messageType = 'text', replyTo?: number, mediaUrl?: string, isSilent?: boolean, encryptedPayload?: string) {
    return this.request(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, messageType, replyTo, mediaUrl, isSilent, encryptedPayload }),
    });
  }

  async editMessage(messageId: number, content: string) {
    return this.request(`/api/messages/${messageId}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  async deleteMessage(messageId: number) {
    return this.request(`/api/messages/${messageId}`, { method: 'DELETE' });
  }

  async pinMessage(messageId: number, pinned: boolean) {
    return this.request(`/api/messages/${messageId}/pin`, {
      method: 'POST',
      body: JSON.stringify({ pinned }),
    });
  }

  async addReaction(messageId: number, emoji: string) {
    return this.request(`/api/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji }),
    });
  }

  async forwardMessage(messageId: number, chatId: number) {
    return this.request(`/api/messages/${messageId}/forward`, {
      method: 'POST',
      body: JSON.stringify({ chatId }),
    });
  }

  async searchMessages(q: string, chatId?: number) {
    const params = new URLSearchParams({ q });
    if (chatId) params.append('chatId', String(chatId));
    return this.request(`/api/messages/search?${params.toString()}`);
  }

  // Files
  async uploadFile(file: File, chatId?: number) {
    const formData = new FormData();
    formData.append('file', file);
    if (chatId) formData.append('chatId', String(chatId));

    const headers: Record<string, string> = {};
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_URL}/api/files/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(error.error || 'Upload failed');
    }

    return res.json();
  }

  // Settings
  async getSettings() {
    return this.request('/api/settings');
  }

  async updateSettings(data: {
    notifications?: Record<string, any>;
    privacy?: Record<string, any>;
    appearance?: Record<string, any>;
    language?: Record<string, any>;
    data?: Record<string, any>;
  }) {
    return this.request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
