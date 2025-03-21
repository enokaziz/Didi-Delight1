import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@styles/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSizes.xxl,
    fontWeight: typography.fontWeights.bold,
    marginBottom: spacing.md,
    color: colors.text,
  },
  sectionTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    color: colors.gray.dark,
  },
  errorContainer: {
    backgroundColor: colors.error + '20',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSizes.sm,
  },
  summaryContainer: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.gray.light,
    borderRadius: 10,
  },
  summaryTitle: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.medium,
    marginBottom: spacing.sm,
    color: colors.gray.dark,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  totalPrice: {
    fontWeight: typography.fontWeights.bold,
    fontSize: typography.fontSizes.md,
    color: colors.text,
  },
  orderButton: {
    backgroundColor: colors.error,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  orderButtonDisabled: {
    backgroundColor: colors.gray.medium,
    opacity: 0.7,
  },
  orderButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.medium,
  },
  removeButton: {
    backgroundColor: colors.error,
    padding: spacing.sm,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  removeButtonText: {
    color: colors.white,
    fontSize: typography.fontSizes.sm,
  },
}); 