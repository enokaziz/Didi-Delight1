import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '@theme/theme';
import type { Product } from '../../types/Product';

interface OrderSummaryProps {
  items: { product: Product; quantity: number }[];
  totalPrice: number;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ items, totalPrice }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Récapitulatif de la commande</Text>
      {items.map((item) => (
        <View key={item.product.id} style={styles.item}>
          <Text style={styles.itemName}>{item.product.name}</Text>
          <Text style={styles.itemQuantity}>x{item.quantity}</Text>
          <Text style={styles.itemPrice}>{item.product.price * item.quantity} FCFA</Text>
        </View>
      ))}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalPrice}>{totalPrice} FCFA</Text>
      </View>
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
    marginBottom: SPACING.md,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  itemName: {
    ...TYPOGRAPHY.body,
    flex: 1,
  },
  itemQuantity: {
    ...TYPOGRAPHY.body,
    marginHorizontal: SPACING.sm,
  },
  itemPrice: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary.main,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    ...TYPOGRAPHY.subtitle,
  },
  totalPrice: {
    ...TYPOGRAPHY.title,
    color: COLORS.primary.main,
  },
});

export default OrderSummary; 