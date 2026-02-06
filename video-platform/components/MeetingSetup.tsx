'use client';
import { useEffect, useState, useCallback } from 'react';
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';

import Alert from './Alert';
import { Button } from './ui/button';

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  // https://getstream.io/video/docs/react/guides/call-and-participant-state/#call-state
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();

  if (!call) {
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );
  }

  // https://getstream.io/video/docs/react/ui-cookbook/replacing-call-controls/
  const [isMicCamToggled, setIsMicCamToggled] = useState(false);

  // Utility function to stop all media tracks
  const stopAllMediaTracks = useCallback(() => {
    console.log('[MeetingSetup] Stopping all media tracks...');
    
    // Stop all video element streams
    const videos = document.querySelectorAll('video');
    console.log(`[MeetingSetup] Found ${videos.length} video elements`);
    videos.forEach((video, index) => {
      const stream = (video as HTMLVideoElement).srcObject as MediaStream;
      if (stream) {
        const tracks = stream.getTracks();
        console.log(`[MeetingSetup] Video ${index}: ${tracks.length} tracks`);
        tracks.forEach((track) => {
          console.log(`[MeetingSetup] Stopping track: ${track.kind} - ${track.label}`);
          track.stop();
        });
        (video as HTMLVideoElement).srcObject = null;
      }
    });

    // Stop all audio element streams
    const audios = document.querySelectorAll('audio');
    console.log(`[MeetingSetup] Found ${audios.length} audio elements`);
    audios.forEach((audio, index) => {
      const stream = (audio as HTMLAudioElement).srcObject as MediaStream;
      if (stream) {
        const tracks = stream.getTracks();
        console.log(`[MeetingSetup] Audio ${index}: ${tracks.length} tracks`);
        tracks.forEach((track) => {
          console.log(`[MeetingSetup] Stopping track: ${track.kind} - ${track.label}`);
          track.stop();
        });
        (audio as HTMLAudioElement).srcObject = null;
      }
    });

    // Try SDK-level streams
    try {
      const camStream = call.camera?.state?.mediaStream;
      if (camStream) {
        console.log('[MeetingSetup] Stopping SDK camera stream');
        camStream.getTracks().forEach((track) => track.stop());
      }
      const micStream = call.microphone?.state?.mediaStream;
      if (micStream) {
        console.log('[MeetingSetup] Stopping SDK microphone stream');
        micStream.getTracks().forEach((track) => track.stop());
      }
    } catch (e) {
      console.warn('[MeetingSetup] Error stopping SDK streams:', e);
    }
  }, [call]);

  // Handle mic/cam toggle
  useEffect(() => {
    if (isMicCamToggled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [isMicCamToggled, call.camera, call.microphone]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[MeetingSetup] Component unmounting, cleaning up...');
      call.camera.disable();
      call.microphone.disable();
      stopAllMediaTracks();
    };
  }, [call, stopAllMediaTracks]);

  const handleJoinMeeting = async () => {
    console.log('[MeetingSetup] Joining meeting...');
    
    // If user wants to join with mic/cam off, stop the preview tracks first
    if (isMicCamToggled) {
      console.log('[MeetingSetup] User joining with mic/cam off, stopping preview...');
      stopAllMediaTracks();
    }
    
    await call.join();
    setIsSetupComplete(true);
  };

  if (callTimeNotArrived)
    return (
      <Alert
        title={`Your Meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}`}
      />
    );

  if (callHasEnded)
    return (
      <Alert
        title="The call has been ended by the host"
        iconUrl="/icons/call-ended.svg"
      />
    );

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white">
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
      <Button
        className="rounded-md bg-green-500 px-4 py-2.5"
        onClick={handleJoinMeeting}
      >
        Join meeting
      </Button>
    </div>
  );
};

export default MeetingSetup;
