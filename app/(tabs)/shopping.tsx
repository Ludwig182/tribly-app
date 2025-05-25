// app/(tabs)/shopping.tsx - Version avec catégories étendues
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import FloatingActionButton from '../../src/components/common/FloatingActionButton';

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

  // 🆕 Catégories personnalisées (état local)
  const [customCategories, setCustomCategories] = useState([]);

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

  // Fonctions utilitaires
  const getDefaultCategories = () => predefinedCategories.filter(cat => cat.isDefault);
  
  const getAllCategories = () => {
    const all = [...predefinedCategories, ...customCategories];
    return all.sort((a, b) => a.name.localeCompare(b.name)); // 🔤 Ordre alphabétique
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

  // 📝 Fonctions pour les modaux
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

    // Vérifier la limite (10 catégories max)
    if (customCategories.length >= 10) {
      Alert.alert('⚠️ Limite atteinte', 'Maximum 10 catégories personnalisées autorisées');
      return;
    }

    // Vérifier si le nom existe déjà
    const exists = getAllCategories().some(cat => 
      cat.name.toLowerCase() === newCategoryName.trim().toLowerCase()
    );

    if (exists) {
      Alert.alert('⚠️ Catégorie existante', 'Cette catégorie existe déjà');
      return;
    }

    // Créer la nouvelle catégorie
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
    // Vérifier si la catégorie est utilisée
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

  // 📋 Composant pour afficher un article
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
          colors={getCategoryColors(item.category)}
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
        {/* Stats rapides */}
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

        {/* 🆕 Catégories mises à jour - 7 + Autres */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏷️ Ajouter par catégorie</Text>
          <View style={styles.categoriesGrid}>
            {getDefaultCategories().map((category) => (
              <TouchableOpacity 
                key={category.name} 
                style={styles.categoryCard}
                onPress={() => openModal(category.name)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={category.colors}
                  style={styles.categoryIcon}
                >
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                </LinearGradient>
                <Text 
                  style={styles.categoryCardText}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
            
            {/* 🆕 Bouton "Autres" */}
            <TouchableOpacity 
              style={[styles.categoryCard, styles.categoryCardOthers]}
              onPress={() => setIsAllCategoriesModalVisible(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.categoryIcon, styles.categoryIconOthers]}>
                <Text style={styles.categoryEmoji}>➕</Text>
              </View>
              <Text 
                style={styles.categoryCardText}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Autres
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Bouton flottant d'ajout */}
      <FloatingActionButton
        onPress={() => openModal()}
        colors={['#FFCC80', '#A29BFE']}
        icon="+"
        shadowColor="#FFCC80"
      />

      {/* Modal d'ajout d'article */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={closeModal}
              >
                <Text style={styles.modalCloseText}>Annuler</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Ajouter un article</Text>
              <TouchableOpacity 
                style={[styles.modalSaveBtn, !newItemName.trim() && styles.modalSaveBtnDisabled]}
                onPress={addNewItem}
                disabled={!newItemName.trim()}
              >
                <Text style={[styles.modalSaveText, !newItemName.trim() && styles.modalSaveTextDisabled]}>
                  Ajouter
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>📝 Nom de l'article</Text>
                <TextInput
                  style={styles.textInput}
                  value={newItemName}
                  onChangeText={setNewItemName}
                  placeholder="Ex: Bananes, Fromage, Shampoing..."
                  placeholderTextColor="#a0aec0"
                  autoFocus={true}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>🏷️ Catégorie</Text>
                <View style={styles.categorySelector}>
                  {getAllCategories().map((category) => (
                    <TouchableOpacity
                      key={category.name}
                      style={[
                        styles.categoryOption,
                        selectedCategory === category.name && styles.categoryOptionSelected
                      ]}
                      onPress={() => setSelectedCategory(category.name)}
                    >
                      <LinearGradient
                        colors={selectedCategory === category.name ? category.colors : ['#f7fafc', '#edf2f7']}
                        style={styles.categoryOptionIcon}
                      >
                        <Text style={styles.categoryOptionEmoji}>{category.emoji}</Text>
                      </LinearGradient>
                      <Text style={[
                        styles.categoryOptionText,
                        selectedCategory === category.name && styles.categoryOptionTextSelected
                      ]}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      >
                        {category.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.infoSection}>
                <Text style={styles.infoText}>
                  👤 Ajouté par {currentUser}
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* 🆕 Modal "Nouvelle catégorie" */}
      <Modal
        visible={isNewCategoryModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeNewCategoryModal}
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <SafeAreaView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={closeNewCategoryModal}
              >
                <Text style={styles.modalCloseText}>Annuler</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>✨ Nouvelle catégorie</Text>
              <TouchableOpacity 
                style={[styles.modalSaveBtn, !newCategoryName.trim() && styles.modalSaveBtnDisabled]}
                onPress={addNewCategory}
                disabled={!newCategoryName.trim()}
              >
                <Text style={[styles.modalSaveText, !newCategoryName.trim() && styles.modalSaveTextDisabled]}>
                  Créer
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Nom de la catégorie */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>📝 Nom de la catégorie</Text>
                <TextInput
                  style={styles.textInput}
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder="Ex: Bio, Animalerie, Jardinage..."
                  placeholderTextColor="#a0aec0"
                  autoFocus={true}
                  returnKeyType="next"
                />
              </View>

              {/* Choix d'emoji */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>😊 Emoji</Text>
                <View style={styles.emojiSelector}>
                  {categoryEmojis.map((emoji, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.emojiOption,
                        selectedEmoji === emoji && styles.emojiOptionSelected
                      ]}
                      onPress={() => setSelectedEmoji(emoji)}
                    >
                      <Text style={styles.emojiOptionText}>{emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Choix de couleur */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>🎨 Couleur</Text>
                <View style={styles.colorSelector}>
                  {colorPalettes.map((colors, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.colorOption,
                        selectedColorIndex === index && styles.colorOptionSelected
                      ]}
                      onPress={() => setSelectedColorIndex(index)}
                    >
                      <LinearGradient
                        colors={colors}
                        style={styles.colorOptionGradient}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Prévisualisation */}
              <View style={styles.previewSection}>
                <Text style={styles.inputLabel}>👀 Aperçu</Text>
                <View style={styles.categoryPreview}>
                  <LinearGradient
                    colors={colorPalettes[selectedColorIndex]}
                    style={styles.categoryIcon}
                  >
                    <Text style={styles.categoryEmoji}>{selectedEmoji}</Text>
                  </LinearGradient>
                  <Text 
                    style={styles.categoryCardText}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {newCategoryName || 'Votre catégorie'}
                  </Text>
                </View>
              </View>

              {/* Info limite */}
              <View style={styles.infoSection}>
                <Text style={styles.infoText}>
                  📊 {customCategories.length}/10 catégories personnalisées
                </Text>
              </View>
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>

      {/* 🆕 Modal "Toutes les catégories" */}
      <Modal
        visible={isAllCategoriesModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsAllCategoriesModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              style={styles.modalCloseBtn}
              onPress={() => setIsAllCategoriesModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>Fermer</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>📋 Toutes les catégories</Text>
            <View style={styles.modalSaveBtn} />
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.allCategoriesGrid}>
              {getAllCategories().map((category) => (
                <View key={category.name || category.id} style={styles.categoryCardContainer}>
                  <TouchableOpacity 
                    style={[styles.categoryCard, styles.categoryCardInContainer]}
                    onPress={() => {
                      setIsAllCategoriesModalVisible(false);
                      openModal(category.name);
                    }}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={category.colors}
                      style={styles.categoryIcon}
                    >
                      <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                    </LinearGradient>
                    <Text 
                      style={styles.categoryCardText}
                      numberOfLines={2} 
                      ellipsizeMode="tail"
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                  
                  {/* 🗑️ Bouton supprimer pour catégories custom */}
                  {category.isCustom && (
                    <TouchableOpacity 
                      style={styles.deleteCategoryBtn}
                      onPress={() => deleteCategory(category.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.deleteCategoryText}>×</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              
              {/* 🆕 Bouton créer nouvelle catégorie */}
              <TouchableOpacity 
                style={[styles.categoryCard, styles.createCategoryCard]}
                onPress={() => {
                  setIsAllCategoriesModalVisible(false);
                  setIsNewCategoryModalVisible(true);
                }}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['#FF8A80', '#7986CB']}
                  style={styles.categoryIcon}
                >
                  <Text style={styles.categoryEmoji}>✨</Text>
                </LinearGradient>
                <Text 
                  style={[styles.categoryCardText, styles.createCategoryText]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  Créer nouvelle
                </Text>
                <Text style={styles.categoryLimit}>
                  ({customCategories.length}/10)
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
    gap: 10, // 🆕 Gap cohérent
    justifyContent: 'space-between', // 🆕 Meilleure répartition
  },
  
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '30%',
    minWidth: 90, // 🆕 Largeur minimale pour éviter le texte vertical
    minHeight: 80, // 🆕 Hauteur minimale pour cohérence
    justifyContent: 'center', // 🆕 Centrage vertical
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  // 🆕 Styles pour bouton "Autres"
  categoryCardOthers: {
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },

  categoryIconOthers: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
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
    lineHeight: 16, // 🆕 Espacement lignes amélioré
    marginTop: 4, // 🆕 Espacement avec l'icône
  },
  
  bottomSpacer: {
    height: 50,
  },

  // Styles pour les modaux
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },

  modalContent: {
    flex: 1,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  modalCloseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  modalCloseText: {
    fontSize: 16,
    color: '#f56565',
    fontWeight: '500',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
  },

  modalSaveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFCC80',
    borderRadius: 20,
  },

  modalSaveBtnDisabled: {
    backgroundColor: '#e2e8f0',
  },

  modalSaveText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },

  modalSaveTextDisabled: {
    color: '#a0aec0',
  },

  modalBody: {
    flex: 1,
    padding: 20,
  },

  // 🆕 Grille toutes catégories
  allCategoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10, // 🆕 Gap réduit pour plus d'espace
    paddingBottom: 20,
    justifyContent: 'space-between', // 🆕 Meilleure répartition
  },

  // 🆕 Conteneur pour catégorie + bouton supprimer
  categoryCardContainer: {
    position: 'relative',
    width: '31%', // 🆕 Légèrement plus large
    minWidth: 95, // 🆕 Largeur minimale
  },

  // Dans le conteneur, la carte doit prendre toute la largeur
  categoryCardInContainer: {
    width: '100%', // 🆕 Prend toute la largeur du conteneur
    minWidth: 'auto', // 🆕 Pas de contrainte minimale
  },

  // 🆕 Bouton supprimer catégorie
  deleteCategoryBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f56565',
    borderWidth: 2,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#f56565',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },

  deleteCategoryText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    lineHeight: 20,
  },

  // 🆕 Bouton créer catégorie
  createCategoryCard: {
    borderWidth: 2,
    borderColor: '#FF8A80',
    backgroundColor: '#fef5e7',
  },

  createCategoryText: {
    color: '#FF8A80',
    fontWeight: '600',
  },

  categoryLimit: {
    fontSize: 10,
    color: '#4a5568',
    marginTop: 2,
  },

  // 🆕 Sélecteur d'emoji
  emojiSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  emojiOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f7fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  emojiOptionSelected: {
    backgroundColor: '#FF8A80',
    borderColor: '#FF8A80',
  },

  emojiOptionText: {
    fontSize: 24,
  },

  // 🆕 Sélecteur de couleur
  colorSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'transparent',
    padding: 2,
  },

  colorOptionSelected: {
    borderColor: '#2d3748',
    borderWidth: 3,
  },

  colorOptionGradient: {
    flex: 1,
    borderRadius: 22,
  },

  // 🆕 Prévisualisation
  previewSection: {
    marginTop: 10,
  },

  categoryPreview: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  inputSection: {
    marginBottom: 30,
  },

  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 12,
  },

  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#2d3748',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  categorySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  categoryOption: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '30%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  categoryOptionSelected: {
    borderColor: '#FFCC80',
    borderWidth: 2,
    shadowColor: '#FFCC80',
    shadowOpacity: 0.2,
  },

  categoryOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },

  categoryOptionEmoji: {
    fontSize: 20,
  },

  categoryOptionText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#4a5568',
    textAlign: 'center',
    marginTop: 4, // 🆕 Espacement avec l'icône
  },

  categoryOptionTextSelected: {
    color: '#2d3748',
    fontWeight: '600',
  },

  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  infoText: {
    fontSize: 14,
    color: '#4a5568',
    textAlign: 'center',
  },
});