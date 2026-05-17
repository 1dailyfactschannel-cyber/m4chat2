import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileText } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelect: (files: FileList) => void;
  darkMode: boolean;
  children: React.ReactNode;
}

export function FileUploadZone({ onFileSelect, darkMode, children }: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files);
    }
  }, [onFileSelect]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative flex-1 flex flex-col overflow-hidden"
    >
      <AnimatePresence>
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center rounded-xl border-2 border-dashed border-[#2481CC] bg-[#2481CC]/5 pointer-events-none"
          >
            <div className="text-center">
              <div className="text-[#2481CC] text-[18px] font-medium">Перетащите файлы сюда</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </div>
  );
}

interface LightboxProps {
  images: { url: string; name: string }[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ images, currentIndex, isOpen, onClose, onNavigate }: LightboxProps) {
  const [scale, setScale] = useState(1);
  const currentImage = images[currentIndex];

  const handleZoomIn = () => setScale((prev) => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setScale((prev) => Math.max(prev - 0.5, 0.5));
  const handlePrev = () => onNavigate(Math.max(0, currentIndex - 1));
  const handleNext = () => onNavigate(Math.min(images.length - 1, currentIndex + 1));

  if (!isOpen || !currentImage) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onClick={onClose}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="text-[14px]">{currentIndex + 1} / {images.length}</span>
          <span className="text-[14px] opacity-70">{currentImage.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); handleZoomOut(); }} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ZoomOut className="w-5 h-5" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); handleZoomIn(); }} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <ZoomIn className="w-5 h-5" />
          </button>
          <a
            href={currentImage.url}
            download={currentImage.name}
            onClick={(e) => e.stopPropagation()}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Download className="w-5 h-5" />
          </a>
          <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {currentIndex > 0 && (
          <button
            onClick={handlePrev}
            className="absolute left-4 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <motion.img
          key={currentImage.url}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale, opacity: 1 }}
          transition={{ duration: 0.2 }}
          src={currentImage.url}
          alt={currentImage.name}
          className="max-w-[90%] max-h-[90%] object-contain cursor-grab"
          draggable={false}
        />
        {currentIndex < images.length - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 p-3 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

interface FileMessageProps {
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  darkMode: boolean;
  outgoing: boolean;
}

export function FileMessage({ fileName, fileSize, mimeType, url, darkMode, outgoing }: FileMessageProps) {
  const isImage = mimeType.startsWith('image/');
  const isVideo = mimeType.startsWith('video/');
  const isAudio = mimeType.startsWith('audio/');

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const bg = {
    text: darkMode ? '#e6edf3' : '#1C1C1E',
    textSec: '#8E8E93',
  };

  if (isImage) {
    return (
      <div className="rounded-xl overflow-hidden max-w-[300px]">
        <img
          src={url}
          alt={fileName}
          className="w-full h-auto cursor-pointer hover:opacity-90 transition-opacity"
          loading="lazy"
        />
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="rounded-xl overflow-hidden max-w-[300px]">
        <video
          src={url}
          controls
          className="w-full h-auto"
          preload="metadata"
        />
      </div>
    );
  }

  if (isAudio) {
    return (
      <div className="rounded-xl overflow-hidden min-w-[200px]">
        <audio src={url} controls className="w-full" />
      </div>
    );
  }

  return (
    <a
      href={url}
      download={fileName}
      className="flex items-center gap-3 p-3 rounded-xl min-w-[240px] max-w-[320px] hover:opacity-90 transition-opacity"
      style={{ background: outgoing ? 'rgba(255,255,255,0.1)' : darkMode ? '#21262d' : '#F5F5F5' }}
    >
      <div className="w-10 h-10 rounded-lg bg-[#2481CC]/10 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5 text-[#2481CC]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium truncate" style={{ color: outgoing ? 'white' : bg.text }}>{fileName}</div>
        <div className="text-[11px]" style={{ color: outgoing ? 'rgba(255,255,255,0.7)' : bg.textSec }}>{formatSize(fileSize)}</div>
      </div>
      <Download className="w-4 h-4 shrink-0" style={{ color: outgoing ? 'rgba(255,255,255,0.7)' : bg.textSec }} />
    </a>
  );
}
