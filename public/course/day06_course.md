# Day 06 — Quản lý sản phẩm và dự án AI

> **Ý chính:** Quản lý dự án AI bằng chu kỳ giả thuyết–thử nghiệm–đánh giá, định giá phần chưa chắc chắn và chỉ mở rộng khi có bằng chứng.

## 1. Agile kết hợp phương pháp khoa học

AI có nhiều điều chưa biết: chất lượng dữ liệu, hành vi model, độ tin cậy của tool và mức chấp nhận của người dùng. Vì vậy sprint cần tạo ra **học hỏi có thể kiểm chứng**, không chỉ hoàn thành ticket.

Mỗi thử nghiệm nên nêu: giả thuyết, phạm vi, thời gian, ngân sách tối đa, metric thành công và điều kiện dừng. Ước lượng công việc phải tính cả iteration prompt/eval, làm sạch dữ liệu, xử lý lỗi tool và hiệu chỉnh trải nghiệm người dùng.

**Definition of Done** của AI feature không chỉ là code chạy. Cần có ngưỡng chất lượng, latency/cost phù hợp, fallback, test, logging/monitoring và xử lý data/feature/technical debt.

## 2. Chọn đúng mức thử nghiệm

| Loại | Câu hỏi cần trả lời | Kết quả mong muốn |
|---|---|---|
| **MVE** (Minimum Viable Experiment) | Người dùng có thật sự cần giá trị này không? | Học nhanh với thử nghiệm nhỏ nhất |
| **MVP** | Phiên bản nhỏ có dùng được trong workflow thật không? | Sản phẩm tối thiểu có thể vận hành |
| **PoC** | Công nghệ/giả định có khả thi để tiếp tục đầu tư không? | Giảm bất định cho quyết định đầu tư |

**Wizard of Oz** có thể dùng để kiểm chứng workflow trước khi tự động hóa: một người làm thủ công ở phía sau bản demo. Cần minh bạch phù hợp; mục đích là học sớm, không đánh lừa người dùng.

## 3. Thiết kế PoC gọn

PoC Canvas cần có:

- Giả thuyết chính cần kiểm chứng.
- Phạm vi hẹp: một workflow, nhóm user và tập dữ liệu giới hạn.
- Metric/tiêu chí thành công đã thống nhất trước.
- Timebox và ngân sách.
- Quyết định tiếp theo nếu đạt hoặc không đạt.

Low-code/no-code phù hợp để dựng demo và kiểm tra workflow nhanh. Công cụ đó không thay thế discovery, PRD, risk analysis hay thiết kế production.

## 4. Tính ROI có giả định rõ

Tổng chi phí gồm:

- **Build:** thời gian phát triển, tích hợp, chuẩn bị dữ liệu.
- **Run:** API/model, compute, storage, vector DB.
- **Operate:** review của con người, monitoring, support, bảo trì và xử lý lỗi.

Giá trị có thể là thời gian tiết kiệm, throughput tăng, giảm lỗi/chi phí, giảm thời gian chờ hoặc doanh thu tăng.

`ROI = (tổng giá trị − tổng chi phí) / tổng chi phí`

**Break-even** là thời điểm giá trị tích lũy bù được chi phí tích lũy. Lập ba kịch bản **conservative / realistic / optimistic**, nêu rõ adoption, chi phí review, giá model và tỷ lệ lỗi—không trình bày một con số đẹp duy nhất.

## 5. Trình bày với stakeholder

- **Technical deck:** kiến trúc, dữ liệu, eval, rủi ro, dependency và Definition of Done.
- **Executive deck:** vấn đề, giá trị, thời gian, kịch bản ROI, rủi ro chính và quyết định cần phê duyệt.

Pitch ngắn nên trả lời: vấn đề gì, ai gặp, giải pháp nào, metric nào, chi phí/rủi ro ra sao, và cần quyết định gì (Go/Pilot/No-Go).

**Từ khóa:** Agile, hypothesis-driven sprint, Definition of Done, MVE, MVP, PoC, Wizard of Oz, ROI, break-even, stakeholder pitch.

**Nguồn tổng hợp:** transcript `day_06.md` và `MASTER_SUMMARY.md`.