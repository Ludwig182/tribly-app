import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function ShoppingScreen() {
  const shoppingList = [
    { id: 1, item: 'Lait', category: 'Frais', addedBy: 'Rosaly', checked: false },
    { id: 2, item: 'Pain complet', category: 'Boulangerie', addedBy: 'Ludwig', checked: true },
    { id: 3, item: 'Pommes', category: 'Fruits', addedBy: 'Clémentine', checked: false },
    { id: 4, item: 'Pâtes', category: 'Épicerie', addedBy: 'Rosaly', checked: false },
    { id: 5, item: 'Yaourts', category: 'Frais', addedBy: 'Jacob', checked: true },
    { id: 6, item: 'Chocolat noir', category: 'Épicerie', addedBy: 'Clémentine', checked: false },
    { id: 7, item: 'Saumon', category: 'Poisson', addedBy: 'Ludwig', checked: false },
    { id: 8, item: 'Salade', category: 'Légumes', addedBy: 'Rosaly', checked: false },
  ];

  const uncheckedItems = shoppingList.filter(item => !item.checked);
  const checkedItems = shoppingList.filter(item => item.checked);

  const categories = ['Frais', 'Boulangerie', 'Fruits', 'Épicerie', 'Poisson', 'Légumes'];
  const categoryColors = {
    'Frais': ['#FF8A80', '#7986CB'],
    'Boulangerie': ['#FFCC80', '#A29BFE'],
    'Fruits': ['#48bb78', '#38a169'],
    'Épicerie': ['#7986CB', '#FF8A80'],
    'Poisson': ['#4299e1', '#667eea'],
    'Légumes': ['#48bb78', '#68d391'],
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FFCC80', '#A29BFE']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerTitle}>🛒 Liste de Courses</Text>
        <Text style={styles.headerSubtitle}>Famille Questroy • {uncheckedItems.length} articles restants</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Stats rapides */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{shoppingList.length}</Text>
            <Text style={styles.statLabel}>Total articles</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{uncheckedItems.length}</Text>
            <Text style={styles.statLabel}>À acheter</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{checkedItems.length}</Text>
            <Text style={styles.statLabel}>Dans le panier</Text>
          </View>
        </View>

        {/* Articles à acheter */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🛍️ À acheter</Text>
          {uncheckedItems.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemHeader}>
                <TouchableOpacity style={styles.checkbox}>
                  <Text style={styles.checkboxEmpty}>○</Text>
                </TouchableOpacity>
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.item}</Text>
                  <Text style={styles.itemMeta}>
                    Ajouté par {item.addedBy}
                  </Text>
                </View>
                <LinearGradient
                  colors={categoryColors[item.category] || ['#e2e8f0', '#cbd5e0']}
                  style={styles.categoryBadge}
                >
                  <Text style={styles.categoryText}>{item.category}</Text>
                </LinearGradient>
              </View>
            </View>
          ))}
        </View>

        {/* Articles dans le panier */}
        {checkedItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Dans le panier</Text>
            {checkedItems.map((item) => (
              <View key={item.id} style={[styles.itemCard, styles.itemChecked]}>
                <View style={styles.itemHeader}>
                  <TouchableOpacity style={styles.checkbox}>
                    <Text style={styles.checkboxFilled}>✓</Text>
                  </TouchableOpacity>
                  <View style={styles.itemInfo}>
                    <Text style={[styles.itemName, styles.itemNameChecked]}>{item.item}</Text>
                    <Text style={styles.itemMeta}>
                      Ajouté par {item.addedBy}
                    </Text>
                  </View>
                  <LinearGradient
                    colors={categoryColors[item.category] || ['#e2e8f0', '#cbd5e0']}
                    style={[styles.categoryBadge, styles.categoryBadgeChecked]}
                  >
                    <Text style={styles.categoryText}>{item.category}</Text>
                  </LinearGradient>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Catégories rapides */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏷️ Ajouter par catégorie</Text>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity key={category} style={styles.categoryCard}>
                <LinearGradient
                  colors={categoryColors[category]}
                  style={styles.categoryIcon}
                >
                  <Text style={styles.categoryEmoji}>
                    {category === 'Frais' ? '🥛' : 
                     category === 'Boulangerie' ? '🍞' :
                     category === 'Fruits' ? '🍎' :
                     category === 'Épicerie' ? '🥫' :
                     category === 'Poisson' ? '🐟' : '🥬'}
                  </Text>
                </LinearGradient>
                <Text style={styles.categoryCardText}>{category}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bouton ajouter article */}
        <TouchableOpacity style={styles.addItemBtn}>
          <LinearGradient
            colors={['#FFCC80', '#A29BFE']}
            style={styles.addItemGradient}
          >
            <Text style={styles.addItemIcon}>+</Text>
            <Text style={styles.addItemText}>Ajouter un article</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 5,
  },
  
  headerSubtitle: {
    fontSize: 14,
    color: 'white',
    opacity: 0.9,
  },
  
  content: {
    flex: 1,
    padding: 20,
  },
  
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFCC80',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 12,
    color: '#4a5568',
    fontWeight: '500',
  },
  
  section: {
    marginBottom: 25,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 15,
  },
  
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  
  itemChecked: {
    opacity: 0.7,
    borderWidth: 1,
    borderColor: '#48bb78',
  },
  
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  checkbox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  checkboxEmpty: {
    fontSize: 20,
    color: '#cbd5e0',
  },
  
  checkboxFilled: {
    fontSize: 18,
    color: '#48bb78',
  },
  
  itemInfo: {
    flex: 1,
  },
  
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 2,
  },
  
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#4a5568',
  },
  
  itemMeta: {
    fontSize: 12,
    color: '#4a5568',
  },
  
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  
  categoryBadgeChecked: {
    opacity: 0.6,
  },
  
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  categoryEmoji: {
    fontSize: 20,
  },
  
  categoryCardText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2d3748',
    textAlign: 'center',
  },
  
  addItemBtn: {
    marginTop: 10,
    marginBottom: 20,
  },
  
  addItemGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
    gap: 8,
  },
  
  addItemIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  
  addItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
  bottomSpacer: {
    height: 100,
  },
});