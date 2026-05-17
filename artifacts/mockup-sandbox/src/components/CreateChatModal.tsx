import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Radio, Search, Check, UserPlus } from 'lucide-react';
import { api } from '../lib/api';

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  darkMode: boolean;
}

export function CreateChatModal({ isOpen, onClose, onCreated, darkMode }: CreateChatModalProps) {
  const [type, setType] = useState<'group' | 'channel'>('group');
  const [name, setName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'type' | 'details'>('type');

  const bg = {
    panel: darkMode ? '#161b22' : '#FFFFFF',
    panelBorder: darkMode ? '#30363d' : '#EDEDED',
    text: darkMode ? '#e6edf3' : '#1C1C1E',
    textSec: '#8E8E93',
    input: darkMode ? '#0d1117' : '#F1F1F1',
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await api.searchUsers(query);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    }
  };

  const toggleUser = (userId: number) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const chat = await api.createChat({
        name: name.trim(),
        type,
        participantIds: Array.from(selectedUsers),
      });
      onCreated();
      onClose();
      setName('');
      setSelectedUsers(new Set());
      setSearchQuery('');
      setSearchResults([]);
      setStep('type');
    } catch (error: any) {
      const msg = error?.message || 'Ошибка при создании';
      setError(msg);
      console.error('Failed to create chat:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/50" />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: bg.panel }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: `1px solid ${bg.panelBorder}` }}>
              <h2 className="font-bold text-[18px]" style={{ color: bg.text }}>
                {step === 'type' ? 'Новый чат' : type === 'group' ? 'Новая группа' : 'Новый канал'}
              </h2>
              <button onClick={onClose} className="p-1 rounded-lg hover:opacity-70 transition-opacity">
                <X className="w-5 h-5" style={{ color: bg.textSec }} />
              </button>
            </div>

            {step === 'type' ? (
              <div className="p-5 space-y-3">
                <button
                  onClick={() => { setType('group'); setStep('details'); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: darkMode ? '#21262d' : '#F5F5F5' }}
                >
                  <div className="w-12 h-12 rounded-full bg-[#2481CC] flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-[15px]" style={{ color: bg.text }}>Новая группа</div>
                    <div className="text-[13px]" style={{ color: bg.textSec }}>До 200 000 участников</div>
                  </div>
                </button>
                <button
                  onClick={() => { setType('channel'); setStep('details'); }}
                  className="w-full flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.02]"
                  style={{ background: darkMode ? '#21262d' : '#F5F5F5' }}
                >
                  <div className="w-12 h-12 rounded-full bg-[#E85C41] flex items-center justify-center">
                    <Radio className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-[15px]" style={{ color: bg.text }}>Новый канал</div>
                    <div className="text-[13px]" style={{ color: bg.textSec }}>Неограниченная аудитория</div>
                  </div>
                </button>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Name input */}
                <div>
                  <label className="text-[12px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: bg.textSec }}>
                    Название
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={type === 'group' ? 'Название группы' : 'Название канала'}
                    className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none border-2 border-transparent focus:border-[#2481CC] transition-colors"
                    style={{ background: bg.input, color: bg.text }}
                    autoFocus
                  />
                </div>

                {/* User search */}
                <div>
                  <label className="text-[12px] font-semibold uppercase tracking-wider mb-1.5 block" style={{ color: bg.textSec }}>
                    Добавить участников
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: bg.textSec }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Поиск по имени..."
                      className="w-full rounded-xl pl-10 pr-4 py-2.5 text-[14px] outline-none border-2 border-transparent focus:border-[#2481CC] transition-colors"
                      style={{ background: bg.input, color: bg.text }}
                    />
                  </div>
                </div>

                {/* Search results */}
                {searchResults.length > 0 && (
                  <div className="max-h-[200px] overflow-y-auto rounded-xl" style={{ background: darkMode ? '#0d1117' : '#F9F9F9' }}>
                    {searchResults.map((user: any) => (
                      <button
                        key={user.id}
                        onClick={() => toggleUser(user.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left hover:opacity-80 transition-opacity"
                      >
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-[11px]`}>
                          {user.username?.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="flex-1 text-[14px]" style={{ color: bg.text }}>{user.username}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedUsers.has(user.id) ? 'bg-[#2481CC] border-[#2481CC]' : 'border-[#8E8E93]'}`}>
                          {selectedUsers.has(user.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Selected count */}
                {selectedUsers.size > 0 && (
                  <div className="text-[13px] font-medium" style={{ color: '#2481CC' }}>
                    Выбрано: {selectedUsers.size} участник(ов)
                  </div>
                )}

                {/* Actions */}
                {error && (
                  <div className="text-[13px] text-red-400 bg-red-500/10 rounded-lg px-3 py-2">
                    {error}
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setStep('type')}
                    className="flex-1 py-2.5 rounded-xl text-[14px] font-medium transition-colors hover:opacity-80"
                    style={{ background: darkMode ? '#21262d' : '#F1F1F1', color: bg.text }}
                  >
                    Назад
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!name.trim() || loading}
                    className="flex-1 py-2.5 rounded-xl text-[14px] font-medium text-white transition-colors disabled:opacity-50"
                    style={{ background: '#2481CC' }}
                  >
                    {loading ? 'Создание...' : 'Создать'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
