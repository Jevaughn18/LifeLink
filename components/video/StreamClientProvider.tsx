"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { StreamVideoClient, StreamVideo } from "@stream-io/video-react-sdk";

import { tokenProvider } from "@/lib/actions/stream.actions";

interface StreamClientProviderProps {
  children: ReactNode;
  userId: string;
  userName: string;
}

const StreamClientProvider = ({
  children,
  userId,
  userName,
}: StreamClientProviderProps) => {
  const [videoClient, setVideoClient] = useState<StreamVideoClient>();
  const clientRef = useRef<StreamVideoClient | null>(null);

  useEffect(() => {
    if (!userId) return;
    if (clientRef.current) return; // already initialized

    const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
    if (!apiKey) throw new Error("Stream API key is missing");

    const client = new StreamVideoClient({
      apiKey,
      user: { id: userId, name: userName || userId },
      tokenProvider: () => tokenProvider(userId),
    });

    clientRef.current = client;
    setVideoClient(client);

    return () => {
      // Properly disconnect user and cleanup client
      if (clientRef.current) {
        // @ts-ignore: disconnectUser is public on StreamVideoClient
        if (typeof clientRef.current.disconnectUser === 'function') {
          clientRef.current.disconnectUser().catch(() => {});
        }
        clientRef.current = null;
      }
      // Forced cleanup: stop all tracks from all video/audio elements
      try {
        const allElements = document.querySelectorAll('video, audio');
        allElements.forEach((element: any) => {
          if (element.srcObject instanceof MediaStream) {
            element.srcObject.getTracks().forEach((track: MediaStreamTrack) => {
              track.stop();
            });
            element.srcObject = null;
          }
        });
      } catch (e) {
        // ignore
      }
    };
  }, [userId, userName]);

  if (!videoClient) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#1a1f2e]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-500 border-t-white" />
      </div>
    );
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
};

export default StreamClientProvider;
