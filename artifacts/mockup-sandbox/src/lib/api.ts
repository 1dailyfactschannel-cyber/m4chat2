const API_URL = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:8080');

class ApiClient {
  private token: string | null = localStorage.getItem('token');

  private async request(path: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(`${API_URL}${path}`, { ...options, headers });

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

  getToken() {
    return this.token;
  }

  // Auth
  async register(username: string, password: string, email?: string) {
    const data = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password, email }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(username: string, password: string) {
    const data = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async logout() {
    await this.request('/api/auth/logout', { method: 'POST' });
    this.setToken(null);
  }

  async getMe() {
    return this.request('/api/auth/me');
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

  // Messages
  async getMessages(chatId: number, limit = 50, offset = 0) {
    return this.request(`/api/chats/${chatId}/messages?limit=${limit}&offset=${offset}`);
  }

  async sendMessage(chatId: number, content: string, messageType = 'text', replyTo?: number) {
    return this.request(`/api/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, messageType, replyTo }),
    });
  }

  // Users
  async searchUsers(query: string) {
    return this.request(`/api/users/search?q=${encodeURIComponent(query)}`);
  }
}

export const api = new ApiClient();
