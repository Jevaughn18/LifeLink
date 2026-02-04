"use client";

import { useState, useEffect } from "react";
import { Plus, MessageSquare, Mic, Sparkles, X, Video, ExternalLink } from "lucide-react";
import Link from "next/link";

interface QuickActionsBarProps {
  userId: string;
  onMessageDoctor?: () => void;
  onVoiceAssistant?: () => void;
  patientName?: string;
}

export function QuickActionsBar({ userId, onMessageDoctor, onVoiceAssistant, patientName = "Patient" }: QuickActionsBarProps) {
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [joinLink, setJoinLink] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [noDocAvailable, setNoDocAvailable] = useState(false);

  useEffect(() => {
    if (isConnectModalOpen || isVideoModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isConnectModalOpen, isVideoModalOpen]);

  const VIDEO_PLATFORM_URL = process.env.NEXT_PUBLIC_VIDEO_PLATFORM_URL || "http://localhost:3001";

  const handleInstantConsult = async () => {
    setIsChecking(true);
    setNoDocAvailable(false);
    try {
      const res = await fetch("/api/instant-consult", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.meetingId) {
        // Go straight into the meeting room — no video platform home page
        window.open(
          `${VIDEO_PLATFORM_URL}/meeting/${data.meetingId}?userId=${userId}&name=${encodeURIComponent(patientName)}`,
          "_blank"
        );
        setIsVideoModalOpen(false);
      } else {
        // 503 = no doctors on duty right now
        setNoDocAvailable(true);
      }
    } catch {
      setNoDocAvailable(true);
    }
    setIsChecking(false);
  };

  return (
    <div className="flex gap-3">
      <Link
        href="/new-appointment"
        className="flex flex-1 flex-col items-center gap-2 rounded-2xl p-4 bg-blue-600 text-white hover:bg-blue-700 transition-all hover:scale-105 shadow-sm"
      >
        <Plus className="h-5 w-5" />
        <span className="text-sm font-medium">Book Appointment</span>
      </Link>

      <button
        onClick={() => setIsConnectModalOpen(true)}
        className="flex flex-1 flex-col items-center gap-1 rounded-2xl p-4 bg-gradient-to-br from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105 shadow-sm"
      >
        <Sparkles className="h-5 w-5" />
        <span className="text-sm font-medium">Connect</span>
        <span className="text-xs opacity-70">Voice · Chat</span>
      </button>

      <button
        onClick={() => setIsVideoModalOpen(true)}
        className="flex flex-1 flex-col items-center gap-2 rounded-2xl p-4 bg-gradient-to-br from-teal-500 to-emerald-600 text-white hover:from-teal-600 hover:to-emerald-700 transition-all hover:scale-105 shadow-sm"
      >
        <Video className="h-5 w-5" />
        <span className="text-sm font-medium">Video Call</span>
      </button>

      {/* Connect Modal */}
      {isConnectModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setIsConnectModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 p-6">
              <button
                onClick={() => setIsConnectModalOpen(false)}
                className="absolute top-4 right-4 rounded-xl p-1.5 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Connect</h2>
                  <p className="text-sm text-white/70">Choose how you'd like to reach out</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3">
              <button
                onClick={() => {
                  onVoiceAssistant?.();
                  setIsConnectModalOpen(false);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                  <Mic className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <p className="text-base font-semibold text-gray-900 dark:text-white">Voice Assistant</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Talk to Nova AI using your voice</p>
                </div>
              </button>

              <button
                onClick={() => {
                  onMessageDoctor?.();
                  setIsConnectModalOpen(false);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:shadow-md"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
                  <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <p className="text-base font-semibold text-gray-900 dark:text-white">Message Doctor</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chat with Lia, your health assistant</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Call Modal */}
      {isVideoModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-gradient-to-r from-teal-500 to-emerald-600 p-6">
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="absolute top-4 right-4 rounded-xl p-1.5 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Video Call</h2>
                  <p className="text-sm text-white/70">Consult with your doctor remotely</p>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {noDocAvailable ? (
                <div className="w-full flex flex-col items-center gap-3 p-4 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
                  <p className="text-sm text-amber-800 dark:text-amber-200 text-center font-medium">
                    No doctors are available right now.
                  </p>
                  <Link
                    href="/new-appointment"
                    onClick={() => { setIsVideoModalOpen(false); setNoDocAvailable(false); }}
                    className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Book an appointment instead
                  </Link>
                </div>
              ) : (
                <button
                  onClick={handleInstantConsult}
                  disabled={isChecking}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-teal-400 dark:hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-wait"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 dark:from-teal-900/30 dark:to-emerald-900/30">
                    <Video className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-semibold text-gray-900 dark:text-white">Instant Consult</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{isChecking ? "Checking availability..." : "Start a video call now"}</p>
                  </div>
                </button>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex-shrink-0">
                    <ExternalLink className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-base font-semibold text-gray-900 dark:text-white">Join by Link</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enter a meeting link to join</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={joinLink}
                    onChange={(e) => setJoinLink(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && joinLink.trim()) {
                        window.open(joinLink.trim(), "_blank");
                        setIsVideoModalOpen(false);
                        setJoinLink("");
                      }
                    }}
                    placeholder="Paste meeting link..."
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-teal-400 dark:focus:border-teal-500 transition-colors"
                  />
                  <button
                    onClick={() => {
                      if (joinLink.trim()) {
                        window.open(joinLink.trim(), "_blank");
                        setIsVideoModalOpen(false);
                        setJoinLink("");
                      }
                    }}
                    disabled={!joinLink.trim()}
                    className="px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-teal-500"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
