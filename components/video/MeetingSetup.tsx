'use client';

import { useEffect, useState, useRef } from 'react';
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';

const MeetingSetup = ({ setIsSetupComplete }: { setIsSetupComplete: (value: boolean) => void }) => {
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived = callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();
  if (!call) throw new Error('useStreamCall must be used within a StreamCall component.');

  const [isMicCamToggled, setIsMicCamToggled] = useState(false);
  
  // Refs to capture streams for robust cleanup
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isMicCamToggled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [isMicCamToggled, call.camera, call.microphone]);

  // Capture streams to ensure we can stop them
  useEffect(() => {
    if (!call) return;
    
    const camSub = call.camera.state.mediaStream$.subscribe((stream) => {
      if (stream) {
        console.log('🔴 [MeetingSetup] Captured camera stream');
        cameraStreamRef.current = stream;
      } else {
        cameraStreamRef.current = null;
      }
    });
    
    const micSub = call.microphone.state.mediaStream$.subscribe((stream) => {
      if (stream) {
        console.log('🔴 [MeetingSetup] Captured mic stream');
        micStreamRef.current = stream;
      } else {
        micStreamRef.current = null;
      }
    });
    
    return () => {
      camSub.unsubscribe();
      micSub.unsubscribe();
    };
  }, [call]);

  // Helper to stop all active media tracks in the browser
  const stopAllMediaTracks = () => {
    console.log('🔴 [MeetingSetup] Stopping all media tracks...');
    
    // 1. Stop captured ref streams (Most reliable)
    if (cameraStreamRef.current) {
      console.log('🔴 [MeetingSetup] Stopping captured camera stream tracks');
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
    }
    
    if (micStreamRef.current) {
      console.log('🔴 [MeetingSetup] Stopping captured mic stream tracks');
      micStreamRef.current.getTracks().forEach(t => t.stop());
    }
    
    // 2. Stop all video element streams (DOM scan)
    document.querySelectorAll('video').forEach((video, i) => {
      const stream = (video as HTMLVideoElement).srcObject as MediaStream;
      if (stream && stream.getTracks) {
        console.log(`🔴 [MeetingSetup] Video ${i}: Found ${stream.getTracks().length} tracks`);
        stream.getTracks().forEach(track => {
          track.stop();
        });
        (video as HTMLVideoElement).srcObject = null;
      }
    });
    
    // 3. Stop all audio element streams
    document.querySelectorAll('audio').forEach((audio, i) => {
      const stream = (audio as HTMLAudioElement).srcObject as MediaStream;
      if (stream && stream.getTracks) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
        (audio as HTMLAudioElement).srcObject = null;
      }
    });

    console.log('🔴 [MeetingSetup] All tracks stopped');
  };

  // Cleanup when leaving setup - IMPORTANT: Stop all media streams
  useEffect(() => {
    return () => {
      console.log('🔴 [MeetingSetup] Unmounting - cleaning up');
      stopAllMediaTracks();
      try {
        call.camera.disable();
        call.microphone.disable();
      } catch (error) {
        // best-effort cleanup
      }
    };
  }, [call]);

  if (callTimeNotArrived) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#1a1f2e] text-white">
        <p className="text-lg">Your meeting has not started yet. It is scheduled for {callStartsAt.toLocaleString()}</p>
      </div>
    );
  }

  if (callHasEnded) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-[#1a1f2e] text-white">
        <p className="text-lg">The call has been ended by the host.</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-[#1a1f2e] text-white">
      <h1 className="text-center text-2xl font-bold">Setup</h1>
      <VideoPreview />
      <div className="flex h-16 items-center justify-center gap-3">
        <label className="flex items-center justify-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={isMicCamToggled}
            onChange={(e) => setIsMicCamToggled(e.target.checked)}
          />
          Join with mic and camera off
        </label>
        <DeviceSettings />
      </div>
      <button
        className="rounded-md bg-green-500 hover:bg-green-600 px-6 py-2.5 text-white font-medium transition-colors"
        onClick={async () => {
          // If joining with mic/cam off, we should stop the preview tracks explicitly
          if (isMicCamToggled) {
             stopAllMediaTracks();
          }
          
          await call.join();
          setIsSetupComplete(true);
        }}
      >
        Join meeting
      </button>
    </div>
  );
};

export default MeetingSetup;
