import { wedding } from "@/content/wedding";
import SectionHeading from "@/components/ui/SectionHeading";
import StoryTimeline from "./StoryTimeline";

export default function StorySection() {
  return (
    <section aria-labelledby="kisah-kami" className="glass-clear px-6 py-20">
      <SectionHeading id="kisah-kami" title={wedding.sections.story} />
      <StoryTimeline chapters={wedding.story} />
    </section>
  );
}
