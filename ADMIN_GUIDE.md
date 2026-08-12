# BUOGS Portfolio Admin & Operation Guide

## 1. Đăng Nhập Hệ Thống CMS
- Đường dẫn đăng nhập: `/admin/login`
- Đăng nhập mặc định theo cấu hình `.env`:
  - Username: `admin`
  - Password mặc định: `buogs@2026!`

## 2. Quản Lý Nội Dung CMS
- **Music (`/admin/music`)**: Đăng bài nhạc MP3 mới, thiết lập ảnh Cover, chọn `publishDate`, gán Music Tags, bật/tắt `Featured` hiển thị ở trang chủ.
- **FLP Projects (`/admin/projects`)**: Quản lý FL Studio Projects, tải demo MP3, bộ sưu tập ảnh (Gallery), thông tin BPM, giá niêm yết và hướng dẫn chi tiết bằng Markdown.
- **Courses (`/admin/courses`)**: Cập nhật thông tin các khóa học DJ/Producer 1-on-1, học phí và lộ trình đào tạo.
- **Equipment (`/admin/equipment`)**: Catalog thiết bị DJ/Producer, tình trạng, phụ kiện đi kèm và phân loại theo danh mục.
- **Site Settings (`/admin/settings`)**: Cấu hình tên thương hiệu, tiểu sử, hotline và link Zalo, Facebook Messenger.

## 3. Sao Lưu & Phục Hồi (Backup & Restore)
- Sao lưu tự động dữ liệu JSON và tập tin media:
  ```bash
  chmod +x ./scripts/backup.sh
  ./scripts/backup.sh
  ```
- Phục hồi dữ liệu từ bản nén:
  ```bash
  chmod +x ./scripts/restore.sh
  ./scripts/restore.sh ./backups/20260812_080000.tar.gz
  ```
