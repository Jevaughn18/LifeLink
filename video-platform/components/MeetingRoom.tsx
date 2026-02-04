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
            onClick={() => {
              call?.leave();
              router.push('/');
            }}
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
        <CallControls onLeave={() => router.push(`/`)} />

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
