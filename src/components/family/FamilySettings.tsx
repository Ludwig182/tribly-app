// src/components/family/FamilySettings.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface SettingItem {
  title: string;
  description: string;
  emoji: string;
  colors: string[];
  onPress: () => void;
}

interface FamilySettingsProps {
  settings: SettingItem[];
}

export default function FamilySettings({ settings }: FamilySettingsProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>⚙️ Réglages famille</Text>
      
      {settings.map((setting, index) => (
        <TouchableOpacity key={index} style={styles.settingCard} onPress={setting.onPress}>
          <View style={styles.settingLeft}>
            <LinearGradient
              colors={setting.colors}
              style={styles.settingIcon}
            >
              <Text style={styles.settingEmoji}>{setting.emoji}</Text>
            </LinearGradient>
            <View>
              <Text style={styles.settingTitle}>{setting.title}</Text>
              <Text style={styles.settingDesc}>{setting.description}</Text>
            </View>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 25,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 15,
  },
  
  settingCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  
  settingEmoji: {
    fontSize: 18,
  },
  
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  
  settingDesc: {
    fontSize: 12,
    color: '#4a5568',
  },
  
  settingArrow: {
    fontSize: 20,
    color: '#cbd5e0',
    fontWeight: '300',
  },
});