// src/components/tasks/TasksHeader.tsx - Version thématique
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useTheme } from '../../theme/useTheme';

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
      colors={[colors.primary, colors.secondary]} 
      style={styles.header}
    >
      <Text style={styles.title}>✅ Tâches & Tribs</Text>
      <Text style={styles.subtitle}>
        {familyName} • {urgentCount} urgent(es) • {todoCount} total
      </Text>
      {isDemo && (
        <Text style={styles.demo}>
          Mode démo – connectez-vous pour synchroniser
        </Text>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { 
    padding: 20, 
    borderBottomLeftRadius: 24, 
    borderBottomRightRadius: 24 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '600', 
    color: '#fff' 
  },
  subtitle: { 
    fontSize: 14, 
    color: 'rgba(255,255,255,0.95)', 
    marginTop: 4 
  },
  demo: { 
    fontSize: 12, 
    fontStyle: 'italic', 
    color: 'rgba(255,255,255,0.8)', 
    marginTop: 2 
  }
});