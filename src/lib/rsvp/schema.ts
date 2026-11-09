import { z } from "zod";
import { sanitizeLine, sanitizeMultiline } from "./sanitize";

import { MESSAGE_MAX, NAME_MAX, SLUG_PATTERN } from "./constants";

export { MESSAGE_MAX, NAME_MAX, SLUG_PATTERN };

/** Payload formulir RSVP + Ucapan terpadu. Dipakai bersama oleh klien & Route Handler. */
export const rsvpSchema = z
  .object({
    slug: z.string().trim().toLowerCase().min(3).max(80).regex(SLUG_PATTERN, "Tautan undangan tidak valid."),
    name: z
      .string()
      .transform(sanitizeLine)
      .pipe(z.string().min(2, "Nama minimal 2 karakter.").max(NAME_MAX, `Nama maksimal ${NAME_MAX} karakter.`)),
    attendance: z.enum(["hadir", "tidak_hadir"], { error: "Pilih kesediaan hadir." }),
    pax: z.coerce.number().int().min(1).max(10).nullable().optional(),
    message: z
      .string()
      .optional()
      .default("")
      .transform(sanitizeMultiline)
      .pipe(z.string().max(MESSAGE_MAX, `Pesan maksimal ${MESSAGE_MAX} karakter.`)),
    /** Honeypot: tidak terlihat oleh manusia. Bot yang mengisinya dianggap spam. */
    website: z.string().optional().default(""),
  })
  .transform((v) => ({ ...v, pax: v.attendance === "hadir" ? (v.pax ?? 1) : null }));

export type RsvpInput = z.input<typeof rsvpSchema>;
export type RsvpPayload = z.output<typeof rsvpSchema>;
