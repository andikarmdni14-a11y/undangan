import type { Metadata } from "next";
import InvitationExperience from "@/components/InvitationExperience";
import { wedding } from "@/content/wedding";
import { getGuest } from "@/lib/guest";
import { formatShortDate } from "@/lib/format";
import QuoteSection from "@/components/sections/QuoteSection";
import CoupleSection from "@/components/sections/CoupleSection";
import CountdownSection from "@/components/sections/CountdownSection";
import StorySection from "@/components/sections/StorySection";
import GallerySection from "@/components/sections/GallerySection";
import EventsSection from "@/components/sections/EventsSection";
import RsvpSection from "@/components/sections/RsvpSection";
import { getInitialWishes } from "@/lib/wishes";
import ClosingSection from "@/components/sections/ClosingSection";
import FaqSection from "@/components/sections/FaqSection";
import Marquee from "@/components/sections/Marquee";

type PageProps = { searchParams: Promise<{ to?: string | string[] }> };

const firstParam = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const guest = await getGuest(firstParam((await searchParams).to));
  const { groom, bride } = wedding.couple;
  if (!guest) return {};
  // Pratinjau WhatsApp yang personal: "Undangan untuk Bapak Budi Santoso"
  return {
    title: `Undangan untuk ${guest.displayName} — ${groom.nickname} & ${bride.nickname}`,
  };
}

export default async function Home({ searchParams }: PageProps) {
  const [guest, wishes] = await Promise.all([getGuest(firstParam((await searchParams).to)), getInitialWishes()]);
  const { groom, bride } = wedding.couple;
  const akad = wedding.events[0];

  return (
    <InvitationExperience
      guestName={guest?.displayName ?? wedding.hero.fallbackGuestName}
      hero={{
        greetingPrefix: wedding.hero.greetingPrefix,
        tagline: wedding.hero.tagline,
        coupleLabel: `${groom.nickname} & ${bride.nickname}`,
        dateLabel: formatShortDate(akad.start),
        openLabel: wedding.hero.openButton,
      }}
      music={wedding.music}
    >
      <div>
        <QuoteSection />
        <CoupleSection />
        <CountdownSection />
        <Marquee />
        <StorySection />
        <GallerySection />
        <EventsSection />
        <FaqSection />
        <RsvpSection guest={guest} wishes={wishes} />
      </div>
      <ClosingSection />
    </InvitationExperience>
  );
}
