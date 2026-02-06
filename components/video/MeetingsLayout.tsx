'use client';

import { createContext, useContext, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import StreamClientProvider from './StreamClientProvider';

const sidebarLinks = [
  { imgURL: '/icons/Home.svg', route: '/meetings', label: 'Home' },
  { imgURL: '/icons/upcoming.svg', route: '/meetings/upcoming', label: 'Upcoming' },
  { imgURL: '/icons/previous.svg', route: '/meetings/previous', label: 'Previous' },
  { imgURL: '/icons/recordings.svg', route: '/meetings/recordings', label: 'Recordings' },
];

const MeetingsUserContext = createContext({ userId: '', userName: '' });
export const useMeetingsUser = () => useContext(MeetingsUserContext);

export default function MeetingsLayout({ userId, userName, children }: { userId: string; userName: string; children: ReactNode }) {
  const pathname = usePathname();

  return (
    <MeetingsUserContext.Provider value={{ userId, userName }}>
      <StreamClientProvider userId={userId} userName={userName}>
        <div className="flex min-h-screen bg-dark-1 text-white">
          {/* Sidebar */}
          <section className="sticky left-0 top-0 flex h-screen w-fit flex-col bg-dark-1 p-6 pt-14 text-white max-sm:hidden lg:w-[264px]">
            <div className="flex flex-1 flex-col gap-6">
              {sidebarLinks.map((item) => {
                const isActive = pathname === item.route || pathname.startsWith(`${item.route}/`);
                return (
                  <Link
                    href={item.route}
                    key={item.label}
                    className={cn('flex gap-4 items-center p-4 rounded-lg', { 'bg-blue-1': isActive })}
                  >
                    <img src={item.imgURL} alt={item.label} width={24} height={24} />
                    <p className="text-lg font-semibold max-lg:hidden">{item.label}</p>
                  </Link>
                );
              })}
            </div>

            <Link
              href="/dashboard"
              className="flex gap-4 items-center p-4 rounded-lg border-t border-dark-3 pt-6 mt-4 hover:bg-dark-3 transition-colors"
            >
              <ArrowLeft size={24} />
              <p className="text-lg font-semibold max-lg:hidden">Dashboard</p>
            </Link>
          </section>

          {/* Content */}
          <section className="flex flex-1 flex-col px-6 pb-6 pt-14 sm:px-14">
            {children}
          </section>
        </div>
      </StreamClientProvider>
    </MeetingsUserContext.Provider>
  );
}
