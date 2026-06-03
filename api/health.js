import { getLeadStorageMode } from "../src/leadStore.js";

export function GET() {
  return Response.json({
    ok: true,
    service: "fanpage-driving-school-chatbot",
    platform: "vercel",
    storage: getLeadStorageMode()
  });
}
