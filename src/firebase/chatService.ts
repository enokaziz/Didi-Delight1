// src/firebase/chatService.ts
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  getDocs,
  FirestoreError,
  DocumentData,
  deleteDoc,
  doc,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// Ajouter ces fonctions
export const deleteMessage = async (chatId: string, messageId: string) => {
  await deleteDoc(doc(db, "chats", chatId, "messages", messageId));
};

export const fetchPreviousMessages = async (chatId: string, lastVisible: any) => {
  const q = query(
    collection(db, "chats", chatId, "messages"),
    orderBy("timestamp", "desc"),
    startAfter(lastVisible),
    limit(15)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Interface décrivant un message de chat.
 */
export interface ChatMessage {
  id?: string; // Ajout d'un champ optionnel pour l'ID du document Firestore
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: number;
}

/**
 * Envoie un message dans une conversation.
 */
export const sendMessage = async (
  chatId: string,
  senderId: string,
  receiverId: string,
  message: string,
  onError?: (error: FirestoreError | Error) => void
): Promise<void> => {
  try {
    const docRef = await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId,
      receiverId,
      message,
      timestamp: Date.now(),
    });
    console.log("Message envoyé avec l'ID :", docRef.id);
  } catch (error) {
    console.error("Erreur lors de l'envoi du message :", error);
    if (onError) {
      onError(error as FirestoreError | Error);
    }
  }
};

/**
 * Souscrit en temps réel aux messages d'une conversation.
 */
export const subscribeToChat = (
  chatId: string,
  callback: (messages: ChatMessage[]) => void,
  onError?: (error: FirestoreError | Error) => void
): (() => void) => {
  try {
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const messages: ChatMessage[] = snapshot.docs.map((doc) => {
          const data = doc.data() as ChatMessage;
          return {
            id: doc.id,
            ...data,
            timestamp: data.timestamp || Date.now(), // Valeur par défaut si manquante
          };
        });
        callback(messages);
      },
      (error) => {
        console.error("Erreur lors de la souscription au chat :", error);
        if (onError) {
          onError(error as FirestoreError | Error);
        }
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Erreur lors de la création de la souscription :", error);
    if (onError) {
      onError(error as FirestoreError | Error);
    }
    return () => {}; // Retourne une fonction vide en cas d'erreur
  }
};

/**
 * Interface décrivant une conversation (chat) dans Firestore.
 */
export interface Chat {
  id: string;
  clientId: string;
  lastMessage: string;
  timestamp: number;
  lastMessageTimestamp: number;
}

/**
 * Récupère toutes les conversations (chats) depuis Firestore.
 */
export const getAllChats = async (): Promise<Chat[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "chats"));
    const chats: Chat[] = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Chat, "id">),
    }));
    return chats;
  } catch (error) {
    console.error("Erreur lors de la récupération des chats :", error);
    throw error; // Propage l'erreur pour une gestion centralisée
  }
};