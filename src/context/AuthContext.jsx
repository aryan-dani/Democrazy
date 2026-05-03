import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { firebaseApp, firebaseReady } from "../firebase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(Boolean(firebaseReady));

  useEffect(() => {
    if (!firebaseReady || !firebaseApp) {
      setBusy(false);
      return undefined;
    }
    const auth = getAuth(firebaseApp);
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setBusy(false);
    });
  }, []);

  const signInGoogle = useCallback(async () => {
    if (!firebaseReady || !firebaseApp) return;
    const auth = getAuth(firebaseApp);
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  }, []);

  const signOutUser = useCallback(async () => {
    if (!firebaseReady || !firebaseApp) return;
    const auth = getAuth(firebaseApp);
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      user,
      busy,
      signInGoogle,
      signOutUser,
      authEnabled: firebaseReady,
    }),
    [user, busy, signInGoogle, signOutUser],
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
