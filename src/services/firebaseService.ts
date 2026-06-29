import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  setDoc,
  getDoc,
  db,
  auth,
  serverTimestamp,
  handleFirestoreError,
  OperationType
} from "@/firebase";
import { Artwork, ArtistInfo, ContactMessage } from "@/types";

const ARTWORKS_COLLECTION = "artworks";
const ARTIST_INFO_DOC = "artistInfo/main";
const MESSAGES_COLLECTION = "messages";

export function subscribeToArtworks(callback: (artworks: Artwork[]) => void) {
  const q = query(collection(db, ARTWORKS_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const artworks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as any)?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as Artwork[];
    callback(artworks);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, ARTWORKS_COLLECTION);
  });
}

export function subscribeToArtistInfo(callback: (info: ArtistInfo) => void) {
  return onSnapshot(doc(db, ARTIST_INFO_DOC), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as ArtistInfo);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, ARTIST_INFO_DOC);
  });
}

function cleanArtworkData(artwork: any) {
  const cleaned: any = {};
  for (const [key, value] of Object.entries(artwork)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  // If description is not present, set it to an empty string to satisfy firestore security rules
  if (cleaned.description === undefined) {
    cleaned.description = "";
  }
  return cleaned;
}

export async function addArtwork(artwork: Omit<Artwork, "id" | "createdAt">) {
  if (!auth.currentUser) throw new Error("Authentication required");
  
  try {
    const cleaned = cleanArtworkData(artwork);
    await addDoc(collection(db, ARTWORKS_COLLECTION), {
      ...cleaned,
      authorUid: auth.currentUser.uid,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, ARTWORKS_COLLECTION);
  }
}

export async function updateArtwork(id: string, artwork: Partial<Artwork>) {
  if (!auth.currentUser) throw new Error("Authentication required");

  try {
    const artworkRef = doc(db, ARTWORKS_COLLECTION, id);
    // Remove fields that shouldn't be updated manually
    const { id: _, createdAt: __, authorUid: ___, ...updateData } = artwork as any;
    const cleaned = cleanArtworkData(updateData);
    await updateDoc(artworkRef, cleaned);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${ARTWORKS_COLLECTION}/${id}`);
  }
}

export async function deleteArtwork(id: string) {
  if (!auth.currentUser) throw new Error("Authentication required");

  try {
    await deleteDoc(doc(db, ARTWORKS_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ARTWORKS_COLLECTION}/${id}`);
  }
}

export async function updateArtistInfo(info: ArtistInfo) {
  if (!auth.currentUser) throw new Error("Authentication required");

  try {
    await setDoc(doc(db, ARTIST_INFO_DOC), info);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, ARTIST_INFO_DOC);
  }
}

export async function addMessage(message: Omit<ContactMessage, "id" | "createdAt">) {
  try {
    await addDoc(collection(db, MESSAGES_COLLECTION), {
      ...message,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, MESSAGES_COLLECTION);
    throw error;
  }
}

export function subscribeToMessages(callback: (messages: ContactMessage[]) => void) {
  if (!auth.currentUser) throw new Error("Authentication required");

  const q = query(collection(db, MESSAGES_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: (doc.data().createdAt as any)?.toDate?.()?.toISOString() || new Date().toISOString()
    })) as ContactMessage[];
    callback(messages);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, MESSAGES_COLLECTION);
  });
}

export async function deleteMessage(id: string) {
  if (!auth.currentUser) throw new Error("Authentication required");

  try {
    await deleteDoc(doc(db, MESSAGES_COLLECTION, id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${MESSAGES_COLLECTION}/${id}`);
    throw error;
  }
}
