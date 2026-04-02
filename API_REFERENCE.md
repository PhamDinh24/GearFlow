# 🔷 GearFlow E-commerce API Reference

## Base URL
```
http://localhost:8080/api
```

---

## 📋 Product Endpoints

### Get All Products (Paginated)
```
GET /products?page=0&size=10
Params: page (int), size (int)
Response: Page<ProductDTO>
Auth: No
```

### Get Product by ID
```
GET /products/{id}
Response: ProductDTO
Auth: No
```

### Search Products
```
GET /products/search?keyword=keyboard&page=0&size=10
Params: keyword, page, size
Response: Page<ProductDTO>
Auth: No
```

### Filter Products
```
GET /products/filter?brand={brandId}&minPrice={min}&maxPrice={max}&page=0&size=10
Params: brand (optional), minPrice, maxPrice, page, size
Response: Page<ProductDTO>
Auth: No
```

### Get Product Facets
```
GET /products/facets?brand={brandId}&minPrice={min}&maxPrice={max}
Response: Map<String, List<Object>>
Auth: No
```

### Create Product (Admin)
```
POST /products/admin
Auth: ADMIN
Body: ProductDTO
Response: ProductDTO (CREATED 201)
```

### Update Product (Admin)
```
PUT /products/admin/{id}
Auth: ADMIN
Body: ProductDTO
Response: ProductDTO
```

### Delete Product (Admin)
```
DELETE /products/admin/{id}
Auth: ADMIN
Response: 204 No Content
```

---

## 🏪 Category Endpoints

### Get All Categories
```
GET /categories
Response: List<CategoryDTO>
Auth: No
```

### Get Category by ID
```
GET /categories/{id}
Response: CategoryDTO
Auth: No
```

### Create Category (Admin)
```
POST /categories
Auth: ADMIN
Body: { name, description (optional) }
Response: CategoryDTO (CREATED 201)
```

### Update Category (Admin)
```
PUT /categories/{id}
Auth: ADMIN
Body: { name, description (optional) }
Response: CategoryDTO
```

### Delete Category (Admin)
```
DELETE /categories/{id}
Auth: ADMIN
Response: 204 No Content
```

---

## 🏢 Brand Endpoints

### Get All Brands
```
GET /admin/brands?page=0&size=20
Auth: ADMIN
Response: Page<BrandDTO>
```

### Get Brand by ID
```
GET /admin/brands/{id}
Auth: ADMIN
Response: BrandDTO
```

### Create Brand (Admin)
```
POST /admin/brands
Auth: ADMIN
Body: { name, description (optional) }
Response: BrandDTO (CREATED 201)
```

### Update Brand (Admin)
```
PUT /admin/brands/{id}
Auth: ADMIN
Body: { name, description (optional) }
Response: BrandDTO
```

### Delete Brand (Admin)
```
DELETE /admin/brands/{id}
Auth: ADMIN
Response: 204 No Content
```

---

## 🛒 Cart Endpoints

### Get Cart
```
GET /cart
Auth: Required (USER)
Response: CartDTO
```

### Add to Cart
```
POST /cart/items
Auth: Required (USER)
Body: { variantId, quantity }
Response: CartDTO (CREATED 201)
```

### Update Item Quantity
```
PUT /cart/items/{variantId}
Auth: Required (USER)
Body: { quantity }
Response: CartDTO
```

### Remove Item from Cart
```
DELETE /cart/items/{variantId}
Auth: Required (USER)
Response: CartDTO
```

### Clear Cart
```
DELETE /cart
Auth: Required (USER)
Response: 204 No Content
```

---

## 📦 Order Endpoints

### Create Order
```
POST /orders
Auth: Required (USER)
Body: OrderRequest { shippingAddress, shippingCity, shippingPostalCode, shippingPhone }
Response: OrderDTO (CREATED 201)
```

### Get Order by ID
```
GET /orders/{orderId}
Auth: Required
Response: OrderDTO
```

### Get User Orders
```
GET /orders
Auth: Required (USER)
Response: List<OrderDTO>
```

### Cancel Order
```
POST /orders/{orderId}/cancel
Auth: Required (USER)
Response: OrderDTO
```

### Update Order Status (Admin)
```
PUT /admin/orders/{orderId}/status
Auth: ADMIN
Body: { status: "PENDING|CONFIRMED|PROCESSING|SHIPPED|DELIVERED|CANCELLED" }
Response: OrderDTO
```

---

## 💳 Payment Endpoints

### Create Payment
```
POST /payment/{orderId}
Auth: Required (USER)
Params: paymentMethod (COD | VNPAY)
Body: { paymentMethod }
Response: PaymentDTO (CREATED 201)
```

### Generate VNPay Request
```
POST /payment/{paymentId}/vnpay
Auth: Required
Response: Map<String, String> (VNPay parameters)
```

### Verify VNPay Callback
```
GET /payment/callback
Params: VNPay callback parameters
Response: PaymentDTO
```

---

## ⭐ Review Endpoints

### Get Product Reviews
```
GET /reviews/product/{productId}
Response: List<ReviewDTO>
Auth: No
```

### Get Product Average Rating
```
GET /reviews/product/{productId}/rating
Response: { averageRating: number }
Auth: No
```

### Get Review by ID
```
GET /reviews/{reviewId}
Response: ReviewDTO
Auth: No
```

### Create Review
```
POST /reviews
Auth: Required (USER)
Body: { productId, rating, comment }
Response: ReviewDTO (CREATED 201)
```

### Update Review
```
PUT /reviews/{reviewId}
Auth: Required (USER)
Body: { rating (optional), comment (optional) }
Response: ReviewDTO
```

### Delete Review
```
DELETE /reviews/{reviewId}
Auth: Required (USER)
Response: 204 No Content
```

---

## 🎁 Wishlist Endpoints

### Get Wishlist
```
GET /wishlist
Auth: Required (USER)
Response: List<WishlistDTO>
```

### Add to Wishlist
```
POST /wishlist/{productId}
Auth: Required (USER)
Response: WishlistDTO (CREATED 201)
```

### Remove from Wishlist
```
DELETE /wishlist/{productId}
Auth: Required (USER)
Response: 204 No Content
```

### Check if in Wishlist
```
GET /wishlist/check/{productId}
Auth: Required (USER)
Response: boolean
```

---

## 📪 Shipping Address Endpoints

### Get User Addresses
```
GET /shipping-addresses
Auth: Required (USER)
Response: List<ShippingAddressDTO>
```

### Get Default Address
```
GET /shipping-addresses/default
Auth: Required (USER)
Response: ShippingAddressDTO | 204 No Content
```

### Get Address by ID
```
GET /shipping-addresses/{id}
Auth: Required (USER)
Response: ShippingAddressDTO
```

### Create Address
```
POST /shipping-addresses
Auth: Required (USER)
Body: ShippingAddressDTO
Response: ShippingAddressDTO (CREATED 201)
```

### Update Address
```
PUT /shipping-addresses/{id}
Auth: Required (USER)
Body: ShippingAddressDTO
Response: ShippingAddressDTO
```

### Delete Address
```
DELETE /shipping-addresses/{id}
Auth: Required (USER)
Response: 204 No Content
```

### Set Default Address
```
POST /shipping-addresses/{id}/set-default
Auth: Required (USER)
Response: ShippingAddressDTO
```

---

## 📊 Admin Stock Endpoints

### Get All Stock
```
GET /admin/stock?page=0&size=20
Auth: ADMIN
Response: Page<StockDTO>
```

### Get Stock by Variant
```
GET /admin/stock/{variantId}
Auth: ADMIN
Response: StockDTO
```

### Update Stock Quantity
```
PUT /admin/stock/{variantId}?quantity={qty}
Auth: ADMIN
Response: StockDTO
```

### Increment Stock
```
POST /admin/stock/{variantId}/increment?amount={amt}
Auth: ADMIN
Response: StockDTO
```

### Decrement Stock
```
POST /admin/stock/{variantId}/decrement?amount={amt}
Auth: ADMIN
Response: StockDTO
```

### Get Low Stock Items
```
GET /admin/stock/low-stock?threshold={num}
Auth: ADMIN
Response: List<StockDTO>
```

---

## 🏷️ Product Variant Endpoints

### Get Variants for Product
```
GET /products/{productId}/variants
Response: List<ProductVariantDTO>
Auth: No
```

### Get Variant by ID
```
GET /products/{productId}/variants/{variantId}
Response: ProductVariantDTO
Auth: No
```

### Create Variant (Admin)
```
POST /products/{productId}/variants
Auth: ADMIN
Body: ProductVariantDTO
Response: ProductVariantDTO (CREATED 201)
```

### Update Variant (Admin)
```
PUT /products/{productId}/variants/{variantId}
Auth: ADMIN
Body: ProductVariantDTO
Response: ProductVariantDTO
```

### Delete Variant (Admin)
```
DELETE /products/{productId}/variants/{variantId}
Auth: ADMIN
Response: 204 No Content
```

---

## 🔕 Notification Endpoints

### Get Notifications
```
GET /notifications
Auth: Required (USER)
Response: List<NotificationDTO>
```

### Mark as Read
```
PUT /notifications/{id}
Auth: Required (USER)
Response: NotificationDTO
```

---

## 🔐 Authentication

All authenticated endpoints require:
```
Header: Authorization: Bearer {accessToken}
```

Token obtained from:
```
POST /auth/login
Body: { username, password }
Response: { accessToken, refreshToken, user }
```

---

## 🚨 Error Responses

All errors return appropriate HTTP status with:
```json
{
  "timestamp": "2026-04-02T12:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Detailed error message"
}
```

Common status codes:
- `200 OK` - Success
- `201 CREATED` - Resource created
- `204 NO CONTENT` - Success with no response body
- `400 BAD REQUEST` - Invalid input
- `401 UNAUTHORIZED` - Missing/invalid authentication
- `403 FORBIDDEN` - Insufficient permissions
- `404 NOT FOUND` - Resource not found
- `500 INTERNAL SERVER ERROR` - Server error
