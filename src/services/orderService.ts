//services/orderService.ts
import { 
  collection, addDoc, query, where, getDocs, 
  doc, updateDoc, getDoc, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Order } from "../types/Order";
import { Product } from "../types/Product"


/**
 * Envoie une nouvelle commande à Firestore.
 * @param order - L'objet commande à ajouter.
 * @returns La commande ajoutée.
 */
// 1. Création de commande
export const createOrder = async (
  userId: string,
  items: Product[],
  total: number,
  shippingAddress: string,
  paymentMethod: string
): Promise<Order> => {
  try {
    const newOrder: Order = {
      userId,
      items,
      total,
      status: "En attente",
      createdAt: new Date().toISOString(),
      shippingAddress,
      paymentMethod,
    };

    await addDoc(collection(db, "orders"), newOrder);
    return newOrder;
  } catch (error) {
    console.error("Erreur lors de la création de la commande :", error);
    throw new Error("Échec de la création de la commande");
  }
};

// 2. Synchronisation en temps réel
export const subscribeToUserOrders = (
  userId: string,
  callback: (orders: Order[]) => void,
  onError?: (error: Error) => void
) => {
  try {
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(100)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Order,
        }));
        callback(orders);
      },
      (error) => {
        console.error("Erreur de synchronisation :", error);
        onError?.(error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Erreur d'initialisation :", error);
    onError?.(error as Error);
    return () => {};
  }
};


/**
 * Récupère l'historique des commandes d'un utilisateur.
 * @param userId - L'identifiant de l'utilisateur.
 * @returns La liste des commandes de l'utilisateur.
 */
export const getOrderHistory = async (userId: string): Promise<Order[]> => {
    try {
        const ordersRef = collection(db, "orders");
        const q = query(ordersRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        const orders: Order[] = [];
        querySnapshot.forEach((doc) => {
            orders.push({ id: doc.id, ...doc.data() } as Order);
        });
        return orders;
    } catch (error) {
        console.error("Erreur lors de la récupération de l'historique des commandes :", error);
        throw new Error("Impossible de récupérer l'historique des commandes. Veuillez vérifier vos permissions.");
    }
};

// 3. Récupération des commandes (pagination)
export const getUserOrders = async (
  userId: string,
  page: number = 1,
  pageSize: number = 10
): Promise<Order[]> => {
  try {
    const offset = (page - 1) * pageSize;
    const q = query(
      collection(db, "orders"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(pageSize),
      // startAfter(offset) // À implémenter si nécessaire
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as Order }));
  } catch (error) {
    console.error("Erreur de récupération :", error);
    throw new Error("Échec de la récupération des commandes");
  }
};

export const getOrderById = async (userId: string, orderId: string): Promise<Order> => {
  const orderRef = doc(db, `users/${userId}/orders`, orderId);
  const orderSnap = await getDoc(orderRef);
  if (!orderSnap.exists()) throw new Error("Commande introuvable");
  return { id: orderSnap.id, ...orderSnap.data() } as Order;
};

/**
 * Met à jour le statut d'une commande.
 * @param orderId - L'identifiant de la commande à mettre à jour.
 * @param status - Le nouveau statut de la commande.
 * @returns La commande mise à jour.
 */

// Mise à jour du statut
export const updateOrderStatus = async (
  orderId: string,
  status: Order["status"]
): Promise<void> => {
  try {
    await updateDoc(doc(db, "orders", orderId), { status });
  } catch (error) {
    console.error("Erreur de mise à jour :", error);
    throw new Error("Échec de la mise à jour du statut");
  }
};