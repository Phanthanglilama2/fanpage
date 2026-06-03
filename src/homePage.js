function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function renderHomePage({ origin = "", storage = "unknown" } = {}) {
  const baseUrl = origin || "https://ten-du-an.vercel.app";
  const webhookUrl = `${baseUrl}/webhook`;
  const healthUrl = `${baseUrl}/health`;
  const leadsUrl = `${baseUrl}/leads?token=ADMIN_TOKEN_CUA_BAN`;
  const leadsCsvUrl = `${baseUrl}/leads.csv?token=ADMIN_TOKEN_CUA_BAN`;

  return `<!doctype html>
<html lang="vi">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Chatbot tuyển sinh lái xe</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f6f8fb;
        --panel: #ffffff;
        --ink: #18202f;
        --muted: #637083;
        --line: #d9e1ec;
        --brand: #0d6efd;
        --ok: #157347;
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        font-family: Arial, Helvetica, sans-serif;
        background: var(--bg);
        color: var(--ink);
      }

      main {
        width: min(920px, calc(100% - 32px));
        margin: 0 auto;
        padding: 56px 0;
      }

      .panel {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 8px;
        padding: 28px;
        box-shadow: 0 12px 32px rgba(24, 32, 47, 0.08);
      }

      h1 {
        margin: 0 0 10px;
        font-size: 30px;
        line-height: 1.2;
        letter-spacing: 0;
      }

      p {
        margin: 0;
        color: var(--muted);
        line-height: 1.6;
      }

      .status {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 18px;
        color: var(--ok);
        font-weight: 700;
      }

      .dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: var(--ok);
      }

      .grid {
        display: grid;
        gap: 14px;
        margin-top: 26px;
      }

      .row {
        display: grid;
        grid-template-columns: 180px minmax(0, 1fr);
        gap: 12px;
        align-items: start;
        padding: 14px;
        border: 1px solid var(--line);
        border-radius: 8px;
      }

      .label {
        color: var(--muted);
        font-weight: 700;
      }

      code {
        display: block;
        width: 100%;
        overflow-wrap: anywhere;
        color: var(--ink);
        font-family: Consolas, "Courier New", monospace;
      }

      a {
        color: var(--brand);
        font-weight: 700;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      .note {
        margin-top: 22px;
        padding-top: 18px;
        border-top: 1px solid var(--line);
      }

      @media (max-width: 640px) {
        main {
          width: min(100% - 20px, 920px);
          padding: 24px 0;
        }

        .panel {
          padding: 20px;
        }

        h1 {
          font-size: 24px;
        }

        .row {
          grid-template-columns: 1fr;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <section class="panel">
        <div class="status"><span class="dot"></span>Chatbot đã sẵn sàng</div>
        <h1>Chatbot tuyển sinh lái xe cho Fanpage</h1>
        <p>Đây là trang kiểm tra nhanh cho dịch vụ webhook Messenger. Khi cấu hình Meta Developers, dùng đúng Callback URL bên dưới.</p>

        <div class="grid">
          <div class="row">
            <div class="label">Callback URL</div>
            <code>${escapeHtml(webhookUrl)}</code>
          </div>
          <div class="row">
            <div class="label">Health check</div>
            <code><a href="${escapeHtml(healthUrl)}">${escapeHtml(healthUrl)}</a></code>
          </div>
          <div class="row">
            <div class="label">Lead JSON</div>
            <code>${escapeHtml(leadsUrl)}</code>
          </div>
          <div class="row">
            <div class="label">Lead CSV</div>
            <code>${escapeHtml(leadsCsvUrl)}</code>
          </div>
          <div class="row">
            <div class="label">Storage</div>
            <code>${escapeHtml(storage)}</code>
          </div>
        </div>

        <p class="note">Nếu trang gốc hiển thị được nhưng Fanpage chưa trả lời, hãy kiểm tra Page Access Token, Verify Token, quyền Messenger và event <code>messages</code>, <code>messaging_postbacks</code> trong Meta Developers.</p>
      </section>
    </main>
  </body>
</html>`;
}
