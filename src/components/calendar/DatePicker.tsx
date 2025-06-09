import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface DatePickerProps {
  visible: boolean;
  date?: Date;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  includeTime?: boolean;
  onConfirm?: (date: Date) => void;
  onCancel?: () => void;
}

export default function DatePicker({
  visible,
  date,
  mode = 'datetime',
  minimumDate,
  maximumDate,
  includeTime = true,
  onConfirm,
  onCancel,
}: DatePickerProps) {
  const [showYearSelector, setShowYearSelector] = useState(false);
  const [selectedDate, setSelectedDate] = useState(date ? new Date(date) : new Date());
  
  // Mettre à jour la date sélectionnée lorsque la prop date change
  useEffect(() => {
    if (date) {
      setSelectedDate(new Date(date));
    }
  }, [date]);

  // Générer une liste d'années (de l'année actuelle - 5 à l'année actuelle + 10)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 16 }, (_, i) => currentYear - 5 + i);

  const onDateChange = (event, selectedValue) => {
    if (event.type === 'set' && selectedValue) {
      const newDate = new Date(selectedDate);
      const actualMode = includeTime ? mode : mode === 'datetime' ? 'date' : mode;

      if (actualMode === 'date') {
        newDate.setFullYear(selectedValue.getFullYear());
        newDate.setMonth(selectedValue.getMonth());
        newDate.setDate(selectedValue.getDate());
      } else if (actualMode === 'time') {
        newDate.setHours(selectedValue.getHours());
        newDate.setMinutes(selectedValue.getMinutes());
      } else if (actualMode === 'datetime') {
        newDate.setFullYear(selectedValue.getFullYear());
        newDate.setMonth(selectedValue.getMonth());
        newDate.setDate(selectedValue.getDate());
        newDate.setHours(selectedValue.getHours());
        newDate.setMinutes(selectedValue.getMinutes());
      }

      setSelectedDate(newDate);
    }
  };
  
  const selectYear = (year) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(year);
    setSelectedDate(newDate);
    setShowYearSelector(false);
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={() => {
      if (typeof onCancel === 'function') {
        onCancel();
      }
    }}>
      <View style={styles.dateModalOverlay}>
        <View style={styles.dateModalContent}>
          <View style={styles.dateModalHeader}>
            <Text style={styles.dateModalTitle}>
              {mode === 'time'
                ? 'Sélect. heure'
                : includeTime && mode !== 'date'
                ? 'Sélect. date & heure'
                : 'Sélect. date'}
            </Text>
            <TouchableOpacity
              style={styles.dateModalCancelBtn}
              onPress={() => {
                setShowYearSelector(false);
                if (typeof onCancel === 'function') {
                  onCancel();
                }
              }}
            >
              <Text style={styles.dateModalCancelText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dateModalConfirmBtn}
              onPress={() => {
                setShowYearSelector(false);
                if (typeof onConfirm === 'function') {
                  onConfirm(selectedDate);
                }
              }}
            >
              <Text style={styles.dateModalConfirmText}>OK</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.datePickerContainer}>
            {showYearSelector ? (
              <View style={styles.yearSelectorContainer}>
                <ScrollView style={styles.yearScrollView}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      style={[styles.yearItem, selectedDate.getFullYear() === year && styles.selectedYearItem]}
                      onPress={() => selectYear(year)}
                    >
                      <Text style={[styles.yearText, selectedDate.getFullYear() === year && styles.selectedYearText]}>
                        {year}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : (
              <>
                <TouchableOpacity 
                  style={styles.yearSelectorButton} 
                  onPress={() => setShowYearSelector(true)}
                >
                  <Text style={styles.yearSelectorButtonText}>
                    Année: {selectedDate.getFullYear()} (Modifier)
                  </Text>
                </TouchableOpacity>
                <DateTimePicker
                  value={selectedDate}
                  mode={includeTime ? mode : mode === 'datetime' ? 'date' : mode}
                  display="spinner"
                  onChange={onDateChange}
                  minimumDate={minimumDate || new Date(1900, 0, 1)}
                  maximumDate={maximumDate}
                  textColor="#000000"
                  style={styles.datePickerSpinner}
                  themeVariant="light"
                />
              </>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dateModalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '60%',
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  dateModalCancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dateModalCancelText: {
    fontSize: 16,
    color: '#f56565',
    fontWeight: '500',
  },
  dateModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2d3748',
  },
  dateModalConfirmBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  dateModalConfirmText: {
    fontSize: 16,
    color: '#48bb78',
    fontWeight: '600',
  },
  datePickerContainer: {
    minHeight: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  datePickerSpinner: {
    height: 200,
    width: '100%',
  },
  yearSelectorButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  yearSelectorButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3748',
  },
  yearSelectorContainer: {
    width: '100%',
    height: 250,
    backgroundColor: 'white',
  },
  yearScrollView: {
    width: '100%',
  },
  yearItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    alignItems: 'center',
  },
  selectedYearItem: {
    backgroundColor: '#e6f7ff',
  },
  yearText: {
    fontSize: 18,
    color: '#2d3748',
  },
  selectedYearText: {
    fontWeight: 'bold',
    color: '#0066cc',
  },
});