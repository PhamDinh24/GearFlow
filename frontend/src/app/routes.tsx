import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { Shop } from "./components/Shop";
import { ProductDetail } from "./components/ProductDetail";
import { Cart } from "./components/Cart";
import { Checkout } from "./components/Checkout";
import { PaymentResult } from "./components/PaymentResult";
import { UserProfile } from "./components/UserProfile";
import { OrderHistory } from "./components/OrderHistory";
import { Wishlist } from "./components/Wishlist";
import { ChangePassword } from "./components/ChangePassword";
import { AdminLayout } from "./components/AdminLayout";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminProducts } from "./components/AdminProducts";
import { AdminInventory } from "./components/AdminInventory";
import { AdminOrders } from "./components/AdminOrders";
import { AdminCustomers } from "./components/AdminCustomers";
import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { NotFound } from "./components/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "login", Component: Login },
      { path: "register", Component: Register },
      { path: "shop", Component: Shop },
      { path: "product/:id", Component: ProductDetail },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "payment-result", Component: PaymentResult },
      { path: "profile", Component: UserProfile },
      { path: "orders", Component: OrderHistory },
      { path: "wishlist", Component: Wishlist },
      { path: "change-password", Component: ChangePassword },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/admin",
    Component: AdminLayout,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "products", Component: AdminProducts },
      { path: "inventory", Component: AdminInventory },
      { path: "orders", Component: AdminOrders },
      { path: "customers", Component: AdminCustomers },
    ],
  },
]);