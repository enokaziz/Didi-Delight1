// src/theme/theme.ts - Palette de couleurs améliorée
export const COLORS = {
  // Couleur principale avec nuances
  primary: {
    light: '#FF6B6B',
    main: '#FF4757',
    dark: '#FF2E42',
  },
  // Couleurs secondaires
  secondary: {
    light: '#F1F2F6',
    main: '#DFE4EA',
    dark: '#CED6E0',
  },
  // Couleurs de texte
  text: {
    primary: '#2F3542',
    secondary: '#747D8C',
    light: '#A4B0BE',
    disabled: '#DFE4EA',
  },
  // Couleurs de fond
  background: {
    default: '#FFFFFF',
    paper: '#F8F9FA',
    card: '#FFFFFF',
  },
  // Couleurs d'état
  state: {
    success: '#2ED573',
    error: '#FF4757',
    warning: '#FFA502',
    info: '#1E90FF',
  },
  // Couleurs de bordure
  border: '#DFE4EA',
};


export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Définir les types corrects pour fontWeight
export type FontWeight = 
  | "normal" | "bold" 
  | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900"
  | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export const TYPOGRAPHY = {
  title: {
    fontSize: 24,
    fontWeight: '700' as FontWeight,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600' as FontWeight,
    color: COLORS.text.primary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as FontWeight,
    color: COLORS.text.primary,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400' as FontWeight,
    color: COLORS.text.secondary,
  },
  small: {
    fontSize: 12,
    fontWeight: '400' as FontWeight,
    color: COLORS.text.secondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as FontWeight,
    color: COLORS.text.primary,
  },
};

export const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
};

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  round: 999,
};