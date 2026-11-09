import { wedding, type Person } from "@/content/wedding";
import { blurFor } from "@/content/blur";
import SectionHeading from "@/components/ui/SectionHeading";
import ShimmerImage from "@/components/ui/ShimmerImage";
import { InstagramIcon } from "@/components/ui/icons";
import ArchScaleReveal from "@/components/motion/ArchScaleReveal";
import Reveal from "@/components/motion/Reveal";
import Tooltip from "@/components/motion/Tooltip";

function Profile({ person }: { person: Person }) {
  return (
    <article className="flex flex-col items-center text-center">
      <div className="arch-top rounded-b-[var(--radius-soft)] border border-rose-300 p-2">
        {/* #21 Masker kubah membesar perlahan saat memasuki viewport */}
        <ArchScaleReveal className="arch-top relative aspect-[3/4] w-[min(64vw,260px)] rounded-b-[calc(var(--radius-soft)-0.5rem)]">
          <ShimmerImage
            wrapperClassName="h-full w-full"
            src={person.photo.src}
            alt={person.photo.alt}
            fill
            sizes="(max-width: 640px) 64vw, 260px"
            placeholder="blur"
            blurDataURL={blurFor(person.photo.src)}
            className="object-cover object-[50%_18%]"
          />
        </ArchScaleReveal>
      </div>
      <Reveal delay={0.1}>
        <h3 className="mt-7 text-h3">{person.fullName}</h3>
        <p className="mt-3 max-w-64 text-body text-ink-muted">
          {person.role} {person.childOrder} dari
          <br />
          <span className="text-ink">{person.father}</span> &amp; <span className="text-ink">{person.mother}</span>
        </p>
      </Reveal>
      {/* #30 isi warna dari bawah ke atas · #35 tooltip */}
      <Tooltip label={`@${person.instagram}`}>
        <a
          href={`https://instagram.com/${person.instagram}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Instagram ${person.nickname} (@${person.instagram})`}
          className="fill-up mt-5 grid size-11 place-items-center rounded-full border border-burgundy/30 text-burgundy"
        >
          <InstagramIcon />
        </a>
      </Tooltip>
    </article>
  );
}

export default function CoupleSection() {
  const { groom, bride } = wedding.couple;
  return (
    <section aria-labelledby="mempelai" className="glass-clear px-6 py-20">
      <SectionHeading id="mempelai" title={wedding.sections.couple} />
      <div className="mx-auto grid max-w-4xl items-center gap-12 md:grid-cols-[1fr_auto_1fr]">
        <Profile person={groom} />
        <p aria-hidden="true" className="text-flow text-center font-display text-display">
          &amp;
        </p>
        <Profile person={bride} />
      </div>
    </section>
  );
}
