import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeOff, Keyboard, AlertCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    setLoading(true);
    setError("");
    
    try {
      const result = await login(usernameOrEmail, password);
      setLoading(false);
      
      if (result.success) {
        toast.success("Đăng nhập thành công!");
        
        // Check if user is admin and redirect accordingly
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          const isAdmin = userData.role?.toUpperCase() === 'ADMIN' || userData.role?.toLowerCase() === 'admin';
          console.log('Login redirect check - role:', userData.role, 'isAdmin:', isAdmin);
          
          if (isAdmin) {
            navigate("/admin");
          } else {
            navigate("/");
          }
        } else {
          navigate("/");
        }
      } else {
        setError(result.error || "Đăng nhập thất bại");
      }
    } catch (error) {
      setLoading(false);
      setError("Đăng nhập thất bại");
    }
  };

  const fillDemo = (type: 'user' | 'admin') => {
    if (type === 'user') {
      setUsernameOrEmail("sampleuser1");
      setPassword("password");
    } else {
      setUsernameOrEmail("sampleadmin1");
      setPassword("password");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1762681290775-82b1a54f3225?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080)` }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Keyboard className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">GearFlow</span>
          </Link>

          <div className="space-y-6">
            <div>
              <h2 className="text-5xl font-bold text-white leading-tight mb-4">
                Chào mừng<br />
                trở lại!
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Đăng nhập để tiếp tục trải nghiệm mua sắm bàn phím cơ cao cấp cùng hàng nghìn khách hàng hài lòng.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "50+", label: "Sản phẩm" },
                { value: "1K+", label: "Khách hàng" },
                { value: "4.8★", label: "Đánh giá" },
              ].map(stat => (
                <div key={stat.label} className="bg-white/10 backdrop-blur rounded-2xl p-4 text-center">
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-slate-300 text-sm mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-500 text-sm">© 2026 GearFlow. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link to="/" className="flex items-center space-x-3 mb-10 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Keyboard className="w-6 h-6 text-white" />
            </div>
            <span className="text-slate-900 text-2xl font-bold">GearFlow</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Đăng nhập</h1>
            <p className="text-slate-500">Nhập thông tin tài khoản để tiếp tục</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="usernameOrEmail" className="text-slate-700 font-medium mb-2 block">Email hoặc Tên đăng nhập</Label>
              <Input
                id="usernameOrEmail"
                type="text"
                value={usernameOrEmail}
                onChange={e => setUsernameOrEmail(e.target.value)}
                placeholder="email@gearflow.vn hoặc username"
                className="h-12 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-200"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="password" className="text-slate-700 font-medium">Mật khẩu</Label>
                <Link to="/forgot-password" size="sm" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="h-12 rounded-xl border-slate-200 pr-12 focus:border-indigo-500 focus:ring-indigo-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="remember"
                checked={remember}
                onCheckedChange={v => setRemember(!!v)}
              />
              <label htmlFor="remember" className="text-sm text-slate-600 cursor-pointer">
                Ghi nhớ đăng nhập
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-base font-semibold transition-all"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang đăng nhập...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Đăng nhập
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-slate-500">Chưa có tài khoản? </span>
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
