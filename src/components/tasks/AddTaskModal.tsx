// src/components/tasks/AddTaskModal.tsx - Création de tâches
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useFamily } from '../../hooks/useFamily';
import { tasksService } from '../../services/tasksService';
import { useTheme } from '../../theme/useTheme';

interface Member {
  id: string;
  name: string;
  role: 'admin' | 'parent' | 'child';
  color: string;
  avatar: string;
}

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Difficulty = 'easy' | 'medium' | 'hard';

export default function AddTaskModal({ visible, onClose, onSuccess }: AddTaskModalProps) {
  const { colors } = useTheme();
  const { familyMember } = useAuth();
  const { familyId, familyData } = useFamily();

  // 🗃️ États du formulaire
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [creating, setCreating] = useState(false);

  // 🧹 Reset du formulaire quand le modal s'ouvre
  useEffect(() => {
    if (visible) {
      setTitle('');
      setDescription('');
      setSelectedMemberIds([]);
      setDifficulty('medium');
      setDueDate(null);
      setCreating(false);
    }
  }, [visible]);

  // 👥 Membres assignables
  const assignableMembers = familyData?.members?.filter((member: Member) => {
    // Admin peut assigner à tout le monde
    if (familyMember?.role === 'admin') return true;
    // Parent peut assigner à tout le monde aussi (enfants, autres parents, admins)
    if (familyMember?.role === 'parent') return true;
    return false;
  }) || [];

  // 🏆 Calcul des Tribs prévisualisés
  const calculatePreviewTribs = (): number => {
    const baseTribsMap = { easy: 10, medium: 20, hard: 40 };
    let tribs = baseTribsMap[difficulty];
    
    if (dueDate) tribs += 5; // Bonus deadline
    
    // Bonus urgence si deadline dans 24h
    if (dueDate && dueDate <= new Date(Date.now() + 24 * 60 * 60 * 1000)) {
      tribs += 10;
    }
    
    return tribs;
  };

  // 🛡️ Validation du formulaire
  const isValid = (): boolean => {
    return title.trim().length >= 2 && 
           title.trim().length <= 100 && 
           selectedMemberIds.length > 0;
  };

  // 💾 Création de la tâche
  const handleCreateTask = async () => {
    if (!isValid()) {
      Alert.alert('❌ Formulaire incomplet', 'Veuillez remplir tous les champs requis');
      return;
    }

    if (!familyId || !familyMember) {
      Alert.alert('❌ Erreur', 'Impossible de créer la tâche');
      return;
    }

    setCreating(true);

    try {
      // Créer une tâche pour chaque membre sélectionné
      const taskPromises = selectedMemberIds.map(async (assigneeId) => {
        const taskData = {
          title: title.trim(),
          description: description.trim() || undefined,
          assigneeId,
          difficulty,
          dueDate: dueDate?.toISOString() || undefined,
        };

        return tasksService.addTask(familyId, taskData, familyMember);
      });

      await Promise.all(taskPromises);

      const membersNames = selectedMemberIds
        .map(id => assignableMembers.find(m => m.id === id)?.name)
        .filter(Boolean)
        .join(', ');

      Alert.alert(
        '🎉 Tâche(s) créée(s) !',
        `"${title}" a été assignée à ${membersNames}.`,
        [{ text: 'Super !', onPress: () => { onSuccess(); onClose(); } }]
      );

    } catch (error) {
      console.error('❌ Erreur création tâche:', error);
      Alert.alert('❌ Erreur', error.message || 'Impossible de créer la tâche');
    } finally {
      setCreating(false);
    }
  };

  // 📅 Gestion du DatePicker
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Permettre la date du jour et futures
      setDueDate(selectedDate);
    }
  };

  // 📅 Ouvrir le DatePicker directement
  const openDatePicker = () => {
    setShowDatePicker(true);
  };

  // 🎨 Style pour les options de difficulté
  const getDifficultyStyle = (diff: Difficulty) => {
    const isSelected = difficulty === diff;
    return [
      styles.difficultyOption,
      {
        backgroundColor: isSelected ? colors.primary : colors.card,
        borderColor: isSelected ? colors.primary : colors.border,
      }
    ];
  };

  const getDifficultyTextStyle = (diff: Difficulty) => {
    const isSelected = difficulty === diff;
    return [
      styles.difficultyOptionText,
      { color: isSelected ? colors.onPrimary : colors.text }
    ];
  };

  // 👥 Gestion de la sélection multiple
  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={[styles.modalContent, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity 
              style={styles.modalCloseBtn}
              onPress={onClose}
            >
              <Text style={[styles.modalCloseText, { color: colors.system?.error || '#f56565' }]}>
                Annuler
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              ✅ Nouvelle tâche
            </Text>
            
            <TouchableOpacity 
              style={[
                styles.modalSaveBtn, 
                { backgroundColor: isValid() ? colors.primary : colors.border }
              ]}
              onPress={handleCreateTask}
              disabled={!isValid() || creating}
            >
              {creating ? (
                <Text style={[styles.modalSaveText, { color: colors.textTertiary }]}>...</Text>
              ) : (
                <Text style={[
                  styles.modalSaveText, 
                  { color: isValid() ? colors.onPrimary : colors.textTertiary }
                ]}>
                  Créer
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Titre de la tâche */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                📝 Titre de la tâche *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { 
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text
                  }
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="Ex: Ranger sa chambre, Faire ses devoirs..."
                placeholderTextColor={colors.textTertiary}
                maxLength={100}
                autoFocus={true}
              />
              <Text style={[styles.helperText, { color: colors.textTertiary }]}>
                {title.length}/100 caractères
              </Text>
            </View>

            {/* Description optionnelle */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                📄 Description (optionnelle)
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  styles.textInputMultiline,
                  { 
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    color: colors.text
                  }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder="Détails supplémentaires..."
                placeholderTextColor={colors.textTertiary}
                multiline={true}
                numberOfLines={3}
                maxLength={250}
              />
            </View>

            {/* Attribution */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                👤 Assigner à * ({selectedMemberIds.length} sélectionné{selectedMemberIds.length > 1 ? 's' : ''})
              </Text>
              <Text style={[styles.helperText, { color: colors.textTertiary }]}>
                💡 Vous pouvez sélectionner plusieurs personnes
              </Text>
              <View style={styles.membersSelector}>
                {assignableMembers.map((member: Member) => {
                  const isSelected = selectedMemberIds.includes(member.id);
                  return (
                    <TouchableOpacity
                      key={member.id}
                      style={[
                        styles.memberOption,
                        {
                          backgroundColor: isSelected ? colors.overlayLight : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                        }
                      ]}
                      onPress={() => toggleMemberSelection(member.id)}
                    >
                      <LinearGradient
                        colors={[member.color, member.color]}
                        style={styles.memberAvatar}
                      >
                        <Text style={styles.memberAvatarText}>{member.avatar}</Text>
                      </LinearGradient>
                      <Text style={[
                        styles.memberName,
                        { 
                          color: isSelected ? colors.primary : colors.text,
                          fontWeight: isSelected ? '600' : '500'
                        }
                      ]}>
                        {member.name}
                      </Text>
                      <Text style={[styles.memberRole, { color: colors.textSecondary }]}>
                        {member.role === 'admin' ? '👑' : member.role === 'parent' ? '👤' : '⭐'}
                      </Text>
                      {isSelected && (
                        <Text style={[styles.checkMark, { color: colors.primary }]}>✓</Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Difficulté */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                🎯 Difficulté
              </Text>
              <View style={styles.difficultySelector}>
                <TouchableOpacity
                  style={getDifficultyStyle('easy')}
                  onPress={() => setDifficulty('easy')}
                >
                  <Text style={styles.difficultyEmoji}>😊</Text>
                  <Text style={getDifficultyTextStyle('easy')}>Facile</Text>
                  <Text style={[styles.difficultyTribs, getDifficultyTextStyle('easy')]}>
                    10 Tribs
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={getDifficultyStyle('medium')}
                  onPress={() => setDifficulty('medium')}
                >
                  <Text style={styles.difficultyEmoji}>💪</Text>
                  <Text style={getDifficultyTextStyle('medium')}>Moyen</Text>
                  <Text style={[styles.difficultyTribs, getDifficultyTextStyle('medium')]}>
                    20 Tribs
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={getDifficultyStyle('hard')}
                  onPress={() => setDifficulty('hard')}
                >
                  <Text style={styles.difficultyEmoji}>🔥</Text>
                  <Text style={getDifficultyTextStyle('hard')}>Difficile</Text>
                  <Text style={[styles.difficultyTribs, getDifficultyTextStyle('hard')]}>
                    40 Tribs
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Date limite */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                📅 Date limite (optionnelle)
              </Text>
              
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  { 
                    backgroundColor: colors.card,
                    borderColor: colors.border
                  }
                ]}
                onPress={openDatePicker}
              >
                <Text style={[styles.dateButtonText, { color: colors.text }]}>
                  {dueDate 
                    ? `📅 ${dueDate.toLocaleDateString('fr-FR', { 
                        weekday: 'short', 
                        day: 'numeric', 
                        month: 'short' 
                      })}`
                    : '💡 Ajouter une deadline (+5 Tribs)'
                  }
                </Text>
                {dueDate && (
                  <TouchableOpacity
                    style={styles.clearDateButton}
                    onPress={() => setDueDate(null)}
                  >
                    <Text style={[styles.clearDateText, { color: colors.textSecondary }]}>×</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            </View>

            {/* Aperçu des Tribs */}
            <View style={styles.section}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={styles.tribsPreview}
              >
                <Text style={styles.tribsPreviewTitle}>🏆 Tribs à gagner</Text>
                <Text style={styles.tribsPreviewAmount}>
                  {calculatePreviewTribs()} {selectedMemberIds.length > 1 ? `× ${selectedMemberIds.length}` : ''}
                </Text>
                <Text style={styles.tribsPreviewDetails}>
                  Base: {difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 40}
                  {dueDate && ' + 5 (deadline)'}
                  {dueDate && dueDate <= new Date(Date.now() + 24 * 60 * 60 * 1000) && ' + 10 (urgent)'}
                  {selectedMemberIds.length > 1 && ` • ${selectedMemberIds.length} personnes`}
                </Text>
              </LinearGradient>
            </View>
          </ScrollView>

          {/* DatePicker Modal */}
          {showDatePicker && (
            <DateTimePicker
              value={dueDate || new Date()}
              mode="date"
              display="default"
              onChange={handleDateChange}
              // Pas de minimumDate - permet de choisir aujourd'hui
            />
          )}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
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
    borderBottomWidth: 1,
  },

  modalCloseBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  modalCloseText: {
    fontSize: 16,
    fontWeight: '500',
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  modalSaveBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },

  modalSaveText: {
    fontSize: 16,
    fontWeight: '600',
  },

  modalBody: {
    flex: 1,
    padding: 20,
  },

  section: {
    marginBottom: 30,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },

  textInput: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
  },

  textInputMultiline: {
    height: 80,
    textAlignVertical: 'top',
  },

  helperText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },

  membersSelector: {
    gap: 12,
  },

  memberOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },

  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  memberAvatarText: {
    fontSize: 18,
    color: 'white',
  },

  memberName: {
    fontSize: 16,
    flex: 1,
  },

  memberRole: {
    fontSize: 16,
  },

  checkMark: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },

  difficultySelector: {
    flexDirection: 'row',
    gap: 12,
  },

  difficultyOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },

  difficultyEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },

  difficultyOptionText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },

  difficultyTribs: {
    fontSize: 12,
    fontWeight: '500',
  },

  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },

  dateButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },

  clearDateButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  clearDateText: {
    fontSize: 18,
    fontWeight: '600',
  },

  tribsPreview: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },

  tribsPreviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },

  tribsPreviewAmount: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },

  tribsPreviewDetails: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
});