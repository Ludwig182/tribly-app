// index.js – point d’entrée custom pour Expo Router
import 'react-native-gesture-handler';

import './src/config/firebase';      // ← initialise Firebase + Auth AVANT tout

// Expo Router fournit son propre entry ; on le ré-exporte simplement
export { ExpoRoot } from 'expo-router';
