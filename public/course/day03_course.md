# Day 03 — Từ chatbot đến agent: ReAct và tool calling

> **Ý chính:** Agent hữu ích khi phải chọn hành động dựa trên kết quả trung gian; mỗi tool cần hợp đồng rõ, giới hạn quyền và trace để kiểm tra.

## 1. Phân biệt các mức hệ thống

- **Bot theo luật:** phản hồi cố định, dễ dự đoán và kiểm soát.
- **LLM chatbot:** sinh câu trả lời theo prompt/context; thường không thực hiện công việc bên ngoài.
- **Reactive/tool-using system:** gọi tool theo một luồng đã định.
- **Autonomous agent:** giữ mục tiêu, chọn bước và tool, đọc kết quả rồi điều chỉnh.

Agent không phải mặc định tốt hơn. Nếu chỉ cần FAQ, tóm tắt, hoặc workflow có bước cố định, chatbot/LLM feature hoặc workflow thường rẻ và dễ kiểm soát hơn.

## 2. Agentic Fit: có thật sự cần agent không?

Chấm mức độ cần thiết trên bốn câu hỏi:

1. **Multi-step reasoning:** có nhiều bước phụ thuộc nhau không?
2. **Tool interaction:** có cần truy cập API, tìm kiếm, cơ sở dữ liệu hoặc tính toán không?
3. **Dynamic decision:** bước tiếp theo có phụ thuộc kết quả vừa quan sát không?
4. **Goal/state continuity:** cần giữ mục tiêu và trạng thái qua nhiều vòng không?

Nếu đa số nhu cầu thấp, bắt đầu bằng giải pháp ít tự chủ hơn. Điểm số chỉ là hỗ trợ thảo luận; phải cân nhắc hậu quả khi sai, khả năng review và ngân sách.

## 3. ReAct: Thought → Action → Observation

ReAct xen kẽ quyết định và hành động:

1. **Thought/decision:** xác định còn thiếu thông tin gì.
2. **Action:** gọi đúng tool với tham số hợp lệ.
3. **Observation:** đọc kết quả, kiểm tra lỗi/nguồn.
4. Lặp lại nếu cần; kết thúc khi đạt success condition hoặc phải escalation.

Ví dụ: tìm chuyến bay cần gọi công cụ tìm vé; nếu người dùng hỏi thời tiết tại điểm đến, gọi thêm thời tiết; chỉ tổng hợp sau khi có kết quả. Nếu tool timeout, thử lại có giới hạn rồi thông báo/fallback—không tự bịa dữ liệu.

## 4. Tool schema tốt

Mỗi tool nên khai báo:

- **Name:** hành động cụ thể, ví dụ `search_flights`.
- **Description:** dùng khi nào và không dùng khi nào.
- **Parameters:** kiểu dữ liệu, trường bắt buộc, định dạng và giới hạn.
- **Return format:** cấu trúc đầu ra rõ ràng.
- **Error modes:** timeout, input sai, dữ liệu rỗng và cách biểu diễn.

Tool quá chung chung khiến model đoán; tool quá nhỏ tạo nhiều lượt gọi. Gọi song song các việc độc lập; tuần tự hóa việc mà bước sau phụ thuộc kết quả bước trước.

## 5. ReAct, function calling và hybrid

- **ReAct dạng text:** dễ học và xem trace, nhưng parser có thể mong manh.
- **Native function calling:** tool call có cấu trúc, SDK xử lý ổn định hơn.
- **Hybrid:** dùng function calling để thực thi và ghi trace/giải thích quyết định ở mức phù hợp cho debug.

ReAct là pattern điều phối; function calling là cơ chế kỹ thuật để biểu diễn lời gọi tool.

## 6. Chi phí, an toàn và đánh giá

Agent thường dùng nhiều token/lượt gọi và có latency cao hơn chatbot. So sánh **giá trị tăng thêm** với tổng chi phí, bao gồm tool và xử lý lỗi.

Bảo vệ theo lớp:

1. **Input guard:** giới hạn/kiểm tra đầu vào.
2. **Tool guard:** allowlist, xác thực tham số, sandbox và quyền tối thiểu.
3. **Output guard:** kiểm tra nội dung; yêu cầu xác nhận người dùng cho hành động rủi ro/khó hoàn tác.

Tool output là dữ liệu không đáng tin tuyệt đối; có thể chứa chỉ dẫn độc hại. Đánh giá không chỉ final answer mà cả trace: tool chọn đúng không, tham số đúng không, có tuân thủ policy không, có dừng đúng lúc không.

**Từ khóa:** Agentic Fit, ReAct, Thought-Action-Observation, function calling, tool schema, trace, prompt injection, graceful degradation.

**Nguồn tổng hợp:** transcript `day_03.md` và `MASTER_SUMMARY.md`.