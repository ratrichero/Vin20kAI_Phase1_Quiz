# Day 12 — Đưa agent lên production

> **Ý chính:** Production đòi state bền vững, giới hạn chi phí/quyền, xử lý lỗi mạng và phát hành có thể quan sát/rollback—not chỉ chạy được trên máy cá nhân.

## 1. Chọn mô hình triển khai

Cân nhắc cloud API, managed agent runtime, self-hosted model, on-premise, edge hoặc hybrid theo dữ liệu, quyền kiểm soát, độ trễ, residency, chi phí và năng lực vận hành. Tách **framework** (định nghĩa luồng/agent) khỏi **runtime** (nơi chạy, state, auth, scaling, observability).

Không mặc định managed/OSS đồng nghĩa với cùng mức kiểm soát, giấy phép hay trách nhiệm vận hành. Xác minh các điều kiện này trước khi chọn.

## 2. Thiết kế dịch vụ bền vững

- **Externalize state:** lưu session/checkpoint bên ngoài tiến trình; không dựa vào RAM nếu cần tiếp tục sau restart.
- **Idempotency:** request lặp lại không tạo hành động trùng; dùng idempotency key cho ghi/thanh toán/đặt chỗ.
- **Timeout/retry:** đặt hạn cho model/tool, retry có giới hạn và backoff; không retry thao tác side effect mù quáng.
- **Async queue:** chuyển công việc dài sang queue; dùng job ID, trạng thái và thông báo tiến độ.
- **SSE/streaming:** gửi dữ liệu theo luồng, cấu hình proxy phù hợp và heartbeat để tránh kết nối bị đóng im lặng.
- **Admission/cost control:** giới hạn concurrency, token, tool calls, thời gian và ngân sách theo user/tenant.

## 3. Bảo vệ ứng dụng và container

Dùng multi-stage build, dependency đã pin, process non-root, secret manager, health endpoints và quyền mạng tối thiểu. Quét image/CVE, tạo SBOM và cập nhật thành phần dễ tổn thương. Không đưa API key vào image hoặc log.

Remote MCP/API cần xác thực, phân quyền, giới hạn rate và kiểm soát nguồn tool. Ưu tiên danh tính người dùng thật cho thao tác người dùng và service identity tối thiểu cho job tự động.

## 4. Health, scaling và độ tin cậy

Có probe riêng cho khởi động, sống và sẵn sàng nhận traffic. Tách worker stateless khi cần scale ngang; dùng queue để hấp thụ tải đột biến. Dùng circuit breaker khi upstream lỗi kéo dài; fallback rõ ràng và tránh request storm.

Model self-hosting cần tối ưu batching, bộ nhớ GPU và serving; chỉ tự host khi workload, quyền dữ liệu, mức sử dụng và năng lực vận hành justify chi phí.

## 5. CI/CD và phát hành an toàn

- Chạy unit/integration tests, security scan và **eval gate** trên prompt/model/tool/config/index thay đổi.
- Phát hành theo `shadow → canary → ramp`; quan sát quality, errors, latency và cost trước khi tăng traffic.
- Rollback phải bao gồm đúng artifact liên quan: code, prompt/config, model hoặc index.
- Với workflow nhiều bước có side effect, thiết kế saga/compensation hoặc bước người duyệt.

## Checklist trước deploy

- State có bền vững không? Request lặp có an toàn không?
- Có timeout, retry, queue và giới hạn ngân sách không?
- Có auth/authorization, secrets, logging và PII redaction không?
- Có health probe, dashboard, alert, eval gate và rollback không?
- Có thể tắt/giảm quyền agent khi xảy ra sự cố không?

**Từ khóa:** deployment, runtime, externalized state, idempotency, timeout, SSE, queue, cost guard, Docker, SBOM, health probe, canary, rollback.

**Nguồn tổng hợp:** transcript `day_12.md` và `MASTER_SUMMARY.md`.