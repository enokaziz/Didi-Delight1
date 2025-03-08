// useAdminData.ts
import { useState, useEffect } from "react";
import { collection, getDocs, query } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Order } from "../types/Order";

const useAdminData = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const ordersQuery = query(collection(db, "orders"));
                const productsQuery = query(collection(db, "products"));

                const [ordersSnapshot, productsSnapshot] = await Promise.all([
                    getDocs(ordersQuery),
                    getDocs(productsQuery),
                ]);

                const fetchedOrders = ordersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as Order[];

                const fetchedProducts = productsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setOrders(fetchedOrders);
                setProducts(fetchedProducts);
            } catch (error: any) {
                console.error("Erreur lors de la récupération des données :", error);
                setError(`Une erreur est survenue : ${error.message}`);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return { orders, products, loading, error };
};

export default useAdminData;