-- ============================================================================
-- Migration: Add email column to users table
-- Version: V2
-- Description: Add email field to users table with unique constraint
-- ============================================================================

-- Add email column (nullable first to allow existing data)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Update existing users with default email based on username
UPDATE users SET email = CONCAT(user_name, '@gearflow.local') WHERE email IS NULL;

-- Make email NOT NULL after populating
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Add unique constraint on email
ALTER TABLE users ADD CONSTRAINT uk_users_email UNIQUE (email);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Update sample users with proper emails
UPDATE users SET email = 'user@gearflow.com' WHERE user_name = 'sampleuser1';
UPDATE users SET email = 'admin@gearflow.com' WHERE user_name = 'sampleadmin1';
