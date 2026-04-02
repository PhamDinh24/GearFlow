-- Add shipping information columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address VARCHAR(500);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_postal_code VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(50);

-- Add comment
COMMENT ON COLUMN orders.shipping_address IS 'Full shipping address for the order';
COMMENT ON COLUMN orders.shipping_city IS 'Shipping city';
COMMENT ON COLUMN orders.shipping_postal_code IS 'Shipping postal code';
COMMENT ON COLUMN orders.shipping_phone IS 'Shipping contact phone';
