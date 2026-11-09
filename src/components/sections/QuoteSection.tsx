import Image from "next/image";
import { wedding } from "@/content/wedding";
import Parallax from "@/components/motion/Parallax";
import SplitText from "@/components/motion/SplitText";
import Reveal from "@/components/motion/Reveal";

export default function QuoteSection() {
  const { quote } = wedding;
  return (
    <section aria-label="Kutipan pembuka" className="relative overflow-hidden px-6 pb-20 pt-28 text-center">
      {/* #19 Ornamen bergerak lebih lambat dari scroll */}
      <Parallax speed={0.35}>
        <Image
          src="/images/ornament/floral-top-sm.webp"
          alt=""
          width={640}
          height={237}
          className="mx-auto h-auto w-[min(86vw,420px)] [mask-image:linear-gradient(to_bottom,black_65%,transparent)]"
        />
      </Parallax>
      <blockquote className="mx-auto mt-8 max-w-[34rem]">
        {/* #13 Kata demi kata meluncur dari garis tak terlihat */}
        <SplitText as="p" text={quote.text} mode="words" className="font-display text-h3 text-burgundy sm:text-h2" />
      </blockquote>
      <Reveal delay={0.4}>
        <figure className="mx-auto mt-10 max-w-[30rem]">
          <blockquote className="text-body italic text-ink-muted">“{quote.verse.text}”</blockquote>
          <figcaption className="mt-3 text-small font-medium text-burgundy">{quote.verse.source}</figcaption>
        </figure>
      </Reveal>
    </section>
  );
}
