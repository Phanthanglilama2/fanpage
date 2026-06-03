import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import "./loadEnv.js";

const dataDir = path.resolve("data");
const sessionsJsonPath = path.join(dataDir, "sessions.json");

function getKvConfig() {
  return {
    url: (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, ""),
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "",
    key: process.env.SESSIONS_STORAGE_KEY || "fanpage-driving-school-sessions"
  };
}

function hasKvStorage() {
  const { url, token } = getKvConfig();
  return Boolean(url && token);
}

async function kvCommand(command) {
  const { url, token } = getKvConfig();
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Upstash Redis command failed with ${response.status}: ${text}`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(`Upstash Redis command failed: ${data.error}`);
  }

  return data.result;
}

async function readSessions() {
  if (hasKvStorage()) {
    const storedValue = await kvCommand(["GET", getKvConfig().key]);
    if (!storedValue) {
      return {};
    }

    return typeof storedValue === "string" ? JSON.parse(storedValue) : storedValue;
  }

  try {
    const content = await readFile(sessionsJsonPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }
    throw error;
  }
}

async function writeSessions(sessions) {
  if (hasKvStorage()) {
    await kvCommand(["SET", getKvConfig().key, JSON.stringify(sessions)]);
    return;
  }

  await mkdir(dataDir, { recursive: true });
  await writeFile(sessionsJsonPath, `${JSON.stringify(sessions, null, 2)}\n`, "utf8");
}

export async function getStoredSession(psid) {
  const sessions = await readSessions();
  return sessions[psid] || null;
}

export async function saveStoredSession(session) {
  if (!session?.psid) {
    return;
  }

  const sessions = await readSessions();
  sessions[session.psid] = {
    ...session,
    updatedAt: new Date().toISOString()
  };
  await writeSessions(sessions);
}
