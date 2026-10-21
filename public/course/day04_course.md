# Day 04 — Context, loop và harness engineering

> **Ý chính:** Chất lượng agent không chỉ nằm ở prompt/model; context quyết định model thấy gì, loop quyết định nó làm gì tiếp, harness quyết định điều gì được phép.

## 1. Bốn lớp lồng nhau

`Prompt → Context → Loop → Harness`

- **Prompt:** hướng dẫn cho một lần gọi.
- **Context:** thông tin được đưa vào lần gọi đó.
- **Loop:** cách agent lặp, chuyển bước và dừng.
- **Harness:** runtime, quyền, hooks, kiểm tra và logging bao quanh model.

Prompt có thể hướng dẫn “không đặt phòng khi chưa được duyệt”; harness phải cưỡng chế điều đó bằng một approval gate trước thao tác đặt thật.

## 2. Lắp context packet có chủ đích

Một context packet thường gồm: (1) system/developer instructions, (2) yêu cầu hiện tại, (3) phần lịch sử còn liên quan, (4) state/facts đã biết, (5) tài liệu truy xuất, (6) tool schemas, (7) tool results kèm nguồn/thời điểm, (8) output contract.

Context dài không tự động tốt hơn: token tốn tiền và độ trễ; thông tin dư làm loãng dữ kiện quan trọng. Dùng bốn phép toán:

- **Write:** ghi state/kế hoạch ra ngoài context khi cần tồn tại lâu.
- **Select:** chỉ lấy dữ liệu liên quan cho lượt hiện tại.
- **Compress:** tóm tắt lịch sử/kết quả dài; chấp nhận đây là thao tác mất mát.
- **Isolate:** tách chỉ dẫn khỏi dữ liệu ngoài, tool output và nội dung không đáng tin.

Khi nén, giữ quyết định đã chốt, ràng buộc, nguồn và thời điểm, câu hỏi chưa giải quyết, cùng cập nhật mới nhất. Dữ liệu live cần `source`, `fetched_at`, thời hạn hiệu lực và phạm vi áp dụng.

## 3. Thiết kế tool và xử lý kết quả

Tool cần tên/mô tả rõ, schema chặt, quyền tối thiểu, kết quả có giới hạn và lỗi có thể hành động. Không chuyển nguyên văn dữ liệu ngoài vào context nếu chưa parse, validate, lọc PII và gắn nguồn/thời gian. Error message cũng là nội dung model sẽ đọc—hãy viết rõ input sai ở đâu và cách sửa.

Ghi trace đủ để trả lời: lượt nào, model thấy context gì, tool nào được gọi với tham số gì, gate có duyệt không, kết quả/lỗi ra sao, tốn bao nhiêu.

## 4. Bốn cơ chế bắt buộc của loop

1. **Success predicate:** định nghĩa điều kiện hoàn thành theo domain.
2. **Budget cap:** giới hạn số vòng, thời gian, token, tiền và tool call.
3. **No-progress detector:** phát hiện lặp lại hoặc không tạo thêm thông tin.
4. **Escalation path:** chuyển cho người hoặc fallback khi hết ngân sách, thiếu dữ kiện hay gặp rủi ro.

Không có điều kiện dừng rõ ràng thì agent có thể lặp, tiêu tiền hoặc làm quá quyền.

## 5. Harness, phê duyệt và đo lường

Cấp quyền theo rủi ro: đọc dữ liệu ít rủi ro khác với gửi thông tin ra ngoài, thanh toán, hủy hoặc ghi dữ liệu. Chặn thao tác nhạy cảm ở phía runtime/hook; phê duyệt nên gắn với **hành động và tham số cụ thể**, không phải chỉ tên tool.

Prompt, schema, eval set và cấu hình là artifacts cần version hóa. Với mỗi thay đổi, ghi lỗi cần sửa, artifact đã đổi, case nào pass/fail, regression nào đã kiểm tra và cách rollback. Chạy một bộ smoke test nhỏ (positive, thiếu dữ liệu, live data, injection) trước khi tin thay đổi; sau đó chạy bộ eval rộng hơn.

**Ghi nhớ:** prompt là hướng dẫn; gate/hook là cưỡng chế. Debug đúng lớp gây lỗi thay vì cứ viết thêm prompt.

**Từ khóa:** context packet, context rot, Write/Select/Compress/Isolate, success predicate, budget cap, no-progress detector, approval gate, harness, tiny eval.

**Nguồn tổng hợp:** transcript `day_04.md` và `MASTER_SUMMARY.md`.