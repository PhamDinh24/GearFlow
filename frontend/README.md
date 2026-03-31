# GearFlow Frontend

Frontend application cho hệ thống thương mại điện tử bàn phím cơ GearFlow.

## 🛠️ Công Nghệ Sử Dụng

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Lucide React** - Icons

## 📋 Yêu Cầu Hệ Thống

- Node.js 16+ hoặc cao hơn
- npm 8+ hoặc yarn

## 🚀 Cài Đặt và Chạy

### 1. Cài Đặt Dependencies

```bash
npm install
```

Hoặc với yarn:

```bash
yarn install
```

### 2. Cấu Hình Environment

Tạo file `.env` (nếu cần):

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Mặc định, API URL là `http://localhost:8080/api`

### 3. Khởi Động Development Server

```bash
npm run dev
```

Hoặc:

```bash
yarn dev
```

Application sẽ chạy tại: **http://localhost:5173**

### 4. Build Production

```bash
npm run build
```

Build output: `dist/`

### 5. Preview Production Build

```bash
npm run preview
```

## 📁 Cấu Trúc Thư Mục

```
frontend/
├── public/              # Static assets
├── src/
│   ├── app/
│   │   ├── components/  # React components
│   │   │   ├── ui/     # Reusable UI components
│   │   │   ├── Admin*.tsx  # Admin pages
│   │   │   └── *.tsx   # Other components
│   │   ├── services/   # API services
│   │   │   └── api.ts  # API client
│   │   ├── routes.tsx  # Route configuration
│   │   └── App.tsx     # Main app component
│   ├── index.css       # Global styles
│   └── main.tsx        # Entry point
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🎨 Components

### Public Pages

- **Home** - Trang chủ
- **Products** - Danh sách sản phẩm
- **ProductDetail** - Chi tiết sản phẩm
- **Cart** - Giỏ hàng
- **Checkout** - Thanh toán
- **Login** - Đăng nhập
- **Register** - Đăng ký

### Admin Pages

- **AdminLayout** - Layout wrapper với auth protection
- **AdminDashboard** - Dashboard với thống kê
- **AdminProducts** - Quản lý sản phẩm (CRUD)
- **AdminOrders** - Quản lý đơn hàng
- **AdminCustomers** - Quản lý khách hàng
- **AdminInventory** - Quản lý kho hàng
- **AdminNav** - Sidebar navigation

### UI Components (Radix UI)

- Button
- Card
- Dialog
- Input
- Label
- Select
- Table
- Toast

## 🔐 Authentication

### Login Flow

1. User nhập username/password
2. Call API `/api/auth/login`
3. Nhận JWT token
4. Lưu token vào localStorage
5. Redirect đến trang chủ hoặc admin

### Protected Routes

Admin routes được bảo vệ bởi `AdminLayout`:

```tsx
<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<AdminDashboard />} />
  <Route path="products" element={<AdminProducts />} />
  <Route path="orders" element={<AdminOrders />} />
  <Route path="customers" element={<AdminCustomers />} />
  <Route path="inventory" element={<AdminInventory />} />
</Route>
```

Nếu user không phải admin, sẽ bị redirect về trang chủ.

## 📡 API Integration

### API Service

File: `src/app/services/api.ts`

```typescript
import { apiService } from '../services/api';

// Public endpoints
const products = await apiService.getProducts();
const product = await apiService.getProductById(id);

// Auth endpoints
const response = await apiService.login({ username, password });
const user = await apiService.register({ username, password });

// Admin endpoints (requires auth)
const stats = await apiService.getAnalytics();
await apiService.createProduct(data);
await apiService.updateOrderStatus(orderId, status);
```

### Error Handling

API service tự động xử lý:
- Token expired (401) → Logout và redirect
- Network errors → Fallback data
- Request deduplication → Tránh duplicate calls
- Response cloning → Tránh "body stream already read"

## 🎨 Styling

### Tailwind CSS

Sử dụng Tailwind utility classes:

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold">Title</h1>
  <Button className="bg-blue-500 hover:bg-blue-600">Click</Button>
</div>
```

### Custom Styles

Global styles trong `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    /* ... */
  }
}
```

## 🧪 Testing

### Run Tests (nếu có)

```bash
npm run test
```

### Manual Testing

1. Start backend: `cd backend && mvn spring-boot:run`
2. Start frontend: `npm run dev`
3. Login với admin/password123
4. Test các chức năng admin

Xem chi tiết: `../TESTING_CHECKLIST.md`

## 🐛 Xử Lý Lỗi

### Lỗi: API connection refused

- Kiểm tra backend đang chạy trên port 8080
- Kiểm tra CORS trong backend `application.yml`

### Lỗi: React warnings

Đã fix:
- ✅ Uncontrolled input warnings
- ✅ Missing Dialog description
- ✅ forwardRef issues

### Lỗi: Build warnings

- Chunk size warning là bình thường
- Có thể tăng limit trong `vite.config.ts`:

```ts
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000
  }
})
```

## 📱 Responsive Design

Application responsive cho:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (< 768px)

Test responsive:
1. F12 → Toggle device toolbar
2. Chọn device preset
3. Test navigation và forms

## 🚀 Production Deployment

### Build

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Deploy to Static Hosting

Upload `dist/` folder đến:
- AWS S3 + CloudFront
- Firebase Hosting
- GitHub Pages
- Nginx/Apache

### Environment Variables

Production `.env`:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## 🔧 Configuration

### Vite Config

File: `vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true
      }
    }
  }
})
```

### TypeScript Config

File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "strict": true
  }
}
```

## 📦 Dependencies

### Main Dependencies

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router": "^6.x",
  "lucide-react": "^0.x"
}
```

### Dev Dependencies

```json
{
  "typescript": "^5.x",
  "vite": "^5.x",
  "tailwindcss": "^3.x",
  "@types/react": "^18.x"
}
```

## 🎯 Features

### Implemented

✅ User authentication (login/register)
✅ Product browsing with search & filters
✅ Shopping cart
✅ Wishlist
✅ Order management
✅ Admin dashboard
✅ Product management (CRUD)
✅ Order management
✅ Customer management
✅ Inventory management
✅ Responsive design

### Todo

- [ ] Payment integration (VNPay)
- [ ] Email notifications
- [ ] Product reviews
- [ ] Advanced search
- [ ] Order tracking
- [ ] Analytics charts

## 📚 Tài Liệu Tham Khảo

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Router](https://reactrouter.com/)

## 🤝 Contributing

1. Fork the project
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

MIT License

## 👥 Team

GearFlow Development Team

## 📞 Support

Xem thêm:
- `../HUONG_DAN_SU_DUNG.md` - Hướng dẫn sử dụng
- `../TESTING_CHECKLIST.md` - Danh sách kiểm tra
- `../ADMIN_PAGES_STATUS.md` - Trạng thái dự án
  