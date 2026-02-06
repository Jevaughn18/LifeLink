'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  CallControls,
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, LayoutList, Clock } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const TIMEOUT_SECONDS = 90;

function playMeetingEntrySound(ctx: AudioContext) {
  try {
    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const notes = [
      { freq: 523, start: 0, dur: 0.2 },    // C5
      { freq: 659, start: 0.15, dur: 0.2 }, // E5
      { freq: 784, start: 0.3, dur: 0.3 },  // G5
    ];

    notes.forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur);
    });
  } catch (error) {
    console.error("Error playing meeting entry sound:", error);
  }
}

// Global function to stop ALL media tracks on the page
function stopAllMediaTracksGlobal() {
  console.log('🔴 [Global] Stopping all media tracks...');
  
  // 1. Stop all video element streams
  document.querySelectorAll('video').forEach((video, i) => {
    const stream = (video as HTMLVideoElement).srcObject as MediaStream;
    if (stream && stream.getTracks) {
      console.log(`🔴 [Global] Video ${i}: Found ${stream.getTracks().length} tracks`);
      stream.getTracks().forEach(track => {
        console.log(`🔴 [Global] Stopping: ${track.kind} - ${track.label} (${track.readyState})`);
        track.stop();
      });
      (video as HTMLVideoElement).srcObject = null;
    }
  });
  
  // 2. Stop all audio element streams
  document.querySelectorAll('audio').forEach((audio, i) => {
    const stream = (audio as HTMLAudioElement).srcObject as MediaStream;
    if (stream && stream.getTracks) {
      console.log(`🔴 [Global] Audio ${i}: Found ${stream.getTracks().length} tracks`);
      stream.getTracks().forEach(track => {
        console.log(`🔴 [Global] Stopping: ${track.kind} - ${track.label} (${track.readyState})`);
        track.stop();
      });
      (audio as HTMLAudioElement).srcObject = null;
    }
  });
  
  console.log('🔴 [Global] All tracks stopped');
}

const MeetingRoom = ({ isAdmin }: { isAdmin?: boolean }) => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const call = useCall();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT_SECONDS);
  const [resetKey, setResetKey] = useState(0);
  const [soundPlayed, setSoundPlayed] = useState(false);
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Refs to hold actual media streams for cleanup
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);

  const callingState = useCallCallingState();
  const participants = useParticipants();
  
  // Effect to capture streams and manage hardware light based on mute state
  useEffect(() => {
    if (!call) return;
    
    // Subscribe to camera stream updates
    const camSubscription = call.camera.state.mediaStream$.subscribe((stream) => {
      // If we had a stream before and now it's gone (or changed), 
      // we should ensure the OLD one is stopped to turn off the light.
      if (cameraStreamRef.current && cameraStreamRef.current !== stream) {
        console.log('🔴 [MeetingRoom] Camera stream changed/removed - stopping old tracks');
        cameraStreamRef.current.getTracks().forEach(t => {
          t.stop();
          console.log(`🔴 [MeetingRoom] Stopped old camera track: ${t.label}`);
        });
      }

      if (stream) {
        console.log('🔴 [MeetingRoom] New camera stream acquired');
        cameraStreamRef.current = stream;
      } else {
        console.log('🔴 [MeetingRoom] Camera stream cleared (Muted/Disabled)');
        cameraStreamRef.current = null;
      }
    });

    const micSubscription = call.microphone.state.mediaStream$.subscribe((stream) => {
      if (micStreamRef.current && micStreamRef.current !== stream) {
        console.log('🔴 [MeetingRoom] Mic stream changed/removed - stopping old tracks');
        micStreamRef.current.getTracks().forEach(t => {
          t.stop();
          console.log(`🔴 [MeetingRoom] Stopped old mic track: ${t.label}`);
        });
      }

      if (stream) {
        console.log('🔴 [MeetingRoom] New mic stream acquired');
        micStreamRef.current = stream;
      } else {
        console.log('🔴 [MeetingRoom] Mic stream cleared (Muted/Disabled)');
        micStreamRef.current = null;
      }
    });
    
    return () => {
      camSubscription.unsubscribe();
      micSubscription.unsubscribe();
    };
  }, [call]);

  // Cleanup function - stops all media
  const cleanupMedia = useCallback(async () => {
    console.log('🔴 [MeetingRoom] cleanupMedia called');
    
    // 1. Stop streams from our refs (Most reliable)
    if (cameraStreamRef.current) {
      console.log('🔴 [MeetingRoom] Stopping captured camera stream...');
      cameraStreamRef.current.getTracks().forEach(t => {
        console.log(`🔴 [MeetingRoom] Stopping captured track: ${t.kind}`);
        t.stop();
      });
      cameraStreamRef.current = null;
    }
    
    if (micStreamRef.current) {
      console.log('🔴 [MeetingRoom] Stopping captured mic stream...');
      micStreamRef.current.getTracks().forEach(t => {
        console.log(`🔴 [MeetingRoom] Stopping captured track: ${t.kind}`);
        t.stop();
      });
      micStreamRef.current = null;
    }

    // 2. Stop all tracks via DOM
    stopAllMediaTracksGlobal();
    
    // 3. Then disable via SDK
    try {
      console.log('🔴 [MeetingRoom] Disabling SDK camera...');
      await call?.camera.disable();
      console.log('🔴 [MeetingRoom] Disabling SDK microphone...');
      await call?.microphone.disable();
    } catch (e) {
      console.warn('🔴 [MeetingRoom] SDK disable error:', e);
    }
    
    // Final cleanup - stop any remaining tracks
    stopAllMediaTracksGlobal();
  }, [call]);

  // Initialize AudioContext on first user interaction
  useEffect(() => {
    const init = async () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
        if (audioCtxRef.current.state === "suspended") {
          await audioCtxRef.current.resume();
        }
      }
    };
    document.addEventListener("pointerdown", init, { once: true });
    return () => document.removeEventListener("pointerdown", init);
  }, []);

  // Play sound when user joins the meeting - only once
  useEffect(() => {
    if (callingState === CallingState.JOINED && !soundPlayed && audioCtxRef.current) {
      playMeetingEntrySound(audioCtxRef.current);
      setSoundPlayed(true);
    }
  }, [callingState, soundPlayed]);

  // Handle beforeunload to cleanup on tab close/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🔴 [MeetingRoom] beforeunload - cleaning up');
      // Sync cleanup for beforeunload
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      stopAllMediaTracksGlobal();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Cleanup all media when component unmounts
  useEffect(() => {
    return () => {
      console.log('🔴 [MeetingRoom] Component unmounting - cleaning up');
      
      // Stop ref streams
      if (cameraStreamRef.current) {
        cameraStreamRef.current.getTracks().forEach(t => t.stop());
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(t => t.stop());
      }
      
      stopAllMediaTracksGlobal();
      try {
        call?.camera.disable();
        call?.microphone.disable();
      } catch (error) {
        // best-effort cleanup
      }
    };
  }, [call]);

  // Reset countdown when doctor joins
  useEffect(() => {
    if (participants.length > 1) {
      setTimedOut(false);
      setSecondsLeft(TIMEOUT_SECONDS);
    }
  }, [participants.length]);

  // Countdown interval while patient is alone and not yet timed out
  useEffect(() => {
    if (timedOut || participants.length > 1) return;

    setSecondsLeft(TIMEOUT_SECONDS);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimedOut(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [participants.length, resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleWaitLonger = async () => {
    setTimedOut(false);
    setResetKey((k) => k + 1);
    try {
      await fetch('/api/doctors/pending-consults', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: call?.id, status: 'waiting' }),
      });
    } catch {
      // best-effort
    }
  };

  const handleLeaveCall = async () => {
    console.log('🔴 [MeetingRoom] handleLeaveCall called');
    
    // Cleanup media first
    await cleanupMedia();
    
    // Then leave the call
    try {
      console.log('🔴 [MeetingRoom] Leaving call...');
      await call?.leave();
      console.log('🔴 [MeetingRoom] Call left');
    } catch (e) {
      console.warn('🔴 [MeetingRoom] Leave error:', e);
    }
    
    // Final cleanup
    stopAllMediaTracksGlobal();
    
    // Navigate away
    console.log('🔴 [MeetingRoom] Navigating to', isAdmin ? '/dashboard' : '/meetings');
    router.push(isAdmin ? '/dashboard' : '/meetings');
  };

  if (callingState !== CallingState.JOINED) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#1a1f2e]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-500 border-t-white" />
      </div>
    );
  }

  // Timeout overlay — shown when doctor hasn't joined after countdown
  if (timedOut) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center gap-6 bg-[#1a1f2e] text-white px-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/20">
          <Clock className="h-10 w-10 text-amber-400" />
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">Doctor hasn't joined yet</h2>
          <p className="text-gray-400">
            Your doctor has been notified but hasn't connected. You can wait a bit longer or end the call.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleWaitLonger}
            className="px-6 py-2.5 rounded-xl bg-[#19232d] hover:bg-[#4c535b] text-white text-sm font-medium transition-colors"
          >
            Wait longer
          </button>
          <button
            onClick={handleLeaveCall}
            className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            End call
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="relative h-screen w-full overflow-hidden pt-4 text-white">
      {/* Countdown banner — visible while waiting for doctor */}
      {participants.length <= 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 bg-[#1a1f2e]/90 border border-amber-500/30 rounded-xl px-5 py-3 shadow-lg">
          <Clock className="h-4 w-4 text-amber-400" />
          <span className="text-sm text-amber-300 font-medium">
            Waiting for your doctor… {secondsLeft}s
          </span>
        </div>
      )}

      <div className="relative flex size-full items-center justify-center">
        <div className="flex size-full max-w-[1000px] items-center">
          {layout === 'grid' ? (
            <PaginatedGridLayout />
          ) : layout === 'speaker-right' ? (
            <SpeakerLayout participantsBarPosition="left" />
          ) : (
            <SpeakerLayout participantsBarPosition="right" />
          )}
        </div>
        <div className={cn('h-[calc(100vh-86px)] ml-2', showParticipants ? 'block' : 'hidden')}>
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>

      {/* video layout and call controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls onLeave={handleLeaveCall} />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-gray-800 bg-[#19232d] text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-gray-700" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton />
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]">
            <Users size={20} className="text-white" />
          </div>
        </button>
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;

