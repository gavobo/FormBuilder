// api/form-expert.js — Vercel Serverless Function (keys inline for quick testing)
const VS_API_KEY     = "sk_92kg3GvkpbYvS4X4OylSvGvmWOEXxwylE4T4FJrV9MTc9WTP";
const VS_PIPELINE_ID = "691191d7f8402a98f81cbc17";
const INPUT_KEY      = "input_0"; // exact name of your Input node in VS
const VS_FORM_URL    = `https://api.vectorshift.ai/v1/pipeline/${VS_PIPELINE_ID}/run`;
const CORS_ORIGIN    = "*";

const stripFences = (s) => String(s || "").replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();

function sendCORS(res) {
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "content-type, authorization");
}

module.exports = async (req, res) => {
  sendCORS(res);

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST")    return res.status(405).json({ error: "Method not allowed" });
  if (!VS_API_KEY || !VS_PIPELINE_ID) return res.status(500).json({ error: "Missing VS creds/URL" });

  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "Invalid JSON body" }); }
  }
  const text = String(body?.text || "").trim();
  if (!text) return res.status(400).json({ error: 'Missing or invalid "text".' });

  const payload = { inputs: { [INPUT_KEY]: text } };

  try {
    const r = await fetch(VS_FORM_URL, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${VS_API_KEY}` },
      body: JSON.stringify(payload)
    });

    const raw = await r.text();

    if (!r.ok) {
      return res.status(r.status).json({ error: "VectorShift error", details: raw });
    }

    const t = stripFences(raw);
    try {
      const json = JSON.parse(t);
      res.setHeader("x-input-key-used", INPUT_KEY);
      return res.status(200).json(json);
    } catch {
      return res.status(502).json({ error: "Invalid JSON from VS", details: raw.slice(0, 3000) });
    }
  } catch (err) {
    return res.status(500).json({ error: err?.message || "Unexpected server error" });
  }
};
