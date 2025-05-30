// src/theme/theme.types.ts
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent?: string;

  // src/theme/theme.types.ts
  // Ajouter dans ThemeColors :
  system?: {
    success?: string;
    warning?: string;
    error?: string;
    info?: string;
  }

  // 👇 Ajouts recommandés 👇
  border: string;
  textSecondary: string;
  textTertiary: string;
  dangerBackground: string;
  dangerBorder: string;
  dangerText: string;
  card: string;
  overlayLight: string;
  overlayLightStrong: string;
  overlayDark: string;
  shadow: string;
  shadowLight: string;
  onPrimary: string;
}
