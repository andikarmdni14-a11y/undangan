import Image from "next/image";
import { wedding } from "@/content/wedding";
import BlurReveal from "@/components/motion/BlurReveal";
import Parallax from "@/components/motion/Parallax";
import Reveal from "@/components/motion/Reveal";

export default function ClosingSection() {
  const { closing, couple } = wedding;
  return (
    <footer className="relative overflow-hidden px-6 pb-16 pt-24 text-center">
      {/* #15 Teks buram yang perlahan menjadi tajam */}
      <BlurReveal>
        <p className="mx-auto max-w-md font-display text-h3 text-burgundy">{closing.text}</p>
      </BlurReveal>
      <Reveal delay={0.2}>
        <p className="mt-10 text-body text-ink-muted">{closing.signOff}</p>
        <Image
          src="/images/brand/logo-raihan-andini-sm.webp"
          alt={`${couple.groom.nickname} & ${couple.bride.nickname}`}
          width={640}
          height={340}
          className="mx-auto mt-3 h-auto w-[min(70vw,300px)]"
        />
        <p className="mt-2 text-body text-ink-muted">{closing.family}</p>
      </Reveal>
      <Parallax speed={-0.25}>
        <Image
          src="/images/ornament/floral-bottom-sm.webp"
          alt=""
          width={640}
          height={207}
          className="mx-auto mt-12 h-auto w-[min(90vw,460px)] [mask-image:linear-gradient(to_top,black_65%,transparent)]"
        />
      </Parallax>
      <Image src="/images/brand/monogram-ra.webp" alt="" width={960} height={474} className="mx-auto mt-8 h-auto w-20 opacity-80" />
    </footer>
  );
}
