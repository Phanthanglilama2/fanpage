import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import "./loadEnv.js";

const dataDir = path.resolve("data");
const leadsJsonPath = path.join(dataDir, "leads.json");
const leadsCsvPath = path.join(dataDir, "leads.csv");

const leadHeaders = [
  "createdAt",
  "updatedAt",
  "source",
  "status",
  "name",
  "phone",
  "course",
  "need",
  "area",
  "schedule",
  "psid",
  "note"
];

function getKvConfig() {
  return {
    url: (process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "").replace(/\/$/, ""),
    token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "",
    key: process.env.LEADS_STORAGE_KEY || "fanpage-driving-school-leads"
  };
}

function hasKvStorage() {
  const { url, token } = getKvConfig();
  return Boolean(url && token);
}

async function ensureDataDir() {
  await mkdir(dataDir, { recursive: true });
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

async function readLeads() {
  if (hasKvStorage()) {
    const storedValue = await kvCommand(["GET", getKvConfig().key]);
    if (!storedValue) {
      return [];
    }

    if (Array.isArray(storedValue)) {
      return storedValue;
    }

    return JSON.parse(storedValue);
  }

  try {
    const content = await readFile(leadsJsonPath, "utf8");
    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

function csvEscape(value) {
  const text = value === undefined || value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export function leadsToCsv(leads) {
  const csvRows = [
    leadHeaders.join(","),
    ...leads.map((lead) => leadHeaders.map((header) => csvEscape(lead[header])).join(","))
  ];

  return `${csvRows.join("\n")}\n`;
}

async function writeLeads(leads) {
  if (hasKvStorage()) {
    await kvCommand(["SET", getKvConfig().key, JSON.stringify(leads)]);
    return;
  }

  await ensureDataDir();
  await writeFile(leadsJsonPath, `${JSON.stringify(leads, null, 2)}\n`, "utf8");
  await writeFile(leadsCsvPath, leadsToCsv(leads), "utf8");
}

export async function upsertLead(leadInput) {
  const leads = await readLeads();
  const now = new Date().toISOString();
  const existingIndex = leads.findIndex((lead) => {
    if (leadInput.phone && lead.phone === leadInput.phone) {
      return true;
    }
    return leadInput.psid && lead.psid === leadInput.psid;
  });

  const normalizedLead = {
    source: "Fanpage Messenger",
    status: "Mới - cần gọi lại",
    name: "",
    phone: "",
    course: "",
    need: "",
    area: "",
    schedule: "",
    psid: "",
    note: "",
    ...leadInput,
    updatedAt: now
  };

  if (existingIndex >= 0) {
    leads[existingIndex] = {
      ...leads[existingIndex],
      ...normalizedLead,
      createdAt: leads[existingIndex].createdAt || now
    };
  } else {
    leads.push({
      createdAt: now,
      ...normalizedLead
    });
  }

  await writeLeads(leads);
  return existingIndex >= 0 ? leads[existingIndex] : leads.at(-1);
}

export async function listLeads() {
  return readLeads();
}

export function getLeadStorageMode() {
  return hasKvStorage() ? "upstash-redis" : "local-file";
}
