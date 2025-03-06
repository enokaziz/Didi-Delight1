import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Animated } from 'react-native';
import { Product } from '../types/Product';
import { launchImageLibrary, ImagePickerResponse } from 'react-native-image-picker';
import { Button, IconButton, Card, Title, Paragraph } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import FastImage from 'react-native-fast-image';
import ProductModal from '../components/ProductModal';
import ProductList from '../components/ProductList';
import useProductManagement from '../hooks/useProductManagement';
import styles from './ProductManagementScreen.styles';

const ProductManagementScreen: React.FC = () => {
  const { products, loading, fetchProducts, handleAddProduct, handleUpdateProduct, handleDeleteProduct } = useProductManagement();

  const [newProductName, setNewProductName] = useState<string>("");
  const [newProductPrice, setNewProductPrice] = useState<string>("");
  const [newProductImage, setNewProductImage] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [page, setPage] = useState(1);
  const productsPerPage = 10;
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [newProductCategory, setNewProductCategory] = useState<string>("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const animatedValues = useRef<Animated.Value[]>([]);

  useEffect(() => {
    const uniqueCategories = [...new Set(products.map(product => product.category))];
    setCategories(uniqueCategories);
    animatedValues.current = products.map(() => new Animated.Value(0));
  }, [products]);

  const resetForm = () => {
    setNewProductName("");
    setNewProductPrice("");
    setNewProductImage(null);
    setNewProductCategory("");
    setIsModalVisible(false);
    setEditingProduct(null);
  };

  const selectImage = async () => {
    const result: ImagePickerResponse = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (!result.didCancel && result.assets?.[0]?.uri) {
      setNewProductImage(result.assets[0].uri);
    }
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
        onPress={() => setIsModalVisible(true)}
        style={styles.addButton}
        accessibilityLabel="Ajouter un produit"
      >
        Ajouter un produit
      </Button>

      <ProductModal
        isVisible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        newProductName={newProductName}
        setNewProductName={setNewProductName}
        newProductPrice={newProductPrice}
        setNewProductPrice={setNewProductPrice}
        newProductCategory={newProductCategory}
        setNewProductCategory={setNewProductCategory}
        handleAddProduct={() => handleAddProduct(
          {
            name: newProductName.trim(),
            price: parseFloat(newProductPrice.replace(',', '.')),
            image: newProductImage || "",
            description: "",
            category: newProductCategory
          },
          fetchProducts,
          resetForm
        )}
        handleUpdateProduct={() => handleUpdateProduct(
          editingProduct!,
          fetchProducts,
          resetForm
        )}
        editingProduct={editingProduct}
      />

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6347" />
        </View>
      ) : (
        <ProductList
          products={paginatedProducts}
          onEdit={(product) => {
            setEditingProduct(product);
            setNewProductName(product.name);
            setNewProductPrice(String(product.price));
            setNewProductImage(product.image);
            setNewProductCategory(product.category);
            setIsModalVisible(true);
          }}
          onDelete={(productId) => handleDeleteProduct(productId, fetchProducts)}
        />
      )}
      <Toast />
    </View>
  );
};

export default ProductManagementScreen;