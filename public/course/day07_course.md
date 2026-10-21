# Day 07 — Nền tảng dữ liệu: embedding, chunking và vector store

> **Ý chính:** RAG chỉ tốt khi dữ liệu được trích xuất, chia đoạn, nhúng, lập chỉ mục và truy xuất đúng; lỗi dữ liệu thường không làm hệ thống crash mà âm thầm làm câu trả lời sai.

## 1. Chọn đúng loại dữ liệu

- **Knowledge data:** tài liệu/chính sách ít thay đổi—phù hợp parse, chunk và retrieval.
- **Operational data:** trạng thái đơn hàng, CRM, ticket, tồn kho—thường cần truy vấn có kiểm soát/API/SQL, không nên nhúng mọi thứ vào vector DB.
- **Contextual data:** thông tin phiên hoặc hồ sơ người dùng cần thiết cho lượt hiện tại—chỉ đưa vào khi cần.

Trước khi index, xác định owner, quyền truy cập, chu kỳ cập nhật, thời hạn lưu và PII. Mask/minimize dữ liệu nhạy cảm trước khi tạo embedding; vector không mặc nhiên là dữ liệu ẩn danh.

## 2. Pipeline dữ liệu cho retrieval

`Tài liệu → parse/extract → normalize → chunk → embed → store + metadata → query/retrieve → inject context`

Parser phải giữ cấu trúc quan trọng: tiêu đề, bảng, cột, trang, quan hệ giữa nội dung. Với tiếng Việt, chuẩn hóa Unicode (thường dùng NFC) và kiểm tra dấu/ký tự. Không giả định PDF, bảng tính hay HTML đều là văn bản phẳng.

### Chunking

- Chunk quá lớn: nhiều nhiễu, tốn context và khó lấy đúng đoạn.
- Chunk quá nhỏ: mất ngữ cảnh hoặc câu trả lời bị tách rời.
- Chia theo tiêu đề/đoạn/cấu trúc tài liệu khi phù hợp; overlap có thể giữ ý nối qua ranh giới nhưng làm tăng dung lượng.
- Kiểm tra giới hạn token của embedding model để tránh **silent truncation**.

Chunk nên kèm metadata như nguồn, loại tài liệu, ngày, phòng ban, quyền truy cập và ID để lọc/citation.

## 3. Embedding và tìm kiếm

Embedding biến văn bản thành vector để so sánh mức gần về ngữ nghĩa. Cosine similarity là tín hiệu hình học, không phải thước đo hoàn hảo về liên quan. Chọn model theo ngôn ngữ, độ dài, license, kiểu truy vấn, nơi triển khai và benchmark trên corpus của chính mình—không chỉ nhìn leaderboard.

- **Dense/vector search:** tốt với diễn đạt lại, từ đồng nghĩa và câu hỏi tự nhiên.
- **Sparse/BM25:** tốt với từ khóa chính xác, mã lỗi, ID và tên riêng.
- **Hybrid:** kết hợp dense và sparse; có thể gộp thứ hạng bằng **RRF**.

ANN giúp tìm gần đúng nhanh hơn trên tập lớn. Các họ thường gặp: **Flat** (baseline chính xác), **IVF** (gom cụm), **PQ** (nén), **HNSW** (đồ thị). Mỗi lựa chọn đánh đổi recall, latency và bộ nhớ. FAISS là thư viện tìm kiếm vector; các vector database còn cung cấp lưu trữ/metadata/operations.

## 4. Đo chất lượng và xử lý lỗi

- **Recall@k:** trong top-k có bao nhiêu tài liệu liên quan cần tìm.
- **Precision@k:** trong top-k có bao nhiêu kết quả thật sự liên quan.
- **MRR/nDCG:** đánh giá vị trí của kết quả liên quan.

Luôn có baseline BM25 và test theo query thật. Có thể tạo bộ kiểm tra tạm bằng câu hỏi sinh từ chunk, nhưng phải rà soát mẫu vì cách này dễ thiên lệch về trùng từ ngữ.

Các lỗi hay gặp: chunk sai ranh giới; model đổi nhưng không re-embed; sai prefix/instruction; silent truncation; filter sau ANN khiến thiếu kết quả; collection dùng nhầm embedding function; dữ liệu cũ hoặc cache không version hóa.

## 5. Quyền truy cập và bảo mật

Filter theo ACL của người dùng **trước hoặc ngay trong quá trình ANN search**, không chỉ lọc sau khi lấy top-k. Kiểm tra tài liệu có thể chứa prompt injection hoặc dữ liệu độc hại. Giới hạn quyền truy cập vào vector index và áp dụng chính sách dữ liệu tương đương dữ liệu nguồn.

**Từ khóa:** knowledge/operational/contextual data, embedding, cosine, chunking, NFC, BM25, hybrid search, RRF, ANN, HNSW, Recall@k, ACL, PII.

**Nguồn tổng hợp:** transcript `day_07.md` và `MASTER_SUMMARY.md`.