# 🎹 GearFlow - Hệ Thống Thương Mại Điện Tử Bàn Phím Cơ

Hệ thống thương mại điện tử chuyên về bàn phím cơ với đầy đủ chức năng quản lý admin và mua sắm cho khách hàng.

## 📋 Tổng Quan

GearFlow là một nền tảng e-commerce hoàn chỉnh cho phép:
- **Khách hàng:** Duyệt sản phẩm, thêm vào giỏ hàng, đặt hàng, đánh giá sản phẩm
- **Admin:** Quản lý sản phẩm, đơn hàng, khách hàng, kho hàng với dashboard thống kê

## 🛠️ Công Nghệ

### Backend
- Java 17 + Spring Boot 3.x
- PostgreSQL (Database)
- Redis (Cache - tùy chọn)
- Spring Security + JWT
- Flyway (Database Migration)
- Maven

### Frontend
- React 18 + TypeScript
- Vite (Build tool)
- React Router (Routing)
- Tailwind CSS (Styling)
- Radix UI (Components)
- Lucide React (Icons)

## 🚀 Khởi Động Nhanh

### Yêu Cầu Hệ Thống

- Java 17+
- Node.js 16+
- PostgreSQL 12+
- Maven 3.6+
- Redis 6+ (tùy chọn)

### 1. Clone Repository

```bash
git clone https://github.com/your-username/gearflow.git
cd gearflow
```

### 2. Chuẩn Bị Database

```sql
CREATE DATABASE gearflow;
```

### 3. Khởi Động Backend

```bash
cd backend

# Sửa lỗi migration nếu cần
mvn flyway:repair

# Chạy backend
mvn spring-boot:run
```

Backend chạy tại: **http://localhost:8080/api**

### 4. Khởi Động Frontend

Mở terminal mới:

```bash
cd frontend

# Cài đặt dependencies
npm install

# Chạy dev server
npm run dev
```

Frontend chạy tại: **http://localhost:5173**

### 5. Đăng Nhập

Truy cập: http://localhost:5173

**Tài khoản Admin:**
- Username: `admin`
- Password: `password123`

**Tài khoản User:**
- Username: `testuser`
- Password: `password123`

## 📁 Cấu Trúc Project

```
gearflow/
├── backend/                 # Spring Boot API
│   ├── src/
│   │   ├── main/java/com/gearflow/
│   │   │   ├── config/     # Cấu hình
│   │   │   ├── controller/ # REST Controllers
│   │   │   ├── dto/        # Data Transfer Objects
│   │   │   ├── entity/     # JPA Entities
│   │   │   ├── repository/ # Repositories
│   │   │   └── service/    # Business Logic
│   │   └── resources/
│   │       ├── db/migration/ # Flyway migrations
│   │       └── application.yml
│   ├── pom.xml
│   └── README.md
│
├── frontend/               # React Application
│   ├── src/
│   │   └── app/
│   │       ├── components/ # React Components
│   │       ├── services/   # API Services
│   │       └── routes.tsx  # Routes
│   ├── package.json
│   └── README.md
│
├── README.md              # File này
├── QUICK_START.md         # Hướng dẫn khởi động nhanh
├── HUONG_DAN_SU_DUNG.md   # Hướng dẫn sử dụng (Tiếng Việt)
├── ADMIN_PAGES_STATUS.md  # Trạng thái dự án
└── TESTING_CHECKLIST.md   # Danh sách kiểm tra
```

## ✨ Tính Năng

### Khách Hàng

- ✅ Xem danh sách sản phẩm với phân trang
- ✅ Tìm kiếm và lọc sản phẩm
- ✅ Xem chi tiết sản phẩm
- ✅ Thêm vào giỏ hàng
- ✅ Quản lý giỏ hàng
- ✅ Đặt hàng
- ✅ Xem lịch sử đơn hàng
- ✅ Đánh giá sản phẩm
- ✅ Danh sách yêu thích (Wishlist)

### Admin

- ✅ **Dashboard** - Thống kê tổng quan (doanh thu, đơn hàng, sản phẩm, người dùng)
- ✅ **Quản lý sản phẩm** - CRUD sản phẩm, tìm kiếm, lọc
- ✅ **Quản lý đơn hàng** - Xem, cập nhật trạng thái đơn hàng
- ✅ **Quản lý khách hàng** - Xem, thay đổi vai trò, xóa người dùng
- ✅ **Quản lý kho hàng** - Xem tồn kho, cập nhật số lượng, cảnh báo sắp hết hàng

## 📊 Dữ Liệu Mẫu

Hệ thống đã có sẵn 5 sản phẩm mẫu:

1. **Keychron K2 V2** - $89.00 (3 biến thể)
2. **Ducky One 2 Mini** - $119.00 (3 biến thể)
3. **Leopold FC660M** - $129.00 (2 biến thể)
4. **Varmilo VA87M** - $149.00 (2 biến thể)
5. **Keychron K8** - $99.00 (2 biến thể)

Tổng cộng: 12 biến thể với dữ liệu tồn kho đầy đủ.

## 🎯 Các Trang Admin

| Trang | URL | Chức Năng |
|-------|-----|-----------|
| Dashboard | `/admin` | Thống kê tổng quan, đơn hàng gần đây, cảnh báo tồn kho |
| Sản Phẩm | `/admin/products` | Thêm, sửa, xóa sản phẩm |
| Đơn Hàng | `/admin/orders` | Xem và cập nhật trạng thái đơn hàng |
| Khách Hàng | `/admin/customers` | Quản lý người dùng, thay đổi vai trò |
| Kho Hàng | `/admin/inventory` | Xem và cập nhật tồn kho |

## 🔐 Authentication & Authorization

### JWT Authentication

- Login → Nhận JWT token
- Token lưu trong localStorage
- Token gửi trong header: `Authorization: Bearer <token>`
- Token expire sau 24 giờ
- Refresh token expire sau 7 ngày

### Role-Based Access Control

- **USER** - Khách hàng thông thường
- **ADMIN** - Quản trị viên (truy cập tất cả admin pages)

## 📡 API Endpoints

### Public (Không cần auth)

```
GET  /api/products              # Danh sách sản phẩm
GET  /api/products/{id}         # Chi tiết sản phẩm
GET  /api/categories            # Danh mục
GET  /api/brands                # Thương hiệu
POST /api/auth/login            # Đăng nhập
POST /api/auth/register         # Đăng ký
```

### User (Cần auth)

```
GET    /api/cart                # Giỏ hàng
POST   /api/orders              # Tạo đơn hàng
GET    /api/orders              # Lịch sử đơn hàng
GET    /api/wishlist            # Danh sách yêu thích
POST   /api/reviews             # Đánh giá sản phẩm
```

### Admin (Cần role ADMIN)

```
GET  /api/admin/dashboard/stats        # Thống kê
GET  /api/admin/products               # Quản lý sản phẩm
GET  /api/admin/orders                 # Quản lý đơn hàng
GET  /api/admin/users                  # Quản lý người dùng
GET  /api/admin/stock                  # Quản lý kho
```

Xem chi tiết: `backend/README.md`

## 🗄️ Database

### PostgreSQL Schema

- **users** - Người dùng
- **products** - Sản phẩm
- **product_variants** - Biến thể (màu, switch, keycap)
- **stock** - Tồn kho
- **categories** - Danh mục
- **brands** - Thương hiệu
- **orders** - Đơn hàng
- **order_items** - Chi tiết đơn hàng
- **carts** - Giỏ hàng
- **cart_items** - Sản phẩm trong giỏ
- **payment** - Thanh toán
- **reviews** - Đánh giá
- **wishlists** - Yêu thích
- **notifications** - Thông báo
- **coupons** - Mã giảm giá

### Migrations

| Version | Mô Tả |
|---------|-------|
| V1 | Initial Schema |
| V2 | Cart Tables |
| V3 | Sample Data (products, variants, stock) |
| V4 | Coupons & Notifications |
| V5 | Payment Table Fix |

## 🐛 Xử Lý Lỗi

### Backend không khởi động

```bash
cd backend
mvn flyway:repair
mvn spring-boot:run
```

### Frontend không kết nối API

- Kiểm tra backend đang chạy trên port 8080
- Kiểm tra CORS trong `backend/src/main/resources/application.yml`

### Database connection error

```sql
-- Tạo database nếu chưa có
CREATE DATABASE gearflow;

-- Kiểm tra user có quyền
GRANT ALL PRIVILEGES ON DATABASE gearflow TO postgres;
```

### Redis connection error

Redis là tùy chọn. Nếu không dùng, comment config trong `application.yml`:

```yaml
# spring:
#   cache:
#     type: redis
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
mvn test
```

### Frontend Tests

```bash
cd frontend
npm run test
```

### Manual Testing

Xem chi tiết: `TESTING_CHECKLIST.md`

## 📚 Tài Liệu

- **QUICK_START.md** - Hướng dẫn khởi động nhanh
- **HUONG_DAN_SU_DUNG.md** - Hướng dẫn sử dụng chi tiết (Tiếng Việt)
- **ADMIN_PAGES_STATUS.md** - Trạng thái và tính năng đã hoàn thành
- **TESTING_CHECKLIST.md** - Danh sách kiểm tra đầy đủ
- **backend/README.md** - Tài liệu Backend API
- **frontend/README.md** - Tài liệu Frontend
- **backend/FLYWAY_REPAIR.md** - Hướng dẫn sửa lỗi Flyway

## 🚀 Production Deployment

### Backend

```bash
cd backend
mvn clean package -DskipTests
java -jar target/gearflow-api-1.0.0.jar
```

### Frontend

```bash
cd frontend
npm run build
# Deploy dist/ folder to hosting
```

### Environment Variables

**Backend:**
```bash
export DB_URL=jdbc:postgresql://your-host:5432/gearflow
export DB_USERNAME=your-username
export DB_PASSWORD=your-password
export JWT_SECRET=your-secret-key
```

**Frontend:**
```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## 🔒 Security

- ✅ Password hashing với BCrypt
- ✅ JWT token authentication
- ✅ Role-based access control
- ✅ CORS protection
- ✅ SQL injection protection
- ✅ XSS protection

## 📈 Performance

- ✅ Redis caching cho dashboard stats
- ✅ Database indexing
- ✅ Connection pooling (HikariCP)
- ✅ Request deduplication (Frontend)
- ✅ Lazy loading components
- ✅ Code splitting (Vite)

## 🎨 UI/UX

- ✅ Responsive design (Desktop, Tablet, Mobile)
- ✅ Accessible components (Radix UI)
- ✅ Loading states
- ✅ Error handling
- ✅ Toast notifications
- ✅ Smooth animations

## 🔄 Workflow

### Khách Hàng

1. Đăng ký/Đăng nhập
2. Duyệt sản phẩm
3. Thêm vào giỏ hàng
4. Checkout
5. Theo dõi đơn hàng
6. Đánh giá sản phẩm

### Admin

1. Đăng nhập với tài khoản admin
2. Xem dashboard thống kê
3. Quản lý sản phẩm (thêm/sửa/xóa)
4. Xử lý đơn hàng (cập nhật trạng thái)
5. Quản lý khách hàng
6. Cập nhật tồn kho

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Changelog

### Version 1.0.0 (2026-03-31)

- ✅ Initial release
- ✅ Complete admin pages
- ✅ Product management
- ✅ Order management
- ✅ Customer management
- ✅ Inventory management
- ✅ Dashboard with statistics
- ✅ Authentication & Authorization
- ✅ Sample data with 5 products

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

GearFlow Development Team

## 🙏 Acknowledgments

- Spring Boot Team
- React Team
- Tailwind CSS Team
- Radix UI Team
- PostgreSQL Team

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra tài liệu trong thư mục docs
2. Xem logs:
   - Backend: `backend/logs/gearflow.log`
   - Frontend: Browser console (F12)
3. Kiểm tra `TESTING_CHECKLIST.md`
4. Tạo issue trên GitHub

## 🎯 Roadmap

### Phase 2 (Coming Soon)

- [ ] Payment integration (VNPay, MoMo)
- [ ] Email notifications
- [ ] Advanced analytics charts
- [ ] Product recommendations
- [ ] Order tracking
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile app (React Native)

### Phase 3 (Future)

- [ ] AI-powered product recommendations
- [ ] Live chat support
- [ ] Social media integration
- [ ] Loyalty program
- [ ] Gift cards
- [ ] Subscription service

---

**Made with ❤️ by GearFlow Team**

**Happy Coding! 🎹⌨️**
