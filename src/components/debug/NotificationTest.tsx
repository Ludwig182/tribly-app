import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { useTheme } from '../../theme/useTheme';

export default function NotificationTest() {
  const theme = useTheme();
  const [status, setStatus] = useState<string>('Non testé');
  const [token, setToken] = useState<string>('');

  const testPermissions = async () => {
    try {
      const { status: existing } = await Notifications.getPermissionsAsync();
      setStatus(`Permissions: ${existing}`);
      
      if (existing !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        setStatus(`Nouvelles permissions: ${status}`);
        return status === 'granted';
      }
      return true;
    } catch (error) {
      setStatus(`Erreur permissions: ${error}`);
      return false;
    }
  };

  const testToken = async () => {
    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        setStatus('❌ Project ID manquant dans app.json');
        return;
      }
      
      const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
      setToken(tokenData.data);
      setStatus('✅ Token obtenu');
    } catch (error) {
      setStatus(`❌ Erreur token: ${error}`);
    }
  };

  const testLocalNotification = async () => {
    try {
      const hasPermission = await testPermissions();
      if (!hasPermission) {
        Alert.alert('Erreur', 'Permissions refusées');
        return;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🧪 Test Tribly',
          body: 'Si tu vois cette notification, ça marche !',
          data: { test: true },
        },
        trigger: { seconds: 2 },
      });
      
      setStatus(`✅ Notification programmée: ${notificationId}`);
      Alert.alert('Succès', 'Notification programmée dans 2 secondes');
    } catch (error) {
      setStatus(`❌ Erreur: ${error}`);
      Alert.alert('Erreur', `${error}`);
    }
  };

  const styles = StyleSheet.create({
    container: {
      padding: 20,
      backgroundColor: theme.colors.background,
      margin: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 15,
    },
    button: {
      backgroundColor: theme.colors.primary,
      padding: 12,
      borderRadius: 8,
      marginVertical: 5,
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    status: {
      marginTop: 15,
      padding: 10,
      backgroundColor: theme.colors.surface,
      borderRadius: 5,
    },
    statusText: {
      color: theme.colors.text,
      fontSize: 12,
    },
    token: {
      marginTop: 10,
      padding: 10,
      backgroundColor: theme.colors.surface,
      borderRadius: 5,
    },
    tokenText: {
      color: theme.colors.text,
      fontSize: 10,
      fontFamily: 'monospace',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔔 Test Notifications</Text>
      
      <TouchableOpacity style={styles.button} onPress={testPermissions}>
        <Text style={styles.buttonText}>Tester Permissions</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testToken}>
        <Text style={styles.buttonText}>Tester Token Push</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={testLocalNotification}>
        <Text style={styles.buttonText}>Tester Notification Locale</Text>
      </TouchableOpacity>
      
      <View style={styles.status}>
        <Text style={styles.statusText}>Status: {status}</Text>
      </View>
      
      {token ? (
        <View style={styles.token}>
          <Text style={styles.tokenText}>Token: {token.substring(0, 50)}...</Text>
        </View>
      ) : null}
    </View>
  );
}