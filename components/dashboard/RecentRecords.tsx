"use client";

import { FileText, Download, Eye } from "lucide-react";

interface Record {
  id: string;
  title: string;
  type: string;
  date: string;
}

interface RecentRecordsProps {
  patient?: any;
}

export function RecentRecords({ patient }: RecentRecordsProps) {
  // TODO: Fetch from database
  const records: Record[] = [
    { id: "1", title: "Blood Work Results", type: "Lab Results", date: "Dec 15, 2024" },
    { id: "2", title: "Annual Physical Summary", type: "Visit Summary", date: "Dec 10, 2024" },
    { id: "3", title: "Vaccination Record", type: "Immunization", date: "Nov 28, 2024" },
  ];

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Recent Records</h3>
        <button className="text-sm font-medium text-blue-600 hover:underline">
          View all
        </button>
      </div>

      <div className="space-y-3">
        {records.map((record) => (
          <div
            key={record.id}
            className="group flex items-center gap-3 rounded-xl bg-gray-50 p-3 transition-colors hover:bg-gray-100"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white">
              <FileText className="h-5 w-5 text-gray-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-gray-900">{record.title}</p>
              <p className="text-xs text-gray-500">
                {record.type} · {record.date}
              </p>
            </div>
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white">
                <Eye className="h-4 w-4 text-gray-600" />
              </button>
              <button className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white">
                <Download className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
