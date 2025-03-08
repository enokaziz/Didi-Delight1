import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Animated } from 'react-native';
import { Product } from '../types/Product';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { Button, IconButton, Card, Title, Paragraph } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import FastImage from 'react-native-fast-image';
import ProductList from '../components/ProductList';
import useProductManagement from '../hooks/useProductManagement';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types'; // Importez les types de navigation
import styles from './ProductManagementScreen.styles';
import { StackNavigationProp } from '@react-navigation/stack';

const ProductManagementScreen: React.FC = () => {
  const { products, loading, fetchProducts, handleDeleteProduct } = useProductManagement();
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'ProductManagement'>>(); // Annoter navigation

  const [page, setPage] = useState(1);
  const productsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState<string[]>([]);

  const animatedValues = useRef<Animated.Value[]>([]);

  useEffect(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    setCategories(uniqueCategories);
    animatedValues.current = products.map(() => new Animated.Value(0));
  }, [products]);

  const handleAddProduct = () => {
    navigation.navigate('AddEditProduct', { product: undefined }); // Naviguer vers l'écran d'ajout
  };

  const handleEditProduct = (product: Product) => {
    navigation.navigate('AddEditProduct', { product }); // Passer le produit à modifier
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (categoryFilter) {
      filtered = filtered.filter(product =>
        product.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    return filtered;
  }, [products, searchQuery, categoryFilter]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * productsPerPage;
    return filteredProducts.slice(start, start + productsPerPage);
  }, [filteredProducts, page]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestion des Produits</Text>

      <View style={styles.searchFilterContainer}>
        <TextInput
          placeholder="Rechercher un produit"
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchFilterInput}
          accessibilityLabel="Rechercher un produit"
        />
        <Picker
          selectedValue={categoryFilter}
          onValueChange={setCategoryFilter}
          style={styles.filterPicker}
          accessibilityLabel="Filtrer par catégorie"
        >
          <Picker.Item label="Toutes les catégories" value="" />
          {categories.map(category => (
            <Picker.Item key={category} label={category} value={category} />
          ))}
        </Picker>
      </View>

      <Button
        mode="contained"
        onPress={handleAddProduct}
        style={styles.addButton}
        accessibilityLabel="Ajouter un produit"
      >
        Ajouter un produit
      </Button>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6347" />
        </View>
      ) : (
        <ProductList
          products={paginatedProducts}
          onEdit={handleEditProduct}
          onDelete={(productId) => handleDeleteProduct(productId, fetchProducts)}
        />
      )}

      <Toast />
    </View>
  );
};

export default ProductManagementScreen;