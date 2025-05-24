import { Tabs } from 'expo-router';
import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Composant pour le bouton Home central
function CustomHomeButton({ onPress, accessibilityState }: any) {
  const isSelected = accessibilityState?.selected;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        top: -25,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={isSelected ? ['#FF8A80', '#7986CB'] : ['#FF8A80', '#FFCC80']}
        style={{
          width: 65,
          height: 65,
          borderRadius: 32.5,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#FF8A80',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
          borderWidth: 4,
          borderColor: '#FFFFFF',
        }}
      >
        <Ionicons 
          name="home" 
          size={28} 
          color="white" 
        />
      </LinearGradient>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF8A80',
        tabBarInactiveTintColor: '#546E7A',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
          elevation: 8,
          shadowColor: '#37474F',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontWeight: '500',
          fontSize: 12,
          marginTop: 4,
        },
      }}
    >
      {/* Calendrier */}
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendrier',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'calendar' : 'calendar-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* Tâches */}
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tâches',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'checkmark-circle' : 'checkmark-circle-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* Home - Bouton central */}
      <Tabs.Screen
        name="index"
        options={{
          title: '', // Pas de label pour le bouton central
          tabBarButton: (props) => <CustomHomeButton {...props} />,
        }}
      />
      
      {/* Courses */}
      <Tabs.Screen
        name="shopping"
        options={{
          title: 'Courses',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'basket' : 'basket-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* Famille */}
      <Tabs.Screen
        name="family"
        options={{
          title: 'Famille',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'people' : 'people-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      
      {/* Masquer l'ancien explore s'il existe encore */}
      <Tabs.Screen
        name="explore"
        options={{
          href: null, // Cache cet onglet
        }}
      />
    </Tabs>
  );
}