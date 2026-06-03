import { leadsToCsv, listLeads } from "../src/leadStore.js";
import { config } from "../src/runtimeConfig.js";

function getToken(request) {
  const url = new URL(request.url);
  const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return bearer || url.searchParams.get("token");
}

export async function GET(request) {
  if (config.adminToken && getToken(request) !== config.adminToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return new Response(leadsToCsv(await listLeads()), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="leads.csv"'
    }
  });
}
