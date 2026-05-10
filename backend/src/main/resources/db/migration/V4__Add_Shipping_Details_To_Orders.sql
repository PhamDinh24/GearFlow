-- Add missing shipping detail columns to orders table
ALTER TABLE orders 
ADD COLUMN shipping_full_name VARCHAR(255),
ADD COLUMN shipping_email VARCHAR(255),
ADD COLUMN shipping_ward VARCHAR(100),
ADD COLUMN shipping_district VARCHAR(100);

COMMENT ON COLUMN orders.shipping_full_name IS 'Họ tên người nhận hàng';
COMMENT ON COLUMN orders.shipping_email IS 'Email liên hệ nhận hàng';
COMMENT ON COLUMN orders.shipping_ward IS 'Phường/Xã giao hàng';
COMMENT ON COLUMN orders.shipping_district IS 'Quận/Huyện giao hàng';
