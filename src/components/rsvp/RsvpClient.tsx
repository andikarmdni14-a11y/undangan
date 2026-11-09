"use client";

import { useState } from "react";
import type { PublicWish } from "@/lib/rsvp/types";
import type { Guest } from "@/lib/guest";
import RsvpForm from "./RsvpForm";
import WishList from "./WishList";

type Props = {
  guest: Guest | null;
  initialWishes: PublicWish[];
  submitLabel: string;
  messagePlaceholder: string;
};

export default function RsvpClient({ guest, initialWishes, submitLabel, messagePlaceholder }: Props) {
  const [incoming, setIncoming] = useState<PublicWish | null>(null);

  return (
    <>
      <div className="mx-auto max-w-lg">
        {guest ? (
          <RsvpForm
            slug={guest.slug}
            maxPax={guest.maxPax}
            defaultName={guest.rsvp?.name || guest.displayName}
            existing={guest.rsvp}
            submitLabel={submitLabel}
            messagePlaceholder={messagePlaceholder}
            onSubmitted={setIncoming}
          />
        ) : (
          <div className="arch bg-alabaster px-7 pb-10 pt-16 text-center">
            <p className="font-display text-h4 text-burgundy">Formulir konfirmasi bersifat pribadi</p>
            <p className="mx-auto mt-3 max-w-sm text-body text-ink-muted">
              Silakan buka undangan melalui tautan khusus yang kami kirimkan kepada Anda untuk mengonfirmasi kehadiran.
            </p>
          </div>
        )}
      </div>
      <div className="mx-auto max-w-2xl">
        <WishList initial={initialWishes} incoming={incoming} />
      </div>
    </>
  );
}
