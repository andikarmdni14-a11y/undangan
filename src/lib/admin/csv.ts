/** Parser CSV kecil (RFC 4180: kutip ganda, koma/titik koma) untuk impor daftar tamu. */
export function parseCsv(text: string): string[][] {
  const src = text.replace(/^\uFEFF/, "");
  const firstLine = src.split(/\r?\n/, 1)[0] ?? "";
  const delim = (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ";" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === delim) {
      row.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += c;
  }
  if (field !== "" || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.map((r) => r.map((f) => f.trim())).filter((r) => r.some((f) => f !== ""));
}

export type GuestImportRow = { name: string; maxPax: number; phone: string | null };

/** Kolom: nama, maks_tamu (opsional, default 2), telepon (opsional). Baris header dikenali otomatis. */
export function rowsToGuests(rows: string[][]): { guests: GuestImportRow[]; errors: string[] } {
  const guests: GuestImportRow[] = [];
  const errors: string[] = [];
  const header = rows[0]?.map((h) => h.toLowerCase()) ?? [];
  const hasHeader = header.some((h) => /nama|name/.test(h));
  const body = hasHeader ? rows.slice(1) : rows;
  body.forEach((r, i) => {
    const line = i + (hasHeader ? 2 : 1);
    const name = (r[0] ?? "").replace(/\s+/g, " ").trim();
    if (name.length < 1 || name.length > 120) {
      errors.push(`Baris ${line}: nama kosong atau terlalu panjang.`);
      return;
    }
    const paxRaw = (r[1] ?? "").trim();
    const maxPax = paxRaw === "" ? 2 : Number.parseInt(paxRaw, 10);
    if (!Number.isInteger(maxPax) || maxPax < 1 || maxPax > 10) {
      errors.push(`Baris ${line}: maks_tamu harus 1–10.`);
      return;
    }
    guests.push({ name, maxPax, phone: (r[2] ?? "").trim() || null });
  });
  return { guests, errors };
}

export function toCsv(rows: (string | number | null | undefined)[][]): string {
  const esc = (v: string | number | null | undefined) => {
    const s = v === null || v === undefined ? "" : String(v);
    // Cegah CSV/formula injection saat dibuka di Excel/Sheets.
    const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
    return /[",\n;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
  };
  return "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\r\n") + "\r\n";
}
