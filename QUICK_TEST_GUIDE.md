# 🧪 Quick Test Guide - Order Management Fixes

## Prerequisites
- ✅ Backend running on `http://localhost:8080/api`
- ✅ Frontend running on `http://localhost:5173`
- ✅ Database seeded with test data
- ✅ VNPay credentials configured (if testing VNPay)

---

## Test 1: Status Update (Previously 500 Error) ✅
**This was the critical bug fix**

### Steps
1. **Get an existing order ID:**
   ```bash
   GET http://localhost:8080/api/admin/orders
   Copy any order ID from response
   ```

2. **Update status (now should work!):**
   ```bash
   PUT http://localhost:8080/api/admin/orders/{ORDER_ID}/status
   Content-Type: application/json
   
   {
     "status": "CONFIRMED"
   }
   ```

3. **Expected Result:**
   ✅ HTTP 200 OK  
   ✅ Response includes updated order with status "CONFIRMED"  
   ✅ NO more 500 error!

### Using Frontend
1. Navigate to admin panel → Orders
2. Click any order → "Chi Tiết"
3. Click "✓ Đã xác nhận" button
4. Click "Xác Nhận" in popup
5. ✅ Status should update immediately

---

## Test 2: Status Workflow Validation ✅

### Valid Workflow
```
PENDING → [ CONFIRMED or CANCELLED ]
           ↓
        CONFIRMED → [ PROCESSING or CANCELLED ]
                     ↓
                  PROCESSING → [ SHIPPED or CANCELLED ]
                               ↓
                            SHIPPED → DELIVERED
```

### Test Steps

**2a: Valid Transition (should succeed)**
```bash
# Current status: PENDING
PUT /api/admin/orders/{id}/status
{ "status": "CONFIRMED" }
✅ Expect: 200 OK with status CONFIRMED
```

**2b: Invalid Transition (should fail)**
```bash
# Current status: PROCESSING
PUT /api/admin/orders/{id}/status
{ "status": "PENDING" }
❌ Expect: 400 Bad Request with error message
```

**2c: Already Completed (should fail)**
```bash
# Current status: DELIVERED
PUT /api/admin/orders/{id}/status
{ "status": "CANCELLED" }
❌ Expect: 400 Bad Request
Error: "Cannot change status of completed order"
```

### Using Frontend
- Buttons for invalid transitions are automatically **disabled** (grayed out)
- Only valid next statuses show as enabled buttons

---

## Test 3: Stock Management ✅

### Setup
1. Check current stock:
   ```bash
   GET http://localhost:8080/api/admin/stock
   Find a variant with quantity > 5, note the ID and current quantity
   Example: Variant "var-123" has 50 units
   ```

### Test: Order Creates Decrement
1. **Create order with that variant:**
   ```bash
   POST /api/orders
   {
     "items": [
       { "variantId": "var-123", "quantity": 5 }
     ],
     "shippingAddress": "123 Street",
     "shippingPhone": "0123456789"
   }
   ```
   
2. **Check stock after:**
   ```bash
   GET /api/admin/stock/{var-123}
   ✅ Expect: quantity = 50 - 5 = 45
   ```

### Test: Cancellation Restores Stock
1. **Cancel the order just created:**
   ```bash
   POST /api/admin/orders/{ORDER_ID}/cancel
   ```

2. **Check stock after cancellation:**
   ```bash
   GET /api/admin/stock/{var-123}
   ✅ Expect: quantity = 45 + 5 = 50 (restored!)
   ```

### Test: Insufficient Stock Blocked
```bash
# Variant has only 10 left, try to order 15
POST /api/orders
{
  "items": [ { "variantId": "var-123", "quantity": 15 } ],
  ...
}
❌ Expect: 400 Bad Request
Error: "Insufficient stock for variant..."
✅ Verify: Stock NOT decremented (stays at 10)
```

---

## Test 4: Payment - VNPay Flow ✅

### Setup
1. Ensure `vnpay.tmnCode` and `vnpay.hashSecret` are configured in `application.yml`
2. Create an order (PENDING status, no payment yet)

### Steps

**4a: Create Payment**
```bash
POST /api/payments
{
  "orderId": "{ORDER_ID}",
  "paymentMethod": "VNPAY"
}

Response:
{
  "id": "payment-uuid",
  "orderId": "{ORDER_ID}",
  "paymentMethod": "VNPAY",
  "status": "PENDING",
  "amount": 1000000
}
```

**4b: Get VNPay Parameters**
```bash
GET /api/payments/generateVNPayRequest/{PAYMENT_ID}

Response will include:
{
  "vnp_ApiUrl": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  "vnp_Amount": "100000000",  ← Note: amount * 100
  "vnp_TmnCode": "YOUR_TMN_CODE",
  "vnp_SecureHash": "...",
  ...
}

✅ Amount is CORRECTLY multiplied by 100
```

**4c: Simulate VNPay Redirect**
- In real scenario: User clicks "Pay with VNPay"
- This constructs full URL with all params and redirects to VNPay gateway
- User completes payment on VNPay
- VNPay redirects back to `vnpay.returnUrl` with response

**4d: Verify Payment Callback**
```bash
POST /api/payments/verifyVNPayCallback
{
  "vnp_ResponseCode": "00",  ← Success code
  "vnp_TransactionNo": "123456789",
  "vnp_TxnRef": "{ORDER_ID}",
  "vnp_SecureHash": "...",
  ... (other VNPay params)
}

Expected Results:
✅ Payment status changes: PENDING → SUCCESS
✅ Order status changes: PENDING → CONFIRMED
✅ HTTP 200 OK response
```

---

## Test 5: Payment - COD Flow ✅

### Steps
```bash
POST /api/payments
{
  "orderId": "{ORDER_ID}",
  "paymentMethod": "COD"
}

Instant Response:
{
  "id": "payment-uuid",
  "paymentMethod": "COD",
  "status": "SUCCESS",  ← Auto-succeeded!
  ...
}

Result:
✅ Payment marked SUCCESS (no VNPay needed)
✅ Order status auto-changes to CONFIRMED
✅ No further payment processing needed
```

---

## Test 6: Concurrent Orders (Stock Thread Safety) ✅

### Simulate 2 customers ordering from same limited stock

**Setup:** Variant has only 10 units

**Script:**
```bash
# Customer 1: Order 6 units
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer TOKEN_1" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"variantId": "var-123", "quantity": 6}], ...}'

# Customer 2: Order 5 units (racing against Customer 1)
curl -X POST http://localhost:8080/api/orders \
  -H "Authorization: Bearer TOKEN_2" \
  -H "Content-Type: application/json" \
  -d '{"items": [{"variantId": "var-123", "quantity": 5}], ...}'
```

**Expected Result:**
- ✅ Customer 1: Order succeeds, stock becomes 4
- ✅ Customer 2: Order FAILS with "Insufficient stock" error
- ✅ No double-selling or negative stock
- ✅ Stock consistency maintained (thanks to `@Transactional`)

---

## Test 7: Frontend Order Management Panel ✅

### Test 7a: Load Orders
1. Navigate to http://localhost:5173/admin/orders
2. ✅ Should see list of all orders
3. ✅ Stats cards show correct numbers
4. ✅ Search and filter work

### Test 7b: View Order Details
1. Click any order → "Chi Tiết"
2. ✅ Modal opens with full order details
3. ✅ Shows all items in order
4. ✅ Shows correct total amount

### Test 7c: Update Status with UI Validation
1. Order with status PENDING
2. ✅ Buttons visible: "✓ Đã xác nhận", "❌ Đã hủy"
3. ✅ Buttons disabled: "📦 Đang xử lý", "🚚 Đang giao", etc.
4. Click enabled button → Confirmation dialog
5. Confirm → Status updates immediately

### Test 7d: Error Handling
1. Try invalid transition
2. ✅ Error toast appears
3. ✅ Status does NOT change
4. ✅ User can retry

---

## Common Test Queries

### Get All Orders
```bash
GET http://localhost:8080/api/admin/orders
```

### Get All Stock
```bash
GET http://localhost:8080/api/admin/stock
```

### Get Single Order
```bash
GET http://localhost:8080/api/admin/orders/{ORDER_ID}
```

### Check Order with Items
```bash
GET http://localhost:8080/api/admin/orders/{ORDER_ID}

Response includes:
{
  "id": "...",
  "status": "...",
  "items": [
    { "productName": "...", "quantity": N, "price": XXX }
  ]
}
```

---

## Debugging Failed Tests

### Issue: 500 Error on Status Update
✅ **FIXED!** This was the main bug
- Check backend logs for actual error
- Verify `StatusUpdateRequest` has `@Data` annotation

### Issue: Stock Doesn't Decrement
1. Check order creation succeeded (check order ID exists)
2. Check variant ID is correct
3. Check there was enough stock initially

### Issue: VNPay Amount Wrong
- Verify: `vnp_Amount` should be `orderAmount * 100`
- Example: 1,000,000 VND → 100,000,000 in request

### Issue: Status Update Blocked with "Invalid Transition"
1. Check current order status
2. Check if transition is valid (see workflow above)
3. Review error message for details

### Issue: Frontend Buttons All Disabled
1. Check order status in response
2. Check if status is DELIVERED or CANCELLED (completed orders can't change)
3. Refresh page to get latest status

---

## Success Criteria ✅

All tests pass when:
1. ✅ Status updates work (no more 500 errors)
2. ✅ Invalid status transitions are blocked
3. ✅ Stock is decremented on order creation
4. ✅ Stock is restored on order cancellation
5. ✅ Stock never goes negative
6. ✅ Concurrent orders don't cause over-selling
7. ✅ VNPay amount is correctly multiplied by 100
8. ✅ COD auto-confirms payment and order
9. ✅ Frontend UI shows correct validation
10. ✅ Error messages are helpful

---

## Need Help?

Check:
1. Backend running: `http://localhost:8080/api/admin/orders` (should return 200)
2. Frontend running: `http://localhost:5173` (should load)
3. VNPay config in `application.yml` (if testing VNPay)
4. Database has test data (check admin panel)
5. Browser console for frontend errors
6. Backend logs (`target/logs/`) for server errors

✅ All systems ready for testing!
