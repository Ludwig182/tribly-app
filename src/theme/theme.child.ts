// src/theme/theme.child.ts
import { Theme } from './theme.types';

const childTheme: Theme = {
  name: 'child',
  colors: {
    primary: '#FFCA28',             // Jaune vif
    secondary: '#29B6F6',           // Cyan clair ludique
    background: '#FFFFFF',
    text: '#212121',
    accent: '#FFCA28',
    primaryLight : 'rgba(255, 255, 255, 0.1)',

    border: '#E0E0E0',              // Gris clair discret
    textSecondary: '#616161',       // Lisibilité facile (secondaire)
    textTertiary: '#9E9E9E',        // Texte tertiaire clair

    dangerBackground: '#FFEBEE',    // Rouge clair (douceur pour erreur)
    dangerBorder: '#F44336',        // Rouge vif d'avertissement
    dangerText: '#D32F2F',          // Rouge foncé (texte erreur)

    card: '#FFFDE7',                // Jaune très pâle pour cartes
    overlayLight: 'rgba(255,255,255,0.4)',
    overlayLightStrong: 'rgba(255,255,255,0.5)',
    overlayDark: 'rgba(0,0,0,0.4)',

    shadow: 'rgba(0,0,0,0.15)',
    shadowLight: 'rgba(0,0,0,0.08)',
    onPrimary: '#212121',           // Texte sombre sur fond primaire clair

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
  fontSizeBase: 17, // légèrement agrandie pour faciliter la lecture chez les enfants
};

export default childTheme;
