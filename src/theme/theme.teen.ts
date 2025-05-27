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
  },
  fontFamily: 'System',
  fontSizeBase: 16,
};

export default teenTheme;
