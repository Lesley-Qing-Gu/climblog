// npm i firebase
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FB_API_KEY,
  authDomain: import.meta.env.VITE_FB_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FB_PROJECT_ID,
});

export const auth = getAuth(app);
auth.useDeviceLanguage(); // 使用浏览器语言
const provider = new GoogleAuthProvider();

export async function googleSignIn(): Promise<void> {
  try {
    await signInWithPopup(auth, provider);
  } catch (err: any) {
    // 有些浏览器会拦截弹窗，回退到 redirect
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
