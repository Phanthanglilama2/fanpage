import "./loadEnv.js";

export const config = {
  port: Number(process.env.PORT || 3000),
  host: process.env.HOST || "0.0.0.0",
  pageAccessToken: process.env.PAGE_ACCESS_TOKEN || "",
  verifyToken: process.env.VERIFY_TOKEN || "local_verify_token",
  graphApiVersion: process.env.GRAPH_API_VERSION || "v24.0",
  appSecret: process.env.APP_SECRET || "",
  adminToken: process.env.ADMIN_TOKEN || ""
};
