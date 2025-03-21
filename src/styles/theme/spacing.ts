export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const layout = {
  screenPadding: spacing.md,
  containerPadding: spacing.lg,
  sectionSpacing: spacing.xl,
} as const; 