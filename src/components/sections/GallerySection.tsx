import { wedding } from "@/content/wedding";
import SectionHeading from "@/components/ui/SectionHeading";
import Gallery from "./Gallery";

export default function GallerySection() {
  return (
    <section aria-labelledby="galeri" className="px-4 py-20 sm:px-6">
      <SectionHeading id="galeri" title={wedding.sections.gallery} />
      <Gallery photos={wedding.gallery} />
    </section>
  );
}
