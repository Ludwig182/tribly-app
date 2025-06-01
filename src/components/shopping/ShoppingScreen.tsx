// src/components/shopping/ShoppingScreen.tsx - VERSION AVEC COULEURS DU THÈME
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Text, Platform, StatusBar, SafeAreaView, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Import des hooks
import { useFamily } from '../../hooks/useFamily';
import { useTheme } from '../../theme/ThemeProvider'; // Import de useTheme

// Import des composants
import ShoppingStats from './ShoppingStats';
import ShoppingItemList from './ShoppingItemList';
import CategoryGrid from './CategoryGrid';
import FloatingActionButton from '../common/FloatingActionButton';

// Import des modaux
import AddItemModal from './modals/AddItemModal';
import AllCategoriesModal from './modals/AllCategoriesModal';
import CreateCategoryModal from './modals/CreateCategoryModal';

interface ShoppingItem {
  id: number;
  item: string;
  category: string;
  addedBy: string;
  checked: boolean;
}

interface Category {
  name: string;
  emoji: string;
  colors: string[];
  isDefault?: boolean;
  isCustom?: boolean;
  id?: string;
}

export default function ShoppingScreen() {
  const { familyName, loading: familyLoading, familyData } = useFamily();
  const { colors } = useTheme(); // Utilisation de useTheme pour obtenir l'objet colors

  // États principaux
  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([
    { id: 1, item: 'Lait', category: 'Frais', addedBy: 'Rosaly', checked: false },
    { id: 2, item: 'Pain complet', category: 'Boulangerie', addedBy: 'Ludwig', checked: true },
    { id: 3, item: 'Pommes', category: 'Fruits & Légumes', addedBy: 'Clémentine', checked: false },
    { id: 4, item: 'Pâtes', category: 'Épicerie', addedBy: 'Rosaly', checked: false },
    { id: 5, item: 'Yaourts', category: 'Frais', addedBy: 'Jacob', checked: true },
    { id: 6, item: 'Chocolat noir', category: 'Épicerie', addedBy: 'Clémentine', checked: false },
    { id: 7, item: 'Saumon', category: 'Poisson', addedBy: 'Ludwig', checked: false },
    { id: 8, item: 'Salade', category: 'Fruits & Légumes', addedBy: 'Rosaly', checked: false },
  ]);

  // États pour les modaux
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAllCategoriesModalVisible, setIsAllCategoriesModalVisible] = useState(false);
  const [isNewCategoryModalVisible, setIsNewCategoryModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Épicerie');
  const [currentUser] = useState('Rosaly'); // Devrait idéalement venir de useAuth

  // États pour création de catégorie
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🏷️');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // Catégories personnalisées (état local)
  const [customCategories, setCustomCategories] = useState<Category[]>([]);

  // Calculs dynamiques
  const uncheckedItems = shoppingList.filter(item => !item.checked);
  const checkedItems = shoppingList.filter(item => item.checked);
  const totalItems = shoppingList.length;

  // Données de configuration (catégories, couleurs, emojis)
  const predefinedCategories: Category[] = [
    { name: 'Frais', emoji: '🥛', colors: ['#FF8A80', '#7986CB'], isDefault: true },
    { name: 'Boulangerie', emoji: '🍞', colors: ['#FFCC80', '#A29BFE'], isDefault: true },
    { name: 'Fruits & Légumes', emoji: '🍎', colors: ['#48bb78', '#38a169'], isDefault: true },
    { name: 'Épicerie', emoji: '🥫', colors: ['#4299e1', '#667eea'], isDefault: true },
    { name: 'Surgelés', emoji: '🧊', colors: ['#ed8936', '#dd6b20'], isDefault: true },
    { name: 'Beauté & Soins', emoji: '🧴', colors: ['#9f7aea', '#805ad5'], isDefault: true },
    { name: 'Maison & Entretien', emoji: '🧽', colors: ['#f093fb', '#f5576c'], isDefault: true },
    { name: 'Poisson', emoji: '🐟', colors: ['#4299e1', '#667eea'] },
    { name: 'Boissons', emoji: '🍷', colors: ['#f093fb', '#f5576c'] },
    { name: 'Bébé', emoji: '👶', colors: ['#ffecd2', '#fcb69f'] },
    { name: 'Bricolage', emoji: '🏠', colors: ['#11998e', '#38ef7d'] },
    { name: 'Pâtisserie', emoji: '🎂', colors: ['#667eea', '#764ba2'] },
  ];
  const colorPalettes: string[][] = [
    ['#FF8A80', '#7986CB'], ['#FFCC80', '#A29BFE'], ['#48bb78', '#38a169'],
    ['#4299e1', '#667eea'], ['#ed8936', '#dd6b20'], ['#9f7aea', '#805ad5'],
    ['#f093fb', '#f5576c'], ['#11998e', '#38ef7d'], ['#667eea', '#764ba2'],
    ['#ffecd2', '#fcb69f'],
  ];
  const categoryEmojis: string[] = [
    '🏷️', '🛒', '🥤', '🧀', '🍖', '🧻', '🧴', '🎂', '🍕', '🍜', '🥗', '🍯', '☕', '🍪', '🧊', '🔧',
    '🎾', '📚', '🧸', '🌱', '🏠', '🚗', '💄', '🧼',
  ];

  // Fonctions utilitaires et handlers
  const getDefaultCategories = () => predefinedCategories.filter(cat => cat.isDefault);
  const getAllCategories = () => [...predefinedCategories, ...customCategories].sort((a, b) => a.name.localeCompare(b.name));
  const getCategoryColors = (categoryName: string) => {
    const category = getAllCategories().find(cat => cat.name === categoryName);
    return category?.colors || ['#e2e8f0', '#cbd5e0'];
  };
  const toggleItem = (itemId: number) => setShoppingList(prev => prev.map(it => it.id === itemId ? { ...it, checked: !it.checked } : it));
  const uncheckAll = () => Alert.alert('🛒 Vider le panier', 'Remettre tous les articles en "à acheter" ?', [{ text: 'Annuler', style: 'cancel' }, { text: 'Vider', style: 'destructive', onPress: () => setShoppingList(prev => prev.map(item => ({ ...item, checked: false }))) }]);
  const openModal = (category?: string) => { if (category) setSelectedCategory(category); setIsModalVisible(true); };
  const closeModal = () => { setIsModalVisible(false); setNewItemName(''); setSelectedCategory('Épicerie'); };
  const addNewItem = () => { if (!newItemName.trim()) { Alert.alert('❌ Erreur', "Veuillez saisir un nom d'article"); return; } const exists = shoppingList.some(item => item.item.toLowerCase() === newItemName.trim().toLowerCase()); if (exists) { Alert.alert('⚠️ Article existant', 'Cet article est déjà dans la liste'); return; } const newId = shoppingList.length > 0 ? Math.max(...shoppingList.map(item => item.id)) + 1 : 1; const newItemObj: ShoppingItem = { id: newId, item: newItemName.trim(), category: selectedCategory, addedBy: currentUser, checked: false }; setShoppingList(prev => [...prev, newItemObj]); Alert.alert('✅ Article ajouté !', `"${newItemName}" a été ajouté à la liste`); closeModal(); };
  const addNewCategory = () => { /* ... (votre logique existante) ... */ };
  const deleteCategory = (categoryId: string) => { /* ... (votre logique existante) ... */ };
  const closeNewCategoryModal = () => { /* ... (votre logique existante) ... */ };

  // Gestion de l'état de chargement pour familyName
  if (familyLoading || !familyData) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.textSecondary }}>Chargement des courses...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[colors.primary, colors.secondary]} // Utilisation des couleurs du thème
        style={styles.header}
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
            <Text style={[styles.headerTitle, { color: colors.onPrimary || 'white' }]}>🛒 Liste de Courses</Text>
            <Text style={[styles.headerSubtitle, { color: (colors.onPrimary ? colors.onPrimary + 'e6' : 'rgba(255,255,255,0.9)') }]}>
              Famille {familyName || 'Questroy'} • {uncheckedItems.length} articles restants
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <ShoppingStats
          totalItems={totalItems}
          uncheckedItems={uncheckedItems.length}
          checkedItems={checkedItems.length}
          onClearBasket={uncheckAll}
        />
        <ShoppingItemList
          uncheckedItems={uncheckedItems}
          checkedItems={checkedItems}
          totalItems={totalItems}
          onToggleItem={toggleItem}
          onRestartShopping={uncheckAll}
          getCategoryColors={getCategoryColors}
        />
        <CategoryGrid
          defaultCategories={getDefaultCategories()}
          onCategoryPress={openModal}
          onShowAllCategories={() => setIsAllCategoriesModalVisible(true)}
        />
        <View style={styles.bottomSpacer} />
      </ScrollView>

      <FloatingActionButton
        onPress={() => openModal()}
        colors={[colors.primary, colors.secondary]} // Utilisation des couleurs du thème
        icon="+"
        size={56} // Correspond à la taille de addBtn dans TasksContainer
        bottom={28} // Correspond à la position de addBtn
        right={24} // Correspond à la position de addBtn
        shadowColor={colors.primary} // Ombre assortie avec la couleur primaire du thème
      />

      <AddItemModal visible={isModalVisible} newItemName={newItemName} selectedCategory={selectedCategory} currentUser={currentUser} allCategories={getAllCategories()} onClose={closeModal} onAddItem={addNewItem} onItemNameChange={setNewItemName} onCategorySelect={setSelectedCategory} />
      <AllCategoriesModal visible={isAllCategoriesModalVisible} allCategories={getAllCategories()} customCategoriesCount={customCategories.length} onClose={() => setIsAllCategoriesModalVisible(false)} onCategorySelect={openModal} onDeleteCategory={deleteCategory} onCreateNewCategory={() => setIsNewCategoryModalVisible(true)} />
      <CreateCategoryModal visible={isNewCategoryModalVisible} newCategoryName={newCategoryName} selectedEmoji={selectedEmoji} selectedColorIndex={selectedColorIndex} customCategoriesCount={customCategories.length} colorPalettes={colorPalettes} categoryEmojis={categoryEmojis} onClose={closeNewCategoryModal} onCreateCategory={addNewCategory} onNameChange={setNewCategoryName} onEmojiSelect={setSelectedEmoji} onColorSelect={setSelectedColorIndex} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#f8f9fa', // Sera géré par le thème via style inline
  },
  header: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    position: 'absolute', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 999,
  },
  circle1: { width: 130, height: 130, top: -45, left: -35 },
  circle2: { width: 90, height: 90, bottom: -25, right: -25 },
  circle3: { width: 70, height: 70, top: 5, right: 50, opacity: 0.15 },
  headerSafeAreaInternal: {
    // Ce style est appliqué à la SafeAreaView interne.
  },
  headerActualContent: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22, fontWeight: '700',
    // color: 'white', // Géré par le thème via style inline
    marginBottom: 3,
  },
  headerSubtitle: {
    fontSize: 13,
    // color: 'rgba(255,255,255,0.9)', // Géré par le thème via style inline
  },
  content: {
    flex: 1,
    padding: 20,
  },
  bottomSpacer: {
    height: 80,
  },
});