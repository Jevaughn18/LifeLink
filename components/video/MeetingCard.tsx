'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const avatarImages = [
  '/images/avatar-1.jpeg',
  '/images/avatar-2.jpeg',
  '/images/avatar-3.png',
  '/images/avatar-4.png',
  '/images/avatar-5.png',
];

interface MeetingCardProps {
  title: string;
  date: string;
  icon: string;
  isPreviousMeeting?: boolean;
  buttonIcon1?: string;
  buttonText?: string;
  handleClick: () => void;
  link: string;
}

export default function MeetingCard({ icon, title, date, isPreviousMeeting, buttonIcon1, handleClick, link, buttonText }: MeetingCardProps) {
  return (
    <section className="flex min-h-[258px] w-full flex-col justify-between rounded-[14px] bg-dark-1 px-5 py-8 xl:max-w-[568px]">
      <article className="flex flex-col gap-5">
        <img src={icon} alt="upcoming" width={28} height={28} />
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="text-base font-normal">{date}</p>
        </div>
      </article>

      <article className="flex justify-center relative">
        <div className="relative flex w-full max-sm:hidden">
          {avatarImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt="attendees"
              width={40}
              height={40}
              className={cn('rounded-full', { absolute: index > 0 })}
              style={{ top: 0, left: index * 28 }}
            />
          ))}
          <div className="flex justify-center items-center absolute left-[136px] size-10 rounded-full border-[5px] border-dark-3 bg-dark-4 text-white text-sm">
            +5
          </div>
        </div>
        {!isPreviousMeeting && (
          <div className="flex gap-2">
            <Button onClick={handleClick} className="rounded bg-blue-1 px-6 text-white">
              {buttonIcon1 && <img src={buttonIcon1} alt="feature" width={20} height={20} />}
              &nbsp; {buttonText}
            </Button>
            <Button
              onClick={() => navigator.clipboard.writeText(link)}
              className="bg-dark-4 px-6 text-white"
            >
              <img src="/icons/copy.svg" alt="copy" width={20} height={20} />
              &nbsp; Copy Link
            </Button>
          </div>
        )}
      </article>
    </section>
  );
}
