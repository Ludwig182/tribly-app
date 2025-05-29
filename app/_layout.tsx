import 'react-native-gesture-handler';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import AuthTestScreen from '@/components/auth/AuthTestScreen';

import ThemeProvider from '@/theme/ThemeProvider';   // ← ton provider adaptatif

import { GestureHandlerRootView } from 'react-native-gesture-handler';

// 🎯 Composant App principal avec logique auth
function AppContent() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, isLoading } = useAuth();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null; // Chargement des polices

  // 🔄 Écran de chargement (init Firebase)
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={['#FF8A80', '#7986CB']} style={styles.loadingBackground}>
          <ActivityIndicator size="large" color="white" />
        </LinearGradient>
      </View>
    );
  }

  // 🔐 Authentification
  if (!isAuthenticated) return <AuthTestScreen />;

  // ✅ Application principale
  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <ThemeProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="+not-found" />
        </Stack>
      </ThemeProvider>
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AppContent />
        <StatusBar style="auto" />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1 },
  loadingBackground: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
