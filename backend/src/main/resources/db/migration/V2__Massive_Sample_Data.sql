-- ============================================================================
-- GearFlow Massive Sample Data Migration
-- Adds 20-30 records to each core table
-- Orders are specifically between 2026-04-10 and 2026-05-15
-- ============================================================================

-- 1. Additional Users (20 more to reach ~32)
INSERT INTO users (user_id, user_name, password, email, phone, address, role, created_at, updated_at) VALUES
('user-m-001', 'user_alpha', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'alpha@gearflow.vn', '0900000001', '12 Lê Lợi, Quận 1, HCM', 'USER', '2026-04-01 10:00:00', '2026-04-01 10:00:00'),
('user-m-002', 'user_beta', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'beta@gearflow.vn', '0900000002', '34 Nguyễn Huệ, Quận 1, HCM', 'USER', '2026-04-02 11:00:00', '2026-04-02 11:00:00'),
('user-m-003', 'user_gamma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'gamma@gearflow.vn', '0900000003', '56 Cách Mạng Tháng 8, Quận 3, HCM', 'USER', '2026-04-03 12:00:00', '2026-04-03 12:00:00'),
('user-m-004', 'user_delta', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'delta@gearflow.vn', '0900000004', '78 Võ Văn Tần, Quận 3, HCM', 'USER', '2026-04-04 13:00:00', '2026-04-04 13:00:00'),
('user-m-005', 'user_epsilon', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'epsilon@gearflow.vn', '0900000005', '90 Trần Hưng Đạo, Quận 5, HCM', 'USER', '2026-04-05 14:00:00', '2026-04-05 14:00:00'),
('user-m-006', 'user_zeta', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'zeta@gearflow.vn', '0900000006', '12 Phan Xích Long, Phú Nhuận', 'USER', '2026-04-06 15:00:00', '2026-04-06 15:00:00'),
('user-m-007', 'user_eta', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'eta@gearflow.vn', '0900000007', '34 Phan Đăng Lưu, Bình Thạnh', 'USER', '2026-04-07 16:00:00', '2026-04-07 16:00:00'),
('user-m-008', 'user_theta', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'theta@gearflow.vn', '0900000008', '56 Bạch Đằng, Tân Bình', 'USER', '2026-04-08 17:00:00', '2026-04-08 17:00:00'),
('user-m-009', 'user_iota', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'iota@gearflow.vn', '0900000009', '78 Cộng Hòa, Tân Bình', 'USER', '2026-04-09 18:00:00', '2026-04-09 18:00:00'),
('user-m-010', 'user_kappa', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'kappa@gearflow.vn', '0900000010', '12 Kim Mã, Ba Đình, Hà Nội', 'USER', '2026-04-10 19:00:00', '2026-04-10 19:00:00'),
('user-m-011', 'user_lambda', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'lambda@gearflow.vn', '0900000011', '34 Đội Cấn, Ba Đình, Hà Nội', 'USER', '2026-04-11 20:00:00', '2026-04-11 20:00:00'),
('user-m-012', 'user_mu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'mu@gearflow.vn', '0900000012', '56 Giải Phóng, Hai Bà Trưng', 'USER', '2026-04-12 21:00:00', '2026-04-12 21:00:00'),
('user-m-013', 'user_nu', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'nu@gearflow.vn', '0900000013', '78 Phố Huế, Hai Bà Trưng', 'USER', '2026-04-13 22:00:00', '2026-04-13 22:00:00'),
('user-m-014', 'user_xi', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'xi@gearflow.vn', '0900000014', '90 Xuân Thủy, Cầu Giấy', 'USER', '2026-04-14 23:00:00', '2026-04-14 23:00:00'),
('user-m-015', 'user_omicron', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'omicron@gearflow.vn', '0900000015', '12 Nguyễn Trãi, Thanh Xuân', 'USER', '2026-04-15 08:00:00', '2026-04-15 08:00:00'),
('user-m-016', 'user_pi', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'pi@gearflow.vn', '0900000016', '34 Trần Duy Hưng, Cầu Giấy', 'USER', '2026-04-16 09:00:00', '2026-04-16 09:00:00'),
('user-m-017', 'user_rho', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'rho@gearflow.vn', '0900000017', '56 Láng Hạ, Đống Đa', 'USER', '2026-04-17 10:00:00', '2026-04-17 10:00:00'),
('user-m-018', 'user_sigma', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'sigma@gearflow.vn', '0900000018', '78 Thái Hà, Đống Đa', 'USER', '2026-04-18 11:00:00', '2026-04-18 11:00:00'),
('user-m-019', 'user_tau', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'tau@gearflow.vn', '0900000019', '90 Nguyễn Chí Thanh, Đống Đa', 'USER', '2026-04-19 12:00:00', '2026-04-19 12:00:00'),
('user-m-020', 'user_upsilon', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'upsilon@gearflow.vn', '0900000020', '12 Lê Văn Lương, Thanh Xuân', 'USER', '2026-04-20 13:00:00', '2026-04-20 13:00:00')
ON CONFLICT (user_name) DO NOTHING;

-- 1.1 Shipping Addresses (10 more for users m-001 to m-010)
INSERT INTO shipping_addresses (id, user_id, full_name, phone, email, address, ward, district, city, postal_code, is_default, created_at, updated_at) VALUES
('addr-m-001', 'user-m-001', 'Nguyễn Văn Alpha', '0900000001', 'alpha@gearflow.vn', '12 Lê Lợi, Quận 1, HCM', 'Bến Nghé', 'Quận 1', 'TP. HCM', '700010', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-m-002', 'user-m-002', 'Trần Thị Beta', '0900000002', 'beta@gearflow.vn', '34 Nguyễn Huệ, Quận 1, HCM', 'Bến Nghé', 'Quận 1', 'TP. HCM', '700011', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-m-003', 'user-m-003', 'Lê Hoàng Gamma', '0900000003', 'gamma@gearflow.vn', '56 Cách Mạng Tháng 8, Quận 3, HCM', 'Phường 6', 'Quận 3', 'TP. HCM', '700012', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-m-004', 'user-m-004', 'Phạm Minh Delta', '0900000004', 'delta@gearflow.vn', '78 Võ Văn Tần, Quận 3, HCM', 'Phường 6', 'Quận 3', 'TP. HCM', '700013', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-m-005', 'user-m-005', 'Hoàng Ngọc Epsilon', '0900000005', 'epsilon@gearflow.vn', '90 Trần Hưng Đạo, Quận 5, HCM', 'Phường 7', 'Quận 5', 'TP. HCM', '700014', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-m-006', 'user-m-006', 'Vũ Đức Zeta', '0900000006', 'zeta@gearflow.vn', '12 Phan Xích Long, Phú Nhuận', 'Phường 2', 'Phú Nhuận', 'TP. HCM', '700015', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-m-007', 'user-m-007', 'Đặng Thùy Eta', '0900000007', 'eta@gearflow.vn', '34 Phan Đăng Lưu, Bình Thạnh', 'Phường 6', 'Bình Thạnh', 'TP. HCM', '700016', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-m-008', 'user-m-008', 'Bùi Xuân Theta', '0900000008', 'theta@gearflow.vn', '56 Bạch Đằng, Tân Bình', 'Phường 2', 'Tân Bình', 'TP. HCM', '700017', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-m-009', 'user-m-009', 'Đỗ Hải Iota', '0900000009', 'iota@gearflow.vn', '78 Cộng Hòa, Tân Bình', 'Phường 13', 'Tân Bình', 'TP. HCM', '700018', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-m-010', 'user-m-010', 'Ngô Thành Kappa', '0900000010', 'kappa@gearflow.vn', '12 Kim Mã, Ba Đình, Hà Nội', 'Kim Mã', 'Ba Đình', 'Hà Nội', '700019', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Additional Coupons (20 more to reach ~32)
INSERT INTO coupons (coupon_id, coupon_code, description, discount_amount, discount_percentage, min_order_amount, max_usage_count, current_usage_count, expiry_date, is_active, created_at) VALUES
('coupon-m-001', 'SALE20', 'Giảm 20% đơn hàng', NULL, 20, 500000.0, 100, 0, '2026-12-31', TRUE, CURRENT_TIMESTAMP),
('coupon-m-002', 'FREESHIP', 'Miễn phí vận chuyển', 30000.0, NULL, 200000.0, 1000, 0, '2026-12-31', TRUE, CURRENT_TIMESTAMP),
('coupon-m-003', 'GEAR50K', 'Giảm 50k cho đơn từ 1tr', 50000.0, NULL, 1000000.0, 200, 0, '2026-06-30', TRUE, CURRENT_TIMESTAMP),
('coupon-m-004', 'KEYBOARD100', 'Giảm 100k cho bàn phím', 100000.0, NULL, 1500000.0, 50, 0, '2026-06-30', TRUE, CURRENT_TIMESTAMP),
('coupon-m-005', 'HELLO_MAY', 'Chào tháng 5 rực rỡ', NULL, 15, 300000.0, 300, 0, '2026-05-31', TRUE, CURRENT_TIMESTAMP),
('coupon-m-006', 'TECH2026', 'Công nghệ tương lai', 200000.0, NULL, 3000000.0, 20, 0, '2026-12-31', TRUE, CURRENT_TIMESTAMP),
('coupon-m-007', 'FAN_GEAR', 'Dành cho fan GearFlow', NULL, 5, 100000.0, 500, 0, '2026-12-31', TRUE, CURRENT_TIMESTAMP),
('coupon-m-008', 'NIGHT_OWL', 'Mua sắm đêm khuya', 70000.0, NULL, 800000.0, 100, 0, '2026-08-31', TRUE, CURRENT_TIMESTAMP),
('coupon-m-009', 'LUCKY_NUMBER', 'Số may mắn', NULL, 7, 777000.0, 77, 0, '2026-07-07', TRUE, CURRENT_TIMESTAMP),
('coupon-m-010', 'VIP_MEMBER', 'Ưu đãi VIP', 500000.0, NULL, 5000000.0, 10, 0, '2026-12-31', TRUE, CURRENT_TIMESTAMP),
('coupon-m-011', 'SUMMER_VIBE', 'Hè sôi động', NULL, 12, 400000.0, 150, 0, '2026-08-31', TRUE, CURRENT_TIMESTAMP),
('coupon-m-012', 'WEEKEND_DEAL', 'Ưu đãi cuối tuần', 40000.0, NULL, 600000.0, 200, 0, '2026-12-31', TRUE, CURRENT_TIMESTAMP),
('coupon-m-013', 'BACKTOSCHOOL', 'Mùa tựu trường', 150000.0, NULL, 2000000.0, 80, 0, '2026-09-30', TRUE, CURRENT_TIMESTAMP),
('coupon-m-014', 'GAMER_CHOICE', 'Lựa chọn game thủ', NULL, 8, 500000.0, 250, 0, '2026-12-31', TRUE, CURRENT_TIMESTAMP),
('coupon-m-015', 'MECHANICAL_LOVE', 'Yêu bàn phím cơ', 120000.0, NULL, 1800000.0, 60, 0, '2026-10-31', TRUE, CURRENT_TIMESTAMP),
('coupon-m-016', 'NEW_ARRIVAL', 'Hàng mới về', NULL, 10, 200000.0, 400, 0, '2026-12-31', TRUE, CURRENT_TIMESTAMP),
('coupon-m-017', 'FLASH_SALE', 'Giảm giá chớp nhoáng', 300000.0, NULL, 4000000.0, 5, 0, '2026-05-30', TRUE, CURRENT_TIMESTAMP),
('coupon-m-018', 'GIFT_FOR_YOU', 'Quà tặng cho bạn', 20000.0, NULL, 100000.0, 1000, 0, '2026-12-31', TRUE, CURRENT_TIMESTAMP),
('coupon-m-019', 'HAPPY_BDAY', 'Mừng sinh nhật', NULL, 25, 1000000.0, 50, 0, '2026-12-31', TRUE, CURRENT_TIMESTAMP),
('coupon-m-020', 'FINAL_CHANCE', 'Cơ hội cuối cùng', 450000.0, NULL, 5000000.0, 15, 0, '2026-05-20', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (coupon_code) DO NOTHING;

-- 3. Additional Variants for Products (to ensure 2-3 per product)
-- We already have variants for prod-001 to prod-015.
-- Let's add variants for prod-016 to prod-030 and prod-100 to prod-109.

INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at) VALUES
('var-m-016-1', 'prod-016', 'Akko Pink', 'Blue/White', 'PBT Dye-Sub', 'Wireless', 0.0, CURRENT_TIMESTAMP),
('var-m-016-2', 'prod-016', 'Akko Orange', 'Blue/White', 'PBT Dye-Sub', 'Wireless', 50000.0, CURRENT_TIMESTAMP),
('var-m-017-1', 'prod-017', 'RK Red', 'Black', 'ABS', 'Wireless', 0.0, CURRENT_TIMESTAMP),
('var-m-017-2', 'prod-017', 'RK Brown', 'White', 'ABS', 'Wireless', 0.0, CURRENT_TIMESTAMP),
('var-m-018-1', 'prod-018', 'Gateron Yellow', 'Gray', 'PBT', 'Wired', 0.0, CURRENT_TIMESTAMP),
('var-m-018-2', 'prod-018', 'Gateron Black', 'Black', 'PBT', 'Wired', 70000.0, CURRENT_TIMESTAMP),
('var-m-019-1', 'prod-019', 'NuPhy Aloe', 'White', 'Low-profile PBT', 'Wireless', 0.0, CURRENT_TIMESTAMP),
('var-m-019-2', 'prod-019', 'NuPhy Wisteria', 'Gray', 'Low-profile PBT', 'Wireless', 120000.0, CURRENT_TIMESTAMP),
('var-m-020-1', 'prod-020', 'Gateron Pro Yellow', 'White', 'PBT', 'Wireless', 0.0, CURRENT_TIMESTAMP),
('var-m-020-2', 'prod-020', 'Gateron Pro Brown', 'Black', 'PBT', 'Wireless', 30000.0, CURRENT_TIMESTAMP),
('var-m-021-1', 'prod-021', 'Gateron Red', 'Acrylic', 'PBT', 'Wired', 0.0, CURRENT_TIMESTAMP),
('var-m-021-2', 'prod-021', 'Gateron Blue', 'Acrylic', 'PBT', 'Wired', 0.0, CURRENT_TIMESTAMP),
('var-m-022-1', 'prod-022', 'Gateron Phantom Red', 'Navy', 'PBT', 'Wired', 0.0, CURRENT_TIMESTAMP),
('var-m-022-2', 'prod-022', 'Gateron Phantom Blue', 'Gray', 'PBT', 'Wired', 150000.0, CURRENT_TIMESTAMP),
('var-m-023-1', 'prod-023', 'Cherry MX Silver', 'Black', 'PBT', 'Wired', 0.0, CURRENT_TIMESTAMP),
('var-m-023-2', 'prod-023', 'Cherry MX Silent Red', 'White', 'PBT', 'Wired', 80000.0, CURRENT_TIMESTAMP),
('var-m-024-1', 'prod-024', 'Cherry MX Brown', 'Navy/Blue', 'PBT', 'Wired', 0.0, CURRENT_TIMESTAMP),
('var-m-024-2', 'prod-024', 'Cherry MX Blue', 'Black', 'PBT', 'Wired', 0.0, CURRENT_TIMESTAMP),
('var-m-025-1', 'prod-025', 'Cherry MX Blue', 'White/Pink', 'PBT', 'Wired', 0.0, CURRENT_TIMESTAMP),
('var-m-025-2', 'prod-025', 'Cherry MX Red', 'White/Blue', 'PBT', 'Wired', 50000.0, CURRENT_TIMESTAMP),
('var-m-100-2', 'prod-100', 'Mặc định', 'Đen', 'Mặc định', 'Có dây', 200000.0, CURRENT_TIMESTAMP),
('var-m-101-2', 'prod-101', 'Mặc định', 'Vàng', 'Mặc định', 'Không dây', 30000.0, CURRENT_TIMESTAMP),
('var-m-102-2', 'prod-102', 'Mặc định', 'Xám', 'Mặc định', 'Có dây', 45000.0, CURRENT_TIMESTAMP),
('var-m-103-2', 'prod-103', 'Mặc định', 'Đen', 'Mặc định', 'Có dây', 50000.0, CURRENT_TIMESTAMP),
('var-m-104-2', 'prod-104', 'Mặc định', 'Đen', 'Mặc định', 'Có dây', 0.0, CURRENT_TIMESTAMP),
('var-m-105-2', 'prod-105', 'Mặc định', 'Bạc', 'Mặc định', 'Có dây', 500000.0, CURRENT_TIMESTAMP),
('var-m-106-2', 'prod-106', 'Mặc định', 'Trắng', 'Mặc định', 'Có dây', 0.0, CURRENT_TIMESTAMP),
('var-m-107-2', 'prod-107', 'Mặc định', 'Đen', 'Mặc định', 'Có dây', 0.0, CURRENT_TIMESTAMP),
('var-m-108-2', 'prod-108', 'Mặc định', 'Gỗ Sồi', 'Mặc định', 'N/A', 100000.0, CURRENT_TIMESTAMP),
('var-m-109-2', 'prod-109', 'Mặc định', 'Bạc', 'Mặc định', 'N/A', 0.0, CURRENT_TIMESTAMP)
ON CONFLICT (pro_variant_id) DO NOTHING;

-- 4. Stock for new variants (1-20 per variant)
INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at) VALUES
('var-m-016-1', 12, 0, CURRENT_TIMESTAMP), ('var-m-016-2', 8, 0, CURRENT_TIMESTAMP),
('var-m-017-1', 15, 0, CURRENT_TIMESTAMP), ('var-m-017-2', 20, 0, CURRENT_TIMESTAMP),
('var-m-018-1', 5, 0, CURRENT_TIMESTAMP), ('var-m-018-2', 3, 0, CURRENT_TIMESTAMP),
('var-m-019-1', 18, 0, CURRENT_TIMESTAMP), ('var-m-019-2', 10, 0, CURRENT_TIMESTAMP),
('var-m-020-1', 7, 0, CURRENT_TIMESTAMP), ('var-m-020-2', 14, 0, CURRENT_TIMESTAMP),
('var-m-021-1', 11, 0, CURRENT_TIMESTAMP), ('var-m-021-2', 9, 0, CURRENT_TIMESTAMP),
('var-m-022-1', 4, 0, CURRENT_TIMESTAMP), ('var-m-022-2', 2, 0, CURRENT_TIMESTAMP),
('var-m-023-1', 16, 0, CURRENT_TIMESTAMP), ('var-m-023-2', 13, 0, CURRENT_TIMESTAMP),
('var-m-024-1', 19, 0, CURRENT_TIMESTAMP), ('var-m-024-2', 6, 0, CURRENT_TIMESTAMP),
('var-m-025-1', 1, 0, CURRENT_TIMESTAMP), ('var-m-025-2', 17, 0, CURRENT_TIMESTAMP),
('var-m-100-2', 15, 0, CURRENT_TIMESTAMP), ('var-m-101-2', 12, 0, CURRENT_TIMESTAMP),
('var-m-102-2', 10, 0, CURRENT_TIMESTAMP)
ON CONFLICT (pro_variant_id) DO NOTHING;

-- 5. Massive Orders (20 records between 2026-04-10 and 2026-05-15)
INSERT INTO orders (order_id, user_id, total_amount, order_status, shipping_address, shipping_city, shipping_phone, shipping_full_name, created_at, updated_at) VALUES
('order-m-001', 'user-m-001', 1500000.0, 'DELIVERED', '12 Lê Lợi, Q1', 'HCM', '0900000001', 'User Alpha', '2026-04-10 10:30:00', '2026-04-12 15:00:00'),
('order-m-002', 'user-m-002', 2200000.0, 'DELIVERED', '34 Nguyễn Huệ, Q1', 'HCM', '0900000002', 'User Beta', '2026-04-12 11:20:00', '2026-04-14 16:30:00'),
('order-m-003', 'user-m-003', 850000.0, 'DELIVERED', '56 Cách Mạng Tháng 8, Q3', 'HCM', '0900000003', 'User Gamma', '2026-04-15 14:45:00', '2026-04-17 10:00:00'),
('order-m-004', 'user-m-004', 3500000.0, 'DELIVERED', '78 Võ Văn Tần, Q3', 'HCM', '0900000004', 'User Delta', '2026-04-18 09:15:00', '2026-04-20 14:00:00'),
('order-m-005', 'user-m-005', 1200000.0, 'DELIVERED', '90 Trần Hưng Đạo, Q5', 'HCM', '0900000005', 'User Epsilon', '2026-04-21 16:50:00', '2026-04-23 11:20:00'),
('order-m-006', 'user-m-006', 950000.0, 'DELIVERED', '12 Phan Xích Long', 'HCM', '0900000006', 'User Zeta', '2026-04-24 13:10:00', '2026-04-26 15:40:00'),
('order-m-007', 'user-m-007', 2800000.0, 'DELIVERED', '34 Phan Đăng Lưu', 'HCM', '0900000007', 'User Eta', '2026-04-27 10:05:00', '2026-04-29 09:10:00'),
('order-m-008', 'user-m-008', 1400000.0, 'DELIVERED', '56 Bạch Đằng', 'HCM', '0900000008', 'User Theta', '2026-04-30 18:25:00', '2026-05-02 13:50:00'),
('order-m-009', 'user-m-009', 1100000.0, 'DELIVERED', '78 Cộng Hòa', 'HCM', '0900000009', 'User Iota', '2026-05-02 11:40:00', '2026-05-04 16:15:00'),
('order-m-010', 'user-m-010', 3200000.0, 'DELIVERED', '12 Kim Mã', 'Hà Nội', '0900000010', 'User Kappa', '2026-05-04 09:30:00', '2026-05-06 14:20:00'),
('order-m-011', 'user-m-011', 1650000.0, 'DELIVERED', '34 Đội Cấn', 'Hà Nội', '0900000011', 'User Lambda', '2026-05-06 15:55:00', '2026-05-08 10:45:00'),
('order-m-012', 'user-m-012', 2400000.0, 'DELIVERED', '56 Giải Phóng', 'Hà Nội', '0900000012', 'User Mu', '2026-05-08 13:20:00', '2026-05-10 11:30:00'),
('order-m-013', 'user-m-013', 1900000.0, 'SHIPPED', '78 Phố Huế', 'Hà Nội', '0900000013', 'User Nu', '2026-05-10 10:10:00', '2026-05-12 14:00:00'),
('order-m-014', 'user-m-014', 2100000.0, 'PROCESSING', '90 Xuân Thủy', 'Hà Nội', '0900000014', 'User Xi', '2026-05-12 16:45:00', '2026-05-12 16:45:00'),
('order-m-015', 'user-m-015', 1350000.0, 'PENDING', '12 Nguyễn Trãi', 'Hà Nội', '0900000015', 'User Omicron', '2026-05-13 08:30:00', '2026-05-13 08:30:00'),
('order-m-016', 'user-m-016', 3100000.0, 'PENDING', '34 Trần Duy Hưng', 'Hà Nội', '0900000016', 'User Pi', '2026-05-13 14:20:00', '2026-05-13 14:20:00'),
('order-m-017', 'user-m-017', 2550000.0, 'PENDING', '56 Láng Hạ', 'Hà Nội', '0900000017', 'User Rho', '2026-05-14 09:10:00', '2026-05-14 09:10:00'),
('order-m-018', 'user-m-018', 1800000.0, 'CONFIRMED', '78 Thái Hà', 'Hà Nội', '0900000018', 'User Sigma', '2026-05-14 15:50:00', '2026-05-14 15:50:00'),
('order-m-019', 'user-m-019', 4200000.0, 'PENDING', '90 Nguyễn Chí Thanh', 'Hà Nội', '0900000019', 'User Tau', '2026-05-15 11:00:00', '2026-05-15 11:00:00'),
('order-m-020', 'user-m-020', 1250000.0, 'PENDING', '12 Lê Văn Lương', 'Hà Nội', '0900000020', 'User Upsilon', '2026-05-15 17:30:00', '2026-05-15 17:30:00')
ON CONFLICT (order_id) DO NOTHING;

-- 6. Order Items for massive orders
INSERT INTO order_items (order_item_id, product_id, order_id, pro_variant_id, quantity, price, created_at) VALUES
('oi-m-001', 'prod-001', 'order-m-001', 'var-001', 1, 890000.0, '2026-04-10 10:30:00'),
('oi-m-002', 'prod-002', 'order-m-002', 'var-004', 1, 1190000.0, '2026-04-12 11:20:00'),
('oi-m-003', 'prod-003', 'order-m-003', 'var-007', 1, 1290000.0, '2026-04-15 14:45:00'),
('oi-m-004', 'prod-013', 'order-m-004', 'var-027', 2, 1690000.0, '2026-04-18 09:15:00'),
('oi-m-005', 'prod-016', 'order-m-005', 'var-m-016-1', 2, 690000.0, '2026-04-21 16:50:00'),
('oi-m-006', 'prod-017', 'order-m-006', 'var-m-017-1', 1, 590000.0, '2026-04-24 13:10:00'),
('oi-m-007', 'prod-022', 'order-m-007', 'var-m-022-1', 1, 1890000.0, '2026-04-27 10:05:00'),
('oi-m-008', 'prod-008', 'order-m-008', 'var-017', 1, 1190000.0, '2026-04-30 18:25:00'),
('oi-m-009', 'prod-012', 'order-m-009', 'var-025', 1, 890000.0, '2026-05-02 11:40:00'),
('oi-m-010', 'prod-030', 'order-m-010', 'var-m-100-2', 2, 1390000.0, '2026-05-04 09:30:00'),
('oi-m-011', 'prod-005', 'order-m-011', 'var-011', 1, 990000.0, '2026-05-06 15:55:00'),
('oi-m-012', 'prod-006', 'order-m-012', 'var-013', 1, 1590000.0, '2026-05-08 13:20:00'),
('oi-m-013', 'prod-007', 'order-m-013', 'var-015', 1, 1390000.0, '2026-05-10 10:10:00'),
('oi-m-014', 'prod-010', 'order-m-014', 'var-021', 2, 990000.0, '2026-05-12 16:45:00'),
('oi-m-015', 'prod-012', 'order-m-015', 'var-025', 1, 890000.0, '2026-05-13 08:30:00'),
('oi-m-016', 'prod-013', 'order-m-016', 'var-027', 1, 1690000.0, '2026-05-13 14:20:00'),
('oi-m-017', 'prod-014', 'order-m-017', 'var-029', 1, 1490000.0, '2026-05-14 09:10:00'),
('oi-m-018', 'prod-015', 'order-m-018', 'var-031', 1, 790000.0, '2026-05-14 15:50:00'),
('oi-m-019', 'prod-022', 'order-m-019', 'var-m-022-1', 2, 1890000.0, '2026-05-15 11:00:00'),
('oi-m-020', 'prod-100', 'order-m-020', 'var-100', 1, 3500000.0, '2026-05-15 17:30:00')
ON CONFLICT (order_item_id) DO NOTHING;

-- 7. Reviews (20 records)
INSERT INTO reviews (review_id, user_id, product_id, rating, comment, created_at, updated_at) VALUES
('rev-m-001', 'user-m-001', 'prod-001', 5, 'Bàn phím gõ rất sướng, kết nối ổn định', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-002', 'user-m-002', 'prod-002', 4, 'Thiết kế đẹp, led sáng, phím PBT nhám tay', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-003', 'user-m-003', 'prod-003', 5, 'Đẳng cấp Leopold, không có gì để chê', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-004', 'user-m-004', 'prod-013', 5, 'Build kit rất chắc chắn, âm thanh hay', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-005', 'user-m-005', 'prod-016', 4, 'Switch Akko gõ mượt, màu sắc trẻ trung', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-006', 'user-m-006', 'prod-017', 3, 'Tầm giá này thì ổn, hơi ọp ẹp xíu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-007', 'user-m-007', 'prod-022', 5, 'Nhôm nguyên khối nặng tay, đầm chắc', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-008', 'user-m-008', 'prod-008', 5, 'Dùng cho văn phòng cực kỳ tuyệt vời', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-009', 'user-m-009', 'prod-012', 4, 'RGB đẹp lung linh, phần mềm dễ dùng', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-010', 'user-m-010', 'prod-030', 5, 'GMMK 2 gõ rất thích, stab tốt', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-011', 'user-m-011', 'prod-001', 4, 'Pin dùng được lâu, switch brown gõ ổn', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-012', 'user-m-012', 'prod-100', 5, 'Keycap GMK xịn xò, màu lên chuẩn', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-013', 'user-m-013', 'prod-101', 5, 'Switch Milky Yellow gõ rất mượt', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-014', 'user-m-014', 'prod-102', 4, 'Cherry Hyperglide bền bỉ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-015', 'user-m-015', 'prod-104', 5, 'Deskmat mịn, di chuột rất mướt', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-016', 'user-m-016', 'prod-105', 5, 'Kit KBDfans hoàn thiện cực tốt', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-017', 'user-m-017', 'prod-106', 4, 'Keycap JTK đẹp, đóng hộp chuyên nghiệp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-018', 'user-m-018', 'prod-107', 4, 'Box White clicky gõ vui tai', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-019', 'user-m-019', 'prod-108', 5, 'Kê tay gỗ sang trọng, vừa vặn', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-m-020', 'user-m-020', 'prod-109', 5, 'Nhổ switch rất dễ dàng, không trầy', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (review_id) DO NOTHING;

-- 8. Additional Product Views
INSERT INTO product_views (id, user_id, product_id, viewed_at) VALUES
(gen_random_uuid()::text, 'user-m-001', 'prod-001', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-002', 'prod-002', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-003', 'prod-003', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-004', 'prod-004', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-005', 'prod-005', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-006', 'prod-006', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-007', 'prod-007', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-008', 'prod-008', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-009', 'prod-009', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-010', 'prod-010', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-011', 'prod-011', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-012', 'prod-012', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-013', 'prod-013', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-014', 'prod-014', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-015', 'prod-015', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-016', 'prod-016', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-017', 'prod-017', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-018', 'prod-018', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-019', 'prod-019', CURRENT_TIMESTAMP),
(gen_random_uuid()::text, 'user-m-020', 'prod-020', CURRENT_TIMESTAMP);

-- 9. Wishlist (20 records)
INSERT INTO wishlists (wishlist_id, user_id, product_id, created_at) VALUES
('wish-m-001', 'user-m-001', 'prod-001', CURRENT_TIMESTAMP),
('wish-m-002', 'user-m-002', 'prod-002', CURRENT_TIMESTAMP),
('wish-m-003', 'user-m-003', 'prod-003', CURRENT_TIMESTAMP),
('wish-m-004', 'user-m-004', 'prod-004', CURRENT_TIMESTAMP),
('wish-m-005', 'user-m-005', 'prod-005', CURRENT_TIMESTAMP),
('wish-m-006', 'user-m-006', 'prod-006', CURRENT_TIMESTAMP),
('wish-m-007', 'user-m-007', 'prod-007', CURRENT_TIMESTAMP),
('wish-m-008', 'user-m-008', 'prod-008', CURRENT_TIMESTAMP),
('wish-m-009', 'user-m-009', 'prod-009', CURRENT_TIMESTAMP),
('wish-m-010', 'user-m-010', 'prod-010', CURRENT_TIMESTAMP),
('wish-m-011', 'user-m-011', 'prod-011', CURRENT_TIMESTAMP),
('wish-m-012', 'user-m-012', 'prod-012', CURRENT_TIMESTAMP),
('wish-m-013', 'user-m-013', 'prod-013', CURRENT_TIMESTAMP),
('wish-m-014', 'user-m-014', 'prod-014', CURRENT_TIMESTAMP),
('wish-m-015', 'user-m-015', 'prod-015', CURRENT_TIMESTAMP),
('wish-m-016', 'user-m-016', 'prod-016', CURRENT_TIMESTAMP),
('wish-m-017', 'user-m-017', 'prod-017', CURRENT_TIMESTAMP),
('wish-m-018', 'user-m-018', 'prod-018', CURRENT_TIMESTAMP),
('wish-m-019', 'user-m-019', 'prod-019', CURRENT_TIMESTAMP),
('wish-m-020', 'user-m-020', 'prod-020', CURRENT_TIMESTAMP)
ON CONFLICT (user_id, product_id) DO NOTHING;

-- 10. Notifications (20 records)
INSERT INTO notifications (notification_id, user_id, type, title, message, is_read, created_at) VALUES
('notif-m-001', 'user-m-001', 'PROMOTION', 'Ưu đãi đặc biệt', 'Bạn có mã giảm giá 20% mới', FALSE, CURRENT_TIMESTAMP),
('notif-m-002', 'user-m-002', 'ORDER', 'Đơn hàng thành công', 'Đơn hàng order-m-002 đã được giao', TRUE, CURRENT_TIMESTAMP),
('notif-m-003', 'user-m-003', 'PROMOTION', 'Chào hè rực rỡ', 'Hàng loạt bàn phím cơ đang giảm giá', FALSE, CURRENT_TIMESTAMP),
('notif-m-004', 'user-m-004', 'SYSTEM', 'Bảo trì hệ thống', 'Hệ thống sẽ bảo trì vào 2h sáng mai', FALSE, CURRENT_TIMESTAMP),
('notif-m-005', 'user-m-005', 'ORDER', 'Đơn hàng mới', 'Bạn vừa đặt hàng thành công', TRUE, CURRENT_TIMESTAMP),
('notif-m-006', 'user-m-006', 'PROMOTION', 'Flash Sale', 'Chỉ còn 2 tiếng nữa thôi!', FALSE, CURRENT_TIMESTAMP),
('notif-m-007', 'user-m-007', 'ORDER', 'Cập nhật vận chuyển', 'Đơn hàng đang trên đường đến bạn', FALSE, CURRENT_TIMESTAMP),
('notif-m-008', 'user-m-008', 'SYSTEM', 'Tính năng mới', 'GearFlow vừa cập nhật giao diện mới', FALSE, CURRENT_TIMESTAMP),
('notif-m-009', 'user-m-009', 'PROMOTION', 'Quà tặng sinh nhật', 'Chúc mừng sinh nhật bạn!', FALSE, CURRENT_TIMESTAMP),
('notif-m-010', 'user-m-010', 'ORDER', 'Đánh giá sản phẩm', 'Hãy chia sẻ trải nghiệm của bạn nhé', FALSE, CURRENT_TIMESTAMP),
('notif-m-011', 'user-m-011', 'PROMOTION', 'Sale cuối tháng', 'Nhanh tay hốt ngay deal xịn', FALSE, CURRENT_TIMESTAMP),
('notif-m-012', 'user-m-012', 'ORDER', 'Đơn hàng hoàn tất', 'Cảm ơn bạn đã ủng hộ GearFlow', TRUE, CURRENT_TIMESTAMP),
('notif-m-013', 'user-m-013', 'SYSTEM', 'Xác minh tài khoản', 'Vui lòng xác minh email của bạn', FALSE, CURRENT_TIMESTAMP),
('notif-m-014', 'user-m-014', 'PROMOTION', 'Mã Freeship', 'Bạn có 3 mã freeship chưa dùng', FALSE, CURRENT_TIMESTAMP),
('notif-m-015', 'user-m-015', 'ORDER', 'Hủy đơn hàng', 'Đơn hàng của bạn đã bị hủy', FALSE, CURRENT_TIMESTAMP),
('notif-m-016', 'user-m-016', 'PROMOTION', 'Black Friday', 'Đại tiệc giảm giá lớn nhất năm', FALSE, CURRENT_TIMESTAMP),
('notif-m-017', 'user-m-017', 'SYSTEM', 'Mật khẩu đã đổi', 'Bạn vừa đổi mật khẩu thành công', TRUE, CURRENT_TIMESTAMP),
('notif-m-018', 'user-m-018', 'ORDER', 'Xác nhận thanh toán', 'Thanh toán VNPAY thành công', TRUE, CURRENT_TIMESTAMP),
('notif-m-019', 'user-m-019', 'PROMOTION', 'Tặng bạn voucher', 'Giảm ngay 100k cho đơn từ 2tr', FALSE, CURRENT_TIMESTAMP),
('notif-m-020', 'user-m-020', 'SYSTEM', 'Thông báo quan trọng', 'Vui lòng cập nhật thông tin cá nhân', FALSE, CURRENT_TIMESTAMP);
