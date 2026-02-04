"use client";

import { X, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  patientName: string;
}

export function VoiceAssistantModal({ isOpen, onClose, userId, patientName }: VoiceAssistantModalProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsLoading(true);
      setHasError(false);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Build URL with patient context
  // Check if we should use local voice assistant (only if explicitly running)
  const isLocalhost = typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  // Use environment variable or default to production
  const useLocalVoiceAssistant = process.env.NEXT_PUBLIC_USE_LOCAL_VOICE_ASSISTANT === 'true';

  const baseUrl = (isLocalhost && useLocalVoiceAssistant)
    ? 'http://localhost:3001'  // Local Nova-AI for testing (only if explicitly enabled)
    : 'https://novaai-sandy.vercel.app';  // Production Nova-AI (default)

  const assistantUrl = `${baseUrl}?userId=${encodeURIComponent(userId)}&name=${encodeURIComponent(patientName)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl h-[90vh] mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-sm"
        >
          <X className="h-5 w-5" />
          <span className="text-sm font-medium">Close Voice Assistant</span>
        </button>

        {/* Modal Content */}
        <div className="relative w-full h-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-800">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-10">
              <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400 text-sm">Loading Voice Assistant...</p>
              <p className="text-gray-400 dark:text-gray-500 text-xs mt-2">
                Connecting to {isLocalhost ? 'localhost:3001' : 'novaai-sandy.vercel.app'}
              </p>
            </div>
          )}

          {/* Error State */}
          {hasError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-10 p-8">
              <div className="max-w-md text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mb-4 mx-auto">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Failed to Load Voice Assistant
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  Unable to connect to the voice assistant service. Please check:
                </p>
                <ul className="text-left text-sm text-gray-600 dark:text-gray-400 space-y-2 mb-6">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-500">•</span>
                    <span>Your internet connection is stable</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-500">•</span>
                    <span>
                      {isLocalhost
                        ? 'The local voice assistant is running on port 3001'
                        : 'The voice assistant service is available'}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 dark:text-blue-500">•</span>
                    <span>Your browser allows microphone access</span>
                  </li>
                </ul>
                <button
                  onClick={() => {
                    setHasError(false);
                    setIsLoading(true);
                  }}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Iframe */}
          <iframe
            src={assistantUrl}
            className="w-full h-full"
            title="Voice Assistant"
            allow="microphone; camera"
            onLoad={() => {
              setIsLoading(false);
              console.log('Voice Assistant iframe loaded successfully');
            }}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
              console.error('Voice Assistant iframe failed to load');
            }}
          />
        </div>
      </div>
    </div>
  );
}
