"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { m } from "framer-motion";
import { useRipple } from "@/components/motion/useRipple";
import { MESSAGE_MAX, NAME_MAX } from "@/lib/rsvp/constants";
import type { PublicWish, RsvpApiResponse } from "@/lib/rsvp/types";
import type { AttendanceStatus } from "@/types/database";

type Props = {
  slug: string;
  maxPax: number;
  defaultName: string;
  existing: { attendance: AttendanceStatus; pax: number | null; message: string | null } | null;
  submitLabel: string;
  messagePlaceholder: string;
  onSubmitted: (wish: PublicWish | null) => void;
};

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; isUpdate: boolean; isFiltered: boolean; attendance: AttendanceStatus }
  | { kind: "error"; message: string };

type FieldErrors = Partial<Record<"name" | "attendance" | "pax" | "message", string>>;

/**
 * Formulir RSVP + Ucapan terpadu (PRD §5). Validasi ringan di klien untuk umpan balik cepat;
 * validasi otoritatif (Zod, sanitasi, rate limit, kuota) tetap di server.
 */
export default function RsvpForm({ slug, maxPax, defaultName, existing, submitLabel, messagePlaceholder, onSubmitted }: Props) {
  const uid = useId();
  const [name, setName] = useState(defaultName);
  const [attendance, setAttendance] = useState<AttendanceStatus | null>(existing?.attendance ?? null);
  const [pax, setPax] = useState<number>(Math.min(existing?.pax ?? 1, maxPax));
  const [message, setMessage] = useState(existing?.message ?? "");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [hasSubmitted, setHasSubmitted] = useState(existing !== null);
  const formRef = useRef<HTMLFormElement>(null);
  const { onPointerDown, ripples } = useRipple();

  /** #37 Getar halus pada field yang gagal validasi (Web Animations API, tanpa remount). */
  const shake = (keys: string[]) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    keys.forEach((k) =>
      formRef.current
        ?.querySelector<HTMLElement>(`[data-field="${k}"]`)
        ?.animate(
          [{ transform: "translateX(0)" }, { transform: "translateX(-7px)" }, { transform: "translateX(6px)" }, { transform: "translateX(-4px)" }, { transform: "translateX(2px)" }, { transform: "translateX(0)" }],
          { duration: 450, easing: "cubic-bezier(.36,.07,.19,.97)" },
        ),
    );
  };

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    if (name.trim().length < 2) e.name = "Mohon tuliskan nama Anda (minimal 2 karakter).";
    if (!attendance) e.attendance = "Mohon pilih kesediaan hadir.";
    if (message.length > MESSAGE_MAX) e.message = `Pesan maksimal ${MESSAGE_MAX} karakter.`;
    return e;
  };

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    if (status.kind === "submitting") return;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      shake(Object.keys(e));
      document.getElementById(`${uid}-${Object.keys(e)[0]}`)?.focus();
      return;
    }
    setStatus({ kind: "submitting" });
    const website = (new FormData(ev.currentTarget).get("website") as string) ?? "";
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, name, attendance, pax: attendance === "hadir" ? pax : null, message, website }),
      });
      const data = (await res.json()) as RsvpApiResponse;
      if (!data.ok) {
        if (data.fieldErrors) {
          shake(Object.keys(data.fieldErrors));
          setErrors({
            name: data.fieldErrors.name?.[0],
            attendance: data.fieldErrors.attendance?.[0],
            pax: data.fieldErrors.pax?.[0],
            message: data.fieldErrors.message?.[0],
          });
        }
        setStatus({ kind: "error", message: data.message });
        return;
      }
      setHasSubmitted(true);
      setStatus({ kind: "success", isUpdate: data.isUpdate, isFiltered: data.isFiltered, attendance: attendance! });
      onSubmitted(data.wish);
    } catch {
      setStatus({ kind: "error", message: "Koneksi terputus. Periksa internet Anda lalu coba lagi." });
    }
  };

  if (status.kind === "success") {
    return (
      <div role="status" className="arch bg-alabaster px-7 pb-10 pt-14 text-center">
        {/* #39 Tanda centang yang tergambar sebagai indikator sukses */}
        <svg viewBox="0 0 52 52" className="mx-auto mb-5 size-16 text-burgundy" aria-hidden="true">
          <m.circle
            cx="26" cy="26" r="24" fill="none" stroke="currentColor" strokeWidth="1.5"
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: [0.65, 0, 0.35, 1] }}
          />
          <m.path
            d="M15 27l7.5 7.5L38 19" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
            transition={{ duration: 0.45, delay: 0.6, ease: [0.65, 0, 0.35, 1] }}
          />
        </svg>
        <p className="font-display text-h3 text-burgundy">
          {status.isUpdate ? "Konfirmasi diperbarui" : "Terima kasih"}
        </p>
        <p className="mx-auto mt-4 max-w-sm text-body text-ink-muted">
          {status.attendance === "hadir"
            ? "Kehadiran Anda telah kami catat. Sampai jumpa di hari bahagia kami."
            : "Konfirmasi Anda telah kami terima. Doa restu Anda sangat berarti bagi kami."}
        </p>
        {status.isFiltered && (
          <p className="mx-auto mt-3 max-w-sm text-small text-ink-muted">Beberapa kata dalam pesan disensor otomatis.</p>
        )}
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-7 min-h-11 rounded-full border border-burgundy/40 px-6 text-small font-medium text-burgundy transition-colors hover:border-burgundy hover:bg-burgundy/5"
        >
          Ubah konfirmasi
        </button>
      </div>
    );
  }

  const fieldClass =
    "w-full rounded-2xl border border-rose-300 bg-alabaster px-4 py-3 text-body text-ink placeholder:text-ink-muted/70 transition-colors focus:border-burgundy focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-burgundy/20 aria-[invalid=true]:border-burgundy";
  // #38 Label mengambang: placeholder " " + peer → label naik ke tepi atas saat fokus/terisi.
  const floatInput = `${fieldClass} peer pt-6 pb-2 placeholder:text-transparent`;
  const floatLabel =
    "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 origin-left text-body text-ink-muted transition-all duration-300 ease-[var(--ease-romance)] peer-focus:top-3.5 peer-focus:scale-[0.78] peer-focus:text-burgundy peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:scale-[0.78]";

  const errorText = (key: keyof FieldErrors) =>
    errors[key] ? (
      <p id={`${uid}-${key}-error`} className="mt-2 text-small text-burgundy">
        {errors[key]}
      </p>
    ) : null;

  return (
    <form
      ref={formRef}
      noValidate
      onSubmit={onSubmit}
      aria-labelledby={`${uid}-title`}
      aria-describedby={hasSubmitted ? `${uid}-hint` : undefined}
      className="arch bg-alabaster px-6 pb-9 pt-14 sm:px-9"
    >
      {/* Judul mengisi ruang kubah agar field tidak terpotong lengkungan */}
      <p id={`${uid}-title`} className="mb-8 text-center font-display text-h4 text-burgundy">
        Konfirmasi Kehadiran
      </p>
      {hasSubmitted && (
        <p id={`${uid}-hint`} className="mb-6 rounded-2xl bg-rose-50 px-4 py-3 text-center text-small text-ink-muted">
          Anda sudah pernah mengirim konfirmasi. Kirim ulang bila ada perubahan.
        </p>
      )}

      {/* Nama */}
      <div data-field="name">
        <div className="relative">
        <input
          id={`${uid}-name`}
          placeholder=" "
          name="name"
          autoComplete="name"
          maxLength={NAME_MAX}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((x) => ({ ...x, name: undefined }));
          }}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? `${uid}-name-error` : undefined}
          className={floatInput}
        />
        <label htmlFor={`${uid}-name`} className={floatLabel}>
          Nama Lengkap
        </label>
        </div>
        {errorText("name")}
      </div>

      {/* Kesediaan — #41 sakelar kapsul dengan "jempol" yang meluncur halus */}
      <fieldset data-field="attendance" className="mt-6" aria-describedby={errors.attendance ? `${uid}-attendance-error` : undefined}>
        <legend className="mb-2 text-small font-medium text-ink">Kesediaan</legend>
        <div
          id={`${uid}-attendance`}
          tabIndex={-1}
          className="relative grid grid-cols-2 rounded-full border border-rose-300 bg-rose-50 p-1"
        >
          {(
            [
              ["hadir", "Hadir"],
              ["tidak_hadir", "Tidak Hadir"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className="relative isolate flex min-h-12 cursor-pointer items-center justify-center rounded-full px-3 text-body text-ink transition-colors duration-300 has-[:checked]:text-alabaster has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-burgundy has-[:focus-visible]:ring-offset-2"
            >
              <input
                type="radio"
                name="attendance"
                value={value}
                checked={attendance === value}
                onChange={() => {
                  setAttendance(value);
                  setErrors((x) => ({ ...x, attendance: undefined, pax: undefined }));
                }}
                className="sr-only"
              />
              {attendance === value && (
                <m.span
                  layoutId={`${uid}-thumb`}
                  aria-hidden="true"
                  className="absolute inset-0 -z-10 rounded-full bg-burgundy shadow-[0_8px_20px_-10px_rgb(114_47_55/0.8)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              {label}
            </label>
          ))}
        </div>
        {errorText("attendance")}
      </fieldset>

      {/* Jumlah tamu — hanya bila hadir */}
      {attendance === "hadir" && (
        <fieldset className="mt-6">
          <legend className="mb-2 text-small font-medium text-ink">Jumlah Tamu</legend>
          {maxPax === 1 ? (
            <p className="text-body text-ink-muted">Undangan ini berlaku untuk 1 orang.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: maxPax }, (_, i) => i + 1).map((n) => (
                <label
                  key={n}
                  className="flex min-h-11 min-w-20 cursor-pointer items-center justify-center rounded-full border border-rose-300 px-4 text-small text-ink transition-colors has-[:checked]:border-burgundy has-[:checked]:bg-burgundy has-[:checked]:text-alabaster has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-burgundy has-[:focus-visible]:ring-offset-2"
                >
                  <input type="radio" name="pax" value={n} checked={pax === n} onChange={() => setPax(n)} className="sr-only" />
                  {n} Orang
                </label>
              ))}
            </div>
          )}
          {errorText("pax")}
        </fieldset>
      )}

      {/* Pesan */}
      <div data-field="message" className="mt-6">
        <div className="relative">
        <textarea
          id={`${uid}-message`}
          name="message"
          rows={4}
          maxLength={MESSAGE_MAX}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder=" "
          aria-invalid={!!errors.message}
          aria-describedby={`${uid}-message-count${errors.message ? ` ${uid}-message-error` : ""}`}
          className={`${floatInput} resize-y pt-7`}
        />
        <label
          htmlFor={`${uid}-message`}
          className="pointer-events-none absolute left-4 top-4 max-w-[calc(100%-2rem)] origin-left truncate whitespace-nowrap text-body text-ink-muted transition-all duration-300 ease-[var(--ease-romance)] peer-focus:top-1.5 peer-focus:scale-[0.78] peer-focus:text-burgundy peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:scale-[0.78]"
        >
          Pesan &amp; Doa Restu <span className="text-ink-muted">(opsional)</span>
        </label>
        </div>
        <p id={`${uid}-message-count`} className="mt-1 flex justify-between gap-3 text-caption text-ink-muted">
          <span>{messagePlaceholder}</span>
          <span className="tabular-nums">
            {message.length}/{MESSAGE_MAX}
          </span>
        </p>
        {errorText("message")}
      </div>

      {/* Honeypot: tersembunyi dari manusia & pembaca layar */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div aria-live="polite" className="min-h-0">
        {status.kind === "error" && (
          <p className="mt-5 rounded-2xl border border-burgundy/30 bg-burgundy/5 px-4 py-3 text-small text-burgundy">
            {status.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status.kind === "submitting"}
        aria-busy={status.kind === "submitting"}
        onPointerDown={onPointerDown}
        className="relative mt-7 flex min-h-12 w-full overflow-hidden items-center justify-center gap-2 rounded-full bg-burgundy px-6 text-body font-medium text-alabaster shadow-[0_12px_28px_-14px_rgb(114_47_55/0.8)] transition-colors hover:bg-burgundy-700 disabled:cursor-wait disabled:opacity-70"
      >
        {status.kind === "submitting" && (
          <span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-alabaster/40 border-t-alabaster" />
        )}
        {ripples}
        <span className="relative">{status.kind === "submitting" ? "Mengirim…" : submitLabel}</span>
      </button>
    </form>
  );
}
