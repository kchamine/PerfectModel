-- ============================================================
-- PerfectModel — Supabase Database Schema
-- Run this entire file in the Supabase SQL Editor to set up
-- your database from scratch.
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Profiles ────────────────────────────────────────────────
-- Extends Supabase auth.users with public profile info
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  bio           text,
  specialty_tags text[] default '{}',
  review_count  int default 0,
  created_at    timestamptz default now()
);

alter table profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on profiles for select using (true);

create policy "Users can update their own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();

-- ── Models ──────────────────────────────────────────────────
create table models (
  id               uuid primary key default uuid_generate_v4(),
  name             text not null,
  slug             text unique not null,
  provider         text not null,
  description      text,
  release_date     date,
  context_window   int,           -- tokens
  pricing_tier     text check (pricing_tier in ('free', 'freemium', 'paid', 'api-only', 'open-source')),
  pricing_note     text,          -- e.g. "$0.003/1k tokens"
  modalities       text[] default '{}', -- ['text','image','voice','code']
  is_api_available boolean default true,
  website_url      text,
  logo_url         text,
  -- Aggregate scores (updated via trigger when reviews change)
  score_output_quality      numeric(3,2) default 0,
  score_instruction         numeric(3,2) default 0,
  score_consistency         numeric(3,2) default 0,
  score_speed               numeric(3,2) default 0,
  score_cost                numeric(3,2) default 0,
  score_personality         numeric(3,2) default 0,
  score_use_case_fit        numeric(3,2) default 0,
  score_overall             numeric(3,2) default 0,
  review_count     int default 0,
  created_at       timestamptz default now(),
  updated_at       timestamptz default now()
);

alter table models enable row level security;

create policy "Models are viewable by everyone"
  on models for select using (true);

-- ── Model Versions ──────────────────────────────────────────
create table model_versions (
  id           uuid primary key default uuid_generate_v4(),
  model_id     uuid references models(id) on delete cascade,
  version_tag  text not null,   -- e.g. "gpt-4o-2024-11-20"
  released_at  date,
  notes        text,
  created_at   timestamptz default now()
);

alter table model_versions enable row level security;

create policy "Model versions are viewable by everyone"
  on model_versions for select using (true);

-- ── Reviews ─────────────────────────────────────────────────
create table reviews (
  id                    uuid primary key default uuid_generate_v4(),
  user_id               uuid references profiles(id) on delete cascade,
  model_id              uuid references models(id) on delete cascade,
  -- Required fields
  use_case_tag          text not null,  -- 'coding','writing','research','customer-support','analysis','other'
  summary               text not null,  -- 140-char max one-liner
  -- 7 dimensions (1–5 stars stored as integers)
  score_output_quality  int check (score_output_quality between 1 and 5),
  score_instruction     int check (score_instruction between 1 and 5),
  score_consistency     int check (score_consistency between 1 and 5),
  score_speed           int check (score_speed between 1 and 5),
  score_cost            int check (score_cost between 1 and 5),
  score_personality     int check (score_personality between 1 and 5),
  score_use_case_fit    int check (score_use_case_fit between 1 and 5),
  -- Optional per-dimension notes (free text)
  note_output_quality   text,
  note_instruction      text,
  note_consistency      text,
  note_speed            text,
  note_cost             text,
  note_personality      text,
  note_use_case_fit     text,
  -- Helpfulness votes
  helpful_count         int default 0,
  created_at            timestamptz default now(),
  -- One review per user per model
  unique(user_id, model_id)
);

alter table reviews enable row level security;

create policy "Reviews are viewable by everyone"
  on reviews for select using (true);

create policy "Authenticated users can create reviews"
  on reviews for insert with check (auth.uid() = user_id);

create policy "Users can update their own reviews"
  on reviews for update using (auth.uid() = user_id);

create policy "Users can delete their own reviews"
  on reviews for delete using (auth.uid() = user_id);

-- Recalculate model aggregate scores after any review change
create or replace function refresh_model_scores()
returns trigger language plpgsql security definer as $$
declare
  mid uuid;
begin
  mid := coalesce(new.model_id, old.model_id);
  update models
  set
    score_output_quality = (select coalesce(avg(score_output_quality),0) from reviews where model_id = mid),
    score_instruction    = (select coalesce(avg(score_instruction),0)    from reviews where model_id = mid),
    score_consistency    = (select coalesce(avg(score_consistency),0)    from reviews where model_id = mid),
    score_speed          = (select coalesce(avg(score_speed),0)          from reviews where model_id = mid),
    score_cost           = (select coalesce(avg(score_cost),0)           from reviews where model_id = mid),
    score_personality    = (select coalesce(avg(score_personality),0)    from reviews where model_id = mid),
    score_use_case_fit   = (select coalesce(avg(score_use_case_fit),0)   from reviews where model_id = mid),
    score_overall = (
      select coalesce(
        (avg(score_output_quality) + avg(score_instruction) + avg(score_consistency) +
         avg(score_speed) + avg(score_cost) + avg(score_personality) + avg(score_use_case_fit)) / 7,
        0
      )
      from reviews where model_id = mid
    ),
    review_count = (select count(*) from reviews where model_id = mid),
    updated_at   = now()
  where id = mid;
  return coalesce(new, old);
end;
$$;

create trigger on_review_change
  after insert or update or delete on reviews
  for each row execute procedure refresh_model_scores();

-- ── Lists ───────────────────────────────────────────────────
create table lists (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references profiles(id) on delete cascade,
  title       text not null,
  description text,
  is_public   boolean default true,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table lists enable row level security;

create policy "Public lists are viewable by everyone"
  on lists for select using (is_public = true or auth.uid() = user_id);

create policy "Authenticated users can create lists"
  on lists for insert with check (auth.uid() = user_id);

create policy "Users can update their own lists"
  on lists for update using (auth.uid() = user_id);

create policy "Users can delete their own lists"
  on lists for delete using (auth.uid() = user_id);

-- ── List ↔ Model join ────────────────────────────────────────
create table list_models (
  id         uuid primary key default uuid_generate_v4(),
  list_id    uuid references lists(id) on delete cascade,
  model_id   uuid references models(id) on delete cascade,
  sort_order int default 0,
  note       text,          -- optional per-model note on the list
  added_at   timestamptz default now(),
  unique(list_id, model_id)
);

alter table list_models enable row level security;

create policy "List models are viewable via list policy"
  on list_models for select using (
    exists (
      select 1 from lists
      where lists.id = list_id
        and (lists.is_public = true or lists.user_id = auth.uid())
    )
  );

create policy "List owners can manage their list models"
  on list_models for all using (
    exists (select 1 from lists where lists.id = list_id and lists.user_id = auth.uid())
  );

-- ── Helpful votes ────────────────────────────────────────────
create table review_helpful_votes (
  user_id   uuid references profiles(id) on delete cascade,
  review_id uuid references reviews(id) on delete cascade,
  primary key (user_id, review_id)
);

alter table review_helpful_votes enable row level security;

create policy "Helpful votes visible to all"
  on review_helpful_votes for select using (true);

create policy "Authenticated users can vote"
  on review_helpful_votes for insert with check (auth.uid() = user_id);

create policy "Users can remove their own votes"
  on review_helpful_votes for delete using (auth.uid() = user_id);

-- Update helpful_count on reviews when votes change
create or replace function refresh_helpful_count()
returns trigger language plpgsql security definer as $$
declare
  rid uuid;
begin
  rid := coalesce(new.review_id, old.review_id);
  update reviews
  set helpful_count = (select count(*) from review_helpful_votes where review_id = rid)
  where id = rid;
  return coalesce(new, old);
end;
$$;

create trigger on_helpful_vote_change
  after insert or delete on review_helpful_votes
  for each row execute procedure refresh_helpful_count();

-- ── Seed Data — Initial Models ───────────────────────────────
insert into models (name, slug, provider, description, release_date, context_window, pricing_tier, pricing_note, modalities, website_url) values
  ('GPT-4o', 'gpt-4o', 'OpenAI', 'OpenAI''s most capable and cost-efficient flagship model. Accepts text and image inputs.', '2024-05-13', 128000, 'paid', '$5/1M input tokens', ARRAY['text','image','voice'], 'https://openai.com/gpt-4o'),
  ('Claude 3.5 Sonnet', 'claude-3-5-sonnet', 'Anthropic', 'Anthropic''s highest-performing model to date — intelligent, fast, and great for complex tasks.', '2024-06-20', 200000, 'freemium', '$3/1M input tokens', ARRAY['text','image'], 'https://anthropic.com/claude'),
  ('Gemini 1.5 Pro', 'gemini-1-5-pro', 'Google DeepMind', 'Google''s most capable multimodal model with a breakthrough 1M token context window.', '2024-02-15', 1000000, 'paid', '$3.50/1M input tokens', ARRAY['text','image','video','audio'], 'https://deepmind.google/technologies/gemini'),
  ('Llama 3.1 70B', 'llama-3-1-70b', 'Meta', 'Meta''s open-source flagship. Strong reasoning, instruction-following, and multilingual support.', '2024-07-23', 128000, 'open-source', 'Free to self-host', ARRAY['text'], 'https://llama.meta.com'),
  ('Mistral Large', 'mistral-large', 'Mistral AI', 'Mistral''s top-tier model. Excellent for reasoning, code, and multilingual tasks.', '2024-02-26', 128000, 'paid', '$8/1M input tokens', ARRAY['text'], 'https://mistral.ai'),
  ('Grok-2', 'grok-2', 'xAI', 'xAI''s flagship model with real-time access to X/Twitter data. Strong reasoning and coding.', '2024-08-13', 131072, 'freemium', 'Included with X Premium+', ARRAY['text','image'], 'https://x.ai/grok'),
  ('Command R+', 'command-r-plus', 'Cohere', 'Cohere''s enterprise model optimised for RAG, tool use, and multi-step reasoning.', '2024-04-04', 128000, 'api-only', '$3/1M input tokens', ARRAY['text'], 'https://cohere.com/command');

-- ── Migration: Live Model Sync ────────────────────────────────
-- Run this in the Supabase SQL editor to enable automated sync from OpenRouter.
-- After running, set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY as GitHub
-- repository secrets, then trigger the sync-models workflow manually.
alter table models
  add column if not exists openrouter_id   text unique,
  add column if not exists is_active       boolean default true,
  add column if not exists expiration_date date;
