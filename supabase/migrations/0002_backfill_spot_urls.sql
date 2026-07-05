-- Backfills missing Instagram/website links for existing spots.
--
-- Every UPDATE below is guarded with `and (url is null or url = '')`, so it
-- can only ever fill in a blank — it will never overwrite a url that's
-- already on file, even if it differs from what's below. Matches are by
-- exact name, so a spot that's been renamed since this was written simply
-- won't match and nothing happens (safe no-op, not an error).
--
-- Sources checked via web search on 2026-07-05 — Singapore-specific results
-- cross-referenced against each spot's category/location already in the
-- app to avoid grabbing an unrelated same-named business elsewhere.

update spots set url = 'https://www.instagram.com/ahtasmuffins/'
  where name = 'Ah Tas Muffins' and (url is null or url = '');

update spots set url = 'https://www.instagram.com/auntiepengbananapie/'
  where name = 'Auntie Peng Banana Pie' and (url is null or url = '');

update spots set url = 'https://www.facebook.com/balmoralbakery/'
  where name = 'Balmoral Bakery' and (url is null or url = '');

update spots set url = 'https://www.instagram.com/crius_bake/'
  where name = 'C''rius Bake' and (url is null or url = '');

update spots set url = 'https://www.instagram.com/fredosbakery/'
  where name = 'Fredo''s' and (url is null or url = '');

update spots set url = 'https://newdelibakery.com/'
  where name = 'New Deli' and (url is null or url = '');

update spots set url = 'https://pawabakery.com/'
  where name = 'Pawa Bakery' and (url is null or url = '');

update spots set url = 'https://www.instagram.com/samedays.coffee/'
  where name = 'Same Days Coffee Stand' and (url is null or url = '');

update spots set url = 'https://www.instagram.com/springcoffee.sg/'
  where name = 'Spring Coffee' and (url is null or url = '');

-- MEDIUM CONFIDENCE — "On Lee's" in the app doesn't exactly match the
-- business name found (On'Lee Artisan Bakery), though category (halal
-- café) lines up. Confirm this is the right business before running —
-- uncomment the two lines below once you have.
-- update spots set url = 'https://onleebakery.sg/'
--   where name = 'On Lee''s' and (url is null or url = '');

-- NOT FOUND — no confident match, left blank rather than guessing:
--   Rotitiam, SL II, The Freshly Baked

-- Verify what changed:
select name, url from spots
where name in (
  'Ah Tas Muffins','Auntie Peng Banana Pie','Balmoral Bakery','C''rius Bake',
  'Fredo''s','New Deli','Pawa Bakery','Same Days Coffee Stand','Spring Coffee',
  'On Lee''s','Rotitiam','SL II','The Freshly Baked'
)
order by name;
