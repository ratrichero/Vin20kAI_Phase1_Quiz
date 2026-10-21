# Day 10 — Data pipeline và data observability

> **Ý chính:** Pipeline dữ liệu có thể “chạy xanh” nhưng đưa dữ liệu sai, cũ hoặc thiếu vào RAG/agent; cần hợp đồng, quality gates và quan sát xuyên suốt.

> **Phạm vi:** Nội dung được trích xuất cho Day 10 là **Data Pipeline & Data Observability**. Không nhầm với các slide chuyển tiếp cũ ghi chủ đề khác.

## 1. Từ nguồn dữ liệu đến ứng dụng

Một pipeline điển hình:

`Source → ingestion → validation/transform → quality gate → storage/index → serving → monitoring/lineage`

- **ETL:** biến đổi trước khi nạp; **ELT:** nạp trước rồi biến đổi trong kho.
- **Batch:** xử lý theo đợt; **streaming:** xử lý liên tục/sự kiện.
- **CDC log-based** thường đọc thay đổi từ log nguồn; query-based polling đọc định kỳ. Chọn theo độ trễ, tải hệ nguồn và yêu cầu đầy đủ.
- Với streaming, quản lý **watermark**, dữ liệu đến muộn, backpressure, retry và duplicate.

## 2. Transform, chất lượng và hợp đồng

Biến đổi quan trọng nên nằm trong code có version, test và log—không dựa vào hành động thủ công không thể tái lập. Chuẩn hóa tiếng Việt (NFC/NFD), xử lý schema, kiểm tra kiểu/giá trị và mask PII **trước khi embed**.

Data quality có thể đo qua các chiều như completeness, validity, uniqueness, consistency, accuracy và timeliness. Dùng profiling để biết baseline, sau đó đặt kiểm tra cụ thể: not-null, uniqueness, range, freshness, volume và schema.

**Data contract** xác định producer/consumer, schema, owner, định nghĩa chất lượng, SLA và cách xử lý breaking change. Đặt quality gates ở ranh giới phù hợp: trước transform, trước publish, trước embed/index hoặc trước serving. Quyết định **fail-closed** hay **fail-open** theo mức rủi ro; không để dữ liệu lỗi lặng lẽ trở thành dữ kiện đáng tin.

## 3. Lưu trữ và phục vụ

Phân biệt warehouse, data lake, lakehouse và vector store theo kiểu dữ liệu/truy vấn. Mô hình **Bronze → Silver → Gold** giúp tách dữ liệu thô, đã làm sạch và dữ liệu phục vụ phân tích/sản phẩm. Lưu metadata, lineage, ACL và phiên bản index.

Khi đổi embedding, không trộn vector từ hai không gian khác nhau: tạo index mới, kiểm thử song song rồi chuyển traffic (blue-green cutover). Xử lý upsert/delete, stale chunks và vector “mồ côi”; rebuild/compaction khi cần.

## 4. Data observability

Theo dõi các trụ cột: **freshness, volume, schema, distribution và lineage**. Với agent/RAG, bổ sung các tín hiệu như dữ liệu truy xuất được bao nhiêu, index cập nhật chưa, nguồn nào gây lỗi và tác động tới chất lượng câu trả lời.

Debug theo tầng:

1. Nguồn có dữ liệu đúng và được phép dùng không?
2. Ingestion có thiếu/chậm/trùng không?
3. Transform/schema có làm mất ý nghĩa hoặc PII không?
4. Store/index có đúng phiên bản, metadata và ACL không?
5. Retrieval/serving có lấy đúng phần dữ liệu không?

Kết hợp anomaly detection (rule, robust statistics như MAD, seasonal/trend methods khi phù hợp), alert có ngưỡng và runbook. Tránh cảnh báo quá nhiều hoặc freshness SLI không phản ánh được độ mới thật.

## 5. Vận hành, pháp lý và kinh tế

Pipeline cần orchestration, retry/backfill, idempotency và lịch chạy rõ. Runbook tối thiểu: phát hiện → khoanh vùng → ngăn lan rộng → khôi phục/reprocess → xác minh chất lượng → ghi incident và phòng tái diễn.

Lưu ý quyền truy cập, lưu trữ, chuyển dữ liệu và quy định áp dụng tại thị trường triển khai; nội dung luật trong slide chỉ là điểm bắt đầu để xác minh, không phải tư vấn pháp lý. Theo dõi chi phí scan/compute, embedding/re-embedding, lưu trữ và vận hành—không chỉ chi phí token.

**Ghi chú kiểm chứng:** transcript Day 10 rà soát vụ *Moffatt v. Air Canada* và nêu mức phán quyết **$812.02**; đồng thời cảnh báo không khẳng định vụ việc là do “stale retrieval” nếu nguồn gốc không chứng minh điều đó.

**Từ khóa:** ETL/ELT, CDC, batch/streaming, watermark, data contract, quality gate, Medallion, freshness, lineage, drift, idempotency, backfill, runbook.

**Nguồn tổng hợp:** transcript `day_10.md` và `MASTER_SUMMARY.md`.