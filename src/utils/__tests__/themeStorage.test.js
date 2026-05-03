/** @vitest-environment jsdom */

import { describe, it, expect, beforeEach } from "vitest";
import { getStoredTheme, setStoredTheme, initThemeDocument } from "../themeStorage.js";

const KEY = "democrazy_theme";

describe("themeStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
  });

  it("defaults to light", () => {
    expect(getStoredTheme()).toBe("light");
  });

  it("persists and applies theme", () => {
    setStoredTheme("light");
    expect(localStorage.getItem(KEY)).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("initThemeDocument reads storage", () => {
    localStorage.setItem(KEY, "light");
    const t = initThemeDocument();
    expect(t).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
