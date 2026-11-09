import { wedding } from "@/content/wedding";
import { formatLongDate } from "@/lib/format";

export function invitationUrl(siteUrl: string, slug: string): string {
  const u = new URL(siteUrl);
  u.searchParams.set("to", slug);
  return u.toString();
}

export function invitationMessage(guestName: string, url: string): string {
  const { groom, bride } = wedding.couple;
  const date = formatLongDate(wedding.events[0].start);
  return [
    "Assalamu'alaikum Warahmatullahi Wabarakatuh",
    "",
    `Kepada Yth. ${guestName}`,
    "",
    "Tanpa mengurangi rasa hormat, perkenankan kami mengundang Bapak/Ibu/Saudara/i untuk hadir pada acara pernikahan kami:",
    "",
    `${groom.fullName} & ${bride.fullName}`,
    date,
    "",
    "Informasi lengkap & konfirmasi kehadiran:",
    url,
    "",
    "Merupakan suatu kehormatan apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.",
    "",
    "Wassalamu'alaikum Warahmatullahi Wabarakatuh",
    `${groom.nickname} & ${bride.nickname}`,
  ].join("\n");
}

export function whatsappLink(phone: string | null, message: string): string {
  const base = phone ? `https://wa.me/${phone}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(message)}`;
}
