import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Play, Pause, Trash2, Send } from 'lucide-react';

interface VoiceRecorderProps {
  onSend: (blob: Blob, duration: number) => void;
  onCancel: () => void;
  darkMode: boolean;
}

export function VoiceRecorder({ onSend, onCancel, darkMode }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const bg = {
    panel: darkMode ? '#161b22' : '#FFFFFF',
    panelBorder: darkMode ? '#30363d' : '#EDEDED',
    text: darkMode ? '#e6edf3' : '#1C1C1E',
    textSec: '#8E8E93',
    input: darkMode ? '#0d1117' : '#F1F1F1',
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Set up audio analysis for waveform
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        audioContext.close();
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setIsPaused(false);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      // Start waveform animation
      const updateWaveform = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const normalized = Array.from(dataArray.slice(0, 40)).map((v) => v / 255);
        setWaveformData(normalized);
        if (isRecording) {
          animationFrameRef.current = requestAnimationFrame(updateWaveform);
        }
      };
      animationFrameRef.current = requestAnimationFrame(updateWaveform);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
      reset();
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  const reset = () => {
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setWaveformData([]);
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 flex-1">
      {!isRecording && !audioBlob && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onMouseDown={startRecording}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ color: bg.textSec }}
        >
          <Mic className="w-5 h-5" />
        </motion.button>
      )}

      {isRecording && (
        <div className="flex items-center gap-3 flex-1 px-3 py-2 rounded-full" style={{ background: bg.input }}>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-red-500 shrink-0"
          />
          <span className="text-[14px] font-medium text-red-500 shrink-0">{formatTime(duration)}</span>
          
          {/* Waveform */}
          <div className="flex-1 flex items-center gap-[2px] h-8">
            {waveformData.map((value, i) => (
              <motion.div
                key={i}
                className="w-[3px] rounded-full bg-red-400"
                animate={{ height: `${Math.max(4, value * 32)}px` }}
                transition={{ duration: 0.05 }}
              />
            ))}
          </div>

          <button onClick={stopRecording} className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors shrink-0">
            <Square className="w-4 h-4" />
          </button>
        </div>
      )}

      {audioBlob && !isRecording && (
        <div className="flex items-center gap-3 flex-1 px-3 py-2 rounded-full" style={{ background: bg.input }}>
          <button onClick={togglePlayback} className="p-2 rounded-full bg-[#2481CC] text-white hover:bg-[#1f73b8] transition-colors shrink-0">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>
          <span className="text-[14px] font-medium" style={{ color: bg.text }}>{formatTime(duration)}</span>
          
          {/* Preview waveform (static) */}
          <div className="flex-1 flex items-center gap-[2px] h-8">
            {Array.from({ length: 40 }, (_, i) => (
              <div
                key={i}
                className="w-[3px] rounded-full bg-[#2481CC]"
                style={{ height: `${Math.max(4, Math.sin(i * 0.3) * 0.5 + 0.5) * 24}px`, opacity: 0.6 }}
              />
            ))}
          </div>

          <button onClick={handleCancel} className="p-2 rounded-full hover:bg-red-50 text-red-500 transition-colors shrink-0">
            <Trash2 className="w-4 h-4" />
          </button>
          <button onClick={handleSend} className="p-2 rounded-full bg-[#2481CC] text-white hover:bg-[#1f73b8] transition-colors shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
