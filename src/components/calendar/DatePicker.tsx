import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../theme/useTheme';

type DatePickerProps = {
  visible: boolean;
  date: Date;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
};

const DatePicker: React.FC<DatePickerProps> = ({
  visible,
  date,
  mode = 'datetime',
  minimumDate,
  maximumDate,
  onConfirm,
  onCancel
}) => {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = React.useState(date);
  const [currentMode, setCurrentMode] = React.useState<'date' | 'time'>(mode === 'datetime' ? 'date' : mode);
  const [showTimePicker, setShowTimePicker] = React.useState(false);

  React.useEffect(() => {
    setSelectedDate(date);
    setCurrentMode(mode === 'datetime' ? 'date' : mode);
    setShowTimePicker(false);
  }, [date, mode, visible]);

  const handleDateChange = (event: any, newDate?: Date) => {
    if (Platform.OS === 'android') {
      if (event.type === 'dismissed') {
        onCancel();
        return;
      }
      
      if (newDate) {
        if (mode === 'datetime' && currentMode === 'date') {
          setSelectedDate(newDate);
          setCurrentMode('time');
          setShowTimePicker(true);
        } else {
          onConfirm(newDate);
        }
      }
    } else {
      if (newDate) {
        setSelectedDate(newDate);
      }
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (date: Date) => {
    return `${formatDate(date)} à ${formatTime(date)}`;
  };

  const getDisplayText = () => {
    switch (mode) {
      case 'date':
        return formatDate(selectedDate);
      case 'time':
        return formatTime(selectedDate);
      case 'datetime':
        return formatDateTime(selectedDate);
      default:
        return '';
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'date':
        return 'Sélectionner une date';
      case 'time':
        return 'Sélectionner une heure';
      case 'datetime':
        return 'Sélectionner date et heure';
      default:
        return 'Sélectionner';
    }
  };

  if (Platform.OS === 'android') {
    // Android uses native date picker
    return (
      <>
        {visible && (
          <DateTimePicker
            value={selectedDate}
            mode={currentMode}
            display="default"
            minimumDate={minimumDate}
            maximumDate={maximumDate}
            onChange={handleDateChange}
          />
        )}
        {showTimePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </>
    );
  }

  // iOS uses modal with custom styling
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>
                Annuler
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {getTitle()}
            </Text>
            
            <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
              <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>
                Confirmer
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={[styles.selectedDateContainer, { backgroundColor: theme.colors.background }]}>
              <Text style={[styles.selectedDateText, { color: theme.colors.text }]}>
                {getDisplayText()}
              </Text>
            </View>

            <View style={styles.pickerContainer}>
              {mode === 'datetime' ? (
                <>
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="wheels"
                    minimumDate={minimumDate}
                    maximumDate={maximumDate}
                    onChange={handleDateChange}
                    style={styles.picker}
                    textColor={theme.colors.text}
                  />
                  <DateTimePicker
                    value={selectedDate}
                    mode="time"
                    display="wheels"
                    onChange={handleDateChange}
                    style={styles.picker}
                    textColor={theme.colors.text}
                  />
                </>
              ) : (
                <DateTimePicker
                  value={selectedDate}
                  mode={mode}
                  display="wheels"
                  minimumDate={minimumDate}
                  maximumDate={maximumDate}
                  onChange={handleDateChange}
                  style={styles.picker}
                  textColor={theme.colors.text}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '70%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
    },
    headerButton: {
      paddingVertical: 8,
      paddingHorizontal: 4,
      minWidth: 80,
    },
    headerButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      textAlign: 'center',
      flex: 1,
    },
    content: {
      paddingBottom: 20,
    },
    selectedDateContainer: {
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 8,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: 'center',
    },
    selectedDateText: {
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
    },
    pickerContainer: {
      paddingHorizontal: 16,
    },
    picker: {
      height: 120,
    },
  });
};

export default DatePicker;