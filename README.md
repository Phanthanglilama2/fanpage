# Chatbot tuyển sinh lái xe cho Fanpage

Chatbot Messenger Webhook cho Fanpage: tự động chào hỏi, phân loại nhu cầu, tư vấn hạng bằng, báo học phí/hồ sơ, xin số điện thoại và lưu danh sách đăng ký để nhân viên gọi lại.

Project hiện được cấu hình để deploy bằng Vercel.

## Luồng tư vấn

1. Người học nhắn tin Fanpage.
2. Chatbot hỏi nhu cầu: ô tô hạng B, mô tô A1, tải/dịch vụ hoặc nâng hạng.
3. Chatbot tư vấn lợi ích theo nhu cầu.
4. Chatbot báo học phí hoặc hồ sơ khi khách hỏi.
5. Chatbot xin số điện thoại.
6. Khi có số điện thoại, hệ thống lưu lead.
7. Nhân viên gọi lại, xác nhận lịch học và cập nhật danh sách đăng ký.

## Cấu trúc chính

```text
api/
  health.js       API kiểm tra tình trạng trên Vercel
  leads.js        API xem lead dạng JSON
  leads-csv.js    API tải lead dạng CSV
  webhook.js      Webhook Messenger cho Fanpage
src/
  conversationEngine.js  Kịch bản chatbot
  courseCatalog.js       Học phí và hồ sơ khóa học
  leadStore.js           Lưu lead local hoặc Upstash Redis/KV
  messenger.js           Gửi tin nhắn qua Meta Send API
  metaWebhook.js         Xử lý webhook Meta
vercel.json              Rewrite /webhook, /health, /leads
```

## Chạy thử local

Yêu cầu Node.js 20 trở lên.

```powershell
Copy-Item .env.example .env
npm.cmd start
```

Nếu PowerShell không chặn `npm.ps1`, có thể dùng:

```powershell
npm start
```

Kiểm tra server local:

```text
http://localhost:3000/health
```

Webhook local:

```text
http://localhost:3000/webhook
```

Muốn test gần giống Vercel hơn thì cài Vercel CLI và chạy:

```powershell
npm.cmd run vercel:dev
```

## Biến môi trường

Tạo `.env` khi chạy local, hoặc nhập trong Vercel Dashboard khi deploy:

```text
PAGE_ACCESS_TOKEN=token_cua_fanpage
VERIFY_TOKEN=chuoi_ban_tu_dat
GRAPH_API_VERSION=v24.0
APP_SECRET=app_secret_cua_meta
ADMIN_TOKEN=mat_khau_xem_leads
```

`VERIFY_TOKEN` là chuỗi bạn tự đặt, nhưng phải nhập giống hệt trong Meta Developers khi cấu hình Webhook.

## Lưu lead trên Vercel

Vercel Functions không phù hợp để lưu lead lâu dài bằng file trong project. Vì vậy khi deploy thật, nên kết nối Upstash Redis/KV trên Vercel Marketplace.

Sau khi connect Upstash Redis/KV vào project, Vercel thường tự thêm các biến:

```text
KV_REST_API_URL=
KV_REST_API_TOKEN=
```

Nếu dashboard hiển thị tên biến Upstash trực tiếp, cũng có thể dùng:

```text
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

Tùy chọn đổi key lưu lead:

```text
LEADS_STORAGE_KEY=fanpage-driving-school-leads
SESSIONS_STORAGE_KEY=fanpage-driving-school-sessions
```

Khi không có các biến Redis/KV, hệ thống sẽ dùng local file `data/leads.json` và `data/leads.csv`, phù hợp để chạy thử trên máy.
Khi deploy Vercel production, nên bật Redis/KV để lưu cả lead và trạng thái hội thoại giữa các lần gọi function.

## Deploy bằng Vercel

1. Push project này lên GitHub.
2. Vào Vercel, chọn **Add New Project**.
3. Import repository GitHub.
4. Framework Preset: chọn **Other** nếu Vercel không tự nhận.
5. Build Command: để trống hoặc dùng mặc định.
6. Output Directory: để trống.
7. Thêm Environment Variables:
   - `PAGE_ACCESS_TOKEN`
   - `VERIFY_TOKEN`
   - `GRAPH_API_VERSION`
   - `APP_SECRET`
   - `ADMIN_TOKEN`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `SESSIONS_STORAGE_KEY`
8. Bấm **Deploy**.

Sau khi deploy, Vercel sẽ cấp domain dạng:

```text
https://ten-du-an.vercel.app
```

Webhook URL dùng cho Meta:

```text
https://ten-du-an.vercel.app/webhook
```

Kiểm tra tình trạng:

```text
https://ten-du-an.vercel.app/health
```

## Kết nối Fanpage trong Meta Developers

1. Tạo app trong Meta Developers.
2. Thêm sản phẩm Messenger.
3. Lấy Page Access Token của Fanpage và nhập vào Vercel biến `PAGE_ACCESS_TOKEN`.
4. Vào phần Webhooks hoặc Messenger Webhooks.
5. Callback URL:

```text
https://ten-du-an.vercel.app/webhook
```

6. Verify Token: nhập đúng giá trị `VERIFY_TOKEN`.
7. Subscribe event:
   - `messages`
   - `messaging_postbacks`
8. Gắn app với Fanpage.
9. Nhắn thử vào Fanpage bằng tài khoản tester hoặc tài khoản có quyền test app.

## Xem danh sách đăng ký

JSON:

```text
https://ten-du-an.vercel.app/leads?token=ADMIN_TOKEN_CUA_BAN
```

CSV:

```text
https://ten-du-an.vercel.app/leads.csv?token=ADMIN_TOKEN_CUA_BAN
```

Khi dùng production, nên gọi bằng header:

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

- Tin đầu tiên nên để khách chọn nhanh bằng quick replies.
- Mỗi câu trả lời nên kết thúc bằng một hành động: chọn hạng, xem học phí, xem hồ sơ hoặc gửi số điện thoại.
- Không nên cam kết đậu tuyệt đối. Nên nói trung tâm hỗ trợ học đúng chương trình, luyện kỹ năng và hướng dẫn hồ sơ đầy đủ.
- Nên có nhân viên kiểm tra danh sách lead mỗi ngày và cập nhật trạng thái sau khi gọi.
