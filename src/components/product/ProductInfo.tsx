import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, TYPOGRAPHY } from '@theme/theme';
import type { Product } from '../../types/Product';

interface ProductInfoProps {
  product: Product;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAddToCart: () => void;
}

const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  quantity,
  onQuantityChange,
  onAddToCart,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{product.name}</Text>
      <Text style={styles.price}>{product.price} FCFA</Text>
      <Text style={styles.description}>{product.description}</Text>
      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onQuantityChange(quantity - 1)}
          disabled={quantity <= 1}
        >
          <Ionicons name="remove" size={20} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.quantity}>{quantity}</Text>
        <TouchableOpacity
          style={styles.quantityButton}
          onPress={() => onQuantityChange(quantity + 1)}
        >
          <Ionicons name="add" size={20} color={COLORS.text.primary} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.addToCartButton} onPress={onAddToCart}>
        <Text style={styles.addToCartText}>Ajouter au panier</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: SPACING.md,
    backgroundColor: COLORS.background.paper,
    borderRadius: 8,
    marginBottom: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.title,
    marginBottom: SPACING.sm,
  },
  price: {
    ...TYPOGRAPHY.subtitle,
    color: COLORS.primary.main,
    marginBottom: SPACING.md,
  },
  description: {
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.md,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.default,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantity: {
    ...TYPOGRAPHY.body,
    marginHorizontal: SPACING.md,
  },
  addToCartButton: {
    backgroundColor: COLORS.primary.main,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  addToCartText: {
    ...TYPOGRAPHY.button,
    color: COLORS.text.primary,
  },
});

export default ProductInfo; 