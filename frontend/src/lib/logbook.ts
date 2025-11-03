// src/lib/logbook.ts
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { getAuth } from "firebase/auth";

export type RouteRecord = {
  id?: string;
  uid: string;
  imageUrl: string;
  difficulty: string; // e.g., "V3"
  date: string;       // yyyy-mm-dd（用于你已有的 toRelativeLabel 转换）
  location: string;
  rating: number;
  notes: string;
  createdAt?: any;
};

async function uploadPhoto(file: File, uid: string) {
  const id = crypto.randomUUID();
  const path = `logbook/${uid}/${id}-${file.name}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
}

export async function saveRouteToFirestore(data: {
  file?: File | null;
  difficulty: string;
  date: string;       // "2025-11-03"
  location: string;
  rating: number;
  notes: string;
}) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Not logged in");

  let imageUrl = "";
  if (data.file) {
    imageUrl = await uploadPhoto(data.file, user.uid);
  }

  await addDoc(collection(db, "logbook"), {
    uid: user.uid,
    imageUrl,
    difficulty: data.difficulty,
    date: data.date,
    location: data.location,
    rating: data.rating,
    notes: data.notes,
    createdAt: serverTimestamp(),
  });
}

export function listenRoutesForUser(cb: (routes: RouteRecord[]) => void) {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const q = query(
    collection(db, "logbook"),
    where("uid", "==", user.uid),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, (snap) => {
    const arr: RouteRecord[] = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));
    cb(arr);
  });
}
