/** Terjemahan kode galat RPC submit_rsvp → respons HTTP + pesan untuk tamu. */
export type RsvpErrorResponse = { status: number; message: string };

export function mapRsvpError(code: string | undefined, detail?: string | null): RsvpErrorResponse {
  switch (code) {
    case "P0429":
      return { status: 429, message: "Batas pengiriman tercapai. Silakan coba lagi dalam satu jam." };
    case "P0404":
      return { status: 404, message: "Tautan undangan tidak dikenali. Periksa kembali tautan yang Anda terima." };
    case "P0422":
      return {
        status: 422,
        message: detail
          ? `Jumlah tamu melebihi kuota undangan Anda (maksimal ${detail} orang).`
          : "Jumlah tamu melebihi kuota undangan Anda.",
      };
    default:
      return { status: 500, message: "Konfirmasi belum terkirim karena gangguan server. Silakan coba lagi." };
  }
}
