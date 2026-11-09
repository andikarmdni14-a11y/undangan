import { wedding } from "@/content/wedding";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { CalendarIcon } from "@/components/ui/icons";
import { formatLongDate } from "@/lib/format";
import { calendarEvents } from "@/lib/calendar/events";
import { googleCalendarUrl } from "@/lib/calendar/ics";
import Countdown from "./Countdown";
import MaskedReveal from "@/components/motion/MaskedReveal";
import Reveal from "@/components/motion/Reveal";
import Magnetic from "@/components/motion/Magnetic";

export default function CountdownSection() {
  const akad = wedding.events[0];
  const date = formatLongDate(akad.start);
  return (
    <section aria-labelledby="hitung-mundur" className="glass-band bg-rose-50 px-6 py-20">
      <SectionHeading id="hitung-mundur" title={wedding.sections.countdown} />
      {/* #17 Tanggal keluar dari balik blok warna */}
      <p className="-mt-6 mb-10 text-center font-display text-h4 text-ink">
        <MaskedReveal>{date}</MaskedReveal>
      </p>
      <Reveal className="mx-auto max-w-lg">
        <Countdown target={akad.start} ariaLabel={`Waktu tersisa menuju akad nikah, ${date}`} />
      </Reveal>
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Magnetic>
          <ButtonLink href="/undangan.ics" download icon={<CalendarIcon />}>
            Simpan ke Kalender
          </ButtonLink>
        </Magnetic>
        <ButtonLink href={googleCalendarUrl(calendarEvents[0])} variant="outline" external>
          Buka di Google Kalender
        </ButtonLink>
      </div>
    </section>
  );
}
