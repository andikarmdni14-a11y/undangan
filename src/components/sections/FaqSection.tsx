import { wedding } from "@/content/wedding";
import SectionHeading from "@/components/ui/SectionHeading";
import { AccordionItem } from "@/components/motion/Accordion";
import Reveal from "@/components/motion/Reveal";

export default function FaqSection() {
  return (
    <section aria-labelledby="informasi-tamu" className="glass-clear px-6 pb-20 pt-4">
      <SectionHeading id="informasi-tamu" title={wedding.sections.faq} />
      <Reveal className="mx-auto max-w-2xl border-t border-rose-300/70">
        {wedding.faq.map((item) => (
          <AccordionItem key={item.q} title={item.q}>
            {item.a}
          </AccordionItem>
        ))}
      </Reveal>
    </section>
  );
}
