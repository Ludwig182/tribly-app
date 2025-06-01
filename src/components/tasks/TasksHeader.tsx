// src/components/tasks/TasksHeader.tsx - VERSION CORRECTE QUE VOUS AVEZ FOURNIE
import React from 'react';
// CET IMPORT EST CRUCIAL ET CORRECT ICI :
import { View, Text, StyleSheet, Platform, StatusBar, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';

interface Props {
  familyName?: string;
  urgentCount: number;
  todoCount: number;
  isDemo: boolean;
}

export default function TasksHeader({
  familyName = 'Famille',
  urgentCount,
  todoCount,
  isDemo
}: Props) {
  const { colors } = useTheme();

  return (
    <LinearGradient
      colors={[colors.primary, colors.secondary]} // Utilise les couleurs du thème
      style={styles.headerGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.headerPattern}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>

      <SafeAreaView style={styles.headerSafeAreaInternal}>
        <View style={styles.headerActualContent}>
          <Text style={[styles.title, { color: colors.onPrimary || 'white' }]}>✅ Tâches & Tribs</Text>
          <Text style={[styles.subtitle, { color: (colors.onPrimary ? colors.onPrimary + 'e6' : 'rgba(255,255,255,0.95)') }]}>
            {familyName} • {urgentCount} urgent(es) • {todoCount} total
          </Text>
          {isDemo && (
            <Text style={[styles.demo, { color: (colors.onPrimary ? colors.onPrimary + 'b3' : 'rgba(255,255,255,0.8)') }]}>
              Mode démo – connectez-vous pour synchroniser
            </Text>
          )}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0, // Utilisation de Platform
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    overflow: 'hidden',
  },
  headerPattern: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.2,
  },
  circle: {
    position: 'absolute', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 999,
  },
  circle1: { width: 100, height: 100, top: -30, left: -20 },
  circle2: { width: 70, height: 70, bottom: -15, right: -15 },
  circle3: { width: 50, height: 50, top: 5, right: 30, opacity: 0.15 },
  headerSafeAreaInternal: {},
  headerActualContent: { alignItems: 'center', },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 3, },
  subtitle: { fontSize: 13, textAlign: 'center', marginBottom: Platform.OS === 'ios' ? 2 : 0, }, // Utilisation de Platform
  demo: { fontSize: 12, fontStyle: 'italic', textAlign: 'center', marginTop: 2, }
});