import { SprigDivider } from "./icons";
import SplitText from "@/components/motion/SplitText";
import Reveal from "@/components/motion/Reveal";

/** Judul seksi: huruf serif muncul bertahap (#14), ornamen & lead menyusul (#20). */
export default function SectionHeading({ id, title, lead }: { id: string; title: string; lead?: string }) {
  return (
    <header className="mx-auto mb-12 max-w-md text-center">
      <h2 id={id} className="text-h2">
        <SplitText text={title} mode="chars" />
      </h2>
      <Reveal delay={0.25} y={10}>
        <SprigDivider className="mx-auto mt-4 text-rose-600" />
        {lead && <p className="mt-5 text-body text-ink-muted">{lead}</p>}
      </Reveal>
    </header>
  );
}
