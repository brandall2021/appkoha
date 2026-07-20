import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#1B5E20",
    primaryContainer: "#A5D6A7",
    secondary: "#00695C",
    secondaryContainer: "#80CBC4",
    tertiary: "#E65100",
    tertiaryContainer: "#FFCC80",
    surface: "#FAFAFA",
    surfaceVariant: "#F5F5F5",
    background: "#FFFFFF",
    error: "#D32F2F",
    errorContainer: "#FFCDD2",
    onPrimary: "#FFFFFF",
    onSecondary: "#FFFFFF",
    onSurface: "#1C1B1F",
    onBackground: "#1C1B1F",
    outline: "#79747E",
    outlineVariant: "#CAC4D0",
    elevation: {
      level0: "transparent",
      level1: "#F3EDF7",
      level2: "#EDE7F6",
      level3: "#E8DEF8",
      level4: "#E8DEF8",
      level5: "#D0BCFF",
    },
    surfaceGlass: "rgba(250, 250, 250, 0.72)",
    surfaceGlassBorder: "rgba(0, 0, 0, 0.06)",
    shimmerBase: "#E8E8E8",
    shimmerHighlight: "#F5F5F5",
    gradientPrimaryStart: "#2E7D32",
    gradientPrimaryEnd: "#1B5E20",
    gradientSecondaryStart: "#00897B",
    gradientSecondaryEnd: "#00695C",
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#81C784",
    primaryContainer: "#1B5E20",
    secondary: "#80CBC4",
    secondaryContainer: "#00695C",
    tertiary: "#FFB74D",
    tertiaryContainer: "#E65100",
    surface: "#121212",
    surfaceVariant: "#1E1E1E",
    background: "#0A0A0A",
    error: "#EF5350",
    errorContainer: "#B71C1C",
    onPrimary: "#003300",
    onSecondary: "#003333",
    onSurface: "#E6E1E5",
    onBackground: "#E6E1E5",
    outline: "#938F99",
    outlineVariant: "#49454F",
    elevation: {
      level0: "transparent",
      level1: "#1E1B22",
      level2: "#232028",
      level3: "#282530",
      level4: "#2B2838",
      level5: "#312E40",
    },
    surfaceGlass: "rgba(18, 18, 18, 0.72)",
    surfaceGlassBorder: "rgba(255, 255, 255, 0.08)",
    shimmerBase: "#1E1E1E",
    shimmerHighlight: "#2A2A2A",
    gradientPrimaryStart: "#81C784",
    gradientPrimaryEnd: "#4CAF50",
    gradientSecondaryStart: "#80CBC4",
    gradientSecondaryEnd: "#26A69A",
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  "3xl": 64,
};

export const fontSize = {
  caption: 12,
  bodySmall: 14,
  body: 16,
  titleSmall: 18,
  titleMedium: 22,
  titleLarge: 28,
  headline: 34,
  display: 42,
  hero: 56,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 100,
};

export const motion = {
  spring: {
    default: { damping: 20, stiffness: 200, mass: 1 },
    bouncy: { damping: 12, stiffness: 180, mass: 0.8 },
    gentle: { damping: 28, stiffness: 120, mass: 1.2 },
    snappy: { damping: 30, stiffness: 400, mass: 0.8 },
  },
  timing: {
    fast: 150,
    normal: 250,
    slow: 400,
    slower: 600,
  },
  stagger: {
    fast: 40,
    normal: 70,
    slow: 100,
  },
};

export const shadows = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 10,
  },
  glow: (color: string, opacity = 0.3) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: opacity,
    shadowRadius: 12,
    elevation: 4,
  }),
};

export const glass = {
  light: {
    backgroundColor: "rgba(255, 255, 255, 0.72)",
    borderColor: "rgba(0, 0, 0, 0.06)",
    borderWidth: 1,
    borderRadius: borderRadius.lg,
  },
  dark: {
    backgroundColor: "rgba(18, 18, 18, 0.72)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderRadius: borderRadius.lg,
  },
};
