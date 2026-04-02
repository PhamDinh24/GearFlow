# 🎨 Product Attributes & Recommendations - Cải Tiến

## ✅ Đã Hoàn Thành

### 1. Database Migration V9 ✅

#### Bảng Mới: `attribute_definitions`
Định nghĩa các loại thuộc tính sản phẩm:
- `attr_def_id`: ID định nghĩa
- `attr_name`: Tên thuộc tính (unique)
- `attr_display_name`: Tên hiển thị
- `attr_type`: Loại (TEXT, NUMBER, SELECT, COLOR)
- `attr_unit`: Đơn vị (mm, g, Hz, mAh, %)
- `is_filterable`: Có thể filter không
- `is_variant_attribute`: Thuộc tính tạo variant không
- `display_order`: Thứ tự hiển thị

#### Cập Nhật Bảng: `product_attributes`
- ✅ Thêm `price_adjustment`: Điều chỉnh giá (VNĐ)
- ✅ Thêm `attr_def_id`: Link đến attribute_definitions
- ✅ Foreign key constraint
- ✅ Indexes cho performance

#### Attribute Definitions Mặc Định (14 loại)
**Thuộc tính cơ bản:**
1. Layout (75%, 60%, TKL, Full-size)
2. Connectivity (Wireless, Wired, Bluetooth)
3. Battery (mAh)
4. Hot-swappable (Yes/No)
5. RGB Lighting (Per-key, Zone, None)
6. Material (Aluminum, Plastic, PBT)
7. Weight (g)
8. Dimensions (mm)
9. Polling Rate (Hz)
10. Software (VIA, QMK, Proprietary)

**Thuộc tính variant:**
11. Switch Type (Cherry MX, Gateron, etc)
12. Keycap Material (ABS, PBT, etc)
13. Color (White, Black, etc)
14. Language (US, UK, VN)

### 2. Backend Entities ✅

#### AttributeDefinition.java
```java
public class AttributeDefinition {
    private String id;
    private String name;
    private String displayName;
    private AttributeType type; // TEXT, NUMBER, SELECT, COLOR
    private String unit;
    private Boolean filterable;
    private Boolean variantAttribute;
    private Integer displayOrder;
}
```

#### ProductAttribute.java (Updated)
```java
public class ProductAttribute {
    private String id;
    private String productId;
    private String name;
    private String value;
    private BigDecimal priceAdjustment; // NEW
    private String attributeDefinitionId; // NEW
}
```

### 3. Backend Services ✅

#### AttributeDefinitionService
- `getAllAttributeDefinitions()`: Lấy tất cả
- `getFilterableAttributes()`: Lấy thuộc tính có thể filter
- `getVariantAttributes()`: Lấy thuộc tính tạo variant
- `createAttributeDefinition()`: Tạo mới
- `updateAttributeDefinition()`: Cập nhật
- `deleteAttributeDefinition()`: Xóa

#### ProductRecommendationService
- `getRecommendedProducts(productId, limit)`: Gợi ý thông minh
  - Priority: Same brand > Same category > Random
- `getSameBrandProducts(productId, limit)`: Cùng hãng
- `getSameCategoryProducts(productId, limit)`: Cùng danh mục

### 4. Backend Controllers ✅

#### AttributeDefinitionController
```
GET    /api/attribute-definitions           - Lấy tất cả
GET    /api/attribute-definitions/filterable - Lấy filterable
GET    /api/attribute-definitions/variant    - Lấy variant
GET    /api/attribute-definitions/{id}       - Lấy 1 cái
POST   /api/attribute-definitions            - Tạo mới (ADMIN)
PUT    /api/attribute-definitions/{id}       - Cập nhật (ADMIN)
DELETE /api/attribute-definitions/{id}       - Xóa (ADMIN)
```

#### ProductRecommendationController
```
GET /api/products/{id}/recommendations  - Gợi ý thông minh
GET /api/products/{id}/same-brand       - Cùng hãng
GET /api/products/{id}/same-category    - Cùng danh mục
```

### 5. Repository Updates ✅

#### ProductRepository - New Methods
```java
// For recommendations
List<Product> findByBrandIdAndIdNot(brandId, excludeId, pageable);
List<Product> findByCategoryIdAndIdNot(categoryId, excludeId, pageable);
List<Product> findByCategoryIdAndIdNotAndBrandIdNot(...);
List<Product> findRandomProductsExcluding(excludeIds, pageable);
List<Product> findRandomProducts(pageable);
```

## 🎯 Tính Năng Mới

### 1. Thuộc Tính Linh Hoạt
- **Định nghĩa trước:** 14 loại thuộc tính mặc định
- **Mở rộng dễ dàng:** Admin có thể thêm thuộc tính mới
- **Phân loại rõ ràng:** Filterable vs Variant attributes
- **Có đơn vị:** mm, g, Hz, mAh, %
- **Có thứ tự:** display_order

### 2. Giá Theo Thuộc Tính
- **Price Adjustment:** Mỗi thuộc tính có thể có giá điều chỉnh
- **VD:** RGB Lighting +100,000đ
- **Tính tổng:** Base price + variant price + attributes price

### 3. Gợi Ý Sản Phẩm Thông Minh
**Algorithm:**
1. Ưu tiên sản phẩm cùng hãng
2. Nếu không đủ → Cùng danh mục (khác hãng)
3. Nếu vẫn không đủ → Random

**Use Cases:**
- Product detail page: "Sản phẩm tương tự"
- "Cùng hãng {brand_name}"
- "Cùng danh mục {category_name}"

## 📊 Ví Dụ Sử Dụng

### Tạo Attribute Definition
```json
POST /api/attribute-definitions
{
  "name": "wireless_range",
  "displayName": "Phạm vi không dây",
  "type": "NUMBER",
  "unit": "m",
  "filterable": true,
  "variantAttribute": false,
  "displayOrder": 15
}
```

### Thêm Attribute Cho Product
```json
{
  "name": "RGB Lighting",
  "value": "Per-key RGB",
  "priceAdjustment": 100000,
  "attributeDefinitionId": "attr-def-005"
}
```

### Lấy Gợi Ý
```
GET /api/products/prod-001/recommendations?limit=6
```

Response:
```json
[
  {
    "id": "prod-002",
    "name": "Keychron K8",
    "brandId": "brand-001", // Same brand
    "categoryId": "cat-001",
    "basePrice": 990000
  },
  {
    "id": "prod-003",
    "name": "Keychron K6",
    "brandId": "brand-001", // Same brand
    "categoryId": "cat-001",
    "basePrice": 890000
  },
  // ... more products
]
```

## 🎨 Frontend TODO

### 1. Admin - Attribute Definitions Page
- Trang quản lý attribute definitions
- CRUD operations
- Table với columns: Name, Display Name, Type, Unit, Filterable, Variant
- Filters và search

### 2. Admin - Product Attributes Management
- Trong product edit dialog
- Chọn attribute definition từ dropdown
- Nhập value
- Nhập price adjustment
- Hiển thị tổng giá

### 3. Product Detail - Recommendations
- Section "Sản Phẩm Tương Tự"
- Grid 2x3 hoặc 3x2
- Cards với image, name, price
- Click → Navigate to product detail

### 4. Product Detail - Attributes Display
- Hiển thị attributes theo groups
- Show price adjustment nếu có
- Highlight variant attributes
- Show unit (mm, g, Hz)

### 5. Shop - Filters
- Filter by filterable attributes
- Checkboxes hoặc dropdowns
- Apply filters → Update product list

## 🔧 Cách Chạy

### 1. Restart Backend
```bash
cd backend
mvn spring-boot:run
```
**Migration V9 sẽ tự động chạy**

### 2. Kiểm Tra Database
```sql
-- Check attribute definitions
SELECT * FROM attribute_definitions ORDER BY display_order;

-- Check product attributes with price
SELECT pa.*, ad.display_name, ad.unit
FROM product_attributes pa
LEFT JOIN attribute_definitions ad ON pa.attr_def_id = ad.attr_def_id
WHERE pa.price_adjustment > 0;
```

### 3. Test APIs
```bash
# Get all attribute definitions
curl http://localhost:8080/api/attribute-definitions

# Get recommendations
curl http://localhost:8080/api/products/prod-001/recommendations?limit=6

# Get same brand products
curl http://localhost:8080/api/products/prod-001/same-brand?limit=6
```

## 📝 Database Schema

### attribute_definitions
```sql
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
```

### product_attributes (updated)
```sql
ALTER TABLE product_attributes 
ADD COLUMN price_adjustment DECIMAL(10, 2) DEFAULT 0;

ALTER TABLE product_attributes
ADD COLUMN attr_def_id VARCHAR(36);

ALTER TABLE product_attributes
ADD CONSTRAINT fk_product_attributes_definition 
FOREIGN KEY (attr_def_id) REFERENCES attribute_definitions(attr_def_id);
```

## ✨ Benefits

### 1. Linh Hoạt
- Admin có thể tạo thuộc tính mới
- Không cần thay đổi code
- Dễ dàng mở rộng

### 2. Giá Động
- Giá thay đổi theo thuộc tính
- Transparent cho khách hàng
- Dễ quản lý

### 3. Gợi Ý Thông Minh
- Tăng conversion rate
- Cross-selling
- Better UX

### 4. Filter Mạnh Mẽ
- Filter theo nhiều thuộc tính
- Tìm sản phẩm nhanh hơn
- Better search experience

## 🚀 Next Steps

1. **Restart Backend** để apply migration V9
2. **Test APIs** với Postman/curl
3. **Tạo Frontend Pages:**
   - Admin: Attribute Definitions management
   - Admin: Product attributes với price adjustment
   - User: Product recommendations section
   - User: Enhanced attribute display
4. **Test End-to-End**
5. **Deploy**

**Tất cả backend đã sẵn sàng! Chỉ cần tạo frontend UI.** ✅
