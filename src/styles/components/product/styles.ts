import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@styles/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  productCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  productName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  productPrice: {
    fontSize: typography.fontSizes.md,
    color: colors.primary,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.sm,
  },
  productDescription: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray.dark,
    marginBottom: spacing.md,
  },
  productCategory: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray.dark,
    marginBottom: spacing.sm,
  },
  productStock: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray.dark,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  badgePopular: {
    backgroundColor: colors.primary,
  },
  badgePromo: {
    backgroundColor: colors.error,
  },
  badgeText: {
    color: colors.white,
    fontSize: typography.fontSizes.xs,
    fontWeight: typography.fontWeights.medium,
  },
}); 