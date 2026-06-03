import crypto from "node:crypto";
import { handleConversation } from "./conversationEngine.js";
import { upsertLead } from "./leadStore.js";
import { sendMessages } from "./messenger.js";
import { config } from "./runtimeConfig.js";
import { getStoredSession, saveStoredSession } from "./sessionStore.js";

export function verifyMetaSignature(rawBody, signatureHeader) {
  if (!config.appSecret) {
    return true;
  }

  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const expected = `sha256=${crypto
    .createHmac("sha256", config.appSecret)
    .update(rawBody)
    .digest("hex")}`;

  const actualBuffer = Buffer.from(signatureHeader);
  const expectedBuffer = Buffer.from(expected);

  return actualBuffer.length === expectedBuffer.length && crypto.timingSafeEqual(actualBuffer, expectedBuffer);
}

function getMessageText(event) {
  return event.message?.text || "";
}

function getPayload(event) {
  return event.message?.quick_reply?.payload || event.postback?.payload || "";
}

async function handleMessagingEvent(event) {
  const psid = event.sender?.id;

  if (!psid || event.message?.is_echo || event.delivery || event.read) {
    return;
  }

  let storedSession = null;
  try {
    storedSession = await getStoredSession(psid);
  } catch (error) {
    console.error("Session loading failed:", error);
  }

  const { messages, lead, session } = handleConversation({
    psid,
    text: getMessageText(event),
    payload: getPayload(event),
    session: storedSession
  });

  try {
    await saveStoredSession(session);
  } catch (error) {
    console.error("Session storage failed:", error);
  }

  if (lead) {
    try {
      await upsertLead(lead);
    } catch (error) {
      console.error("Lead storage failed:", error);
    }
  }

  await sendMessages(psid, messages);
}

export function verifyWebhookChallenge(searchParams) {
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === config.verifyToken) {
    return {
      statusCode: 200,
      body: challenge || "",
      contentType: "text/plain; charset=utf-8"
    };
  }

  return {
    statusCode: 403,
    body: "Forbidden",
    contentType: "text/plain; charset=utf-8"
  };
}

export async function processMetaWebhookBody(rawBody, signatureHeader) {
  if (!verifyMetaSignature(rawBody, signatureHeader)) {
    return {
      statusCode: 403,
      body: { error: "Invalid Meta signature" },
      contentType: "application/json; charset=utf-8"
    };
  }

  let body;
  try {
    body = JSON.parse(Buffer.isBuffer(rawBody) ? rawBody.toString("utf8") : rawBody);
  } catch {
    return {
      statusCode: 400,
      body: { error: "Invalid JSON body" },
      contentType: "application/json; charset=utf-8"
    };
  }

  if (body.object !== "page") {
    return {
      statusCode: 404,
      body: { error: "Unsupported webhook object" },
      contentType: "application/json; charset=utf-8"
    };
  }

  for (const entry of body.entry || []) {
    for (const event of entry.messaging || []) {
      await handleMessagingEvent(event);
    }
  }

  return {
    statusCode: 200,
    body: "EVENT_RECEIVED",
    contentType: "text/plain; charset=utf-8"
  };
}
