import type { AttendanceStatus } from "@/types/database";

export type PublicWish = { id: string; name: string; attendance: AttendanceStatus; message: string; created_at: string };

export type RsvpApiResponse =
  | { ok: true; isUpdate: boolean; isFiltered: boolean; wish: PublicWish | null }
  | { ok: false; message: string; fieldErrors?: Partial<Record<"slug" | "name" | "attendance" | "pax" | "message", string[]>> };
