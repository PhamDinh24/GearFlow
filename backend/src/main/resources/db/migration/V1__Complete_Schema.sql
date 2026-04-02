-- ============================================================================
-- GearFlow E-commerce Database Schema
-- Complete schema with all tables, indexes, and sample data
-- ============================================================================

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address VARCHAR(500),
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Categories table
CREATE TABLE categories (
    categories_id VARCHAR(36) PRIMARY KEY,
    categories_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Brands table
CREATE TABLE brands (
    brands_id VARCHAR(36) PRIMARY KEY,
    brands_name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PRODUCT TABLES
-- ============================================================================

-- Products table
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

-- Product attributes table
CREATE TABLE product_attributes (
    attr_id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    attr_name VARCHAR(100) NOT NULL,
    attr_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_attributes_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- Product variants table
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

-- Stock table
CREATE TABLE stock (
    pro_variant_id VARCHAR(36) PRIMARY KEY,
    quantity INT NOT NULL DEFAULT 0,
    reserved INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_variant FOREIGN KEY (pro_variant_id) REFERENCES product_variants(pro_variant_id) ON DELETE CASCADE
);

-- Product views tracking table
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

-- Carts table
CREATE TABLE carts (
    cart_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Cart items table
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

-- Orders table
CREATE TABLE orders (
    order_id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Order items table
CREATE TABLE order_items (
    order_item_id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    order_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(product_id),
    CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Payment table
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

-- Wishlists table
CREATE TABLE wishlists (
    wishlist_id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlists_product FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE,
    CONSTRAINT fk_wishlists_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT uk_wishlists_user_product UNIQUE(user_id, product_id)
);

-- Reviews table
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

-- Coupons table
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

-- Notifications table
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

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Note: Users will be created by DataInitializer with proper password hashing

-- Insert categories
INSERT INTO categories (categories_id, categories_name, description, created_at) VALUES
('cat-001', 'Mechanical Keyboards', 'High-quality mechanical keyboards for enthusiasts', CURRENT_TIMESTAMP),
('cat-002', 'Gaming Keyboards', 'Performance gaming keyboards with RGB', CURRENT_TIMESTAMP),
('cat-003', 'Office Keyboards', 'Professional keyboards for productivity', CURRENT_TIMESTAMP);

-- Insert brands
INSERT INTO brands (brands_id, brands_name, description, created_at) VALUES
('brand-001', 'Keychron', 'Premium wireless mechanical keyboards', CURRENT_TIMESTAMP),
('brand-002', 'Ducky', 'High-end gaming keyboards', CURRENT_TIMESTAMP),
('brand-003', 'Leopold', 'Professional quality keyboards', CURRENT_TIMESTAMP),
('brand-004', 'Varmilo', 'Custom artisan keyboards', CURRENT_TIMESTAMP);

-- Insert products (VND prices)
INSERT INTO products (product_id, categories_id, brands_id, product_name, description, base_price, support, image, created_at, updated_at) VALUES
('prod-001', 'cat-001', 'brand-001', 'Keychron K2 V2', 'Compact 75% wireless mechanical keyboard with RGB backlight and hot-swappable switches', 890000.00, 'Windows, Mac, Linux', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-002', 'cat-002', 'brand-002', 'Ducky One 2 Mini', '60% mechanical gaming keyboard with Cherry MX switches and PBT keycaps', 1190000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-003', 'cat-001', 'brand-003', 'Leopold FC660M', 'Compact 65% mechanical keyboard for professionals with premium build quality', 1290000.00, 'Windows, Mac, Linux', 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-004', 'cat-002', 'brand-004', 'Varmilo VA87M', 'TKL mechanical keyboard with custom dye-sublimated keycaps', 1490000.00, 'Windows, Mac', 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('prod-005', 'cat-003', 'brand-001', 'Keychron K8', 'Full-size wireless mechanical keyboard with multi-device support', 990000.00, 'Windows, Mac, Linux, iOS, Android', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert product variants
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
('var-012', 'prod-005', 'Gateron Red', 'Black', 'RGB', 'Wireless', 100000.00, CURRENT_TIMESTAMP);

-- Insert stock for all variants
INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at) VALUES
('var-001', 50, 0, CURRENT_TIMESTAMP),
('var-002', 45, 0, CURRENT_TIMESTAMP),
('var-003', 30, 0, CURRENT_TIMESTAMP),
('var-004', 60, 0, CURRENT_TIMESTAMP),
('var-005', 55, 0, CURRENT_TIMESTAMP),
('var-006', 40, 0, CURRENT_TIMESTAMP),
('var-007', 35, 0, CURRENT_TIMESTAMP),
('var-008', 40, 0, CURRENT_TIMESTAMP),
('var-009', 25, 0, CURRENT_TIMESTAMP),
('var-010', 20, 0, CURRENT_TIMESTAMP),
('var-011', 50, 0, CURRENT_TIMESTAMP),
('var-012', 45, 0, CURRENT_TIMESTAMP);

-- Insert product attributes
INSERT INTO product_attributes (attr_id, product_id, attr_name, attr_value, created_at) VALUES
-- Keychron K2 attributes
('attr-001', 'prod-001', 'Layout', '75%', CURRENT_TIMESTAMP),
('attr-002', 'prod-001', 'Connectivity', 'Wireless + Wired', CURRENT_TIMESTAMP),
('attr-003', 'prod-001', 'Battery', '4000mAh', CURRENT_TIMESTAMP),
('attr-004', 'prod-001', 'Hot-Swappable', 'Yes', CURRENT_TIMESTAMP),
-- Ducky One 2 Mini attributes
('attr-005', 'prod-002', 'Layout', '60%', CURRENT_TIMESTAMP),
('attr-006', 'prod-002', 'Connectivity', 'Wired', CURRENT_TIMESTAMP),
('attr-007', 'prod-002', 'Keycaps', 'PBT Double-Shot', CURRENT_TIMESTAMP),
-- Leopold FC660M attributes
('attr-008', 'prod-003', 'Layout', '65%', CURRENT_TIMESTAMP),
('attr-009', 'prod-003', 'Build Quality', 'Premium PBT', CURRENT_TIMESTAMP),
('attr-010', 'prod-003', 'Sound Dampening', 'Yes', CURRENT_TIMESTAMP),
-- Varmilo VA87M attributes
('attr-011', 'prod-004', 'Layout', 'TKL', CURRENT_TIMESTAMP),
('attr-012', 'prod-004', 'Keycaps', 'Custom Dye-Sub', CURRENT_TIMESTAMP),
('attr-013', 'prod-004', 'Artisan Design', 'Yes', CURRENT_TIMESTAMP),
-- Keychron K8 attributes
('attr-014', 'prod-005', 'Layout', 'Full-size', CURRENT_TIMESTAMP),
('attr-015', 'prod-005', 'Multi-Device', '3 Devices', CURRENT_TIMESTAMP),
('attr-016', 'prod-005', 'Battery', '4000mAh', CURRENT_TIMESTAMP);

-- Insert sample coupons
INSERT INTO coupons (coupon_id, coupon_code, description, discount_amount, discount_percentage, min_order_amount, max_usage_count, current_usage_count, expiry_date, is_active, created_at) VALUES
('coupon-001', 'WELCOME10', 'Welcome discount 10%', NULL, 10, 500000.00, 100, 0, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE, CURRENT_TIMESTAMP),
('coupon-002', 'SAVE50K', 'Save 50,000 VND', 50000.00, NULL, 1000000.00, 50, 0, CURRENT_TIMESTAMP + INTERVAL '30 days', TRUE, CURRENT_TIMESTAMP);
