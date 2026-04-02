# GearFlow Backend API

Backend API for GearFlow mechanical keyboard e-commerce system.

## 🛠️ Technology Stack

- **Java 17**
- **Spring Boot 3.x**
- **PostgreSQL** - Primary database
- **Redis** - Cache (optional)
- **Flyway** - Database migration
- **Spring Security** - Authentication & Authorization
- **JWT** - Token-based authentication
- **Maven** - Build tool
- **Lombok** - Reduce boilerplate code

## 📋 System Requirements

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 12+
- Redis 6+ (optional, for caching)

## 🚀 Installation and Setup

### 1. Setup Database

Create PostgreSQL database:

```sql
CREATE DATABASE gearflow;
```

Configure database in `src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/gearflow
    username: postgres
    password: 123456
```

### 2. Install Dependencies

```bash
mvn clean install
```

### 3. Run Flyway Migration (If Needed)

If you encounter V6 migration error, run repair:

```bash
mvn flyway:repair
```

### 4. Start Application

```bash
mvn spring-boot:run
```

Or build and run JAR file:

```bash
mvn clean package
java -jar target/gearflow-api-1.0.0.jar
```

Server runs at: **http://localhost:8080**

API endpoints: **http://localhost:8080/api**

## 📁 Project Structure

```
backend/
├── src/main/java/com/gearflow/
│   ├── config/          # Configuration (Security, CORS, Cache, Redis)
│   ├── controller/      # REST Controllers
│   ├── dto/            # Data Transfer Objects
│   ├── entity/         # JPA Entities
│   ├── exception/      # Exception handlers
│   ├── repository/     # JPA Repositories
│   ├── service/        # Business logic
│   └── util/           # Utility classes
├── src/main/resources/
│   ├── db/migration/   # Flyway migrations
│   └── application.yml # Application configuration
└── pom.xml            # Maven dependencies
```

## 🗄️ Database Migrations

| Version | Description | Status |
|---------|-------------|--------|
| V1 | Initial Schema (users, products, orders, etc.) | ✅ |
| V2 | Add Cart Tables | ✅ |
| V3 | Insert Sample Data (5 products, 12 variants, stock) | ✅ |
| V4 | Add Coupons And Notifications | ✅ |
| V5 | Fix Payment Table | ✅ |

**Note:** V6 was deleted as it was redundant with V3.

## 🔐 Authentication

API uses JWT authentication. To access protected endpoints:

1. **Login** to get token:
```bash
POST /api/auth/login
{
  "username": "admin",
  "password": "password123"
}
```

2. **Use token** in header:
```bash
Authorization: Bearer <your_token_here>
```

### Default Accounts

- **Admin:** username: `admin`, password: `password123`
- **User:** username: `testuser`, password: `password123`

## 📡 API Endpoints

### Public Endpoints (No authentication required)

```
GET  /api/products              # Product list
GET  /api/products/{id}         # Product details
GET  /api/products/search       # Search products
GET  /api/categories            # Category list
GET  /api/brands                # Brand list
POST /api/auth/register         # Register
POST /api/auth/login            # Login
POST /api/auth/refresh          # Refresh token
```

### User Endpoints (Authentication required)

```
GET    /api/cart                # Shopping cart
POST   /api/cart/items          # Add to cart
PUT    /api/cart/items/{id}     # Update quantity
DELETE /api/cart/items/{id}     # Remove from cart

GET    /api/orders              # User orders
POST   /api/orders              # Create order
GET    /api/orders/{id}         # Order details
POST   /api/orders/{id}/cancel  # Cancel order

GET    /api/wishlist            # Wishlist
POST   /api/wishlist/{id}       # Add to wishlist
DELETE /api/wishlist/{id}       # Remove from wishlist

POST   /api/reviews             # Create review
GET    /api/reviews/product/{id} # Product reviews
```

### Admin Endpoints (ADMIN role required)

```
# Dashboard
GET  /api/admin/dashboard/stats        # Overview statistics
GET  /api/admin/dashboard/top-products # Top products
GET  /api/admin/dashboard/sales-report # Sales report

# Product Management
GET    /api/admin/products             # Product list
POST   /api/admin/products             # Create product
PUT    /api/admin/products/{id}        # Update product
DELETE /api/admin/products/{id}        # Delete product

# Order Management
GET  /api/admin/orders                 # All orders
PUT  /api/admin/orders/{id}/status     # Update status

# User Management
GET    /api/admin/users                # User list
GET    /api/admin/users/{id}           # User details
PUT    /api/admin/users/{id}/role      # Change role
DELETE /api/admin/users/{id}           # Delete user

# Stock Management
GET  /api/admin/stock                  # Stock list
GET  /api/admin/stock/{variantId}      # Stock details
PUT  /api/admin/stock/{variantId}      # Update stock
GET  /api/admin/stock/low-stock        # Low stock items
```

## ⚙️ Configuration

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

CORS is configured to allow frontend access:
- http://localhost:3000
- http://localhost:3001
- http://localhost:5173

To add more origins, update `application.yml`:

```yaml
app:
  cors:
    allowed-origins: http://localhost:3000,http://your-domain.com
```

### Redis Cache (Optional)

If not using Redis, comment out these lines in `application.yml`:

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

### Run Tests

```bash
mvn test
```

### Test with cURL

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

## 🐛 Troubleshooting

### Error: Flyway migration failed

```bash
mvn flyway:repair
mvn spring-boot:run
```

See details: `../docs/FLYWAY_MIGRATION.md`

### Error: Database connection refused

- Check PostgreSQL is running
- Check username/password in `application.yml`
- Check database `gearflow` exists

### Error: Redis connection refused

- Redis is optional, can comment out Redis config
- Or install and run Redis: `redis-server`

### Error: Port 8080 already in use

Change port in `application.yml`:

```yaml
server:
  port: 8081
```

## 📊 Database Schema

### Core Tables

- **users** - User accounts (admin, customer)
- **products** - Products
- **product_variants** - Product variants (color, switch, keycap)
- **stock** - Inventory
- **categories** - Categories
- **brands** - Brands
- **orders** - Orders
- **order_items** - Order details
- **carts** - Shopping carts
- **cart_items** - Cart items
- **payment** - Payments
- **reviews** - Product reviews
- **wishlists** - Wishlists
- **notifications** - Notifications
- **coupons** - Discount coupons

## 🔒 Security

- Passwords hashed with BCrypt
- JWT tokens for authentication
- Role-based access control (USER, ADMIN)
- CORS protection
- SQL injection protection (JPA/Hibernate)
- XSS protection (Spring Security)

## 📝 Logging

Logs saved at: `logs/gearflow.log`

Configure log level in `application.yml`:

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

## 📚 Documentation

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security](https://spring.io/projects/spring-security)
- [Flyway](https://flywaydb.org/documentation/)
- [PostgreSQL](https://www.postgresql.org/docs/)

## 📄 License

This project is licensed under the MIT License.
