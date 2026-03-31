-- Insert sample data for testing

-- Insert categories (only if not exists)
INSERT INTO categories (categories_id, categories_name, description, created_at)
SELECT 'cat-001', 'Mechanical Keyboards', 'High-quality mechanical keyboards', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE categories_id = 'cat-001');

INSERT INTO categories (categories_id, categories_name, description, created_at)
SELECT 'cat-002', 'Gaming Keyboards', 'Gaming keyboards', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE categories_id = 'cat-002');

INSERT INTO categories (categories_id, categories_name, description, created_at)
SELECT 'cat-003', 'Office Keyboards', 'Office keyboards', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE categories_id = 'cat-003');

-- Insert brands (only if not exists)
INSERT INTO brands (brands_id, brands_name, description, created_at)
SELECT 'brand-001', 'Keychron', 'Premium mechanical keyboards', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE brands_id = 'brand-001');

INSERT INTO brands (brands_id, brands_name, description, created_at)
SELECT 'brand-002', 'Ducky', 'High-end gaming keyboards', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE brands_id = 'brand-002');

INSERT INTO brands (brands_id, brands_name, description, created_at)
SELECT 'brand-003', 'Leopold', 'Professional keyboards', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE brands_id = 'brand-003');

INSERT INTO brands (brands_id, brands_name, description, created_at)
SELECT 'brand-004', 'Varmilo', 'Custom keyboards', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM brands WHERE brands_id = 'brand-004');

-- Insert products (only if not exists)
INSERT INTO products (product_id, categories_id, brands_id, product_name, description, base_price, support, image, created_at, updated_at)
SELECT 'prod-001', 'cat-001', 'brand-001', 'Keychron K2 V2', 'Compact 75% wireless mechanical keyboard with RGB backlight', 89.00, 'Windows, Mac, Linux', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_id = 'prod-001');

INSERT INTO products (product_id, categories_id, brands_id, product_name, description, base_price, support, image, created_at, updated_at)
SELECT 'prod-002', 'cat-002', 'brand-002', 'Ducky One 2 Mini', '60% mechanical gaming keyboard with Cherry MX switches', 119.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_id = 'prod-002');

INSERT INTO products (product_id, categories_id, brands_id, product_name, description, base_price, support, image, created_at, updated_at)
SELECT 'prod-003', 'cat-001', 'brand-003', 'Leopold FC660M', 'Compact 65% mechanical keyboard for professionals', 129.00, 'Windows, Mac, Linux', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_id = 'prod-003');

INSERT INTO products (product_id, categories_id, brands_id, product_name, description, base_price, support, image, created_at, updated_at)
SELECT 'prod-004', 'cat-002', 'brand-004', 'Varmilo VA87M', 'TKL mechanical keyboard with custom keycaps', 149.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_id = 'prod-004');

INSERT INTO products (product_id, categories_id, brands_id, product_name, description, base_price, support, image, created_at, updated_at)
SELECT 'prod-005', 'cat-003', 'brand-001', 'Keychron K8', 'Full-size wireless mechanical keyboard', 99.00, 'Windows, Mac, Linux, iOS, Android', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM products WHERE product_id = 'prod-005');

-- Insert product variants (only if not exists)
INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at)
SELECT 'var-001', 'prod-001', 'Gateron Brown', 'White', 'Standard', 'Wireless', 0.00, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_variants WHERE pro_variant_id = 'var-001');

INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at)
SELECT 'var-002', 'prod-001', 'Gateron Red', 'Black', 'Standard', 'Wireless', 5.00, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_variants WHERE pro_variant_id = 'var-002');

INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at)
SELECT 'var-003', 'prod-001', 'Gateron Blue', 'White', 'RGB', 'Wireless', 10.00, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_variants WHERE pro_variant_id = 'var-003');

INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at)
SELECT 'var-004', 'prod-002', 'Cherry MX Brown', 'Black', 'Standard', 'Wired', 0.00, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_variants WHERE pro_variant_id = 'var-004');

INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at)
SELECT 'var-005', 'prod-002', 'Cherry MX Red', 'White', 'Standard', 'Wired', 5.00, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_variants WHERE pro_variant_id = 'var-005');

INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at)
SELECT 'var-006', 'prod-002', 'Cherry MX Blue', 'Black', 'RGB', 'Wired', 10.00, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_variants WHERE pro_variant_id = 'var-006');

INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at)
SELECT 'var-007', 'prod-003', 'Cherry MX Silent Red', 'Gray', 'PBT', 'Wired', 0.00, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_variants WHERE pro_variant_id = 'var-007');

INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at)
SELECT 'var-008', 'prod-003', 'Cherry MX Brown', 'Black', 'PBT', 'Wired', 5.00, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_variants WHERE pro_variant_id = 'var-008');

INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at)
SELECT 'var-009', 'prod-004', 'Cherry MX Brown', 'Sakura', 'Custom', 'Wired', 0.00, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_variants WHERE pro_variant_id = 'var-009');

INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at)
SELECT 'var-010', 'prod-004', 'Cherry MX Red', 'Sea Melody', 'Custom', 'Wired', 10.00, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_variants WHERE pro_variant_id = 'var-010');

INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at)
SELECT 'var-011', 'prod-005', 'Gateron Brown', 'White', 'Standard', 'Wireless', 0.00, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_variants WHERE pro_variant_id = 'var-011');

INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at)
SELECT 'var-012', 'prod-005', 'Gateron Red', 'Black', 'RGB', 'Wireless', 10.00, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_variants WHERE pro_variant_id = 'var-012');

-- Insert stock for variants (only if not exists)
INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at)
SELECT 'var-001', 50, 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM stock WHERE pro_variant_id = 'var-001');

INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at)
SELECT 'var-002', 45, 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM stock WHERE pro_variant_id = 'var-002');

INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at)
SELECT 'var-003', 30, 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM stock WHERE pro_variant_id = 'var-003');

INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at)
SELECT 'var-004', 60, 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM stock WHERE pro_variant_id = 'var-004');

INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at)
SELECT 'var-005', 55, 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM stock WHERE pro_variant_id = 'var-005');

INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at)
SELECT 'var-006', 40, 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM stock WHERE pro_variant_id = 'var-006');

INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at)
SELECT 'var-007', 35, 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM stock WHERE pro_variant_id = 'var-007');

INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at)
SELECT 'var-008', 40, 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM stock WHERE pro_variant_id = 'var-008');

INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at)
SELECT 'var-009', 25, 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM stock WHERE pro_variant_id = 'var-009');

INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at)
SELECT 'var-010', 20, 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM stock WHERE pro_variant_id = 'var-010');

INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at)
SELECT 'var-011', 50, 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM stock WHERE pro_variant_id = 'var-011');

INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at)
SELECT 'var-012', 45, 0, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM stock WHERE pro_variant_id = 'var-012');

-- Insert product attributes (only if not exists)
INSERT INTO product_attributes (attr_id, product_id, attr_name, attr_value, created_at)
SELECT 'attr-001', 'prod-001', 'Layout', '75%', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_attributes WHERE attr_id = 'attr-001');

INSERT INTO product_attributes (attr_id, product_id, attr_name, attr_value, created_at)
SELECT 'attr-002', 'prod-001', 'Connectivity', 'Wireless + Wired', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_attributes WHERE attr_id = 'attr-002');

INSERT INTO product_attributes (attr_id, product_id, attr_name, attr_value, created_at)
SELECT 'attr-003', 'prod-001', 'Battery', '4000mAh', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_attributes WHERE attr_id = 'attr-003');

INSERT INTO product_attributes (attr_id, product_id, attr_name, attr_value, created_at)
SELECT 'attr-004', 'prod-002', 'Layout', '60%', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_attributes WHERE attr_id = 'attr-004');

INSERT INTO product_attributes (attr_id, product_id, attr_name, attr_value, created_at)
SELECT 'attr-005', 'prod-002', 'Connectivity', 'Wired', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_attributes WHERE attr_id = 'attr-005');

INSERT INTO product_attributes (attr_id, product_id, attr_name, attr_value, created_at)
SELECT 'attr-006', 'prod-003', 'Layout', '65%', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_attributes WHERE attr_id = 'attr-006');

INSERT INTO product_attributes (attr_id, product_id, attr_name, attr_value, created_at)
SELECT 'attr-007', 'prod-003', 'Build Quality', 'PBT Keycaps', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_attributes WHERE attr_id = 'attr-007');

INSERT INTO product_attributes (attr_id, product_id, attr_name, attr_value, created_at)
SELECT 'attr-008', 'prod-004', 'Layout', 'TKL', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_attributes WHERE attr_id = 'attr-008');

INSERT INTO product_attributes (attr_id, product_id, attr_name, attr_value, created_at)
SELECT 'attr-009', 'prod-004', 'Keycaps', 'Custom Dye-Sub', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_attributes WHERE attr_id = 'attr-009');

INSERT INTO product_attributes (attr_id, product_id, attr_name, attr_value, created_at)
SELECT 'attr-010', 'prod-005', 'Layout', 'Full-size', CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM product_attributes WHERE attr_id = 'attr-010');
