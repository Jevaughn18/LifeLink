'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStreamVideoClient } from '@stream-io/video-react-sdk';

import HomeCard from './HomeCard';
import MeetingModal from './MeetingModal';
import { useMeetingsUser } from './MeetingsLayout';
import { Input } from '@/components/ui/input';

export default function MeetingsHome() {
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<'isJoiningMeeting' | 'isInstantMeeting' | undefined>(undefined);
  const [link, setLink] = useState('');
  const client = useStreamVideoClient();
  const { userId } = useMeetingsUser();

  const createMeeting = async () => {
    if (!client || !userId) return;
    try {
      const id = crypto.randomUUID();
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      await call.getOrCreate({
        data: {
          starts_at: new Date().toISOString(),
          custom: { description: 'Instant Meeting' },
        },
      });
      router.push(`/meeting/${call.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(now);

  return (
    <section className="flex size-full flex-col gap-5 text-white">
      {/* Hero */}
      <div className="h-[303px] w-full rounded-[20px] bg-hero bg-cover">
        <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
          <h2 className="glassmorphism max-w-[273px] rounded py-2 px-4 text-center text-base font-normal">
            Welcome to LifeLink Meetings
          </h2>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl">{time}</h1>
            <p className="text-lg font-medium text-sky-1 lg:text-2xl">{date}</p>
          </div>
        </div>
      </div>

      {/* Meeting Type Cards */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <HomeCard
          img="/icons/add-meeting.svg"
          title="New Meeting"
          description="Start an instant meeting"
          handleClick={() => setMeetingState('isInstantMeeting')}
        />
        <HomeCard
          img="/icons/join-meeting.svg"
          title="Join Meeting"
          description="via invitation link"
          className="bg-blue-1"
          handleClick={() => setMeetingState('isJoiningMeeting')}
        />
        <HomeCard
          img="/icons/recordings.svg"
          title="View Recordings"
          description="Meeting Recordings"
          className="bg-yellow-1"
          handleClick={() => router.push('/meetings/recordings')}
        />

        <MeetingModal
          isOpen={meetingState === 'isJoiningMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Type the link here"
          className="text-center"
          buttonText="Join Meeting"
          handleClick={() => {
            router.push(link);
            setMeetingState(undefined);
          }}
        >
          <Input
            placeholder="Meeting link"
            onChange={(e) => setLink(e.target.value)}
            className="border-none bg-dark-3 text-white focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </MeetingModal>

        <MeetingModal
          isOpen={meetingState === 'isInstantMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Start an Instant Meeting"
          className="text-center"
          buttonText="Start Meeting"
          handleClick={createMeeting}
        />
      </section>
    </section>
  );
}
