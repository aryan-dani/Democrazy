import { Readable } from "node:stream";

import { describe, expect, it } from "vitest";

import { parseJsonBodyOnce } from "../parseJsonBodyOnce.js";

function asReq(chunks) {
  return /** @type {import('node:http').IncomingMessage} */ (Readable.from(chunks));
}

describe("parseJsonBodyOnce", () => {
  it("returns empty object when stream has no chunks", async () => {
    expect(await parseJsonBodyOnce(asReq([]))).toEqual({});
  });

  it("parses literal empty object JSON", async () => {
    expect(await parseJsonBodyOnce(asReq([Buffer.from("{}", "utf8")]))).toEqual({});
  });

  it("parses a JSON payload", async () => {
    const out = await parseJsonBodyOnce(asReq([Buffer.from('{"action":"start"}', "utf8")]));
    expect(out).toEqual({ action: "start" });
  });

  it("returns null for invalid JSON (including whitespace-only)", async () => {
    expect(await parseJsonBodyOnce(asReq([Buffer.from("{ not json", "utf8")]))).toBeNull();
    expect(await parseJsonBodyOnce(asReq([Buffer.from("   \n\t", "utf8")]))).toBeNull();
  });
});
