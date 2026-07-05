-- Hardens the `spots` table against direct client-side writes.
--
-- Before this migration, `spots` had two permissive UPDATE policies
-- ("Update spots" and "Anyone can update spots for MVP"), both with
-- `USING (true)` and no `WITH CHECK`. Postgres OR's multiple permissive
-- policies together, so either one alone made every column of every row
-- writable by anyone with the public anon key — including `wins`/`losses`,
-- which the app relied on for its voting and rankings. Anyone could set a
-- spot's win count to an arbitrary value with a single REST call, no login
-- required, bypassing the app entirely.
--
-- This migration moves the two legitimate write paths that used that open
-- policy — casting a vote, and recomputing a spot's review aggregate —
-- into narrow SECURITY DEFINER functions that do exactly one thing each,
-- then drops the open policies so no other column can be rewritten this
-- way. SECURITY DEFINER functions run with the privileges of the function
-- owner (which owns `spots`), so they keep working correctly with no
-- UPDATE policy on the table at all.
--
-- NOTE: `id` is assumed to be bigint (Supabase's default identity type).
-- Adjust the parameter/column types below if your `spots.id` is a uuid or
-- plain integer instead.
--
-- Run this in the Supabase SQL Editor (or `supabase db push` if you use
-- the CLI locally). It does not touch any table structure or existing
-- data, only policies and functions.

-- ── 1. Atomic vote: +1 win (and +1 weekly_wins) for the winner, +1 loss
--        for the loser. Nothing else is writable through this path.
create or replace function public.cast_vote(p_winner_id bigint, p_loser_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_winner_id is null or p_loser_id is null or p_winner_id = p_loser_id then
    raise exception 'cast_vote: winner and loser must both be provided and different';
  end if;

  update spots
    set wins = wins + 1,
        weekly_wins = coalesce(weekly_wins, 0) + 1
    where id = p_winner_id;

  update spots
    set losses = losses + 1
    where id = p_loser_id;
end;
$$;

revoke all on function public.cast_vote(bigint, bigint) from public;
grant execute on function public.cast_vote(bigint, bigint) to anon, authenticated;

-- ── 2. Atomic review aggregate: recompute stars_total/star_count for a
--        spot directly from its reviews, instead of the app doing a
--        select-then-update from the client (racy, and depended on the
--        open UPDATE policy this migration removes).
create or replace function public.recompute_spot_rating(p_spot_id bigint)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update spots s
    set stars_total = coalesce(agg.total, 0),
        star_count  = coalesce(agg.cnt, 0)
  from (
    select spot_id, sum(stars) as total, count(*) as cnt
    from reviews
    where spot_id = p_spot_id
    group by spot_id
  ) agg
  where s.id = p_spot_id
    and agg.spot_id = p_spot_id;
end;
$$;

revoke all on function public.recompute_spot_rating(bigint) from public;
grant execute on function public.recompute_spot_rating(bigint) to anon, authenticated;

-- Recompute automatically whenever a review is added, so the app's own
-- (now-redundant) client-side update call is no longer load-bearing.
create or replace function public.trg_recompute_spot_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.recompute_spot_rating(new.spot_id);
  return new;
end;
$$;

drop trigger if exists reviews_recompute_rating on public.reviews;
create trigger reviews_recompute_rating
  after insert on public.reviews
  for each row
  execute function public.trg_recompute_spot_rating();

-- ── 3. Close the open door: remove both permissive UPDATE policies.
--        No replacement UPDATE policy is added — every legitimate write
--        to `spots` now goes through a SECURITY DEFINER function instead.
drop policy if exists "Update spots" on public.spots;
drop policy if exists "Anyone can update spots for MVP" on public.spots;

-- NOTE: the app's suggest-an-edit and flag-listing features (submitEdit /
-- flagListing in App.jsx) also relied on this open UPDATE policy. They
-- have no UI entry point in the app today, so nothing observable breaks —
-- but if a future "spot detail page" brings them back, they'll need their
-- own narrow SECURITY DEFINER functions the same way, not a reopened
-- blanket UPDATE policy.
