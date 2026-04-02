-- ============================================================================
-- V9: Improve Product Attributes System
-- Thêm bảng attribute definitions và cải thiện product attributes
-- ============================================================================

-- Bảng định nghĩa các loại thuộc tính (attribute types)
CREATE TABLE IF NOT EXISTS attribute_definitions (
    attr_def_id VARCHAR(36) PRIMARY KEY,
    attr_name VARCHAR(100) NOT NULL UNIQUE,
    attr_display_name VARCHAR(200) NOT NULL,
    attr_type VARCHAR(50) NOT NULL DEFAULT 'TEXT', -- TEXT, NUMBER, SELECT, COLOR
    attr_unit VARCHAR(20), -- VD: mm, g, %
    is_filterable BOOLEAN DEFAULT FALSE,
    is_variant_attribute BOOLEAN DEFAULT FALSE, -- Thuộc tính tạo variant (color, size, etc)
    display_order INT DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Thêm cột price_adjustment vào product_attributes
ALTER TABLE product_attributes 
ADD COLUMN IF NOT EXISTS price_adjustment DECIMAL(10, 2) DEFAULT 0;

-- Thêm cột attr_def_id để link với attribute_definitions
ALTER TABLE product_attributes
ADD COLUMN IF NOT EXISTS attr_def_id VARCHAR(36);

-- Thêm foreign key
ALTER TABLE product_attributes
ADD CONSTRAINT fk_product_attributes_definition 
FOREIGN KEY (attr_def_id) REFERENCES attribute_definitions(attr_def_id) ON DELETE SET NULL;

-- Index cho performance
CREATE INDEX IF NOT EXISTS idx_product_attributes_def ON product_attributes(attr_def_id);
CREATE INDEX IF NOT EXISTS idx_attribute_definitions_name ON attribute_definitions(attr_name);
CREATE INDEX IF NOT EXISTS idx_attribute_definitions_filterable ON attribute_definitions(is_filterable);

-- Insert các attribute definitions mặc định cho bàn phím cơ
INSERT INTO attribute_definitions (attr_def_id, attr_name, attr_display_name, attr_type, attr_unit, is_filterable, is_variant_attribute, display_order) VALUES
-- Thuộc tính cơ bản
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
-- Thuộc tính variant (tạo biến thể)
('attr-def-011', 'switch_type', 'Loại switch', 'SELECT', NULL, TRUE, TRUE, 11),
('attr-def-012', 'keycap_material', 'Chất liệu keycap', 'SELECT', NULL, TRUE, TRUE, 12),
('attr-def-013', 'color', 'Màu sắc', 'COLOR', NULL, TRUE, TRUE, 13),
('attr-def-014', 'language', 'Ngôn ngữ', 'SELECT', NULL, TRUE, TRUE, 14)
ON CONFLICT (attr_def_id) DO NOTHING;

-- Cập nhật product_attributes hiện có với attr_def_id
UPDATE product_attributes SET attr_def_id = 'attr-def-001' WHERE attr_name = 'Layout';
UPDATE product_attributes SET attr_def_id = 'attr-def-002' WHERE attr_name = 'Connectivity';
UPDATE product_attributes SET attr_def_id = 'attr-def-003' WHERE attr_name = 'Battery';
UPDATE product_attributes SET attr_def_id = 'attr-def-004' WHERE attr_name = 'Hot-Swappable';
UPDATE product_attributes SET attr_def_id = 'attr-def-005' WHERE attr_name = 'RGB';
UPDATE product_attributes SET attr_def_id = 'attr-def-006' WHERE attr_name = 'Material';
UPDATE product_attributes SET attr_def_id = 'attr-def-007' WHERE attr_name = 'Weight';
UPDATE product_attributes SET attr_def_id = 'attr-def-008' WHERE attr_name = 'Dimensions';
UPDATE product_attributes SET attr_def_id = 'attr-def-009' WHERE attr_name = 'Polling Rate';
UPDATE product_attributes SET attr_def_id = 'attr-def-010' WHERE attr_name = 'Software';

-- Thêm một số thuộc tính mẫu với price adjustment
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
WHERE product_id IN (SELECT product_id FROM products LIMIT 3)
ON CONFLICT DO NOTHING;

-- Comment
COMMENT ON TABLE attribute_definitions IS 'Định nghĩa các loại thuộc tính sản phẩm';
COMMENT ON COLUMN attribute_definitions.is_filterable IS 'Có thể dùng để filter sản phẩm';
COMMENT ON COLUMN attribute_definitions.is_variant_attribute IS 'Thuộc tính tạo variant (color, size, switch type)';
COMMENT ON COLUMN product_attributes.price_adjustment IS 'Điều chỉnh giá khi chọn thuộc tính này (VNĐ)';
