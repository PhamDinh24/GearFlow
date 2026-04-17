-- ============================================================================
-- GearFlow E-commerce Database Schema
-- Combined Schema & Sample Data
-- ============================================================================

-- ============================================================================
-- CORE TABLES
-- ============================================================================

CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(500),
    image_url VARCHAR(500),
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE jwt_tokens (
    token_id UUID PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    token TEXT NOT NULL UNIQUE,
    token_type VARCHAR(50) NOT NULL DEFAULT 'Bearer',
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'REVOKED', 'EXPIRED')),
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked_at TIMESTAMP,
    last_used_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE shipping_addresses (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    address VARCHAR(500) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_shipping_addresses_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
COMMENT ON TABLE shipping_addresses IS 'Stores user shipping addresses for checkout';

CREATE TABLE attribute_definitions (
    attr_def_id VARCHAR(36) PRIMARY KEY,
    attr_name VARCHAR(100) NOT NULL UNIQUE,
    attr_display_name VARCHAR(200) NOT NULL,
    attr_type VARCHAR(50) NOT NULL DEFAULT 'TEXT',
    attr_unit VARCHAR(20),
    is_filterable BOOLEAN DEFAULT FALSE,
    is_variant_attribute BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
COMMENT ON TABLE attribute_definitions IS 'Định nghĩa các loại thuộc tính sản phẩm';
COMMENT ON COLUMN attribute_definitions.is_filterable IS 'Có thể dùng để filter sản phẩm';
COMMENT ON COLUMN attribute_definitions.is_variant_attribute IS 'Thuộc tính tạo variant (color, size, switch type)';

CREATE TABLE categories (
    categories_id VARCHAR(36) PRIMARY KEY,
    categories_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE brands (
    brands_id VARCHAR(36) PRIMARY KEY,
    brands_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PRODUCT TABLES
-- ============================================================================

CREATE TABLE products (
    product_id VARCHAR(36) PRIMARY KEY,
    categories_id VARCHAR(36) NOT NULL,
    brands_id VARCHAR(36) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    description TEXT,
    base_price DECIMAL(10, 2) NOT NULL,
    support VARCHAR(100),
    image VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_products_category FOREIGN KEY (categories_id) REFERENCES categories(categories_id) ON DELETE CASCADE,
    CONSTRAINT fk_products_brand FOREIGN KEY (brands_id) REFERENCES brands(brands_id) ON DELETE CASCADE
);

CREATE TABLE product_attributes (
    attr_id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    attr_name VARCHAR(100) NOT NULL,
    attr_value VARCHAR(255) NOT NULL,
    price_adjustment DECIMAL(10, 2) DEFAULT 0,
    attr_def_id VARCHAR(36),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_attributes_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_product_attributes_definition FOREIGN KEY (attr_def_id) REFERENCES attribute_definitions(attr_def_id) ON DELETE SET NULL
);
COMMENT ON COLUMN product_attributes.price_adjustment IS 'Điều chỉnh giá khi chọn thuộc tính này (VNĐ)';

CREATE TABLE product_variants (
    pro_variant_id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    switch_type VARCHAR(50),
    color VARCHAR(100),
    keycap_set VARCHAR(100),
    connect_type VARCHAR(100),
    price_modifier DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_variants_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

CREATE TABLE stock (
    pro_variant_id VARCHAR(36) PRIMARY KEY,
    quantity INT NOT NULL DEFAULT 0,
    reserved INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_variant FOREIGN KEY (pro_variant_id) REFERENCES product_variants(pro_variant_id) ON DELETE CASCADE
);

CREATE TABLE product_views (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    viewed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_views_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_product_views_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- ============================================================================
-- CART TABLES
-- ============================================================================

CREATE TABLE carts (
    cart_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    cart_item_id VARCHAR(36) PRIMARY KEY,
    cart_id VARCHAR(36) NOT NULL,
    pro_variant_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_items_cart FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
    CONSTRAINT fk_cart_items_variant FOREIGN KEY (pro_variant_id) REFERENCES product_variants(pro_variant_id) ON DELETE CASCADE,
    CONSTRAINT uk_cart_items_cart_variant UNIQUE(cart_id, pro_variant_id)
);

-- ============================================================================
-- ORDER TABLES
-- ============================================================================

CREATE TABLE orders (
    order_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    shipping_address VARCHAR(500),
    shipping_city VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_phone VARCHAR(50),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);
COMMENT ON COLUMN orders.shipping_address IS 'Full shipping address for the order';
COMMENT ON COLUMN orders.shipping_city IS 'Shipping city';
COMMENT ON COLUMN orders.shipping_postal_code IS 'Shipping postal code';
COMMENT ON COLUMN orders.shipping_phone IS 'Shipping contact phone';

CREATE TABLE order_items (
    order_item_id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36) NOT NULL,
    pro_variant_id VARCHAR(36),
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_variant FOREIGN KEY (pro_variant_id) REFERENCES product_variants(pro_variant_id) ON DELETE SET NULL
);

CREATE TABLE payment (
    payment_id VARCHAR(36) PRIMARY KEY,
    order_id VARCHAR(36) NOT NULL UNIQUE,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'VNPAY',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(255) UNIQUE,
    amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- ============================================================================
-- USER INTERACTION TABLES
-- ============================================================================

CREATE TABLE wishlists (
    wishlist_id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlists_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlists_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT uk_wishlists_user_product UNIQUE(user_id, product_id)
);

CREATE TABLE reviews (
    review_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    rating INT,
    comment TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reviews_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT uk_reviews_user_product UNIQUE(user_id, product_id)
);

-- ============================================================================
-- MARKETING & NOTIFICATION TABLES
-- ============================================================================

CREATE TABLE coupons (
    coupon_id VARCHAR(36) PRIMARY KEY,
    coupon_code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_amount DECIMAL(10, 2),
    discount_percentage INT,
    min_order_amount DECIMAL(10, 2),
    max_usage_count INT,
    current_usage_count INT NOT NULL DEFAULT 0,
    expiry_date TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    notification_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- User indexes
CREATE INDEX idx_users_username ON users(user_name);
CREATE INDEX idx_users_role ON users(role);

-- Product indexes
CREATE INDEX idx_products_category ON products(categories_id);
CREATE INDEX idx_products_brand ON products(brands_id);
CREATE INDEX idx_products_name ON products(product_name);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Product variant indexes
CREATE INDEX idx_product_variants_product ON product_variants(product_id);

-- Product attribute indexes
CREATE INDEX idx_product_attributes_product ON product_attributes(product_id);
CREATE INDEX idx_product_attributes_def ON product_attributes(attr_def_id);

-- Product view indexes
CREATE INDEX idx_product_views_user ON product_views(user_id);
CREATE INDEX idx_product_views_product ON product_views(product_id);

-- Cart indexes
CREATE INDEX idx_carts_user ON carts(user_id);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);
CREATE INDEX idx_cart_items_variant ON cart_items(pro_variant_id);

-- Order indexes
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- Payment indexes
CREATE INDEX idx_payment_order ON payment(order_id);
CREATE INDEX idx_payment_transaction ON payment(transaction_id);
CREATE INDEX idx_payment_status ON payment(payment_status);

-- Wishlist indexes
CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_wishlists_product ON wishlists(product_id);

-- Review indexes
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- Coupon indexes
CREATE INDEX idx_coupons_code ON coupons(coupon_code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupons_expiry ON coupons(expiry_date);

-- Notification indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Shipping address indexes
CREATE INDEX idx_shipping_addresses_user_id ON shipping_addresses(user_id);
CREATE INDEX idx_shipping_addresses_user_default ON shipping_addresses(user_id, is_default);

-- Attribute Definitions indexes
CREATE INDEX idx_attribute_definitions_name ON attribute_definitions(attr_name);
CREATE INDEX idx_attribute_definitions_filterable ON attribute_definitions(is_filterable);

-- JWT indices
CREATE INDEX idx_jwt_user ON jwt_tokens(user_id);
CREATE INDEX idx_jwt_token ON jwt_tokens(token);
CREATE INDEX idx_jwt_expiry ON jwt_tokens(expires_at);
CREATE INDEX idx_jwt_status ON jwt_tokens(status);
CREATE INDEX idx_jwt_user_status ON jwt_tokens(user_id, status);
CREATE INDEX idx_jwt_user_expiry ON jwt_tokens(user_id, expires_at);

-- ============================================================================
-- SAMPLE DATA & INSERTS
-- ============================================================================

-- Users
INSERT INTO users (user_id, user_name, password, phone, address, role, created_at, updated_at) VALUES
('user-test-001', 'sampleuser1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0123456789', 'Hanoi, Vietnam', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-admin-001', 'sampleadmin1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0987654321', 'Hanoi, Vietnam', 'ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (user_name) DO NOTHING;

-- Categories
INSERT INTO categories (categories_id, categories_name, description, created_at) VALUES
('cat-001', 'Mechanical Keyboards', 'High-quality mechanical keyboards for enthusiasts', CURRENT_TIMESTAMP),
('cat-002', 'Gaming Keyboards', 'Performance gaming keyboards with RGB', CURRENT_TIMESTAMP),
('cat-003', 'Office Keyboards', 'Professional keyboards for productivity', CURRENT_TIMESTAMP),
('cat-004', 'Wireless Keyboards', 'Wireless and Bluetooth keyboards', CURRENT_TIMESTAMP),
('cat-005', 'Compact Keyboards', '60% and 65% layout keyboards', CURRENT_TIMESTAMP),
('cat-006', 'Full-Size Keyboards', '100% layout keyboards', CURRENT_TIMESTAMP),
('cat-007', 'TKL Keyboards', 'Tenkeyless keyboards', CURRENT_TIMESTAMP),
('cat-008', 'Custom Keyboards', 'DIY and custom build keyboards', CURRENT_TIMESTAMP),
('cat-009', 'Low-Profile Keyboards', 'Slim and portable keyboards', CURRENT_TIMESTAMP),
('cat-010', 'Ergonomic Keyboards', 'Split and ergonomic designs', CURRENT_TIMESTAMP)
ON CONFLICT (categories_name) DO NOTHING;

-- Brands
INSERT INTO brands (brands_id, brands_name, description, created_at) VALUES
('brand-001', 'Keychron', 'Premium wireless mechanical keyboards', CURRENT_TIMESTAMP),
('brand-002', 'Ducky', 'High-end gaming keyboards', CURRENT_TIMESTAMP),
('brand-003', 'Leopold', 'Professional quality keyboards', CURRENT_TIMESTAMP),
('brand-004', 'Varmilo', 'Custom artisan keyboards', CURRENT_TIMESTAMP),
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

-- Attribute Definitions
INSERT INTO attribute_definitions (attr_def_id, attr_name, attr_display_name, attr_type, attr_unit, is_filterable, is_variant_attribute, display_order) VALUES
('attr-def-001', 'layout', 'Layout', 'SELECT', NULL, TRUE, FALSE, 1),
('attr-def-002', 'connectivity', 'Kết nối', 'SELECT', NULL, TRUE, FALSE, 2),
('attr-def-003', 'battery', 'Pin', 'TEXT', 'mAh', FALSE, FALSE, 3),
('attr-def-004', 'hot_swappable', 'Hot-swappable', 'SELECT', NULL, TRUE, FALSE, 4),
('attr-def-005', 'rgb_lighting', 'Đèn RGB', 'SELECT', NULL, TRUE, FALSE, 5),
('attr-def-006', 'material', 'Chất liệu', 'TEXT', NULL, TRUE, FALSE, 6),
('attr-def-007', 'weight', 'Trọng lượng', 'NUMBER', 'g', FALSE, FALSE, 7),
('attr-def-008', 'dimensions', 'Kích thước', 'TEXT', 'mm', FALSE, FALSE, 8),
('attr-def-009', 'polling_rate', 'Polling Rate', 'NUMBER', 'Hz', FALSE, FALSE, 9),
('attr-def-010', 'software', 'Phần mềm', 'TEXT', NULL, FALSE, FALSE, 10),
('attr-def-011', 'switch_type', 'Loại switch', 'SELECT', NULL, TRUE, TRUE, 11),
('attr-def-012', 'keycap_material', 'Chất liệu keycap', 'SELECT', NULL, TRUE, TRUE, 12),
('attr-def-013', 'color', 'Màu sắc', 'COLOR', NULL, TRUE, TRUE, 13),
('attr-def-014', 'language', 'Ngôn ngữ', 'SELECT', NULL, TRUE, TRUE, 14)
ON CONFLICT (attr_def_id) DO NOTHING;

-- Products
INSERT INTO products (product_id, categories_id, brands_id, product_name, description, base_price, support, image, created_at, updated_at) VALUES
('prod-001', 'cat-001', 'brand-001', 'Keychron K2 V2', 'Compact 75% wireless mechanical keyboard with RGB backlight and hot-swappable switches', 890000.00, 'Windows, Mac, Linux', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-002', 'cat-002', 'brand-002', 'Ducky One 2 Mini', '60% mechanical gaming keyboard with Cherry MX switches and PBT keycaps', 1190000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-003', 'cat-001', 'brand-003', 'Leopold FC660M', 'Compact 65% mechanical keyboard for professionals with premium build quality', 1290000.00, 'Windows, Mac, Linux', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-004', 'cat-002', 'brand-004', 'Varmilo VA87M', 'TKL mechanical keyboard with custom dye-sublimated keycaps', 1490000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-005', 'cat-003', 'brand-001', 'Keychron K8', 'Full-size wireless mechanical keyboard with multi-device support', 990000.00, 'Windows, Mac, Linux, iOS, Android', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
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

-- Product Variants
INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at) VALUES
-- Keychron K2 variants
('var-001', 'prod-001', 'Gateron Brown', 'White', 'Standard', 'Wireless', 0.00, CURRENT_TIMESTAMP),
('var-002', 'prod-001', 'Gateron Red', 'Black', 'Standard', 'Wireless', 50000.00, CURRENT_TIMESTAMP),
('var-003', 'prod-001', 'Gateron Blue', 'White', 'RGB', 'Wireless', 100000.00, CURRENT_TIMESTAMP),
-- Ducky One 2 Mini variants
('var-004', 'prod-002', 'Cherry MX Brown', 'Black', 'Standard', 'Wired', 0.00, CURRENT_TIMESTAMP),
('var-005', 'prod-002', 'Cherry MX Red', 'White', 'Standard', 'Wired', 50000.00, CURRENT_TIMESTAMP),
('var-006', 'prod-002', 'Cherry MX Blue', 'Black', 'RGB', 'Wired', 100000.00, CURRENT_TIMESTAMP),
-- Leopold FC660M variants
('var-007', 'prod-003', 'Cherry MX Silent Red', 'Gray', 'PBT', 'Wired', 0.00, CURRENT_TIMESTAMP),
('var-008', 'prod-003', 'Cherry MX Brown', 'Black', 'PBT', 'Wired', 50000.00, CURRENT_TIMESTAMP),
-- Varmilo VA87M variants
('var-009', 'prod-004', 'Cherry MX Brown', 'Sakura', 'Custom', 'Wired', 0.00, CURRENT_TIMESTAMP),
('var-010', 'prod-004', 'Cherry MX Red', 'Sea Melody', 'Custom', 'Wired', 100000.00, CURRENT_TIMESTAMP),
-- Keychron K8 variants
('var-011', 'prod-005', 'Gateron Brown', 'White', 'Standard', 'Wireless', 0.00, CURRENT_TIMESTAMP),
('var-012', 'prod-005', 'Gateron Red', 'Black', 'RGB', 'Wireless', 100000.00, CURRENT_TIMESTAMP),
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

-- Stock
INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at) VALUES
('var-001', 50, 0, CURRENT_TIMESTAMP), ('var-002', 45, 0, CURRENT_TIMESTAMP),
('var-003', 30, 0, CURRENT_TIMESTAMP), ('var-004', 60, 0, CURRENT_TIMESTAMP),
('var-005', 55, 0, CURRENT_TIMESTAMP), ('var-006', 40, 0, CURRENT_TIMESTAMP),
('var-007', 35, 0, CURRENT_TIMESTAMP), ('var-008', 40, 0, CURRENT_TIMESTAMP),
('var-009', 25, 0, CURRENT_TIMESTAMP), ('var-010', 20, 0, CURRENT_TIMESTAMP),
('var-011', 50, 0, CURRENT_TIMESTAMP), ('var-012', 45, 0, CURRENT_TIMESTAMP),
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

-- Product Attributes
INSERT INTO product_attributes (attr_id, product_id, attr_name, attr_value, attr_def_id, created_at) VALUES
-- Keychron K2 attributes
('attr-001', 'prod-001', 'Layout', '75%', 'attr-def-001', CURRENT_TIMESTAMP),
('attr-002', 'prod-001', 'Connectivity', 'Wireless + Wired', 'attr-def-002', CURRENT_TIMESTAMP),
('attr-003', 'prod-001', 'Battery', '4000mAh', 'attr-def-003', CURRENT_TIMESTAMP),
('attr-004', 'prod-001', 'Hot-Swappable', 'Yes', 'attr-def-004', CURRENT_TIMESTAMP),
-- Ducky One 2 Mini attributes
('attr-005', 'prod-002', 'Layout', '60%', 'attr-def-001', CURRENT_TIMESTAMP),
('attr-006', 'prod-002', 'Connectivity', 'Wired', 'attr-def-002', CURRENT_TIMESTAMP),
('attr-007', 'prod-002', 'Keycaps', 'PBT Double-Shot', 'attr-def-012', CURRENT_TIMESTAMP),
-- Leopold FC660M attributes
('attr-008', 'prod-003', 'Layout', '65%', 'attr-def-001', CURRENT_TIMESTAMP),
('attr-009', 'prod-003', 'Build Quality', 'Premium PBT', 'attr-def-006', CURRENT_TIMESTAMP),
('attr-010', 'prod-003', 'Sound Dampening', 'Yes', NULL, CURRENT_TIMESTAMP),
-- Varmilo VA87M attributes
('attr-011', 'prod-004', 'Layout', 'TKL', 'attr-def-001', CURRENT_TIMESTAMP),
('attr-012', 'prod-004', 'Keycaps', 'Custom Dye-Sub', 'attr-def-012', CURRENT_TIMESTAMP),
('attr-013', 'prod-004', 'Artisan Design', 'Yes', NULL, CURRENT_TIMESTAMP),
-- Keychron K8 attributes
('attr-014', 'prod-005', 'Layout', 'Full-size', 'attr-def-001', CURRENT_TIMESTAMP),
('attr-015', 'prod-005', 'Multi-Device', '3 Devices', NULL, CURRENT_TIMESTAMP),
('attr-016', 'prod-005', 'Battery', '4000mAh', 'attr-def-003', CURRENT_TIMESTAMP);

INSERT INTO product_attributes (attr_id, product_id, attr_name, attr_value, price_adjustment, attr_def_id, created_at)
SELECT 
    gen_random_uuid()::text,
    product_id,
    'RGB Lighting',
    'Per-key RGB',
    100000,
    'attr-def-005',
    CURRENT_TIMESTAMP
FROM products
WHERE product_id IN ('prod-001', 'prod-002', 'prod-003');

-- Coupons
INSERT INTO coupons (coupon_id, coupon_code, description, discount_amount, discount_percentage, min_order_amount, max_usage_count, current_usage_count, expiry_date, is_active, created_at) VALUES
('coupon-001', 'WELCOME10', 'Welcome discount 10%', NULL, 10, 500000.00, 100, 0, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE, CURRENT_TIMESTAMP),
('coupon-002', 'SAVE50K', 'Save 50,000 VND', 50000.00, NULL, 1000000.00, 50, 0, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE, CURRENT_TIMESTAMP);

-- ============================================================================
-- ADDITIONAL SAMPLE DATA (10+ records per table)
-- ============================================================================

-- 1. Users
INSERT INTO users (user_id, user_name, password, phone, address, role, created_at, updated_at) VALUES
('user-baea5a38', 'customer1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0901234567', 'Số 1, Lê Duẩn, Quận 1, TP. HCM', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-6de5794f', 'customer2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0987654321', '123 Cầu Giấy, Hà Nội', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-6031b8ba', 'customer3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0912345678', '45A Nguyễn Văn Cừ, Long Biên', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-75aff72b', 'customer4', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0934567890', '89 Trần Phú, Hải Châu, Đà Nẵng', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-3c3f8523', 'customer5', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0976543210', '102 Lê Lợi, TP. Vinh', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-255c9c5b', 'customer6', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0898123456', '56 Nguyễn Huệ, Quận 1, TP. HCM', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-bfce5f18', 'customer7', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0888999777', '22 Quang Trung, Gò Vấp', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-c5d34035', 'customer8', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0868111222', '18/3 Hùng Vương, Cần Thơ', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-e116a810', 'customer9', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0945678123', '99 Lê Lai, Ninh Kiều', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('user-558a6b98', 'customer10', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0909888777', '88 Phạm Văn Đồng, Hà Nội', 'USER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (user_name) DO NOTHING;

-- 2. JWT Tokens
INSERT INTO jwt_tokens (token_id, user_id, token, token_type, status, expires_at, created_at) VALUES
('1ff01bc7-be2a-49af-bd82-f148673e7d22', 'user-baea5a38', 'token_2ac0d9c77d544a7ab011cb4cf56e7b1b', 'Bearer', 'ACTIVE', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP),
('98f78dfc-3b1a-4597-ba4e-ca3e11872c97', 'user-6de5794f', 'token_a7abede9a700452092edc55aeab6d980', 'Bearer', 'ACTIVE', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP),
('ec7ddadd-a73c-4439-908e-54d695ab7bac', 'user-6031b8ba', 'token_c61c110ffe2e4dc186f3029a9731c71f', 'Bearer', 'ACTIVE', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP),
('d0121934-eeba-45c0-9f25-cd103becf623', 'user-75aff72b', 'token_7f866c80abd44ddabf53c60d391643ab', 'Bearer', 'ACTIVE', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP),
('db736988-4505-4f3c-82eb-b29904e8d2ba', 'user-3c3f8523', 'token_64b890846d3f4abe945fc4a9a94855b6', 'Bearer', 'ACTIVE', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP),
('72fd12ff-a8af-41b7-8d4a-8051db4c0c3b', 'user-255c9c5b', 'token_a16122145ccc4ba58187ed344f12f7ac', 'Bearer', 'ACTIVE', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP),
('793cdf45-7e0d-49f4-83ff-d7e1810c6bbe', 'user-bfce5f18', 'token_294141bde12f42cf9f48dfc4a9716148', 'Bearer', 'ACTIVE', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP),
('c911ac60-b1e2-4a84-aa9e-38d5d2dd16f0', 'user-c5d34035', 'token_f01ea0f4e5714f28b2a3a70f0bbd02d7', 'Bearer', 'ACTIVE', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP),
('2e0d34d2-b7e8-4578-84ad-dd8b293a67b0', 'user-e116a810', 'token_e87c1d06aa8a42ac8f23b716e82f7c28', 'Bearer', 'ACTIVE', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP),
('00e650d8-5be2-4321-97a5-cdbb1f693e31', 'user-558a6b98', 'token_ef311897cf574b4580f49affb666673a', 'Bearer', 'ACTIVE', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP);

-- 3. Shipping Addresses
INSERT INTO shipping_addresses (id, user_id, full_name, phone, email, address, ward, district, city, postal_code, is_default, created_at, updated_at) VALUES
('addr-d1857299', 'user-baea5a38', 'Nguyễn Văn An', '0901234567', 'user1@gmail.com', 'Số 1, Lê Duẩn, Quận 1, TP. HCM', 'Bến Nghé', 'Quận 1', 'TP. HCM', '700000', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-683c9c5b', 'user-6de5794f', 'Trần Thị Bích', '0987654321', 'user2@gmail.com', '123 Cầu Giấy, Hà Nội', 'Dịch Vọng', 'Cầu Giấy', 'Hà Nội', '700001', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-41c05cf6', 'user-6031b8ba', 'Lê Hoàng Tuấn', '0912345678', 'user3@gmail.com', '45A Nguyễn Văn Cừ, Long Biên', 'Gia Thụy', 'Long Biên', 'Hà Nội', '700002', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-2edc4cb9', 'user-75aff72b', 'Phạm Minh Tâm', '0934567890', 'user4@gmail.com', '89 Trần Phú, Hải Châu, Đà Nẵng', 'Thạch Thang', 'Hải Châu', 'Đà Nẵng', '700003', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-a5e89151', 'user-3c3f8523', 'Hoàng Ngọc Ánh', '0976543210', 'user5@gmail.com', '102 Lê Lợi, TP. Vinh', 'Lê Lợi', 'TP. Vinh', 'Nghệ An', '700004', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-e70ae83b', 'user-255c9c5b', 'Vũ Đức Trí', '0898123456', 'user6@gmail.com', '56 Nguyễn Huệ, Quận 1, TP. HCM', 'Bến Nghé', 'Quận 1', 'TP. HCM', '700005', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-21015689', 'user-bfce5f18', 'Đặng Thùy Dương', '0888999777', 'user7@gmail.com', '22 Quang Trung, Gò Vấp', 'Phường 10', 'Gò Vấp', 'TP. HCM', '700006', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-b4612ff4', 'user-c5d34035', 'Bùi Xuân Phát', '0868111222', 'user8@gmail.com', '18/3 Hùng Vương, Cần Thơ', 'An Lạc', 'Hùng Vương', 'Cần Thơ', '700007', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-844a9677', 'user-e116a810', 'Đỗ Hải yến', '0945678123', 'user9@gmail.com', '99 Lê Lai, Ninh Kiều', 'An Cư', 'Ninh Kiều', 'Cần Thơ', '700008', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('addr-7a8aa513', 'user-558a6b98', 'Ngô Thành Đạt', '0909888777', 'user10@gmail.com', '88 Phạm Văn Đồng, Hà Nội', 'Cổ Nhuế', 'Bắc Từ Liêm', 'Hà Nội', '700009', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Attribute Definitions
INSERT INTO attribute_definitions (attr_def_id, attr_name, attr_display_name, attr_type, attr_unit, is_filterable, is_variant_attribute, display_order) VALUES
('attr-def-100', 'keycap_profile', 'Keycap Profile', 'SELECT', NULL, TRUE, FALSE, 15),
('attr-def-101', 'case_material', 'Chất liệu Case', 'SELECT', NULL, TRUE, FALSE, 16),
('attr-def-102', 'plate_material', 'Chất liệu Plate', 'SELECT', NULL, TRUE, FALSE, 17),
('attr-def-103', 'stabilizer', 'Stabilizer', 'TEXT', NULL, TRUE, FALSE, 18),
('attr-def-104', 'warranty', 'Bảo hành', 'TEXT', NULL, TRUE, FALSE, 19),
('attr-def-105', 'package_contents', 'Phụ kiện đi kèm', 'TEXT', NULL, TRUE, FALSE, 20),
('attr-def-106', 'mounting_style', 'Kiểu Mounting', 'SELECT', NULL, TRUE, FALSE, 21),
('attr-def-107', 'hotswap_type', 'Loại Hotswap', 'SELECT', NULL, TRUE, FALSE, 22),
('attr-def-108', 'led_type', 'Loại LED', 'TEXT', NULL, TRUE, FALSE, 23),
('attr-def-109', 'system_compat', 'Tương thích HĐH', 'TEXT', NULL, TRUE, FALSE, 24)
ON CONFLICT (attr_def_id) DO NOTHING;

-- 5. Categories
INSERT INTO categories (categories_id, categories_name, description, created_at) VALUES
('cat-100', 'Keycap Set', 'Danh mục Keycap Set cao cấp', CURRENT_TIMESTAMP),
('cat-101', 'Switch Pack', 'Danh mục Switch Pack cao cấp', CURRENT_TIMESTAMP),
('cat-102', 'Cable Custom', 'Danh mục Cable Custom cao cấp', CURRENT_TIMESTAMP),
('cat-103', 'Kit Bàn Phím', 'Danh mục Kit Bàn Phím cao cấp', CURRENT_TIMESTAMP),
('cat-104', 'Lube & Mod', 'Danh mục Lube & Mod cao cấp', CURRENT_TIMESTAMP),
('cat-105', 'Kê tay (Wrist Rest)', 'Danh mục Kê tay (Wrist Rest) cao cấp', CURRENT_TIMESTAMP),
('cat-106', 'Deskmat', 'Danh mục Deskmat cao cấp', CURRENT_TIMESTAMP),
('cat-107', 'Dụng cụ bảo dưỡng', 'Danh mục Dụng cụ bảo dưỡng cao cấp', CURRENT_TIMESTAMP),
('cat-108', 'Trục cơ (Artisan)', 'Danh mục Trục cơ (Artisan) cao cấp', CURRENT_TIMESTAMP),
('cat-109', 'Phụ kiện khác', 'Danh mục Phụ kiện khác cao cấp', CURRENT_TIMESTAMP)
ON CONFLICT (categories_name) DO NOTHING;

-- 6. Brands
INSERT INTO brands (brands_id, brands_name, description, created_at) VALUES
('brand-100', 'Gateron', 'Thương hiệu Gateron chính hãng', CURRENT_TIMESTAMP),
('brand-101', 'Cherry', 'Thương hiệu Cherry chính hãng', CURRENT_TIMESTAMP),
('brand-102', 'Kailh', 'Thương hiệu Kailh chính hãng', CURRENT_TIMESTAMP),
('brand-103', 'Outemu', 'Thương hiệu Outemu chính hãng', CURRENT_TIMESTAMP),
('brand-104', 'Krytox', 'Thương hiệu Krytox chính hãng', CURRENT_TIMESTAMP),
('brand-105', 'Kelowna', 'Thương hiệu Kelowna chính hãng', CURRENT_TIMESTAMP),
('brand-106', 'Wuque Studio', 'Thương hiệu Wuque Studio chính hãng', CURRENT_TIMESTAMP),
('brand-107', 'KBDfans', 'Thương hiệu KBDfans chính hãng', CURRENT_TIMESTAMP),
('brand-108', 'GMK', 'Thương hiệu GMK chính hãng', CURRENT_TIMESTAMP),
('brand-109', 'JTK', 'Thương hiệu JTK chính hãng', CURRENT_TIMESTAMP)
ON CONFLICT (brands_name) DO NOTHING;

-- 7. Products
INSERT INTO products (product_id, categories_id, brands_id, product_name, description, base_price, support, image, created_at, updated_at) VALUES
('prod-100', 'cat-100', 'brand-108', 'GMK Olivia Keycaps', 'Set keycap GMK ABS Double-shot cao cấp màu hồng đen', 3500000.0, 'Tất cả Layout', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-101', 'cat-101', 'brand-100', 'Gateron Milky Yellow Pro', 'Pack 45 switch Linear quốc dân lube sẵn cực mượt', 250000.0, 'Tất cả Layout', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-102', 'cat-101', 'brand-101', 'Cherry MX Red Hyperglide', 'Switch Linear thế hệ mới của Cherry với độ bền 100M', 350000.0, 'Tất cả Layout', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-103', 'cat-104', 'brand-104', 'Krytox 205g0 5g', 'Mỡ trơn Krytox lube switch cực mượt', 200000.0, 'Tất cả Layout', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-104', 'cat-106', 'brand-106', 'Deskmat Wuque Studio', 'Bàn di chuột size lớn chất liệu vải cao cấp', 450000.0, 'Tất cả Layout', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-105', 'cat-103', 'brand-107', 'KBD8X MKIII Kit', 'Nhôm CNC nguyên khối cực xịn từ KBDfans', 6500000.0, 'Tất cả Layout', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-106', 'cat-100', 'brand-109', 'JTK Zen Keycaps', 'Double-shot ABS với tone màu đen trắng cực đẹp', 2200000.0, 'Tất cả Layout', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-107', 'cat-101', 'brand-102', 'Kailh Box White', 'Switch Clicky nổi tiếng với thiết kế Click-bar', 280000.0, 'Tất cả Layout', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-108', 'cat-105', 'brand-107', 'Kê tay gỗ óc chó', 'Kê tay đánh bóng tự nhiên cho bàn phím 75/TKL', 350000.0, 'Tất cả Layout', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-109', 'cat-107', 'brand-105', 'Switch Puller Kelowna', 'Dụng cụ nhổ switch chuẩn thép không gỉ', 80000.0, 'Tất cả Layout', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (product_id) DO NOTHING;

-- 8. Product Attributes
INSERT INTO product_attributes (attr_id, product_id, attr_name, attr_value, attr_def_id, created_at) VALUES
('attr-new-000', 'prod-100', 'keycap_profile', 'Giá trị chuẩn của keycap_profile', 'attr-def-100', CURRENT_TIMESTAMP),
('attr-new-001', 'prod-101', 'case_material', 'Giá trị chuẩn của case_material', 'attr-def-101', CURRENT_TIMESTAMP),
('attr-new-002', 'prod-102', 'plate_material', 'Giá trị chuẩn của plate_material', 'attr-def-102', CURRENT_TIMESTAMP),
('attr-new-003', 'prod-103', 'stabilizer', 'Giá trị chuẩn của stabilizer', 'attr-def-103', CURRENT_TIMESTAMP),
('attr-new-004', 'prod-104', 'warranty', 'Giá trị chuẩn của warranty', 'attr-def-104', CURRENT_TIMESTAMP),
('attr-new-005', 'prod-105', 'package_contents', 'Giá trị chuẩn của package_contents', 'attr-def-105', CURRENT_TIMESTAMP),
('attr-new-006', 'prod-106', 'mounting_style', 'Giá trị chuẩn của mounting_style', 'attr-def-106', CURRENT_TIMESTAMP),
('attr-new-007', 'prod-107', 'hotswap_type', 'Giá trị chuẩn của hotswap_type', 'attr-def-107', CURRENT_TIMESTAMP),
('attr-new-008', 'prod-108', 'led_type', 'Giá trị chuẩn của led_type', 'attr-def-108', CURRENT_TIMESTAMP),
('attr-new-009', 'prod-109', 'system_compat', 'Giá trị chuẩn của system_compat', 'attr-def-109', CURRENT_TIMESTAMP);

-- 9. Product Variants
INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at) VALUES
('var-100', 'prod-100', 'Mặc định', 'Trắng', 'Mặc định', 'Có dây/Không dây', 0.00, CURRENT_TIMESTAMP),
('var-101', 'prod-101', 'Mặc định', 'Trắng', 'Mặc định', 'Có dây/Không dây', 0.00, CURRENT_TIMESTAMP),
('var-102', 'prod-102', 'Mặc định', 'Trắng', 'Mặc định', 'Có dây/Không dây', 0.00, CURRENT_TIMESTAMP),
('var-103', 'prod-103', 'Mặc định', 'Trắng', 'Mặc định', 'Có dây/Không dây', 0.00, CURRENT_TIMESTAMP),
('var-104', 'prod-104', 'Mặc định', 'Mint', 'Mặc định', 'Có dây/Không dây', 0.00, CURRENT_TIMESTAMP),
('var-105', 'prod-105', 'Mặc định', 'Trắng', 'Mặc định', 'Có dây/Không dây', 0.00, CURRENT_TIMESTAMP),
('var-106', 'prod-106', 'Mặc định', 'Hồng', 'Mặc định', 'Có dây/Không dây', 0.00, CURRENT_TIMESTAMP),
('var-107', 'prod-107', 'Mặc định', 'Hồng', 'Mặc định', 'Có dây/Không dây', 0.00, CURRENT_TIMESTAMP),
('var-108', 'prod-108', 'Mặc định', 'Đen', 'Mặc định', 'Có dây/Không dây', 0.00, CURRENT_TIMESTAMP),
('var-109', 'prod-109', 'Mặc định', 'Đen', 'Mặc định', 'Có dây/Không dây', 0.00, CURRENT_TIMESTAMP)
ON CONFLICT (pro_variant_id) DO NOTHING;

-- 10. Stock
INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at) VALUES
('var-100', 100, 0, CURRENT_TIMESTAMP),
('var-101', 105, 0, CURRENT_TIMESTAMP),
('var-102', 110, 0, CURRENT_TIMESTAMP),
('var-103', 115, 0, CURRENT_TIMESTAMP),
('var-104', 120, 0, CURRENT_TIMESTAMP),
('var-105', 125, 0, CURRENT_TIMESTAMP),
('var-106', 130, 0, CURRENT_TIMESTAMP),
('var-107', 135, 0, CURRENT_TIMESTAMP),
('var-108', 140, 0, CURRENT_TIMESTAMP),
('var-109', 145, 0, CURRENT_TIMESTAMP)
ON CONFLICT (pro_variant_id) DO NOTHING;

-- 11. Product Views
INSERT INTO product_views (id, user_id, product_id, viewed_at) VALUES
('5ecbdb61-dd60-4a39-8f70-434fd013d0d3', 'user-baea5a38', 'prod-100', CURRENT_TIMESTAMP),
('8bf58f90-a0c8-4dfa-b021-a761fcb54a7d', 'user-6de5794f', 'prod-101', CURRENT_TIMESTAMP),
('89a5007b-cc02-447f-96bf-590d5a2026b8', 'user-6031b8ba', 'prod-102', CURRENT_TIMESTAMP),
('c5c310b8-d7e0-4d42-baf0-f1a50dd971e0', 'user-75aff72b', 'prod-103', CURRENT_TIMESTAMP),
('b7935d64-fb91-4e18-bd12-1bb5108adc2b', 'user-3c3f8523', 'prod-104', CURRENT_TIMESTAMP),
('6cbc867d-58f3-4cd7-a96e-cdf46bf59565', 'user-255c9c5b', 'prod-105', CURRENT_TIMESTAMP),
('2711a4b5-10ae-4687-a873-5c4b6ee71afa', 'user-bfce5f18', 'prod-106', CURRENT_TIMESTAMP),
('dea61c43-e1b8-4d39-b015-83afdfef825b', 'user-c5d34035', 'prod-107', CURRENT_TIMESTAMP),
('b3fbbf51-b6bb-4089-aa33-87f48f233056', 'user-e116a810', 'prod-108', CURRENT_TIMESTAMP),
('c77a93c6-592c-4763-ba25-57c81ec8db04', 'user-558a6b98', 'prod-109', CURRENT_TIMESTAMP);

-- 12. Carts
INSERT INTO carts (cart_id, user_id, created_at, updated_at) VALUES
('cart-4e581535', 'user-baea5a38', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cart-c511fdd0', 'user-6de5794f', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cart-ef60976d', 'user-6031b8ba', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cart-755bb2f9', 'user-75aff72b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cart-287d091c', 'user-3c3f8523', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cart-a07835f6', 'user-255c9c5b', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cart-6f13c94d', 'user-bfce5f18', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cart-0831f13e', 'user-c5d34035', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cart-4bfd4f87', 'user-e116a810', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('cart-f5080120', 'user-558a6b98', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (user_id) DO NOTHING;

-- 13. Cart Items
INSERT INTO cart_items (cart_item_id, cart_id, pro_variant_id, quantity, created_at, updated_at) VALUES
('citem-5a5f1712', 'cart-4e581535', 'var-100', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('citem-177b56e3', 'cart-c511fdd0', 'var-101', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('citem-b21f1e1b', 'cart-ef60976d', 'var-102', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('citem-c7a39a71', 'cart-755bb2f9', 'var-103', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('citem-4434199f', 'cart-287d091c', 'var-104', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('citem-113f5a14', 'cart-a07835f6', 'var-105', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('citem-7a3fcc5c', 'cart-6f13c94d', 'var-106', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('citem-1bd33917', 'cart-0831f13e', 'var-107', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('citem-986c5fba', 'cart-4bfd4f87', 'var-108', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('citem-55db1b95', 'cart-f5080120', 'var-109', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 14. Orders
INSERT INTO orders (order_id, user_id, total_amount, order_status, shipping_address, shipping_city, shipping_postal_code, shipping_phone, created_at, updated_at) VALUES
('order-R100', 'user-3c3f8523', 3000000.0, 'CONFIRMED', '22 Quang Trung, Gò Vấp', 'Hà Nội', '100000', '0909888777', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('order-R101', 'user-bfce5f18', 700000.0, 'SHIPPED', '123 Cầu Giấy, Hà Nội', 'TP. HCM', '100000', '0901234567', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('order-R102', 'user-baea5a38', 1200000.0, 'DELIVERED', 'Số 1, Lê Duẩn, Quận 1, TP. HCM', 'TP. HCM', '100000', '0912345678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('order-R103', 'user-admin-001', 1300000.0, 'DELIVERED', '45A Nguyễn Văn Cừ, Long Biên', 'Cần Thơ', '100000', '0898123456', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('order-R104', 'user-bfce5f18', 300000.0, 'PENDING', '99 Lê Lai, Ninh Kiều', 'Đà Nẵng', '100000', '0934567890', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('order-R105', 'user-c5d34035', 1600000.0, 'PENDING', '123 Cầu Giấy, Hà Nội', 'Cần Thơ', '100000', '0868111222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('order-R106', 'user-baea5a38', 3000000.0, 'PENDING', '123 Cầu Giấy, Hà Nội', 'Hà Nội', '100000', '0901234567', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('order-R107', 'user-e116a810', 1000000.0, 'PENDING', '18/3 Hùng Vương, Cần Thơ', 'Đà Nẵng', '100000', '0945678123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('order-R108', 'user-c5d34035', 1800000.0, 'CONFIRMED', '18/3 Hùng Vương, Cần Thơ', 'Đà Nẵng', '100000', '0912345678', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('order-R109', 'user-baea5a38', 2200000.0, 'PENDING', 'Số 1, Lê Duẩn, Quận 1, TP. HCM', 'Cần Thơ', '100000', '0945678123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('order-R110', 'user-baea5a38', 2500000.0, 'PENDING', '88 Phạm Văn Đồng, Hà Nội', 'Cần Thơ', '100000', '0934567890', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('order-R111', 'user-test-001', 1600000.0, 'DELIVERED', 'Số 1, Lê Duẩn, Quận 1, TP. HCM', 'Nghệ An', '100000', '0945678123', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('order-R112', 'user-75aff72b', 400000.0, 'SHIPPED', '45A Nguyễn Văn Cừ, Long Biên', 'Hà Nội', '100000', '0934567890', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('order-R113', 'user-6de5794f', 1300000.0, 'CONFIRMED', '22 Quang Trung, Gò Vấp', 'Cần Thơ', '100000', '0909888777', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('order-R114', 'user-bfce5f18', 700000.0, 'PROCESSING', '102 Lê Lợi, TP. Vinh', 'Cần Thơ', '100000', '0888999777', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 15. Order Items
INSERT INTO order_items (order_item_id, product_id, order_id, pro_variant_id, quantity, price, created_at) VALUES
('oitem-R100', 'prod-001', 'order-R100', 'var-001', 1, 1100000.0, CURRENT_TIMESTAMP),
('oitem-R101', 'prod-002', 'order-R101', 'var-004', 1, 1700000.0, CURRENT_TIMESTAMP),
('oitem-R102', 'prod-003', 'order-R102', 'var-007', 2, 1800000.0, CURRENT_TIMESTAMP),
('oitem-R103', 'prod-100', 'order-R103', 'var-100', 2, 2400000.0, CURRENT_TIMESTAMP),
('oitem-R104', 'prod-101', 'order-R104', 'var-101', 2, 1900000.0, CURRENT_TIMESTAMP),
('oitem-R105', 'prod-102', 'order-R105', 'var-102', 2, 1800000.0, CURRENT_TIMESTAMP),
('oitem-R106', 'prod-103', 'order-R106', 'var-103', 2, 1200000.0, CURRENT_TIMESTAMP),
('oitem-R107', 'prod-104', 'order-R107', 'var-104', 2, 3200000.0, CURRENT_TIMESTAMP),
('oitem-R108', 'prod-105', 'order-R108', 'var-105', 1, 800000.0, CURRENT_TIMESTAMP),
('oitem-R109', 'prod-106', 'order-R109', 'var-106', 2, 1200000.0, CURRENT_TIMESTAMP),
('oitem-R110', 'prod-107', 'order-R110', 'var-107', 1, 1700000.0, CURRENT_TIMESTAMP),
('oitem-R111', 'prod-108', 'order-R111', 'var-108', 2, 1900000.0, CURRENT_TIMESTAMP),
('oitem-R112', 'prod-109', 'order-R112', 'var-109', 2, 1400000.0, CURRENT_TIMESTAMP),
('oitem-R113', 'prod-001', 'order-R113', 'var-001', 2, 3000000.0, CURRENT_TIMESTAMP),
('oitem-R114', 'prod-002', 'order-R114', 'var-004', 2, 1500000.0, CURRENT_TIMESTAMP);

-- 16. Payment
INSERT INTO payment (payment_id, order_id, payment_method, payment_status, transaction_id, amount, created_at, updated_at) VALUES
('pay-R100', 'order-R100', 'VNPAY', 'PENDING', 'VNPAY67134EA35648', 1600000.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pay-R101', 'order-R101', 'VNPAY', 'SUCCESS', 'VNPAY5E03AB910076', 1600000.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pay-R102', 'order-R102', 'VNPAY', 'SUCCESS', 'VNPAY09F1D8D9DDE1', 2500000.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pay-R103', 'order-R103', 'VNPAY', 'SUCCESS', 'VNPAY281A8BC90AEA', 2800000.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pay-R104', 'order-R104', 'VNPAY', 'PENDING', 'VNPAY0B5201CF94B4', 1500000.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pay-R105', 'order-R105', 'VNPAY', 'SUCCESS', 'VNPAYC7A6559A64FC', 1500000.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pay-R106', 'order-R106', 'VNPAY', 'SUCCESS', 'VNPAY539E57AA31CE', 2200000.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pay-R107', 'order-R107', 'VNPAY', 'SUCCESS', 'VNPAY7BB51986DF21', 1300000.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pay-R108', 'order-R108', 'VNPAY', 'PENDING', 'VNPAY3F34764CF477', 900000.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pay-R109', 'order-R109', 'VNPAY', 'SUCCESS', 'VNPAY963E9B669421', 700000.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pay-R110', 'order-R110', 'VNPAY', 'SUCCESS', 'VNPAYC15E27FDD69E', 2300000.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pay-R111', 'order-R111', 'VNPAY', 'SUCCESS', 'VNPAY3452E89ADC88', 600000.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pay-R112', 'order-R112', 'VNPAY', 'PENDING', 'VNPAY9C0CCC6A74D5', 3000000.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pay-R113', 'order-R113', 'VNPAY', 'SUCCESS', 'VNPAY4D42D9E3B22F', 2200000.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('pay-R114', 'order-R114', 'VNPAY', 'SUCCESS', 'VNPAY84A568E7D197', 400000.0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 17. Wishlists
INSERT INTO wishlists (wishlist_id, product_id, user_id, created_at) VALUES
('wl-R100', 'prod-100', 'user-baea5a38', CURRENT_TIMESTAMP),
('wl-R101', 'prod-104', 'user-6de5794f', CURRENT_TIMESTAMP),
('wl-R102', 'prod-108', 'user-6031b8ba', CURRENT_TIMESTAMP),
('wl-R103', 'prod-102', 'user-75aff72b', CURRENT_TIMESTAMP),
('wl-R104', 'prod-106', 'user-3c3f8523', CURRENT_TIMESTAMP),
('wl-R105', 'prod-100', 'user-255c9c5b', CURRENT_TIMESTAMP),
('wl-R106', 'prod-104', 'user-bfce5f18', CURRENT_TIMESTAMP),
('wl-R107', 'prod-108', 'user-c5d34035', CURRENT_TIMESTAMP),
('wl-R108', 'prod-102', 'user-e116a810', CURRENT_TIMESTAMP),
('wl-R109', 'prod-106', 'user-558a6b98', CURRENT_TIMESTAMP)
ON CONFLICT (user_id, product_id) DO NOTHING;

-- 18. Reviews
INSERT INTO reviews (review_id, user_id, product_id, rating, comment, created_at, updated_at) VALUES
('rev-R100', 'user-6de5794f', 'prod-104', 4, 'Màu sắc keycap đẹp, không lệch màu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-R101', 'user-admin-001', 'prod-101', 4, 'Chất lượng phím rất tốt so với giá thành', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-R102', 'user-75aff72b', 'prod-102', 4, 'Switches lube sẵn mượt mà', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-R103', 'user-admin-001', 'prod-100', 4, 'Shop tư vấn nhiệt tình', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-R104', 'user-c5d34035', 'prod-001', 5, 'Giao hàng nhanh, đóng gói cẩn thận', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-R105', 'user-admin-001', 'prod-103', 4, 'Switches lube sẵn mượt mà', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-R106', 'user-bfce5f18', 'prod-001', 5, 'Màu sắc keycap đẹp, không lệch màu', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-R107', 'user-c5d34035', 'prod-100', 5, 'Shop tư vấn nhiệt tình', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-R108', 'user-6de5794f', 'prod-109', 4, 'Switches lube sẵn mượt mà', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('rev-R109', 'user-3c3f8523', 'prod-108', 4, 'Switches lube sẵn mượt mà', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (user_id, product_id) DO NOTHING;

-- 19. Coupons
INSERT INTO coupons (coupon_id, coupon_code, description, discount_amount, discount_percentage, min_order_amount, max_usage_count, current_usage_count, expiry_date, is_active, created_at) VALUES
('coupon-R100', 'GEARFLOW10', 'Mã giảm giá Khai trương GearFlow', 50000.0, NULL, 500000.0, 50, 0, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE, CURRENT_TIMESTAMP),
('coupon-R101', 'GEARFLOW11', 'Mã giảm giá Khai trương GearFlow', 100000.0, NULL, 500000.0, 50, 0, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE, CURRENT_TIMESTAMP),
('coupon-R102', 'GEARFLOW12', 'Mã giảm giá Khai trương GearFlow', 150000.0, NULL, 500000.0, 50, 0, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE, CURRENT_TIMESTAMP),
('coupon-R103', 'GEARFLOW13', 'Mã giảm giá Khai trương GearFlow', 50000.0, NULL, 500000.0, 50, 0, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE, CURRENT_TIMESTAMP),
('coupon-R104', 'GEARFLOW14', 'Mã giảm giá Khai trương GearFlow', 100000.0, NULL, 500000.0, 50, 0, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE, CURRENT_TIMESTAMP),
('coupon-R105', 'GEARFLOW15', 'Mã giảm giá Khai trương GearFlow', 150000.0, NULL, 500000.0, 50, 0, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE, CURRENT_TIMESTAMP),
('coupon-R106', 'GEARFLOW16', 'Mã giảm giá Khai trương GearFlow', 50000.0, NULL, 500000.0, 50, 0, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE, CURRENT_TIMESTAMP),
('coupon-R107', 'GEARFLOW17', 'Mã giảm giá Khai trương GearFlow', 100000.0, NULL, 500000.0, 50, 0, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE, CURRENT_TIMESTAMP),
('coupon-R108', 'GEARFLOW18', 'Mã giảm giá Khai trương GearFlow', 150000.0, NULL, 500000.0, 50, 0, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE, CURRENT_TIMESTAMP),
('coupon-R109', 'GEARFLOW19', 'Mã giảm giá Khai trương GearFlow', 50000.0, NULL, 500000.0, 50, 0, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE, CURRENT_TIMESTAMP);

-- 20. Notifications
INSERT INTO notifications (notification_id, user_id, type, title, message, is_read, created_at) VALUES
('notif-R100', 'user-e116a810', 'PROMOTION', 'Khuyến mãi đặc biệt!', 'Tặng ngay 50k khi mua đơn hàng từ 500k', FALSE, CURRENT_TIMESTAMP),
('notif-R101', 'user-e116a810', 'PROMOTION', 'Khuyến mãi đặc biệt!', 'Tặng ngay 50k khi mua đơn hàng từ 500k', FALSE, CURRENT_TIMESTAMP),
('notif-R102', 'user-75aff72b', 'PROMOTION', 'Khuyến mãi đặc biệt!', 'Tặng ngay 50k khi mua đơn hàng từ 500k', FALSE, CURRENT_TIMESTAMP),
('notif-R103', 'user-baea5a38', 'PROMOTION', 'Khuyến mãi đặc biệt!', 'Tặng ngay 50k khi mua đơn hàng từ 500k', FALSE, CURRENT_TIMESTAMP),
('notif-R104', 'user-255c9c5b', 'PROMOTION', 'Khuyến mãi đặc biệt!', 'Tặng ngay 50k khi mua đơn hàng từ 500k', FALSE, CURRENT_TIMESTAMP),
('notif-R105', 'user-558a6b98', 'PROMOTION', 'Khuyến mãi đặc biệt!', 'Tặng ngay 50k khi mua đơn hàng từ 500k', FALSE, CURRENT_TIMESTAMP),
('notif-R106', 'user-e116a810', 'PROMOTION', 'Khuyến mãi đặc biệt!', 'Tặng ngay 50k khi mua đơn hàng từ 500k', FALSE, CURRENT_TIMESTAMP),
('notif-R107', 'user-6031b8ba', 'PROMOTION', 'Khuyến mãi đặc biệt!', 'Tặng ngay 50k khi mua đơn hàng từ 500k', FALSE, CURRENT_TIMESTAMP),
('notif-R108', 'user-bfce5f18', 'PROMOTION', 'Khuyến mãi đặc biệt!', 'Tặng ngay 50k khi mua đơn hàng từ 500k', FALSE, CURRENT_TIMESTAMP),
('notif-R109', 'user-bfce5f18', 'PROMOTION', 'Khuyến mãi đặc biệt!', 'Tặng ngay 50k khi mua đơn hàng từ 500k', FALSE, CURRENT_TIMESTAMP);