// src/theme/theme.adult.ts
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
  },
  fontFamily: 'System',
  fontSizeBase: 16,
};

export default adultTheme;
