#!/usr/bin/env node
/**
 * Local dev API: POST /api/simulation/turn and POST /api/assistant/chat
 */
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";

import dotenv from "dotenv";
import http from "node:http";

import { runAgenticTurn } from "../server/agenticTurn.js";
import { runTutorChat } from "../server/tutorChat.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const envPath = path.resolve(rootDir, ".env");
const localPath = path.resolve(rootDir, ".env.local");
if (existsSync(envPath)) dotenv.config({ path: envPath });
if (existsSync(localPath)) dotenv.config({ path: localPath, override: true });

const PORT = Number(process.env.PORT || 8787);

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);
  let pathname = url.pathname.replace(/\/$/, "") || "/";

  cors(res);

  if (pathname !== "/api/simulation/turn" && pathname !== "/api/assistant/chat") {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain");
    res.end("Democrazy dev API: POST /api/simulation/turn | /api/assistant/chat\n");
    return;
  }

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: "Method Not Allowed" }));
    return;
  }

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  let parsed;
  try {
    parsed = raw ? JSON.parse(raw) : {};
  } catch {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ ok: false, error: "Expected JSON body" }));
    return;
  }

  if (pathname === "/api/simulation/turn") {
    const result = await runAgenticTurn(parsed);
    const statusCode = result.ok ? 200 : result.statusCode ?? 500;
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json");
    if (result.ok) {
      res.end(JSON.stringify({ ok: true, ...result.data }));
    } else {
      const body = { ok: false, error: result.error };
      if (result.code) body.code = result.code;
      if (typeof result.retryAfterSec === "number") body.retryAfterSec = result.retryAfterSec;
      res.end(JSON.stringify(body));
    }
    return;
  }

  const tutor = await runTutorChat(parsed);
  const statusCode = tutor.ok ? 200 : tutor.statusCode ?? 500;
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  if (tutor.ok) {
    res.end(
      JSON.stringify({
        ok: true,
        reply: tutor.reply,
        suggestedChips: tutor.suggestedChips ?? [],
      }),
    );
  } else {
    const body = { ok: false, error: tutor.error };
    if (tutor.code) body.code = tutor.code;
    if (typeof tutor.retryAfterSec === "number") body.retryAfterSec = tutor.retryAfterSec;
    res.end(JSON.stringify(body));
  }
});

server.listen(PORT, () => {
  console.log(`[democrazy] dev API http://localhost:${PORT} (simulation turn + tutor chat)`);
});
