import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '@theme/theme';
import type { Product } from '../../types/Product';

interface CartItemProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

const CartItem: React.FC<CartItemProps> = React.memo(({
  product,
  quantity,
  onQuantityChange,
  onRemove,
}) => {
  const handleDecreaseQuantity = () => {
    if (quantity > 1) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncreaseQuantity = () => {
    onQuantityChange(quantity + 1);
  };

  return (
    <View style={styles.container}>
      <Image source={{ uri: product.imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.price}>{product.price} FCFA</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
            onPress={handleDecreaseQuantity}
            disabled={quantity <= 1}
            accessibilityLabel="Réduire la quantité"
          >
            <Ionicons name="remove" size={20} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleIncreaseQuantity}
            accessibilityLabel="Augmenter la quantité"
          >
            <Ionicons name="add" size={20} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={onRemove}
        accessibilityLabel="Supprimer du panier"
      >
        <Ionicons name="trash-outline" size={24} color={COLORS.state.error} />
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.paper,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: SPACING.md,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    ...TYPOGRAPHY.body,
    fontWeight: '600',
    marginBottom: SPACING.xs,
  },
  price: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.primary.main,
    marginBottom: SPACING.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary.main,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantity: {
    ...TYPOGRAPHY.body,
    marginHorizontal: SPACING.sm,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
});

export default CartItem; 