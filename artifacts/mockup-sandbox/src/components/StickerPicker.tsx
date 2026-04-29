import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, Plus, Trash2, Image, Smile } from "lucide-react";
import { api } from "../lib/api";

interface Sticker {
  id: number;
  packId: number;
  emoji: string;
  imageUrl: string;
}

interface StickerPack {
  id: number;
  name: string;
  thumbnail?: string;
  createdBy: number;
}

interface StickerPickerProps {
  onSelect: (sticker: { imageUrl: string; emoji: string }) => void;
  onClose: () => void;
  darkMode?: boolean;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({ onSelect, onClose, darkMode }) => {
  const [packs, setPacks] = useState<StickerPack[]>([]);
  const [activePackId, setActivePackId] = useState<number | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreatePack, setShowCreatePack] = useState(false);
  const [newPackName, setNewPackName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bg = {
    panel: darkMode ? "#1f2937" : "#FFFFFF",
    border: darkMode ? "#374151" : "#e5e7eb",
    text: darkMode ? "#e5e7eb" : "#1f2937",
    textSec: darkMode ? "#9ca3af" : "#6b7280",
    hover: darkMode ? "#374151" : "#f3f4f6",
  };

  const loadPacks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getStickerPacks();
      setPacks(data);
      if (data.length > 0 && !activePackId) {
        setActivePackId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load sticker packs:", err);
    } finally {
      setLoading(false);
    }
  }, [activePackId]);

  useEffect(() => {
    loadPacks();
  }, [loadPacks]);

  useEffect(() => {
    if (!activePackId) return;
    (async () => {
      setLoading(true);
      try {
        const data = await api.getStickers(activePackId);
        setStickers(data);
      } catch (err) {
        console.error("Failed to load stickers:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [activePackId]);

  const handleCreatePack = async () => {
    if (!newPackName.trim()) return;
    try {
      const pack = await api.createStickerPack({ name: newPackName.trim() });
      setPacks((prev) => [pack, ...prev]);
      setActivePackId(pack.id);
      setShowCreatePack(false);
      setNewPackName("");
    } catch (err) {
      console.error("Failed to create pack:", err);
    }
  };

  const handleDeletePack = async (packId: number) => {
    if (!confirm("Удалить набор стикеров?")) return;
    try {
      await api.deleteStickerPack(packId);
      setPacks((prev) => prev.filter((p) => p.id !== packId));
      if (activePackId === packId) {
        const remaining = packs.filter((p) => p.id !== packId);
        setActivePackId(remaining[0]?.id || null);
      }
    } catch (err) {
      console.error("Failed to delete pack:", err);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activePackId) return;
    setUploading(true);
    try {
      const result = await api.uploadFile(file);
      const emoji = prompt("Эмодзи для стикера:", "😀") || "😀";
      const sticker = await api.addSticker(activePackId, { emoji, imageUrl: result.url });
      setStickers((prev) => [...prev, sticker]);
    } catch (err) {
      console.error("Failed to upload sticker:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteSticker = async (stickerId: number) => {
    if (!confirm("Удалить стикер?")) return;
    try {
      await api.deleteSticker(stickerId);
      setStickers((prev) => prev.filter((s) => s.id !== stickerId));
    } catch (err) {
      console.error("Failed to delete sticker:", err);
    }
  };

  return (
    <div
      className="absolute bottom-full left-0 right-0 mb-2 rounded-xl shadow-xl border overflow-hidden flex flex-col"
      style={{
        height: 360,
        zIndex: 50,
        background: bg.panel,
        borderColor: bg.border,
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b shrink-0" style={{ borderColor: bg.border }}>
        <span className="text-sm font-medium" style={{ color: bg.text }}>Стикеры</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowCreatePack(true)}
            className="p-1 rounded-md hover:opacity-80 transition-opacity"
            style={{ color: bg.textSec }}
            title="Создать набор"
          >
            <Plus className="w-4 h-4" />
          </button>
          {activePackId && (
            <>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-1 rounded-md hover:opacity-80 transition-opacity"
                style={{ color: bg.textSec }}
                title="Добавить стикер"
              >
                <Image className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </>
          )}
          <button onClick={onClose} className="p-1 rounded-md hover:opacity-80 transition-opacity" style={{ color: bg.textSec }}>
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Create pack modal inline */}
      {showCreatePack && (
        <div className="px-3 py-2 border-b shrink-0 flex items-center gap-2" style={{ borderColor: bg.border }}>
          <input
            type="text"
            placeholder="Название набора..."
            value={newPackName}
            onChange={(e) => setNewPackName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreatePack()}
            className="flex-1 bg-transparent outline-none text-sm border rounded-md px-2 py-1"
            style={{ color: bg.text, borderColor: bg.border }}
          />
          <button
            onClick={handleCreatePack}
            className="text-xs px-2 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          >
            Создать
          </button>
          <button onClick={() => setShowCreatePack(false)} className="text-xs px-2 py-1" style={{ color: bg.textSec }}>
            Отмена
          </button>
        </div>
      )}

      {/* Pack tabs */}
      {packs.length > 0 && (
        <div className="flex items-center gap-1 px-2 py-1.5 border-b overflow-x-auto shrink-0" style={{ borderColor: bg.border }}>
          {packs.map((pack) => (
            <button
              key={pack.id}
              onClick={() => setActivePackId(pack.id)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-xs whitespace-nowrap transition-colors"
              style={{
                background: activePackId === pack.id ? (darkMode ? "#374151" : "#e5e7eb") : "transparent",
                color: activePackId === pack.id ? bg.text : bg.textSec,
              }}
            >
              {pack.name}
              {packs.length > 1 && (
                <span
                  onClick={(e) => { e.stopPropagation(); handleDeletePack(pack.id); }}
                  className="hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3 inline" />
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Stickers grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm" style={{ color: bg.textSec }}>
            Загрузка...
          </div>
        ) : packs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-sm" style={{ color: bg.textSec }}>
            <Smile className="w-8 h-8 opacity-50" />
            <span>Нет наборов стикеров</span>
            <button
              onClick={() => setShowCreatePack(true)}
              className="text-xs px-3 py-1.5 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Создать набор
            </button>
          </div>
        ) : stickers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-sm" style={{ color: bg.textSec }}>
            <Image className="w-8 h-8 opacity-50" />
            <span>В этом наборе пока нет стикеров</span>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Добавить стикер
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-5 gap-2">
            {stickers.map((sticker) => (
              <div key={sticker.id} className="relative group">
                <button
                  onClick={() => onSelect({ imageUrl: sticker.imageUrl, emoji: sticker.emoji })}
                  className="w-full aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity flex items-center justify-center"
                  style={{ background: darkMode ? "#111827" : "#f9fafb" }}
                  title={sticker.emoji}
                >
                  {sticker.imageUrl ? (
                    <img
                      src={sticker.imageUrl}
                      alt={sticker.emoji}
                      className="w-full h-full object-contain p-1"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-2xl">{sticker.emoji}</span>
                  )}
                </button>
                <button
                  onClick={() => handleDeleteSticker(sticker.id)}
                  className="absolute top-0 right-0 p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "rgba(0,0,0,0.5)", color: "#fff" }}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {uploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-sm" style={{ color: bg.text }}>
          Загрузка...
        </div>
      )}
    </div>
  );
};
