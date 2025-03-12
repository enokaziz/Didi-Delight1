import { useState, useCallback, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Product } from "../types/Product";

export const useProducts = (selectedCategory: string | null) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const PRODUCTS_PER_PAGE = 20;

  const isProductValid = (data: any): data is Product => {
    return (
      typeof data?.name === "string" &&
      typeof data?.price === "number" &&
      typeof data?.category === "string" &&
      typeof data?.image === "string" &&
      typeof data?.description === "string"
    );
  };

  const fetchProducts = useCallback(
    async (isRefresh = false) => {
      setLoading(!isRefresh);
      setRefreshing(isRefresh);
      setError(null);

      try {
        let q = selectedCategory
          ? query(
              collection(db, "products"),
              where("category", "==", selectedCategory),
              orderBy("name"),
              limit(PRODUCTS_PER_PAGE)
            )
          : query(
              collection(db, "products"),
              orderBy("name"),
              limit(PRODUCTS_PER_PAGE)
            );

        if (!isRefresh && lastDoc) {
          q = query(q, startAfter(lastDoc));
        }

        const querySnapshot = await getDocs(q);
        const newProducts = querySnapshot.docs
          .map((doc) => {
            const productData = doc.data();
            if (!isProductValid(productData)) {
              console.warn("Document invalide:", doc.id, productData);
              return null;
            }
            // Exclure la propriété 'id' de productData pour éviter le conflit
            const { id: _, ...productDataWithoutId } = productData;
            return { id: doc.id, ...productDataWithoutId } as Product;
          })
          .filter(Boolean) as Product[];

        setProducts((prev) => (isRefresh ? newProducts : [...prev, ...newProducts]));
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);

        if (categories.length === 0) {
          const uniqueCategories = [
            ...new Set(newProducts.map((product) => product.category)),
          ];
          setCategories(uniqueCategories);
        }
      } catch (err: any) {
        console.error("Erreur lors de la récupération des produits :", err);
        setError(
          err.code === "unavailable"
            ? "Problème de connexion. Vérifiez votre réseau."
            : "Erreur inattendue. Veuillez réessayer."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCategory, lastDoc, categories.length]
  );

  const loadMore = useCallback(() => {
    if (!loading && lastDoc) {
      fetchProducts(false);
    }
  }, [fetchProducts, loading, lastDoc]);

  useEffect(() => {
    fetchProducts(true); // Chargement initial ou refresh
  }, [fetchProducts, selectedCategory]);

  return {
    products,
    categories,
    loading,
    error,
    refreshing,
    fetchProducts: () => fetchProducts(true),
    loadMore,
  };
};