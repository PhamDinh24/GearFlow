-- ============================================================================
-- GearFlow Sample Data Migration (Fixed)
-- Adds 20-30 sample records per table without duplicating existing data
-- Orders dated between 2026-03-30 and 2026-04-01
-- ============================================================================

-- Insert test users with specific IDs (will be used for orders)
-- Password is 'password123' hashed with BCrypt
INSERT INTO users (user_id, user_name, password, phone, address, role, created_at, updated_at) VALUES
('user-test-001', 'sampleuser1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0123456789', 'Hanoi, Vietnam', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-admin-001', 'sampleadmin1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0987654321', 'Hanoi, Vietnam', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (user_name) DO NOTHING;

-- Insert additional brands (20 total including existing 4)
INSERT INTO brands (brands_id, brands_name, description, created_at) VALUES
('brand-005', 'Corsair', 'Gaming peripherals and keyboards', CURRENT_TIMESTAMP),
('brand-006', 'Razer', 'Gaming hardware and accessories', CURRENT_TIMESTAMP),
('brand-007', 'Logitech', 'Computer peripherals and accessories', CURRENT_TIMESTAMP),
('brand-008', 'SteelSeries', 'Gaming equipment and accessories', CURRENT_TIMESTAMP),
('brand-009', 'HyperX', 'Gaming keyboards and peripherals', CURRENT_TIMESTAMP),
('brand-010', 'ASUS ROG', 'Republic of Gamers peripherals', CURRENT_TIMESTAMP),
('brand-011', 'Cooler Master', 'PC components and peripherals', CURRENT_TIMESTAMP),
('brand-012', 'Glorious', 'Gaming keyboards and mice', CURRENT_TIMESTAMP),
('brand-013', 'Drop', 'Mechanical keyboard enthusiast brand', CURRENT_TIMESTAMP),
('brand-014', 'GMMK', 'Modular mechanical keyboards', CURRENT_TIMESTAMP),
('brand-015', 'Akko', 'Affordable mechanical keyboards', CURRENT_TIMESTAMP),
('brand-016', 'Royal Kludge', 'Budget mechanical keyboards', CURRENT_TIMESTAMP),
('brand-017', 'Epomaker', 'Custom mechanical keyboards', CURRENT_TIMESTAMP),
('brand-018', 'NuPhy', 'Low-profile mechanical keyboards', CURRENT_TIMESTAMP),
('brand-019', 'Keydous', 'Innovative keyboard designs', CURRENT_TIMESTAMP),
('brand-020', 'Womier', 'RGB mechanical keyboards', CURRENT_TIMESTAMP)
ON CONFLICT (brands_name) DO NOTHING;

-- Insert additional categories (10 total including existing 3)
INSERT INTO categories (categories_id, categories_name, description, created_at) VALUES
('cat-004', 'Wireless Keyboards', 'Wireless and Bluetooth keyboards', CURRENT_TIMESTAMP),
('cat-005', 'Compact Keyboards', '60% and 65% layout keyboards', CURRENT_TIMESTAMP),
('cat-006', 'Full-Size Keyboards', '100% layout keyboards', CURRENT_TIMESTAMP),
('cat-007', 'TKL Keyboards', 'Tenkeyless keyboards', CURRENT_TIMESTAMP),
('cat-008', 'Custom Keyboards', 'DIY and custom build keyboards', CURRENT_TIMESTAMP),
('cat-009', 'Low-Profile Keyboards', 'Slim and portable keyboards', CURRENT_TIMESTAMP),
('cat-010', 'Ergonomic Keyboards', 'Split and ergonomic designs', CURRENT_TIMESTAMP)
ON CONFLICT (categories_name) DO NOTHING;


-- Insert additional products (30 total including existing 5)
INSERT INTO products (product_id, categories_id, brands_id, product_name, description, base_price, support, image, created_at, updated_at) VALUES
('prod-006', 'cat-002', 'brand-005', 'Corsair K70 RGB', 'Full-size mechanical gaming keyboard with Cherry MX switches', 1590000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-007', 'cat-002', 'brand-006', 'Razer BlackWidow V3', 'Mechanical gaming keyboard with Razer Green switches', 1390000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-008', 'cat-003', 'brand-007', 'Logitech MX Keys', 'Wireless illuminated keyboard for professionals', 1190000.00, 'Windows, Mac, Linux', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-009', 'cat-002', 'brand-008', 'SteelSeries Apex Pro', 'Adjustable mechanical gaming keyboard', 1890000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-010', 'cat-002', 'brand-009', 'HyperX Alloy FPS Pro', 'Compact TKL mechanical gaming keyboard', 990000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-011', 'cat-002', 'brand-010', 'ASUS ROG Strix Scope', 'Mechanical gaming keyboard with Cherry MX switches', 1290000.00, 'Windows', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-012', 'cat-001', 'brand-011', 'Cooler Master CK530', 'TKL mechanical keyboard with RGB', 890000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-013', 'cat-001', 'brand-012', 'Glorious GMMK Pro', 'Premium custom mechanical keyboard', 1690000.00, 'Windows, Mac, Linux', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-014', 'cat-005', 'brand-013', 'Drop ALT', 'Compact 65% mechanical keyboard', 1490000.00, 'Windows, Mac, Linux', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-015', 'cat-005', 'brand-014', 'GMMK Compact', 'Hot-swappable 60% keyboard', 790000.00, 'Windows, Mac, Linux', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-016', 'cat-001', 'brand-015', 'Akko 3068B', 'Wireless 65% mechanical keyboard', 690000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-017', 'cat-004', 'brand-016', 'Royal Kludge RK84', 'Wireless 75% mechanical keyboard', 590000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-018', 'cat-008', 'brand-017', 'Epomaker GK96S', 'Hot-swappable 96% keyboard', 890000.00, 'Windows, Mac, Linux', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-019', 'cat-009', 'brand-018', 'NuPhy Air75', 'Ultra-slim wireless mechanical keyboard', 1190000.00, 'Windows, Mac, iOS', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-020', 'cat-001', 'brand-019', 'Keydous NJ80', 'Wireless 75% mechanical keyboard', 790000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-021', 'cat-002', 'brand-020', 'Womier K87', 'TKL RGB mechanical keyboard', 690000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-022', 'cat-001', 'brand-001', 'Keychron Q1', 'Premium custom mechanical keyboard', 1890000.00, 'Windows, Mac, Linux', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-023', 'cat-005', 'brand-002', 'Ducky One 3 Mini', 'Compact 60% mechanical keyboard', 1290000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-024', 'cat-007', 'brand-003', 'Leopold FC750R', 'TKL mechanical keyboard', 1390000.00, 'Windows, Mac, Linux', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-025', 'cat-001', 'brand-004', 'Varmilo MA108M', 'Full-size mechanical keyboard', 1590000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-026', 'cat-004', 'brand-005', 'Corsair K63 Wireless', 'Wireless mechanical gaming keyboard', 1290000.00, 'Windows', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-027', 'cat-002', 'brand-006', 'Razer Huntsman Mini', 'Compact 60% optical keyboard', 1190000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-028', 'cat-003', 'brand-007', 'Logitech G915 TKL', 'Wireless low-profile gaming keyboard', 1790000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-029', 'cat-010', 'brand-011', 'Cooler Master Ergo L', 'Ergonomic split keyboard', 1490000.00, 'Windows, Mac, Linux', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-030', 'cat-008', 'brand-012', 'Glorious GMMK 2', 'Pre-built custom mechanical keyboard', 1390000.00, 'Windows, Mac, Linux', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (product_id) DO NOTHING;


-- Insert product variants (just first 20 for brevity)
INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at) VALUES
('var-013', 'prod-006', 'Cherry MX Red', 'Black', 'Standard', 'Wired', 0.00, CURRENT_TIMESTAMP),
('var-014', 'prod-006', 'Cherry MX Brown', 'Silver', 'Standard', 'Wired', 50000.00, CURRENT_TIMESTAMP),
('var-015', 'prod-007', 'Razer Green', 'Black', 'Standard', 'Wired', 0.00, CURRENT_TIMESTAMP),
('var-016', 'prod-007', 'Razer Yellow', 'Black', 'RGB', 'Wired', 50000.00, CURRENT_TIMESTAMP),
('var-017', 'prod-008', 'Logitech Tactile', 'Gray', 'Standard', 'Wireless', 0.00, CURRENT_TIMESTAMP),
('var-018', 'prod-008', 'Logitech Tactile', 'Black', 'Standard', 'Wireless', 50000.00, CURRENT_TIMESTAMP),
('var-019', 'prod-009', 'OmniPoint Adjustable', 'Black', 'Standard', 'Wired', 0.00, CURRENT_TIMESTAMP),
('var-020', 'prod-009', 'OmniPoint Adjustable', 'White', 'RGB', 'Wired', 100000.00, CURRENT_TIMESTAMP),
('var-021', 'prod-010', 'Cherry MX Red', 'Black', 'Standard', 'Wired', 0.00, CURRENT_TIMESTAMP),
('var-022', 'prod-010', 'Cherry MX Blue', 'Black', 'Standard', 'Wired', 50000.00, CURRENT_TIMESTAMP),
('var-023', 'prod-011', 'Cherry MX Red', 'Black', 'RGB', 'Wired', 0.00, CURRENT_TIMESTAMP),
('var-024', 'prod-011', 'Cherry MX Brown', 'Black', 'RGB', 'Wired', 50000.00, CURRENT_TIMESTAMP),
('var-025', 'prod-012', 'Gateron Red', 'Black', 'RGB', 'Wired', 0.00, CURRENT_TIMESTAMP),
('var-026', 'prod-012', 'Gateron Brown', 'White', 'RGB', 'Wired', 50000.00, CURRENT_TIMESTAMP),
('var-027', 'prod-013', 'Glorious Panda', 'Black', 'Custom', 'Wired', 0.00, CURRENT_TIMESTAMP),
('var-028', 'prod-013', 'Glorious Lynx', 'White', 'Custom', 'Wired', 100000.00, CURRENT_TIMESTAMP),
('var-029', 'prod-014', 'Halo True', 'Black', 'Standard', 'Wired', 0.00, CURRENT_TIMESTAMP),
('var-030', 'prod-014', 'Halo Clear', 'Silver', 'Standard', 'Wired', 50000.00, CURRENT_TIMESTAMP),
('var-031', 'prod-015', 'Gateron Yellow', 'Black', 'Standard', 'Wired', 0.00, CURRENT_TIMESTAMP),
('var-032', 'prod-015', 'Gateron Red', 'White', 'RGB', 'Wired', 50000.00, CURRENT_TIMESTAMP)
ON CONFLICT (pro_variant_id) DO NOTHING;

-- Insert stock for new variants
INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at) VALUES
('var-013', 45, 0, CURRENT_TIMESTAMP), ('var-014', 40, 0, CURRENT_TIMESTAMP),
('var-015', 50, 0, CURRENT_TIMESTAMP), ('var-016', 45, 0, CURRENT_TIMESTAMP),
('var-017', 55, 0, CURRENT_TIMESTAMP), ('var-018', 50, 0, CURRENT_TIMESTAMP),
('var-019', 30, 0, CURRENT_TIMESTAMP), ('var-020', 25, 0, CURRENT_TIMESTAMP),
('var-021', 60, 0, CURRENT_TIMESTAMP), ('var-022', 55, 0, CURRENT_TIMESTAMP),
('var-023', 40, 0, CURRENT_TIMESTAMP), ('var-024', 35, 0, CURRENT_TIMESTAMP),
('var-025', 50, 0, CURRENT_TIMESTAMP), ('var-026', 45, 0, CURRENT_TIMESTAMP),
('var-027', 25, 0, CURRENT_TIMESTAMP), ('var-028', 20, 0, CURRENT_TIMESTAMP),
('var-029', 35, 0, CURRENT_TIMESTAMP), ('var-030', 30, 0, CURRENT_TIMESTAMP),
('var-031', 55, 0, CURRENT_TIMESTAMP), ('var-032', 50, 0, CURRENT_TIMESTAMP)
ON CONFLICT (pro_variant_id) DO NOTHING;

