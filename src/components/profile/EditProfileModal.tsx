import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: any;
  onSave: (updatedData: any) => Promise<void>;
}

export default function EditProfileModal({ visible, onClose, user, onSave }: EditProfileModalProps) {
  const { colors, fontSizeBase } = useTheme();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '👤');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide');
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        name: name.trim(),
        avatar
      });
      onClose();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: colors.overlayDark || 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center'
    },
    content: {
      backgroundColor: colors.card,
      borderRadius: 20,
      padding: 20,
      width: '90%',
      maxWidth: 400,
    },
    title: {
      fontSize: fontSizeBase ? fontSizeBase * 1.25 : 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center'
    },
    inputContainer: {
      marginBottom: 15
    },
    label: {
      fontSize: fontSizeBase || 16,
      color: colors.textSecondary,
      marginBottom: 8
    },
    input: {
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: 12,
      fontSize: fontSizeBase || 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border
    },
    avatarSelector: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginTop: 10
    },
    avatarOption: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2
    },
    avatarEmoji: {
      fontSize: 24
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      gap: 10
    },
    button: {
      flex: 1,
      borderRadius: 10,
      padding: 15,
      alignItems: 'center'
    },
    cancelButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border
    },
    saveButton: {
      backgroundColor: colors.primary
    },
    buttonText: {
      fontSize: fontSizeBase || 16,
      fontWeight: '600'
    },
    cancelText: {
      color: colors.text
    },
    saveText: {
      color: 'white'
    }
  });

  const avatarOptions = ['👤', '😊', '😎', '🦸‍♂️', '🦸‍♀️', '🧑‍💻', '👨‍💻', '👩‍💻'];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity style={styles.content} activeOpacity={1} onPress={e => e.stopPropagation()}>
          <Text style={styles.title}>Modifier le profil</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nom</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Votre nom"
              placeholderTextColor={colors.textTertiary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Avatar</Text>
            <View style={styles.avatarSelector}>
              {avatarOptions.map((emoji) => (
                <TouchableOpacity
                  key={emoji}
                  style={[
                    styles.avatarOption,
                    {
                      borderColor: avatar === emoji ? colors.primary : 'transparent',
                      backgroundColor: colors.background
                    }
                  ]}
                  onPress={() => setAvatar(emoji)}
                >
                  <Text style={styles.avatarEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, styles.cancelText]}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <Text style={[styles.buttonText, styles.saveText]}>
                {isLoading ? 'Sauvegarde...' : 'Enregistrer'}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}