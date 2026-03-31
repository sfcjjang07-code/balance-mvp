# DB Phase 1

This phase moves shared public metrics to a database-friendly layer.

## Shared state that should be in DB
- visitor totals / today's visitors
- global topic view counts
- global topic vote counts
- choice A / choice B aggregate counts
- home top viewed / top picked sections

## State that can stay browser-local for now
- per-device daily vote lock
- "투표 완료" badge on the home screen
- admin draft form state

## Why admin publishing is not in phase 1
Publishing/hiding games globally should also move to DB, but that requires an admin authentication model first.
Without admin auth, public write endpoints for the catalog would be unsafe.

## Setup
1. Create a Supabase project.
2. Run `supabase/migrations/001_db_phase1.sql` in the SQL editor.
3. Copy `.env.example` to `.env.local` and fill in the values.
4. Restart the dev server.

If env vars are missing, the app still works using the current file-based runtime stores.
