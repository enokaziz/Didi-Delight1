import React, { useState, useCallback, Suspense } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native';
import { ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useCart } from '@hooks/useCart';
import { COLORS, SPACING, TYPOGRAPHY } from '@theme/theme';
import type { Product } from '../types/Product';
import type { ProductDetailsScreenRouteProp } from '../navigation/types';

// Lazy loading des composants
const ProductImage = React.lazy(() => import('@components/product/ProductImage'));
const ProductInfo = React.lazy(() => import('@components/product/ProductInfo'));
const ProductReviews = React.lazy(() => import('@components/product/ProductReviews'));

// Composant de chargement
const LoadingComponent = () => (
  <View style={styles.loadingContainer}>
    <View style={styles.loadingImage} />
    <View style={styles.loadingContent}>
      <View style={styles.loadingTitle} />
      <View style={styles.loadingPrice} />
      <View style={styles.loadingDescription} />
    </View>
  </View>
);

export const ProductDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<ProductDetailsScreenRouteProp>();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = useCallback(() => {
    addToCart(route.params.product, quantity);
    navigation.goBack();
  }, [addToCart, navigation, quantity, route.params.product]);

  // Exemple de données d'avis (à remplacer par des données réelles)
  const reviews = [
    {
      id: '1',
      author: 'John Doe',
      rating: 5,
      comment: 'Excellent produit, je recommande !',
      date: '2024-03-15',
    },
    {
      id: '2',
      author: 'Jane Smith',
      rating: 4,
      comment: 'Très bon produit, livraison rapide.',
      date: '2024-03-14',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Suspense fallback={<LoadingComponent />}>
        <ProductImage 
          imageUrl={route.params.product.imageUrl} 
          productName={route.params.product.name}
        />
      </Suspense>
      <Suspense fallback={<LoadingComponent />}>
        <ProductInfo
          product={route.params.product}
          quantity={quantity}
          onQuantityChange={setQuantity}
          onAddToCart={handleAddToCart}
        />
      </Suspense>
      <Suspense fallback={<LoadingComponent />}>
        <ProductReviews reviews={reviews} />
      </Suspense>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  loadingContainer: {
    padding: SPACING.md,
    backgroundColor: COLORS.background.paper,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  loadingImage: {
    width: '100%',
    height: 300,
    backgroundColor: COLORS.background.default,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  loadingContent: {
    padding: SPACING.md,
  },
  loadingTitle: {
    width: '70%',
    height: 24,
    backgroundColor: COLORS.background.default,
    borderRadius: 4,
    marginBottom: SPACING.sm,
  },
  loadingPrice: {
    width: '40%',
    height: 20,
    backgroundColor: COLORS.background.default,
    borderRadius: 4,
    marginBottom: SPACING.md,
  },
  loadingDescription: {
    width: '100%',
    height: 60,
    backgroundColor: COLORS.background.default,
    borderRadius: 4,
  },
}); 