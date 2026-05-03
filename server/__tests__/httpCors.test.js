import { describe, expect, it, afterEach } from "vitest";

import { setDemocrazyCorsHeaders } from "../httpCors.js";

describe("setDemocrazyCorsHeaders", () => {
  afterEach(() => {
    delete process.env.DEMOCRAZY_CORS_ORIGIN;
  });

  it("reflects DEMOCRAZY_CORS_ORIGIN when set", () => {
    process.env.DEMOCRAZY_CORS_ORIGIN = "https://app.example";
    /** @type {Record<string,string>} */
    const headers = {};
    const res = {
      setHeader(/** @type {string} */ k, /** @type {string} */ v) {
        headers[k] = v;
      },
    };
    setDemocrazyCorsHeaders(/** @type {import('node:http').ServerResponse} */ (res));
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://app.example");
    expect(headers["Access-Control-Allow-Methods"]).toBe("POST, OPTIONS");
  });

  it("falls back to * when DEMOCRAZY_CORS_ORIGIN is unset", () => {
    const headers = {};
    const res = {
      setHeader(/** @type {string} */ k, /** @type {string} */ v) {
        headers[k] = v;
      },
    };
    setDemocrazyCorsHeaders(/** @type {import('node:http').ServerResponse} */ (res));
    expect(headers["Access-Control-Allow-Origin"]).toBe("*");
  });
});
