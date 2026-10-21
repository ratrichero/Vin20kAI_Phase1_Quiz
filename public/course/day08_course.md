# Day 08 — RAG: từ truy xuất đến câu trả lời có căn cứ

> **Ý chính:** RAG là chuỗi indexing–retrieval–generation; cần tối ưu riêng từng chặng và buộc câu trả lời bám nguồn, có citation hoặc nói rõ khi thiếu dữ liệu.

## 1. RAG hay fine-tuning?

- **RAG:** tìm dữ liệu bên ngoài tại thời điểm hỏi, phù hợp tri thức riêng/cập nhật thường xuyên, cần nguồn dẫn và quyền truy cập.
- **Fine-tuning:** điều chỉnh hành vi, phong cách hoặc kỹ năng theo ví dụ; không phải cách cập nhật kho sự kiện sống.
- **Prompting:** hướng dẫn cách xử lý; thường là lựa chọn đầu tiên cho thay đổi nhỏ về định dạng/hành vi.

Có thể phối hợp các phương pháp, nhưng trước hết phải xác định cần thay đổi **kiến thức**, **hành vi** hay **quy trình**.

## 2. Ba pipeline của RAG

### A. Indexing — chuẩn bị kho

Parse tài liệu (kể cả bảng/layout), làm sạch và chuẩn hóa; chia chunk; tạo embedding; lưu vector cùng metadata/ACL; cập nhật hoặc loại bỏ tài liệu khi nguồn thay đổi.

### B. Retrieval — tìm bằng chứng

1. Làm sạch hoặc viết lại query khi mơ hồ.
2. Tìm bằng dense, sparse hoặc hybrid.
3. Lọc theo metadata/quyền truy cập.
4. Rerank một tập ứng viên nhỏ để đưa bằng chứng tốt lên đầu.

Kỹ thuật biến đổi query gồm expansion, decomposition cho câu hỏi nhiều phần, step-back cho câu hỏi quá chi tiết và HyDE trong trường hợp phù hợp. Mỗi bước tăng độ trễ/chi phí, nên chỉ bật khi eval cho thấy có lợi.

**Hybrid search** ghép dense và BM25; RRF gộp theo thứ hạng, tránh cộng trực tiếp điểm khác thang đo. **Cross-encoder reranker** chấm query–document chính xác hơn nhưng chậm hơn, nên dùng sau vòng tìm kiếm rộng. **MMR** giúp giảm các chunk trùng lặp khi cần nhiều góc nhìn.

### C. Generation — tổng hợp câu trả lời

- Đưa bằng chứng vào cấu trúc có ranh giới rõ (ví dụ XML/JSON/Markdown), kèm ID nguồn và metadata.
- Không nhồi hết context window. Slide gợi ý tỷ lệ **20/60/20** cho system/rules, retrieved context và phần dự phòng cho query/output; xem đây là heuristic để tuning, không phải quy tắc cố định.
- Giảm “lost in the middle”: sắp thứ tự bằng chứng có ý thức, ưu tiên nguồn mạnh ở đầu/cuối.
- Chỉ trả lời dựa trên context được truy xuất; gắn citation vào từng nhận định quan trọng.
- Nếu nguồn không đủ hoặc mâu thuẫn, nói rõ giới hạn, hỏi thêm hoặc chuyển người—không suy đoán.

## 3. Đánh giá RAG

Dùng Golden Dataset đại diện cho người dùng, loại tài liệu, câu hỏi thường gặp và ca khó/adversarial. Đo riêng retrieval và generation để biết lỗi ở đâu.

Các nhóm metric thường dùng trong RAGAS: **context precision**, **context recall**, **faithfulness** (câu trả lời có được bằng chứng hỗ trợ không) và **answer relevance**. Kết hợp đánh giá tự động với rà soát người thật; không coi điểm LLM-as-a-Judge là chân lý.

Tuning mỗi lần chỉ nên thay một yếu tố (chunk size, hybrid weight, reranker, prompt...) rồi so scorecard trước/sau. A/B test hoặc regression gate giúp tránh tối ưu một metric nhưng làm xấu trải nghiệm hoặc chi phí.

## 4. Quy trình debug ngắn

- Không tìm thấy tài liệu đúng → kiểm tra parsing, chunking, query và retrieval.
- Có tài liệu đúng nhưng câu trả lời sai → kiểm tra context injection, grounding, citation và xung đột nguồn.
- Trả lời không có nguồn → yêu cầu citation và fallback khi không đủ bằng chứng.
- Chất lượng giảm khi tăng k → kiểm tra nhiễu, thứ tự context, reranking và trùng lặp.

**Từ khóa:** RAG, indexing, retrieval, generation, query expansion, HyDE, BM25, RRF, reranking, MMR, grounding, citations, RAGAS, Golden Dataset.

**Nguồn tổng hợp:** transcript `day_08.md` và `MASTER_SUMMARY.md`.