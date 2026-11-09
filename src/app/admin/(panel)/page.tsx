import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteRsvp, setRsvpStatus } from "../actions";
import ConfirmButton, { SubmitButton } from "@/components/admin/ConfirmButton";
import CountUp from "@/components/motion/CountUp";

const FILTERS = [
  { key: "semua", label: "Semua" },
  { key: "hadir", label: "Hadir" },
  { key: "tidak_hadir", label: "Tidak Hadir" },
  { key: "tersaring", label: "Tersensor" },
  { key: "tersembunyi", label: "Disembunyikan" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

const dt = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" });

export default async function RsvpDashboard({ searchParams }: { searchParams: Promise<{ f?: string; q?: string }> }) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const filter: FilterKey = FILTERS.some((x) => x.key === sp.f) ? (sp.f as FilterKey) : "semua";
  const q = (sp.q ?? "").trim().slice(0, 60);

  let query = supabase
    .from("rsvps")
    .select("id, name, attendance, pax, message, message_raw, is_flagged, status, submit_count, created_at, updated_at, guests(display_name, slug, max_pax)")
    .order("updated_at", { ascending: false })
    .limit(500);
  if (filter === "hadir" || filter === "tidak_hadir") query = query.eq("attendance", filter);
  if (filter === "tersaring") query = query.eq("is_flagged", true);
  if (filter === "tersembunyi") query = query.eq("status", "hidden");
  if (q) query = query.ilike("name", `%${q.replace(/[%_\\]/g, "\\$&")}%`);

  const [{ data: rows, error }, { data: summary }] = await Promise.all([
    query,
    supabase.from("rsvp_summary").select("*").maybeSingle(),
  ]);

  const s = summary ?? { total_hadir: 0, total_tidak_hadir: 0, total_pax: 0, total_undangan: 0, total_tersaring: 0 };
  const responded = s.total_hadir + s.total_tidak_hadir;
  const stats = [
    { label: "Tamu hadir (orang)", value: s.total_pax, hint: `${s.total_hadir} undangan` },
    { label: "Tidak hadir", value: s.total_tidak_hadir },
    { label: "Sudah merespons", value: responded, suffix: `/${s.total_undangan}`, hint: s.total_undangan ? `${Math.round((responded / s.total_undangan) * 100)}%` : undefined },
    { label: "Pesan tersensor", value: s.total_tersaring },
  ];

  return (
    <div className="space-y-8">
      <section aria-label="Ringkasan">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((st) => (
            <div key={st.label} className="rounded-[var(--radius-soft)] bg-alabaster p-4 shadow-[0_8px_24px_-20px_rgb(114_47_55/0.6)]">
              <p className="text-caption text-ink-muted">{st.label}</p>
              {/* #42 angka menghitung naik */}
              <p className="mt-1 font-display text-h2 tabular-nums text-burgundy">
                <CountUp value={st.value} />
                {"suffix" in st && st.suffix}
              </p>
              {st.hint && <p className="text-caption text-ink-muted">{st.hint}</p>}
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="daftar-rsvp" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 id="daftar-rsvp" className="text-h3">Konfirmasi &amp; Ucapan</h1>
          <a href="/admin/export" className="min-h-10 rounded-full border border-burgundy/30 px-4 py-2 text-small text-burgundy hover:bg-burgundy/5">
            Unduh CSV
          </a>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Filter" className="flex gap-1 overflow-x-auto">
            {FILTERS.map((f) => (
              <Link
                key={f.key}
                href={{ pathname: "/admin", query: { ...(f.key !== "semua" && { f: f.key }), ...(q && { q }) } }}
                aria-current={filter === f.key ? "page" : undefined}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 text-small ${
                  filter === f.key ? "bg-ink text-alabaster" : "bg-alabaster text-ink-muted hover:text-ink"
                }`}
              >
                {f.label}
              </Link>
            ))}
          </nav>
          <form role="search" className="flex gap-2">
            {filter !== "semua" && <input type="hidden" name="f" value={filter} />}
            <label htmlFor="q" className="sr-only">Cari nama</label>
            <input id="q" name="q" defaultValue={q} placeholder="Cari nama…" className="min-h-10 w-full rounded-full border border-rose-300 bg-alabaster px-4 text-small sm:w-56" />
          </form>
        </div>

        {error && <p className="text-small text-burgundy">Data gagal dimuat: {error.message}</p>}
        {!rows?.length && !error && (
          <p className="rounded-[var(--radius-soft)] bg-alabaster px-6 py-10 text-center text-ink-muted">Belum ada data untuk filter ini.</p>
        )}

        <ul className="space-y-3">
          {rows?.map((r) => {
            const guest = Array.isArray(r.guests) ? r.guests[0] : r.guests;
            const hidden = r.status === "hidden";
            return (
              <li key={r.id} className={`rounded-[var(--radius-soft)] bg-alabaster p-4 ${hidden ? "opacity-70" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{r.name}</p>
                    <p className="text-caption text-ink-muted">
                      Undangan: {guest?.display_name} · {dt.format(new Date(r.updated_at))}
                      {r.submit_count > 1 && ` · diperbarui ${r.submit_count - 1}×`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 text-caption">
                    <span className={`rounded-full px-2.5 py-0.5 ${r.attendance === "hadir" ? "bg-burgundy text-alabaster" : "bg-rose-100 text-ink-muted"}`}>
                      {r.attendance === "hadir" ? `Hadir · ${r.pax}/${guest?.max_pax ?? "?"} org` : "Tidak hadir"}
                    </span>
                    {r.is_flagged && <span className="rounded-full bg-rose-300 px-2.5 py-0.5 text-ink">Tersensor</span>}
                    {hidden && <span className="rounded-full bg-ink px-2.5 py-0.5 text-alabaster">Disembunyikan</span>}
                  </div>
                </div>
                {r.message && <p className="mt-3 whitespace-pre-line break-words text-body">{r.message}</p>}
                {r.is_flagged && r.message_raw && (
                  <details className="mt-2 text-small text-ink-muted">
                    <summary className="cursor-pointer">Lihat pesan asli</summary>
                    <p className="mt-1 whitespace-pre-line break-words">{r.message_raw}</p>
                  </details>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.message && (
                    <form action={setRsvpStatus}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="status" value={hidden ? "visible" : "hidden"} />
                      <SubmitButton className="min-h-10 rounded-full border border-burgundy/30 px-4 text-small text-burgundy hover:bg-burgundy/5">
                        {hidden ? "Tampilkan ucapan" : "Sembunyikan ucapan"}
                      </SubmitButton>
                    </form>
                  )}
                  <form action={deleteRsvp}>
                    <input type="hidden" name="id" value={r.id} />
                    <ConfirmButton
                      message={`Hapus RSVP dari ${r.name}? Tamu dapat mengirim ulang lewat tautannya.`}
                      className="min-h-10 rounded-full px-4 text-small text-ink-muted hover:bg-rose-100 hover:text-burgundy"
                    >
                      Hapus
                    </ConfirmButton>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
