import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { isFirebaseConfigured, loadFirebaseApp } from "../firebase.js";

const FB_SYNC_HINT_KEY = "democrazy_fb_sync_hint";

function readFbSyncHint() {
  try {
    return localStorage.getItem(FB_SYNC_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function writeFbSyncHint() {
  try {
    localStorage.setItem(FB_SYNC_HINT_KEY, "1");
  } catch {
    /* ignore */
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const authEnabled = isFirebaseConfigured();
  const [listenerPrimed, setListenerPrimed] = useState(readFbSyncHint);
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(() => authEnabled && readFbSyncHint());

  useEffect(() => {
    if (!authEnabled || !listenerPrimed) {
      setBusy(false);
      return undefined;
    }

    let unsub = () => {};

    loadFirebaseApp()
      .then((app) => {
        if (!app) {
          setBusy(false);
          return undefined;
        }
        return import("firebase/auth").then(({ getAuth, onAuthStateChanged }) => {
          const auth = getAuth(app);
          unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setBusy(false);
          });
          return undefined;
        });
      })
      .catch(() => {
        setBusy(false);
      });

    return () => {
      unsub();
    };
  }, [authEnabled, listenerPrimed]);

  const signInGoogle = useCallback(async () => {
    writeFbSyncHint();
    setListenerPrimed(true);

    const app = await loadFirebaseApp();
    if (!app) return;
    const { getAuth, GoogleAuthProvider, signInWithPopup } = await import("firebase/auth");
    const auth = getAuth(app);
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const signOutUser = useCallback(async () => {
    const app = await loadFirebaseApp();
    if (!app) return;
    const { getAuth, signOut } = await import("firebase/auth");
    await signOut(getAuth(app));
  }, []);

  const value = useMemo(
    () => ({
      user,
      busy,
      signInGoogle,
      signOutUser,
      authEnabled,
    }),
    [user, busy, signInGoogle, signOutUser, authEnabled],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  return (
    ctx ?? {
      user: null,
      busy: false,
      signInGoogle: async () => {},
      signOutUser: async () => {},
      authEnabled: false,
    }
  );
}
