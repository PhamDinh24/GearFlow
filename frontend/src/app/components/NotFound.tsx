import { Link } from "react-router";
import { Button } from "./ui/button";
import { Home, Search } from "lucide-react";

export function NotFound() {
  return (
    <div className="bg-slate-50 min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl">
        <div className="mb-8">
          <h1 className="text-[180px] font-bold bg-gradient-to-br from-slate-200 to-slate-300 bg-clip-text text-transparent leading-none">
            404
          </h1>
        </div>
        <h2 className="text-4xl font-bold text-slate-900 mb-4">Không tìm thấy trang</h2>
        <p className="text-lg text-slate-600 mb-10">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/">
            <Button size="lg" className="bg-slate-900 hover:bg-slate-800 rounded-xl h-14 px-8">
              <Home className="w-5 h-5 mr-2" />
              Về trang chủ
            </Button>
          </Link>
          <Link to="/shop">
            <Button size="lg" variant="outline" className="rounded-xl h-14 px-8 border-2">
              <Search className="w-5 h-5 mr-2" />
              Khám phá sản phẩm
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
