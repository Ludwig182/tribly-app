import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';

export default function TaskActionModal({
  visible, onClose, onValidate, onNotDone, onDelete, canDelete = true
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* On capte le press sur l’overlay */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Ce bloc capte les press et empêche la propagation */}
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <Text style={styles.title}>Que souhaitez-vous faire ?</Text>
              <TouchableOpacity style={styles.btn} onPress={onValidate}>
                <Text style={styles.text}>✅ Valider</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={onNotDone}>
                <Text style={styles.text}>❌ Pas fait</Text>
              </TouchableOpacity>
              {canDelete && (
                <TouchableOpacity style={[styles.btn, styles.delete]} onPress={onDelete}>
                  <Text style={[styles.text, styles.deleteText]}>🗑️ Supprimer</Text>
                </TouchableOpacity>
              )}
              {/* SUPPRIME le bouton Annuler */}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', alignItems: 'center' },
  container: { backgroundColor: '#fff', borderRadius: 14, padding: 24, width: 280, alignItems: 'center' },
  title: { fontWeight: 'bold', fontSize: 18, marginBottom: 16 },
  btn: { paddingVertical: 12, paddingHorizontal: 32, marginVertical: 5, borderRadius: 7, backgroundColor: '#f2f2f2' },
  text: { fontSize: 16 },
  delete: { backgroundColor: '#FFDDDD' },
  deleteText: { color: '#d33' },
});
