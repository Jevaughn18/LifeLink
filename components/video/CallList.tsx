'use client';

import { useEffect, useState } from 'react';
import { Call, CallRecording } from '@stream-io/video-react-sdk';
import { useRouter } from 'next/navigation';

import { useGetCalls } from '@/hooks/useGetCalls';
import MeetingCard from './MeetingCard';

export default function CallList({ type }: { type: 'ended' | 'upcoming' | 'recordings' }) {
  const router = useRouter();
  const { endedCalls, upcomingCalls, callRecordings, isLoading } = useGetCalls();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);

  useEffect(() => {
    const fetchRecordings = async () => {
      const callData = await Promise.all(
        callRecordings?.map((meeting) => meeting.queryRecordings()) ?? []
      );
      const recs = callData
        .filter((call) => call.recordings.length > 0)
        .flatMap((call) => call.recordings);
      setRecordings(recs);
    };
    if (type === 'recordings') fetchRecordings();
  }, [type, callRecordings]);

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-500 border-t-white" />
      </div>
    );
  }

  const calls: (Call | CallRecording)[] | undefined =
    type === 'ended' ? endedCalls : type === 'upcoming' ? upcomingCalls : recordings;

  const noCallsMessage =
    type === 'ended' ? 'No Previous Calls' : type === 'upcoming' ? 'No Upcoming Calls' : 'No Recordings';

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {calls && calls.length > 0 ? (
        calls.map((meeting) => (
          <MeetingCard
            key={(meeting as Call).id || (meeting as CallRecording).filename}
            icon={
              type === 'ended'
                ? '/icons/previous.svg'
                : type === 'upcoming'
                  ? '/icons/upcoming.svg'
                  : '/icons/recordings.svg'
            }
            title={
              (meeting as Call).state?.custom?.description ||
              (meeting as CallRecording).filename?.substring(0, 20) ||
              'No Description'
            }
            date={
              (meeting as Call).state?.startsAt?.toLocaleString() ||
              (meeting as CallRecording).start_time?.toLocaleString() ||
              ''
            }
            isPreviousMeeting={type === 'ended'}
            link={
              type === 'recordings'
                ? (meeting as CallRecording).url
                : `/meeting/${(meeting as Call).id}`
            }
            buttonIcon1={type === 'recordings' ? '/icons/play.svg' : undefined}
            buttonText={type === 'recordings' ? 'Play' : 'Start'}
            handleClick={
              type === 'recordings'
                ? () => router.push((meeting as CallRecording).url)
                : () => router.push(`/meeting/${(meeting as Call).id}`)
            }
          />
        ))
      ) : (
        <h1 className="text-2xl font-bold text-white">{noCallsMessage}</h1>
      )}
    </div>
  );
}
