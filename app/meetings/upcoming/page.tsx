import CallList from '@/components/video/CallList';

export default function UpcomingPage() {
  return (
    <section className="flex size-full flex-col gap-10 text-white">
      <h1 className="text-3xl font-bold">Upcoming Meetings</h1>
      <CallList type="upcoming" />
    </section>
  );
}
