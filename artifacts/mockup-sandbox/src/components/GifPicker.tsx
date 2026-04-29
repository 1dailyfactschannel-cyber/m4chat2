import React, { useState, useEffect, useCallback } from "react";
import { Search, X, TrendingUp } from "lucide-react";
import { api } from "../lib/api";

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
  onClose: () => void;
  darkMode?: boolean;
}

export const GifPicker: React.FC<GifPickerProps> = ({ onSelect, onClose, darkMode }) => {
  const [query, setQuery] = useState("");
  const [gifs, setGifs] = useState<{ id: string; url: string; preview: string; title: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const searchGifs = useCallback(async (q: string) => {
    setLoading(true);
    try {
      const results = q.trim()
        ? await api.searchGifs(q, 20)
        : await api.getTrendingGifs();
      setGifs(results);
    } catch (err) {
      console.error("GIF search failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    searchGifs("");
  }, [searchGifs]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      searchGifs(query);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, searchGifs]);

  return (
    <div
      className={`absolute bottom-full left-0 right-0 mb-2 rounded-xl shadow-xl border overflow-hidden flex flex-col ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
      style={{ height: 320, zIndex: 50 }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b shrink-0" style={{ borderColor: darkMode ? "#374151" : "#e5e7eb" }}>
        <Search className="w-4 h-4 shrink-0" style={{ color: darkMode ? "#9ca3af" : "#6b7280" }} />
        <input
          type="text"
          placeholder="Поиск GIF..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: darkMode ? "#e5e7eb" : "#1f2937" }}
        />
        {query && (
          <button onClick={() => setQuery("")}>
            <X className="w-4 h-4" style={{ color: darkMode ? "#9ca3af" : "#6b7280" }} />
          </button>
        )}
        <button onClick={onClose}>
          <X className="w-4 h-4" style={{ color: darkMode ? "#9ca3af" : "#6b7280" }} />
        </button>
      </div>

      {/* Trending label */}
      {!query && (
        <div className="flex items-center gap-1 px-3 py-1.5 text-xs shrink-0" style={{ color: darkMode ? "#9ca3af" : "#6b7280" }}>
          <TrendingUp className="w-3 h-3" />
          <span>Популярное</span>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-sm" style={{ color: darkMode ? "#9ca3af" : "#6b7280" }}>
            Загрузка...
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {gifs.map((gif) => (
              <button
                key={gif.id}
                onClick={() => onSelect(gif.url)}
                className="relative aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
              >
                <img
                  src={gif.preview}
                  alt={gif.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
