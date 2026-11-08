-- Fixes the notes.created_at_client column type.
-- It was mistakenly created as `time with time zone` (time-of-day only), but the
-- app sends a full ISO timestamp (e.g. 2026-07-17T21:13:41.000Z), matching the
-- `timestamptz` type used by feelings/meds. A direct timetz->timestamptz cast is
-- not possible (old values have no date), and those rows are throwaway test data,
-- so the column is recreated. Existing rows get now() as their client timestamp.
ALTER TABLE notes DROP COLUMN IF EXISTS created_at_client;
ALTER TABLE notes ADD COLUMN created_at_client timestamptz NOT NULL DEFAULT now();
