// app/(tabs)/_layout.tsx - Sans auth pour tester d'abord
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { FamilyProvider } from '../../src/hooks/useFamily';

export default function TabLayout() {
  return (
    <FamilyProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FF8A80',
          tabBarInactiveTintColor: '#666',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            height: 90,
            paddingBottom: 20,
            paddingTop: 10,
          },
        }}
      >
        <Tabs.Screen
          name="calendar"
          options={{
            title: 'Calendrier',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calendar-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tâches',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="checkmark-circle-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, focused }) => (
              <View style={{
                backgroundColor: '#FF8A80',
                width: 60,
                height: 60,
                borderRadius: 30,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 20,
                elevation: 8,
                shadowColor: '#FF8A80',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}>
                <Ionicons name="home" size={28} color="white" />
              </View>
            ),
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="shopping"
          options={{
            title: 'Courses',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="basket-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="family"
          options={{
            title: 'Famille',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </FamilyProvider>
  );
}