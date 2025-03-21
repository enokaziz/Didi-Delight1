import React, { useCallback, Suspense } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '@hooks/useCart';
import { COLORS, SPACING, TYPOGRAPHY } from '@theme/theme';
import type { CartScreenNavigationProp } from '@navigation/types';
import type { Product } from '../types/Product';
import { TouchableOpacity, Text } from 'react-native';

// Lazy loading du CartItem
const CartItem = React.lazy(() => import('@components/cart/CartItem'));

// Composant de chargement pour le CartItem
const CartItemLoading = () => (
  <View style={styles.cartItemLoading}>
    <View style={styles.loadingImage} />
    <View style={styles.loadingContent}>
      <View style={styles.loadingTitle} />
      <View style={styles.loadingPrice} />
    </View>
  </View>
);

export const CartScreen: React.FC = () => {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { items, totalPrice, removeFromCart, updateQuantity, clearCart } = useCart();

  const handleClearCart = useCallback(() => {
    Alert.alert(
      'Vider le panier',
      'Êtes-vous sûr de vouloir vider votre panier ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: clearCart,
        },
      ]
    );
  }, [clearCart]);

  const handleCheckout = useCallback(() => {
    navigation.navigate('Checkout');
  }, [navigation]);

  const renderItem = useCallback(
    ({ item }: { item: { product: Product; quantity: number } }) => (
      <Suspense fallback={<CartItemLoading />}>
        <CartItem
          product={item.product}
          quantity={item.quantity}
          onQuantityChange={(quantity: number) => updateQuantity(item.product.id, quantity)}
          onRemove={() => removeFromCart(item.product.id)}
        />
      </Suspense>
    ),
    [removeFromCart, updateQuantity]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Votre panier est vide</Text>
            <Text style={styles.emptySubtext}>
              Ajoutez des produits pour continuer vos achats
            </Text>
          </View>
        }
      />
      {items.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total :</Text>
            <Text style={styles.totalPrice}>{totalPrice} FCFA</Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.clearButton]}
              onPress={handleClearCart}
              accessibilityLabel="Vider le panier"
            >
              <Text style={styles.clearButtonText}>Vider le panier</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.checkoutButton]}
              onPress={handleCheckout}
              accessibilityLabel="Procéder au paiement"
            >
              <Text style={styles.checkoutButtonText}>Procéder au paiement</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  listContent: {
    padding: SPACING.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    ...TYPOGRAPHY.title,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    ...TYPOGRAPHY.body,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.background.paper,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  totalLabel: {
    ...TYPOGRAPHY.subtitle,
  },
  totalPrice: {
    ...TYPOGRAPHY.title,
    color: COLORS.primary.main,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  clearButton: {
    backgroundColor: COLORS.background.default,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary.main,
  },
  clearButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.primary,
  },
  checkoutButtonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.primary,
  },
  // Styles pour le composant de chargement
  cartItemLoading: {
    flexDirection: 'row',
    padding: SPACING.md,
    backgroundColor: COLORS.background.paper,
    borderRadius: 8,
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  loadingImage: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.background.default,
    borderRadius: 8,
  },
  loadingContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  loadingTitle: {
    width: '70%',
    height: 20,
    backgroundColor: COLORS.background.default,
    borderRadius: 4,
    marginBottom: SPACING.xs,
  },
  loadingPrice: {
    width: '40%',
    height: 16,
    backgroundColor: COLORS.background.default,
    borderRadius: 4,
  },
});
