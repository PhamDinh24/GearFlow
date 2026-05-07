import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Eye, EyeOff, Keyboard, AlertCircle, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  const strength = passwordStrength(formData.password);
  const strengthLabels = ['', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'];
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (!agreeTerms) {
      setError("Vui lòng đồng ý với điều khoản sử dụng");
      return;
    }

    setLoading(true);
    
    try {
      const result = await register({
        username: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      setLoading(false);

      if (result.success) {
        toast.success("Đăng ký thành công! Chào mừng bạn đến với GearFlow 🎉");
        navigate("/");
      } else {
        setError(result.error || "Đăng ký thất bại");
      }
    } catch (error) {
      setLoading(false);
      setError("Đăng ký thất bại");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1765299856473-abaac2f1aa70?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080)` }}
        />
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Keyboard className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-2xl font-bold tracking-tight">GearFlow</span>
          </Link>

          <div className="space-y-6">
            <h2 className="text-5xl font-bold text-white leading-tight">
              Tham gia<br />
              cộng đồng!
            </h2>
            <div className="space-y-4">
              {[
                "Lưu sản phẩm yêu thích",
                "Theo dõi đơn hàng realtime",
                "Nhận ưu đãi thành viên độc quyền",
                "Đánh giá sản phẩm đã mua",
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-emerald-400/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-slate-500 text-sm">© 2026 GearFlow. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <Link to="/" className="flex items-center space-x-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Keyboard className="w-6 h-6 text-white" />
            </div>
            <span className="text-slate-900 text-2xl font-bold">GearFlow</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Tạo tài khoản</h1>
            <p className="text-slate-500">Điền thông tin để tạo tài khoản mới</p>
          </div>

          {error && (
            <div className="mb-5 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-slate-700 font-medium mb-1.5 block">Họ và tên</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nguyễn Văn A"
                className="h-12 rounded-xl border-slate-200 focus:border-indigo-500"
              />
            </div>

            <div>
              <Label htmlFor="reg-email" className="text-slate-700 font-medium mb-1.5 block">Email</Label>
              <Input
                id="reg-email"
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@example.com"
                className="h-12 rounded-xl border-slate-200 focus:border-indigo-500"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-slate-700 font-medium mb-1.5 block">Số điện thoại</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0901 234 567"
                className="h-12 rounded-xl border-slate-200 focus:border-indigo-500"
              />
            </div>

            <div>
              <Label htmlFor="reg-password" className="text-slate-700 font-medium mb-1.5 block">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Ít nhất 6 ký tự"
                  className="h-12 rounded-xl border-slate-200 pr-12 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-slate-200'}`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">Độ mạnh: <span className="font-medium">{strengthLabels[strength]}</span></p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirm-password" className="text-slate-700 font-medium mb-1.5 block">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showConfirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Nhập lại mật khẩu"
                  className={`h-12 rounded-xl pr-12 focus:border-indigo-500 ${
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'border-red-300 focus:border-red-400'
                      : 'border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-3 pt-1">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={v => setAgreeTerms(!!v)}
                className="mt-0.5"
              />
              <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer leading-relaxed">
                Tôi đồng ý với{" "}
                <span className="text-indigo-600 hover:underline font-medium">Điều khoản dịch vụ</span>{" "}
                và{" "}
                <span className="text-indigo-600 hover:underline font-medium">Chính sách bảo mật</span>{" "}
                của GearFlow
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-base font-semibold mt-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang tạo tài khoản...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Tạo tài khoản
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-slate-500">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
