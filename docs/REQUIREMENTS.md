### 2.2.2 Các yêu cầu chức năng

Yêu cầu chức năng là những tính năng mà hệ thống cung cấp cho người dùng, được chia theo vai trò (Customer và Admin).

**Dành cho Khách hàng (Customer)**
*   **Quản lý tài khoản:**
    *   Đăng ký tài khoản mới.
    *   Đăng nhập hệ thống.
*   **Mua sắm & Tìm kiếm:**
    *   Duyệt và xem danh sách sản phẩm (hỗ trợ phân trang).
    *   Tìm kiếm và lọc sản phẩm (theo danh mục, thương hiệu, mức giá...).
    *   Xem chi tiết sản phẩm (bao gồm các biến thể màu sắc, loại switch, keycap, kết nối).
*   **Giỏ hàng & Đặt hàng:**
    *   Thêm sản phẩm (hoặc biến thể cụ thể) vào giỏ hàng.
    *   Quản lý giỏ hàng (cập nhật số lượng, xóa sản phẩm).
    *   Tiến hành đặt hàng (Checkout).
*   **Quản lý cá nhân:**
    *   Xem lịch sử các đơn hàng đã đặt và theo dõi trạng thái đơn hàng.
    *   Đánh giá / Review các sản phẩm đã mua.
    *   Duyệt và cập nhật danh sách sản phẩm yêu thích (Wishlist).

**Dành cho Quản trị viên (Admin)**
*   **Bảng điều khiển (Dashboard):** 
    *   Xem thống kê tổng quan của hệ thống (doanh thu, số lượng đơn hàng, số lượng sản phẩm, người dùng mới).
    *   Xem cảnh báo khi kho hàng sắp hết.
*   **Quản lý Sản phẩm (Product Management):**
    *   Thực hiện thêm, sửa, xóa thông tin sản phẩm và các thuộc tính/biến thể của sản phẩm.
    *   Tìm kiếm và lọc sản phẩm trong trang quản trị.
*   **Quản lý Đơn hàng (Order Management):**
    *   Xem danh sách tất cả các đơn hàng.
    *   Cập nhật trạng thái đơn hàng trong quá trình xử lý (ví dụ: Chờ xử lý, Đang giao, Đã hoàn thành, v.v.).
*   **Quản lý Khách hàng (Customer Management):**
    *   Xem danh sách tất cả người dùng.
    *   Thay đổi quyền của người dùng (ví dụ: thăng cấp quyền Admin).
    *   Xóa tài khoản người dùng ra khỏi hệ thống.
*   **Quản lý Kho (Inventory Management):**
    *   Kiểm tra số lượng tồn kho theo từng biến thể sản phẩm.
    *   Cập nhật nhanh lượng hàng trong kho.

### 2.2.3 Các yêu cầu phi chức năng

Yêu cầu phi chức năng quy định về chất lượng, hiệu năng, bảo mật và các tiêu chuẩn kỹ thuật mà hệ thống phải đáp ứng.

**Bảo mật (Security)**
*   **Authentication & Authorization:** Xác thực bảo mật bằng JWT token (có tích hợp làm mới token, tự động hết hạn tính theo 24h). Phân quyền người dùng dựa trên vai trò bằng hai tài khoản chính (USER, ADMIN).
*   **Mã hóa:** Mật khẩu của người dùng bắt buộc phải được mã hoá băm (hashing) bảo mật sử dụng thuật toán BCrypt.
*   **Chống tấn công bảo mật:** Hệ thống đảm bảo có kỹ thuật đề phòng các cuộc tấn công SQL Injection, XSS và được cấu hình quy định rõ về bảo vệ CORS.

**Hiệu suất (Performance)**
*   **Tốc độ xử lý CSDL:** Tất cả các bảng CSDL phải đánh chỉ mục (Database Indexing) để tối ưu hoá tốc độ truy vấn. Backend phải triển khai Connection Pooling qua thư viện HikariCP để quản lý kết nối hiệu quả.
*   **Caching bộ nhớ đệm:** Ứng dụng Redis caching cho các API liên quan đến dashboard stats (Thông số thống kê trên Dashboard quản trị) để giảm tải cho database.
*   **Hiệu suất Frontend:** Tối ưu hóa frontend thông qua kỹ thuật Lazy loading components và Code Splitting với công cụ Vite. Hệ thống frontend phải thực hiện loại bỏ trùng lặp request (Request deduplication).

**Giao diện và Trải nghiệm người dùng (UI/UX)**
*   **Trải nghiệm đa nền tảng:** Hệ thống Frontend có thiết kế thích ứng (Responsive design) hỗ trợ trải nghiệm mượt mà trên nhiều kích thước màn hình (Desktop, Tablet, Mobile).
*   **Tiêu chuẩn truy cập:** Các giao diện phải hỗ trợ người dùng và thành phần có thể tiếp cận chuẩn (Accessible components) với sự trợ giúp từ bộ thư viện Radix UI.
*   **Cơ chế phản hồi cho người dùng:** 
    *   Quản lý triệt để trạng thái Loading (Loading states) và trạng thái Lỗi (Error handling). 
    *   Thông báo liên tục thành công/thất bại thông qua hộp thoại thông báo (Toast notifications).
    *   Hỗ trợ trải nghiệm đồ họa mềm mại (Smooth animations).

**Thiết lập Hệ thống thông tin Cốt lõi**
*   **Technology Stack Frontend:** React 18, TypeScript, Tailwind CSS, Vite.
*   **Technology Stack Backend:** Java 17+, Framework Spring Boot 3.x sử dụng Maven quản trị. Cần tích hợp Spring Security để phục vụ mục tiêu Authentication bên trên.
*   **Quản lý Database CSDL:** Hệ quản trị CSDL quan hệ PostgreSQL và cần sử dụng Flyway để thiết lập kịch bản làm CSDL chuẩn.
*   **Chuẩn cấu trúc API:** Giao tiếp giữa frontend và backend qua REST API Standards.
