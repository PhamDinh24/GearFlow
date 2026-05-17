# TÀI LIỆU TỔNG HỢP ÔN TẬP BẢO VỆ ĐỒ ÁN - DỰ ÁN GEARFLOW

Dưới đây là tài liệu chi tiết nhất về kiến trúc, công nghệ, thuật toán và bộ câu hỏi phản biện phục vụ cho buổi bảo vệ đồ án tốt nghiệp của bạn.

---

## I. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
- **Tên dự án:** GearFlow - Hệ thống TMĐT chuyên biệt linh kiện máy tính.
- **Mục tiêu:** Giải quyết bài toán quản lý bán hàng thiết bị công nghệ với quy trình vận hành phức tạp, tập trung vào tính chính xác của tồn kho và minh bạch trong trạng thái đơn hàng.
- **Đối tượng:** Người dùng cá nhân (Khách mua hàng) và Quản trị viên (Admin quản lý kho, đơn hàng, báo cáo).

---

## II. STACK CÔNG NGHỆ (TECHNOLOGIES & FRAMEWORKS)

### 1. Backend: Spring Boot (Java)
- **Spring Security & JWT:** Bảo mật hệ thống, quản lý phiên làm việc không trạng thái (stateless).
- **Spring Data JPA:** Tối ưu hóa truy vấn dữ liệu thông qua mô hình ORM, giúp code sạch và dễ bảo trì.
- **MySQL:** Cơ sở dữ liệu quan hệ mạnh mẽ, đảm bảo tính nhất quán (ACID) cho các giao dịch thanh toán và kho hàng.

### 2. Frontend: React.js & TypeScript
- **Vite:** Công cụ build hiện đại giúp tăng tốc độ phát triển.
- **Tailwind CSS:** Xây dựng giao diện responsive nhanh chóng với thiết kế hiện đại.
- **Recharts:** Thư viện biểu đồ giúp trực quan hóa dữ liệu thống kê cho Admin.
- **Sonner/Lucide:** Nâng cao trải nghiệm người dùng qua thông báo và icon tinh tế.

---

## III. KIẾN TRÚC & LUỒNG HỆ THỐNG (ARCHITECTURE & FLOW)
- **Mô hình:** Client-Server kiến trúc REST API.
- **Luồng dữ liệu mẫu (Đặt hàng):** 
  User (React) -> POST `/api/orders` -> Controller (Spring) -> Service (Logic nghiệp vụ & Kiểm tra kho) -> Repository (MySQL) -> Response (JSON).

---

## IV. THUẬT TOÁN & LOGIC CỐT LÕI (CORE ALGORITHMS)

### 1. Thuật toán Giữ chỗ Tồn kho (Stock Reservation Algorithm)
Đây là "linh hồn" của hệ thống:
- Khi đơn hàng ở trạng thái `PENDING`, hệ thống gọi `reserveStock()`: Tăng số lượng giữ chỗ, giảm số lượng khả dụng nhưng chưa trừ kho vật lý.
- Khi đơn hàng `SHIPPED` hoặc `DELIVERED`, hệ thống gọi `commitStock()`: Chính thức trừ kho vật lý.
- Nếu `CANCELLED`, hệ thống gọi `releaseReservedStock()`: Trả lại số lượng cho kho, đảm bảo không mất mát dữ liệu.

### 2. Máy trạng thái Đơn hàng (Order State Machine)
Hệ thống quản lý 11 trạng thái nghiêm ngặt, ngăn chặn các bước chuyển trạng thái sai logic (ví dụ: không thể hủy đơn khi đã giao hàng thành công).

---

## V. BẢO MẬT (SECURITY)
1. **Mã hóa mật khẩu:** Sử dụng **BCrypt** băm mật khẩu kèm Salt.
2. **JWT Authentication:** Bảo vệ các API nhạy cảm, chỉ cho phép người dùng có Token hợp lệ truy cập.
3. **Phân quyền (RBAC):** Admin và User có các không gian làm việc tách biệt thông qua `@PreAuthorize`.
4. **Phòng chống SQL Injection:** Sử dụng Prepared Statements mặc định của JPA.

---

## VI. BỘ CÂU HỎI PHẢN BIỆN & TRẢ LỜI (Q&A)

### 1. Tại sao bạn chọn MySQL mà không phải MongoDB?
**Trả lời:** Vì dự án TMĐT đòi hỏi tính nhất quán dữ liệu cực cao (Transaction). MySQL hỗ trợ ACID giúp các thao tác như trừ tiền, trừ kho luôn chính xác, không xảy ra tình trạng dữ liệu ảo.

### 2. Làm thế nào hệ thống xử lý khi có hàng nghìn người cùng mua 1 sản phẩm?
**Trả lời:** Em sử dụng cơ chế `@Transactional` trong Spring Boot để đảm bảo tính cô lập của giao dịch. Mỗi thao tác kiểm tra và giữ chỗ kho hàng được thực hiện trong một đơn vị công việc duy nhất, nếu có lỗi hoặc hết hàng, toàn bộ quy trình sẽ được Rollback.

### 3. Giải pháp của bạn để tối ưu SEO cho trang web React là gì?
**Trả lời:** Em sử dụng cấu trúc HTML5 chuẩn (Semantic HTML), tối ưu các thẻ Title, Meta Description và đảm bảo tốc độ tải trang nhanh thông qua việc tối ưu hóa hình ảnh và bundle của Vite.

### 4. Điểm khó nhất bạn đã vượt qua trong dự án này là gì?
**Trả lời:** Đó là việc xây dựng hệ thống trạng thái đơn hàng đầy đủ 11 bước bao gồm cả quy trình trả hàng/hoàn tiền. Việc quản lý logic kho hàng sao cho khớp với từng trạng thái này đòi hỏi sự tính toán kỹ lưỡng về các trường hợp biên (edge cases).

---
*Tài liệu này được biên soạn bởi Antigravity AI để hỗ trợ bảo vệ đồ án tốt nghiệp.*
