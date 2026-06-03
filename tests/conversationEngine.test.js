import test from "node:test";
import assert from "node:assert/strict";
import { handleConversation } from "../src/conversationEngine.js";

test("starts with main menu quick replies", () => {
  const result = handleConversation({ psid: "test-user-1", text: "Xin chào" });

  assert.match(result.messages[0].text, /muốn học hạng bằng nào/);
  assert.equal(result.messages[0].quickReplies.length, 4);
});

test("advises hạng B and returns cost", () => {
  handleConversation({ psid: "test-user-2", payload: "NEED_CAR_B" });
  const result = handleConversation({ psid: "test-user-2", text: "học phí bao nhiêu" });

  assert.match(result.messages[0].text, /19\.150\.000đ/);
  assert.match(result.messages[0].text, /Học phí: 16\.635\.000đ/);
});

test("advises A1 dossier", () => {
  handleConversation({ psid: "test-user-3", payload: "NEED_MOTO_A1" });
  const result = handleConversation({ psid: "test-user-3", text: "hồ sơ cần gì" });

  assert.match(result.messages[0].text, /mô tô hạng A1/);
  assert.match(result.messages[0].text, /2 hình 3x4/);
});

test("captures phone and creates lead payload", () => {
  handleConversation({ psid: "test-user-4", payload: "NEED_CAR_B" });
  const result = handleConversation({ psid: "test-user-4", text: "SĐT của tôi 0912345678" });

  assert.equal(result.lead.phone, "0912345678");
  assert.equal(result.lead.course, "B");
  assert.match(result.messages[0].text, /đã ghi nhận/);
});
