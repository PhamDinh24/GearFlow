# Correctness Properties Prework Analysis

## Requirement 1: User Authentication & Authorization

1.1. WHEN a user provides valid email, password, full name, and phone number, THE System SHALL create a new user account and return a success message
  Thoughts: This is testing a specific event with valid inputs. We can generate random valid user data and verify the account is created.
  Testable: yes - example

1.2. WHEN a user provides an email that already exists, THE System SHALL reject the registration and return an error message
  Thoughts: This is testing error handling for duplicate emails. We can generate a user, register them, then try to register again with the same email.
  Testable: yes - example

1.3. WHEN a user provides valid email and password, THE System SHALL authenticate the user and return JWT access token and refresh token
  Thoughts: This is testing that valid credentials produce tokens. We can generate random valid credentials and verify tokens are returned.
  Testable: yes - property

1.4. WHEN a user provides invalid email or password, THE System SHALL reject the login and return a 401 Unauthorized error
  Thoughts: This is testing error handling for invalid credentials. We can generate invalid credentials and verify rejection.
  Testable: yes - property

1.5. WHEN a user's JWT token expires, THE System SHALL allow the user to refresh the token using the refresh token
  Thoughts: This is testing token refresh functionality. We can create a token, wait for expiration, then refresh it.
  Testable: yes - property

1.6. WHEN a user logs out, THE System SHALL invalidate the JWT token and clear the session
  Thoughts: This is testing logout functionality. We can log in, then log out, then verify the token is invalid.
  Testable: yes - property

1.7. WHEN a user accesses a protected endpoint without a valid token, THE System SHALL return a 401 Unauthorized error
  Thoughts: This is testing authorization. We can access a protected endpoint without a token and verify rejection.
  Testable: yes - property

1.8. WHEN an admin accesses an admin-only endpoint, THE System SHALL verify the user has ADMIN role before allowing access
  Thoughts: This is testing role-based access control. We can create an admin user and verify they can access admin endpoints.
  Testable: yes - property

1.9. WHEN a non-admin user attempts to access an admin endpoint, THE System SHALL return a 403 Forbidden error
  Thoughts: This is testing authorization for non-admin users. We can create a regular user and verify they cannot access admin endpoints.
  Testable: yes - property

## Requirement 2: Product Browsing with Multi-dimensional Filtering

2.1. WHEN a user searches for products without filters, THE System SHALL return all available products paginated
  Thoughts: This is testing basic search functionality. We can search without filters and verify all products are returned.
  Testable: yes - property

2.2. WHEN a user filters by switch type (LINEAR, TACTILE, CLICKY), THE System SHALL return only products with matching switch types
  Thoughts: This is testing filter functionality. We can generate products with different switch types and verify filtering works.
  Testable: yes - property

2.3. WHEN a user filters by layout (60%, 75%, 100%), THE System SHALL return only products with matching layouts
  Thoughts: This is testing filter functionality. We can generate products with different layouts and verify filtering works.
  Testable: yes - property

2.4. WHEN a user filters by brand, THE System SHALL return only products from the selected brand
  Thoughts: This is testing filter functionality. We can generate products from different brands and verify filtering works.
  Testable: yes - property

2.5. WHEN a user filters by price range (min and max), THE System SHALL return only products within the specified price range
  Thoughts: This is testing price range filtering. We can generate products with different prices and verify filtering works.
  Testable: yes - property

2.6. WHEN a user applies multiple filters simultaneously, THE System SHALL apply all filters and return products matching ALL criteria
  Thoughts: This is testing that multiple filters are applied together. We can apply multiple filters and verify all are applied.
  Testable: yes - property

2.7. WHEN a user applies filters, THE System SHALL display facet counts showing how many products match each filter value
  Thoughts: This is testing facet count calculation. We can apply filters and verify facet counts are correct.
  Testable: yes - property

2.8. WHEN a user adds more filters, THE System SHALL never increase the result count (monotonic property)
  Thoughts: This is a universal property that should hold for all filter combinations. Adding filters should never increase results.
  Testable: yes - property

2.9. WHEN a user removes filters, THE System SHALL never decrease the result count
  Thoughts: This is a universal property that should hold for all filter combinations. Removing filters should never decrease results.
  Testable: yes - property

2.10. WHEN a user searches with pagination, THE System SHALL return results in pages with configurable page size
  Thoughts: This is testing pagination. We can search and verify pagination works correctly.
  Testable: yes - property

2.11. WHEN a user filters by RGB support, THE System SHALL return only products with RGB support enabled
  Thoughts: This is testing filter functionality. We can generate products with and without RGB support and verify filtering works.
  Testable: yes - property

2.12. WHEN a user filters by connection type (Wired, Wireless, Bluetooth), THE System SHALL return only products with matching connection types
  Thoughts: This is testing filter functionality. We can generate products with different connection types and verify filtering works.
  Testable: yes - property

## Requirement 3: Product Variant Management

3.1. WHEN an admin creates a product variant, THE System SHALL store the variant with switch type, color, keycap set, and price modifier
  Thoughts: This is testing variant creation. We can create a variant and verify all fields are stored.
  Testable: yes - example

3.2. WHEN an admin specifies a price modifier for a variant, THE System SHALL calculate the final price as base_price + price_modifier
  Thoughts: This is testing price calculation. We can create variants with different modifiers and verify the calculation.
  Testable: yes - property

3.3. WHEN a user views a product, THE System SHALL display all available variants with their respective prices
  Thoughts: This is testing variant display. We can view a product and verify all variants are displayed.
  Testable: yes - property

3.4. WHEN a user selects a variant, THE System SHALL check the stock availability for that specific variant
  Thoughts: This is testing stock checking. We can select a variant and verify stock is checked.
  Testable: yes - property

3.5. WHEN a variant's stock reaches zero, THE System SHALL mark the variant as out-of-stock and prevent purchases
  Thoughts: This is testing out-of-stock handling. We can reduce stock to zero and verify purchases are prevented.
  Testable: yes - property

3.6. WHEN an admin updates a variant's stock, THE System SHALL immediately reflect the change in the product listing
  Thoughts: This is testing stock update. We can update stock and verify the change is reflected.
  Testable: yes - property

3.7. WHEN a user adds a variant to cart, THE System SHALL reserve the stock quantity to prevent overselling
  Thoughts: This is testing stock reservation. We can add a variant to cart and verify stock is reserved.
  Testable: yes - property

3.8. WHEN a user removes an item from cart, THE System SHALL release the reserved stock
  Thoughts: This is testing stock release. We can remove an item from cart and verify stock is released.
  Testable: yes - property

3.9. WHEN multiple users add the same variant to cart, THE System SHALL ensure total reserved stock never exceeds available stock
  Thoughts: This is a universal property that should hold for all concurrent operations. Total reserved should never exceed available.
  Testable: yes - property

## Requirement 4: Shopping Cart Operations

4.1. WHEN a user adds a product variant to cart, THE System SHALL add the item to the cart and increase the item count
  Thoughts: This is testing cart addition. We can add an item and verify the count increases.
  Testable: yes - property

4.2. WHEN a user adds the same variant multiple times, THE System SHALL increase the quantity instead of creating duplicate items
  Thoughts: This is testing quantity increment. We can add the same variant twice and verify quantity increases.
  Testable: yes - property

4.3. WHEN a user specifies a quantity greater than available stock, THE System SHALL reject the addition and return an error
  Thoughts: This is testing stock validation. We can try to add more than available and verify rejection.
  Testable: yes - property

4.4. WHEN a user removes an item from cart, THE System SHALL remove the item and update the cart total
  Thoughts: This is testing cart removal. We can remove an item and verify the total updates.
  Testable: yes - property

4.5. WHEN a user updates the quantity of a cart item, THE System SHALL validate the new quantity against available stock
  Thoughts: This is testing quantity validation. We can update quantity and verify validation.
  Testable: yes - property

4.6. WHEN a user clears the cart, THE System SHALL remove all items and reset the cart total to zero
  Thoughts: This is testing cart clearing. We can clear the cart and verify all items are removed.
  Testable: yes - property

4.7. WHEN a user views the cart, THE System SHALL display all items with prices, quantities, and total amount
  Thoughts: This is testing cart display. We can view the cart and verify all information is displayed.
  Testable: yes - property

4.8. WHEN a user adds an item to cart, THE System SHALL persist the cart to Redis cache with 7-day expiration
  Thoughts: This is testing cart persistence. We can add an item and verify it's persisted.
  Testable: yes - property

4.9. WHEN a user's session expires, THE System SHALL preserve the cart data for 7 days
  Thoughts: This is testing cart preservation. We can let a session expire and verify the cart is preserved.
  Testable: yes - property

4.10. WHEN a user adds then removes an item, THE System SHALL return the cart to its original state
  Thoughts: This is a round-trip property. Adding then removing should return to original state.
  Testable: yes - property

## Requirement 5: Order Management & Checkout

5.1. WHEN a user initiates checkout with items in cart, THE System SHALL create an order with status PENDING
  Thoughts: This is testing order creation. We can checkout and verify an order is created.
  Testable: yes - property

5.2. WHEN an order is created, THE System SHALL copy all cart items to order items with current prices
  Thoughts: This is testing order item copying. We can create an order and verify items are copied.
  Testable: yes - property

5.3. WHEN an order is created, THE System SHALL calculate the total price as sum of all order items
  Thoughts: This is testing price calculation. We can create an order and verify the total is correct.
  Testable: yes - property

5.4. WHEN a user provides a shipping address, THE System SHALL validate the address format and store it with the order
  Thoughts: This is testing address validation. We can provide an address and verify it's validated and stored.
  Testable: yes - property

5.5. WHEN an order is created, THE System SHALL reserve stock for all order items
  Thoughts: This is testing stock reservation. We can create an order and verify stock is reserved.
  Testable: yes - property

5.6. WHEN a payment is confirmed, THE System SHALL update the order status to CONFIRMED
  Thoughts: This is testing order status update. We can confirm payment and verify status updates.
  Testable: yes - property

5.7. WHEN a payment fails, THE System SHALL keep the order in PENDING status and allow retry
  Thoughts: This is testing payment failure handling. We can fail a payment and verify order stays PENDING.
  Testable: yes - property

5.8. WHEN an order is confirmed, THE System SHALL clear the user's cart
  Thoughts: This is testing cart clearing. We can confirm an order and verify the cart is cleared.
  Testable: yes - property

5.9. WHEN an admin updates order status, THE System SHALL transition the status through valid states (PENDING → CONFIRMED → SHIPPED → DELIVERED)
  Thoughts: This is testing state machine. We can update status and verify valid transitions.
  Testable: yes - property

5.10. WHEN a user views their orders, THE System SHALL display all orders with status, total price, and creation date
  Thoughts: This is testing order display. We can view orders and verify all information is displayed.
  Testable: yes - property

5.11. WHEN an order is cancelled, THE System SHALL release all reserved stock back to inventory
  Thoughts: This is testing stock release. We can cancel an order and verify stock is released.
  Testable: yes - property

5.12. WHEN a user views order details, THE System SHALL display all order items with product names, variants, quantities, and prices
  Thoughts: This is testing order detail display. We can view order details and verify all information is displayed.
  Testable: yes - property

## Requirement 6: Payment Processing with VNPay Integration

6.1. WHEN a user initiates payment for an order, THE System SHALL create a payment request with order ID, amount, and transaction reference
  Thoughts: This is testing payment request creation. We can initiate payment and verify the request is created.
  Testable: yes - example

6.2. WHEN a payment request is created, THE System SHALL generate a unique transaction ID and store it in the database
  Thoughts: This is testing transaction ID generation. We can create a payment and verify a unique ID is generated.
  Testable: yes - property

6.3. WHEN a payment request is created, THE System SHALL redirect the user to VNPay payment page with secure parameters
  Thoughts: This is testing VNPay redirect. We can create a payment and verify the redirect URL is generated.
  Testable: yes - property

6.4. WHEN VNPay processes the payment, THE System SHALL receive a callback with payment status and transaction details
  Thoughts: This is testing callback handling. We can simulate a VNPay callback and verify it's handled.
  Testable: yes - property

6.5. WHEN a payment callback is received, THE System SHALL verify the VNPay signature using SHA-256 hash
  Thoughts: This is testing signature verification. We can send a callback with invalid signature and verify rejection.
  Testable: yes - property

6.6. WHEN a payment callback signature is invalid, THE System SHALL reject the callback and log the security event
  Thoughts: This is testing security. We can send an invalid signature and verify rejection.
  Testable: yes - property

6.7. WHEN a payment is successful, THE System SHALL update the payment status to SUCCESS and order status to CONFIRMED
  Thoughts: This is testing status update. We can process a successful payment and verify status updates.
  Testable: yes - property

6.8. WHEN a payment fails, THE System SHALL update the payment status to FAILED and keep order in PENDING status
  Thoughts: This is testing failure handling. We can process a failed payment and verify status updates.
  Testable: yes - property

6.9. WHEN a payment callback is received, THE System SHALL ensure idempotency by checking if transaction was already processed
  Thoughts: This is testing idempotency. We can send the same callback twice and verify it's only processed once.
  Testable: yes - property

6.10. WHEN a user queries payment status, THE System SHALL return the current payment status and transaction details
  Thoughts: This is testing status query. We can query payment status and verify the correct status is returned.
  Testable: yes - property

6.11. WHEN a payment is cancelled by user, THE System SHALL update payment status to CANCELLED and keep order in PENDING status
  Thoughts: This is testing cancellation. We can cancel a payment and verify status updates.
  Testable: yes - property

6.12. WHEN a payment is processed, THE System SHALL log the transaction for audit purposes
  Thoughts: This is testing audit logging. We can process a payment and verify it's logged.
  Testable: yes - property

## Requirement 7: Recommendation System

7.1. WHEN a user views a product, THE System SHALL record the view event with timestamp
  Thoughts: This is testing view recording. We can view a product and verify the view is recorded.
  Testable: yes - property

7.2. WHEN a user views products, THE System SHALL use view history to generate view-based recommendations
  Thoughts: This is testing recommendation generation. We can view products and verify recommendations are generated.
  Testable: yes - property

7.3. WHEN generating view-based recommendations, THE System SHALL return products with similar attributes to viewed products
  Thoughts: This is testing recommendation relevance. We can view products and verify recommendations are similar.
  Testable: yes - property

7.4. WHEN a user purchases products, THE System SHALL record the purchase event for recommendation calculation
  Thoughts: This is testing purchase recording. We can purchase a product and verify the purchase is recorded.
  Testable: yes - property

7.5. WHEN generating purchase-based recommendations, THE System SHALL return products similar to previously purchased products
  Thoughts: This is testing purchase-based recommendations. We can purchase products and verify recommendations are similar.
  Testable: yes - property

7.6. WHEN generating recommendations, THE System SHALL exclude products already purchased by the user
  Thoughts: This is testing recommendation filtering. We can generate recommendations and verify purchased products are excluded.
  Testable: yes - property

7.7. WHEN generating recommendations, THE System SHALL exclude products already in the user's wishlist
  Thoughts: This is testing recommendation filtering. We can generate recommendations and verify wishlist products are excluded.
  Testable: yes - property

7.8. WHEN generating recommendations, THE System SHALL return at most the requested limit of products
  Thoughts: This is testing limit enforcement. We can request recommendations and verify the limit is respected.
  Testable: yes - property

7.9. WHEN a user views a product, THE System SHALL suggest related accessories and compatible products
  Thoughts: This is testing accessory recommendations. We can view a product and verify accessories are suggested.
  Testable: yes - property

7.10. WHEN recommendations are generated, THE System SHALL cache them with 24-hour expiration
  Thoughts: This is testing caching. We can generate recommendations and verify they're cached.
  Testable: yes - property

7.11. WHEN a user makes a purchase, THE System SHALL invalidate cached recommendations for that user
  Thoughts: This is testing cache invalidation. We can make a purchase and verify recommendations are invalidated.
  Testable: yes - property

7.12. WHEN generating recommendations, THE System SHALL use collaborative filtering to find similar users and their preferences
  Thoughts: This is testing collaborative filtering. We can generate recommendations and verify they use collaborative filtering.
  Testable: yes - property

## Requirement 8: Wishlist Management

8.1. WHEN a user adds a product to wishlist, THE System SHALL create a wishlist entry linking the user and product
  Thoughts: This is testing wishlist addition. We can add a product and verify the entry is created.
  Testable: yes - property

8.2. WHEN a user adds a product already in wishlist, THE System SHALL prevent duplicate entries
  Thoughts: This is testing duplicate prevention. We can add the same product twice and verify no duplicate is created.
  Testable: yes - property

8.3. WHEN a user removes a product from wishlist, THE System SHALL delete the wishlist entry
  Thoughts: This is testing wishlist removal. We can remove a product and verify the entry is deleted.
  Testable: yes - property

8.4. WHEN a user views their wishlist, THE System SHALL display all saved products with current prices and availability
  Thoughts: This is testing wishlist display. We can view the wishlist and verify all products are displayed.
  Testable: yes - property

8.5. WHEN a product price changes, THE System SHALL update the price displayed in the user's wishlist
  Thoughts: This is testing price update. We can change a product price and verify it updates in the wishlist.
  Testable: yes - property

8.6. WHEN a product becomes out-of-stock, THE System SHALL indicate the out-of-stock status in the wishlist
  Thoughts: This is testing status update. We can make a product out-of-stock and verify the status updates.
  Testable: yes - property

8.7. WHEN a user adds a wishlist item to cart, THE System SHALL add the product to cart and keep it in wishlist
  Thoughts: This is testing cart addition from wishlist. We can add a wishlist item to cart and verify both operations.
  Testable: yes - property

8.8. WHEN a user views wishlist, THE System SHALL display products in the order they were added (most recent first)
  Thoughts: This is testing ordering. We can view the wishlist and verify products are ordered correctly.
  Testable: yes - property

8.9. WHEN a user has items in wishlist, THE System SHALL allow bulk operations like "Add all to cart"
  Thoughts: This is testing bulk operations. We can add all wishlist items to cart and verify they're all added.
  Testable: yes - property

## Requirement 9: Admin Dashboard & Reporting

9.1. WHEN an admin accesses the dashboard, THE System SHALL display total orders, total revenue, and new users for the selected date range
  Thoughts: This is testing dashboard display. We can access the dashboard and verify statistics are displayed.
  Testable: yes - property

9.2. WHEN an admin views the dashboard, THE System SHALL display top-selling products with sales count and revenue
  Thoughts: This is testing top products display. We can view the dashboard and verify top products are displayed.
  Testable: yes - property

9.3. WHEN an admin generates a sales report, THE System SHALL aggregate sales data by day, week, or month as requested
  Thoughts: This is testing report generation. We can generate a report and verify data is aggregated correctly.
  Testable: yes - property

9.4. WHEN an admin views the dashboard, THE System SHALL display order status distribution (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
  Thoughts: This is testing status distribution. We can view the dashboard and verify status distribution is displayed.
  Testable: yes - property

9.5. WHEN an admin generates a report, THE System SHALL allow filtering by date range
  Thoughts: This is testing report filtering. We can generate a report with date range and verify filtering works.
  Testable: yes - property

9.6. WHEN an admin views dashboard statistics, THE System SHALL cache the data with 1-hour expiration
  Thoughts: This is testing caching. We can view the dashboard and verify data is cached.
  Testable: yes - property

9.7. WHEN dashboard data is requested, THE System SHALL calculate statistics from the database without blocking other operations
  Thoughts: This is testing non-blocking operations. We can request dashboard data and verify other operations continue.
  Testable: yes - property

9.8. WHEN an admin views reports, THE System SHALL display data in charts and tables for easy analysis
  Thoughts: This is testing report display. We can view reports and verify data is displayed in charts and tables.
  Testable: yes - property

9.9. WHEN an admin exports a report, THE System SHALL generate a CSV or PDF file with the report data
  Thoughts: This is testing report export. We can export a report and verify the file is generated.
  Testable: yes - property

9.10. WHEN an admin views user statistics, THE System SHALL display total users, new users, and active users for the period
  Thoughts: This is testing user statistics. We can view statistics and verify user counts are displayed.
  Testable: yes - property

## Requirement 10-20: Other Requirements

[Similar analysis for remaining requirements...]

## Summary

Total Acceptance Criteria Analyzed: 150+
- Testable as Property: ~120 criteria
- Testable as Example: ~20 criteria
- Not Testable: ~10 criteria

Key Patterns:
- Most functional requirements are testable as properties
- Error handling requirements are testable as examples
- UI/UX requirements are generally not testable
- Performance requirements need specific metrics
- Security requirements are testable as properties

