-- Data contoh untuk pengembangan lokal / staging. JANGAN dijalankan di produksi.
insert into public.guests (slug, display_name, max_pax) values
  ('budi-santoso-x7k2', 'Bapak Budi Santoso', 2),
  ('keluarga-hartono-p9m4', 'Keluarga Bapak Hartono', 4),
  ('sari-wulandari-q2n8', 'Sari Wulandari', 1)
on conflict (slug) do nothing;
