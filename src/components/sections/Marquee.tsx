import { wedding } from "@/content/wedding";
import { formatShortDate } from "@/lib/format";

/** #16 Pita marquee pengumuman — CSS murni, jeda saat hover, diam pada reduced motion. */
export default function Marquee() {
  const { groom, bride } = wedding.couple;
  const items = [
    `${groom.nickname} & ${bride.nickname}`,
    formatShortDate(wedding.events[0].start),
    wedding.events[0].venue,
    "Save the Date",
    wedding.hero.tagline,
  ];
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((t, i) => (
        <li key={i} className="flex items-center gap-10 whitespace-nowrap font-display text-h4 text-alabaster">
          {t}
          <span aria-hidden="true" className="size-1.5 rotate-45 bg-rose" />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="marquee overflow-hidden bg-burgundy py-4" role="region" aria-label="Pengumuman">
      <div className="marquee-track flex w-max">
        {row(false)}
        {row(true)}
      </div>
    </div>
  );
}
