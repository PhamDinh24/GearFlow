import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { Shop } from "./components/Shop";
import { ProductDetail } from "./components/ProductDetail";
import { Cart } from "./components/Cart";
import { Checkout } from "./components/Checkout";
import { PaymentResult } from "./components/PaymentResult";

// User components
import { Profile } from "./components/user/Profile";
import { OrderHistory } from "./components/user/OrderHistory";
import { OrderDetail } from "./components/user/OrderDetail";
import { Wishlist } from "./components/user/Wishlist";
import { ChangePassword } from "./components/user/ChangePassword";
import { ShippingAddresses } from "./components/user/ShippingAddresses";

// Admin components
import { Dashboard } from "./components/admin/Dashboard";
import { Products } from "./components/admin/Products";
import { Brands } from "./components/admin/Brands";
import { Categories } from "./components/admin/Categories";
import { Orders } from "./components/admin/Orders";
import { Customers } from "./components/admin/Customers";
import { ImportExport } from "./components/admin/ImportExport";
import { Reviews } from "./components/admin/Reviews";
import { Header } from "./components/admin/Header";

// Common components
import { Login } from "./components/common/Login";
import { Register } from "./components/common/Register";
import { NotFound } from "./components/common/NotFound";

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
      { path: "profile", Component: Profile },
      { path: "orders", Component: OrderHistory },
      { path: "orders/:orderId", Component: OrderDetail },
      { path: "wishlist", Component: Wishlist },
      { path: "addresses", Component: ShippingAddresses },
      { path: "change-password", Component: ChangePassword },
      { path: "*", Component: NotFound },
    ],
  },
  {
    path: "/admin",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "products", Component: Products },
      { path: "brands", Component: Brands },
      { path: "categories", Component: Categories },
      { path: "orders", Component: Orders },
      { path: "customers", Component: Customers },
      { path: "reviews", Component: Reviews },
      { path: "import-export", Component: ImportExport },
    ],
  },
]);
