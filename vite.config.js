/// <reference types="vitest/config" />

import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { defineConfig } from "vite";
import { runAgenticTurn } from "./server/agenticTurn.js";
import { runTutorChat } from "./server/tutorChat.js";
import { parseJsonBodyOnce } from "./server/parseJsonBodyOnce.js";
import { setDemocrazyCorsHeaders } from "./server/httpCors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadDemocrazyEnv() {
  const envPath = path.resolve(__dirname, ".env");
  const localPath = path.resolve(__dirname, ".env.local");
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
  if (existsSync(localPath)) {
    dotenv.config({ path: localPath, override: true });
  }
}

loadDemocrazyEnv();

function democrazyDevApiMiddleware() {
  return {
    name: "democrazy-dev-api",
    configureServer(server) {
      if (!String(process.env.GEMINI_API_KEY ?? "").trim()) {
        console.warn(
          `[democrazy] GEMINI_API_KEY is not set. Put it in ${path.resolve(__dirname, ".env")} (see .env.example) and restart \`npm run dev\`.`,
        );
      }

      server.middlewares.use(async (req, res, next) => {
        const pathOnly = req.url?.split("?")[0]?.replace(/\/$/, "") || "";
        if (pathOnly !== "/api/simulation/turn" && pathOnly !== "/api/assistant/chat") {
          next();
          return;
        }

        setDemocrazyCorsHeaders(res);

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

        const parsed = await parseJsonBodyOnce(req);
        if (parsed === null) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: false, error: "Expected JSON body" }));
          return;
        }

        if (pathOnly === "/api/simulation/turn") {
          const result = await runAgenticTurn(parsed);
          const statusCode = result.ok ? 200 : (result.statusCode ?? 500);
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
        const statusCode = tutor.ok ? 200 : (tutor.statusCode ?? 500);
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
    },
  };
}

export default defineConfig({
  plugins: [democrazyDevApiMiddleware()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react-dom")) return "react-dom";
          if (id.includes("react-router")) return "router";
          if (id.includes("react")) return "react-core";
          if (id.includes("firebase")) return "firebase-vendor";
          if (id.includes("@google/generative-ai")) return "gemini-sdk";
          if (id.includes("html-to-image")) return "html-to-image";
          return undefined;
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },

  test: {
    globals: false,
    environment: "node",
    setupFiles: ["./vitest.setup.js"],
    environmentMatchGlobs: [["src/**/*.test.{jsx,tsx}", "jsdom"]],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["server/**/*.js", "src/**/*.{js,jsx}"],
      exclude: ["**/*.test.*", "**/__tests__/**", "scripts/**", "src/main.jsx"],
      thresholds: {
        statements: 50,
        branches: 41,
        functions: 48,
        lines: 52,
      },
    },
  },
});
