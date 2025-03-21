import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@styles/theme';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  profileCard: {
    margin: spacing.md,
    elevation: 2,
  },
  profileContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  profileName: {
    fontSize: typography.fontSizes.lg,
    fontWeight: typography.fontWeights.bold,
  },
  profileEmail: {
    fontSize: typography.fontSizes.sm,
    color: colors.gray.dark,
    marginTop: spacing.xs,
  },
  editProfileButton: {
    marginTop: spacing.sm,
  },
  editProfileText: {
    color: colors.error,
    fontWeight: typography.fontWeights.medium,
  },
  sectionHeader: {
    fontSize: typography.fontSizes.md,
    fontWeight: typography.fontWeights.bold,
    color: colors.text,
  },
  logoutText: {
    color: colors.error,
  },
  bottomSpacer: {
    height: spacing.lg,
  },
  languageIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 