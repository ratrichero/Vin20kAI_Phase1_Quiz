# Day 14 — Evaluation và benchmarking cho AI

> **Ý chính:** Eval là một vòng lặp khoa học: định nghĩa tiêu chí, thu mẫu đại diện, đo lỗi, kiểm tra độ tin cậy của grader rồi dùng kết quả để cải thiện hệ thống.

## 1. Ba cách đánh giá

- **Offline:** chạy bộ test cố định trước khi release; nhanh và có thể lặp lại.
- **Online:** đo trên traffic thật/nhóm thử nghiệm; phản ánh điều kiện thực nhưng cần kiểm soát rủi ro.
- **Human evaluation:** người đánh giá chất lượng, mức hữu ích, an toàn và các trường hợp khó tự động hóa.

Đánh giá cả **chất lượng đầu ra**, **task completion** và **trajectory** (các bước/tool/decision dẫn đến kết quả), không chỉ chấm câu trả lời cuối.

## 2. Golden Dataset

Tạo bộ dữ liệu câu hỏi/đầu vào, expected behavior, nguồn hoặc rubric. Phân tầng theo loại tác vụ, người dùng, nguồn dữ liệu, độ khó và mức rủi ro; thêm ca adversarial và failure thật từ production. Gắn version cho dataset và evaluator để so sánh theo thời gian.

Tài liệu gợi ý 50–100 mẫu làm điểm bắt đầu, có hơn 10% ca adversarial và kiểm tra mức đồng thuận người chấm (ví dụ Cohen’s kappa). Đây là mốc thực hành, không phải số lượng phù hợp cho mọi sản phẩm.

## 3. Metric cho RAG

RAGAS thường xem xét:

- **Context precision:** retrieved context có tập trung vào tài liệu liên quan không?
- **Context recall:** có lấy được bằng chứng cần thiết không?
- **Faithfulness:** các nhận định có được context hỗ trợ không?
- **Answer relevance:** câu trả lời có đáp ứng câu hỏi không?

Các metric khác nhau chẩn đoán các lỗi khác nhau. Ví dụ: context recall thấp gợi ý retrieval; context đúng nhưng faithfulness thấp gợi ý generation/grounding.

## 4. LLM-as-a-Judge

Viết rubric cụ thể; với tiêu chí rõ, **binary pass/fail** thường ổn định và dễ phân tích hơn thang Likert mơ hồ. Calibrate evaluator với mẫu do người chấm; đo false positive/false negative (TPR/TNR), xem bất đồng và các thiên lệch như độ dài, vị trí câu trả lời hoặc tự ưu ái model cùng dòng.

Judge tự động là một thước đo cần kiểm định—không phải ground truth. Dùng human review cho rủi ro cao và mẫu bất đồng.

## 5. Thống kê và độ tin cậy

So sánh các phiên bản trên cùng item bằng paired design; tính biến thiên và khoảng tin cậy, tránh kết luận chỉ từ vài ví dụ. Khi nhiều câu hỏi đến từ cùng một nguồn/item, cần tính đến cụm phụ thuộc thay vì giả định mọi mẫu độc lập. Chạy A/B test có giả thuyết, metric chính và điều kiện dừng rõ.

Với agent:

- **pass@k:** trong k lần thử, có ít nhất một lần thành công.
- **pass^k:** tất cả k lần đều thành công—hữu ích để xem độ ổn định khi phải tin cậy nhiều lần.

Kết quả pass@k cao nhưng pass^k thấp cho thấy agent đôi lúc làm được nhưng chưa ổn định.

## 6. Phân tích lỗi trước khi tối ưu metric

Đọc trace và ghi failure mở; sau đó gom nhóm (axial coding) thành taxonomy như sai đáp án, retrieval miss, tool sai, dừng sai, vi phạm policy hoặc format sai. Tìm nguyên nhân gốc bằng 5 Whys, rồi viết evaluator/regression test cho lỗi có thể tái hiện.

**Từ khóa:** offline/online/human eval, Golden Dataset, RAGAS, LLM-as-a-Judge, TPR/TNR, pass@k, pass^k, A/B test, failure taxonomy, regression gate.

**Nguồn tổng hợp:** transcript `day_14.md` và `MASTER_SUMMARY.md`.