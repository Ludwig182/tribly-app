import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  StyleSheet,
  Switch
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { EventRecurrence, RecurrenceType } from '../../types/calendar';

type RecurrenceSelectorProps = {
  visible: boolean;
  recurrence?: EventRecurrence | null;
  onConfirm: (recurrence: EventRecurrence | null) => void;
  onCancel: () => void;
};

const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  visible,
  recurrence,
  onConfirm,
  onCancel
}) => {
  const theme = useTheme();

  // Form state
  const [type, setType] = useState<RecurrenceType>('daily');
  const [interval, setInterval] = useState(1);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([]);
  const [dayOfMonth, setDayOfMonth] = useState<number | undefined>();
  const [monthOfYear, setMonthOfYear] = useState<number | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [occurrences, setOccurrences] = useState<number | undefined>();
  const [hasEndDate, setHasEndDate] = useState(false);
  const [hasOccurrences, setHasOccurrences] = useState(false);

  const recurrenceTypes: { value: RecurrenceType; label: string; description: string }[] = [
    { value: 'daily', label: 'Quotidien', description: 'Tous les jours' },
    { value: 'weekly', label: 'Hebdomadaire', description: 'Chaque semaine' },
    { value: 'monthly', label: 'Mensuel', description: 'Chaque mois' },
    { value: 'yearly', label: 'Annuel', description: 'Chaque année' }
  ];

  const weekDays = [
    { value: 1, label: 'Lun', fullLabel: 'Lundi' },
    { value: 2, label: 'Mar', fullLabel: 'Mardi' },
    { value: 3, label: 'Mer', fullLabel: 'Mercredi' },
    { value: 4, label: 'Jeu', fullLabel: 'Jeudi' },
    { value: 5, label: 'Ven', fullLabel: 'Vendredi' },
    { value: 6, label: 'Sam', fullLabel: 'Samedi' },
    { value: 0, label: 'Dim', fullLabel: 'Dimanche' }
  ];

  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  useEffect(() => {
    if (recurrence) {
      setType(recurrence.type);
      setInterval(recurrence.interval || 1);
      setDaysOfWeek(recurrence.daysOfWeek || []);
      setDayOfMonth(recurrence.dayOfMonth);
      setMonthOfYear(recurrence.monthOfYear);
      setEndDate(recurrence.endDate ? new Date(recurrence.endDate) : undefined);
      setOccurrences(recurrence.occurrences);
      setHasEndDate(!!recurrence.endDate);
      setHasOccurrences(!!recurrence.occurrences);
    } else {
      resetForm();
    }
  }, [recurrence, visible]);

  const resetForm = () => {
    setType('daily');
    setInterval(1);
    setDaysOfWeek([]);
    setDayOfMonth(undefined);
    setMonthOfYear(undefined);
    setEndDate(undefined);
    setOccurrences(undefined);
    setHasEndDate(false);
    setHasOccurrences(false);
  };

  const handleConfirm = () => {
    const newRecurrence: EventRecurrence = {
      type,
      interval,
      ...(type === 'weekly' && daysOfWeek.length > 0 && { daysOfWeek }),
      ...(type === 'monthly' && dayOfMonth && { dayOfMonth }),
      ...(type === 'yearly' && monthOfYear && { monthOfYear }),
      ...(hasEndDate && endDate && { endDate: endDate.toISOString() }),
      ...(hasOccurrences && occurrences && { occurrences })
    };

    onConfirm(newRecurrence);
  };

  const handleRemove = () => {
    onConfirm(null);
  };

  const toggleWeekDay = (day: number) => {
    setDaysOfWeek(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort()
    );
  };

  const getIntervalLabel = () => {
    switch (type) {
      case 'daily':
        return interval === 1 ? 'jour' : 'jours';
      case 'weekly':
        return interval === 1 ? 'semaine' : 'semaines';
      case 'monthly':
        return interval === 1 ? 'mois' : 'mois';
      case 'yearly':
        return interval === 1 ? 'année' : 'années';
      default:
        return '';
    }
  };

  const getRecurrencePreview = () => {
    let preview = `Tous les ${interval > 1 ? interval + ' ' : ''}${getIntervalLabel()}`;

    if (type === 'weekly' && daysOfWeek.length > 0) {
      const dayNames = daysOfWeek
        .map(day => weekDays.find(d => d.value === day)?.label)
        .filter(Boolean)
        .join(', ');
      preview += ` le ${dayNames}`;
    }

    if (type === 'monthly' && dayOfMonth) {
      preview += ` le ${dayOfMonth}`;
    }

    if (type === 'yearly' && monthOfYear) {
      preview += ` en ${months[monthOfYear - 1]}`;
    }

    if (hasEndDate && endDate) {
      preview += ` jusqu'au ${endDate.toLocaleDateString('fr-FR')}`;
    } else if (hasOccurrences && occurrences) {
      preview += ` pour ${occurrences} occurrence${occurrences > 1 ? 's' : ''}`;
    }

    return preview;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    headerButton: {
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    headerButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.primary,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    content: {
      flex: 1,
      paddingHorizontal: 16,
    },
    section: {
      marginVertical: 12,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
      color: theme.colors.text,
    },
    typeContainer: {
      gap: 8,
    },
    typeButton: {
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
    },
    typeLabel: {
      fontSize: 16,
      fontWeight: '600',
    },
    typeDescription: {
      fontSize: 14,
      marginTop: 2,
    },
    intervalContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    intervalLabel: {
      fontSize: 16,
    },
    intervalInput: {
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      textAlign: 'center',
      minWidth: 50,
    },
    weekDaysContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    weekDayButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 6,
      borderWidth: 1,
      minWidth: 45,
      alignItems: 'center',
    },
    weekDayText: {
      fontSize: 14,
      fontWeight: '600',
    },
    monthDayContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    monthDayInput: {
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      textAlign: 'center',
      minWidth: 60,
    },
    endContainer: {
      gap: 12,
    },
    endOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    endOptionLabel: {
      fontSize: 16,
    },
    endDateContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
    },
    endDateButton: {
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    endDateText: {
      fontSize: 16,
    },
    occurrencesContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 8,
    },
    occurrencesInput: {
      borderWidth: 1,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 16,
      textAlign: 'center',
      minWidth: 80,
    },
    previewContainer: {
      marginTop: 16,
      padding: 12,
      borderRadius: 8,
      borderWidth: 1,
    },
    previewLabel: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 4,
    },
    previewText: {
      fontSize: 16,
    },
    removeContainer: {
      marginTop: 16,
      alignItems: 'center',
    },
    removeButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    removeButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>
              Annuler
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>
            Récurrence
          </Text>
          
          <TouchableOpacity onPress={handleConfirm} style={styles.headerButton}>
            <Text style={styles.headerButtonText}>
              Confirmer
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Recurrence Type */}
          <View style={styles.section}>
            <Text style={styles.label}>Type de récurrence</Text>
            <View style={styles.typeContainer}>
              {recurrenceTypes.map((recurrenceType) => (
                <TouchableOpacity
                  key={recurrenceType.value}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: type === recurrenceType.value 
                        ? theme.colors.primary 
                        : theme.colors.surface,
                      borderColor: theme.colors.border
                    }
                  ]}
                  onPress={() => setType(recurrenceType.value)}
                >
                  <Text style={[
                    styles.typeLabel,
                    {
                      color: type === recurrenceType.value 
                        ? theme.colors.background 
                        : theme.colors.text
                    }
                  ]}>
                    {recurrenceType.label}
                  </Text>
                  <Text style={[
                    styles.typeDescription,
                    {
                      color: type === recurrenceType.value 
                        ? theme.colors.background 
                        : theme.colors.textSecondary
                    }
                  ]}>
                    {recurrenceType.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Interval */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Intervalle</Text>
            <View style={styles.intervalContainer}>
              <Text style={[styles.intervalLabel, { color: theme.colors.text }]}>Tous les</Text>
              <TextInput
                style={[styles.intervalInput, {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }]}
                value={interval.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text) || 1;
                  setInterval(Math.max(1, Math.min(99, num)));
                }}
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={[styles.intervalLabel, { color: theme.colors.text }]}>
                {getIntervalLabel()}
              </Text>
            </View>
          </View>

          {/* Weekly Options */}
          {type === 'weekly' && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Jours de la semaine</Text>
              <View style={styles.weekDaysContainer}>
                {weekDays.map((day) => (
                  <TouchableOpacity
                    key={day.value}
                    style={[
                      styles.weekDayButton,
                      {
                        backgroundColor: daysOfWeek.includes(day.value) 
                          ? theme.colors.primary 
                          : theme.colors.surface,
                        borderColor: theme.colors.border
                      }
                    ]}
                    onPress={() => toggleWeekDay(day.value)}
                  >
                    <Text style={[
                      styles.weekDayLabel,
                      {
                        color: daysOfWeek.includes(day.value) 
                          ? theme.colors.background 
                          : theme.colors.text
                      }
                    ]}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
                Sélectionnez les jours où l'événement doit se répéter
              </Text>
            </View>
          )}

          {/* Monthly Options */}
          {type === 'monthly' && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Jour du mois</Text>
              <TextInput
                style={[styles.input, {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  color: theme.colors.text
                }]}
                value={dayOfMonth?.toString() || ''}
                onChangeText={(text) => {
                  const num = parseInt(text);
                  setDayOfMonth(num && num >= 1 && num <= 31 ? num : undefined);
                }}
                placeholder="Jour (1-31)"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="numeric"
                maxLength={2}
              />
              <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
                Laissez vide pour utiliser le jour de l'événement original
              </Text>
            </View>
          )}

          {/* Yearly Options */}
          {type === 'yearly' && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Mois de l'année</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.monthsContainer}>
                  {months.map((month, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.monthButton,
                        {
                          backgroundColor: monthOfYear === index + 1 
                            ? theme.colors.primary 
                            : theme.colors.surface,
                          borderColor: theme.colors.border
                        }
                      ]}
                      onPress={() => setMonthOfYear(index + 1)}
                    >
                      <Text style={[
                        styles.monthLabel,
                        {
                          color: monthOfYear === index + 1 
                            ? theme.colors.background 
                            : theme.colors.text
                        }
                      ]}>
                        {month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
              <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
                Laissez vide pour utiliser le mois de l'événement original
              </Text>
            </View>
          )}

          {/* End Conditions */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Fin de la récurrence</Text>
            
            {/* End Date Option */}
            <View style={styles.endOption}>
              <View style={styles.switchRow}>
                <Text style={[styles.endOptionLabel, { color: theme.colors.text }]}>Date de fin</Text>
                <Switch
                  value={hasEndDate}
                  onValueChange={(value) => {
                    setHasEndDate(value);
                    if (value) {
                      setHasOccurrences(false);
                      setOccurrences(undefined);
                    }
                  }}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.background}
                />
              </View>
              {hasEndDate && (
                <TextInput
                  style={[styles.input, {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text
                  }]}
                  value={endDate?.toLocaleDateString('fr-FR') || ''}
                  placeholder="Date de fin"
                  placeholderTextColor={theme.colors.textSecondary}
                  editable={false}
                />
              )}
            </View>

            {/* Occurrences Option */}
            <View style={styles.endOption}>
              <View style={styles.switchRow}>
                <Text style={[styles.endOptionLabel, { color: theme.colors.text }]}>Nombre d'occurrences</Text>
                <Switch
                  value={hasOccurrences}
                  onValueChange={(value) => {
                    setHasOccurrences(value);
                    if (value) {
                      setHasEndDate(false);
                      setEndDate(undefined);
                    }
                  }}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor={theme.colors.background}
                />
              </View>
              {hasOccurrences && (
                <TextInput
                  style={[styles.input, {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    color: theme.colors.text
                  }]}
                  value={occurrences?.toString() || ''}
                  onChangeText={(text) => {
                    const num = parseInt(text);
                    setOccurrences(num && num > 0 ? num : undefined);
                  }}
                  placeholder="Nombre d'occurrences"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              )}
            </View>
          </View>

          {/* Preview */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Aperçu</Text>
            <View style={[styles.previewContainer, {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            }]}>
              <Text style={[styles.previewText, { color: theme.colors.text }]}>
                {getRecurrencePreview()}
              </Text>
            </View>
          </View>

          {/* Remove Recurrence */}
          {recurrence && (
            <View style={styles.section}>
              <TouchableOpacity
                style={[styles.removeButton, { backgroundColor: theme.colors.error }]}
                onPress={handleRemove}
              >
                <Text style={[styles.removeButtonText, { color: theme.colors.background }]}>
                  Supprimer la récurrence
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

export default RecurrenceSelector;