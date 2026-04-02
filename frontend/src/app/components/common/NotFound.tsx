import { Link } from "react-router";
import { Button } from "../ui/button";

export function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-3xl font-bold mt-4 mb-2">Không tìm thấy trang</h2>
        <p className="text-gray-600 mb-8">
          Xin lỗi, trang bạn đang tìm kiếm không tồn tại.
        </p>
        <Link to="/">
          <Button size="lg">Về trang chủ</Button>
        </Link>
      </div>
    </div>
  );
}
