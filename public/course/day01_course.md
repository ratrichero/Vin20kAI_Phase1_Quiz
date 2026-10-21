# Day 01 — Nền tảng AI, LLM và Token Economy

> **Ý chính:** LLM là mô hình dự đoán token tiếp theo; chất lượng ứng dụng còn phụ thuộc vào dữ liệu ngữ cảnh, công cụ và cách vận hành.

## 1. Bản đồ AI

- **Machine Learning (ML):** học mẫu từ dữ liệu để phân loại hoặc dự đoán.
- **Deep Learning (DL):** ML dùng mạng nơ-ron nhiều tầng.
- **Foundation model:** mô hình lớn được huấn luyện trước, có thể thích ứng với nhiều tác vụ.
- **LLM:** foundation model chuyên xử lý ngôn ngữ.
- **Discriminative AI** phân loại/dự đoán; **Generative AI** sinh nội dung; **Agentic AI** dùng mô hình để lập kế hoạch và thực hiện hành động.

AI tạo sinh có thể làm việc với văn bản, giọng nói, hình ảnh, video và mã. Với thoại, kiến trúc phổ biến là `STT → LLM → TTS`; speech-to-speech xử lý hội thoại trực tiếp hơn và thường nhạy với độ trễ, ngắt lời (barge-in) và chất lượng âm thanh.

## 2. Agent, tool và harness

Một agent không chỉ là chatbot được thêm prompt. Có thể hình dung:

`Agent = model + context/state + vòng lặp điều phối + tools + harness`

- **Tool calling:** cơ chế để model yêu cầu ứng dụng gọi một hàm/API với tham số có cấu trúc.
- **MCP:** giao thức chuẩn hóa cách ứng dụng khám phá và sử dụng tools, resources hoặc prompts.
- **Agent skill:** gói hướng dẫn, tài liệu và script cho một loại công việc; chỉ nạp khi cần để tránh đưa mọi thứ vào context.
- **Harness:** phần bao quanh model—quyền, trạng thái, vòng lặp, kiểm tra, logging và cơ chế dừng.

## 3. LLM hoạt động thế nào?

Transformer dùng **self-attention** để tính quan hệ giữa các token trong context. Mô hình không tra một câu trả lời cố định; nó tính phân phối xác suất cho token tiếp theo, chọn token rồi tiếp tục cho đến khi kết thúc.

`Văn bản → tokenization → Transformer/attention → xác suất token kế tiếp → chuỗi đầu ra`

**Token không đồng nghĩa với từ.** Cách tách token phụ thuộc ngôn ngữ và tokenizer; tiếng Việt có thể tốn nhiều token hơn dự đoán theo số từ. Vì vậy hãy đo token thực tế thay vì ước lượng theo ký tự.

### Các giai đoạn huấn luyện

1. **Pre-training:** học mẫu ngôn ngữ và kiến thức tổng quát từ lượng dữ liệu lớn.
2. **SFT:** tinh chỉnh bằng ví dụ chỉ dẫn–trả lời.
3. **Alignment (ví dụ RLHF/DPO):** điều chỉnh để đầu ra phù hợp hơn với mục tiêu và sở thích được chọn.

Mô hình vẫn có giới hạn kiến thức, có thể bịa và không tự biết dữ liệu mới nếu không được cung cấp hoặc truy xuất.

## 4. Chọn model và tính chi phí

Dùng model nhỏ/rẻ cho tác vụ đơn giản, tần suất cao; chỉ dùng model mạnh hơn khi bài kiểm tra cho thấy cần suy luận hoặc chất lượng cao hơn. So sánh trên **cùng bộ test** về chất lượng, độ trễ và chi phí.

`Chi phí ≈ (input tokens × giá input + output tokens × giá output) / đơn vị tính giá`

Cần tính cả context được gửi lặp lại, lượt gọi bổ sung của agent và chi phí tool. Context window là giới hạn làm việc của một lần gọi, không phải lý do để gửi toàn bộ dữ liệu.

## 5. Gọi API an toàn và có thể đo

- Lưu API key trong biến môi trường hoặc secret manager; không ghi key vào mã nguồn.
- Mỗi request có model, messages, giới hạn output và các tham số phù hợp.
- **Streaming** trả nội dung theo từng phần, giúp giao diện phản hồi sớm hơn.
- Ghi lại provider/model, latency, token usage, lỗi và kết quả đánh giá.
- Điều chỉnh temperature theo tác vụ; bài cần ổn định thường dùng mức thấp hơn bài cần đa dạng.

## Ghi nhớ nhanh

1. LLM dự đoán token tiếp theo; không mặc nhiên biết dữ liệu riêng hay dữ liệu mới.
2. Token là đơn vị tính chi phí và context.
3. Chọn kiến trúc đơn giản nhất đáp ứng được yêu cầu; agent làm tăng số lượt gọi, độ trễ và rủi ro.
4. Đánh giá model bằng dữ liệu và tác vụ của chính sản phẩm.

**Từ khóa:** Transformer, self-attention, tokenization, pre-training, SFT, RLHF, DPO, tool calling, MCP, skill, harness, streaming.

**Nguồn tổng hợp:** transcript `day_01.md` và `MASTER_SUMMARY.md`.