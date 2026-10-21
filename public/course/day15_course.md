# Day 15 — Production, chi phí và định hướng chuyên sâu

> **Ý chính:** Một AI product sẵn sàng production khi giá trị, độ tin cậy, chi phí và quyền kiểm soát cùng được đo; portfolio cần chứng minh toàn bộ vòng đời chứ không chỉ demo.

## 1. Triển khai doanh nghiệp

Chọn **cloud, on-premise hoặc hybrid** theo nơi lưu dữ liệu, tuân thủ, latency, ngân sách, tích hợp hệ thống cũ và năng lực vận hành. Self-host model có thể tăng quyền kiểm soát nhưng chuyển trách nhiệm sang đội ngũ về GPU, scaling, cập nhật, bảo mật và availability.

Tách chi phí thành:

- **Build:** kỹ sư, tích hợp, chuẩn bị dữ liệu.
- **Run:** API/token, compute/GPU, storage, vector search.
- **Operate:** monitoring, human review, support, incident và bảo trì.

Đừng chỉ tính token. Tính cả các lượt agent, embedding/re-embedding, retry, cache, hạ tầng và công việc con người. Theo dõi chi phí theo request, user/tenant, task và kết quả.

## 2. Bốn cách tối ưu chi phí

1. **Model routing:** model nhỏ cho tác vụ thường/simple; chuyển model mạnh hơn khi cần.
2. **Semantic caching:** dùng lại kết quả phù hợp; phải có TTL/version và tránh cache facts đã đổi.
3. **Prompt/context compression:** chỉ gửi thông tin cần thiết; đo để tránh nén mất bằng chứng.
4. **Self-hosting:** cân nhắc khi traffic, dữ liệu hoặc yêu cầu kiểm soát đủ lớn để bù chi phí cố định.

Luôn kiểm tra rằng tiết kiệm chi phí không làm giảm chất lượng/an toàn. Đặt ngân sách theo mức tải (MVP/pilot/scale) và giới hạn tối đa.

## 3. Mẫu reliability cho tải production

- **Queue:** hấp thụ burst và điều tiết công việc dài.
- **Horizontal scaling:** tăng worker khi cần; tách trạng thái khỏi instance.
- **Circuit breaker:** ngừng gọi upstream lỗi kéo dài, rồi thử phục hồi có kiểm soát.
- **SLA/SLO, rate limit và cost guard:** quy định chất lượng/tải/chi phí.

Kết hợp các nguyên tắc deploy an toàn ở Day 12: shadow/canary, theo dõi metrics và rollback nhanh.

## 4. Chọn hướng phát triển

Ba nhóm năng lực trong khóa:

- **AI Business & Product:** discovery, product strategy, requirements, ROI, governance.
- **AI Infrastructure & Data:** data pipeline/lakehouse, serving, reliability, observability.
- **AI Application/Engineering:** RAG, agent patterns, tool integration, evaluation và ứng dụng.

Chọn track theo vấn đề bạn muốn giải quyết và công việc thực tế muốn làm, không chỉ theo tên chức danh hoặc xu hướng. Mức “exposure” của nghề trước AI không đồng nghĩa toàn bộ công việc đó sẽ biến mất; cần nhìn vào nhiệm vụ, bối cảnh và kỹ năng bổ trợ.

## 5. Portfolio cuối Phase 1

Một hồ sơ nên thể hiện:

- URL hoặc bản triển khai có thể chạy.
- Mô tả vấn đề, người dùng và metric thành công.
- Sơ đồ kiến trúc, ranh giới quyền và cách xử lý lỗi.
- Dashboard/trace/monitoring.
- Eval report có bộ test, failure analysis và regression.
- Cost analysis với giả định rõ.
- Bài trình bày ngắn nêu trade-off và việc sẽ cải thiện tiếp.

**Từ khóa:** enterprise deployment, cloud/on-prem/hybrid, cost anatomy, model routing, semantic cache, prompt compression, queue, circuit breaker, portfolio, Phase 2 tracks.

**Nguồn tổng hợp:** transcript `day_15.md` và `MASTER_SUMMARY.md`.