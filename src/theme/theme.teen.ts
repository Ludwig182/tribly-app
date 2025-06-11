// src/theme/theme.teen.ts
import { Theme } from './theme.types';

const teenTheme: Theme = {
  name: 'teen',
  colors: {
    primary: '#4FC3F7',             // Bleu vif
    secondary: '#7E57C2',           // Violet dynamique
    background: '#FFFFFF',
    text: '#212121',
    accent: '#4FC3F7',
    primaryLight : 'rgba(255, 255, 255, 0.1)',

    border: '#E0E0E0',              // Gris clair pour les séparateurs
    textSecondary: '#616161',       // Texte secondaire un peu foncé
    textTertiary: '#9E9E9E',        // Texte tertiaire léger

    dangerBackground: '#FFEBEE',    // Rouge clair d'erreur
    dangerBorder: '#F44336',        // Rouge vif bordure
    dangerText: '#C62828',          // Rouge foncé texte d’erreur

    card: '#FAFAFA',                // Cartes légèrement grises
    overlayLight: 'rgba(255,255,255,0.3)',
    overlayLightStrong: 'rgba(255,255,255,0.4)',
    overlayDark: 'rgba(0,0,0,0.5)',

    shadow: 'rgba(0,0,0,0.2)',
    shadowLight: 'rgba(0,0,0,0.1)',
    onPrimary: '#FFFFFF',           // Texte sur fond primaire

    // 👇 Tokens pour la maquette calendrier 👇
    headerGradient: {
      light: ['#FF9CA8', '#8DA2FF'], // Rose → violet
    },
    tabActive: '#FFE9A3', // Couleur de fond pour l'onglet actif
    filterActive: 'rgba(255,92,92,0.15)', // Couleur de fond pour le filtre actif
    counterTotal: '#1E65FF', // Couleur pour le compteur Total
    counterToday: '#179C5B', // Couleur pour le compteur Aujourd'hui
    counterCompleted: '#9EA2B5', // Couleur pour le compteur Terminés
    success: '#4CAF50', // Couleur de succès
    warning: '#FF9800', // Couleur d'avertissement
    error: '#F44336', // Couleur d'erreur
    surface: '#F5F5F5', // Couleur de surface pour les éléments UI

    // Couleurs navigation agenda
    calendarNavBackground: '#FEE8F0',
    calendarNavIcon: '#EA3A70',
    calendarTodayBackground: '#EA3A70',
  },
  layout: {
    headerHeightCalendar: 'clamp(200px, 30vh, 260px)', // Hauteur responsive pour le header calendrier
  },
  fontFamily: 'System',
  fontSizeBase: 16,
};

export default teenTheme;
