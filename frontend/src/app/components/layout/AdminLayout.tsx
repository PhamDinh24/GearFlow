import { Outlet, Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Header } from "../admin/Header";

export function AdminLayout() {
  const { isLoggedIn, isAdmin } = useAuth();

  // Redirect if not logged in or not admin
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
