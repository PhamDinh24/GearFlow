import uuid
import datetime
import random

# Helper functions
def dq(s): return f"'{s}'"

def generate_inserts():
    now = "CURRENT_TIMESTAMP"
    sql = []
    sql.append("\n-- ============================================================================")
    sql.append("-- ADDITIONAL SAMPLE DATA (10+ records per table)")
    sql.append("-- ============================================================================")
    
    # Realistic names
    vietnamese_names = [
        "Nguyễn Văn An", "Trần Thị Bích", "Lê Hoàng Tuấn", "Phạm Minh Tâm", "Hoàng Ngọc Ánh",
        "Vũ Đức Trí", "Đặng Thùy Dương", "Bùi Xuân Phát", "Đỗ Hải yến", "Ngô Thành Đạt"
    ]
    addresses = [
        "Số 1, Lê Duẩn, Quận 1, TP. HCM", "123 Cầu Giấy, Hà Nội", "45A Nguyễn Văn Cừ, Long Biên",
        "89 Trần Phú, Hải Châu, Đà Nẵng", "102 Lê Lợi, TP. Vinh", "56 Nguyễn Huệ, Quận 1, TP. HCM",
        "22 Quang Trung, Gò Vấp", "18/3 Hùng Vương, Cần Thơ", "99 Lê Lai, Ninh Kiều", "88 Phạm Văn Đồng, Hà Nội"
    ]
    cities = ["TP. HCM", "Hà Nội", "Hà Nội", "Đà Nẵng", "Nghệ An", "TP. HCM", "TP. HCM", "Cần Thơ", "Cần Thơ", "Hà Nội"]
    districts = ["Quận 1", "Cầu Giấy", "Long Biên", "Hải Châu", "TP. Vinh", "Quận 1", "Gò Vấp", "Hùng Vương", "Ninh Kiều", "Bắc Từ Liêm"]
    wards = ["Bến Nghé", "Dịch Vọng", "Gia Thụy", "Thạch Thang", "Lê Lợi", "Bến Nghé", "Phường 10", "An Lạc", "An Cư", "Cổ Nhuế"]
    phones = ["0901234567", "0987654321", "0912345678", "0934567890", "0976543210", "0898123456", "0888999777", "0868111222", "0945678123", "0909888777"]
    
    # 1. users
    sql.append("\n-- 1. Users")
    sql.append("INSERT INTO users (user_id, user_name, password, phone, address, role, created_at, updated_at) VALUES")
    user_values = []
    user_ids = []
    for i in range(10):
        uid = f"user-{uuid.uuid4().hex[:8]}"
        user_ids.append(uid)
        uname = f"customer{i+1}"
        pwd = "'$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'" # 123456
        phone = dq(phones[i])
        addr = dq(addresses[i])
        role = "'USER'"
        user_values.append(f"({dq(uid)}, {dq(uname)}, {pwd}, {phone}, {addr}, {role}, {now}, {now})")
    sql.append(",\n".join(user_values) + "\nON CONFLICT (user_name) DO NOTHING;")

    # 2. jwt_tokens
    sql.append("\n-- 2. JWT Tokens")
    sql.append("INSERT INTO jwt_tokens (token_id, user_id, token, token_type, status, expires_at, created_at) VALUES")
    jwt_values = []
    for i in range(1, 11):
        tid = str(uuid.uuid4())
        uid = user_ids[i-1]
        token = f"'token_{uuid.uuid4().hex}'"
        jwt_values.append(f"('{tid}', {dq(uid)}, {token}, 'Bearer', 'ACTIVE', {now} + INTERVAL '7 days', {now})")
    sql.append(",\n".join(jwt_values) + ";")

    # 3. shipping_addresses
    sql.append("\n-- 3. Shipping Addresses")
    sql.append("INSERT INTO shipping_addresses (id, user_id, full_name, phone, email, address, ward, district, city, postal_code, is_default, created_at, updated_at) VALUES")
    addr_values = []
    for i in range(10):
        aid = f"addr-{uuid.uuid4().hex[:8]}"
        uid = user_ids[i]
        fname = dq(vietnamese_names[i])
        phone = dq(phones[i])
        email = dq(f"user{i+1}@gmail.com")
        addr = dq(addresses[i])
        ward = dq(wards[i])
        district = dq(districts[i])
        city = dq(cities[i])
        zipc = f"'70000{i}'"
        addr_values.append(f"({dq(aid)}, {dq(uid)}, {fname}, {phone}, {email}, {addr}, {ward}, {district}, {city}, {zipc}, TRUE, {now}, {now})")
    sql.append(",\n".join(addr_values) + ";")

    # 4. attribute_definitions
    sql.append("\n-- 4. Attribute Definitions")
    sql.append("INSERT INTO attribute_definitions (attr_def_id, attr_name, attr_display_name, attr_type, attr_unit, is_filterable, is_variant_attribute, display_order) VALUES")
    ad_new = [
        ('keycap_profile', 'Keycap Profile', 'SELECT'),
        ('case_material', 'Chất liệu Case', 'SELECT'),
        ('plate_material', 'Chất liệu Plate', 'SELECT'),
        ('stabilizer', 'Stabilizer', 'TEXT'),
        ('warranty', 'Bảo hành', 'TEXT'),
        ('package_contents', 'Phụ kiện đi kèm', 'TEXT'),
        ('mounting_style', 'Kiểu Mounting', 'SELECT'),
        ('hotswap_type', 'Loại Hotswap', 'SELECT'),
        ('led_type', 'Loại LED', 'TEXT'),
        ('system_compat', 'Tương thích HĐH', 'TEXT')
    ]
    attr_def_values = []
    attr_def_ids = []
    for i, (name, dname, atype) in enumerate(ad_new):
        adid = f"attr-def-{100+i}"
        attr_def_ids.append(adid)
        attr_def_values.append(f"({dq(adid)}, {dq(name)}, {dq(dname)}, {dq(atype)}, NULL, TRUE, FALSE, {15+i})")
    sql.append(",\n".join(attr_def_values) + "\nON CONFLICT (attr_def_id) DO NOTHING;")

    # Categories existing: 'cat-001' to 'cat-010'
    # 5. categories
    sql.append("\n-- 5. Categories")
    sql.append("INSERT INTO categories (categories_id, categories_name, description, created_at) VALUES")
    new_cats = ["Keycap Set", "Switch Pack", "Cable Custom", "Kit Bàn Phím", "Lube & Mod", "Kê tay (Wrist Rest)", "Deskmat", "Dụng cụ bảo dưỡng", "Trục cơ (Artisan)", "Phụ kiện khác"]
    cat_values = []
    cat_ids = []
    for i, cname in enumerate(new_cats):
        cid = f"cat-10{i}"
        cat_ids.append(cid)
        desc = dq(f"Danh mục {cname} cao cấp")
        cat_values.append(f"({dq(cid)}, {dq(cname)}, {desc}, {now})")
    sql.append(",\n".join(cat_values) + "\nON CONFLICT (categories_name) DO NOTHING;")

    # 6. brands
    sql.append("\n-- 6. Brands")
    sql.append("INSERT INTO brands (brands_id, brands_name, description, created_at) VALUES")
    new_brands = ["Gateron", "Cherry", "Kailh", "Outemu", "Krytox", "Kelowna", "Wuque Studio", "KBDfans", "GMK", "JTK"]
    brand_values = []
    brand_ids = []
    for i, bname in enumerate(new_brands):
        bid = f"brand-10{i}"
        brand_ids.append(bid)
        desc = dq(f"Thương hiệu {bname} chính hãng")
        brand_values.append(f"({dq(bid)}, {dq(bname)}, {desc}, {now})")
    sql.append(",\n".join(brand_values) + "\nON CONFLICT (brands_name) DO NOTHING;")

    # 7. products
    sql.append("\n-- 7. Products")
    sql.append("INSERT INTO products (product_id, categories_id, brands_id, product_name, description, base_price, support, image, created_at, updated_at) VALUES")
    
    # Use real categories and brands to match names logically: Keycap -> GMK, Switch -> Gateron, etc.
    products_real = [
        (cat_ids[0], brand_ids[8], "GMK Olivia Keycaps", "Set keycap GMK ABS Double-shot cao cấp màu hồng đen", 3500000.0, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500"),
        (cat_ids[1], brand_ids[0], "Gateron Milky Yellow Pro", "Pack 45 switch Linear quốc dân lube sẵn cực mượt", 250000.0, "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500"),
        (cat_ids[1], brand_ids[1], "Cherry MX Red Hyperglide", "Switch Linear thế hệ mới của Cherry với độ bền 100M", 350000.0, "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500"),
        (cat_ids[4], brand_ids[4], "Krytox 205g0 5g", "Mỡ trơn Krytox lube switch cực mượt", 200000.0, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
        (cat_ids[6], brand_ids[6], "Deskmat Wuque Studio", "Bàn di chuột size lớn chất liệu vải cao cấp", 450000.0, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500"),
        (cat_ids[3], brand_ids[7], "KBD8X MKIII Kit", "Nhôm CNC nguyên khối cực xịn từ KBDfans", 6500000.0, "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500"),
        (cat_ids[0], brand_ids[9], "JTK Zen Keycaps", "Double-shot ABS với tone màu đen trắng cực đẹp", 2200000.0, "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500"),
        (cat_ids[1], brand_ids[2], "Kailh Box White", "Switch Clicky nổi tiếng với thiết kế Click-bar", 280000.0, "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500"),
        (cat_ids[5], brand_ids[7], "Kê tay gỗ óc chó", "Kê tay đánh bóng tự nhiên cho bàn phím 75/TKL", 350000.0, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=500"),
        (cat_ids[7], brand_ids[5], "Switch Puller Kelowna", "Dụng cụ nhổ switch chuẩn thép không gỉ", 80000.0, "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500")
    ]
    prod_values = []
    prod_ids = []
    for i, (cid, bid, pname, desc, price, img) in enumerate(products_real):
        pid = f"prod-10{i}"
        prod_ids.append(pid)
        prod_values.append(f"({dq(pid)}, {dq(cid)}, {dq(bid)}, {dq(pname)}, {dq(desc)}, {price}, 'Tất cả Layout', {dq(img)}, {now}, {now})")
    sql.append(",\n".join(prod_values) + "\nON CONFLICT (product_id) DO NOTHING;")

    # 8. product_attributes
    sql.append("\n-- 8. Product Attributes")
    sql.append("INSERT INTO product_attributes (attr_id, product_id, attr_name, attr_value, attr_def_id, created_at) VALUES")
    patt_values = []
    for i in range(10):
        patid = f"attr-new-{i:03d}"
        pid = prod_ids[i]
        adefid = attr_def_ids[i]
        aname = ad_new[i][0]
        avalue = f"Giá trị chuẩn của {aname}"
        patt_values.append(f"({dq(patid)}, {dq(pid)}, {dq(aname)}, {dq(avalue)}, {dq(adefid)}, {now})")
    sql.append(",\n".join(patt_values) + ";")

    # 9. product_variants
    sql.append("\n-- 9. Product Variants")
    sql.append("INSERT INTO product_variants (pro_variant_id, product_id, switch_type, color, keycap_set, connect_type, price_modifier, created_at) VALUES")
    var_values = []
    var_ids = []
    for i in range(10):
        vid = f"var-10{i}"
        var_ids.append(vid)
        pid = prod_ids[i]
        color = ["Đen", "Trắng", "Hồng", "Mint"]
        var_values.append(f"({dq(vid)}, {dq(pid)}, 'Mặc định', {dq(random.choice(color))}, 'Mặc định', 'Có dây/Không dây', 0.00, {now})")
    sql.append(",\n".join(var_values) + "\nON CONFLICT (pro_variant_id) DO NOTHING;")

    # 10. stock
    sql.append("\n-- 10. Stock")
    sql.append("INSERT INTO stock (pro_variant_id, quantity, reserved, updated_at) VALUES")
    stock_values = []
    for i in range(10):
        vid = var_ids[i]
        stock_values.append(f"({dq(vid)}, {100 + i * 5}, 0, {now})")
    sql.append(",\n".join(stock_values) + "\nON CONFLICT (pro_variant_id) DO NOTHING;")

    # 11. product_views
    sql.append("\n-- 11. Product Views")
    sql.append("INSERT INTO product_views (id, user_id, product_id, viewed_at) VALUES")
    pview_values = []
    for i in range(10):
        pvid = str(uuid.uuid4())
        uid = user_ids[i]
        pid = prod_ids[i]
        pview_values.append(f"('{pvid}', {dq(uid)}, {dq(pid)}, {now})")
    sql.append(",\n".join(pview_values) + ";")

    # 12. carts
    sql.append("\n-- 12. Carts")
    sql.append("INSERT INTO carts (cart_id, user_id, created_at, updated_at) VALUES")
    cart_values = []
    cart_ids = []
    for i in range(10):
        cid = f"cart-{uuid.uuid4().hex[:8]}"
        cart_ids.append(cid)
        uid = user_ids[i]
        cart_values.append(f"({dq(cid)}, {dq(uid)}, {now}, {now})")
    sql.append(",\n".join(cart_values) + "\nON CONFLICT (user_id) DO NOTHING;")

    # 13. cart_items
    sql.append("\n-- 13. Cart Items")
    sql.append("INSERT INTO cart_items (cart_item_id, cart_id, pro_variant_id, quantity, created_at, updated_at) VALUES")
    citem_values = []
    for i in range(10):
        ciid = f"citem-{uuid.uuid4().hex[:8]}"
        cid = cart_ids[i]
        vid = var_ids[i]
        citem_values.append(f"({dq(ciid)}, {dq(cid)}, {dq(vid)}, {random.randint(1, 3)}, {now}, {now})")
    sql.append(",\n".join(citem_values) + ";")

    # Include existing users for some of these real orders, combining new realistic data
    all_eligible_users = user_ids + ['user-test-001', 'user-admin-001']
    # 14. orders
    sql.append("\n-- 14. Orders")
    sql.append("INSERT INTO orders (order_id, user_id, total_amount, order_status, shipping_address, shipping_city, shipping_postal_code, shipping_phone, created_at, updated_at) VALUES")
    order_values = []
    order_ids = []
    # Existing products to mix
    all_products_pool = ["prod-001", "prod-002", "prod-003"] + prod_ids
    all_var_pool = ["var-001", "var-004", "var-007"] + var_ids
    
    statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CONFIRMED"]
    for i in range(15):
        oid = f"order-R{100+i}"
        order_ids.append(oid)
        uid = random.choice(all_eligible_users)
        price = random.randint(3, 30) * 100000.0
        status = random.choice(statuses)
        city = random.choice(cities)
        addr = dq(random.choice(addresses))
        phone = dq(random.choice(phones))
        order_values.append(f"({dq(oid)}, {dq(uid)}, {price}, {dq(status)}, {addr}, {dq(city)}, '100000', {phone}, {now}, {now})")
    sql.append(",\n".join(order_values) + ";")

    # 15. order_items
    sql.append("\n-- 15. Order Items")
    sql.append("INSERT INTO order_items (order_item_id, product_id, order_id, pro_variant_id, quantity, price, created_at) VALUES")
    oitem_values = []
    for i in range(15):
        oiid = f"oitem-R{100+i}"
        oid = order_ids[i]
        pid = all_products_pool[i % len(all_products_pool)]
        vid = all_var_pool[i % len(all_var_pool)]
        oitem_values.append(f"({dq(oiid)}, {dq(pid)}, {dq(oid)}, {dq(vid)}, {random.randint(1, 2)}, {random.randint(5, 35)*100000.0}, {now})")
    sql.append(",\n".join(oitem_values) + ";")

    # 16. payment
    sql.append("\n-- 16. Payment")
    sql.append("INSERT INTO payment (payment_id, order_id, payment_method, payment_status, transaction_id, amount, created_at, updated_at) VALUES")
    pay_values = []
    for i in range(15):
        payid = f"pay-R{100+i}"
        oid = order_ids[i]
        txid = f"'VNPAY{uuid.uuid4().hex[:12].upper()}'"
        status = 'SUCCESS' if i % 4 != 0 else 'PENDING'
        pay_values.append(f"({dq(payid)}, {dq(oid)}, 'VNPAY', {dq(status)}, {txid}, {random.randint(3, 30) * 100000.0}, {now}, {now})")
    sql.append(",\n".join(pay_values) + ";")

    # 17. wishlists
    sql.append("\n-- 17. Wishlists")
    sql.append("INSERT INTO wishlists (wishlist_id, product_id, user_id, created_at) VALUES")
    wl_values = []
    for i in range(10):
        wlid = f"wl-R{100+i}"
        uid = user_ids[i]
        pid = prod_ids[(i*4) % 10]
        wl_values.append(f"({dq(wlid)}, {dq(pid)}, {dq(uid)}, {now})")
    sql.append(",\n".join(wl_values) + "\nON CONFLICT (user_id, product_id) DO NOTHING;")

    # 18. reviews
    sql.append("\n-- 18. Reviews")
    sql.append("INSERT INTO reviews (review_id, user_id, product_id, rating, comment, created_at, updated_at) VALUES")
    rev_values = []
    comments = ["Giao hàng nhanh, đóng gói cẩn thận", "Chất lượng phím rất tốt so với giá thành", "Switches lube sẵn mượt mà", "Màu sắc keycap đẹp, không lệch màu", "Shop tư vấn nhiệt tình"]
    for i in range(10):
        rvid = f"rev-R{100+i}"
        uid = random.choice(all_eligible_users)
        pid = random.choice(all_products_pool)
        comment = dq(random.choice(comments))
        rev_values.append(f"({dq(rvid)}, {dq(uid)}, {dq(pid)}, {random.randint(4, 5)}, {comment}, {now}, {now})")
    sql.append(",\n".join(rev_values) + "\nON CONFLICT (user_id, product_id) DO NOTHING;")

    # 19. coupons
    sql.append("\n-- 19. Coupons")
    sql.append("INSERT INTO coupons (coupon_id, coupon_code, description, discount_amount, discount_percentage, min_order_amount, max_usage_count, current_usage_count, expiry_date, is_active, created_at) VALUES")
    coup_values = []
    for i in range(10):
        cpid = f"coupon-R{100+i}"
        cname = f"'GEARFLOW{10+i}'"
        coup_values.append(f"({dq(cpid)}, {cname}, 'Mã giảm giá Khai trương GearFlow', {50000.0 * (i%3 + 1)}, NULL, 500000.0, 50, 0, {now} + INTERVAL '30 days', TRUE, {now})")
    sql.append(",\n".join(coup_values) + ";")

    # 20. notifications
    sql.append("\n-- 20. Notifications")
    sql.append("INSERT INTO notifications (notification_id, user_id, type, title, message, is_read, created_at) VALUES")
    notif_values = []
    for i in range(10):
        nid = f"notif-R{100+i}"
        uid = random.choice(all_eligible_users)
        notif_values.append(f"({dq(nid)}, {dq(uid)}, 'PROMOTION', 'Khuyến mãi đặc biệt!', 'Tặng ngay 50k khi mua đơn hàng từ 500k', FALSE, {now})")
    sql.append(",\n".join(notif_values) + ";")

    # Read original file, remove old mock block, append new
    import os
    filepath = 'd:/Git/Project/GearFlow/backend/src/main/resources/db/migration/V1__Initial_Schema.sql'
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    marker = "-- ADDITIONAL SAMPLE DATA"
    if marker in content:
        # Split and keep the part before the marker block start
        content = content.split("-- " + "="*76 + "\n" + marker)[0]

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n' + '\n'.join(sql))

if __name__ == '__main__':
    generate_inserts()
    print('Generated successfully')
