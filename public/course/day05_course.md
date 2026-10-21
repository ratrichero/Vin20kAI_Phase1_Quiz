# Day 05 — Product thinking và yêu cầu cho AI product

> **Ý chính:** Chuyển giá trị và rủi ro thành yêu cầu có thể xây, kiểm thử và vận hành; đừng để “AI thông minh” là tiêu chí nghiệm thu.

## 1. AI product khác phần mềm xác định

Phần mềm truyền thống thường cho kết quả theo logic rõ; AI có đầu ra xác suất, chất lượng có thể dao động và có thể thiếu căn cứ. Vì vậy sản phẩm AI cần quality threshold, fallback, ranh giới sử dụng, cơ chế người kiểm tra và cách biểu đạt giới hạn.

Dùng **Jobs-to-be-Done (JTBD)** để hiểu công việc người dùng muốn hoàn thành, bối cảnh phát sinh và kết quả họ cần—not chỉ hỏi họ muốn tính năng nào. Trước khi chọn giải pháp, xác định ai dùng, dùng ở đâu, việc gì đang vướng và hậu quả khi sai.

## 2. Đặt metric cho giá trị thật

Chọn **North Star Metric** phản ánh kết quả của người dùng/doanh nghiệp, không chỉ số lượng hoặc độ dài câu trả lời. Ví dụ: tỷ lệ xử lý đúng ngay lần đầu, thời gian có câu trả lời dựa trên nguồn, hoặc tỷ lệ ticket vào đúng nhóm.

Theo dõi thêm metric bảo vệ chất lượng: lỗi nghiêm trọng, citation coverage, escalation, latency, chi phí và mức độ người dùng phải sửa/ghi đè.

## 3. Responsible AI và nghiên cứu người dùng

Đưa các nguyên tắc vào quyết định sản phẩm:

- Công bằng, không tạo chênh lệch bất hợp lý giữa các nhóm.
- Đủ ổn định và an toàn cho mục đích sử dụng.
- Chỉ dùng dữ liệu cần thiết; bảo vệ quyền riêng tư.
- Tính đến nhiều nhóm người dùng và mức độ tiếp cận khác nhau.
- Minh bạch về khả năng, giới hạn và vai trò của AI.

Nghiên cứu người dùng cần hỏi: họ muốn AI tự làm đến đâu; điều gì khiến họ tin; khi AI sai họ muốn sửa, thử lại hay chuyển người; và họ xem AI là trợ lý, copilot hay người thay thế. Persona nên bổ sung mức hiểu biết AI, độ sẵn sàng tự động hóa, ngưỡng chấp nhận lỗi và nhu cầu giải thích.

Thu thập ba loại tín hiệu: **explicit** (đánh giá/thums up-down), **behavioral** (sửa, copy, bỏ dở, ghi đè) và **outcome** (đã giải quyết, đặt dịch vụ, escalation).

## 4. Viết yêu cầu có thể kiểm thử

Ba nhóm requirement:

1. **Functional:** AI làm gì—tóm tắt, phân loại, tìm thông tin.
2. **Non-functional:** latency, availability, ngân sách, khả năng mở rộng.
3. **AI-specific:** ngưỡng chất lượng, grounding/citation, fallback, giới hạn rủi ro và giải thích.

Mẫu acceptance criteria:

> Khi **[trigger]**, hệ thống phải **[hành vi mong đợi]** trong **[ngưỡng đo được]**; nếu **[điều kiện lỗi/thiếu dữ liệu]**, hệ thống phải **[fallback/escalation]**.

Nếu kỹ sư không thể viết test từ yêu cầu, yêu cầu chưa đủ cụ thể.

## 5. PRD và risk register

PRD AI nên có: problem, target user, success metrics, giải pháp/phạm vi, functional requirements, non-functional/AI-specific requirements, acceptance criteria/kiến trúc, risks và cách giảm thiểu.

Lập **risk register** với mức khả năng xảy ra × mức tác động, owner, biện pháp kiểm soát và ngưỡng Go/No-Go. Tăng mức review cho các use case nhạy cảm; tuân thủ và yêu cầu pháp lý phải được kiểm tra theo thị trường triển khai.

**Từ khóa:** JTBD, North Star Metric, Responsible AI, persona, feedback signals, acceptance criteria, PRD, risk register.

**Nguồn tổng hợp:** transcript `day_05.md` và `MASTER_SUMMARY.md`.