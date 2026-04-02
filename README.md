# 🎹 GearFlow - Mechanical Keyboard E-Commerce Platform

A complete e-commerce system specialized in mechanical keyboards with full admin management and customer shopping features.

## 📋 Overview

GearFlow is a complete e-commerce platform that enables:
- **Customers:** Browse products, add to cart, place orders, review products
- **Admins:** Manage products, orders, customers, inventory with analytics dashboard

## 🛠️ Technology Stack

### Backend
- Java 17 + Spring Boot 3.x
- PostgreSQL (Database)
- Redis (Cache - optional)
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

## 🚀 Quick Start

### System Requirements

- Java 17+
- Node.js 16+
- PostgreSQL 12+
- Maven 3.6+
- Redis 6+ (optional)

### 1. Clone Repository

```bash
git clone https://github.com/your-username/gearflow.git
cd gearflow
```

### 2. Setup Database

```sql
CREATE DATABASE gearflow;
```

### 3. Reset Database (First Time Setup)

**Windows:**
```bash
cd backend
reset-database.bat
```

**Linux/Mac:**
```bash
cd backend
chmod +x reset-database.sh
./reset-database.sh
```

### 4. Start Backend

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

Backend runs at: **http://localhost:8080/api**

### 5. Start Frontend

Open new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend runs at: **http://localhost:5173**

### 6. Login

Access: http://localhost:5173

**Admin Account:**
- Username: `admin`
- Password: `password123`

**User Account:**
- Username: `testuser`
- Password: `password123`

## 📁 Project Structure

```
gearflow/
├── backend/                    # Spring Boot API
│   ├── src/
│   │   ├── main/java/com/gearflow/
│   │   │   ├── config/        # Configuration
│   │   │   ├── controller/    # REST Controllers
│   │   │   ├── dto/           # Data Transfer Objects
│   │   │   ├── entity/        # JPA Entities
│   │   │   ├── repository/    # Repositories
│   │   │   └── service/       # Business Logic
│   │   └── resources/
│   │       ├── db/migration/  # Flyway migrations
│   │       │   └── V1__Complete_Schema.sql  # Single consolidated migration
│   │       └── application.yml
│   ├── test-complete.bat      # Windows API test script
│   ├── test-complete.sh       # Linux/Mac API test script
│   ├── reset-database.bat     # Windows DB reset script
│   ├── reset-database.sh      # Linux/Mac DB reset script
│   ├── pom.xml
│   └── README.md
│
├── frontend/                  # React Application
│   ├── src/
│   │   └── app/
│   │       ├── components/    # React Components
│   │       ├── services/      # API Services
│   │       ├── context/       # Context providers
│   │       └── routes.tsx     # Routes
│   ├── package.json
│   └── README.md
│
├── docs/                      # Documentation
│   ├── PROJECT_STATUS.md      # Project status
│   ├── QUICK_START.md         # Quick start guide
│   ├── TESTING_GUIDE.md       # Testing guide
│   ├── BACKEND_REFACTOR.md    # Backend refactoring details
│   └── FLYWAY_MIGRATION.md    # Migration guide
│
└── README.md                  # This file
```

## ✨ Features

### Customer Features

- ✅ Browse products with pagination
- ✅ Search and filter products
- ✅ View product details
- ✅ Add to cart
- ✅ Manage shopping cart
- ✅ Place orders
- ✅ View order history
- ✅ Review products
- ✅ Wishlist management

### Admin Features

- ✅ **Dashboard** - Overview statistics (revenue, orders, products, users)
- ✅ **Product Management** - CRUD operations, search, filter
- ✅ **Order Management** - View, update order status
- ✅ **Customer Management** - View, change roles, delete users
- ✅ **Inventory Management** - View stock, update quantities, low stock alerts

## 📊 Sample Data

The system includes 5 sample products:

1. **Keychron K2 V2** - $89.00 (3 variants)
2. **Ducky One 2 Mini** - $119.00 (3 variants)
3. **Leopold FC660M** - $129.00 (2 variants)
4. **Varmilo VA87M** - $149.00 (2 variants)
5. **Keychron K8** - $99.00 (2 variants)

Total: 12 variants with complete stock data.

## 🎯 Admin Pages

| Page | URL | Features |
|------|-----|----------|
| Dashboard | `/admin` | Overview stats, recent orders, stock alerts |
| Products | `/admin/products` | Add, edit, delete products |
| Orders | `/admin/orders` | View and update order status |
| Customers | `/admin/customers` | Manage users, change roles |
| Inventory | `/admin/inventory` | View and update stock levels |

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

**15 Tables with Complete Relationships:**

- **users** - User accounts with roles
- **categories** - Product categories
- **brands** - Product brands
- **products** - Main product information
- **product_variants** - Product variants (color, switch, keycap, connection)
- **product_attributes** - Product specifications
- **stock** - Inventory management
- **carts** - Shopping carts
- **cart_items** - Cart items
- **orders** - Customer orders
- **order_items** - Order details
- **payment** - Payment transactions
- **reviews** - Product reviews
- **wishlists** - User wishlists
- **notifications** - System notifications
- **coupons** - Discount coupons
- **product_views** - Product view tracking

### Database Migration

**✨ NEW: Single Consolidated Migration**

All database schema, indexes, and sample data are now in one file:
- `V1__Complete_Schema.sql` - Complete database setup

**Benefits:**
- ✅ No more migration conflicts
- ✅ Clean migration history
- ✅ Easier to understand
- ✅ Includes sample data
- ✅ Comprehensive indexes
- ✅ Proper constraints

**Sample Data Included:**
- 2 users (admin, testuser)
- 3 categories
- 4 brands
- 5 products with VND pricing
- 12 product variants
- Stock data for all variants
- Product attributes
- 2 sample coupons

## 🐛 Troubleshooting

### Backend won't start

**Solution 1: Reset Database**
```bash
cd backend
# Windows
reset-database.bat

# Linux/Mac
chmod +x reset-database.sh
./reset-database.sh
```

**Solution 2: Clean Build**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend can't connect to API

- ✅ Check backend is running on port 8080
- ✅ Check CORS in `backend/src/main/resources/application.yml`
- ✅ Check `VITE_API_BASE_URL` in frontend `.env`

### Database connection error

```sql
-- Create database if not exists
CREATE DATABASE gearflow;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE gearflow TO postgres;
```

### Flyway migration issues

```bash
cd backend
# Clean all migrations and start fresh
mvn flyway:clean
mvn flyway:migrate
```

### Stock update not working

- ✅ Make sure you're logged in as admin
- ✅ Check variant ID is correct (not product ID)
- ✅ Check backend logs for errors

### Wishlist not working

- ✅ Make sure you're logged in
- ✅ Use product ID (not variant ID)
- ✅ Check backend logs for errors

### Redis connection error

Redis is optional. If not using, comment config in `application.yml`:

```yaml
# spring:
#   cache:
#     type: redis
```

## 🧪 Testing

### Automated API Testing

**Windows:**
```bash
cd backend
test-complete.bat
```

**Linux/Mac:**
```bash
cd backend
chmod +x test-complete.sh
./test-complete.sh
```

**Tests Include:**
- ✅ Health check
- ✅ Admin login
- ✅ User login
- ✅ Get products
- ✅ Get product details
- ✅ Get categories
- ✅ Get brands
- ✅ Add to wishlist
- ✅ Get wishlist
- ✅ Update stock

### Backend Unit Tests

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

Xem chi tiết: `docs/TESTING_GUIDE.md`

## 📚 Documentation

- **docs/QUICK_START.md** - Quick start guide
- **docs/PROJECT_STATUS.md** - Project status and completed features
- **docs/TESTING_GUIDE.md** - Complete testing checklist
- **docs/BACKEND_REFACTOR.md** - ✨ Backend refactoring & clean code improvements
- **docs/FLYWAY_MIGRATION.md** - Flyway migration guide
- **backend/README.md** - Backend API documentation
- **frontend/README.md** - Frontend documentation

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

## 🔄 Customer Workflow

1. Register/Login
2. Browse products
3. Add to cart
4. Checkout
5. Track orders
6. Review products

### Admin Workflow

1. Login with admin account
2. View dashboard statistics
3. Manage products (add/edit/delete)
4. Process orders (update status)
5. Manage customers
6. Update inventory

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Changelog

### Version 1.1.0 (2026-04-01) - Backend Refactor

**🎉 Major Backend Improvements:**
- ✅ Consolidated all migrations into single file
- ✅ Improved service layer with better error handling
- ✅ Added comprehensive logging to all controllers
- ✅ Fixed stock update functionality
- ✅ Fixed wishlist functionality
- ✅ Added database reset scripts
- ✅ Added automated API test scripts
- ✅ Clean code refactoring
- ✅ Better exception handling
- ✅ Comprehensive documentation

**Database:**
- ✅ Single migration file with all schema
- ✅ Proper constraints and indexes
- ✅ Sample data included
- ✅ VND pricing format

**Testing:**
- ✅ Automated test scripts (Windows & Linux)
- ✅ Database reset scripts
- ✅ Complete API testing

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

If you encounter issues:

1. Check documentation in docs folder
2. View logs:
   - Backend: `backend/logs/gearflow.log`
   - Frontend: Browser console (F12)
3. Check `docs/TESTING_GUIDE.md`
4. Create an issue on GitHub

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
