import { useEffect, useRef } from "react";

import { isFirebaseConfigured, loadFirebaseApp } from "../firebase.js";
import { useAuth } from "../context/AuthContext";
import { useProgress } from "../hooks/useProgress.js";

/**
 * One-time pull + debounced push of progress for signed-in learners.
 */
export default function FirestoreProgressBridge() {
  const { user } = useAuth();
  const { progress, mergeRemotePayload } = useProgress();
  const pulledForUid = useRef("");

  useEffect(() => {
    if (!isFirebaseConfigured() || !user?.uid) {
      pulledForUid.current = "";
      return undefined;
    }

    let cancelled = false;

    (async () => {
      const app = await loadFirebaseApp();
      if (!app || cancelled) return;

      const { doc, getDoc, getFirestore } = await import("firebase/firestore");
      const db = getFirestore(app);
      const ref = doc(db, "users", user.uid, "democrazy", "progress");

      if (pulledForUid.current === user.uid) return;
      pulledForUid.current = user.uid;
      const snap = await getDoc(ref);
      if (cancelled || !snap.exists()) return;
      const data = snap.data();
      mergeRemotePayload(data);
    })();

    return () => {
      cancelled = true;
    };
  }, [user?.uid, mergeRemotePayload]);

  useEffect(() => {
    if (!isFirebaseConfigured() || !user?.uid) return undefined;

    const timer = window.setTimeout(() => {
      (async () => {
        try {
          const app = await loadFirebaseApp();
          if (!app) return;
          const { doc, getFirestore, setDoc } = await import("firebase/firestore");
          const db = getFirestore(app);
          const ref = doc(db, "users", user.uid, "democrazy", "progress");
          await setDoc(ref, { ...progress }, { merge: true });
        } catch {
          /* noop */
        }
      })();
    }, 900);

    return () => window.clearTimeout(timer);
  }, [progress, user?.uid]);

  return null;
}
