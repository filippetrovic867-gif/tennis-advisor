-- Tennis Balls Unified Schema for Supabase Postgres
-- Run this script in Supabase SQL Editor

-- STEP A — EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- STEP B — ENUM TYPES
DO $$ BEGIN
  CREATE TYPE ball_category AS ENUM ('foam','red','orange','green','yellow');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE player_level AS ENUM ('beginner','intermediate','advanced');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE court_surface AS ENUM ('hard','clay','grass','carpet');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE play_style AS ENUM ('defensive','neutral','offensive','aggressive','baseline','topspin','control','all_round','long_rallies','durability','high_bounce');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- STEP C — TABLES
CREATE TABLE IF NOT EXISTS tennis_balls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand text NOT NULL,
  model text NOT NULL,
  display_name text NOT NULL,
  category ball_category NOT NULL,
  age_min int NOT NULL,
  age_max int NULL,
  description text NOT NULL,
  priority_rank int NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ball_levels (
  ball_id uuid NOT NULL REFERENCES tennis_balls(id) ON DELETE CASCADE,
  level player_level NOT NULL,
  PRIMARY KEY (ball_id, level)
);

CREATE TABLE IF NOT EXISTS ball_surfaces (
  ball_id uuid NOT NULL REFERENCES tennis_balls(id) ON DELETE CASCADE,
  surface court_surface NOT NULL,
  PRIMARY KEY (ball_id, surface)
);

CREATE TABLE IF NOT EXISTS ball_styles (
  ball_id uuid NOT NULL REFERENCES tennis_balls(id) ON DELETE CASCADE,
  style play_style NOT NULL,
  PRIMARY KEY (ball_id, style)
);

CREATE TABLE IF NOT EXISTS ball_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ball_id uuid NOT NULL REFERENCES tennis_balls(id) ON DELETE CASCADE,
  link_type text NOT NULL CHECK (link_type IN ('store','youtube')),
  url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- STEP E — INDEXES
CREATE INDEX IF NOT EXISTS idx_tennis_balls_category ON tennis_balls(category);
CREATE INDEX IF NOT EXISTS idx_ball_levels_level ON ball_levels(level);
CREATE INDEX IF NOT EXISTS idx_ball_surfaces_surface ON ball_surfaces(surface);
