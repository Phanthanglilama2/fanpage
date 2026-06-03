import http from "node:http";
import { URL } from "node:url";
import { renderHomePage } from "./homePage.js";
import { leadsToCsv, listLeads, getLeadStorageMode } from "./leadStore.js";
import { processMetaWebhookBody, verifyWebhookChallenge } from "./metaWebhook.js";
import { config } from "./runtimeConfig.js";

function jsonResponse(res, statusCode, data) {
  const body = JSON.stringify(data);
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function textResponse(res, statusCode, text) {
  res.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Content-Length": Buffer.byteLength(text)
  });
  res.end(text);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function handleWebhookPost(req, res) {
  const rawBody = await readRequestBody(req);
  const result = await processMetaWebhookBody(rawBody, req.headers["x-hub-signature-256"]);

  if (result.contentType.startsWith("application/json")) {
    return jsonResponse(res, result.statusCode, result.body);
  }

  return textResponse(res, result.statusCode, result.body);
}

function handleWebhookVerify(url, res) {
  const result = verifyWebhookChallenge(url.searchParams);
  return textResponse(res, result.statusCode, result.body);
}

async function requestHandler(req, res) {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  try {
    if (req.method === "GET" && url.pathname === "/") {
      const html = renderHomePage({
        origin: `http://${req.headers.host}`,
        storage: getLeadStorageMode()
      });
      res.writeHead(200, {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Length": Buffer.byteLength(html)
      });
      return res.end(html);
    }

    if (req.method === "GET" && url.pathname === "/health") {
      return jsonResponse(res, 200, {
        ok: true,
        service: "fanpage-driving-school-chatbot",
        storage: getLeadStorageMode()
      });
    }

    if (req.method === "GET" && url.pathname === "/webhook") {
      return handleWebhookVerify(url, res);
    }

    if (req.method === "POST" && url.pathname === "/webhook") {
      return handleWebhookPost(req, res);
    }

    if (req.method === "GET" && url.pathname === "/leads") {
      const token = req.headers.authorization?.replace(/^Bearer\s+/i, "") || url.searchParams.get("token");
      if (config.adminToken && token !== config.adminToken) {
        return jsonResponse(res, 401, { error: "Unauthorized" });
      }

      return jsonResponse(res, 200, {
        data: await listLeads()
      });
    }

    if (req.method === "GET" && url.pathname === "/leads.csv") {
      const token = req.headers.authorization?.replace(/^Bearer\s+/i, "") || url.searchParams.get("token");
      if (config.adminToken && token !== config.adminToken) {
        return jsonResponse(res, 401, { error: "Unauthorized" });
      }

      const csv = leadsToCsv(await listLeads());
      res.writeHead(200, {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="leads.csv"',
        "Content-Length": Buffer.byteLength(csv)
      });
      return res.end(csv);
    }

    return jsonResponse(res, 404, { error: "Not found" });
  } catch (error) {
    console.error(error);
    return jsonResponse(res, 500, { error: "Internal server error" });
  }
}

const server = http.createServer(requestHandler);

server.listen(config.port, config.host, () => {
  console.log(`Fanpage chatbot webhook is running on http://${config.host}:${config.port}`);
  console.log(`Webhook URL path: /webhook`);
});
