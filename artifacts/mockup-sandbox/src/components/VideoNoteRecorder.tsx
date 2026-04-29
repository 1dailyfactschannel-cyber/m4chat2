import React, { useState, useRef, useEffect, useCallback } from "react";
import { Video, X, Circle, Square, Send } from "lucide-react";

interface VideoNoteRecorderProps {
  onSend: (blob: Blob, duration: number) => void;
  onCancel: () => void;
  darkMode?: boolean;
}

export const VideoNoteRecorder: React.FC<VideoNoteRecorderProps> = ({ onSend, onCancel, darkMode }) => {
  const [recording, setRecording] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const maxDuration = 60; // Telegram limit

  const startCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 480 }, height: { ideal: 480 } },
        audio: true,
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      alert("Не удалось получить доступ к камере");
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [startCamera]);

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9,opus" });
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setRecordedBlob(blob);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.loop = true;
        videoRef.current.play();
      }
    };

    recorder.start(100);
    setRecording(true);
    setSeconds(0);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= maxDuration) {
          stopRecording();
          return s + 1;
        }
        return s + 1;
      });
    }, 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
  };

  const handleSend = () => {
    if (recordedBlob) {
      onSend(recordedBlob, seconds);
    }
  };

  const handleRetake = () => {
    setRecordedBlob(null);
    setPreviewUrl(null);
    setSeconds(0);
    startCamera();
  };

  const progress = Math.min((seconds / maxDuration) * 100, 100);

  return (
    <div
      className="absolute bottom-full left-0 right-0 mb-2 rounded-xl shadow-xl border overflow-hidden flex flex-col items-center p-4 gap-3"
      style={{
        zIndex: 50,
        background: darkMode ? "#1f2937" : "#FFFFFF",
        borderColor: darkMode ? "#374151" : "#e5e7eb",
      }}
    >
      <div className="flex items-center justify-between w-full">
        <span className="text-sm font-medium" style={{ color: darkMode ? "#e5e7eb" : "#1f2937" }}>
          Видеосообщение
        </span>
        <button onClick={onCancel} className="p-1 rounded-md hover:opacity-70" style={{ color: darkMode ? "#9ca3af" : "#6b7280" }}>
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="relative w-[200px] h-[200px]">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={!previewUrl}
          className="w-full h-full object-cover rounded-full"
          style={{ transform: "scaleX(-1)" }} // mirror front camera
        />
        {recording && (
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="96" fill="none" stroke={darkMode ? "#374151" : "#e5e7eb"} strokeWidth="4" />
            <circle
              cx="100"
              cy="100"
              r="96"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeDasharray={`${2 * Math.PI * 96}`}
              strokeDashoffset={`${2 * Math.PI * 96 * (1 - progress / 100)}`}
              strokeLinecap="round"
            />
          </svg>
        )}
        {recording && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-mono">
            {String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {!recordedBlob ? (
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-all ${
              recording ? "bg-red-500 hover:bg-red-600" : "bg-[#2481CC] hover:bg-[#1f73b8]"
            }`}
          >
            {recording ? <Square className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
          </button>
        ) : (
          <>
            <button
              onClick={handleRetake}
              className="px-3 py-2 rounded-full text-sm border transition-colors"
              style={{
                borderColor: darkMode ? "#4b5563" : "#d1d5db",
                color: darkMode ? "#e5e7eb" : "#374151",
              }}
            >
              Переснять
            </button>
            <button
              onClick={handleSend}
              className="w-12 h-12 rounded-full bg-[#2481CC] hover:bg-[#1f73b8] flex items-center justify-center text-white transition-colors"
            >
              <Send className="w-5 h-5 ml-0.5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
