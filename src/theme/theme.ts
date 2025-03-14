// src/theme/theme.ts - Palette de couleurs améliorée
export const COLORS = {
  // Couleur principale avec nuances
  primary: {
    light: "#FF7A80",
    main: "#FF4952",
    dark: "#D83038",
  },
  // Couleurs secondaires
  secondary: {
    light: "#F8F9FA",
    main: "#E9ECEF",
    dark: "#DEE2E6",
  },
  // Couleurs de texte
  text: {
    primary: "#212529",
    secondary: "#495057",
    light: "#6C757D",
    disabled: "#ADB5BD",
  },
  // Couleurs de fond
  background: {
    default: "#F8F9FA",
    paper: "#FFFFFF",
    card: "#FFFFFF",
  },
  // Couleurs d'état
  state: {
    success: "#38B000",
    warning: "#FFC107",
    error: "#DC3545",
    info: "#17A2B8",
  },
  // Couleurs de bordure
  border: "#DEE2E6",
};


export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Définir les types corrects pour fontWeight
export type FontWeight = 
  | "normal" | "bold" 
  | "100" | "200" | "300" | "400" | "500" | "600" | "700" | "800" | "900"
  | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export const TYPOGRAPHY = {
  title: {
    fontSize: 26,
    fontWeight: "700" as FontWeight,
    color: COLORS.text.primary,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600" as FontWeight,
    color: COLORS.text.primary,
  },
  body: {
    fontSize: 16,
    fontWeight: "400" as FontWeight,
    color: COLORS.text.primary,
  },
  caption: {
    fontSize: 14,
    fontWeight: "400" as FontWeight,
    color: COLORS.text.secondary,
  },
  small: {
    fontSize: 12,
    fontWeight: "400" as FontWeight,
    color: COLORS.text.light,
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