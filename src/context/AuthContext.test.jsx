/** @vitest-environment jsdom */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useAuth, AuthProvider } from "../context/AuthContext.jsx";
import * as firebaseMod from "../firebase.js";

vi.mock("../firebase.js", () => ({
  isFirebaseConfigured: vi.fn(),
  loadFirebaseApp: vi.fn(),
}));

const mockOnAuthStateChanged = vi.fn();
const mockSignInWithPopup = vi.fn();
const mockSignOut = vi.fn();

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({})),
  GoogleAuthProvider: class {},
  onAuthStateChanged: (...args) => mockOnAuthStateChanged(...args),
  signInWithPopup: (...args) => mockSignInWithPopup(...args),
  signOut: (...args) => mockSignOut(...args),
}));

function Consumer() {
  const { authEnabled, busy, user, signInGoogle, signOutUser } = useAuth();
  return (
    <div>
      <span data-testid="enabled">{authEnabled ? "yes" : "no"}</span>
      <span data-testid="busy">{busy ? "yes" : "no"}</span>
      <span data-testid="user">{user ? user.uid : "none"}</span>
      <button onClick={signInGoogle}>Sign In</button>
      <button onClick={signOutUser}>Sign Out</button>
    </div>
  );
}

afterEach(() => cleanup());

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("useAuth returns safe defaults without provider", () => {
    render(<Consumer />);
    expect(screen.getByTestId("enabled")).toHaveTextContent("no");
  });

  it("handles Firebase not configured", () => {
    firebaseMod.isFirebaseConfigured.mockReturnValue(false);
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("enabled")).toHaveTextContent("no");
    expect(screen.getByTestId("busy")).toHaveTextContent("no");
    expect(screen.getByTestId("user")).toHaveTextContent("none");
  });

  it("handles Firebase configured but no sync hint", () => {
    firebaseMod.isFirebaseConfigured.mockReturnValue(true);
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );
    expect(screen.getByTestId("enabled")).toHaveTextContent("yes");
    expect(screen.getByTestId("busy")).toHaveTextContent("no");
    expect(firebaseMod.loadFirebaseApp).not.toHaveBeenCalled();
  });

  it("primes listener and loads Firebase when hint is set", async () => {
    firebaseMod.isFirebaseConfigured.mockReturnValue(true);
    localStorage.setItem("democrazy_fb_sync_hint", "1");
    firebaseMod.loadFirebaseApp.mockResolvedValue({});
    
    let triggerAuthCallback;
    mockOnAuthStateChanged.mockImplementation((auth, cb) => {
      triggerAuthCallback = cb;
      return vi.fn(); // unsub
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("enabled")).toHaveTextContent("yes");
    expect(screen.getByTestId("busy")).toHaveTextContent("yes"); // Initially busy while loading

    await waitFor(() => {
      expect(firebaseMod.loadFirebaseApp).toHaveBeenCalled();
      expect(mockOnAuthStateChanged).toHaveBeenCalled();
    });

    triggerAuthCallback({ uid: "user123" });

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("user123");
      expect(screen.getByTestId("busy")).toHaveTextContent("no");
    });
  });

  it("handles signInGoogle by setting hint, priming listener, and calling popup", async () => {
    firebaseMod.isFirebaseConfigured.mockReturnValue(true);
    firebaseMod.loadFirebaseApp.mockResolvedValue({});
    mockSignInWithPopup.mockResolvedValue({});

    const userObj = userEvent.setup();

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    expect(localStorage.getItem("democrazy_fb_sync_hint")).toBeNull();

    await userObj.click(screen.getByText("Sign In"));

    expect(localStorage.getItem("democrazy_fb_sync_hint")).toBe("1");
    expect(firebaseMod.loadFirebaseApp).toHaveBeenCalled();
    expect(mockSignInWithPopup).toHaveBeenCalled();
  });
  
  it("handles signOutUser", async () => {
    firebaseMod.isFirebaseConfigured.mockReturnValue(true);
    firebaseMod.loadFirebaseApp.mockResolvedValue({});
    mockSignOut.mockResolvedValue();

    const userObj = userEvent.setup();

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await userObj.click(screen.getByText("Sign Out"));

    expect(firebaseMod.loadFirebaseApp).toHaveBeenCalled();
    expect(mockSignOut).toHaveBeenCalled();
  });
});
