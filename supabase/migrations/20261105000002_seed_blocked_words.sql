-- Kamus awal kata kasar (Indonesia, daerah umum, dan Inggris). Admin dapat menambah/menghapus via dashboard.
-- Pencocokan memakai batas kata, jadi "pantai" tidak terkena "tai" dan "masuk" tidak terkena "asu".
insert into public.blocked_words (word) values
  ('anjing'), ('anjir'), ('anjrit'), ('asu'), ('babi'), ('bajingan'), ('bangsat'), ('bego'),
  ('brengsek'), ('budeg'), ('cebong'), ('kampret'), ('kadrun'), ('keparat'), ('goblok'), ('goblog'),
  ('idiot'), ('jancok'), ('jancuk'), ('cok'), ('jembut'), ('kontol'), ('memek'), ('ngentot'),
  ('entot'), ('pantek'), ('pepek'), ('perek'), ('lonte'), ('pelacur'), ('sundal'), ('tai'),
  ('taik'), ('tolol'), ('dongo'), ('bodoh'), ('sialan'), ('setan'), ('iblis'), ('bacot'),
  ('fuck'), ('fucking'), ('shit'), ('bitch'), ('bastard'), ('asshole'), ('dick'), ('pussy')
on conflict (word) do nothing;
