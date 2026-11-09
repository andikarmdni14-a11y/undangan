import { TIMEZONE_LABEL, wedding, type WeddingEvent } from "@/content/wedding";
import SectionHeading from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { CalendarIcon, ClockIcon, InstagramIcon, LiveIcon, PinIcon } from "@/components/ui/icons";
import { formatLongDate, formatTime } from "@/lib/format";
import MaskedReveal from "@/components/motion/MaskedReveal";
import Magnetic from "@/components/motion/Magnetic";
import Reveal from "@/components/motion/Reveal";

/**
 * #8 Kartu informasi yang berputar 180° saat di-hover (perangkat dengan kursor).
 * Muka depan: nama acara, tanggal, jam. Muka belakang: lokasi & tombol peta.
 * Di layar sentuh TIDAK berputar — kedua muka tampil berurutan sebagai satu kartu, sehingga
 * tidak ada informasi yang tersembunyi bagi tamu yang tidak bisa "hover".
 */
function EventCard({ event }: { event: WeddingEvent }) {
  return (
    <article className="flip-card lift group h-full rounded-t-[9999px] rounded-b-[var(--radius-soft)] text-center text-ink">
      <div className="flip-inner h-full">
        <div className="flip-face flip-front arch-top flex flex-col items-center bg-rose px-7 pb-6 pt-16">
          <h3 className="text-h2 text-burgundy">
            <MaskedReveal color="bg-burgundy">{event.title}</MaskedReveal>
          </h3>
          <dl className="mt-7 space-y-4 text-body">
            <div className="flex items-start justify-center gap-2.5">
              <dt className="sr-only">Tanggal</dt>
              <CalendarIcon className="mt-0.5 shrink-0 text-burgundy" />
              <dd>{formatLongDate(event.start)}</dd>
            </div>
            <div className="flex items-start justify-center gap-2.5">
              <dt className="sr-only">Waktu</dt>
              <ClockIcon className="mt-0.5 shrink-0 text-burgundy" />
              <dd className="tabular-nums">
                {formatTime(event.start)} – {formatTime(event.end)} {TIMEZONE_LABEL}
              </dd>
            </div>
          </dl>
          <p aria-hidden="true" className="flip-hint mt-auto pt-8 text-caption text-ink/70">
            Arahkan kursor untuk melihat lokasi
          </p>
        </div>
        <div className="flip-face flip-back flex flex-col items-center justify-center rounded-b-[var(--radius-soft)] bg-rose px-7 pb-9 pt-2">
          <dl className="text-body">
            <div className="flex items-start justify-center gap-2.5">
              <dt className="sr-only">Lokasi</dt>
              <PinIcon className="mt-0.5 shrink-0 text-burgundy" />
              <dd>
                <span className="font-medium">{event.venue}</span>
                <br />
                <span className="text-small">{event.address}</span>
              </dd>
            </div>
          </dl>
          <Magnetic className="pt-8">
            <ButtonLink href={event.mapsUrl} external icon={<PinIcon width={18} height={18} />}>
              Lihat Peta
              <span className="sr-only"> lokasi {event.title} (tab baru)</span>
            </ButtonLink>
          </Magnetic>
        </div>
      </div>
    </article>
  );
}

export default function EventsSection() {
  const { liveStream } = wedding;
  return (
    <section aria-labelledby="rangkaian-acara" className="px-6 py-20">
      <SectionHeading id="rangkaian-acara" title={wedding.sections.events} />
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
        {wedding.events.map((e, i) => (
          <Reveal key={e.id} delay={i * 0.12} className="h-full">
            <EventCard event={e} />
          </Reveal>
        ))}
      </div>

      <aside
        aria-labelledby="siaran-langsung"
        className="glass-band lift mx-auto mt-14 flex max-w-xl flex-col items-center rounded-[var(--radius-soft)] border border-rose-300 bg-rose-50 px-7 py-10 text-center"
      >
        <span className="grid size-12 place-items-center rounded-full bg-burgundy text-alabaster">
          <LiveIcon />
        </span>
        <h3 id="siaran-langsung" className="mt-5 text-h3">
          {wedding.sections.liveStream}
        </h3>
        <p className="mt-3 max-w-sm text-body text-ink-muted">
          {liveStream.text} Siaran dimulai pukul {formatTime(liveStream.start)} {TIMEZONE_LABEL} melalui{" "}
          {liveStream.platform}{" "}
          <a href={liveStream.url} target="_blank" rel="noopener noreferrer" className="link-underline text-ink">
            @{liveStream.account}
          </a>
          .
        </p>
        <ButtonLink href={liveStream.url} external className="mt-7" icon={<InstagramIcon width={18} height={18} />}>
          {liveStream.button}
          <span className="sr-only"> (tab baru)</span>
        </ButtonLink>
      </aside>
    </section>
  );
}
