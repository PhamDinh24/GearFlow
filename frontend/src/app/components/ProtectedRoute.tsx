import { Navigate } from "react-router";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isLoggedIn, isAdmin } = useAuth();

  // Chưa đăng nhập -> redirect đến login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Yêu cầu admin nhưng user không phải admin -> redirect về trang chủ
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
