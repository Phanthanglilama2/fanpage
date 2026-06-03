import { config } from "./runtimeConfig.js";

function toMessengerMessage(message) {
  const messengerMessage = { text: message.text };

  if (message.quickReplies?.length) {
    messengerMessage.quick_replies = message.quickReplies;
  }

  return messengerMessage;
}

async function callSendApi(psid, message) {
  if (!config.pageAccessToken || config.pageAccessToken === "your_page_access_token") {
    console.log("[dev] Messenger response skipped because PAGE_ACCESS_TOKEN is not configured:", {
      psid,
      message
    });
    return;
  }

  const url = new URL(`https://graph.facebook.com/${config.graphApiVersion}/me/messages`);
  url.searchParams.set("access_token", config.pageAccessToken);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      recipient: { id: psid },
      messaging_type: "RESPONSE",
      message: toMessengerMessage(message)
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Send API failed with ${response.status}: ${errorText}`);
  }
}

export async function sendMessages(psid, messages) {
  for (const message of messages) {
    await callSendApi(psid, message);
  }
}
