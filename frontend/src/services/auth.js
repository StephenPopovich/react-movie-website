// frontend/src/services/auth.js
import { auth, db } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

export async function signUpWithEmail({ email, password, displayName }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);

  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }

  await ensureUserProfile(cred.user, { displayName });

  return cred.user;
}

export async function signInWithEmail({ email, password }) {
  const cred = await signInWithEmailAndPassword(auth, email, password);

  await ensureUserProfile(cred.user, { displayName: cred.user?.displayName || "" });

  return cred.user;
}

export async function signOutUser() {
  await signOut(auth);
}

export async function ensureUserProfile(user, { displayName = "" } = {}) {
  if (!user?.uid) return;

  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) return;

  await setDoc(ref, {
    uid: user.uid,
    email: user.email || "",
    displayName: displayName || user.displayName || "",
    createdAt: serverTimestamp(),
  });
}
