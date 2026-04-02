# GearFlow Frontend

Frontend application for GearFlow mechanical keyboard e-commerce system.

## 🛠️ Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Radix UI** - Accessible components
- **Lucide React** - Icons

## 📋 System Requirements

- Node.js 16+ or higher
- npm 8+ or yarn

## 🚀 Installation and Setup

### 1. Install Dependencies

```bash
npm install
```

Or with yarn:

```bash
yarn install
```

### 2. Environment Configuration

Create `.env` file (if needed):

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

Default API URL is `http://localhost:8080/api`

### 3. Start Development Server

```bash
npm run dev
```

Or:

```bash
yarn dev
```

Application runs at: **http://localhost:5173**

### 4. Build Production

```bash
npm run build
```

Build output: `dist/`

### 5. Preview Production Build

```bash
npm run preview
```

## 📁 Project Structure

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

- **Home** - Homepage
- **Products** - Product list
- **ProductDetail** - Product details
- **Cart** - Shopping cart
- **Checkout** - Checkout
- **Login** - Login
- **Register** - Register

### Admin Pages

- **AdminLayout** - Layout wrapper with auth protection
- **AdminDashboard** - Dashboard with statistics
- **AdminProducts** - Product management (CRUD)
- **AdminOrders** - Order management
- **AdminCustomers** - Customer management
- **AdminInventory** - Inventory management
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

1. User enters username/password
2. Call API `/api/auth/login`
3. Receive JWT token
4. Save token to localStorage
5. Redirect to home or admin

### Protected Routes

Admin routes are protected by `AdminLayout`:

```tsx
<Route path="/admin" element={<AdminLayout />}>
  <Route index element={<AdminDashboard />} />
  <Route path="products" element={<AdminProducts />} />
  <Route path="orders" element={<AdminOrders />} />
  <Route path="customers" element={<AdminCustomers />} />
  <Route path="inventory" element={<AdminInventory />} />
</Route>
```

Non-admin users are redirected to homepage.

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

API service automatically handles:
- Token expired (401) → Logout and redirect
- Network errors → Fallback data
- Request deduplication → Avoid duplicate calls
- Response cloning → Avoid "body stream already read"

## 🎨 Styling

### Tailwind CSS

Use Tailwind utility classes:

```tsx
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h1 className="text-2xl font-bold">Title</h1>
  <Button className="bg-blue-500 hover:bg-blue-600">Click</Button>
</div>
```

### Custom Styles

Global styles in `src/index.css`:

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

### Run Tests (if available)

```bash
npm run test
```

### Manual Testing

1. Start backend: `cd backend && mvn spring-boot:run`
2. Start frontend: `npm run dev`
3. Login with admin/password123
4. Test admin features

See details: `../docs/TESTING_GUIDE.md`

## 🐛 Troubleshooting

### Error: API connection refused

- Check backend is running on port 8080
- Check CORS in backend `application.yml`

### Error: React warnings

Fixed:
- ✅ Uncontrolled input warnings
- ✅ Missing Dialog description
- ✅ forwardRef issues

### Error: Build warnings

- Chunk size warning is normal
- Can increase limit in `vite.config.ts`:

```ts
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000
  }
})
```

## 📱 Responsive Design

Application is responsive for:
- Desktop (1920px+)
- Laptop (1024px - 1919px)
- Tablet (768px - 1023px)
- Mobile (< 768px)

Test responsive:
1. F12 → Toggle device toolbar
2. Select device preset
3. Test navigation and forms

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

Upload `dist/` folder to:
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

## 📚 Documentation

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
- [React Router](https://reactrouter.com/)

## 📄 License

MIT License
