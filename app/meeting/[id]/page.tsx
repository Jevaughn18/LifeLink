import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import MeetingPageClient from './MeetingPageClient';

export default async function MeetingPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { userId?: string; name?: string };
}) {
  let userId: string | null = null;
  let userName: string | null = null;
  let isAdmin = false;

  // Admin/doctor flow: explicit query params take priority
  if (searchParams.userId) {
    userId = searchParams.userId;
    userName = searchParams.name || 'Doctor';
    isAdmin = true;
  }

  // Patient flow: session cookie (fallback when no query params)
  if (!userId) {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('session');
    if (sessionCookie) {
      const user = verifyToken(sessionCookie.value);
      if (user) {
        userId = user.patientId;
        userName = user.name;
      }
    }
  }

  if (!userId) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#1a1f2e]">
        <p className="text-white text-lg">Unable to identify user. Please log in first.</p>
      </div>
    );
  }

  return <MeetingPageClient id={params.id} userId={userId} userName={userName || 'User'} isAdmin={isAdmin} />;
}
