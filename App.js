import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import des couleurs
import { Colors, Fonts } from './src/utils';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor={Colors.primary.coral} />
      
      {/* Header avec gradient Tribly */}
      <LinearGradient
        colors={[Colors.primary.coral, Colors.primary.peach]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.title}>Tribly</Text>
        <Text style={styles.subtitle}>Organisation familiale intelligente</Text>
      </LinearGradient>

      {/* Contenu principal */}
      <View style={styles.content}>
        <View style={styles.welcomeCard}>
          <Text style={styles.welcome}>🎉 Bienvenue dans Tribly !</Text>
          <Text style={styles.description}>
            Ton app d'organisation familiale avec système Tribs est prête.
          </Text>
          
          <View style={styles.featuresContainer}>
            <View style={styles.feature}>
              <Text style={styles.featureEmoji}>📅</Text>
              <Text style={styles.featureText}>Calendrier partagé</Text>
            </View>
            
            <View style={styles.feature}>
              <Text style={styles.featureEmoji}>✅</Text>
              <Text style={styles.featureText}>Tâches gamifiées</Text>
            </View>
            
            <View style={styles.feature}>
              <Text style={styles.featureEmoji}>🏆</Text>
              <Text style={styles.featureText}>Système Tribs</Text>
            </View>
            
            <View style={styles.feature}>
              <Text style={styles.featureEmoji}>🛒</Text>
              <Text style={styles.featureText}>Listes de courses</Text>
            </View>
          </View>
        </View>

        <Text style={styles.nextStep}>
          Prochaine étape : Navigation et écrans principaux 🚀
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Colors.system.background en dur pour éviter l'erreur
  },
  
  header: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    alignItems: 'center',
  },
  
  title: {
    fontSize: 32, // Fonts.size.hero en dur
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  
  subtitle: {
    fontSize: 16, // Fonts.size.base en dur
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#37474F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  welcome: {
    fontSize: 20, // Fonts.size.xl en dur
    fontWeight: 'bold',
    color: '#37474F',
    textAlign: 'center',
    marginBottom: 10,
  },
  
  description: {
    fontSize: 16,
    color: '#546E7A',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  
  featuresContainer: {
    width: '100%',
  },
  
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  featureEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  
  featureText: {
    fontSize: 16,
    color: '#37474F',
    fontWeight: '500',
  },
  
  nextStep: {
    fontSize: 14,
    color: '#546E7A',
    textAlign: 'center',
    marginTop: 30,
    fontStyle: 'italic',
  },
});