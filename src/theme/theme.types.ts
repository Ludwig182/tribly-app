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

  // 👇 Nouveaux tokens pour la maquette calendrier 👇
  headerGradient: {
    light: [string, string]; // Rose → violet pour le header calendrier
  };
  tabActive: string; // Couleur de fond pour l'onglet actif (#FFE9A3)
  filterActive: string; // Couleur de fond pour le filtre actif (rgba(255,92,92,0.15))
  counterTotal: string; // Couleur pour le compteur Total (#1E65FF)
  counterToday: string; // Couleur pour le compteur Aujourd'hui (#179C5B)
  counterCompleted: string; // Couleur pour le compteur Terminés (#9EA2B5)
  success: string; // Couleur de succès
  warning: string; // Couleur d'avertissement
  error: string; // Couleur d'erreur
  surface: string; // Couleur de surface pour les éléments UI

  // 👇 Couleurs spécifiques pour la navigation agenda 👇
  calendarNavBackground: string; // Fond des flèches de navigation semaine
  calendarNavIcon: string; // Couleur des icônes de navigation semaine
  calendarTodayBackground: string; // Fond du bouton "Aujourd'hui"
}

export interface ThemeLayout {
  headerHeightCalendar: string; // Hauteur spécifique pour le header calendrier
}

export interface Theme {
  name: string;
  colors: ThemeColors;
  layout?: ThemeLayout;
  fontFamily: string;
  fontSizeBase: number;
}
