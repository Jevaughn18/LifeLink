'use client';
import { useState, useEffect } from 'react';
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
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

const TIMEOUT_SECONDS = 90;

const MeetingRoom = () => {
  const searchParams = useSearchParams();
  const isPersonalRoom = !!searchParams.get('personal');
  const router = useRouter();
  const call = useCall();
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(TIMEOUT_SECONDS);
  const [resetKey, setResetKey] = useState(0);
  const { useCallCallingState, useParticipants } = useCallStateHooks();

  const callingState = useCallCallingState();
  const participants = useParticipants();

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

  // Cleanup media tracks on unmount (e.g., browser back, tab close)
  useEffect(() => {
    return () => {
      // Disable SDK-level
      call?.camera.disable();
      call?.microphone.disable();

      // Stop all video element streams
      document.querySelectorAll('video').forEach((video) => {
        const stream = (video as HTMLVideoElement).srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          (video as HTMLVideoElement).srcObject = null;
        }
      });

      // Stop all audio element streams
      document.querySelectorAll('audio').forEach((audio) => {
        const stream = (audio as HTMLAudioElement).srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          (audio as HTMLAudioElement).srcObject = null;
        }
      });

      // Try SDK-level streams
      try {
        const camStream = call?.camera?.state?.mediaStream;
        if (camStream) camStream.getTracks().forEach((track) => track.stop());
        const micStream = call?.microphone?.state?.mediaStream;
        if (micStream) micStream.getTracks().forEach((track) => track.stop());
      } catch (e) {
        // Ignore
      }
    };
  }, [call]);

  const MAIN_APP_URL = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000';

  const handleWaitLonger = async () => {
    setTimedOut(false);
    setResetKey((k) => k + 1); // re-trigger countdown effect
    // Re-activate the consult so admin banner reappears
    try {
      await fetch(`${MAIN_APP_URL}/api/doctors/pending-consults`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: call?.id, status: 'waiting' }),
      });
    } catch {
      // best-effort
    }
  };

  // Helper to stop all active media tracks in the browser
  const stopAllMediaTracks = () => {
    console.log('[MeetingRoom] Stopping all media tracks...');
    
    // Get all video elements and stop their streams
    const videos = document.querySelectorAll('video');
    console.log(`[MeetingRoom] Found ${videos.length} video elements`);
    videos.forEach((video, index) => {
      const stream = (video as HTMLVideoElement).srcObject as MediaStream;
      if (stream) {
        const tracks = stream.getTracks();
        console.log(`[MeetingRoom] Video ${index}: ${tracks.length} tracks`);
        tracks.forEach((track) => {
          console.log(`[MeetingRoom] Stopping track: ${track.kind} - ${track.label}`);
          track.stop();
        });
        (video as HTMLVideoElement).srcObject = null;
      }
    });

    // Get all audio elements and stop their streams
    document.querySelectorAll('audio').forEach((audio) => {
      const stream = (audio as HTMLAudioElement).srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop();
          console.log('Stopped track:', track.kind, track.label);
        });
        (audio as HTMLAudioElement).srcObject = null;
      }
    });

    // Try to stop SDK-level streams as well
    try {
      const camStream = call?.camera?.state?.mediaStream;
      if (camStream) {
        camStream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      // Ignore
    }

    try {
      const micStream = call?.microphone?.state?.mediaStream;
      if (micStream) {
        micStream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      // Ignore
    }
  };

  const leaveCall = async () => {
    console.log('[MeetingRoom] leaveCall called');
    
    // Disable SDK-level camera and microphone first
    try {
      console.log('[MeetingRoom] Disabling SDK camera/mic...');
      await call?.camera.disable();
      await call?.microphone.disable();
    } catch (e) {
      console.warn('[MeetingRoom] Error disabling camera/mic:', e);
    }

    // Stop all media tracks aggressively
    stopAllMediaTracks();

    // Leave the call
    try {
      console.log('[MeetingRoom] Leaving call...');
      await call?.leave();
    } catch (e) {
      console.warn('[MeetingRoom] Error leaving call:', e);
    }

    console.log('[MeetingRoom] Navigating to home...');
    router.push('/');
  };

  if (callingState !== CallingState.JOINED) return <Loader />;

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
            onClick={leaveCall}
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
        <div className=" flex size-full max-w-[1000px] items-center">
          {layout === 'grid' ? (
            <PaginatedGridLayout />
          ) : layout === 'speaker-right' ? (
            <SpeakerLayout participantsBarPosition="left" />
          ) : (
            <SpeakerLayout participantsBarPosition="right" />
          )}
        </div>
        <div
          className={cn('h-[calc(100vh-86px)] hidden ml-2', {
            'show-block': showParticipants,
          })}
        >
          <CallParticipantsList onClose={() => setShowParticipants(false)} />
        </div>
      </div>
      {/* video layout and call controls */}
      <div className="fixed bottom-0 flex w-full items-center justify-center gap-5">
        <CallControls onLeave={leaveCall} />

        <DropdownMenu>
          <div className="flex items-center">
            <DropdownMenuTrigger className="cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
            {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
              <div key={index}>
                <DropdownMenuItem
                  onClick={() =>
                    setLayout(item.toLowerCase() as CallLayoutType)
                  }
                >
                  {item}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="border-dark-1" />
              </div>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <CallStatsButton />
        <button onClick={() => setShowParticipants((prev) => !prev)}>
          <div className=" cursor-pointer rounded-2xl bg-[#19232d] px-4 py-2 hover:bg-[#4c535b]  ">
            <Users size={20} className="text-white" />
          </div>
        </button>
        {!isPersonalRoom && <EndCallButton />}
      </div>
    </section>
  );
};

export default MeetingRoom;
