export const courses = {
  B: {
    code: "B",
    label: "ô tô hạng B",
    shortLabel: "Hạng B",
    audience:
      "phù hợp nếu anh/chị muốn lái ô tô cá nhân, đi làm, đưa đón gia đình hoặc chủ động di chuyển hằng ngày",
    benefits: [
      "Lịch học có thể sắp xếp linh hoạt theo công việc.",
      "Trung tâm hướng dẫn hồ sơ từ đầu để tránh thiếu giấy tờ.",
      "Tư vấn viên theo sát từ lúc đăng ký đến khi vào lớp.",
      "Nội dung tư vấn tập trung vào đúng nhu cầu sử dụng xe của anh/chị."
    ],
    costs: [
      ["Học phí", 16635000],
      ["Cabin", 600000],
      ["Lệ phí thi sát hạch", 765000],
      ["Khám sức khỏe", 350000],
      ["Thẻ", 150000],
      ["Đồng phục", 150000],
      ["Chi phí khác", 500000]
    ],
    dossier: [
      "Đơn xin học",
      "Đơn xin sát hạch",
      "Cam kết",
      "Lý lịch học viên",
      "Căn cước photo",
      "Bằng A hoặc A1 nếu có",
      "4 hình 3x4",
      "1 hình 4x6",
      "Giấy khám sức khỏe đủ điều kiện lái xe theo hạng đăng ký"
    ]
  },
  A1: {
    code: "A1",
    label: "mô tô hạng A1",
    shortLabel: "Hạng A1",
    audience:
      "phù hợp nếu anh/chị cần bằng lái xe mô tô phổ thông và muốn hoàn tất hồ sơ gọn, dễ đăng ký",
    benefits: [
      "Thủ tục đăng ký đơn giản, được hướng dẫn chuẩn bị hồ sơ.",
      "Có lịch thi gần nhất để anh/chị chủ động sắp xếp.",
      "Chi phí rõ ràng, dễ quyết định.",
      "Tư vấn viên gọi lại xác nhận lịch và giấy tờ còn thiếu."
    ],
    costs: [
      ["Học phí và lệ phí sát hạch", 850000],
      ["Khám sức khỏe", 350000]
    ],
    dossier: [
      "Đơn xin học",
      "Đơn xin sát hạch",
      "Cam kết",
      "Căn cước photo",
      "Bằng ô tô nếu có",
      "2 hình 3x4",
      "1 hình 4x6",
      "Giấy khám sức khỏe đủ điều kiện lái xe theo hạng đăng ký"
    ]
  }
};

export function getCourse(courseCode) {
  return courses[courseCode] || null;
}

export function getCourseTotal(courseCode) {
  const course = getCourse(courseCode);
  if (!course) {
    return 0;
  }

  return course.costs.reduce((total, [, amount]) => total + amount, 0);
}

export function formatCurrency(amount) {
  return `${new Intl.NumberFormat("vi-VN").format(amount)}đ`;
}
