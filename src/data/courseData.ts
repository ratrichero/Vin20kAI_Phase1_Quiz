export interface CourseLesson {
  dayNum: number;
  dayId: string;
  title: string;
  fullTitle: string;
  phase: string;
  phaseShort: string;
  keyIdea: string;
  sections: string[];
  filename: string;
  path: string;
}

export const COURSE_LESSONS: CourseLesson[] = [
  {
    dayNum: 1,
    dayId: "Day 01",
    title: "Nền tảng AI, LLM và Token Economy",
    fullTitle: "Day 01 — Nền tảng AI, LLM và Token Economy",
    phase: "Giai đoạn 1: Nền tảng & Xác định sản phẩm",
    phaseShort: "Nền tảng & SP",
    keyIdea: "LLM là mô hình dự đoán token tiếp theo; chất lượng ứng dụng còn phụ thuộc vào dữ liệu ngữ cảnh, công cụ và cách vận hành.",
    sections: [
      "1. Bản đồ AI",
      "2. Agent, tool và harness",
      "3. LLM hoạt động thế nào?",
      "4. Chọn model và tính chi phí",
      "5. Gọi API an toàn và có thể đo",
      "Ghi nhớ nhanh"
    ],
    filename: "day01_course.md",
    path: "/course/day01_course.md"
  },
  {
    dayNum: 2,
    dayId: "Day 02",
    title: "Chọn đúng bài toán kinh doanh cho AI",
    fullTitle: "Day 02 — Chọn đúng bài toán kinh doanh cho AI",
    phase: "Giai đoạn 1: Nền tảng & Xác định sản phẩm",
    phaseShort: "Nền tảng & SP",
    keyIdea: "Bắt đầu từ người dùng, quy trình và chỉ số; chỉ chọn model/agent sau khi biết AI có tạo giá trị tốt hơn cách đơn giản hơn hay không.",
    sections: [
      "1. Tránh bốn bẫy phổ biến",
      "2. Chọn mức tự động hóa",
      "3. Vòng đời sản phẩm AI và các cổng quyết định",
      "4. Kiểm tra mức sẵn sàng bằng 5 câu hỏi",
      "5. Viết Problem Statement",
      "6. Phân rã kiến trúc và trách nhiệm"
    ],
    filename: "day02_course.md",
    path: "/course/day02_course.md"
  },
  {
    dayNum: 3,
    dayId: "Day 03",
    title: "Từ chatbot đến agent: ReAct và tool calling",
    fullTitle: "Day 03 — Từ chatbot đến agent: ReAct và tool calling",
    phase: "Giai đoạn 1: Nền tảng & Xác định sản phẩm",
    phaseShort: "Nền tảng & SP",
    keyIdea: "Agent hữu ích khi phải chọn hành động dựa trên kết quả trung gian; mỗi tool cần hợp đồng rõ, giới hạn quyền và trace để kiểm tra.",
    sections: [
      "1. Phân biệt các mức hệ thống",
      "2. Agentic Fit: có thật sự cần agent không?",
      "3. ReAct: Thought → Action → Observation",
      "4. Tool schema tốt",
      "5. ReAct, function calling và hybrid",
      "6. Chi phí, an toàn và đánh giá"
    ],
    filename: "day03_course.md",
    path: "/course/day03_course.md"
  },
  {
    dayNum: 4,
    dayId: "Day 04",
    title: "Context, loop và harness engineering",
    fullTitle: "Day 04 — Context, loop và harness engineering",
    phase: "Giai đoạn 1: Nền tảng & Xác định sản phẩm",
    phaseShort: "Nền tảng & SP",
    keyIdea: "Model chỉ suy luận; harness chịu trách nhiệm về vòng lặp, quyền, lưu trạng thái và ngăn chặn hành vi sai lệch.",
    sections: [
      "1. Bốn lớp kiến trúc của agent",
      "2. Context loop và điều kiện dừng",
      "3. State, bộ nhớ và khôi phục sau sự cố",
      "4. Thiết kế harness cho production",
      "5. Đánh giá context và loop",
      "Ghi nhớ nhanh"
    ],
    filename: "day04_course.md",
    path: "/course/day04_course.md"
  },
  {
    dayNum: 5,
    dayId: "Day 05",
    title: "Product thinking và yêu cầu cho AI product",
    fullTitle: "Day 05 — Product thinking và yêu cầu cho AI product",
    phase: "Giai đoạn 1: Nền tảng & Xác định sản phẩm",
    phaseShort: "Nền tảng & SP",
    keyIdea: "AI có tính xác suất; PRD cần xác định kỳ vọng về độ chính xác, cách xử lý khi model sai và cơ chế phản hồi từ người dùng.",
    sections: [
      "1. AI Product khác phần mềm truyền thống ở đâu?",
      "2. JTBD và nghiên cứu người dùng cho AI",
      "3. Cấu trúc một AI PRD",
      "4. Tiêu chí nghiệm thu cho đầu ra xác suất",
      "5. Thu thập phản hồi người dùng",
      "6. Responsible AI và phân tầng rủi ro"
    ],
    filename: "day05_course.md",
    path: "/course/day05_course.md"
  },
  {
    dayNum: 6,
    dayId: "Day 06",
    title: "Quản lý sản phẩm và dự án AI",
    fullTitle: "Day 06 — Quản lý sản phẩm và dự án AI",
    phase: "Giai đoạn 2: Xây hệ thống & Dữ liệu",
    phaseShort: "Hệ thống & Data",
    keyIdea: "Dự án AI chứa đựng sự bất định về kỹ thuật và dữ liệu; quản lý theo chu kỳ thử nghiệm có giới hạn thời gian (time-boxed) thay vì lộ trình cố định.",
    sections: [
      "1. Agile theo phương pháp khoa học",
      "2. Phân biệt PoC, MVE và MVP",
      "3. Quản lý backlog và Definition of Done (DoD)",
      "4. Phân tích ROI và mô hình 3 kịch bản",
      "5. Thử nghiệm nhanh với Wizard of Oz và Low-code",
      "6. Quản lý kỳ vọng bên liên quan"
    ],
    filename: "day06_course.md",
    path: "/course/day06_course.md"
  },
  {
    dayNum: 7,
    dayId: "Day 07",
    title: "Nền tảng dữ liệu: embedding, chunking và vector store",
    fullTitle: "Day 07 — Nền tảng dữ liệu: embedding, chunking và vector store",
    phase: "Giai đoạn 2: Xây hệ thống & Dữ liệu",
    phaseShort: "Hệ thống & Data",
    keyIdea: "Dữ liệu đưa vào quyết định giới hạn chất lượng của RAG; chunking và embedding phù hợp giúp model tìm đúng thông tin cần thiết.",
    sections: [
      "1. Bản chất của Embedding",
      "2. Chiến lược Chunking văn bản",
      "3. Đo khoảng cách và độ tương đồng",
      "4. Chỉ mục Vector (HNSW vs Flat)",
      "5. Làm sạch dữ liệu và làm giàu siêu dữ liệu",
      "6. Chiến lược bộ nhớ cho Agent"
    ],
    filename: "day07_course.md",
    path: "/course/day07_course.md"
  },
  {
    dayNum: 8,
    dayId: "Day 08",
    title: "RAG: từ truy xuất đến câu trả lời có căn cứ",
    fullTitle: "Day 08 — RAG: từ truy xuất đến câu trả lời có căn cứ",
    phase: "Giai đoạn 2: Xây hệ thống & Dữ liệu",
    phaseShort: "Hệ thống & Data",
    keyIdea: "RAG nâng cao kết hợp tìm kiếm ngữ nghĩa và từ khóa (Hybrid search), xếp hạng lại kết quả (Rerank) và kiểm tra tính xác thực để tránh ảo giác.",
    sections: [
      "1. Kiến trúc RAG 4 giai đoạn",
      "2. Hybrid Search (Dense + Sparse/BM25)",
      "3. Thuật toán kết hợp Reciprocal Rank Fusion (RRF)",
      "4. Xếp hạng lại kết quả với Cross-Encoder",
      "5. Nén ngữ cảnh và viết lại truy vấn (HyDE)",
      "6. Đánh giá hệ thống RAG với RAGAS"
    ],
    filename: "day08_course.md",
    path: "/course/day08_course.md"
  },
  {
    dayNum: 9,
    dayId: "Day 09",
    title: "Multi-agent, MCP, A2A và LangGraph",
    fullTitle: "Day 09 — Multi-agent, MCP, A2A và LangGraph",
    phase: "Giai đoạn 2: Xây hệ thống & Dữ liệu",
    phaseShort: "Hệ thống & Data",
    keyIdea: "Tách nhỏ tác vụ cho nhiều agent chuyên biệt giúp giảm quá tải ngữ cảnh; giao thức chuẩn hóa (MCP) và máy trạng thái (LangGraph) giúp điều phối mượt mà.",
    sections: [
      "1. Khi nào cần Multi-Agent?",
      "2. Mô hình Supervisor - Worker",
      "3. Model Context Protocol (MCP) toàn diện",
      "4. Giao thức giao tiếp Agent-to-Agent (A2A)",
      "5. LangGraph và StateGraph",
      "6. Cơ chế ngắt để con người duyệt (Human-in-the-loop)"
    ],
    filename: "day09_course.md",
    path: "/course/day09_course.md"
  },
  {
    dayNum: 10,
    dayId: "Day 10",
    title: "Data pipeline và data observability",
    fullTitle: "Day 10 — Data pipeline và data observability",
    phase: "Giai đoạn 2: Xây hệ thống & Dữ liệu",
    phaseShort: "Hệ thống & Data",
    keyIdea: "Hệ thống AI chỉ mạnh khi luồng dữ liệu ổn định và có thể quan sát; áp dụng hợp đồng dữ liệu (Data Contract) và phát hiện trôi dạt (Data Drift).",
    sections: [
      "1. Pipeline xử lý Batch vs Streaming cho AI",
      "2. 6 chiều chất lượng dữ liệu (Data Quality)",
      "3. 5 trụ cột quan sát dữ liệu (Data Observability)",
      "4. Định dạng bảng hiện đại Apache Iceberg",
      "5. Phát hiện và xử lý Data Drift",
      "6. Cơ chế kiểm soát lỗi âm thầm (Silent Failures)"
    ],
    filename: "day10_course.md",
    path: "/course/day10_course.md"
  },
  {
    dayNum: 11,
    dayId: "Day 11",
    title: "Guardrails, HITL và Responsible AI",
    fullTitle: "Day 11 — Guardrails, HITL và Responsible AI",
    phase: "Giai đoạn 3: An toàn, Production & Đánh giá",
    phaseShort: "Production & Eval",
    keyIdea: "Bảo vệ hệ thống AI theo nguyên tắc phòng thủ chiều sâu (Defense-in-depth); kiểm soát cả đầu vào (Prompt Injection), công cụ và đầu ra (PII, Hallucination).",
    sections: [
      "1. Bức tranh an toàn AI và bài toán căn chỉnh",
      "2. Tấn công Prompt Injection trực tiếp và gián tiếp",
      "3. Lớp bảo vệ đầu vào và lọc chủ đề",
      "4. Che giấu thông tin định danh cá nhân (PII Masking)",
      "5. Lớp bảo vệ đầu ra và kiểm tra trích dẫn",
      "6. Cơ chế người giám sát (HITL) và Red Teaming"
    ],
    filename: "day11_course.md",
    path: "/course/day11_course.md"
  },
  {
    dayNum: 12,
    dayId: "Day 12",
    title: "Đưa agent lên production",
    fullTitle: "Day 12 — Đưa agent lên production",
    phase: "Giai đoạn 3: An toàn, Production & Đánh giá",
    phaseShort: "Production & Eval",
    keyIdea: "Đóng gói ứng dụng tối ưu kích thước, giảm thời gian khởi động lạnh (Cold Start), kiểm soát chi phí bằng hạn mức ngân sách và bảo mật qua API Gateway.",
    sections: [
      "1. Thu hẹp khoảng cách từ Localhost lên Production",
      "2. Tối ưu Docker Container (slim, uv, multi-stage)",
      "3. Giảm thiểu Cold Start",
      "4. Kiến trúc API Gateway và Rate Limiting",
      "5. Quản lý cấu hình và bí mật (Secrets)",
      "6. Health Checks (/healthz vs /ready) và Circuit Breaker"
    ],
    filename: "day12_course.md",
    path: "/course/day12_course.md"
  },
  {
    dayNum: 13,
    dayId: "Day 13",
    title: "Monitoring, logging và observability",
    fullTitle: "Day 13 — Monitoring, logging và observability",
    phase: "Giai đoạn 3: An toàn, Production & Đánh giá",
    phaseShort: "Production & Eval",
    keyIdea: "Giám sát cả hạ tầng hệ thống và hiệu năng mô hình; theo dõi các chỉ số đặc thù TTFT, TPS, chi phí token và phân tích độ trễ tại phân vị P99.",
    sections: [
      "1. 4 tín hiệu vàng SRE + 2 chỉ số cho AI",
      "2. TTFT (Time to First Token) và TPS (Tokens/sec)",
      "3. Tại sao phân vị P99 lại tối quan trọng?",
      "4. Distributed Tracing với OpenTelemetry GenAI",
      "5. Hệ thống chuyên dụng: Langfuse & LangSmith",
      "6. Quản lý cảnh báo và chống mệt mỏi cảnh báo (Alert Fatigue)"
    ],
    filename: "day13_course.md",
    path: "/course/day13_course.md"
  },
  {
    dayNum: 14,
    dayId: "Day 14",
    title: "Evaluation và benchmarking cho AI",
    fullTitle: "Day 14 — Evaluation và benchmarking cho AI",
    phase: "Giai đoạn 3: An toàn, Production & Đánh giá",
    phaseShort: "Production & Eval",
    keyIdea: "Đánh giá mô hình ngôn ngữ đòi hỏi bộ tiêu chuẩn đa chiều; kết hợp bộ dữ liệu chuẩn (Golden Dataset), LLM-as-a-Judge và đo lường độ đồng thuận người đánh giá.",
    sections: [
      "1. Vì sao đánh giá ML truyền thống không đủ cho LLM?",
      "2. Xây dựng Golden Dataset chất lượng cao",
      "3. Đánh giá quỹ đạo và độ chính xác gọi tool của Agent",
      "4. Nguyên lý và sai số của LLM-as-a-Judge",
      "5. Đo độ đồng thuận người đánh giá (Cohen's Kappa)",
      "6. Phân tích nguyên nhân gốc và phân loại lỗi"
    ],
    filename: "day14_course.md",
    path: "/course/day14_course.md"
  },
  {
    dayNum: 15,
    dayId: "Day 15",
    title: "Production, chi phí và định hướng chuyên sâu",
    fullTitle: "Day 15 — Production, chi phí và định hướng chuyên sâu",
    phase: "Giai đoạn 3: An toàn, Production & Đánh giá",
    phaseShort: "Production & Eval",
    keyIdea: "Tối ưu chi phí quy mô lớn bằng PagedAttention, Continuous Batching, định tuyến mô hình nhỏ (SLM) và xây dựng lộ trình năng lực kỹ sư AI toàn diện.",
    sections: [
      "1. Cấu trúc chi phí hệ thống AI ở quy mô lớn",
      "2. Tối ưu bộ nhớ với vLLM và PagedAttention",
      "3. Prompt Caching và định tuyến thông minh (Model Routing)",
      "4. Tự host mô hình nhỏ (SLM) vs Gọi Cloud API",
      "5. Bảng kiểm tra trước khi Golive (Production Readiness)",
      "6. 3 cột trụ năng lực và lộ trình phát triển kỹ sư AI"
    ],
    filename: "day15_course.md",
    path: "/course/day15_course.md"
  }
];

const markdownCache: Record<number, string> = {};

export async function fetchCourseMarkdown(dayNum: number): Promise<string> {
  if (markdownCache[dayNum]) {
    return markdownCache[dayNum];
  }

  const paddedDay = String(dayNum).padStart(2, '0');
  const filename = `day${paddedDay}_course.md`;
  const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/';
  const basePrefix = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const urls = [
    `${basePrefix}course/${filename}`,
    `/course/${filename}`,
    `./course/${filename}`,
  ];

  let lastError: Error | null = null;
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const text = await res.text();
        markdownCache[dayNum] = text;
        return text;
      }
    } catch (err) {
      lastError = err as Error;
    }
  }

  throw new Error(lastError ? lastError.message : `Không thể tải bài giảng cho Day ${paddedDay}`);
}

export function getCourseLesson(dayNum: number): CourseLesson | undefined {
  return COURSE_LESSONS.find((l) => l.dayNum === dayNum);
}
