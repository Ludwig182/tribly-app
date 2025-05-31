// src/components/home/TestComponent.tsx - Pour tester que les imports fonctionnent
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TestComponent() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>✅ Test Component fonctionne !</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'lightgreen',
    padding: 20,
    margin: 10,
    borderRadius: 10,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});