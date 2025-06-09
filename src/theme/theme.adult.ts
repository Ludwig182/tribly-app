// src/theme/theme.adult.ts
import { Theme } from './theme.types';

const adultTheme: Theme = {
  name: 'adult',
  colors: {
    primary: '#FF8A80',
    secondary: '#7986CB',
    background: '#FFFFFF',
    text: '#212121',
    accent: '#FF8A80',

    // 👇 Nouvelles couleurs 👇
    border: '#E0E0E0',
    textSecondary: '#757575',
    textTertiary: '#9E9E9E',
    dangerBackground: '#FFEBEE',
    dangerBorder: '#EF9A9A',
    dangerText: '#D32F2F',
    card: '#FFFFFF',
    overlayLight: 'rgba(255,255,255,0.2)',
    overlayLightStrong: 'rgba(255,255,255,0.3)',
    overlayDark: 'rgba(0,0,0,0.5)',
    shadow: 'rgba(0,0,0,0.2)',
    shadowLight: 'rgba(0,0,0,0.1)',
    onPrimary: '#FFFFFF',

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
  },
  layout: {
    headerHeightCalendar: 'clamp(200px, 30vh, 260px)', // Hauteur responsive pour le header calendrier
  },
  fontFamily: 'System',
  fontSizeBase: 16,
};

export default adultTheme;
