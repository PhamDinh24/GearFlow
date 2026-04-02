-- Add image_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS image_url VARCHAR(500);
