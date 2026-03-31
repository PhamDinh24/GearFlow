# GearFlow Backend API

Backend API cho hệ thống thương mại điện tử bàn phím cơ GearFlow.

## 🛠️ Công Nghệ Sử Dụng

- **Java 17**
- **Spring Boot 3.x**
- **PostgreSQL** - Database chính
- **Redis** - Cache (tùy chọn)
- **Flyway** - Database migration
- **Spring Security** - Authentication & Authorization
- **JWT** - Token-based authentication
- **Maven** - Build tool
- **Lombok** - Giảm boilerplate code

## 📋 Yêu Cầu Hệ Thống

- Java 17 hoặc cao hơn
- Maven 3.6+
- PostgreSQL 12+
- Redis 6+ (tùy chọn, cho caching)

## 🚀 Cài Đặt và Chạy

### 1. Chuẩn Bị Database

Tạo database PostgreSQL:

```sql
CREATE DATABASE gearflow;
```

Cấu hình database trong `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/gearflow
    username: postgres
    password: 123456
```

### 2. Cài Đặt Dependencies

```bash
mvn clean install
```

### 3. Chạy Flyway Migration (Nếu Cần Sửa Lỗi)

Nếu gặp lỗi migration V6, chạy lệnh repair:

```bash
mvn flyway:repair
```

### 4. Khởi Động Application

```bash
mvn spring-boot:run
```

Hoặc build và chạy JAR file:

```bash
mvn clean package
java -jar target/gearflow-api-1.0.0.jar
```

Server sẽ chạy tại: **http://localhost:8080**

API endpoints: **http://localhost:8080/api**

## 📁 Cấu Trúc Thư Mục

```
backend/
├── src/main/java/com/gearflow/
│   ├── config/          # Cấu hình (Security, CORS, Cache, Redis)
│   ├── controller/      # REST Controllers
│   ├── dto/            # Data Transfer Objects
│   ├── entity/         # JPA Entities
│   ├── exception/      # Exception handlers
│   ├── repository/     # JPA Repositories
│   ├── service/        # Business logic
│   └── util/           # Utility classes
├── src/main/resources/
│   ├── db/migration/   # Flyway migrations
│   └── application.yml # Cấu hình ứng dụng
└── pom.xml            # Maven dependencies
```

## 🗄️ Database Migrations

| Version | Mô Tả | Trạng Thái |
|---------|-------|-----------|
| V1 | Initial Schema (users, products, orders, etc.) | ✅ |
| V2 | Add Cart Tables | ✅ |
| V3 | Insert Sample Data (5 products, 12 variants, stock) | ✅ |
| V4 | Add Coupons And Notifications | ✅ |
| V5 | Fix Payment Table | ✅ |

**Lưu ý:** V6 đã bị xóa vì trùng lặp với V3.

## 🔐 Authentication

API sử dụng JWT authentication. Để truy cập các endpoint được bảo vệ:

1. **Đăng nhập** để lấy token:
```bash
POST /api/auth/login
{
  "username": "admin",
  "password": "password123"
}
```

2. **Sử dụng token** trong header:
```bash
Authorization: Bearer <your_token_here>
```

### Tài Khoản Mặc Định

- **Admin:** username: `admin`, password: `password123`
- **User:** username: `testuser`, password: `password123`

## 📡 API Endpoints

### Public Endpoints (Không cần authentication)

```
GET  /api/products              # Danh sách sản phẩm
GET  /api/products/{id}         # Chi tiết sản phẩm
GET  /api/products/search       # Tìm kiếm sản phẩm
GET  /api/categories            # Danh sách danh mục
GET  /api/brands                # Danh sách thương hiệu
POST /api/auth/register         # Đăng ký
POST /api/auth/login            # Đăng nhập
POST /api/auth/refresh          # Refresh token
```

### User Endpoints (Cần authentication)

```
GET    /api/cart                # Giỏ hàng
POST   /api/cart/items          # Thêm vào giỏ
PUT    /api/cart/items/{id}     # Cập nhật số lượng
DELETE /api/cart/items/{id}     # Xóa khỏi giỏ

GET    /api/orders              # Đơn hàng của user
POST   /api/orders              # Tạo đơn hàng
GET    /api/orders/{id}         # Chi tiết đơn hàng
POST   /api/orders/{id}/cancel  # Hủy đơn hàng

GET    /api/wishlist            # Danh sách yêu thích
POST   /api/wishlist/{id}       # Thêm vào wishlist
DELETE /api/wishlist/{id}       # Xóa khỏi wishlist

POST   /api/reviews             # Tạo đánh giá
GET    /api/reviews/product/{id} # Đánh giá sản phẩm
```

### Admin Endpoints (Cần role ADMIN)

```
# Dashboard
GET  /api/admin/dashboard/stats        # Thống kê tổng quan
GET  /api/admin/dashboard/top-products # Top sản phẩm
GET  /api/admin/dashboard/sales-report # Báo cáo doanh thu

# Product Management
GET    /api/admin/products             # Danh sách sản phẩm
POST   /api/admin/products             # Tạo sản phẩm
PUT    /api/admin/products/{id}        # Cập nhật sản phẩm
DELETE /api/admin/products/{id}        # Xóa sản phẩm

# Order Management
GET  /api/admin/orders                 # Tất cả đơn hàng
PUT  /api/admin/orders/{id}/status     # Cập nhật trạng thái

# User Management
GET    /api/admin/users                # Danh sách người dùng
GET    /api/admin/users/{id}           # Chi tiết người dùng
PUT    /api/admin/users/{id}/role      # Thay đổi vai trò
DELETE /api/admin/users/{id}           # Xóa người dùng

# Stock Management
GET  /api/admin/stock                  # Danh sách tồn kho
GET  /api/admin/stock/{variantId}      # Chi tiết tồn kho
PUT  /api/admin/stock/{variantId}      # Cập nhật tồn kho
GET  /api/admin/stock/low-stock        # Sản phẩm sắp hết
```

## ⚙️ Cấu Hình

### Application Properties

File: `src/main/resources/application.yml`

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/gearflow
    username: postgres
    password: 123456
  
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false
  
  flyway:
    enabled: true
    baseline-on-migrate: true

jwt:
  secret: your-secret-key
  expiration: 86400000        # 24 hours
  refresh-expiration: 604800000 # 7 days

app:
  cors:
    allowed-origins: http://localhost:3000,http://localhost:5173
```

### CORS Configuration

CORS được cấu hình để cho phép frontend truy cập:
- http://localhost:3000
- http://localhost:3001
- http://localhost:5173

Để thêm origin khác, cập nhật `application.yml`:

```yaml
app:
  cors:
    allowed-origins: http://localhost:3000,http://your-domain.com
```

### Redis Cache (Tùy chọn)

Nếu không sử dụng Redis, comment các dòng sau trong `application.yml`:

```yaml
# spring:
#   cache:
#     type: redis
#   data:
#     redis:
#       host: localhost
#       port: 6379
```

## 🧪 Testing

### Chạy Tests

```bash
mvn test
```

### Test với Postman

Import collection từ `postman/GearFlow.postman_collection.json` (nếu có)

### Test với cURL

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password123"}'

# Get products
curl http://localhost:8080/api/products

# Get dashboard stats (with token)
curl http://localhost:8080/api/admin/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐛 Xử Lý Lỗi

### Lỗi: Flyway migration failed

```bash
mvn flyway:repair
mvn spring-boot:run
```

Xem chi tiết: `FLYWAY_REPAIR.md`

### Lỗi: Database connection refused

- Kiểm tra PostgreSQL đang chạy
- Kiểm tra username/password trong `application.yml`
- Kiểm tra database `gearflow` đã được tạo

### Lỗi: Redis connection refused

- Redis là tùy chọn, có thể comment config Redis
- Hoặc cài đặt và chạy Redis: `redis-server`

### Lỗi: Port 8080 already in use

Thay đổi port trong `application.yml`:

```yaml
server:
  port: 8081
```

## 📊 Database Schema

### Core Tables

- **users** - Người dùng (admin, customer)
- **products** - Sản phẩm
- **product_variants** - Biến thể sản phẩm (màu, switch, keycap)
- **stock** - Tồn kho
- **categories** - Danh mục
- **brands** - Thương hiệu
- **orders** - Đơn hàng
- **order_items** - Chi tiết đơn hàng
- **carts** - Giỏ hàng
- **cart_items** - Sản phẩm trong giỏ
- **payment** - Thanh toán
- **reviews** - Đánh giá
- **wishlists** - Danh sách yêu thích
- **notifications** - Thông báo
- **coupons** - Mã giảm giá

## 🔒 Security

- Passwords được hash với BCrypt
- JWT tokens cho authentication
- Role-based access control (USER, ADMIN)
- CORS protection
- SQL injection protection (JPA/Hibernate)
- XSS protection (Spring Security)

## 📝 Logging

Logs được lưu tại: `logs/gearflow.log`

Cấu hình log level trong `application.yml`:

```yaml
logging:
  level:
    root: INFO
    com.gearflow: DEBUG
```

## 🚀 Production Deployment

### Build Production JAR

```bash
mvn clean package -DskipTests
```

JAR file: `target/gearflow-api-1.0.0.jar`

### Run Production

```bash
java -jar target/gearflow-api-1.0.0.jar \
  --spring.profiles.active=prod \
  --server.port=8080
```

### Environment Variables

```bash
export DB_URL=jdbc:postgresql://your-db-host:5432/gearflow
export DB_USERNAME=your-username
export DB_PASSWORD=your-password
export JWT_SECRET=your-production-secret
export REDIS_HOST=your-redis-host
```

## 📚 Tài Liệu Tham Khảo

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security](https://spring.io/projects/spring-security)
- [Flyway](https://flywaydb.org/documentation/)
- [PostgreSQL](https://www.postgresql.org/docs/)

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

GearFlow Development Team

## 📞 Support

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs trong `logs/gearflow.log`
2. Xem `FLYWAY_REPAIR.md` nếu có lỗi migration
3. Xem `ADMIN_PAGES_STATUS.md` để biết trạng thái dự án
