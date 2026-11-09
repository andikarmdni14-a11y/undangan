import { describe, expect, it } from "vitest";
import { upsertWish } from "../rsvp/wish-list";

const w = (id: string, t: string, message = "m") => ({ id, name: "A", attendance: "hadir" as const, message, created_at: t });

describe("upsertWish", () => {
  it("menambah ucapan baru di urutan teratas", () => {
    const out = upsertWish([w("a", "2026-01-01")], w("b", "2026-01-02"));
    expect(out.map((x) => x.id)).toEqual(["b", "a"]);
  });
  it("tidak menduplikasi saat event Realtime datang setelah respons API", () => {
    const out = upsertWish([w("a", "2026-01-01", "lama")], w("a", "2026-01-01", "baru"));
    expect(out).toHaveLength(1);
    expect(out[0].message).toBe("baru");
  });
});
