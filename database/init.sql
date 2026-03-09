-- Create database
CREATE DATABASE IF NOT EXISTS keyboard_shop;
USE keyboard_shop;

-- Users table
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address VARCHAR(500),
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL
);

-- Products table
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DOUBLE NOT NULL,
    stock INT NOT NULL,
    brand VARCHAR(100),
    switch_type ENUM('LINEAR', 'TACTILE', 'CLICKY'),
    layout VARCHAR(50),
    wireless BOOLEAN DEFAULT FALSE,
    rgb BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL
);

-- Orders table
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    total_price DOUBLE NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    shipping_address VARCHAR(500),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Order items table
CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    price DOUBLE NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Sample data
INSERT INTO users (email, password, full_name, phone, address, role) VALUES
('admin@keyboard.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy990qm', 'Admin User', '0123456789', '123 Admin St', 'ADMIN'),
('user@keyboard.com', '$2a$10$slYQmyNdGzin7olVN3p5Be7DlH.PKZbv5H8KnzzVgXXbVxzy990qm', 'Test User', '0987654321', '456 User Ave', 'USER');

INSERT INTO products (name, description, price, stock, brand, switch_type, layout, wireless, rgb, image_url) VALUES
('Corsair K95 Platinum', 'Premium mechanical keyboard with RGB lighting', 199.99, 10, 'Corsair', 'LINEAR', '104', FALSE, TRUE, 'https://via.placeholder.com/300'),
('Razer DeathStalker V2', 'Ultra-thin mechanical keyboard', 149.99, 15, 'Razer', 'LINEAR', '104', FALSE, TRUE, 'https://via.placeholder.com/300'),
('SteelSeries Apex Pro', 'Adjustable mechanical switches', 199.99, 8, 'SteelSeries', 'TACTILE', '104', FALSE, TRUE, 'https://via.placeholder.com/300'),
('Logitech G Pro X', 'Compact mechanical keyboard', 129.99, 20, 'Logitech', 'CLICKY', '80', TRUE, TRUE, 'https://via.placeholder.com/300'),
('Ducky One 2 Mini', 'Compact 60% keyboard', 119.99, 12, 'Ducky', 'LINEAR', '60', FALSE, TRUE, 'https://via.placeholder.com/300');
