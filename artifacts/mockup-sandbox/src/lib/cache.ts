const DB_NAME = 'm4chat-cache';
const DB_VERSION = 1;
const STORE_MESSAGES = 'messages';
const STORE_CHATS = 'chats';
const STORE_USERS = 'users';
const STORE_FILES = 'files';

class CacheDB {
  private db: IDBDatabase | null = null;

  async open(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        if (!db.objectStoreNames.contains(STORE_MESSAGES)) {
          const store = db.createObjectStore(STORE_MESSAGES, { keyPath: 'id' });
          store.createIndex('chatId', 'chatId', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
        }

        if (!db.objectStoreNames.contains(STORE_CHATS)) {
          db.createObjectStore(STORE_CHATS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORE_USERS)) {
          db.createObjectStore(STORE_USERS, { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains(STORE_FILES)) {
          db.createObjectStore(STORE_FILES, { keyPath: 'key' });
        }
      };
    });
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('Database not opened');
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Messages
  async saveMessages(chatId: number, messages: any[]): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_MESSAGES, 'readwrite');
      const store = transaction.objectStore(STORE_MESSAGES);
      for (const message of messages) {
        store.put({ ...message, _cachedAt: Date.now() });
      }
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => { transaction.abort(); reject(transaction.error); };
      transaction.onabort = () => { resolve(); };
    });
  }

  async getMessages(chatId: number, limit = 50): Promise<any[]> {
    const store = this.getStore(STORE_MESSAGES);
    const index = store.index('chatId');
    const request = index.openCursor(chatId, 'prev');

    return new Promise((resolve, reject) => {
      const messages: any[] = [];
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor && messages.length < limit) {
          messages.push(cursor.value);
          cursor.continue();
        } else {
          resolve(messages.reverse());
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearOldMessages(maxAge = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    const store = this.getStore(STORE_MESSAGES, 'readwrite');
    const request = store.openCursor();
    const cutoff = Date.now() - maxAge;

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          if (cursor.value._cachedAt < cutoff) {
            store.delete(cursor.primaryKey);
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Chats
  async saveChats(chats: any[]): Promise<void> {
    if (!this.db) return;
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_CHATS, 'readwrite');
      const store = transaction.objectStore(STORE_CHATS);
      for (const chat of chats) {
        store.put({ ...chat, _cachedAt: Date.now() });
      }
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => { transaction.abort(); reject(transaction.error); };
      transaction.onabort = () => { resolve(); };
    });
  }

  async getChats(): Promise<any[]> {
    const store = this.getStore(STORE_CHATS);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Users
  async saveUser(user: any): Promise<void> {
    const store = this.getStore(STORE_USERS, 'readwrite');
    store.put({ ...user, _cachedAt: Date.now() });
    return new Promise((resolve, reject) => {
      store.transaction.oncomplete = () => resolve();
      store.transaction.onerror = () => reject(store.transaction.error);
    });
  }

  async getUser(id: number): Promise<any | null> {
    const store = this.getStore(STORE_USERS);
    const request = store.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Files (Blob caching)
  async saveFile(key: string, blob: Blob, mimeType: string): Promise<void> {
    const store = this.getStore(STORE_FILES, 'readwrite');
    store.put({ key, blob, mimeType, _cachedAt: Date.now() });
    return new Promise((resolve, reject) => {
      store.transaction.oncomplete = () => resolve();
      store.transaction.onerror = () => reject(store.transaction.error);
    });
  }

  async getFile(key: string): Promise<{ blob: Blob; mimeType: string } | null> {
    const store = this.getStore(STORE_FILES);
    const request = store.get(key);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({ blob: result.blob, mimeType: result.mimeType });
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async clearOldFiles(maxAge = 30 * 24 * 60 * 60 * 1000): Promise<void> {
    const store = this.getStore(STORE_FILES, 'readwrite');
    const request = store.openCursor();
    const cutoff = Date.now() - maxAge;

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          if (cursor.value._cachedAt < cutoff) {
            store.delete(cursor.primaryKey);
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all
  async clearAll(): Promise<void> {
    const stores = [STORE_MESSAGES, STORE_CHATS, STORE_USERS, STORE_FILES];
    for (const storeName of stores) {
      const store = this.getStore(storeName, 'readwrite');
      store.clear();
    }
  }
}

export const cacheDB = new CacheDB();
