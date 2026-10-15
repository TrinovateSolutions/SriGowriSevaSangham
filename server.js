// server.js — Google Translate using API KEY (FREE & sustainable)

const path = require("path");
const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const fs = require("fs");

const app = express();

/* ================= BASIC SECURITY ================= */
app.use(helmet());
app.use(bodyParser.json({ limit: "200kb" }));
app.use(rateLimit({ windowMs: 60 * 1000, max: 120 }));

/* ================= CONFIG ================= */
const GOOGLE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

const VISITOR_FILE = path.join(__dirname, "visitors.json");

function getVisitorCount() {
  const data = JSON.parse(fs.readFileSync(VISITOR_FILE, "utf8"));
  return data.count;
}

function increaseVisitorCount() {
  const count = getVisitorCount() + 1;

  fs.writeFileSync(
    VISITOR_FILE,
    JSON.stringify({ count: count })
  );

  return count;
}

/* ================= HEALTH ================= */
app.get("/health", (_, res) => res.json({ ok: true }));

/* ================= TRANSLATE API ================= */
app.post("/api/translate-google", async (req, res) => {
  try {
    const { texts, target } = req.body;
    if (!Array.isArray(texts) || !target) {
      return res.status(400).json({ error: "Invalid request" });
    }

    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          q: texts,
          target,
          format: "text"
        })
      }
    );

    const data = await response.json();

    if (!data.data || !data.data.translations) {
      throw new Error("Translation failed");
    }

    const translations = data.data.translations.map(t => t.translatedText);
    res.json({ translations });

  } catch (err) {
    console.error("Translate error:", err.message);
    res.status(500).json({ error: "translate_failed" });
  }
});

/* ================= VISITOR COUNTER ================= */

app.get("/api/visitors", (req, res) => {
  const count = increaseVisitorCount();

  res.json({
    visitors: count
  });
});

/* ================= FRONTEND ================= */
app.use("/src", express.static(path.join(__dirname, "src")));
app.use("/media", express.static(path.join(__dirname, "media")));

/* ================= FRONTEND ================= */
app.use("/src", express.static(path.join(__dirname, "src")));
app.use("/media", express.static(path.join(__dirname, "media")));

app.get("/", (_, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* ================= START ================= */
const PORT = 8080;
app.listen(PORT, () =>console.log(`✅ Website + Translate running on http://localhost:${PORT}`)
);
