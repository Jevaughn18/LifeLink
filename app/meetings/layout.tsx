import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import MeetingsLayout from '@/components/video/MeetingsLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const token = cookieStore.get('session')?.value;
  const user = token ? verifyToken(token) : null;

  return (
    <MeetingsLayout userId={user?.patientId || ''} userName={user?.name || ''}>
      {children}
    </MeetingsLayout>
  );
}
