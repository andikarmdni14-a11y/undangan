import { describe, expect, it } from "vitest";
import { buildIcs, escapeText, googleCalendarUrl, toUtcStamp } from "../calendar/ics";

const ev = {
  uid: "akad@test",
  title: "Akad Nikah Raihan & Andini",
  start: "2029-10-24T10:00:00+07:00",
  end: "2029-10-24T11:00:00+07:00",
  location: "Masjid Al-Ikhlas, Jl. Melati No. 12; Jakarta",
  description: "Baris satu\nBaris dua",
};

describe("ics", () => {
  it("mengonversi WIB ke UTC", () => {
    expect(toUtcStamp(ev.start)).toBe("20291024T030000Z");
  });
  it("meng-escape koma, titik koma, baris baru", () => {
    expect(escapeText("a,b;c\nd")).toBe("a\\,b\\;c\\nd");
  });
  it("menghasilkan VCALENDAR valid dengan CRLF & pengingat", () => {
    const out = buildIcs([ev], new Date("2026-11-05T00:00:00Z"));
    expect(out.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(out).toContain("DTSTART:20291024T030000Z");
    expect(out).toContain("TRIGGER:-P1D");
    expect(out.split("\r\n").every((l) => new TextEncoder().encode(l).length <= 75)).toBe(true);
  });
  it("membuat tautan Google Kalender", () => {
    expect(googleCalendarUrl(ev)).toContain("dates=20291024T030000Z%2F20291024T040000Z");
  });
});
