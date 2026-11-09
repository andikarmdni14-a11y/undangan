import { wedding } from "@/content/wedding";
import SectionHeading from "@/components/ui/SectionHeading";
import RsvpClient from "@/components/rsvp/RsvpClient";
import type { Guest } from "@/lib/guest";
import type { PublicWish } from "@/lib/rsvp/types";

export default function RsvpSection({ guest, wishes }: { guest: Guest | null; wishes: PublicWish[] }) {
  return (
    <section id="rsvp" aria-labelledby="konfirmasi" className="bg-rose-50 px-5 py-20 sm:px-6">
      <SectionHeading
        id="konfirmasi"
        title={wedding.rsvp.title}
        lead="Mohon konfirmasi kehadiran Anda dan titipkan doa restu untuk kami."
      />
      <RsvpClient
        guest={guest}
        initialWishes={wishes}
        submitLabel={wedding.rsvp.submit}
        messagePlaceholder={wedding.rsvp.messagePlaceholder}
      />
    </section>
  );
}
