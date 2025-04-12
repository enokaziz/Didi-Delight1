import { useState, useCallback, useEffect } from "react";
import { Order, OrderStatus, Product } from "../types/Order";
import { User } from "../types/User";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "../firebase/firebaseConfig";

interface AdminData {
  orders: Order[];
  products: Product[];
  users: User[];
  loading: boolean;
  error: Error | null;
  refresh: (filters?: { status?: OrderStatus }) => Promise<void>;
  updateOrder: (orderId: string, updates: Partial<Order>) => Promise<void>;
  filterOrders: (
    orders: Order[],
    filters: { status?: OrderStatus | "all"; date?: Date }
  ) => Order[];
}

export const useAdminData = (): AdminData => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [unsubscribes, setUnsubscribes] = useState<(() => void)[]>([]);

  useEffect(() => {
    return () => {
      unsubscribes.forEach((unsub) => {
        try {
          unsub();
        } catch (err) {
          console.error("Erreur lors de l'annulation d'un abonnement:", err);
        }
      });
    };
  }, [unsubscribes]);

  const updateOrder = useCallback(
    async (orderId: string, updates: Partial<Order>) => {
      try {
        await updateDoc(doc(db, "orders", orderId), updates);
      } catch (err) {
        throw new Error("Échec de la mise à jour de la commande");
      }
    },
    []
  );

  const refresh = useCallback(async (filters?: { status?: OrderStatus }) => {
    try {
      if (!auth.currentUser) {
        console.log("Aucun utilisateur authentifié - nettoyage des données");
        setUsers([]);
        setOrders([]);
        setProducts([]);
        setLoading(false);
        return;
      }

      setError(null);
      setLoading(true);

      const ordersQuery = collection(db, "orders");
      let queryWithConstraints = query(ordersQuery);

      if (filters?.status) {
        queryWithConstraints = query(
          queryWithConstraints,
          where("status", "==", filters.status)
        );
      }

      queryWithConstraints = query(
        queryWithConstraints,
        orderBy("createdAt", "desc")
      );

      const ordersUnsub = onSnapshot(
        queryWithConstraints,
        (snapshot) => {
          const ordersData = snapshot.docs.map((doc) => {
            const data = doc.data();
            const totalAmount = data.totalAmount
              ? Number(data.totalAmount)
              : data.total
                ? Number(data.total)
                : 0;

            return {
              id: doc.id,
              ...data,
              totalAmount: totalAmount,
              total: data.total ? Number(data.total) : totalAmount,
            } as unknown as Order;
          });
          setOrders(ordersData);
          setLoading(false);
        },
        (error) => {
          console.error("Erreur sur l'abonnement aux commandes:", error);
          setError(
            error instanceof Error
              ? error
              : new Error("Erreur lors de la récupération des commandes")
          );
          setLoading(false);
        }
      );

      const productsQuery = query(collection(db, "products"));
      const productsUnsub = onSnapshot(
        productsQuery,
        (snapshot) => {
          const productsData = snapshot.docs.map(
            (doc) =>
              ({
                id: doc.id,
                ...doc.data(),
              }) as Product
          );
          setProducts(productsData);
        },
        (error) => {
          console.error("Erreur sur l'abonnement aux produits:", error);
        }
      );

      try {
        const usersQuery = query(collection(db, "users"));
        const usersUnsub = onSnapshot(
          usersQuery,
          (snapshot) => {
            const usersData = snapshot.docs.map(
              (doc) =>
                ({
                  id: doc.id,
                  ...doc.data(),
                }) as User
            );
            setUsers(usersData);
          },
          (error) => {
            console.error("Erreur sur l'abonnement aux utilisateurs:", error);
            setUsers([]);
          }
        );

        setUnsubscribes([ordersUnsub, productsUnsub, usersUnsub]);
      } catch (error) {
        console.error("Exception lors de l'accès à la collection users:", error);
        setUsers([]);
      }
    } catch (err) {
      console.error("Erreur globale dans refresh:", err);
      setError(err instanceof Error ? err : new Error("Erreur inconnue"));
      setLoading(false);
    }
  }, []);

  const filterOrders = useCallback(
    (
      orders: Order[],
      filters: { status?: OrderStatus | "all"; date?: Date }
    ) => {
      return orders.filter((order) => {
        const orderDate = order.createdAt.toDate();
        const isSameDay =
          orderDate.getDate() === filters.date?.getDate() &&
          orderDate.getMonth() === filters.date?.getMonth() &&
          orderDate.getFullYear() === filters.date?.getFullYear();

        if (filters.status === "all") {
          return isSameDay;
        }
        return isSameDay && order.status === filters.status;
      });
    },
    []
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    orders,
    products,
    users,
    loading,
    error,
    refresh,
    updateOrder,
    filterOrders,
  };
};
