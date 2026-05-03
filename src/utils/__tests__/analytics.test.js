/** @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

describe("trackEvent", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("VITE_GA_MEASUREMENT_ID", "G-TEST");
    document.head.innerHTML = "";
    delete window.dataLayer;
    delete window.gtag;
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
  });

  it("injects gtag script once and forwards events", async () => {
    const { trackEvent } = await import("../analytics.js");
    trackEvent("quiz_complete", { score: 1 });

    expect(document.head.querySelector("script[src*='googletagmanager']")).toBeTruthy();
    expect(typeof window.gtag).toBe("function");
    expect(window.dataLayer.length).toBeGreaterThan(0);

    const scripts = document.head.querySelectorAll("script[src*='googletagmanager']");
    expect(scripts.length).toBe(1);

    trackEvent("second", {});
    expect(document.head.querySelectorAll("script[src*='googletagmanager']").length).toBe(1);
  });
});
