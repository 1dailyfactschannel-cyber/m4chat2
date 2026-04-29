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

  // Messages
  async getMessages(chatId: number, limit = 50, offset = 0) {
    return this.request(`/api/chats/${chatId}/messages?limit=${limit}&offset=${offset}`);
  }

  async sendMessage(chatId: number, content: string, messageType = 'text', replyTo?: number, mediaUrl?: string) {
    return this.request(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, messageType, replyTo, mediaUrl }),
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
}

export const api = new ApiClient();
