-- Add vnpay_ref column to payment table for VNPay transaction reference tracking
ALTER TABLE payment ADD COLUMN vnpay_ref VARCHAR(64) UNIQUE;

-- Create index for faster lookups by vnpay_ref
CREATE INDEX idx_payment_vnpay_ref ON payment(vnpay_ref);
