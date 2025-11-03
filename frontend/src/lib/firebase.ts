// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// -------------------------
// 🔧 初始化 Firebase 应用
// -------------------------
const app = initializeApp({
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FB_STORAGE_BUCKET, // ✅ 必须加，否则报 no-default-bucket
});

// -------------------------
// 🔐 Auth（Google 登录）
// -------------------------
export const auth = getAuth(app);
auth.useDeviceLanguage();
export const provider = new GoogleAuthProvider();

export async function googleSignIn(): Promise<void> {
  try {
    await signInWithPopup(auth, provider);
  } catch (err: any) {
    // 浏览器拦截弹窗时，使用重定向登录
    if (err?.code === "auth/popup-blocked" || err?.code === "auth/popup-closed-by-user") {
      await signInWithRedirect(auth, provider);
    } else {
      throw err;
    }
  }
}

export function onAuth(cb: (user: import("firebase/auth").User | null) => void) {
  return onAuthStateChanged(auth, cb);
}

export async function googleSignOut() {
  await signOut(auth);
}

export async function getIdToken() {
  return await auth.currentUser?.getIdToken();
}

// -------------------------
// 📦 Firestore & Storage
// -------------------------
export const db = getFirestore(app);
export const storage = getStorage(app);
