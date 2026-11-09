import { describe, expect, it } from "vitest";
import { makeSlug, slugBase } from "../admin/slug";
import { normalizePhone } from "../admin/phone";
import { parseCsv, rowsToGuests, toCsv } from "../admin/csv";
import { invitationUrl, whatsappLink } from "../admin/whatsapp";
import { SLUG_PATTERN } from "../rsvp/constants";

describe("slug", () => {
  it("membuang gelar & aksen, cocok dengan pola DB", () => {
    expect(slugBase("Bapak Budi Santoso")).toBe("budi-santoso");
    expect(slugBase("Keluarga Bpk. H. Hartono")).toBe("hartono");
    expect(slugBase("Zoë Müller")).toBe("zoe-muller");
    const s = makeSlug("Ibu Siti Rahmawati, S.Pd.");
    expect(SLUG_PATTERN.test(s)).toBe(true);
    expect(s).toMatch(/^siti-rahmawati-s-pd-[a-z2-9]{4}$/);
  });
  it("nama hanya simbol tetap menghasilkan slug valid", () => {
    expect(SLUG_PATTERN.test(makeSlug("!!!"))).toBe(true);
  });
});

describe("telepon", () => {
  it.each([
    ["0812-3456-7890", "6281234567890"],
    ["+62 812 3456 7890", "6281234567890"],
    ["81234567890", "6281234567890"],
    ["abc", null],
  ])("%s → %s", (input, out) => expect(normalizePhone(input)).toBe(out));
});

describe("csv", () => {
  it("membaca header, kutip, dan titik koma", () => {
    const rows = parseCsv('nama;maks_tamu;telepon\n"Hartono, Kel.";4;0812345678\nSari;;\n');
    const { guests, errors } = rowsToGuests(rows);
    expect(errors).toEqual([]);
    expect(guests).toEqual([
      { name: "Hartono, Kel.", maxPax: 4, phone: "0812345678" },
      { name: "Sari", maxPax: 2, phone: null },
    ]);
  });
  it("melaporkan baris tidak valid", () => {
    expect(rowsToGuests(parseCsv("Budi,99")).errors[0]).toContain("Baris 1");
  });
  it("ekspor menetralkan formula injection", () => {
    expect(toCsv([["=HYPERLINK(1)"]])).toContain("'=HYPERLINK(1)");
  });
});

describe("whatsapp", () => {
  it("membuat tautan undangan & wa.me", () => {
    const url = invitationUrl("https://raihan-andini.vercel.app", "budi-x7k2");
    expect(url).toBe("https://raihan-andini.vercel.app/?to=budi-x7k2");
    expect(whatsappLink("628123", "Halo & salam")).toBe("https://wa.me/628123?text=Halo%20%26%20salam");
  });
});
