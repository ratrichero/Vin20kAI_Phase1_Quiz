# Day 13 — Monitoring, logging và observability

> **Ý chính:** Monitoring cho biết tín hiệu nào đang vượt ngưỡng; observability giúp lần theo nguyên nhân qua metrics, logs, traces và đánh giá chất lượng liên tục.

## 1. Bốn trụ cột quan sát agent

1. **Metrics:** xu hướng, tỷ lệ lỗi, latency, cost và chất lượng.
2. **Logs:** sự kiện có cấu trúc, đủ ngữ cảnh để tra cứu.
3. **Traces:** đường đi xuyên service/model/retrieval/tool.
4. **Continuous online eval:** đánh giá mẫu đầu ra production theo tiêu chí chất lượng/an toàn.

Thêm bốn Golden Signals—latency, traffic, errors, saturation—và hai tín hiệu đặc thù AI: **cost** và **quality**. Theo dõi P50/P95/P99 thay vì chỉ trung bình; với streaming, theo dõi TTFT (time to first token).

## 2. Structured logging an toàn

Mỗi log nên có timestamp, service/version, correlation ID, request/job ID, model, latency, token usage, tool calls, status và error category. Dùng context propagation để nối một yêu cầu qua nhiều thành phần.

- Redact/mask PII và secrets trước khi ghi log.
- Tách **application log** (debug vận hành) khỏi **audit log** (ai làm gì, quyết định nào, lúc nào).
- Tránh ghi raw prompt/context nhạy cảm nếu không có căn cứ và chính sách lưu giữ.
- Hạn chế high-cardinality labels (ví dụ user/request ID trong metric); để ID chi tiết ở log/trace.

## 3. Distributed tracing cho agent

Một trace là một yêu cầu; các span đại diện cho model call, retrieval, reranking, tool call, guardrail và bước chờ người. Gắn correlation ID, thời gian, outcome, token/cost và lỗi. Trace giúp xác định bottleneck và biết model đã nhận nguồn nào, tool nào trả dữ liệu gì.

## 4. Dashboard, SLI/SLO/SLA và alert

- **SLI:** chỉ số đo thực tế (ví dụ latency p95 hoặc tỷ lệ hoàn thành đúng).
- **SLO:** mục tiêu nội bộ cho SLI trong một khoảng thời gian.
- **SLA:** cam kết dịch vụ với khách hàng/đối tác.
- **Error budget:** phần lỗi cho phép trước khi cần ưu tiên độ tin cậy.

Dashboard nên có lớp tổng quan (traffic/uptime), lớp chất lượng/chi phí và lớp điều tra (trace/error breakdown). Alert theo mức độ tác động, có owner, ngưỡng, link dashboard và runbook; tránh alert fatigue.

## 5. Quy trình điều tra incident

`Metric báo lệch → tìm log theo correlation ID → mở trace → xác định model/retrieval/tool/data → tái hiện → giảm tác động → sửa và thêm regression test`

Đừng chỉ sửa câu prompt nếu gốc lỗi là dữ liệu cũ, tool timeout, quyền sai hoặc index lỗi. Sau incident, ghi timeline, phạm vi tác động, nguyên nhân, hành động khắc phục và biện pháp ngăn tái diễn.

**Từ khóa:** observability, metrics, logs, traces, online eval, RED/USE, P95/P99, TTFT, correlation ID, OpenTelemetry, SLI, SLO, SLA, error budget, runbook.

**Nguồn tổng hợp:** transcript `day_13.md` và `MASTER_SUMMARY.md`.