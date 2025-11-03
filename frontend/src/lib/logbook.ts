// src/lib/logbook.ts
import { auth, db, storage } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface RouteRecord {
  id?: string;
  uid?: string;
  imageUrl?: string;
  difficulty: string; // e.g. "V3"
  date: string;       // ISO: "YYYY-MM-DD"
  location: string;
  rating: number;
  notes: string;
  createdAt?: any;    // Firestore Timestamp
}

export async function saveRouteToFirestore(input: {
  file?: File | null;
  difficulty: string;
  date: string;      // ISO
  location: string;
  rating: number;
  notes: string;
}) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  let imageUrl = "";
  if (input.file) {
    const fileRef = ref(storage, `routes/${user.uid}/${Date.now()}_${input.file.name}`);
    await uploadBytes(fileRef, input.file);
    imageUrl = await getDownloadURL(fileRef);
  }

  await addDoc(collection(db, "logbook"), {
    uid: user.uid,
    imageUrl,
    difficulty: input.difficulty,
    date: input.date,
    location: input.location,
    rating: input.rating,
    notes: input.notes,
    createdAt: serverTimestamp(),
  });
}

/**
 * 传入 userId，避免依赖 auth.currentUser 的竞态。
 * 不用 orderBy，客户端自己按 createdAt desc 排序，避免索引问题。
 */
export function listenRoutesForUser(
  userId: string,
  cb: (rows: RouteRecord[]) => void
) {
  const q1 = query(collection(db, "logbook"), where("uid", "==", userId));

  return onSnapshot(
    q1,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as RouteRecord[];
      rows.sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() ?? 0;
        const tb = b.createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
      cb(rows);
    },
    (err) => {
      console.error("onSnapshot error:", err);
      cb([]); // 失败时返回空，界面可回退 demo
    }
  );
}
