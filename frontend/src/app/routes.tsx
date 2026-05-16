import { createBrowserRouter } from "react-router";
import { Root } from "./components/layout/Root";
import { AdminLayout } from "./components/layout/AdminLayout";
import { Home } from "./components/Home";
import { Shop } from "./components/Shop";
import { ProductDetail } from "./components/ProductDetail";
import { Cart } from "./components/Cart";
import { Checkout } from "./components/Checkout";
import { PaymentResult } from "./components/PaymentResult";
import { UserProfile } from "./components/UserProfile";
import { OrderHistory } from "./components/user/OrderHistory";
import { OrderDetail } from "./components/user/OrderDetail";
import { Wishlist } from "./components/Wishlist";
import { ChangePassword } from "./components/ChangePassword";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { ShippingAddresses } from "./components/user/ShippingAddresses";
import { Dashboard as AdminDashboard } from "./components/admin/DashboardNew";
import { Products as AdminProducts } from "./components/admin/Products";
import { Categories as AdminCategories } from "./components/admin/Categories";
import { Orders as AdminOrders } from "./components/admin/Orders";
import { Brands as AdminBrands } from "./components/admin/Brands";
import { Customers as AdminCustomers } from "./components/admin/Customers";
import { Reviews as AdminReviews } from "./components/admin/Reviews";
import { Payments as AdminPayments } from "./components/admin/Payments";
import { ImportExport as AdminImportExport } from "./components/admin/ImportExport";
import { NotFound } from "./components/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      // Public routes - không cần đăng nhập
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { index: true, Component: Home },
      { path: "shop", Component: Shop },
      { path: "product/:id", Component: ProductDetail },
      
      // Protected routes - cần đăng nhập
      { 
        path: "cart", 
        element: <ProtectedRoute><Cart /></ProtectedRoute> 
      },
      { 
        path: "checkout", 
        element: <ProtectedRoute><Checkout /></ProtectedRoute> 
      },
      { 
        path: "payment-result", 
        element: <ProtectedRoute><PaymentResult /></ProtectedRoute> 
      },
      { 
        path: "orders", 
        element: <ProtectedRoute><OrderHistory /></ProtectedRoute> 
      },
      { 
        path: "orders/:id", 
        element: <ProtectedRoute><OrderDetail /></ProtectedRoute> 
      },
      { 
        path: "wishlist", 
        element: <ProtectedRoute><Wishlist /></ProtectedRoute> 
      },
      { 
        path: "profile", 
        element: <ProtectedRoute><UserProfile /></ProtectedRoute> 
      },
      { 
        path: "addresses", 
        element: <ProtectedRoute><ShippingAddresses /></ProtectedRoute> 
      },
      { 
        path: "change-password", 
        element: <ProtectedRoute><ChangePassword /></ProtectedRoute> 
      },
      
      // 404
      { path: "*", Component: NotFound },
    ],
  },
  // Admin routes - completely separate layout
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "products", Component: AdminProducts },
      { path: "categories", Component: AdminCategories },
      { path: "orders", Component: AdminOrders },
      { path: "customers", Component: AdminCustomers },
      { path: "brands", Component: AdminBrands },
      { path: "payments", Component: AdminPayments },
      { path: "reviews", Component: AdminReviews },
      { path: "import-export", Component: AdminImportExport },
    ],
  },
]);
