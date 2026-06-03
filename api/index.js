import { renderHomePage } from "../src/homePage.js";
import { getLeadStorageMode } from "../src/leadStore.js";

export function GET(request) {
  const url = new URL(request.url);

  return new Response(
    renderHomePage({
      origin: url.origin,
      storage: getLeadStorageMode()
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8"
      }
    }
  );
}
