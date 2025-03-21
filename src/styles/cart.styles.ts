import { StyleSheet } from 'react-native';
import { COLORS, SPACING } from '@theme/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.default,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
    color: COLORS.text.primary,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.card,
    borderRadius: 8,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  itemInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: COLORS.primary.main,
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  removeButton: {
    justifyContent: 'center',
    paddingHorizontal: SPACING.sm,
  },
  removeText: {
    color: COLORS.state.error,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary.main,
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.md,
  },
  checkoutButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  clearButton: {
    backgroundColor: COLORS.state.error,
    padding: SPACING.md,
    borderRadius: 8,
    marginTop: SPACING.sm,
  },
  clearButtonText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.md,
    marginTop: SPACING.md,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'right',
  },
}); 