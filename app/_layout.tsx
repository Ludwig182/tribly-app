// app/_layout.tsx - Version temporaire avec écran de test
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/src/hooks/useAuth';
import AuthTestScreen from '@/src/components/auth/AuthTestScreen';

// 🎯 Composant App principal avec logique auth
function AppContent() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null; // Async font loading
  }

  // 🔄 Loading screen pendant l'initialisation Firebase
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={['#FF8A80', '#7986CB']}
          style={styles.loadingBackground}
        >
          <ActivityIndicator size="large" color="white" />
        </LinearGradient>
      </View>
    );
  }

  // 🔐 Si pas authentifié → AuthTestScreen (temporaire)
  if (!isAuthenticated) {
    return <AuthTestScreen />;
  }

  // ✅ Si authentifié → Navigation normale expo-router
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}

// 🚀 Layout racine avec AuthProvider
export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
      <StatusBar style="auto" />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },

  loadingBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});