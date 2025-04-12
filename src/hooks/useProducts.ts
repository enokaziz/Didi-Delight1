// src/hooks/useProducts.ts
import { useState, useCallback, useEffect, useMemo } from "react";
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

export const useProducts = () => {
  // États pour les produits et la pagination
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  // États pour les filtres et la recherche
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const PRODUCTS_PER_PAGE = 20;

  // Validation des données produit
  const isProductValid = (data: any): data is Product => {
    return (
      typeof data?.name === "string" &&
      typeof data?.price === "number" &&
      typeof data?.category === "string" &&
      typeof data?.imageUrl === "string" &&
      typeof data?.description === "string"
    );
  };

  // Récupération des produits depuis Firestore avec pagination
  const fetchProducts = useCallback(
    async (isRefresh = false) => {
      console.log('Fetching products...', { 
        isRefresh, 
        selectedCategory, 
        searchQuery,
        lastDoc: !!lastDoc
      });
      
      setLoading(!isRefresh);
      setRefreshing(isRefresh);
      setError(null);

      try {
        if (isRefresh) {
          setLastDoc(null);
        }

        let q = query(collection(db, "products"));
        
        // Appliquer les filtres
        if (selectedCategory) {
          q = query(q, where("category", "==", selectedCategory));
        }
        
        q = query(q, orderBy("name"), limit(PRODUCTS_PER_PAGE));
        
        if (!isRefresh && lastDoc) {
          q = query(q, startAfter(lastDoc));
        }

        const querySnapshot = await getDocs(q);
        console.log('Products received:', querySnapshot.docs.length);
        
        setHasMore(querySnapshot.docs.length === PRODUCTS_PER_PAGE);
        
        const newProducts = querySnapshot.docs
          .map((doc) => {
            const data = doc.data();
            if (!isProductValid(data)) {
              console.warn('Invalid product:', doc.id, data);
              return null;
            }
            return { ...data, id: doc.id } as Product;
          })
          .filter(Boolean) as Product[];

        setProducts(prev => isRefresh ? newProducts : [...prev, ...newProducts]);
        
        if (querySnapshot.docs.length > 0) {
          setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : String(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedCategory, lastDoc]
  );

  // Charger plus de produits (pagination)
  const loadMore = useCallback(() => {
    if (!loading && lastDoc && hasMore) {
      fetchProducts(false);
    }
  }, [fetchProducts, loading, lastDoc, hasMore]);

  // Effet pour charger les produits initialement ou lors d'un changement de catégorie
  useEffect(() => {
    fetchProducts(true);
  }, [selectedCategory]);

  // Filtrage des produits par recherche
  const searchedProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase().trim();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Tri des produits
  const sortedAndSearchedProducts = useMemo(() => {
    let result = [...searchedProducts];

    if (sortOption === "priceAsc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOption === "priceDesc") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === "nameAsc") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [searchedProducts, sortOption]);

  // Réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setSelectedCategory(null);
    setSortOption(null);
    setSearchQuery("");
  }, []);

  // Rafraîchir les produits
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts(true);
  }, [fetchProducts]);

  return {
    // Données
    products: sortedAndSearchedProducts,
    allProducts: products, // Produits non filtrés/triés
    categories,
    totalCount: sortedAndSearchedProducts.length,
    hasMore,

    // États
    loading,
    error,
    refreshing,

    // Filtres et recherche
    selectedCategory,
    setSelectedCategory,
    sortOption,
    setSortOption,
    searchQuery,
    setSearchQuery,

    // Actions
    resetFilters,
    onRefresh,
    fetchProducts: () => fetchProducts(true),
    loadMore,
  };
};
