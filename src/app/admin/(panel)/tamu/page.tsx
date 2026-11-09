import { headers } from "next/headers";
import { requireAdmin } from "@/lib/admin/auth";
import { invitationMessage, invitationUrl, whatsappLink } from "@/lib/admin/whatsapp";
import { siteUrl } from "@/lib/env";
import { createGuest, deleteGuest, importGuests, updateGuest } from "../../actions";
import ActionForm from "@/components/admin/ActionForm";
import ConfirmButton, { SubmitButton } from "@/components/admin/ConfirmButton";
import CopyButton from "@/components/admin/CopyButton";

/** URL publik untuk tautan undangan: env NEXT_PUBLIC_SITE_URL, atau host request saat env masih default. */
async function publicOrigin() {
  const env = siteUrl();
  if (!env.includes("localhost")) return env;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return host ? `${h.get("x-forwarded-proto") ?? "http"}://${host}` : env;
}

const field = "min-h-11 w-full rounded-2xl border border-rose-300 bg-alabaster px-4 text-body focus:border-burgundy focus:outline-none";
const primary = "min-h-11 rounded-full bg-burgundy px-6 text-small font-medium text-alabaster hover:bg-burgundy-700";
const ghost = "min-h-10 rounded-full border border-burgundy/30 px-4 text-small text-burgundy hover:bg-burgundy/5";

export default async function GuestsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { supabase } = await requireAdmin();
  const q = ((await searchParams).q ?? "").trim().slice(0, 60);
  const origin = await publicOrigin();

  let guestQuery = supabase.from("guests").select("id, slug, display_name, max_pax, phone, created_at").order("created_at", { ascending: false }).limit(1000);
  if (q) guestQuery = guestQuery.ilike("display_name", `%${q.replace(/[%_\\]/g, "\\$&")}%`);
  const [{ data: guests }, { data: rsvps }] = await Promise.all([guestQuery, supabase.from("rsvps").select("guest_id, attendance, pax")]);
  const byGuest = new Map(rsvps?.map((r) => [r.guest_id, r]) ?? []);

  return (
    <div className="space-y-10">
      <section aria-labelledby="tambah" className="grid gap-6 md:grid-cols-2">
        <div className="rounded-[var(--radius-soft)] bg-alabaster p-5">
          <h2 id="tambah" className="text-h4">Tambah Tamu</h2>
          <ActionForm action={createGuest} className="mt-4 space-y-3">
            <div>
              <label htmlFor="g-name" className="mb-1 block text-small">Nama tampilan</label>
              <input id="g-name" name="name" required maxLength={120} placeholder="Bapak Budi Santoso" className={field} />
            </div>
            <div className="grid grid-cols-[7rem_1fr] gap-3">
              <div>
                <label htmlFor="g-pax" className="mb-1 block text-small">Maks. tamu</label>
                <input id="g-pax" name="maxPax" type="number" min={1} max={10} defaultValue={2} className={field} />
              </div>
              <div>
                <label htmlFor="g-phone" className="mb-1 block text-small">WhatsApp (opsional)</label>
                <input id="g-phone" name="phone" inputMode="tel" placeholder="0812…" className={field} />
              </div>
            </div>
            <SubmitButton pendingText="Menyimpan…" className={primary}>Simpan Tamu</SubmitButton>
          </ActionForm>
        </div>

        <div className="rounded-[var(--radius-soft)] bg-alabaster p-5">
          <h2 className="text-h4">Impor CSV</h2>
          <p className="mt-1 text-small text-ink-muted">
            Kolom: <code>nama, maks_tamu, telepon</code>. Header opsional; maks. 500 baris.
          </p>
          <ActionForm action={importGuests} className="mt-4 space-y-3">
            <label htmlFor="g-csv" className="sr-only">Data CSV</label>
            <textarea id="g-csv" name="csv" rows={4} placeholder={"nama,maks_tamu,telepon\nKeluarga Bapak Hartono,4,08123456789"} className={`${field} py-3 font-mono text-small`} />
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-small text-ink-muted">
                atau berkas: <input name="file" type="file" accept=".csv,text/csv" className="text-small" />
              </label>
              <SubmitButton pendingText="Mengimpor…" className={primary}>Impor</SubmitButton>
            </div>
          </ActionForm>
        </div>
      </section>

      <section aria-labelledby="daftar-tamu" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 id="daftar-tamu" className="text-h3">
            Daftar Tamu <span className="text-body text-ink-muted">({guests?.length ?? 0})</span>
          </h1>
          <form role="search">
            <label htmlFor="gq" className="sr-only">Cari tamu</label>
            <input id="gq" name="q" defaultValue={q} placeholder="Cari tamu…" className="min-h-10 rounded-full border border-rose-300 bg-alabaster px-4 text-small" />
          </form>
        </div>

        <ul className="space-y-3">
          {guests?.map((g) => {
            const url = invitationUrl(origin, g.slug);
            const rsvp = byGuest.get(g.id);
            return (
              <li key={g.id} className="rounded-[var(--radius-soft)] bg-alabaster p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium">{g.display_name}</p>
                    <p className="truncate text-caption text-ink-muted">{url}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-caption ${rsvp ? (rsvp.attendance === "hadir" ? "bg-burgundy text-alabaster" : "bg-rose-100 text-ink-muted") : "bg-rose-50 text-ink-muted"}`}>
                    {rsvp ? (rsvp.attendance === "hadir" ? `Hadir ${rsvp.pax}/${g.max_pax}` : "Tidak hadir") : `Belum merespons · kuota ${g.max_pax}`}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <a href={whatsappLink(g.phone, invitationMessage(g.display_name, url))} target="_blank" rel="noopener noreferrer" className={primary + " inline-flex items-center"}>
                    Kirim via WhatsApp
                  </a>
                  <CopyButton text={url} className={ghost} />
                  <CopyButton text={invitationMessage(g.display_name, url)} label="Salin pesan" className={ghost} />
                </div>
                <details className="mt-3">
                  <summary className="cursor-pointer text-small text-ink-muted">Ubah / hapus</summary>
                  <form action={updateGuest} className="mt-3 grid gap-3 sm:grid-cols-[1fr_6rem_10rem_auto] sm:items-end">
                    <input type="hidden" name="id" value={g.id} />
                    <label className="text-small">Nama<input name="name" defaultValue={g.display_name} maxLength={120} className={field} /></label>
                    <label className="text-small">Maks.<input name="maxPax" type="number" min={1} max={10} defaultValue={g.max_pax} className={field} /></label>
                    <label className="text-small">WhatsApp<input name="phone" defaultValue={g.phone ?? ""} inputMode="tel" className={field} /></label>
                    <SubmitButton pendingText="…" className={primary}>Simpan</SubmitButton>
                  </form>
                  <form action={deleteGuest} className="mt-3">
                    <input type="hidden" name="id" value={g.id} />
                    <ConfirmButton message={`Hapus ${g.display_name}? RSVP & ucapannya ikut terhapus dan tautannya tidak berlaku lagi.`} className="text-small text-burgundy underline">
                      Hapus tamu ini
                    </ConfirmButton>
                  </form>
                </details>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
