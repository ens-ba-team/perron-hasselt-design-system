# README — Perron Hasselt Room Management (Lite)

> [!NOTE]
> **Bản digest tiếng Việt về rule sản phẩm.** Dành cho designer đọc nhanh, không phải nguồn tra cứu.
> Canonical: [BRD](../product/BRD%20-%20Perron%20Hasselt%20Room%20Management.md) §7 (`BR01`–`BR29`) cho business rule,
> [Functional Spec](../product/Functional%20Spec%20-%20Perron%20Hasselt%20Room%20Management.md) cho field và WordPress.
> Lệch với hai file đó thì **hai file đó thắng**.
>
> **Ở đây KHÔNG có:** trạng thái hiện tại (→ [`../../README.md`](../../README.md) §1) ·
> design system (→ [`../../README.md`](../../README.md) và `agentic-design-system.md`) ·
> câu hỏi đang mở (→ Functional Spec §9) · index folder (→ [`README.md`](README.md)).
>
> Port từ Obsidian vault 2026-10-13. Cắt §4b / §9 / §10 cùng ngày vì ba mục đó lặp lại status và DS
> đã có chủ ở nơi khác, và đã stale ngay lúc port. Bản đầy đủ: [`archive/2026-10-12-README.md`](archive/2026-10-12-README.md).

> Đọc trang này trước khi thiết kế, review hay đề xuất gì mới. Chi tiết đầy đủ nằm ở
> [BRD](../product/BRD%20-%20Perron%20Hasselt%20Room%20Management.md) và
> [Functional Spec](../product/Functional%20Spec%20-%20Perron%20Hasselt%20Room%20Management.md).
> Client: Mina · Owner: Enosta Product Design · FigJam: https://www.figma.com/board/RnN40RUrCANewi4MBP60yU
> (FigJam là nguồn chuẩn cho **wireframe, flow và số hiệu BR**; văn bản rule thì repo `docs/product/` là gốc)

---

## 1. Sản phẩm trả lời đúng một câu hỏi

> **"Phòng nào có thể chào cho một tenant mới, bắt đầu từ ngày X?"**

Mọi thứ khác (tenant, hợp đồng, check-in/out, maintenance, tiền cọc) là phụ trợ cho câu này.

**Bối cảnh cứng:** WordPress + ACF Pro + Admin Columns Pro, **không code tuỳ chỉnh** · 41 units hiện tại (Perron 19: 29 rooms, Perron 17: 12 studios) — **số phòng không cố định**, admin tạo được phòng và thêm được building mới · 3 admin ngang quyền · tenant **không** có tài khoản · không làm payment tracking, online booking.

---

## 2. Hai rule trần — kiểm mọi đề xuất qua đây trước

> Trang này gọi rule theo số hiệu cũ `R...`. Khi trích dẫn trong spec hay với client, dùng số `BR` — tra
> [rule-number-map.md](../product/rule-number-map.md). Ví dụ: `R0` = `BR01`, `R24` = `BR10`, `R25` = `BR03`.

### 🔴 R0 — Không tự động hoá gì cả
Hệ thống **không bao giờ sửa cái admin đã gõ**. Chỉ lưu, lọc, hiển thị. Người vận hành lớn tuổi; client gọi sản phẩm là *"một phiên bản mở rộng của Excel"*.

| ✅ Được | ❌ Không được |
|---|---|
| Filter, sort, saved view | Status tự nhảy khi qua ngày |
| Cột hiển thị giá trị tính sẵn (chỉ đọc) | Cron, email/notification tự gửi |
| Nhắc nhở không chặn | Macro sửa ô người dùng gõ |

**R22** đi xa hơn: bản Lite **không làm cảnh báo theo tầng màu**. Dùng link status sẵn có của WordPress (kèm số lượng).

### 🔴 R24 / R25 — Tiền tính theo HỢP ĐỒNG, không theo ngày check-out
- Rời sớm vẫn trả đủ, không hoàn lại.
- `Available from` neo vào **`Contract end`**, không neo vào `Check-out date`.

---

## 3. Product principles

1. **Khả năng chào bán là hàm theo thời gian, không phải trạng thái** → sort theo `Available from`, đừng lấy Status làm trục chính.
2. **Ngày đáng tin hơn trạng thái** → ngày nhập một lần; trạng thái phải nuôi liên tục.
3. **UI không hứa nhiều hơn dữ liệu có** → không làm date-range picker trên Rooms (ngoại lệ: kiểm trùng lịch khi tạo booking).
4. **Mọi phán đoán thuộc về con người** → thiết kế để *thấy* sai lệch, không để *tự sửa*. Cảnh báo, **đừng ẩn**.
5. **Độ lệch giữa hai trường là tín hiệu, không phải lỗi** → đặt các trường cần đối chiếu cạnh nhau.

## 4. Nguyên tắc UI

- **List là sản phẩm** — 41 phòng gần vừa một màn hình.
- **Bỏ sửa tại chỗ** (12/10). List chỉ để đọc; mọi chỉnh sửa làm trong side panel 560px mở từ ID hoặc nút Edit. ⚠️ Khác với spec gốc của client (FR-G2, FR-R5) — **cần xác nhận lại với client**.
- **Không giấu sau tab/accordion** — thà cuộn ngang.
- **Thứ tự cột là công cụ thiết kế:** `Room Status` ↔ `Available from`; `Contract end` ↔ `Check-out date`.
- **Hoàn tác được:** bật WordPress revisions. **Xoá phải khó hơn sửa** — booking không xoá, chuyển `Cancelled`.

---

## 5. Data model — quy tắc nền

- Quan hệ: `Tenant 1:n Booking n:1 Room`, `Room 1:n Maintenance`, Booking có 2 FK staff (check-in, check-out).
- **FK luôn ở phía "n".** Giá trị tính được thì **không lưu thành field** (vd. tổng tiền = `Monthly rent` × số tháng).
- Không copy dữ liệu Tenant vào Booking → tránh hai nguồn sự thật.
- Trạng thái dùng **dropdown, không checkbox** khi cần phân biệt "chưa làm" với "không áp dụng" (`Deposit status`, `Tenant confirmed`).
- ⚠️ Tên trường **không duy nhất** giữa các bảng (`Room ID`, `Tenant ID`, `Staff ID`).

### Ba lớp ngày — không được gộp
| Lớp | Trường | Bản chất |
|---|---|---|
| Pháp lý | `Contract start/end` | Đã thoả thuận → tiền, `Available from` |
| Kế hoạch | `Check-in/out date` | Hẹn bàn giao |
| Thực tế | `Check-in/out done` | Đã xảy ra |

---

## 6. Rule dễ sai nhất

| Rule    | Nội dung                                                                                                                                                                                            |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **R1**  | `Available from` = **ngày đầu tiên sau khi booking cuối cùng của phòng kết thúc**. Phòng `Còn chỗ` → hôm nay. ❌ KHÔNG phải "hợp đồng kết thúc sớm nhất" (sai với phòng 1 chỗ có hợp đồng nối tiếp). |
| R2/R2b  | Trả phòng sớm: phòng trống người nhưng **chưa trống hợp đồng** → Status và `Available from` cố ý nói khác nhau.                                                                                     |
| R3      | Room Status: `Available` / `Reserved` / `Còn chỗ` / `Occupied`. `Còn chỗ` chỉ cho phòng 2 người. Tài liệu tiếng Anh gọi là **Partially occupied**.                                                  |
| R4      | Ở quá hạn → vẫn `Occupied`, admin tự cập nhật.                                                                                                                                                      |
| **R6**  | Huỷ booking → phải **tính lại `Available from` bằng tay**. Quên = doanh thu vô hình. 🔴 rủi ro cao                                                                                                  |
| R7      | Tạo booking → `Reserved`; check-in done → `Occupied` (phòng 2 người mới 1 người → `Còn chỗ`).                                                                                                       |
| R12/R13 | Một phòng có nhiều booking Active cùng lúc (≤ `Max occupancy`); hợp đồng ký theo từng tenant.                                                                                                       |
| R20     | Không trừ cọc theo hạng mục; tiền hư hỏng xử lý ngoài hệ thống.                                                                                                                                     |
| R23     | Không có huỷ sau khi đã ký. `Cancelled` chỉ cho booking chưa ký.                                                                                                                                    |
| R26     | Khi tạo booking, **đánh dấu (không ẩn)** phòng có booking trùng khoảng ngày. Không thêm field. Có thể cần code → **Q27**.                                                                           |

Danh sách rule đầy đủ: [BRD](../product/BRD%20-%20Perron%20Hasselt%20Room%20Management.md) §7 (`BR01`–`BR29`).
Nếu gặp số hiệu `R...` ở tài liệu cũ, tra [rule-number-map.md](../product/rule-number-map.md).

---

## 7. Phép thử trước khi hỏi hoặc thêm thứ gì

1. **Trước khi đặt câu hỏi:** viết ra hai kịch bản trả lời, liệt kê màn hình/trường thay đổi. Giống nhau → không phải câu hỏi thiết kế.
2. **Khi tổng quát hoá một quy tắc:** chạy lại **toàn bộ ca cũ** ở cấu hình phức tạp nhất (phòng 2 chỗ, hợp đồng nối tiếp, huỷ, trả sớm).
3. **Trước khi thêm trường:** câu hỏi này có cần trả lời *trước* không, hay trả lời *đúng lúc cần* là đủ? Mỗi field mới = thêm một ô phải nuôi bằng tay.
4. **Từ của client có hai nghĩa (vận hành / pháp lý):** kiểm bằng dòng tiền. Tiền không đổi → trạng thái pháp lý không đổi.

---

## 8. Đã quyết không làm ở bản Lite

Notification/nhắc hạn · cảnh báo tầng màu · `Available until` · trả cọc một phần · payment tracking.
Điều kiện mở lại: xem [BRD](../product/BRD%20-%20Perron%20Hasselt%20Room%20Management.md) §4.2.
