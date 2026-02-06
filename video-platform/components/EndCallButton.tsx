'use client';

import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';

import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();

  if (!call)
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );

  // https://getstream.io/video/docs/react/guides/call-and-participant-state/#participant-state-3
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) return null;

  const endCall = async () => {
    // Disable SDK-level camera and microphone
    await call.camera.disable();
    await call.microphone.disable();

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
      const camStream = call.camera?.state?.mediaStream;
      if (camStream) camStream.getTracks().forEach((track) => track.stop());
      const micStream = call.microphone?.state?.mediaStream;
      if (micStream) micStream.getTracks().forEach((track) => track.stop());
    } catch (e) {
      // Ignore
    }

    await call.endCall();
    router.push('/');
  };

  return (
    <Button onClick={endCall} className="bg-red-500">
      End call for everyone
    </Button>
  );
};

export default EndCallButton;
