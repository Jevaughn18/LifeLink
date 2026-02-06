'use client';

import { useState, useEffect } from 'react';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';

import StreamClientProvider from '@/components/video/StreamClientProvider';
import { useGetCallById } from '@/hooks/useGetCallById';
import MeetingSetup from '@/components/video/MeetingSetup';
import MeetingRoom from '@/components/video/MeetingRoom';

interface MeetingPageClientProps {
  id: string;
  userId: string;
  userName: string;
  isAdmin?: boolean;
}

const MeetingPageInner = ({ id, isAdmin }: { id: string; isAdmin?: boolean }) => {
  const { call, isCallLoading } = useGetCallById(id);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // Cleanup all media when component unmounts
  useEffect(() => {
    return () => {
      try {
        if (call) {
          call.camera.disable();
          call.microphone.disable();
        }
      } catch (error) {
        // best-effort cleanup
      }
    };
  }, [call]);

  if (isCallLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#1a1f2e]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-500 border-t-white" />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#1a1f2e]">
        <p className="text-white text-3xl font-bold">Call Not Found</p>
      </div>
    );
  }

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom isAdmin={isAdmin} />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default function MeetingPageClient({ id, userId, userName, isAdmin }: MeetingPageClientProps) {
  return (
    <StreamClientProvider userId={userId} userName={userName}>
      <MeetingPageInner id={id} isAdmin={isAdmin} />
    </StreamClientProvider>
  );
}
