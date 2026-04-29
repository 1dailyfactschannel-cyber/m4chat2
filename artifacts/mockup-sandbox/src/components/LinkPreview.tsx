import React, { useState, useEffect } from "react";
import { api } from "../lib/api";

interface LinkPreviewProps {
  url: string;
  darkMode?: boolean;
}

export const LinkPreview: React.FC<LinkPreviewProps> = ({ url, darkMode = false }) => {
  const [preview, setPreview] = useState<{
    title: string | null;
    description: string | null;
    image: string | null;
    siteName: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadPreview = async () => {
      setLoading(true);
      try {
        const data = await api.getLinkPreview(url);
        if (!cancelled) setPreview(data);
      } catch (err) {
        console.error("Link preview failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadPreview();
    return () => { cancelled = true; };
  }, [url]);

  if (loading || !preview || (!preview.title && !preview.description && !preview.image)) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[#2481CC] hover:underline text-sm break-all"
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-lg overflow-hidden border mt-1 transition-colors ${
        darkMode ? "bg-gray-800 border-gray-700 hover:bg-gray-700" : "bg-gray-50 border-gray-200 hover:bg-gray-100"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {preview.image && (
        <div className="w-full h-32 overflow-hidden">
          <img src={preview.image} alt={preview.title || ""} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-2.5">
        {preview.siteName && (
          <div className="text-[11px] uppercase tracking-wide opacity-50 mb-0.5">{preview.siteName}</div>
        )}
        {preview.title && (
          <div className={`text-sm font-medium leading-tight ${darkMode ? "text-gray-200" : "text-gray-800"}`}>
            {preview.title}
          </div>
        )}
        {preview.description && (
          <div className={`text-xs mt-1 line-clamp-2 opacity-70 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            {preview.description}
          </div>
        )}
        <div className="text-[11px] opacity-40 mt-1 truncate">{url}</div>
      </div>
    </a>
  );
};
