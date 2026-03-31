# Requirements Document: GearFlow Keyboard E-commerce System

## Introduction

GearFlow là một hệ thống thương mại điện tử chuyên biệt cho bàn phím cơ, cung cấp trải nghiệm mua sắm toàn diện với bộ lọc thuộc tính đa chiều, quản lý biến thể sản phẩm linh hoạt, hệ thống gợi ý cá nhân hóa, và thanh toán trực tuyến qua VNPay. Hệ thống được thiết kế để hỗ trợ cả người dùng cuối và quản trị viên, với khả năng mở rộng sang kiến trúc Microservices.

## Glossary

- **System**: GearFlow E-commerce System
- **User**: Người dùng cuối có thể duyệt sản phẩm, mua hàng, quản lý tài khoản
- **Admin**: Người quản trị hệ thống có quyền quản lý sản phẩm, đơn hàng, người dùng
- **Product**: Bàn phím cơ với các thuộc tính như loại switch, layout, brand
- **Product_Variant**: Biến thể của sản phẩm với các tùy chọn khác nhau (switch type, color, keycap set)
- **Cart**: Giỏ hàng tạm thời chứa các sản phẩm người dùng muốn mua
- **Order**: Đơn hàng chính thức sau khi thanh toán
- **Payment**: Giao dịch thanh toán qua VNPay
- **Wishlist**: Danh sách các sản phẩm yêu thích của người dùng
- **Recommendation_Engine**: Hệ thống gợi ý sản phẩm dựa trên hành vi người dùng
- **Filter_Criteria**: Các tiêu chí lọc sản phẩm (switch type, layout, brand, giá, v.v.)
- **Facet_Count**: Số lượng sản phẩm cho mỗi giá trị của một thuộc tính lọc
- **JWT_Token**: JSON Web Token dùng để xác thực người dùng
- **VNPay**: Cổng thanh toán trực tuyến
- **Stock**: Số lượng sản phẩm có sẵn
- **Transaction_ID**: Mã giao dịch duy nhất từ VNPay

## Requirements

### Requirement 1: User Authentication & Authorization

**User Story:** As a user, I want to register and login to the system, so that I can access personalized features and make purchases.

#### Acceptance Criteria

1. WHEN a user provides valid email, password, full name, and phone number, THE System SHALL create a new user account and return a success message
2. WHEN a user provides an email that already exists, THE System SHALL reject the registration and return an error message
3. WHEN a user provides valid email and password, THE System SHALL authenticate the user and return JWT access token and refresh token
4. WHEN a user provides invalid email or password, THE System SHALL reject the login and return a 401 Unauthorized error
5. WHEN a user's JWT token expires, THE System SHALL allow the user to refresh the token using the refresh token
6. WHEN a user logs out, THE System SHALL invalidate the JWT token and clear the session
7. WHEN a user accesses a protected endpoint without a valid token, THE System SHALL return a 401 Unauthorized error
8. WHEN an admin accesses an admin-only endpoint, THE System SHALL verify the user has ADMIN role before allowing access
9. WHEN a non-admin user attempts to access an admin endpoint, THE System SHALL return a 403 Forbidden error

### Requirement 2: Product Browsing with Multi-dimensional Filtering

**User Story:** As a user, I want to search and filter products by multiple attributes, so that I can quickly find keyboards that match my preferences.

#### Acceptance Criteria

1. WHEN a user searches for products without filters, THE System SHALL return all available products paginated
2. WHEN a user filters by switch type (LINEAR, TACTILE, CLICKY), THE System SHALL return only products with matching switch types
3. WHEN a user filters by layout (60%, 75%, 100%), THE System SHALL return only products with matching layouts
4. WHEN a user filters by brand, THE System SHALL return only products from the selected brand
5. WHEN a user filters by price range (min and max), THE System SHALL return only products within the specified price range
6. WHEN a user applies multiple filters simultaneously, THE System SHALL apply all filters and return products matching ALL criteria
7. WHEN a user applies filters, THE System SHALL display facet counts showing how many products match each filter value
8. WHEN a user adds more filters, THE System SHALL never increase the result count (monotonic property)
9. WHEN a user removes filters, THE System SHALL never decrease the result count
10. WHEN a user searches with pagination, THE System SHALL return results in pages with configurable page size
11. WHEN a user filters by RGB support, THE System SHALL return only products with RGB support enabled
12. WHEN a user filters by connection type (Wired, Wireless, Bluetooth), THE System SHALL return only products with matching connection types

### Requirement 3: Product Variant Management

**User Story:** As an admin, I want to manage product variants with different configurations, so that I can offer customers multiple options for each keyboard model.

#### Acceptance Criteria

1. WHEN an admin creates a product variant, THE System SHALL store the variant with switch type, color, keycap set, and price modifier
2. WHEN an admin specifies a price modifier for a variant, THE System SHALL calculate the final price as base_price + price_modifier
3. WHEN a user views a product, THE System SHALL display all available variants with their respective prices
4. WHEN a user selects a variant, THE System SHALL check the stock availability for that specific variant
5. WHEN a variant's stock reaches zero, THE System SHALL mark the variant as out-of-stock and prevent purchases
6. WHEN an admin updates a variant's stock, THE System SHALL immediately reflect the change in the product listing
7. WHEN a user adds a variant to cart, THE System SHALL reserve the stock quantity to prevent overselling
8. WHEN a user removes an item from cart, THE System SHALL release the reserved stock
9. WHEN multiple users add the same variant to cart, THE System SHALL ensure total reserved stock never exceeds available stock

### Requirement 4: Shopping Cart Operations

**User Story:** As a user, I want to manage my shopping cart, so that I can review and modify my purchases before checkout.

#### Acceptance Criteria

1. WHEN a user adds a product variant to cart, THE System SHALL add the item to the cart and increase the item count
2. WHEN a user adds the same variant multiple times, THE System SHALL increase the quantity instead of creating duplicate items
3. WHEN a user specifies a quantity greater than available stock, THE System SHALL reject the addition and return an error
4. WHEN a user removes an item from cart, THE System SHALL remove the item and update the cart total
5. WHEN a user updates the quantity of a cart item, THE System SHALL validate the new quantity against available stock
6. WHEN a user clears the cart, THE System SHALL remove all items and reset the cart total to zero
7. WHEN a user views the cart, THE System SHALL display all items with prices, quantities, and total amount
8. WHEN a user adds an item to cart, THE System SHALL persist the cart to Redis cache with 7-day expiration
9. WHEN a user's session expires, THE System SHALL preserve the cart data for 7 days
10. WHEN a user adds then removes an item, THE System SHALL return the cart to its original state

### Requirement 5: Order Management & Checkout

**User Story:** As a user, I want to create orders and track their status, so that I can complete purchases and monitor delivery.

#### Acceptance Criteria

1. WHEN a user initiates checkout with items in cart, THE System SHALL create an order with status PENDING
2. WHEN an order is created, THE System SHALL copy all cart items to order items with current prices
3. WHEN an order is created, THE System SHALL calculate the total price as sum of all order items
4. WHEN a user provides a shipping address, THE System SHALL validate the address format and store it with the order
5. WHEN an order is created, THE System SHALL reserve stock for all order items
6. WHEN a payment is confirmed, THE System SHALL update the order status to CONFIRMED
7. WHEN a payment fails, THE System SHALL keep the order in PENDING status and allow retry
8. WHEN an order is confirmed, THE System SHALL clear the user's cart
9. WHEN an admin updates order status, THE System SHALL transition the status through valid states (PENDING → CONFIRMED → SHIPPED → DELIVERED)
10. WHEN a user views their orders, THE System SHALL display all orders with status, total price, and creation date
11. WHEN an order is cancelled, THE System SHALL release all reserved stock back to inventory
12. WHEN a user views order details, THE System SHALL display all order items with product names, variants, quantities, and prices

### Requirement 6: Payment Processing with VNPay Integration

**User Story:** As a user, I want to pay for my orders using VNPay, so that I can complete purchases securely.

#### Acceptance Criteria

1. WHEN a user initiates payment for an order, THE System SHALL create a payment request with order ID, amount, and transaction reference
2. WHEN a payment request is created, THE System SHALL generate a unique transaction ID and store it in the database
3. WHEN a payment request is created, THE System SHALL redirect the user to VNPay payment page with secure parameters
4. WHEN VNPay processes the payment, THE System SHALL receive a callback with payment status and transaction details
5. WHEN a payment callback is received, THE System SHALL verify the VNPay signature using SHA-256 hash
6. WHEN a payment callback signature is invalid, THE System SHALL reject the callback and log the security event
7. WHEN a payment is successful, THE System SHALL update the payment status to SUCCESS and order status to CONFIRMED
8. WHEN a payment fails, THE System SHALL update the payment status to FAILED and keep order in PENDING status
9. WHEN a payment callback is received, THE System SHALL ensure idempotency by checking if transaction was already processed
10. WHEN a user queries payment status, THE System SHALL return the current payment status and transaction details
11. WHEN a payment is cancelled by user, THE System SHALL update payment status to CANCELLED and keep order in PENDING status
12. WHEN a payment is processed, THE System SHALL log the transaction for audit purposes

### Requirement 7: Recommendation System

**User Story:** As a user, I want to receive personalized product recommendations, so that I can discover keyboards that match my interests.

#### Acceptance Criteria

1. WHEN a user views a product, THE System SHALL record the view event with timestamp
2. WHEN a user views products, THE System SHALL use view history to generate view-based recommendations
3. WHEN generating view-based recommendations, THE System SHALL return products with similar attributes to viewed products
4. WHEN a user purchases products, THE System SHALL record the purchase event for recommendation calculation
5. WHEN generating purchase-based recommendations, THE System SHALL return products similar to previously purchased products
6. WHEN generating recommendations, THE System SHALL exclude products already purchased by the user
7. WHEN generating recommendations, THE System SHALL exclude products already in the user's wishlist
8. WHEN generating recommendations, THE System SHALL return at most the requested limit of products
9. WHEN a user views a product, THE System SHALL suggest related accessories and compatible products
10. WHEN recommendations are generated, THE System SHALL cache them with 24-hour expiration
11. WHEN a user makes a purchase, THE System SHALL invalidate cached recommendations for that user
12. WHEN generating recommendations, THE System SHALL use collaborative filtering to find similar users and their preferences

### Requirement 8: Wishlist Management

**User Story:** As a user, I want to save products to a wishlist, so that I can easily find and purchase them later.

#### Acceptance Criteria

1. WHEN a user adds a product to wishlist, THE System SHALL create a wishlist entry linking the user and product
2. WHEN a user adds a product already in wishlist, THE System SHALL prevent duplicate entries
3. WHEN a user removes a product from wishlist, THE System SHALL delete the wishlist entry
4. WHEN a user views their wishlist, THE System SHALL display all saved products with current prices and availability
5. WHEN a product price changes, THE System SHALL update the price displayed in the user's wishlist
6. WHEN a product becomes out-of-stock, THE System SHALL indicate the out-of-stock status in the wishlist
7. WHEN a user adds a wishlist item to cart, THE System SHALL add the product to cart and keep it in wishlist
8. WHEN a user views wishlist, THE System SHALL display products in the order they were added (most recent first)
9. WHEN a user has items in wishlist, THE System SHALL allow bulk operations like "Add all to cart"

### Requirement 9: Admin Dashboard & Reporting

**User Story:** As an admin, I want to view dashboard statistics and generate reports, so that I can monitor business performance and make data-driven decisions.

#### Acceptance Criteria

1. WHEN an admin accesses the dashboard, THE System SHALL display total orders, total revenue, and new users for the selected date range
2. WHEN an admin views the dashboard, THE System SHALL display top-selling products with sales count and revenue
3. WHEN an admin generates a sales report, THE System SHALL aggregate sales data by day, week, or month as requested
4. WHEN an admin views the dashboard, THE System SHALL display order status distribution (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
5. WHEN an admin generates a report, THE System SHALL allow filtering by date range
6. WHEN an admin views dashboard statistics, THE System SHALL cache the data with 1-hour expiration
7. WHEN dashboard data is requested, THE System SHALL calculate statistics from the database without blocking other operations
8. WHEN an admin views reports, THE System SHALL display data in charts and tables for easy analysis
9. WHEN an admin exports a report, THE System SHALL generate a CSV or PDF file with the report data
10. WHEN an admin views user statistics, THE System SHALL display total users, new users, and active users for the period

### Requirement 10: Product Management (Admin)

**User Story:** As an admin, I want to create, update, and delete products, so that I can manage the product catalog.

#### Acceptance Criteria

1. WHEN an admin creates a product, THE System SHALL store the product with name, description, base price, category, and brand
2. WHEN an admin creates a product, THE System SHALL validate that all required fields are provided
3. WHEN an admin updates a product, THE System SHALL update the product details and invalidate related caches
4. WHEN an admin deletes a product, THE System SHALL remove the product and all associated variants
5. WHEN an admin deletes a product, THE System SHALL remove the product from all user wishlists
6. WHEN an admin uploads a product image, THE System SHALL store the image in cloud storage and save the URL
7. WHEN an admin creates a product variant, THE System SHALL validate the variant configuration
8. WHEN an admin updates product stock, THE System SHALL immediately reflect the change in product availability
9. WHEN an admin views products, THE System SHALL display all products with pagination and search capability
10. WHEN an admin creates a product, THE System SHALL assign a unique product ID

### Requirement 11: User Profile Management

**User Story:** As a user, I want to manage my profile information, so that I can keep my account details up to date.

#### Acceptance Criteria

1. WHEN a user views their profile, THE System SHALL display their email, full name, phone, and address
2. WHEN a user updates their profile, THE System SHALL validate the new information before saving
3. WHEN a user updates their phone number, THE System SHALL validate the phone format
4. WHEN a user updates their address, THE System SHALL store the address for future orders
5. WHEN a user changes their password, THE System SHALL validate the new password meets complexity requirements
6. WHEN a user changes their password, THE System SHALL hash the new password using BCrypt before storing
7. WHEN a user updates their profile, THE System SHALL log the update for audit purposes
8. WHEN a user requests a password reset, THE System SHALL send a reset link to their email
9. WHEN a user clicks the password reset link, THE System SHALL validate the link hasn't expired (24-hour expiration)
10. WHEN a user resets their password, THE System SHALL invalidate all existing JWT tokens for security

### Requirement 12: Product Reviews & Ratings

**User Story:** As a user, I want to review and rate products, so that I can share my experience and help other customers.

#### Acceptance Criteria

1. WHEN a user who purchased a product submits a review, THE System SHALL store the review with rating (1-5) and comment
2. WHEN a user submits a review, THE System SHALL prevent duplicate reviews from the same user for the same product
3. WHEN a user submits a review, THE System SHALL validate the rating is between 1 and 5
4. WHEN a user views a product, THE System SHALL display all reviews with ratings and comments
5. WHEN a user views a product, THE System SHALL display the average rating calculated from all reviews
6. WHEN a user views reviews, THE System SHALL display reviews sorted by most recent first
7. WHEN an admin deletes a review, THE System SHALL remove the review and recalculate the average rating
8. WHEN a user updates their review, THE System SHALL update the review content and timestamp

### Requirement 13: Performance & Caching

**User Story:** As a system, I want to cache frequently accessed data, so that I can provide fast response times and reduce database load.

#### Acceptance Criteria

1. WHEN a user searches for products, THE System SHALL cache search results with 30-minute expiration
2. WHEN a product is updated, THE System SHALL invalidate the product cache
3. WHEN a user's cart is modified, THE System SHALL update the cart cache immediately
4. WHEN recommendations are generated, THE System SHALL cache them with 24-hour expiration
5. WHEN dashboard statistics are requested, THE System SHALL cache them with 1-hour expiration
6. WHEN a cache entry expires, THE System SHALL automatically remove it from Redis
7. WHEN a product is viewed, THE System SHALL cache the product details with 1-hour expiration
8. WHEN facet counts are calculated, THE System SHALL cache them with 1-hour expiration

### Requirement 14: Security & Data Protection

**User Story:** As a system, I want to protect user data and prevent unauthorized access, so that I can maintain user trust and comply with regulations.

#### Acceptance Criteria

1. WHEN a user's password is stored, THE System SHALL hash it using BCrypt with 10 salt rounds
2. WHEN a user logs in, THE System SHALL validate the password against the stored hash
3. WHEN a JWT token is created, THE System SHALL use HS256 algorithm with a strong secret key
4. WHEN a JWT token is validated, THE System SHALL verify the signature and expiration time
5. WHEN a user provides input, THE System SHALL validate and sanitize it to prevent SQL injection
6. WHEN a user provides an email, THE System SHALL validate the email format
7. WHEN a payment callback is received, THE System SHALL verify the VNPay signature using SHA-256
8. WHEN sensitive data is logged, THE System SHALL mask or exclude sensitive information
9. WHEN a user accesses the API, THE System SHALL enforce HTTPS for all communications
10. WHEN a user makes an API request, THE System SHALL validate the request origin against CORS whitelist
11. WHEN an admin action is performed, THE System SHALL log the action with user ID, timestamp, and action details
12. WHEN a failed login attempt occurs, THE System SHALL log the attempt for security monitoring

### Requirement 15: Error Handling & Recovery

**User Story:** As a system, I want to handle errors gracefully, so that users receive helpful feedback and the system remains stable.

#### Acceptance Criteria

1. WHEN an invalid input is provided, THE System SHALL return a 400 Bad Request error with detailed validation messages
2. WHEN a user is not authenticated, THE System SHALL return a 401 Unauthorized error
3. WHEN a user lacks permission, THE System SHALL return a 403 Forbidden error
4. WHEN a resource is not found, THE System SHALL return a 404 Not Found error
5. WHEN a conflict occurs (e.g., duplicate email), THE System SHALL return a 409 Conflict error
6. WHEN a server error occurs, THE System SHALL return a 500 Internal Server Error and log the error details
7. WHEN a payment fails, THE System SHALL allow the user to retry without losing order data
8. WHEN stock is insufficient, THE System SHALL return an error with available quantity information
9. WHEN a database connection fails, THE System SHALL retry the operation with exponential backoff
10. WHEN an external service (VNPay) is unavailable, THE System SHALL return a service unavailable error and log the incident

### Requirement 16: API Rate Limiting

**User Story:** As a system, I want to limit API requests, so that I can prevent abuse and ensure fair resource usage.

#### Acceptance Criteria

1. WHEN a user makes API requests, THE System SHALL limit them to 100 requests per minute
2. WHEN an admin makes API requests, THE System SHALL limit them to 50 requests per minute
3. WHEN a user exceeds the rate limit, THE System SHALL return a 429 Too Many Requests error
4. WHEN a user exceeds the rate limit, THE System SHALL include a Retry-After header in the response
5. WHEN a payment API is called, THE System SHALL limit requests to 10 per minute per user
6. WHEN rate limit is exceeded, THE System SHALL log the event for monitoring

### Requirement 17: Data Persistence & Backup

**User Story:** As a system, I want to persist data reliably, so that user information and transactions are never lost.

#### Acceptance Criteria

1. WHEN data is written to the database, THE System SHALL ensure ACID compliance
2. WHEN a transaction is committed, THE System SHALL persist the data to PostgreSQL
3. WHEN a backup is performed, THE System SHALL create a complete database backup
4. WHEN a backup is created, THE System SHALL store it in a secure location with encryption
5. WHEN a database failure occurs, THE System SHALL restore from the most recent backup
6. WHEN a user's order is created, THE System SHALL persist all order data before confirming to the user

### Requirement 18: Scalability & Performance Targets

**User Story:** As a system, I want to handle increasing load, so that I can support business growth without degradation.

#### Acceptance Criteria

1. WHEN a user searches for products, THE System SHALL respond within 200 milliseconds
2. WHEN a user views product details, THE System SHALL respond within 100 milliseconds
3. WHEN recommendations are generated, THE System SHALL respond within 500 milliseconds
4. WHEN a user checks out, THE System SHALL respond within 1000 milliseconds
5. WHEN an admin generates a report, THE System SHALL respond within 2000 milliseconds
6. WHEN multiple users access the system simultaneously, THE System SHALL support at least 1000 concurrent users
7. WHEN the database grows, THE System SHALL maintain query performance through proper indexing
8. WHEN traffic increases, THE System SHALL scale horizontally by adding more application instances

### Requirement 19: Notification System

**User Story:** As a user, I want to receive notifications about my orders, so that I can stay informed about purchase status.

#### Acceptance Criteria

1. WHEN an order is confirmed, THE System SHALL send a confirmation email to the user
2. WHEN an order status changes, THE System SHALL send a status update email to the user
3. WHEN a payment is successful, THE System SHALL send a payment confirmation email
4. WHEN a product in wishlist becomes available, THE System SHALL notify the user
5. WHEN a product price drops, THE System SHALL notify users who have it in their wishlist
6. WHEN an order is shipped, THE System SHALL send a shipping notification with tracking information
7. WHEN a notification is sent, THE System SHALL log the notification for audit purposes

### Requirement 20: Inventory Management

**User Story:** As a system, I want to manage inventory accurately, so that stock levels are always correct and overselling is prevented.

#### Acceptance Criteria

1. WHEN a product variant is added to cart, THE System SHALL reserve the stock quantity
2. WHEN a cart item is removed, THE System SHALL release the reserved stock
3. WHEN an order is confirmed, THE System SHALL deduct the stock from available inventory
4. WHEN an order is cancelled, THE System SHALL return the stock to available inventory
5. WHEN stock reaches zero, THE System SHALL mark the variant as out-of-stock
6. WHEN stock is replenished, THE System SHALL update the availability status
7. WHEN multiple users add the same variant to cart, THE System SHALL ensure total reserved stock never exceeds available stock
8. WHEN stock is updated, THE System SHALL invalidate product cache to reflect changes
9. WHEN a variant is out-of-stock, THE System SHALL prevent adding it to cart
10. WHEN stock is low, THE System SHALL alert the admin to reorder



## Non-Functional Requirements

### Performance Requirements

**Response Time Targets**:
- Product search: < 200ms (p95)
- Product details: < 100ms (p95)
- Recommendations: < 500ms (p95)
- Checkout: < 1000ms (p95)
- Admin reports: < 2000ms (p95)
- Cart operations: < 150ms (p95)

**Throughput Requirements**:
- System SHALL support at least 1000 concurrent users
- System SHALL handle 100 requests per second during peak hours
- System SHALL process 50 orders per minute during peak hours

**Database Performance**:
- Query response time: < 50ms for indexed queries
- Connection pool size: 20 connections
- Connection timeout: 30 seconds
- Idle timeout: 10 minutes

### Scalability Requirements

**Horizontal Scalability**:
- System SHALL support multiple application instances behind a load balancer
- System SHALL use stateless services to enable horizontal scaling
- System SHALL use Redis for distributed caching and session management

**Data Volume**:
- System SHALL support up to 100,000 products
- System SHALL support up to 1,000,000 users
- System SHALL support up to 10,000,000 orders
- System SHALL maintain performance as data volume grows

### Availability & Reliability

**Uptime Requirements**:
- System SHALL maintain 99.5% uptime (SLA)
- System SHALL have automated failover for database connections
- System SHALL implement connection pooling to prevent connection exhaustion

**Error Recovery**:
- System SHALL retry failed database operations with exponential backoff
- System SHALL implement circuit breaker pattern for external service calls
- System SHALL gracefully degrade when external services are unavailable

**Data Consistency**:
- System SHALL ensure ACID compliance for all database transactions
- System SHALL implement optimistic locking for concurrent updates
- System SHALL prevent race conditions in stock management

### Security Requirements

**Authentication**:
- System SHALL use JWT tokens with 15-minute expiration
- System SHALL use refresh tokens with 7-day expiration
- System SHALL implement token refresh mechanism
- System SHALL invalidate tokens on logout

**Authorization**:
- System SHALL implement role-based access control (RBAC)
- System SHALL enforce authorization on all protected endpoints
- System SHALL prevent privilege escalation

**Data Protection**:
- System SHALL encrypt passwords using BCrypt with 10 salt rounds
- System SHALL use HTTPS for all API communications
- System SHALL encrypt sensitive data at rest
- System SHALL implement input validation and sanitization
- System SHALL prevent SQL injection attacks
- System SHALL implement CORS to restrict cross-origin requests

**Payment Security**:
- System SHALL verify VNPay signatures using SHA-256
- System SHALL never store full credit card numbers
- System SHALL implement PCI compliance measures
- System SHALL use secure payment flow with tokenization

**Audit & Logging**:
- System SHALL log all admin actions with user ID, timestamp, and action details
- System SHALL log all payment transactions
- System SHALL log failed login attempts
- System SHALL retain logs for 90 days
- System SHALL mask sensitive information in logs

### Usability Requirements

**User Interface**:
- System SHALL provide intuitive navigation for product browsing
- System SHALL display clear product information with images and descriptions
- System SHALL provide real-time feedback for user actions
- System SHALL support responsive design for mobile and desktop

**Accessibility**:
- System SHALL follow WCAG 2.1 Level AA guidelines
- System SHALL provide keyboard navigation support
- System SHALL include alt text for all images
- System SHALL use semantic HTML for screen reader compatibility

**User Experience**:
- System SHALL provide clear error messages with actionable guidance
- System SHALL implement search suggestions and autocomplete
- System SHALL display product recommendations prominently
- System SHALL provide easy access to cart and checkout

### Maintainability Requirements

**Code Quality**:
- System SHALL follow SOLID principles
- System SHALL maintain code coverage > 80%
- System SHALL use consistent naming conventions
- System SHALL include comprehensive code documentation

**Architecture**:
- System SHALL use layered architecture (Controller → Service → Repository)
- System SHALL implement dependency injection
- System SHALL use design patterns (Factory, Strategy, Observer)
- System SHALL support migration to Microservices architecture

**Documentation**:
- System SHALL maintain API documentation (Swagger/OpenAPI)
- System SHALL document database schema and relationships
- System SHALL provide deployment and configuration guides
- System SHALL document security considerations and best practices

**Testing**:
- System SHALL implement unit tests for all business logic
- System SHALL implement integration tests for API endpoints
- System SHALL implement end-to-end tests for critical user flows
- System SHALL use property-based testing for complex algorithms

### Compatibility Requirements

**Browser Support**:
- System SHALL support Chrome 90+
- System SHALL support Firefox 88+
- System SHALL support Safari 14+
- System SHALL support Edge 90+

**Technology Stack**:
- Backend: Spring Boot 3.x, Java 17+
- Frontend: React 18+, Node.js 16+
- Database: PostgreSQL 14+
- Cache: Redis 7+

## Constraints

### Technology Constraints

1. Backend MUST use Spring Boot 3.x with Java 17+
2. Frontend MUST use React 18+ with TypeScript
3. Database MUST use PostgreSQL 14+
4. Cache layer MUST use Redis 7+
5. API MUST follow REST conventions
6. Authentication MUST use JWT tokens
7. Payment integration MUST use VNPay gateway

### Business Constraints

1. System MUST support Vietnamese language and currency (VND)
2. System MUST comply with Vietnamese e-commerce regulations
3. System MUST support VNPay as primary payment method
4. System MUST maintain product catalog with at least 100 keyboards
5. System MUST support multiple product variants per keyboard
6. System MUST provide admin dashboard for business analytics

### Regulatory Constraints

1. System MUST comply with PCI DSS for payment processing
2. System MUST comply with GDPR for user data protection
3. System MUST comply with Vietnamese data protection laws
4. System MUST implement audit logging for compliance
5. System MUST provide data export functionality for users
6. System MUST implement data retention policies

### Performance Constraints

1. Product search response time MUST be < 200ms
2. System MUST support at least 1000 concurrent users
3. Database queries MUST use indexes for performance
4. Cache hit rate MUST be > 80% for frequently accessed data
5. API rate limiting MUST be enforced at 100 requests/minute per user

### Security Constraints

1. All passwords MUST be hashed using BCrypt
2. All API communications MUST use HTTPS
3. JWT tokens MUST expire after 15 minutes
4. Refresh tokens MUST expire after 7 days
5. VNPay signatures MUST be verified on all callbacks
6. Sensitive data MUST be encrypted at rest

## Dependencies & Integration Points

### External Services

**VNPay Payment Gateway**:
- Integration: REST API
- Purpose: Process online payments
- Endpoints: Payment creation, callback verification
- Security: SHA-256 signature verification
- Fallback: Order remains in PENDING status if payment fails

**Email Service**:
- Integration: SMTP or third-party email service
- Purpose: Send order confirmations, status updates, password reset links
- Frequency: Triggered on order creation, status change, password reset
- Retry: Implement retry mechanism for failed emails

**Cloud Storage**:
- Integration: AWS S3 or similar
- Purpose: Store product images
- Capacity: Support up to 100,000 product images
- Backup: Implement backup strategy for stored images

### Internal Service Dependencies

**Authentication Service** depends on:
- User Repository (database)
- JWT Token Manager
- Password Hashing Service

**Product Service** depends on:
- Product Repository
- Product Variant Repository
- Cache Layer (Redis)
- Recommendation Service

**Order Service** depends on:
- Order Repository
- Cart Service
- Payment Service
- Inventory Management Service
- Notification Service

**Payment Service** depends on:
- VNPay Gateway
- Payment Repository
- Order Service
- Notification Service

**Recommendation Service** depends on:
- Product Repository
- User View History Repository
- User Purchase History Repository
- Cache Layer (Redis)

### Database Dependencies

**Primary Database**: PostgreSQL 14+
- Tables: Users, Products, Orders, Payments, Wishlists, Reviews, etc.
- Backup: Daily automated backups
- Replication: Master-slave replication for high availability

**Cache Layer**: Redis 7+
- Purpose: Session storage, cart storage, recommendation caching
- TTL: Configurable per data type
- Eviction: LRU eviction policy

### API Integration Points

**Frontend to Backend**:
- Protocol: REST over HTTPS
- Authentication: JWT Bearer tokens
- Content-Type: application/json
- CORS: Restricted to frontend domain

**Backend to VNPay**:
- Protocol: REST over HTTPS
- Authentication: Merchant ID and secret key
- Signature: SHA-256 HMAC
- Callback: Webhook for payment status updates

**Backend to Email Service**:
- Protocol: SMTP or REST API
- Authentication: API key or credentials
- Retry: Exponential backoff for failed sends

## Acceptance Criteria Summary

This requirements document defines 20 major functional requirements covering:
- User authentication and authorization
- Product browsing with multi-dimensional filtering
- Product variant management
- Shopping cart operations
- Order management and checkout
- Payment processing with VNPay
- Recommendation system
- Wishlist management
- Admin dashboard and reporting
- Product management
- User profile management
- Product reviews and ratings
- Performance and caching
- Security and data protection
- Error handling and recovery
- API rate limiting
- Data persistence and backup
- Scalability and performance targets
- Notification system
- Inventory management

Each requirement includes specific acceptance criteria that define testable conditions for system behavior.

