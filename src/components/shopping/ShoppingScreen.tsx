// src/components/shopping/ShoppingScreen.tsx
import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from 'react-native';

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

export default function ShoppingScreen() {
  // 🗃️ États principaux
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

  // 📝 États pour les modaux
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAllCategoriesModalVisible, setIsAllCategoriesModalVisible] = useState(false);
  const [isNewCategoryModalVisible, setIsNewCategoryModalVisible] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Épicerie');
  const [currentUser] = useState('Rosaly');

  // États pour création de catégorie
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🏷️');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  // 🆕 Catégories personnalisées (état local)
  const [customCategories, setCustomCategories] = useState([]);

  // 📊 Calculs dynamiques
  const uncheckedItems = shoppingList.filter(item => !item.checked);
  const checkedItems = shoppingList.filter(item => item.checked);
  const totalItems = shoppingList.length;

  // 🏷️ Catégories prédéfinies
  const predefinedCategories = [
    { name: 'Frais', emoji: '🥛', colors: ['#FF8A80', '#7986CB'], isDefault: true },
    { name: 'Boulangerie', emoji: '🍞', colors: ['#FFCC80', '#A29BFE'], isDefault: true },
    { name: 'Fruits & Légumes', emoji: '🍎', colors: ['#48bb78', '#38a169'], isDefault: true },
    { name: 'Épicerie', emoji: '🥫', colors: ['#4299e1', '#667eea'], isDefault: true },
    { name: 'Surgelés', emoji: '🧊', colors: ['#ed8936', '#dd6b20'], isDefault: true },
    { name: 'Beauté & Soins', emoji: '🧴', colors: ['#9f7aea', '#805ad5'], isDefault: true },
    { name: 'Maison & Entretien', emoji: '🧽', colors: ['#f093fb', '#f5576c'], isDefault: true },
    { name: 'Poisson', emoji: '🐟', colors: ['#4299e1', '#667eea'], isDefault: false },
    { name: 'Boissons', emoji: '🍷', colors: ['#f093fb', '#f5576c'], isDefault: false },
    { name: 'Bébé', emoji: '👶', colors: ['#ffecd2', '#fcb69f'], isDefault: false },
    { name: 'Bricolage', emoji: '🏠', colors: ['#11998e', '#38ef7d'], isDefault: false },
    { name: 'Pâtisserie', emoji: '🎂', colors: ['#667eea', '#764ba2'], isDefault: false },
  ];

  // Palettes de couleurs disponibles
  const colorPalettes = [
    ['#FF8A80', '#7986CB'], // Corail-Violet
    ['#FFCC80', '#A29BFE'], // Pêche-Violet  
    ['#48bb78', '#38a169'], // Vert-Nature
    ['#4299e1', '#667eea'], // Bleu-Océan
    ['#ed8936', '#dd6b20'], // Orange-Sunset
    ['#9f7aea', '#805ad5'], // Violet-Mystique
    ['#f093fb', '#f5576c'], // Rose-Sakura
    ['#11998e', '#38ef7d'], // Emeraude
    ['#667eea', '#764ba2'], // Indigo-Nuit
    ['#ffecd2', '#fcb69f'], // Sunset-Tropical
  ];

  // Emojis prédéfinis pour catégories
  const categoryEmojis = [
    '🏷️', '🛒', '🥤', '🧀', '🍖', '🧻', '🧴', '🎂',
    '🍕', '🍜', '🥗', '🍯', '☕', '🍪', '🧊', '🔧',
    '🎾', '📚', '🧸', '🌱', '🏠', '🚗', '💄', '🧼',
  ];

  // 🎯 Fonctions utilitaires
  const getDefaultCategories = () => predefinedCategories.filter(cat => cat.isDefault);
  
  const getAllCategories = () => {
    const all = [...predefinedCategories, ...customCategories];
    return all.sort((a, b) => a.name.localeCompare(b.name));
  };

  const getCategoryColors = (categoryName) => {
    const category = getAllCategories().find(cat => cat.name === categoryName);
    return category?.colors || ['#e2e8f0', '#cbd5e0'];
  };

  // 🎯 Fonction pour toggle un article
  const toggleItem = (itemId: number) => {
    setShoppingList(prevList => 
      prevList.map(item => 
        item.id === itemId 
          ? { ...item, checked: !item.checked }
          : item
      )
    );
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

  // 📝 Fonctions pour le modal d'ajout
  const openModal = (category?: string) => {
    if (category) {
      setSelectedCategory(category);
    }
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setNewItemName('');
    setSelectedCategory('Épicerie');
  };

  const addNewItem = () => {
    if (!newItemName.trim()) {
      Alert.alert('❌ Erreur', 'Veuillez saisir un nom d\'article');
      return;
    }

    const exists = shoppingList.some(item => 
      item.item.toLowerCase() === newItemName.trim().toLowerCase()
    );

    if (exists) {
      Alert.alert('⚠️ Article existant', 'Cet article est déjà dans la liste');
      return;
    }

    const newId = Math.max(...shoppingList.map(item => item.id)) + 1;
    const newItem: ShoppingItem = {
      id: newId,
      item: newItemName.trim(),
      category: selectedCategory,
      addedBy: currentUser,
      checked: false
    };

    setShoppingList(prev => [...prev, newItem]);

    Alert.alert(
      '✅ Article ajouté !', 
      `"${newItemName}" a été ajouté à la liste`,
      [{ text: 'Super !', style: 'default' }]
    );

    closeModal();
  };

  // 🆕 Fonctions pour catégories personnalisées
  const addNewCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert('❌ Erreur', 'Veuillez saisir un nom de catégorie');
      return;
    }

    if (customCategories.length >= 10) {
      Alert.alert('⚠️ Limite atteinte', 'Maximum 10 catégories personnalisées autorisées');
      return;
    }

    const exists = getAllCategories().some(cat => 
      cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );

    if (exists) {
      Alert.alert('⚠️ Catégorie existante', 'Cette catégorie existe déjà');
      return;
    }

    const newCategory = {
      id: `custom-${Date.now()}`,
      name: newCategoryName.trim(),
      emoji: selectedEmoji,
      colors: colorPalettes[selectedColorIndex],
      isDefault: false,
      isCustom: true
    };

    setCustomCategories(prev => [...prev, newCategory]);

    Alert.alert(
      '✅ Catégorie créée !', 
      `"${newCategoryName}" est maintenant disponible`,
      [{ text: 'Super !', style: 'default' }]
    );

    closeNewCategoryModal();
  };

  const deleteCategory = (categoryId) => {
    const isUsed = shoppingList.some(item => {
      const category = getAllCategories().find(cat => cat.name === item.category);
      return category?.id === categoryId;
    });

    if (isUsed) {
      Alert.alert(
        '⚠️ Catégorie utilisée', 
        'Cette catégorie ne peut pas être supprimée car elle est utilisée par des articles.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    Alert.alert(
      '🗑️ Supprimer la catégorie',
      'Êtes-vous sûr de vouloir supprimer cette catégorie ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Supprimer', 
          style: 'destructive',
          onPress: () => {
            setCustomCategories(prev => prev.filter(cat => cat.id !== categoryId));
            Alert.alert('✅ Supprimée', 'La catégorie a été supprimée');
          }
        }
      ]
    );
  };

  const closeNewCategoryModal = () => {
    setIsNewCategoryModalVisible(false);
    setNewCategoryName('');
    setSelectedEmoji('🏷️');
    setSelectedColorIndex(0);
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
        <Text style={styles.headerSubtitle}>
          Famille Questroy • {uncheckedItems.length} articles restants
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Statistiques */}
        <ShoppingStats
          totalItems={totalItems}
          uncheckedItems={uncheckedItems.length}
          checkedItems={checkedItems.length}
          onClearBasket={uncheckAll}
        />

        {/* Listes d'articles */}
        <ShoppingItemList
          uncheckedItems={uncheckedItems}
          checkedItems={checkedItems}
          totalItems={totalItems}
          onToggleItem={toggleItem}
          onRestartShopping={uncheckAll}
          getCategoryColors={getCategoryColors}
        />

        {/* Grille des catégories */}
        <CategoryGrid
          defaultCategories={getDefaultCategories()}
          onCategoryPress={openModal}
          onShowAllCategories={() => setIsAllCategoriesModalVisible(true)}
        />

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bouton flottant d'ajout */}
      <FloatingActionButton
        onPress={() => openModal()}
        colors={['#FFCC80', '#A29BFE']}
        icon="+"
        shadowColor="#FFCC80"
      />

      {/* Modaux */}
      <AddItemModal
        visible={isModalVisible}
        newItemName={newItemName}
        selectedCategory={selectedCategory}
        currentUser={currentUser}
        allCategories={getAllCategories()}
        onClose={closeModal}
        onAddItem={addNewItem}
        onItemNameChange={setNewItemName}
        onCategorySelect={setSelectedCategory}
      />

      <AllCategoriesModal
        visible={isAllCategoriesModalVisible}
        allCategories={getAllCategories()}
        customCategoriesCount={customCategories.length}
        onClose={() => setIsAllCategoriesModalVisible(false)}
        onCategorySelect={openModal}
        onDeleteCategory={deleteCategory}
        onCreateNewCategory={() => setIsNewCategoryModalVisible(true)}
      />

      <CreateCategoryModal
        visible={isNewCategoryModalVisible}
        newCategoryName={newCategoryName}
        selectedEmoji={selectedEmoji}
        selectedColorIndex={selectedColorIndex}
        customCategoriesCount={customCategories.length}
        colorPalettes={colorPalettes}
        categoryEmojis={categoryEmojis}
        onClose={closeNewCategoryModal}
        onCreateCategory={addNewCategory}
        onNameChange={setNewCategoryName}
        onEmojiSelect={setSelectedEmoji}
        onColorSelect={setSelectedColorIndex}
      />
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
  
  bottomSpacer: {
    height: 50,
  },
});