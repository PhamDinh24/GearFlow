import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Lock, ShieldCheck, ArrowLeft, KeyRound, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router";

export function ChangePassword() {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Mật khẩu mới không khớp');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    // Simulate password change
    toast.success('Đổi mật khẩu thành công');
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Banner */}
      <section className="bg-slate-950 text-white py-14 relative overflow-hidden mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/profile" className="text-slate-400 hover:text-white flex items-center gap-2 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại hồ sơ</span>
          </Link>
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20">
               <Lock className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">ĐỔI MẬT KHẨU</h1>
              <p className="text-slate-400 font-medium">Bảo mật tài khoản GearFlow của bạn.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <Card className="border-none rounded-[3rem] shadow-2xl shadow-slate-200 bg-white overflow-hidden">
          <CardHeader className="bg-slate-50 border-b border-slate-100 p-10 flex flex-row items-center gap-4">
             <KeyRound className="w-8 h-8 text-blue-600" />
             <CardTitle className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Thông tin mật khẩu</CardTitle>
          </CardHeader>
          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Mật khẩu hiện tại *</Label>
                <Input
                  type="password"
                  required
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                  className="rounded-xl h-14 border-slate-100 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Mật khẩu mới *</Label>
                  <Input
                    type="password"
                    required
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="••••••••"
                    className="rounded-xl h-14 border-slate-100 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Xác nhận mật khẩu *</Label>
                  <Input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="rounded-xl h-14 border-slate-100 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-blue-600 mt-1 shrink-0" />
                <div className="space-y-1">
                  <h4 className="font-bold text-blue-900 text-sm">Tiêu chuẩn bảo mật</h4>
                  <ul className="text-xs text-blue-700/70 space-y-1">
                    <li>• Sử dụng tối thiểu 6 ký tự.</li>
                    <li>• Bao gồm ít nhất một chữ viết hoa và một chữ số.</li>
                    <li>• Không sử dụng các mật khẩu cũ hoặc thông tin dễ đoán.</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-[2] h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">
                  Cập nhật mật khẩu
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                   onClick={() => setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                  className="flex-1 h-16 rounded-2xl font-bold border-2 border-slate-100"
                >
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-12 p-6 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-4">
           <AlertCircle className="w-5 h-5 text-amber-500" />
           <p className="text-xs text-amber-700 font-medium">Lưu ý: Sau khi đổi mật khẩu thành công, bạn có thể được yêu cầu đăng nhập lại trên các thiết bị khác.</p>
        </div>
      </div>
    </div>
  );
}
