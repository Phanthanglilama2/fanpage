# Chatbot tuyển sinh lái xe cho Fanpage

Bộ này là chatbot Messenger Webhook cho Fanpage: tự động chào hỏi, phân loại nhu cầu, tư vấn hạng bằng, báo học phí/hồ sơ, xin số điện thoại và lưu danh sách đăng ký để nhân viên gọi lại.

## Luồng tư vấn

1. Người học nhắn tin Fanpage.
2. Chatbot hỏi nhu cầu: ô tô hạng B, mô tô A1, tải/dịch vụ hoặc nâng hạng.
3. Chatbot tư vấn lợi ích theo nhu cầu.
4. Chatbot báo học phí hoặc hồ sơ khi khách hỏi.
5. Chatbot xin số điện thoại.
6. Khi có số điện thoại, hệ thống lưu lead vào `data/leads.json` và `data/leads.csv`.
7. Nhân viên gọi lại, xác nhận lịch học và cập nhật trạng thái trong file lead hoặc CRM riêng.

## Chạy thử local

Yêu cầu Node.js 20 trở lên.

```powershell
Copy-Item .env.example .env
npm.cmd start
```

Nếu PowerShell không chặn `npm.ps1`, bạn có thể dùng `npm start` như bình thường.

Webhook chạy ở:

```text
http://localhost:3000/webhook
```

Kiểm tra tình trạng server:

```text
http://localhost:3000/health
```

## Cấu hình biến môi trường

Mở file `.env` và điền:

```text
PAGE_ACCESS_TOKEN=token_cua_fanpage
VERIFY_TOKEN=chuoi_ban_tu_dat
GRAPH_API_VERSION=v24.0
APP_SECRET=app_secret_cua_meta
ADMIN_TOKEN=mat_khau_xem_leads
```

`VERIFY_TOKEN` là chuỗi bạn tự đặt, nhưng phải nhập giống hệt khi cấu hình Webhook trong Meta Developers.

## Tích hợp vào Fanpage

1. Tạo ứng dụng trong Meta Developers.
2. Thêm sản phẩm Messenger.
3. Lấy Page Access Token cho Fanpage.
4. Deploy server này lên nơi có HTTPS công khai như Render, Railway, VPS hoặc Cloudflare Tunnel.
5. Trong Meta Developers, cấu hình Webhook:
   - Callback URL: `https://ten-mien-cua-ban/webhook`
   - Verify Token: giống `VERIFY_TOKEN` trong `.env`
   - Subscribe event: `messages`, `messaging_postbacks`
6. Gắn ứng dụng với Fanpage và bật quyền nhắn tin cần thiết.
7. Nhắn thử vào Fanpage bằng tài khoản tester.

Tài liệu Meta nên mở khi cấu hình:

- Messenger Webhooks: https://developers.facebook.com/docs/messenger-platform/webhooks
- Send API: https://developers.facebook.com/docs/messenger-platform/reference/send-api/
- Messenger Platform overview: https://developers.facebook.com/docs/messenger-platform/

## Deploy bằng Render

Project đã có sẵn file `render.yaml`, nên có thể deploy theo Blueprint trên Render.

### Bước 1: Đưa code lên GitHub

Tạo repository GitHub rồi push toàn bộ project này lên. Render sẽ lấy code từ GitHub để build và chạy webhook.

### Bước 2: Tạo Web Service trên Render

Trong Render:

1. Chọn **New**.
2. Chọn **Blueprint** nếu muốn Render đọc `render.yaml`, hoặc chọn **Web Service** và trỏ tới repository.
3. Nếu tạo Web Service thủ công, dùng cấu hình:
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/health`

Render sẽ cấp một domain dạng:

```text
https://ten-service.onrender.com
```

Webhook URL dùng cho Meta sẽ là:

```text
https://ten-service.onrender.com/webhook
```

### Bước 3: Thêm biến môi trường trên Render

Vào service trên Render, mở **Environment** và thêm:

```text
PAGE_ACCESS_TOKEN=token_cua_fanpage
VERIFY_TOKEN=chuoi_ban_tu_dat
GRAPH_API_VERSION=v24.0
APP_SECRET=app_secret_cua_meta
ADMIN_TOKEN=mat_khau_xem_leads
```

`VERIFY_TOKEN` phải giống hệt token bạn nhập trong Meta Developers khi cấu hình Webhook.

### Bước 4: Kiểm tra Render đã chạy

Mở:

```text
https://ten-service.onrender.com/health
```

Nếu thấy kết quả có `"ok": true` là server đã sẵn sàng.

### Bước 5: Kết nối Webhook trong Meta Developers

Trong Meta Developers:

1. Vào app đã tạo.
2. Mở Messenger hoặc Webhooks cho Page.
3. Nhập Callback URL:

```text
https://ten-service.onrender.com/webhook
```

4. Nhập Verify Token giống `VERIFY_TOKEN` trên Render.
5. Bấm **Verify and Save**.
6. Subscribe các event cần thiết:
   - `messages`
   - `messaging_postbacks`
7. Gắn app với Fanpage và chọn Page Access Token đúng Fanpage.

### Bước 6: Nhắn thử vào Fanpage

Nhắn vào Fanpage bằng tài khoản tester hoặc tài khoản được phép test app. Chatbot sẽ tự động:

- Chào hỏi
- Hỏi nhu cầu
- Tư vấn hạng B hoặc A1
- Báo học phí/hồ sơ
- Xin số điện thoại
- Lưu lead để nhân viên gọi lại

### Lưu ý về danh sách đăng ký trên Render

Hiện lead được lưu vào `data/leads.csv` và `data/leads.json`. Cách này phù hợp để chạy thử. Khi dùng thật, nên kết nối thêm Google Sheets, CRM hoặc database để danh sách đăng ký không phụ thuộc vào filesystem của server.

## Xem danh sách đăng ký

Lead được lưu vào:

```text
data/leads.csv
data/leads.json
```

Có thể xem qua endpoint:

```text
http://localhost:3000/leads?token=ADMIN_TOKEN_CUA_BAN
```

Khi lên production, nên dùng header:

```text
Authorization: Bearer ADMIN_TOKEN_CUA_BAN
```

## Nội dung đã cấu hình

### Hạng B

Tổng chi phí: 19.150.000đ.

- Học phí: 16.635.000đ
- Cabin: 600.000đ
- Lệ phí thi sát hạch: 765.000đ
- Khám sức khỏe: 350.000đ
- Thẻ: 150.000đ
- Đồng phục: 150.000đ
- Chi phí khác: 500.000đ

Hồ sơ ô tô:

- Đơn xin học
- Đơn xin sát hạch
- Cam kết
- Lý lịch học viên
- Căn cước photo
- Bằng A hoặc A1 nếu có
- 4 hình 3x4
- 1 hình 4x6
- Giấy khám sức khỏe đủ điều kiện lái xe theo hạng đăng ký

### Hạng A1

Tổng chi phí: 1.200.000đ.

- Học phí và lệ phí sát hạch: 850.000đ
- Khám sức khỏe: 350.000đ

Hồ sơ mô tô:

- Đơn xin học
- Đơn xin sát hạch
- Cam kết
- Căn cước photo
- Bằng ô tô nếu có
- 2 hình 3x4
- 1 hình 4x6
- Giấy khám sức khỏe đủ điều kiện lái xe theo hạng đăng ký

## Gợi ý vận hành

- Tin đầu tiên nên để khách chọn nhanh bằng quick replies, đừng bắt khách gõ dài.
- Mỗi câu trả lời nên kết thúc bằng một hành động: chọn hạng, xem học phí, xem hồ sơ hoặc gửi số điện thoại.
- Không nên cam kết đậu tuyệt đối. Nên nói trung tâm hỗ trợ học đúng chương trình, luyện kỹ năng và hướng dẫn hồ sơ đầy đủ.
- Nên có nhân viên kiểm tra danh sách lead mỗi ngày và cập nhật trạng thái sau khi gọi.
