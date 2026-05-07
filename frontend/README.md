# GearFlow Frontend

Modern e-commerce frontend for mechanical keyboards built with React, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Vite 6.3** - Build tool
- **Tailwind CSS 4.1** - Styling
- **React Router 7.13** - Routing
- **Radix UI** - Accessible components
- **Lucide React** - Icons
- **Recharts** - Charts for admin
- **Embla Carousel** - Product carousels
- **Motion** - Animations
- **Sonner** - Toast notifications

## 📁 Project Structure

```
frontend/src/
├── app/
│   ├── components/
│   │   ├── layout/          # Layout components (Header, Footer)
│   │   ├── ui/              # shadcn/ui components
│   │   ├── figma/           # Figma-specific components
│   │   ├── Home.tsx         # Home page
│   │   ├── Shop.tsx         # Product listing
│   │   ├── ProductDetail.tsx
│   │   ├── Cart.tsx
│   │   ├── Checkout.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── UserProfile.tsx
│   │   ├── OrderHistory.tsx
│   │   ├── Wishlist.tsx
│   │   ├── ChangePassword.tsx
│   │   ├── PaymentResult.tsx
│   │   ├── Admin*.tsx       # Admin pages
│   │   └── NotFound.tsx
│   ├── context/
│   │   └── AuthContext.tsx  # Authentication context
│   ├── data/
│   │   └── mockData.ts      # Mock data for development
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API services
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── App.tsx
│   └── routes.tsx
├── lib/
│   └── utils.ts             # Utility functions
├── styles/
│   ├── index.css            # Main styles
│   ├── tailwind.css         # Tailwind directives
│   ├── theme.css            # Theme variables
│   └── fonts.css            # Font imports
└── main.tsx                 # Entry point
```

## 🎨 Design System

### Colors
- **Primary**: Indigo (600-700)
- **Secondary**: Purple (600-700)
- **Accent**: Pink (600-700)
- **Neutral**: Slate (50-900)

### Typography
- **Font Family**: System font stack
- **Headings**: Bold, tracking-tight
- **Body**: Regular, leading-relaxed

### Spacing
- **Border Radius**: 
  - Small: 8px (rounded-lg)
  - Medium: 12px (rounded-xl)
  - Large: 16px (rounded-2xl)
- **Shadows**: Subtle, layered

## 🛠️ Development

### Prerequisites
- Node.js 18+
- npm or pnpm
- **Backend API running on `http://localhost:8080/api`**

### Installation
```bash
cd frontend
npm install
```

### Environment Configuration
Create a `.env` file in the frontend root:
```env
VITE_API_BASE_URL=http://localhost:8080/api
```

### Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📱 Features

### User Features
- ✅ Browse products with filters
- ✅ Search with autocomplete
- ✅ Product detail with variants
- ✅ Shopping cart management
- ✅ Checkout process
- ✅ User authentication (JWT)
- ✅ User profile management
- ✅ Order history
- ✅ Wishlist
- ✅ Product reviews
- ✅ Payment integration (VNPay)

### Admin Features
- ✅ Dashboard with statistics
- ✅ Product management (CRUD)
- ✅ Inventory management
- ✅ Order management
- ✅ Customer management
- ✅ Category management
- ✅ Brand management
- ✅ Review management
- ✅ Reports and analytics

## 🔐 Authentication

The app uses JWT-based authentication with:
- Access token (24h expiry)
- Refresh token (7 days expiry)
- Secure HTTP-only cookies
- Role-based access control (USER, ADMIN)

## 🎯 API Integration

### Service Layer
All API calls go through the service layer in `src/app/services/`:

- **`api.ts`** - Axios instance with JWT interceptors
- **`authService.ts`** - Login, register, logout
- **`productService.ts`** - Product listing, search, filtering
- **`cartService.ts`** - Shopping cart management
- **`orderService.ts`** - Order creation and tracking
- **`wishlistService.ts`** - Wishlist management
- **`reviewService.ts`** - Product reviews
- **`shippingAddressService.ts`** - Delivery addresses

### API Configuration
- **Development**: `http://localhost:8080/api`
- **Production**: Configured via `VITE_API_BASE_URL` environment variable

### Authentication Flow
1. User logs in via `/login`
2. Backend returns `accessToken` and `refreshToken`
3. Tokens stored in localStorage
4. `accessToken` sent in `Authorization: Bearer {token}` header
5. On 401 error, auto-refresh using `refreshToken`
6. If refresh fails, redirect to login

### Axios Interceptors
- **Request**: Automatically adds JWT token to headers
- **Response**: Handles token refresh on 401 errors

## 📦 Components

### UI Components (shadcn/ui)
All UI components are based on Radix UI and styled with Tailwind CSS:
- Accordion, Alert Dialog, Avatar
- Badge, Button, Card
- Checkbox, Dialog, Dropdown Menu
- Form, Input, Label
- Select, Separator, Sheet
- Table, Tabs, Toast
- And more...

### Layout Components
- **Root**: Main layout with header, footer, and navigation
- **AdminNav**: Admin sidebar navigation

### Page Components
Each page is a standalone component with its own logic and styling.

## 🌐 Routing

Routes are defined in `src/app/routes.tsx` using React Router v7:
- `/` - Home
- `/shop` - Product listing
- `/product/:id` - Product detail
- `/cart` - Shopping cart
- `/checkout` - Checkout
- `/login` - Login
- `/register` - Register
- `/profile` - User profile
- `/orders` - Order history
- `/wishlist` - Wishlist
- `/admin/*` - Admin pages

## 🎨 Styling

### Tailwind CSS
The project uses Tailwind CSS v4 with custom configuration:
- Custom color palette
- Custom spacing scale
- Custom typography
- Dark mode support (future)

### CSS Variables
Theme variables are defined in `styles/theme.css`:
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 239 84% 67%;
  --secondary: 280 87% 65%;
  /* ... */
}
```

## 📱 Responsive Design

The app is fully responsive with breakpoints:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## ♿ Accessibility

- Semantic HTML
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support

## 🚀 Performance

- Code splitting with React.lazy
- Image optimization
- Lazy loading
- Memoization
- Virtual scrolling (for large lists)

## 🧪 Testing

```bash
# Run tests (to be implemented)
npm test
```

## 📝 License

Copyright © 2026 GearFlow. All rights reserved.

## 👥 Team

Developed by the GearFlow team.

## 📞 Support

For support, email support@gearflow.vn or visit our website.
