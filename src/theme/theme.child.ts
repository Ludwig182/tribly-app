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
  },
  fontFamily: 'System',
  fontSizeBase: 17, // légèrement agrandie pour faciliter la lecture chez les enfants
};

export default childTheme;
