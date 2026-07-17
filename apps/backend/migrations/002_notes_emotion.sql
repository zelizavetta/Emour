-- Adds the required `emotion` column to notes.
-- Emotion values: joy | calm | gratitude (positive)
--                 sadness | anxiety | anger | fatigue | fear (negative)
-- Existing rows default to 'calm' so they satisfy the NOT NULL constraint.
ALTER TABLE notes
    ADD COLUMN IF NOT EXISTS emotion TEXT NOT NULL DEFAULT 'calm';
