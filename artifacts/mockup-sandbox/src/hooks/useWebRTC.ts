import { useRef, useCallback, useState, useEffect } from 'react';
import { useSocket } from './useSocket';

interface PeerConnectionState {
  pc: RTCPeerConnection | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnected: boolean;
  isCalling: boolean;
  callType: 'audio' | 'video' | null;
  isScreenSharing: boolean;
  error: string | null;
}

const ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function useWebRTC() {
  const [state, setState] = useState<PeerConnectionState>({
    pc: null,
    localStream: null,
    remoteStream: null,
    isConnected: false,
    isCalling: false,
    callType: null,
    isScreenSharing: false,
    error: null,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const chatIdRef = useRef<number | null>(null);

  const socket = useSocket();

  // Initialize peer connection
  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (event) => {
      if (event.candidate && chatIdRef.current) {
        socket.socket?.emit('webrtc:ice-candidate', {
          chatId: chatIdRef.current,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setState((prev) => ({ ...prev, remoteStream: event.streams[0] }));
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        setState((prev) => ({ ...prev, isConnected: true }));
      } else if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        endCall();
      }
    };

    return pc;
  }, [socket.socket]);

  // Start a call
  const startCall = useCallback(async (chatId: number, type: 'audio' | 'video') => {
    try {
      chatIdRef.current = chatId;
      const constraints = {
        audio: true,
        video: type === 'video' ? { width: 1280, height: 720 } : false,
      };

      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      const pc = createPeerConnection();

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.socket?.emit('webrtc:offer', { chatId, offer, type });

      setState({
        pc,
        localStream,
        remoteStream: null,
        isConnected: false,
        isCalling: true,
        callType: type,
        isScreenSharing: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
    }
  }, [createPeerConnection, socket.socket]);

  // Accept an incoming call
  const acceptCall = useCallback(async (chatId: number, offer: RTCSessionDescriptionInit, type: 'audio' | 'video') => {
    try {
      chatIdRef.current = chatId;
      const constraints = {
        audio: true,
        video: type === 'video' ? { width: 1280, height: 720 } : false,
      };

      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      const pc = createPeerConnection();

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      await pc.setRemoteDescription(offer);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.socket?.emit('webrtc:answer', { chatId, answer });

      setState({
        pc,
        localStream,
        remoteStream: null,
        isConnected: false,
        isCalling: true,
        callType: type,
        isScreenSharing: false,
        error: null,
      });
    } catch (error: any) {
      setState((prev) => ({ ...prev, error: error.message }));
    }
  }, [createPeerConnection, socket.socket]);

  // Handle incoming answer
  const handleAnswer = useCallback(async (answer: RTCSessionDescriptionInit) => {
    const { pc } = stateRef.current;
    if (pc) {
      await pc.setRemoteDescription(answer);
    }
  }, []);

  // Handle ICE candidate
  const handleIceCandidate = useCallback(async (candidate: RTCIceCandidateInit) => {
    const { pc } = stateRef.current;
    if (pc) {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    }
  }, []);

  // End call
  const endCall = useCallback(() => {
    const { pc, localStream } = stateRef.current;

    localStream?.getTracks().forEach((track) => track.stop());
    pc?.close();

    if (chatIdRef.current) {
      socket.socket?.emit('webrtc:end', { chatId: chatIdRef.current });
    }
    chatIdRef.current = null;

    setState({
      pc: null,
      localStream: null,
      remoteStream: null,
      isConnected: false,
      isCalling: false,
      callType: null,
      isScreenSharing: false,
      error: null,
    });
  }, [socket.socket]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const { localStream } = stateRef.current;
    const audioTrack = localStream?.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
    }
  }, []);

  // Toggle video
  const toggleVideo = useCallback(() => {
    const { localStream } = stateRef.current;
    const videoTrack = localStream?.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
    }
  }, []);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const { pc, localStream } = stateRef.current;
      if (!pc || !localStream) return;

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });

      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
      if (sender) {
        await sender.replaceTrack(screenTrack);
      }

      // Update local stream to show screen
      localStream.getVideoTracks().forEach((t) => t.stop());
      localStream.addTrack(screenTrack);

      setState((prev) => ({ ...prev, isScreenSharing: true }));

      // Stop screen share when user stops sharing
      screenTrack.onended = () => {
        stopScreenShare();
      };
    } catch (error: any) {
      console.error('Screen share failed:', error);
    }
  }, []);

  // Stop screen sharing and return to camera
  const stopScreenShare = useCallback(async () => {
    try {
      const { pc, localStream, callType } = stateRef.current;
      if (!pc || !localStream) return;

      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video' ? { width: 1280, height: 720 } : false,
        audio: false,
      });

      const cameraTrack = cameraStream.getVideoTracks()[0];
      const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
      if (sender && cameraTrack) {
        await sender.replaceTrack(cameraTrack);
      }

      // Update local stream
      localStream.getVideoTracks().forEach((t) => t.stop());
      if (cameraTrack) {
        localStream.addTrack(cameraTrack);
      }

      setState((prev) => ({ ...prev, isScreenSharing: false }));
    } catch (error: any) {
      console.error('Stop screen share failed:', error);
    }
  }, []);

  // Listen for WebRTC events
  useEffect(() => {
    const unsubAnswer = socket.socket?.on('webrtc:answer', ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      handleAnswer(answer);
    });

    const unsubIce = socket.socket?.on('webrtc:ice-candidate', ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      handleIceCandidate(candidate);
    });

    const unsubEnd = socket.socket?.on('webrtc:end', () => {
      endCall();
    });

    const unsubOffer = socket.socket?.on('webrtc:offer', ({ offer, type }: { offer: RTCSessionDescriptionInit; type: 'audio' | 'video' }) => {
      // Handle incoming call - this would typically trigger a ring UI
      console.log('Incoming call:', type);
    });

    return () => {
      unsubAnswer?.off();
      unsubIce?.off();
      unsubEnd?.off();
      unsubOffer?.off();
    };
  }, [socket.socket, handleAnswer, handleIceCandidate, endCall]);

  return {
    ...state,
    startCall,
    acceptCall,
    endCall,
    toggleMute,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  };
}
