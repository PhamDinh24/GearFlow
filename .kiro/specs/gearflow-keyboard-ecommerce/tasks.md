# Implementation Plan: GearFlow Keyboard E-commerce System

## Overview

This implementation plan breaks down the GearFlow E-commerce system into discrete, incremental coding tasks. The system is built with Spring Boot 3.x backend, React 18+ frontend, PostgreSQL database, and Redis caching. Each task builds on previous steps with integrated testing and validation checkpoints.

## Phase 1: Backend Infrastructure & Core Setup

- [ ] 1. Set up Spring Boot project structure and dependencies
  - Create Spring Boot 3.x project with Maven/Gradle
  - Configure application.properties for PostgreSQL, Redis, and VNPay
  - Set up logging with SLF4J and Logback
  - Configure error handling with @ControllerAdvice and custom exceptions
  - _Requirements: 14.1, 15.1_

- [ ] 2. Configure database schema and migrations
  - Create PostgreSQL schema with all tables (users, products, orders, payments, etc.)
  - Set up Flyway or Liquibase for database migrations
  - Create indexes on frequently queried columns (email, product_id, user_id)
  - Implement audit columns (created_at, updated_at) on all tables
  - _Requirements: 17.1, 17.2_

- [ ] 3. Implement authentication service with JWT
  - Create User entity and UserRepository
  - Implement BCrypt password hashing with 10 salt rounds
  - Create JWT token provider with HS256 algorithm
  - Implement AuthenticationService with login, register, refresh token methods
  - Create AuthenticationController with /api/auth endpoints
  - _Requirements: 1.1, 1.2, 1.3, 14.1, 14.3_

- [ ]* 3.1 Write property tests for authentication
  - **Property 1: Password hashing consistency** - Same password always hashes to different values but validates correctly
  - **Validates: Requirements 1.1, 14.1**

- [ ] 4. Configure security and CORS
  - Set up Spring Security with JWT filter
  - Configure CORS to allow frontend domain
  - Implement role-based access control (RBAC) for USER and ADMIN roles
  - Create SecurityConfig with authorization rules
  - _Requirements: 1.8, 1.9, 14.9, 14.10_

- [ ] 5. Set up Redis caching layer
  - Configure Redis connection and RedisTemplate
  - Create CacheConfig with cache managers
  - Implement cache annotations (@Cacheable, @CacheEvict)
  - Set up cache TTL configurations (30min for products, 24h for recommendations, 1h for stats)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_

- [ ] 6. Implement rate limiting
  - Create RateLimitingFilter with token bucket algorithm
  - Configure rate limits (100 req/min for users, 50 req/min for admins, 10 req/min for payments)
  - Implement 429 Too Many Requests response with Retry-After header
  - _Requirements: 16.1, 16.2, 16.3, 16.4, 16.5_

- [ ] 7. Checkpoint - Verify backend infrastructure
  - Ensure all Spring Boot services start without errors
  - Verify database migrations run successfully
  - Test JWT token generation and validation
  - Confirm Redis connection and caching works
  - Ask the user if questions arise.


## Phase 2: Core Services Implementation

- [ ] 8. Implement Product Service with multi-dimensional filtering
  - Create Product, ProductVariant, ProductAttribute entities
  - Create ProductRepository with custom query methods for filtering
  - Implement ProductService with searchProducts method supporting switch type, layout, brand, price range, RGB support, connection type
  - Create ProductController with GET /api/products/search endpoint
  - Implement facet count calculation for filter UI
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.11, 2.12_

- [ ]* 8.1 Write property tests for product filtering
  - **Property 2: Monotonic filtering** - Adding filters never increases result count
  - **Validates: Requirements 2.8**

- [ ]* 8.2 Write property tests for facet counts
  - **Property 3: Facet count consistency** - Sum of facet counts >= total results
  - **Validates: Requirements 2.7**

- [ ] 9. Implement Product Variant Service
  - Create VariantStock entity for inventory tracking
  - Implement ProductVariantService with variant CRUD operations
  - Implement price calculation (base_price + price_modifier)
  - Create variant endpoints for admin: POST, PUT, DELETE /api/admin/products/{id}/variants
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ]* 9.1 Write unit tests for variant pricing
  - Test price modifier calculations (positive, negative, zero)
  - Test stock availability checks
  - _Requirements: 3.2_

- [ ] 10. Implement Cart Service with Redis persistence
  - Create CartService with add, remove, update, clear operations
  - Implement cart persistence in Redis with 7-day expiration
  - Create CartController with GET, POST, PUT, DELETE endpoints
  - Implement stock validation before adding items
  - Implement cart summary calculation
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10_

- [ ]* 10.1 Write property tests for cart operations
  - **Property 4: Cart idempotency** - Adding same item twice with quantity 1 equals adding with quantity 2
  - **Validates: Requirements 4.2, 4.10**

- [ ]* 10.2 Write unit tests for cart edge cases
  - Test adding item with insufficient stock
  - Test removing non-existent items
  - Test cart persistence and retrieval
  - _Requirements: 4.3, 4.4_

- [ ] 11. Implement Order Service
  - Create Order, OrderItem, OrderStatus entities
  - Implement OrderService with createOrder, getOrder, updateOrderStatus methods
  - Create OrderController with POST, GET endpoints
  - Implement order creation from cart with stock reservation
  - Implement order status transitions (PENDING → CONFIRMED → SHIPPED → DELIVERED)
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10, 5.11, 5.12_

- [ ]* 11.1 Write property tests for order creation
  - **Property 5: Order total consistency** - Order total = sum of all order items
  - **Validates: Requirements 5.3**

- [ ]* 11.2 Write unit tests for order operations
  - Test order creation with valid cart
  - Test order status transitions
  - Test order cancellation and stock release
  - _Requirements: 5.1, 5.9, 5.11_

- [ ] 12. Implement Payment Service with VNPay integration
  - Create Payment, PaymentMethod, PaymentStatus entities
  - Implement PaymentService with createPayment, verifyPayment, processCallback methods
  - Implement VNPay request generation with secure parameters
  - Implement VNPay callback verification using SHA-256 signature
  - Create PaymentController with POST /api/payments/create and GET /api/payments/callback
  - Implement idempotency check for payment callbacks
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9, 6.10, 6.11, 6.12_

- [ ]* 12.1 Write property tests for payment processing
  - **Property 6: Payment idempotency** - Processing same callback twice results in same state
  - **Validates: Requirements 6.9**

- [ ]* 12.2 Write unit tests for VNPay integration
  - Test payment request generation
  - Test signature verification with valid and invalid signatures
  - Test payment status updates
  - _Requirements: 6.5, 6.6_

- [ ] 13. Implement Recommendation Service
  - Create ProductView, PurchaseHistory entities for tracking
  - Implement RecommendationService with view-based, purchase-based, collaborative filtering methods
  - Implement accessory recommendation logic
  - Create RecommendationController with GET endpoints
  - Implement recommendation caching with 24-hour expiration
  - Implement cache invalidation on purchase
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9, 7.10, 7.11, 7.12_

- [ ]* 13.1 Write property tests for recommendations
  - **Property 7: Recommendation exclusion** - Recommendations never include already purchased products
  - **Validates: Requirements 7.6, 7.7_

- [ ]* 13.2 Write unit tests for recommendation algorithms
  - Test view-based recommendations
  - Test purchase-based recommendations
  - Test accessory recommendations
  - _Requirements: 7.2, 7.3, 7.5, 7.9_

- [ ] 14. Implement User Service
  - Create UserService with profile management methods
  - Implement Wishlist entity and operations
  - Create UserController with GET, PUT endpoints
  - Implement wishlist add, remove, view operations
  - Implement profile update with validation
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

- [ ]* 14.1 Write unit tests for user profile operations
  - Test profile update validation
  - Test wishlist operations
  - Test duplicate prevention in wishlist
  - _Requirements: 11.2, 8.2_

- [ ] 15. Implement Admin Service
  - Create AdminService with product CRUD, order management, reporting methods
  - Implement DashboardStats calculation (total orders, revenue, new users)
  - Implement top products and sales report generation
  - Create AdminController with GET, POST, PUT, DELETE endpoints
  - Implement admin-only authorization checks
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7, 9.8, 9.9, 9.10_

- [ ]* 15.1 Write unit tests for admin operations
  - Test product CRUD operations
  - Test dashboard stats calculation
  - Test report generation
  - _Requirements: 10.1, 10.2, 9.1, 9.2_

- [ ] 16. Implement Review Service
  - Create Review entity with rating and comment
  - Implement ReviewService with create, update, delete, getByProduct methods
  - Implement average rating calculation
  - Create ReviewController with GET, POST, PUT, DELETE endpoints
  - Implement duplicate review prevention
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8_

- [ ]* 16.1 Write unit tests for review operations
  - Test review creation and validation
  - Test duplicate prevention
  - Test average rating calculation
  - _Requirements: 12.2, 12.3, 12.5_

- [ ] 17. Checkpoint - Verify all backend services
  - Test all service endpoints with Postman or similar
  - Verify database operations work correctly
  - Confirm caching is functioning
  - Test error handling and validation
  - Ask the user if questions arise.


## Phase 3: Frontend Implementation (React)

- [ ] 18. Set up React project structure and routing
  - Create React 18+ project with TypeScript
  - Configure React Router for navigation
  - Set up Axios for API calls with JWT interceptor
  - Create project folder structure (components, pages, services, hooks, utils)
  - Configure environment variables for API base URL
  - _Requirements: 2.1, 1.1_

- [ ] 19. Implement authentication pages
  - Create Login page with email and password fields
  - Create Register page with validation
  - Implement JWT token storage in localStorage
  - Create ProtectedRoute component for authorization
  - Implement logout functionality
  - Create auth context for global state management
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7_

- [ ]* 19.1 Write unit tests for authentication pages
  - Test login form validation
  - Test register form validation
  - Test token storage and retrieval
  - _Requirements: 1.1, 1.2_

- [ ] 20. Implement product browsing and filtering
  - Create ProductList page with pagination
  - Create FilterPanel component with switch type, layout, brand, price range filters
  - Implement facet count display
  - Create ProductCard component for product display
  - Implement search functionality
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.10_

- [ ]* 20.1 Write unit tests for product filtering
  - Test filter application
  - Test pagination
  - Test facet count display
  - _Requirements: 2.1, 2.6, 2.7_

- [ ] 21. Implement product details page
  - Create ProductDetail page with product information
  - Display all product variants with prices
  - Show variant selector (switch type, color, keycap set)
  - Display product images and description
  - Show stock availability
  - Display product reviews and average rating
  - _Requirements: 3.3, 3.4, 12.4, 12.5, 12.6_

- [ ]* 21.1 Write unit tests for product details
  - Test variant selection
  - Test price calculation with modifiers
  - Test review display
  - _Requirements: 3.3, 3.4, 12.4_

- [ ] 22. Implement shopping cart
  - Create Cart page with cart items display
  - Implement add to cart functionality
  - Create quantity update component
  - Implement remove from cart
  - Display cart total and item count
  - Implement clear cart button
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [ ]* 22.1 Write unit tests for cart operations
  - Test add to cart
  - Test quantity update
  - Test remove from cart
  - Test cart total calculation
  - _Requirements: 4.1, 4.3, 4.4, 4.6_

- [ ] 23. Implement checkout and payment flow
  - Create Checkout page with shipping address form
  - Implement order creation
  - Integrate VNPay payment redirect
  - Create payment success page
  - Create payment failure page with retry option
  - Implement order confirmation display
  - _Requirements: 5.1, 5.2, 5.4, 6.3, 6.4, 6.10, 6.11_

- [ ]* 23.1 Write unit tests for checkout flow
  - Test shipping address validation
  - Test order creation
  - Test payment redirect
  - _Requirements: 5.4, 6.3_

- [ ] 24. Implement order tracking
  - Create Orders page with order list
  - Display order status with timeline
  - Show order items and total price
  - Implement order detail view
  - Display payment status
  - _Requirements: 5.10, 5.12_

- [ ]* 24.1 Write unit tests for order tracking
  - Test order list display
  - Test order detail view
  - Test status display
  - _Requirements: 5.10, 5.12_

- [ ] 25. Implement user profile management
  - Create Profile page with user information
  - Implement profile update form with validation
  - Create password change form
  - Display user's order history
  - Implement wishlist management from profile
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 8.1, 8.4, 8.5, 8.8_

- [ ]* 25.1 Write unit tests for profile management
  - Test profile update
  - Test password change
  - Test wishlist display
  - _Requirements: 11.2, 11.5, 8.1_

- [ ] 26. Implement wishlist functionality
  - Create Wishlist page
  - Implement add to wishlist button on product pages
  - Display wishlist items with current prices
  - Implement remove from wishlist
  - Show out-of-stock status
  - Implement "Add all to cart" functionality
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7, 8.8, 8.9_

- [ ]* 26.1 Write unit tests for wishlist
  - Test add to wishlist
  - Test remove from wishlist
  - Test duplicate prevention
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 27. Implement product recommendations display
  - Create Recommendations component
  - Display view-based recommendations on homepage
  - Display purchase-based recommendations on order confirmation
  - Display accessory recommendations on product detail page
  - Implement recommendation carousel
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.8, 7.9_

- [ ]* 27.1 Write unit tests for recommendations
  - Test recommendation display
  - Test carousel functionality
  - _Requirements: 7.8, 7.9_

- [ ] 28. Implement admin dashboard
  - Create Admin Dashboard page with statistics
  - Display total orders, revenue, new users
  - Display top-selling products
  - Create sales report chart
  - Implement date range filter
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.8, 9.9, 9.10_

- [ ]* 28.1 Write unit tests for admin dashboard
  - Test statistics display
  - Test chart rendering
  - Test date range filtering
  - _Requirements: 9.1, 9.2, 9.5_

- [ ] 29. Implement admin product management
  - Create Products Management page
  - Implement product list with search and pagination
  - Create product creation form
  - Create product edit form
  - Implement product deletion with confirmation
  - Create variant management interface
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 10.10_

- [ ]* 29.1 Write unit tests for product management
  - Test product creation form
  - Test product edit form
  - Test product deletion
  - _Requirements: 10.1, 10.2, 10.3_

- [ ] 30. Implement admin order management
  - Create Orders Management page
  - Display all orders with status
  - Implement order status update
  - Show order details and items
  - Implement order filtering by status
  - _Requirements: 9.1, 9.4_

- [ ]* 30.1 Write unit tests for order management
  - Test order list display
  - Test status update
  - Test filtering
  - _Requirements: 9.1, 9.4_

- [ ] 31. Implement error handling and notifications
  - Create error boundary component
  - Implement toast notifications for user feedback
  - Display validation error messages
  - Implement error recovery UI
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6, 15.7, 15.8_

- [ ]* 31.1 Write unit tests for error handling
  - Test error boundary
  - Test notification display
  - _Requirements: 15.1, 15.2_

- [ ] 32. Implement responsive design and accessibility
  - Ensure mobile responsiveness
  - Implement keyboard navigation
  - Add ARIA labels and semantic HTML
  - Test with screen readers
  - Ensure color contrast compliance
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5_

- [ ] 33. Checkpoint - Verify frontend functionality
  - Test all pages load correctly
  - Verify API integration works
  - Test authentication flow
  - Test product browsing and filtering
  - Test cart and checkout flow
  - Ask the user if questions arise.


## Phase 4: Integration & Testing

- [ ] 34. Write backend integration tests
  - Create integration tests for authentication flow
  - Test product search with various filter combinations
  - Test cart operations with stock validation
  - Test order creation and payment flow
  - Test recommendation generation
  - Use TestContainers for PostgreSQL and Redis
  - _Requirements: 1.1, 2.1, 4.1, 5.1, 7.1_

- [ ] 35. Write frontend integration tests
  - Test complete user registration and login flow
  - Test product browsing and filtering
  - Test add to cart and checkout flow
  - Test order tracking
  - Test wishlist operations
  - Use React Testing Library and Jest
  - _Requirements: 1.1, 2.1, 4.1, 5.1, 8.1_

- [ ] 36. Write end-to-end tests
  - Create E2E tests for complete user journey (browse → cart → checkout → payment)
  - Test admin product management flow
  - Test admin dashboard and reporting
  - Test payment callback handling
  - Use Cypress or Playwright
  - _Requirements: 5.1, 6.4, 9.1, 10.1_

- [ ] 37. Implement performance testing
  - Create load tests for product search (target: < 200ms response time)
  - Test concurrent user scenarios (target: 1000 concurrent users)
  - Test database query performance with indexes
  - Measure cache hit rates (target: > 80%)
  - Use JMeter or similar tool
  - _Requirements: 18.1, 18.2, 18.3, 18.4, 18.5, 18.6, 18.7, 18.8_

- [ ] 38. Implement security testing
  - Test SQL injection prevention
  - Test XSS prevention
  - Test CSRF protection
  - Test JWT token validation
  - Test VNPay signature verification
  - Test rate limiting enforcement
  - _Requirements: 14.5, 14.6, 14.7, 14.8, 16.1, 16.2, 16.3_

- [ ] 39. Implement inventory management tests
  - Test stock reservation on cart add
  - Test stock release on cart remove
  - Test concurrent stock updates
  - Test overselling prevention
  - Test stock deduction on order confirmation
  - _Requirements: 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 20.9, 20.10_

- [ ]* 39.1 Write property tests for inventory
  - **Property 8: Stock conservation** - Total of (available + reserved + sold) always equals initial stock
  - **Validates: Requirements 20.1, 20.2, 20.3, 20.7_

- [ ] 40. Implement notification system tests
  - Test order confirmation email sending
  - Test order status update notifications
  - Test payment confirmation emails
  - Test wishlist availability notifications
  - Test price drop notifications
  - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7_

- [ ] 41. Checkpoint - Verify all tests pass
  - Run all unit tests (target: > 80% coverage)
  - Run all integration tests
  - Run all E2E tests
  - Verify performance targets are met
  - Verify security tests pass
  - Ask the user if questions arise.


## Phase 5: Deployment & Documentation

- [ ] 42. Create Docker configuration
  - Create Dockerfile for Spring Boot backend
  - Create Dockerfile for React frontend
  - Create docker-compose.yml for local development
  - Configure PostgreSQL container
  - Configure Redis container
  - Set up environment variables for containers
  - _Requirements: 18.1, 18.2_

- [ ] 43. Set up CI/CD pipeline
  - Create GitHub Actions workflow for backend tests
  - Create GitHub Actions workflow for frontend tests
  - Create GitHub Actions workflow for Docker image build
  - Implement automated deployment to staging
  - Configure code quality checks (SonarQube or similar)
  - _Requirements: 18.1, 18.2_

- [ ] 44. Create API documentation
  - Generate Swagger/OpenAPI documentation from Spring Boot
  - Document all REST endpoints with request/response examples
  - Document authentication requirements
  - Document error responses
  - Create API usage guide
  - _Requirements: 18.1, 18.2_

- [ ] 45. Create database documentation
  - Document database schema with table descriptions
  - Document relationships and foreign keys
  - Document indexes and performance considerations
  - Create ER diagram documentation
  - Document backup and recovery procedures
  - _Requirements: 17.1, 17.2, 17.3, 17.4, 17.5, 17.6_

- [ ] 46. Create deployment guide
  - Document system requirements (Java 17+, PostgreSQL 14+, Redis 7+, Node.js 16+)
  - Create step-by-step deployment instructions
  - Document environment configuration
  - Create troubleshooting guide
  - Document scaling considerations
  - _Requirements: 18.1, 18.2_

- [ ] 47. Create user documentation
  - Create user guide for product browsing
  - Create guide for account management
  - Create guide for checkout and payment
  - Create guide for order tracking
  - Create FAQ section
  - _Requirements: 18.1, 18.2_

- [ ] 48. Create admin documentation
  - Create admin guide for product management
  - Create guide for order management
  - Create guide for dashboard and reporting
  - Create guide for user management
  - Create guide for system monitoring
  - _Requirements: 18.1, 18.2_

- [ ] 49. Create security documentation
  - Document security architecture
  - Document authentication and authorization
  - Document data protection measures
  - Document compliance requirements (PCI DSS, GDPR)
  - Create security best practices guide
  - _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6, 14.7, 14.8_

- [ ] 50. Final checkpoint - Verify deployment readiness
  - Verify all documentation is complete
  - Test deployment process
  - Verify all tests pass in CI/CD
  - Verify performance targets are met
  - Verify security requirements are met
  - Ask the user if questions arise.

## Implementation Notes

### Architecture Decisions

1. **Layered Architecture**: Controller → Service → Repository pattern for clean separation of concerns
2. **Caching Strategy**: Redis for session, cart, and recommendation caching with configurable TTL
3. **Payment Integration**: VNPay with SHA-256 signature verification for security
4. **Recommendation Engine**: Hybrid approach combining view-based, purchase-based, and collaborative filtering
5. **Stock Management**: Reservation-based system to prevent overselling with concurrent access

### Testing Strategy

- **Unit Tests**: Test individual components in isolation (target: > 80% coverage)
- **Property-Based Tests**: Validate universal properties (monotonic filtering, idempotency, conservation laws)
- **Integration Tests**: Test service interactions with real database and cache
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Validate response time and throughput targets
- **Security Tests**: Validate authentication, authorization, and data protection

### Performance Targets

- Product search: < 200ms (p95)
- Product details: < 100ms (p95)
- Recommendations: < 500ms (p95)
- Checkout: < 1000ms (p95)
- Admin reports: < 2000ms (p95)
- Concurrent users: 1000+
- Cache hit rate: > 80%

### Security Measures

- JWT tokens with 15-minute expiration
- BCrypt password hashing with 10 salt rounds
- VNPay signature verification with SHA-256
- CORS configuration for frontend domain
- Rate limiting (100 req/min for users, 50 req/min for admins)
- Input validation and sanitization
- HTTPS enforcement
- Audit logging for admin actions

### Database Considerations

- PostgreSQL 14+ with proper indexing
- Flyway/Liquibase for schema migrations
- Connection pooling (20 connections)
- Automated daily backups
- Master-slave replication for high availability

### Deployment Considerations

- Docker containerization for consistency
- CI/CD pipeline with automated testing
- Environment-based configuration
- Horizontal scaling support with stateless services
- Redis for distributed caching and session management
- Load balancer for traffic distribution

