// 🎨 Design System Tribly - Couleurs étendues
export const Colors = {
  // Couleurs principales (existant)
  primary: {
    coral: '#FF8A80',
    violet: '#7986CB', 
    peach: '#FFCC80',
    white: '#FFFFFF',
    anthracite: '#37474F'
  },
  
  // Variations pour états (existant)
  variants: {
    coralLight: '#FFB3BA',
    coralDark: '#FF5252',
    violetLight: '#9FA8DA',
    violetDark: '#5C6BC0',
    peachLight: '#FFD54F',
    peachDark: '#FFB74D',
    anthraciteLight: '#546E7A',
    anthraciteDark: '#263238'
  },
  
  // États système (existant)
  system: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    outline: '#E0E0E0'
  },
  
  // Système Tribs (existant)
  tribs: {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2'
  },

  // 🆕 NOUVELLE SECTION : Palettes pour catégories/membres
  palettes: {
    // Palette Tribly - Dégradés réutilisables pour catégories et membres
    gradients: [
      { name: 'Corail-Violet', colors: ['#FF8A80', '#7986CB'] },
      { name: 'Pêche-Violet', colors: ['#FFCC80', '#A29BFE'] },
      { name: 'Vert-Nature', colors: ['#48bb78', '#38a169'] },
      { name: 'Bleu-Océan', colors: ['#4299e1', '#667eea'] },
      { name: 'Orange-Sunset', colors: ['#ed8936', '#dd6b20'] },
      { name: 'Violet-Mystique', colors: ['#9f7aea', '#805ad5'] },
      { name: 'Rose-Sakura', colors: ['#f093fb', '#f5576c'] },
      { name: 'Emeraude', colors: ['#11998e', '#38ef7d'] },
      { name: 'Indigo-Nuit', colors: ['#667eea', '#764ba2'] },
      { name: 'Sunset-Tropical', colors: ['#ffecd2', '#fcb69f'] }
    ]
  }
};