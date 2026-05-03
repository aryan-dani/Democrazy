/** @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, act } from "@testing-library/react";
import * as firebaseMod from "../firebase.js";

import * as AuthContextMod from "../context/AuthContext.jsx";
import * as useProgressMod from "../hooks/useProgress.js";
import FirestoreProgressBridge from "./FirestoreProgressBridge.jsx";

vi.mock("../firebase.js", () => ({
  isFirebaseConfigured: vi.fn(),
  loadFirebaseApp: vi.fn(),
}));

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../hooks/useProgress.js", () => ({
  useProgress: vi.fn(),
}));

const mockGetDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockDoc = vi.fn();
const mockGetFirestore = vi.fn();

vi.mock("firebase/firestore", () => ({
  getDoc: (...args) => mockGetDoc(...args),
  setDoc: (...args) => mockSetDoc(...args),
  doc: (...args) => mockDoc(...args),
  getFirestore: (...args) => mockGetFirestore(...args),
}));

describe("FirestoreProgressBridge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    firebaseMod.isFirebaseConfigured.mockReturnValue(true);
    AuthContextMod.useAuth.mockReturnValue({ user: { uid: "user123" } });
    useProgressMod.useProgress.mockReturnValue({
      progress: { score: 10 },
      mergeRemotePayload: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  const flush = async () =>
    act(async () => {
      await Promise.resolve();
    });

  it("mounts silently when firebase is unavailable", () => {
    firebaseMod.isFirebaseConfigured.mockReturnValue(false);
    const { container } = render(<FirestoreProgressBridge />);
    expect(container.firstChild).toBeNull();
  });

  it("does not fetch if user is not authenticated", () => {
    AuthContextMod.useAuth.mockReturnValue({ user: null });
    render(<FirestoreProgressBridge />);
    expect(firebaseMod.loadFirebaseApp).not.toHaveBeenCalled();
  });

  it("fetches progress once on mount for authenticated user", async () => {
    firebaseMod.loadFirebaseApp.mockResolvedValue({});
    mockGetFirestore.mockReturnValue({});
    mockDoc.mockReturnValue("mock-ref");

    const mockMerge = vi.fn();
    useProgressMod.useProgress.mockReturnValue({
      progress: { score: 10 },
      mergeRemotePayload: mockMerge,
    });

    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ remoteScore: 20 }),
    });

    render(<FirestoreProgressBridge />);

    await flush();

    expect(mockGetDoc).toHaveBeenCalledWith("mock-ref");
    expect(mockMerge).toHaveBeenCalledWith({ remoteScore: 20 });
  });

  it("debounces and saves progress when it changes", async () => {
    firebaseMod.loadFirebaseApp.mockResolvedValue({});
    mockGetFirestore.mockReturnValue({});
    mockDoc.mockReturnValue("mock-ref");
    mockGetDoc.mockResolvedValue({
      exists: () => false,
    });
    mockSetDoc.mockResolvedValue();

    const { rerender } = render(<FirestoreProgressBridge />);
    await flush();

    useProgressMod.useProgress.mockReturnValue({
      progress: { score: 30 },
      mergeRemotePayload: vi.fn(),
    });
    rerender(<FirestoreProgressBridge />);

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(mockSetDoc).toHaveBeenCalledWith("mock-ref", { score: 30 }, { merge: true });
  });
});
