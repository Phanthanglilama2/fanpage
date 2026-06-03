import { courses, formatCurrency, getCourseTotal } from "./courseCatalog.js";

const sessions = new Map();

const quickReplies = {
  mainMenu: [
    ["Ô tô hạng B", "NEED_CAR_B"],
    ["Mô tô A1", "NEED_MOTO_A1"],
    ["Tải/dịch vụ", "NEED_TRUCK"],
    ["Nâng hạng", "NEED_UPGRADE"]
  ],
  courseMenu: [
    ["Học phí", "ASK_COST"],
    ["Hồ sơ", "ASK_DOSSIER"],
    ["Đăng ký ngay", "REGISTER_NOW"]
  ],
  registerMenu: [
    ["Gửi số điện thoại", "REGISTER_NOW"],
    ["Gặp tư vấn viên", "TALK_TO_STAFF"]
  ]
};

function createDefaultSession(psid) {
  return {
    psid,
    course: "",
    need: "",
    area: "",
    schedule: "",
    phone: "",
    name: "",
    awaiting: ""
  };
}

function getSession(psid, initialSession = null) {
  if (!sessions.has(psid)) {
    sessions.set(psid, {
      ...createDefaultSession(psid),
      ...(initialSession || {}),
      psid
    });
  }

  return sessions.get(psid);
}

function normalizeText(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

function detectPhone(text = "") {
  const match = text.replace(/[^\d+]/g, "").match(/(?:\+?84|0)(?:\d){8,10}/);
  if (!match) {
    return "";
  }

  return match[0].startsWith("+84") ? `0${match[0].slice(3)}` : match[0];
}

function asQuickReplies(items) {
  return items.map(([title, payload]) => ({
    content_type: "text",
    title,
    payload
  }));
}

function textMessage(text, replies = []) {
  return {
    text,
    quickReplies: replies.length ? asQuickReplies(replies) : []
  };
}

function greeting() {
  return [
    textMessage(
      "Em chào anh/chị, em là tư vấn tuyển sinh lái xe của trung tâm. Anh/chị đang muốn học hạng bằng nào ạ?",
      quickReplies.mainMenu
    )
  ];
}

function courseIntro(courseCode) {
  const course = courses[courseCode];
  const benefits = course.benefits.map((benefit) => `- ${benefit}`).join("\n");

  return [
    textMessage(
      `Dạ với nhu cầu của anh/chị, ${course.label} ${course.audience}.\n\nLợi ích khi đăng ký:\n${benefits}`,
      quickReplies.courseMenu
    )
  ];
}

function costMessage(courseCode) {
  const course = courses[courseCode];
  const rows = course.costs
    .map(([label, amount]) => `- ${label}: ${formatCurrency(amount)}`)
    .join("\n");
  const total = formatCurrency(getCourseTotal(courseCode));

  return [
    textMessage(
      `Dạ chi phí ${course.label} hiện là:\n\n${rows}\n\nTổng cộng: ${total}.\n\nAnh/chị cho em xin số điện thoại để tư vấn viên gọi lại xác nhận lịch học gần nhất nhé.`,
      quickReplies.registerMenu
    )
  ];
}

function dossierMessage(courseCode) {
  const course = courses[courseCode];
  const rows = course.dossier.map((item) => `- ${item}`).join("\n");

  return [
    textMessage(
      `Dạ hồ sơ đăng ký ${course.label} gồm:\n\n${rows}\n\nNếu anh/chị chưa có đủ giấy tờ, trung tâm sẽ hướng dẫn từng bước để mình chuẩn bị đúng.`,
      quickReplies.registerMenu
    )
  ];
}

function askForPhone(session) {
  const courseText = session.course ? ` khóa ${courses[session.course].shortLabel}` : "";

  return [
    textMessage(
      `Em giữ suất tư vấn${courseText} cho anh/chị nhé. Anh/chị cho em xin số điện thoại, nhân viên tuyển sinh sẽ gọi lại báo lịch học, hồ sơ và cách đăng ký phù hợp nhất.`
    )
  ];
}

function askForCourseBefore(topic) {
  const question =
    topic === "cost"
      ? "Anh/chị muốn em báo học phí hạng nào ạ?"
      : "Anh/chị muốn em gửi hồ sơ đăng ký hạng nào ạ?";

  return [textMessage(question, quickReplies.mainMenu)];
}

function truckOrUpgradeResponse(type) {
  const text =
    type === "truck"
      ? "Dạ nếu anh/chị cần lái xe tải hoặc xe dịch vụ, tư vấn viên nên kiểm tra đúng nhu cầu xe, tải trọng và hạng bằng phù hợp trước khi báo hồ sơ."
      : "Dạ nếu anh/chị muốn nâng hạng bằng, tư vấn viên cần kiểm tra bằng hiện tại, thời gian có bằng và nhu cầu nâng hạng để tư vấn chính xác.";

  return [
    textMessage(
      `${text}\n\nAnh/chị cho em xin số điện thoại, bên em sẽ gọi lại tư vấn đúng trường hợp của mình.`
    )
  ];
}

function confirmation(session, phone) {
  const courseText = session.course ? courses[session.course].shortLabel : "khóa học lái xe";

  return [
    textMessage(
      `Em đã ghi nhận số ${phone} cho ${courseText}. Trong hôm nay tư vấn viên sẽ gọi lại để xác nhận lịch học và hướng dẫn hồ sơ.\n\nAnh/chị muốn học gần khu vực nào để em ghi chú trước ạ?`
    )
  ];
}

function resolveIntent(text, payload, session) {
  if (payload) {
    return payload;
  }

  const normalized = normalizeText(text);
  if (!normalized) {
    return "GREETING";
  }

  if (detectPhone(text)) {
    return "PHONE";
  }

  if (/(^|\s)(xin chao|chao|hello|hi|start)(\s|$)/.test(normalized)) {
    return "GREETING";
  }

  if (normalized.includes("oto") || normalized.includes("o to") || normalized.includes("hang b") || normalized.includes("b2")) {
    return "NEED_CAR_B";
  }

  if (normalized.includes("a1") || normalized.includes("xe may") || normalized.includes("mo to") || normalized.includes("moto")) {
    return "NEED_MOTO_A1";
  }

  if (normalized.includes("tai") || normalized.includes("dich vu") || normalized.includes("c1") || normalized.includes("hang c")) {
    return "NEED_TRUCK";
  }

  if (normalized.includes("nang hang") || normalized.includes("doi bang")) {
    return "NEED_UPGRADE";
  }

  if (normalized.includes("hoc phi") || normalized.includes("chi phi") || normalized.includes("gia") || normalized.includes("bao nhieu")) {
    return session.course ? "ASK_COST" : "ASK_COST_NO_COURSE";
  }

  if (normalized.includes("ho so") || normalized.includes("giay to") || normalized.includes("can gi")) {
    return session.course ? "ASK_DOSSIER" : "ASK_DOSSIER_NO_COURSE";
  }

  if (normalized.includes("dang ky") || normalized.includes("goi lai") || normalized.includes("tu van") || normalized.includes("chot")) {
    return "REGISTER_NOW";
  }

  return "FALLBACK";
}

export function handleConversation({ psid, text = "", payload = "", session: storedSession = null }) {
  const session = getSession(psid, storedSession);
  if (storedSession) {
    Object.assign(session, createDefaultSession(psid), storedSession, { psid });
  }

  const phone = detectPhone(text);

  if (phone) {
    session.phone = phone;
    session.awaiting = "area";
    return {
      session,
      lead: {
        psid,
        phone,
        course: session.course,
        need: session.need,
        area: session.area,
        schedule: session.schedule,
        note: "Khách để lại số điện thoại trên Messenger"
      },
      messages: confirmation(session, phone)
    };
  }

  if (session.awaiting === "area" && text) {
    session.area = text.trim();
    session.awaiting = "";
    return {
      session,
      lead: {
        psid,
        phone: session.phone,
        course: session.course,
        need: session.need,
        area: session.area,
        schedule: session.schedule,
        note: "Khách đã cung cấp khu vực học mong muốn"
      },
      messages: [
        textMessage(
          "Dạ em đã ghi chú khu vực học cho anh/chị. Tư vấn viên sẽ gọi lại để xác nhận lịch học và hồ sơ đăng ký."
        )
      ]
    };
  }

  const intent = resolveIntent(text, payload, session);

  switch (intent) {
    case "GET_STARTED":
    case "GREETING":
      return { session, messages: greeting() };

    case "NEED_CAR_B":
      session.course = "B";
      session.need = "Học ô tô hạng B";
      return { session, messages: courseIntro("B") };

    case "NEED_MOTO_A1":
      session.course = "A1";
      session.need = "Học mô tô hạng A1";
      return { session, messages: courseIntro("A1") };

    case "NEED_TRUCK":
      session.course = "";
      session.need = "Tư vấn xe tải hoặc dịch vụ";
      return { session, messages: truckOrUpgradeResponse("truck") };

    case "NEED_UPGRADE":
      session.course = "";
      session.need = "Tư vấn nâng hạng bằng";
      return { session, messages: truckOrUpgradeResponse("upgrade") };

    case "ASK_COST":
      return { session, messages: costMessage(session.course) };

    case "ASK_DOSSIER":
      return { session, messages: dossierMessage(session.course) };

    case "ASK_COST_NO_COURSE":
      return { session, messages: askForCourseBefore("cost") };

    case "ASK_DOSSIER_NO_COURSE":
      return { session, messages: askForCourseBefore("dossier") };

    case "REGISTER_NOW":
    case "TALK_TO_STAFF":
      session.awaiting = "phone";
      return { session, messages: askForPhone(session) };

    default:
      return {
        session,
        messages: [
          textMessage(
            "Dạ để em tư vấn đúng hơn, anh/chị đang muốn học ô tô hạng B, mô tô A1, xe tải/dịch vụ hay nâng hạng bằng ạ?",
            quickReplies.mainMenu
          )
        ]
      };
  }
}
