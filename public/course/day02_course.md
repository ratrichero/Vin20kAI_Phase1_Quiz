# Day 02 — Chọn đúng bài toán kinh doanh cho AI

> **Ý chính:** Bắt đầu từ người dùng, quy trình và chỉ số; chỉ chọn model/agent sau khi biết AI có tạo giá trị tốt hơn cách đơn giản hơn hay không.

## 1. Tránh bốn bẫy phổ biến

- **Trend-first:** chọn agent vì đang thịnh hành, chưa rõ vấn đề cần giải.
- **No baseline:** không có cách làm hiện tại để so sánh.
- **No eval path:** có demo nhưng không có bộ test lặp lại được.
- **No owner of failure:** không rõ ai xử lý đầu ra sai, ai phê duyệt hoặc rollback.

## 2. Chọn mức tự động hóa

| Cách làm | Phù hợp khi | Lưu ý |
|---|---|---|
| Rule/script | Quy tắc rõ, input ổn định, cần kết quả xác định | Ưu tiên nếu giải được bằng cách này |
| LLM feature | Cần hiểu/sinh văn bản, phân loại nội dung biến thể hoặc tóm tắt | Cần đánh giá chất lượng và xử lý trường hợp không chắc |
| Workflow | Nhiều bước nhưng thứ tự và điều kiện đã biết | Thường dễ kiểm soát hơn agent tự quyết |
| Agent | Cần tự chọn bước tiếp, gọi nhiều tool, quan sát kết quả rồi điều chỉnh | Chỉ dùng khi giá trị bù được chi phí và rủi ro tăng thêm |

Dùng **AI-Fit Matrix** với hai trục: mức mơ hồ của tác vụ và độ phức tạp vận hành. Nếu đầu vào rõ và quy tắc ổn định, dùng rule/workflow. Nếu cần hiểu ngôn ngữ, thử LLM feature. Chỉ tăng quyền tự chủ khi cần quyết định động.

## 3. Vòng đời sản phẩm AI và các cổng quyết định

1. **Problem scoping:** actor, workflow, bottleneck và tác động phải rõ.
2. **Data readiness:** xác định nguồn dữ liệu, quyền truy cập, chất lượng và cách đánh giá.
3. **Baseline/model choice:** so với rule, quy trình hiện tại hoặc con người.
4. **Build & eval:** có bộ test, ngưỡng chất lượng, latency và ngân sách.
5. **Deploy controls:** có logging, người chịu trách nhiệm, HITL khi cần và rollback.
6. **Monitor & iterate:** theo dõi hiệu quả thật, lỗi và thay đổi của dữ liệu/người dùng.

**Go** khi có bằng chứng cho cổng hiện tại; **Not yet** khi cần thêm dữ liệu hoặc thử nghiệm; **No-go** khi giá trị, an toàn hoặc tính khả thi không đạt ngưỡng.

## 4. Kiểm tra mức sẵn sàng bằng 5 câu hỏi

1. Vấn đề xảy ra đủ thường xuyên và đang tiêu tốn thời gian, chi phí hoặc SLA không?
2. Có baseline để so sánh với giải pháp AI không?
3. Có metric, mẫu ca hoặc log để đánh giá lặp lại không?
4. Có thể chấp nhận sai số giới hạn, hoặc có người kiểm tra ở điểm quan trọng không?
5. Có owner, logging, chính sách xử lý lỗi và cách rollback không?

Nếu phần lớn câu trả lời là “chưa”, hãy làm rõ quy trình và thử nghiệm trước, chưa nên đầu tư lớn vào AI.

## 5. Viết Problem Statement

Dùng mẫu:

> **[Actor]** đang thực hiện **[workflow]**. Điểm nghẽn là **[bottleneck]**, gây **[tác động đo được]**. Thành công được đo bằng **[metric/ngưỡng]**. Hệ thống được phép **[boundary]**; các trường hợp **[rủi ro/thiếu dữ liệu]** phải chuyển cho người.

Phải chỉ ra actor, các bước hiện tại, nơi xảy ra lỗi/chậm, chỉ số thành công và ranh giới quyền hạn. Nếu từ câu mô tả chưa thể tạo test case hoặc chọn kiến trúc sơ bộ, vấn đề còn quá mơ hồ.

## 6. Phân rã kiến trúc và trách nhiệm

Một hệ thống có thể gồm **Model + Context + Planning + Tools**. Mỗi phần thêm vào đều có failure mode và chi phí: model có thể sai; retrieval có thể bỏ sót; planning có thể lặp; tool có thể gây side effect. Chỉ thêm thành phần khi có nhu cầu cụ thể và biện pháp kiểm soát tương ứng.

Lập **RACI-lite/stakeholder grid** để nêu rõ ai chịu trách nhiệm về dữ liệu, vận hành, phê duyệt rủi ro và quyết định tiếp tục/dừng. Kết thúc discovery bằng một next experiment nhỏ, có giả thuyết và tiêu chí quyết định.

**Từ khóa:** AI lifecycle, AI-Fit Matrix, baseline, readiness, Problem Statement, RACI-lite, Go/No-Go, workflow, agent.

**Nguồn tổng hợp:** transcript `day_02.md` và `MASTER_SUMMARY.md`.