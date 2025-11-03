// src/lib/logbook.ts
import { auth, db, storage } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export interface RouteRecord {
  id?: string;
  uid?: string;
  imageUrl?: string;
  difficulty: string;        // e.g. "V3"
  date: string;              // ISO "YYYY-MM-DD"
  location: string;
  rating: number;
  notes: string;
  createdAt?: any;
}

export async function saveRouteToFirestore(input: {
  file?: File | null;
  difficulty: string;
  date: string;        // ISO
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

  const col = collection(db, "logbook"); // 顶层集合
  await addDoc(col, {
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

export function listenRoutesForUser(cb: (rows: RouteRecord[]) => void) {
  const user = auth.currentUser;
  if (!user) return () => {};

  const col = collection(db, "logbook");
  const q = query(
    col,
    where("uid", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(
    q,
    (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })) as RouteRecord[];
      cb(rows);
    },
    (err) => console.error("onSnapshot error:", err)
  );
}
