-- Fix payment table to match Payment entity

-- Rename transaction column to transaction_id
ALTER TABLE payment RENAME COLUMN transaction TO transaction_id;

-- Add missing amount column
ALTER TABLE payment ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- Add missing payment_status column
ALTER TABLE payment ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING';

-- Update payment_method to match enum values
UPDATE payment SET payment_method = 'VNPAY' WHERE payment_method IS NULL OR payment_method = '';
