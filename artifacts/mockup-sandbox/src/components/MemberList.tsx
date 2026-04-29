import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Crown, Shield, UserMinus, UserPlus, CrownIcon } from 'lucide-react';
import { api } from '../lib/api';

interface MemberListProps {
  chatId: number;
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  currentUserId?: number;
  userRole?: string;
}

export function MemberList({ chatId, isOpen, onClose, darkMode, currentUserId, userRole }: MemberListProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const bg = {
    panel: darkMode ? '#161b22' : '#FFFFFF',
    panelBorder: darkMode ? '#30363d' : '#EDEDED',
    text: darkMode ? '#e6edf3' : '#1C1C1E',
    textSec: '#8E8E93',
    input: darkMode ? '#0d1117' : '#F1F1F1',
  };

  const canManage = userRole === 'creator' || userRole === 'admin';

  useEffect(() => {
    if (isOpen && chatId) {
      loadMembers();
    }
  }, [isOpen, chatId]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await api.getChatMembers(chatId);
      setMembers(data);
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await api.searchUsers(query);
      // Filter out existing members
      const existingIds = new Set(members.map((m) => m.userId));
      setSearchResults(results.filter((r: any) => !existingIds.has(r.id)));
    } catch {
      setSearchResults([]);
    }
  };

  const handleAddMember = async (userId: number) => {
    try {
      await api.addChatMember(chatId, userId);
      loadMembers();
      setSearchQuery('');
      setSearchResults([]);
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    try {
      await api.removeChatMember(chatId, userId);
      loadMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
    }
  };

  const handleUpdateRole = async (userId: number, role: string) => {
    try {
      await api.updateMemberRole(chatId, userId, role);
      loadMembers();
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'creator': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin': return <Shield className="w-4 h-4 text-[#2481CC]" />;
      default: return null;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'creator': return 'Создатель';
      case 'admin': return 'Админ';
      case 'restricted': return 'Ограничен';
      default: return 'Участник';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-[320px] shrink-0 flex flex-col overflow-hidden"
          style={{ background: bg.panel, borderLeft: `1px solid ${bg.panelBorder}` }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: `1px solid ${bg.panelBorder}` }}>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" style={{ color: bg.textSec }} />
              <span className="font-semibold text-[15px]" style={{ color: bg.text }}>Участники</span>
              <span className="text-[12px]" style={{ color: bg.textSec }}>{members.length}</span>
            </div>
            <button onClick={onClose}><X className="w-5 h-5" style={{ color: bg.textSec }} /></button>
          </div>

          {/* Add member button */}
          {canManage && (
            <button
              onClick={() => setShowAddMember(!showAddMember)}
              className="mx-4 mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-[14px] font-medium transition-colors"
              style={{ background: darkMode ? '#21262d' : '#F0F7FF', color: '#2481CC' }}
            >
              <UserPlus className="w-4 h-4" />
              Добавить участников
            </button>
          )}

          {/* Add member search */}
          <AnimatePresence>
            {showAddMember && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Поиск пользователей..."
                    className="w-full rounded-xl px-3 py-2 text-[13px] outline-none"
                    style={{ background: bg.input, color: bg.text }}
                    autoFocus
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="px-4 pb-2 max-h-[150px] overflow-y-auto">
                    {searchResults.map((user: any) => (
                      <button
                        key={user.id}
                        onClick={() => handleAddMember(user.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg hover:opacity-80 transition-opacity"
                      >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-[11px]">
                          {user.username?.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="flex-1 text-[13px]" style={{ color: bg.text }}>{user.username}</span>
                        <UserPlus className="w-4 h-4 text-[#2481CC]" />
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Members list */}
          <div className="flex-1 overflow-y-auto p-2">
            {loading ? (
              <div className="text-center py-4 text-[13px]" style={{ color: bg.textSec }}>Загрузка...</div>
            ) : (
              members.map((member) => (
                <div
                  key={member.id}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${darkMode ? 'hover:bg-[#21262d]' : 'hover:bg-[#F5F5F5]'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-[12px]">
                    {member.username?.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-[14px] truncate" style={{ color: bg.text }}>{member.username}</span>
                      {getRoleIcon(member.role)}
                    </div>
                    <span className="text-[11px]" style={{ color: bg.textSec }}>{getRoleLabel(member.role)}</span>
                  </div>
                  {canManage && member.userId !== currentUserId && member.role !== 'creator' && (
                    <div className="flex items-center gap-1">
                      {userRole === 'creator' && (
                        <button
                          onClick={() => handleUpdateRole(member.userId, member.role === 'admin' ? 'member' : 'admin')}
                          className="p-1.5 rounded-lg hover:bg-[#2481CC]/10 transition-colors"
                          title={member.role === 'admin' ? 'Понизить' : 'Сделать админом'}
                        >
                          <CrownIcon className="w-4 h-4 text-[#2481CC]" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveMember(member.userId)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <UserMinus className="w-4 h-4 text-[#EF4444]" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
