import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({ name: "[DEFAULT]" })),
  getApps: vi.fn(() => []),
}));

describe("firebase.js", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("isFirebaseConfigured returns true when env vars are set", async () => {
    vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-id");

    const { isFirebaseConfigured } = await import("../firebase.js");
    expect(isFirebaseConfigured()).toBe(true);

    vi.unstubAllEnvs();
  });

  it("isFirebaseConfigured returns false when env vars are missing", async () => {
    vi.stubEnv("VITE_FIREBASE_API_KEY", "");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "");

    const { isFirebaseConfigured } = await import("../firebase.js");
    expect(isFirebaseConfigured()).toBe(false);

    vi.unstubAllEnvs();
  });

  it("loadFirebaseApp returns null if not configured", async () => {
    vi.stubEnv("VITE_FIREBASE_API_KEY", "");
    const { loadFirebaseApp } = await import("../firebase.js");

    const app = await loadFirebaseApp();
    expect(app).toBeNull();
    vi.unstubAllEnvs();
  });

  it("loadFirebaseApp initializes app if configured", async () => {
    vi.stubEnv("VITE_FIREBASE_API_KEY", "test-key");
    vi.stubEnv("VITE_FIREBASE_PROJECT_ID", "test-id");

    const { loadFirebaseApp } = await import("../firebase.js");
    const app = await loadFirebaseApp();
    expect(app).toEqual({ name: "[DEFAULT]" });

    // Call again to test caching
    const app2 = await loadFirebaseApp();
    expect(app2).toEqual({ name: "[DEFAULT]" });
    vi.unstubAllEnvs();
  });
});
