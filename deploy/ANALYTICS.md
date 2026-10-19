# Thống kê BUOGS

## Vận hành

- Mở `/admin` hoặc `/admin/analytics`. Báo cáo được bảo vệ bằng phiên đăng nhập admin.
- Chọn ngày theo giờ Việt Nam; tối đa 90 ngày mỗi báo cáo. So sánh với khoảng liền trước có cùng số ngày. CSV bao gồm tổng quan, dữ liệu ngày, bài nhạc và trang.
- Thống kê chỉ ghi ở production; localhost, phiên admin, prefetch và bot phổ biến được bỏ qua. Không có số liệu trước ngày triển khai.
- Khách là mã trình duyệt ngẫu nhiên (cookie HttpOnly, một năm); phiên hết hạn sau 30 phút không có sự kiện/hoạt động. Không lưu IP, URL query, email hay tên khách. Nguồn truy cập chỉ lưu hostname.
- Nghe: đủ 10 giây phát thực tế, loại bỏ tua/buffer/pause. Một lượt nghe/bài/phiên. Demo FLP và demo music cũng được ghi.
- Tải: file công khai, được phép tải và máy chủ trả 200/206. Một lượt/bài/phiên, không tăng theo HTTP Range; không bảo đảm khách tải xong. Tải trực tiếp URL media ngoài nút tải của website không được thống kê.
- Popup: thẻ hiển thị ít nhất 1 giây, tối đa một lần mỗi đường dẫn trong lần mở website; mở bảng và bấm link được ghi riêng. Bấm link không chứng minh đã tham gia Zalo. Có đường đi trực tiếp từ thẻ/nút thu gọn, nên không coi đây là phễu chuyển đổi bắt buộc ba bước.
- Online: khách có tương tác gần đây, heartbeat mỗi phút khi tab hiển thị và có thao tác trong 5 phút. Mất trạng thái online tạm thời khi restart; các số liệu lịch sử còn nguyên.

## Lưu trữ & sao lưu

Không cần cài database hoặc module native trên Windows Server. Nhật ký JSONL append-only tách theo ngày, ghi bất đồng bộ, tuần tự trong một process. Không ghi lại toàn bộ dữ liệu mỗi lượt truy cập. Phù hợp cấu hình PM2 `instances: 1` hiện tại; nếu mở rộng nhiều instance cần chuyển sang database dùng chung trước.

Mặc định: `storage/analytics/YYYY-MM-DD.jsonl`. Thư mục đã được loại khỏi Git. Có thể đặt biến môi trường `ANALYTICS_DIR` thành đường dẫn tuyệt đối riêng trên VPS. Không đặt vào thư mục public. Tài khoản chạy Node cần quyền tạo/ghi thư mục đó. Dữ liệu không tự xóa; theo dõi dung lượng và sao lưu định kỳ. Nhật ký được đọc theo dòng, báo cáo chỉ đọc khoảng ngày được chọn và kỳ trước.

PowerShell trên VPS, với thư mục mặc định (nên tạm dừng process khi cần bản sao nhất quán tuyệt đối):

```powershell
Set-Location 'C:\apps\BuongWeb'
$analyticsBackup = 'C:\apps\BUOGS-analytics-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
Copy-Item -LiteralPath '.\storage\analytics' -Destination $analyticsBackup -Recurse
```

Đừng `git add -f` thư mục thống kê. Pull/build/restart không xóa thư mục này. Nếu có reverse proxy, giữ nguyên Host/Origin của website để API cùng nguồn hoạt động.

## Kiểm tra trước triển khai

```powershell
node --test scripts/analytics.test.cjs
npx.cmd next build --webpack
```

Sau triển khai, dùng trình duyệt khách chưa đăng nhập admin trên tên miền thật: xem 2 trang, nghe >10 giây, pause/phát tiếp, tải file, mở popup và bấm Zalo. Admin phải hiển thị lượt nghe/tải không nhân đôi. Dev/local không ghi số liệu thật. Sao lưu storage trước khi cập nhật VPS.

Không có cơ chế xác thực một con người duy nhất: đổi thiết bị/xóa cookie được tính khách mới; adblock hoặc chặn cookie có thể làm thiếu/sai lệch số liệu. API có kiểm tra payload, cùng nguồn, lọc bot và giới hạn cơ bản, không thay thế dịch vụ chống gian lận chuyên dụng.
