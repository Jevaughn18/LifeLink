"use client";

import { useState, useEffect, useCallback } from "react";
import { Video, Phone, X } from "lucide-react";

interface PendingConsult {
  id: string;
  patient_name: string;
  doctor_name: string;
  meeting_id: string;
  created_at: string;
}

const VIDEO_PLATFORM_URL = process.env.NEXT_PUBLIC_VIDEO_PLATFORM_URL || "http://localhost:3001";

export function InstantConsultBanner() {
  const [consults, setConsults] = useState<PendingConsult[]>([]);

  const fetchConsults = useCallback(async () => {
    try {
      const res = await fetch("/api/doctors/pending-consults");
      const data = await res.json();
      setConsults(data.consults || []);
    } catch {
      // silent — polling will retry on next tick
    }
  }, []);

  useEffect(() => {
    fetchConsults();
    const interval = setInterval(fetchConsults, 5000);
    return () => clearInterval(interval);
  }, [fetchConsults]);

  const handleJoin = async (consult: PendingConsult) => {
    await fetch("/api/doctors/pending-consults", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: consult.id, status: "joined" }),
    });
    setConsults((prev) => prev.filter((c) => c.id !== consult.id));
    window.open(
      `${VIDEO_PLATFORM_URL}/meeting/${consult.meeting_id}?userId=admin&name=${encodeURIComponent(consult.doctor_name)}`,
      "_blank"
    );
  };

  const handleDismiss = async (consult: PendingConsult) => {
    await fetch("/api/doctors/pending-consults", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: consult.id, status: "ended" }),
    });
    setConsults((prev) => prev.filter((c) => c.id !== consult.id));
  };

  if (consults.length === 0) return null;

  return (
    <div className="space-y-3">
      {consults.map((consult) => (
        <div
          key={consult.id}
          className="flex items-center justify-between rounded-2xl border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-900/20 px-5 py-4"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 dark:bg-teal-800">
              <Phone className="h-5 w-5 text-teal-600 dark:text-teal-300" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {consult.patient_name} is requesting an instant consult
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Assigned to Dr. {consult.doctor_name} · Waiting since{" "}
                {new Date(consult.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleJoin(consult)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium transition-colors"
            >
              <Video className="h-4 w-4" />
              Join
            </button>
            <button
              onClick={() => handleDismiss(consult)}
              className="p-2 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
