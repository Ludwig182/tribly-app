// app/(tabs)/shopping.tsx - Version interactive
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ShoppingItem {
  id: number;
  item: string;
  category: string;
  addedBy: string;
  checked: boolean;
}

export default function ShoppingScreen() {
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([
    { id: 1, item: 'Lait', category: 'Frais', addedBy: 'Rosaly', checked: false },
    { id: 2, item: 'Pain complet', category: 'Boulangerie', addedBy: 'Ludwig', checked: true },
    { id: 3, item: 'Pommes', category: 'Fruits', addedBy: 'Clémentine', checked: false },
    { id: 4, item: 'Pâtes', category: 'Épicerie', addedBy: 'Rosaly', checked: false },
    { id: 5, item: 'Yaourts', category: 'Frais', addedBy: 'Jacob', checked: true },
    { id: 6, item: 'Chocolat noir', category: 'Épicerie', addedBy: 'Clémentine', checked: false },
    { id: 7, item: 'Saumon', category: 'Poisson', addedBy: 'Ludwig', checked: false },
    { id: 8, item: 'Salade', category: 'Légumes', addedBy: 'Rosaly', checked: false },
  ]);

  // 📊 Calculs dynamiques
  const uncheckedItems = shoppingList.filter(item => !item.checked);
  const checkedItems = shoppingList.filter(item => item.checked);
  const totalItems = shoppingList.length;

  // 🎯 Fonction pour toggle un article
  const toggleItem = (itemId: number) => {
    setShoppingList(prevList => 
      prevList.map(item => 
        item.id === itemId 
          ? { ...item, checked: !item.checked }
          : item
      )
    );

    // Feedback léger (optionnel)
    const item = shoppingList.find(i => i.id === itemId);
    if (item && !item.checked) {
      // On vient de cocher l'article
      // On pourrait ajouter un petit feedback sonore ici
    }
  };

  // 🔄 Fonction pour décocher tous les articles
  const uncheckAll = () => {
    Alert.alert(
      '🛒 Vider le panier',
      'Remettre tous les articles en "à acheter" ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Vider', 
          style: 'destructive',
          onPress: () => setShoppingList(prev => 
            prev.map(item => ({ ...item, checked: false }))
          )
        }
      ]
    );
  };

  const categories = ['Frais', 'Boulangerie', 'Fruits', 'Épicerie', 'Poisson', 'Légumes'];
  const categoryColors: { [key: string]: string[] } = {
    'Frais': ['#FF8A80', '#7986CB'],
    'Boulangerie': ['#FFCC80', '#A29BFE'],
    'Fruits': ['#48bb78', '#38a169'],
    'Épicerie': ['#7986CB', '#FF8A80'],
    'Poisson': ['#4299e1', '#667eea'],
    'Légumes': ['#48bb78', '#68d391'],
  };

  // 📋 Composant pour afficher un article (éviter duplication)
  const ShoppingItemComponent = ({ item }: { item: ShoppingItem }) => (
    <TouchableOpacity 
      key={item.id} 
      style={[styles.itemCard, item.checked && styles.itemChecked]}
      onPress={() => toggleItem(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.itemHeader}>
        <View style={styles.checkbox}>
          <Text style={item.checked ? styles.checkboxFilled : styles.checkboxEmpty}>
            {item.checked ? '✓' : '○'}
          </Text>
        </View>
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, item.checked && styles.itemNameChecked]}>
            {item.item}
          </Text>
          <Text style={styles.itemMeta}>
            Ajouté par {item.addedBy}
          </Text>
        </View>
        <LinearGradient
          colors={categoryColors[item.category] || ['#e2e8f0', '#cbd5e0']}
          style={[styles.categoryBadge, item.checked && styles.categoryBadgeChecked]}
        >
          <Text style={styles.categoryText}>{item.category}</Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerSubtitle}>
          Famille Questroy • {uncheckedItems.length} articles restants
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Stats rapides - Maintenant dynamiques */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalItems}</Text>
            <Text style={styles.statLabel}>Total articles</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#ed8936' }]}>{uncheckedItems.length}</Text>
            <Text style={styles.statLabel}>À acheter</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: '#48bb78' }]}>{checkedItems.length}</Text>
            <Text style={styles.statLabel}>Dans le panier</Text>
          </View>
          {checkedItems.length > 0 && (
            <TouchableOpacity style={styles.statCard} onPress={uncheckAll}>
              <Text style={[styles.statNumber, { color: '#f56565' }]}>🗑️</Text>
              <Text style={[styles.statLabel, { color: '#f56565' }]}>Vider</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Articles à acheter */}
        {uncheckedItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛍️ À acheter ({uncheckedItems.length})</Text>
            {uncheckedItems.map(item => (
              <ShoppingItemComponent key={item.id} item={item} />
            ))}
          </View>
        )}

        {/* Articles dans le panier */}
        {checkedItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Dans le panier ({checkedItems.length})</Text>
            {checkedItems.map(item => (
              <ShoppingItemComponent key={item.id} item={item} />
            ))}
          </View>
        )}

        {/* Message si liste vide */}
        {totalItems === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>Liste de courses vide</Text>
            <Text style={styles.emptySubtext}>Ajoutez vos premiers articles !</Text>
          </View>
        )}

        {/* Message si tout coché */}
        {totalItems > 0 && uncheckedItems.length === 0 && (
          <View style={styles.completedState}>
            <Text style={styles.completedIcon}>🎉</Text>
            <Text style={styles.completedText}>Courses terminées !</Text>
            <Text style={styles.completedSubtext}>
              Tous les articles sont dans le panier
            </Text>
            <TouchableOpacity style={styles.restartBtn} onPress={uncheckAll}>
              <Text style={styles.restartText}>🔄 Recommencer les courses</Text>
            </TouchableOpacity>
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
    gap: 8,
    marginBottom: 25,
  },
  
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFCC80',
    marginBottom: 4,
  },
  
  statLabel: {
    fontSize: 10,
    color: '#4a5568',
    fontWeight: '500',
    textAlign: 'center',
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
    backgroundColor: '#f0fff4',
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
    fontWeight: '600',
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

  // ✨ Nouveaux styles pour états spéciaux
  emptyState: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: 50,
  },

  emptyIcon: {
    fontSize: 48,
    marginBottom: 15,
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 5,
  },

  emptySubtext: {
    fontSize: 14,
    color: '#4a5568',
  },

  completedState: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 25,
    borderWidth: 2,
    borderColor: '#48bb78',
  },

  completedIcon: {
    fontSize: 48,
    marginBottom: 15,
  },

  completedText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#48bb78',
    marginBottom: 5,
  },

  completedSubtext: {
    fontSize: 14,
    color: '#4a5568',
    marginBottom: 20,
    textAlign: 'center',
  },

  restartBtn: {
    backgroundColor: '#f7fafc',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  restartText: {
    fontSize: 14,
    color: '#4a5568',
    fontWeight: '500',
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