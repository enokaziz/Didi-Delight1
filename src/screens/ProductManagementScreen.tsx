import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Toast from 'react-native-toast-message';

import type { Product } from '../types/Product';
import type { ProductManagementProps } from '../types/productManagement';
import { RootStackParamList } from '@navigation/types';
import ProductList from '@components/ProductList';
import { ProductSearchFilters } from '@components/ProductSearchFilters';
import useProductManagement from '@hooks/useProductManagement';
import { usePagination } from '@hooks/usePagination';
import { styles as productManagementStyles } from '@styles/screens/productManagement/styles';

const PRODUCTS_PER_PAGE = 10;

const ProductManagementScreen: React.FC = () => {
  const { products, loading, fetchProducts, handleDeleteProduct } = useProductManagement();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'ProductManagement'>>();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const uniqueCategories = [...new Set(products.map((product: Product) => product.category))];
    setCategories(uniqueCategories as string[]);
  }, [products]);

  const handleAddProduct = () => {
    navigation.navigate('AddEditProduct', { product: undefined });
  };

  const handleEditProduct = (product: Product) => {
    navigation.navigate('AddEditProduct', { product });
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (searchQuery) {
      filtered = filtered.filter((product: Product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (categoryFilter) {
      filtered = filtered.filter((product: Product) =>
        product.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    return filtered;
  }, [products, searchQuery, categoryFilter]);

  const { paginatedItems, currentPage, totalPages, goToPage } = usePagination({
    items: filteredProducts,
    itemsPerPage: PRODUCTS_PER_PAGE,
  });

  const handleDelete = async (productId: string) => {
    await handleDeleteProduct(productId, fetchProducts);
  };

  return (
    <View style={productManagementStyles.container}>
      <Text style={productManagementStyles.title}>Gestion des Produits</Text>

      <ProductSearchFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryChange={setCategoryFilter}
        categories={categories}
      />

      <Button
        mode="contained"
        onPress={handleAddProduct}
        style={productManagementStyles.addButton}
        accessibilityLabel="Ajouter un produit"
      >
        Ajouter un produit
      </Button>

      {loading ? (
        <View style={productManagementStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4952" />
        </View>
      ) : (
        <ProductList
          products={paginatedItems}
          onEdit={handleEditProduct}
          onDelete={handleDelete}
        />
      )}

      <Toast />
    </View>
  );
};

export default ProductManagementScreen;