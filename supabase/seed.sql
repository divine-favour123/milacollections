-- Optional starter categories. Run once in the SQL Editor, then edit or delete them from Admin → Categories.
insert into public.categories (name, slug, description, sort_order) values
  ('Chains',        'chains',        'Cuban links, ropes, tennis chains and more.',                 1),
  ('Necklaces',     'necklaces',     'Necklaces to wear every day or to stand out.',                2),
  ('Pendants',      'pendants',      'Pendants in gold and silver finishes.',                       3),
  ('Ice pendants',  'ice-pendants',  'Iced-out pendants that catch the light.',                     4),
  ('Photo pendants','photo-pendants','Send us your photo and we make it into a pendant.',           5)
on conflict (slug) do nothing;
