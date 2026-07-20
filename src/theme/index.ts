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
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
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
};
