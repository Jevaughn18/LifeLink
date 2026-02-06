'use client';

import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';
import { useRouter, useSearchParams } from 'next/navigation';

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmin = !!searchParams.get('userId');

  if (!call) throw new Error('useStreamCall must be used within a StreamCall component.');

  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();

  const isMeetingOwner =
    localParticipant &&
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  if (!isMeetingOwner) return null;

  const endCall = async () => {
    try {
      console.log('🔴 [EndCallButton] Stopping all media tracks...');
      
      // 1. Stop all video element streams
      document.querySelectorAll('video').forEach((video, i) => {
        const stream = (video as HTMLVideoElement).srcObject as MediaStream;
        if (stream && stream.getTracks) {
          console.log(`🔴 [EndCallButton] Video ${i}: Found ${stream.getTracks().length} tracks`);
          stream.getTracks().forEach(track => {
            console.log(`🔴 [EndCallButton] Stopping: ${track.kind} - ${track.label} (${track.readyState})`);
            track.stop();
          });
          (video as HTMLVideoElement).srcObject = null;
        }
      });
      
      // 2. Stop all audio element streams
      document.querySelectorAll('audio').forEach((audio, i) => {
        const stream = (audio as HTMLAudioElement).srcObject as MediaStream;
        if (stream && stream.getTracks) {
          console.log(`🔴 [EndCallButton] Audio ${i}: Found ${stream.getTracks().length} tracks`);
          stream.getTracks().forEach(track => {
            console.log(`🔴 [EndCallButton] Stopping: ${track.kind} - ${track.label} (${track.readyState})`);
            track.stop();
          });
          (audio as HTMLAudioElement).srcObject = null;
        }
      });

      // 3. Disable through API
      console.log('🔴 [EndCallButton] Disabling SDK camera/mic...');
      await call.camera.disable();
      await call.microphone.disable();
    } catch (error) {
      console.error('🔴 [EndCallButton] Cleanup error:', error);
    }
    
    console.log('🔴 [EndCallButton] Ending call for everyone...');
    await call.endCall();
    
    console.log('🔴 [EndCallButton] Navigating away...');
    router.push(isAdmin ? '/dashboard' : '/meetings');
  };

  return (
    <button
      onClick={endCall}
      className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors"
    >
      End call for everyone
    </button>
  );
};

export default EndCallButton;
