import { useEffect, useRef } from "react";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";

import { firebaseApp, firebaseReady } from "../firebase.js";
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
    if (!firebaseReady || !firebaseApp || !user?.uid) {
      pulledForUid.current = "";
      return undefined;
    }

    const db = getFirestore(firebaseApp);
    const ref = doc(db, "users", user.uid, "democrazy", "progress");

    let cancelled = false;

    (async () => {
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
    if (!firebaseReady || !firebaseApp || !user?.uid) return undefined;
    const db = getFirestore(firebaseApp);
    const ref = doc(db, "users", user.uid, "democrazy", "progress");

    const timer = window.setTimeout(async () => {
      try {
        await setDoc(ref, { ...progress }, { merge: true });
      } catch {
        /* noop */
      }
    }, 900);

    return () => window.clearTimeout(timer);
  }, [progress, user?.uid]);

  return null;
}
