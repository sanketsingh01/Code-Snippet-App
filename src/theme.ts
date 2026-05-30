import { Platform } from "react-native";

export const theme = {
  colors: {
    bg: "#fff7ec",
    bgAlt: "#fdf0db",
    surface: "#ffffff",
    surface2: "#fdf6ec",
    surface3: "#fef0d6",
    card: "#ffffff",
    cardAlt: "#fff8e9",

    border: "#1a1a1a",
    borderStrong: "#000000",
    borderSoft: "#dedacb",
    borderDim: "#ecdfc7",

    text: "#1a1a1a",
    textSoft: "#3a3a3a",
    textMuted: "#7a7363",
    textDim: "#b8b09c",

    primary: "#ed5a40",
    primaryDeep: "#cf4226",
    primarySoft: "#fde0d8",

    accent: "#f4c542",
    accentDeep: "#d4a82a",
    accentSoft: "#fdf2cd",

    accent2: "#a7d8ff",
    accent2Deep: "#6fb6f0",
    accent2Soft: "#e0f0ff",

    pink: "#f7b3c2",
    pinkDeep: "#e58aa0",
    pinkSoft: "#fde8ee",

    green: "#9bd87d",
    greenDeep: "#6fbb4f",
    greenSoft: "#e7f5dc",

    amber: "#f4c542",
    blue: "#a7d8ff",
    red: "#ed5a40",

    shadow: "#1a1a1a",
    shadowDeep: "#000000",
    overlay: "rgba(26, 26, 26, 0.55)",

    white: "#ffffff",
    black: "#1a1a1a",
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 18,
    xl: 24,
    full: 999,
  },
  space: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  fonts: {
    display: Platform.select({
      ios: "Georgia",
      android: "serif",
      default: "Georgia",
    }),
    body: Platform.select({
      ios: "System",
      android: "sans-serif",
      default: "System",
    }),
    mono: Platform.select({
      ios: "Menlo",
      android: "monospace",
      default: "monospace",
    }),
  },
};

export function shadow(level: 1 | 2 = 1) {
  const offset = level === 1 ? 4 : 6;
  return {
    shadowColor: theme.colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 0,
    shadowOffset: { width: offset, height: offset },
    elevation: level === 1 ? 4 : 8,
  };
}
