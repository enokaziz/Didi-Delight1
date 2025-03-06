import { useState, useEffect, useCallback } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../firebase/productService';
import Toast from 'react-native-toast-message';
import { Product } from '../types/Product';

const useProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de récupérer les produits.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddProduct = async (
    product: Omit<Product, 'id'>,
    fetchProducts: () => Promise<void>,
    resetForm: () => void
  ): Promise<void> => {
    try {
      await createProduct(product);
      await fetchProducts();
      resetForm();
      Toast.show({
        type: 'success',
        text1: 'Produit ajouté !',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: (error as Error).message,
      });
    }
  };

  const handleUpdateProduct = async (
    product: Product,
    fetchProducts: () => Promise<void>,
    resetForm: () => void
  ): Promise<void> => {
    try {
      await updateProduct(product);
      await fetchProducts();
      resetForm();
      Toast.show({
        type: 'success',
        text1: 'Produit mis à jour !',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: (error as Error).message,
      });
    }
  };

  const handleDeleteProduct = async (
    productId: string,
    fetchProducts: () => Promise<void>
  ): Promise<void> => {
    try {
      await deleteProduct(productId);
      await fetchProducts();
      Toast.show({
        type: 'success',
        text1: 'Produit supprimé !',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Erreur',
        text2: 'Impossible de supprimer le produit.',
      });
    }
  };

  return {
    products,
    loading,
    fetchProducts,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
  };
};

export default useProductManagement;