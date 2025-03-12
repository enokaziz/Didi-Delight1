import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  deleteDoc,
  doc,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

export interface ChatMessage {
  id?: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: number;
  type?: "text" | "image" | "pdf" | "file";
  status?: "pending" | "sent" | "read";
}

export const sendMessage = async (
  chatId: string,
  senderId: string,
  receiverId: string,
  message: string,
  type: string = "text"
): Promise<void> => {
  try {
    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId,
      receiverId,
      message,
      timestamp: Date.now(),
      type,
      status: "pending",
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    throw error;
  }
};

export const subscribeToChat = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void,
  onError: (error: any) => void
): (() => void) => {
  const q = query(collection(db, "chats", chatId, "messages"), orderBy("timestamp", "asc"));
  return onSnapshot(
    q,
    (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      callback(messages);
    },
    onError
  );
};

export const deleteMessage = async (chatId: string, messageId: string): Promise<void> => {
  await deleteDoc(doc(db, "chats", chatId, "messages", messageId));
};

export const fetchPreviousMessages = async (chatId: string, lastVisible: any): Promise<ChatMessage[]> => {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("timestamp", "desc"),
    startAfter(lastVisible),
    limit(15)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ChatMessage[];
};

export interface Chat {
  id: string;
  clientId: string;
  lastMessage: string;
  lastMessageTimestamp: number;
}

export const getAllChats = async (): Promise<Chat[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "chats"));
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      if (!data.clientId) throw new Error("Chat invalide: clientId manquant");
      return {
        id: doc.id,
        clientId: data.clientId,
        lastMessage: data.lastMessage || "Aucun message",
        lastMessageTimestamp: data.lastMessageTimestamp || Date.now(),
      } as Chat;
    });
  } catch (error) {
    console.error("Erreur critique:", error);
    throw new Error("Échec de la récupération des chats");
  }
};