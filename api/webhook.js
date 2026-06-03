import { processMetaWebhookBody, verifyWebhookChallenge } from "../src/metaWebhook.js";

function toResponse(result) {
  if (result.contentType.startsWith("application/json")) {
    return new Response(JSON.stringify(result.body), {
      status: result.statusCode,
      headers: {
        "Content-Type": result.contentType
      }
    });
  }

  return new Response(result.body, {
    status: result.statusCode,
    headers: {
      "Content-Type": result.contentType
    }
  });
}

export function GET(request) {
  const url = new URL(request.url);
  return toResponse(verifyWebhookChallenge(url.searchParams));
}

export async function POST(request) {
  const rawBody = await request.text();
  return toResponse(await processMetaWebhookBody(rawBody, request.headers.get("x-hub-signature-256")));
}
