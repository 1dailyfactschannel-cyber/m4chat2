import React, { useRef, useEffect, useState, useCallback } from "react";
import { Play, Pause } from "lucide-react";

interface VoiceMessageProps {
  url: string;
  duration?: number | string;
  darkMode?: boolean;
  outgoing?: boolean;
}

export const VoiceMessage: React.FC<VoiceMessageProps> = ({
  url,
  duration = 0,
  darkMode = false,
  outgoing = false,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  // Generate fake waveform data (in real app, analyze audio buffer)
  useEffect(() => {
    const bars = 40;
    const data: number[] = [];
    for (let i = 0; i < bars; i++) {
      // Create a somewhat realistic pattern
      const base = Math.sin(i * 0.5) * 0.3 + 0.5;
      const noise = Math.random() * 0.4;
      data.push(Math.min(1, Math.max(0.1, base + noise)));
    }
    setWaveformData(data);
  }, [url]);

  // Draw waveform
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || waveformData.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const barWidth = width / waveformData.length * 0.7;
    const gap = width / waveformData.length * 0.3;

    ctx.clearRect(0, 0, width, height);

    const progress = durationNum > 0 ? currentTime / durationNum : 0;

    waveformData.forEach((amp, i) => {
      const x = i * (barWidth + gap) + gap / 2;
      const barHeight = amp * height * 0.8;
      const y = (height - barHeight) / 2;

      const barProgress = i / waveformData.length;
      const isPlayed = barProgress <= progress;

      ctx.fillStyle = isPlayed
        ? outgoing
          ? "rgba(255,255,255,0.9)"
          : "#2481CC"
        : outgoing
          ? "rgba(255,255,255,0.4)"
          : darkMode
            ? "rgba(255,255,255,0.3)"
            : "rgba(0,0,0,0.2)";

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
      ctx.fill();
    });
  }, [waveformData, currentTime, duration, outgoing, darkMode]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      setCurrentTime(audio.currentTime);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const durationNum = typeof duration === 'string' ? Number(duration) || 0 : duration;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-2 min-w-[200px]">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        className="hidden"
      />
      <button
        onClick={togglePlay}
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
          outgoing ? "bg-white/20 text-white" : "bg-[#2481CC]/10 text-[#2481CC]"
        }`}
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex-1 flex flex-col gap-1">
        <canvas
          ref={canvasRef}
          className="w-full h-8 cursor-pointer"
          onClick={(e) => {
            const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
            const x = e.clientX - rect.left;
            const progress = x / rect.width;
            if (audioRef.current && durationNum) {
              audioRef.current.currentTime = progress * durationNum;
            }
          }}
        />
        <div className="flex justify-between text-[10px] opacity-60">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(durationNum)}</span>
        </div>
      </div>
    </div>
  );
};
