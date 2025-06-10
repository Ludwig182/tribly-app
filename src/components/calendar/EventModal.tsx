import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Switch,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { CalendarEvent, FamilyMember, EventPriority } from '../../types/calendar';
import DatePicker from './DatePicker';
import RecurrenceSelector from './RecurrenceSelector';

type EventModalProps = {
  visible: boolean;
  event?: CalendarEvent;
  selectedDate?: Date;
  eventCreationDate?: Date;
  familyMembers: FamilyMember[];
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete?: (eventId: string) => void;
  onClose: () => void;
};

const EventModal: React.FC<EventModalProps> = ({
  visible,
  event,
  selectedDate,
  eventCreationDate,
  familyMembers,
  onSave,
  onDelete,
  onClose
}) => {
  const theme = useTheme();
  const isEditing = !!event;

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  // const [type, setType] = useState<EventType>('personal'); // Supprimé - plus de catégories
  const [priority, setPriority] = useState<EventPriority>('normal');
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [tribsReward, setTribsReward] = useState('');
  // const [color, setColor] = useState(''); // Supprimé - couleur automatique
  const [recurrence, setRecurrence] = useState<any>(null);
  const [reminders, setReminders] = useState<number[]>([]);

  // UI state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showRecurrenceSelector, setShowRecurrenceSelector] = useState(false);

  // eventTypes supprimé - plus de catégories

  const priorities: { value: EventPriority; label: string; color: string }[] = [
    { value: 'normal', label: 'Normal', color: theme.colors.textSecondary },
    { value: 'urgent', label: 'Urgent', color: '#D32F2F' }
  ];

  // Fonction pour déterminer automatiquement la couleur de l'événement
  const getEventColor = () => {
    if (assignedTo.length === 0) {
      return theme.colors.primary; // Couleur par défaut si aucun assigné
    }
    
    if (assignedTo.length === 1) {
      // Un seul assigné : utiliser sa couleur
      const member = familyMembers.find(m => m.id === assignedTo[0]);
      return member?.color || theme.colors.primary;
    }
    
    // Plusieurs assignés : utiliser une couleur neutre (gris-bleu)
    return '#6B7280'; // Gris-bleu pour différencier les événements multi-assignés
  };

  const reminderOptions = [
    { value: 0, label: 'À l\'heure' },
    { value: 5, label: '5 minutes avant' },
    { value: 15, label: '15 minutes avant' },
    { value: 30, label: '30 minutes avant' },
    { value: 60, label: '1 heure avant' },
    { value: 1440, label: '1 jour avant' }
  ];

  useEffect(() => {
    const dateToUse = eventCreationDate || selectedDate;
    console.log('📝 EventModal - selectedDate reçue:', selectedDate?.toISOString(), 'eventCreationDate:', eventCreationDate?.toISOString(), 'visible:', visible);
    if (event) {
      // Load existing event data
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      // setType(event.type); // Supprimé - plus de catégories
      setPriority(event.priority);
      setIsAllDay(event.allDay); // Correction: event.isAllDay -> event.allDay
      setStartDate(new Date(event.startDate));
      setEndDate(event.endDate ? new Date(event.endDate) : new Date(event.startDate));
      // Mapper les assignees (userId) vers les IDs de membres pour l'affichage
      const mappedAssignees = (event.assignees || []).map(userId => {
        // Chercher le membre qui a ce userId
        const member = familyMembers?.find(m => m.userId === userId);
        return member ? member.id : userId; // Si trouvé, utiliser l'ID membre, sinon garder l'userId
      });
      setAssignedTo(mappedAssignees);
      setTribsReward(event.tribsReward?.toString() || '');
      // La couleur sera automatiquement déterminée, pas besoin de la charger
      setRecurrence(event.recurrence || null);
      setReminders(event.reminders || []);
    } else {
      // Reset form for new event
      resetForm(dateToUse);
    }
  }, [event, selectedDate, eventCreationDate, visible]);

  const resetForm = (defaultDate?: Date) => {
    const baseDate = defaultDate || new Date();
    console.log('🔄 resetForm - defaultDate:', defaultDate?.toISOString(), 'baseDate utilisée:', baseDate.toISOString());
    setTitle('');
    setDescription('');
    setLocation('');
    // setType('personal'); // Supprimé - plus de catégories
    setPriority('normal');
    setIsAllDay(false);
    setStartDate(baseDate);
    setEndDate(new Date(baseDate.getTime() + 60 * 60 * 1000)); // +1 hour
    setAssignedTo([]);
    setTribsReward('');
    // La couleur sera automatiquement déterminée, pas besoin de la réinitialiser
    setRecurrence(null);
    setReminders([]);
  };

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Erreur', 'Le titre est obligatoire');
      return;
    }

    if (!isAllDay && endDate <= startDate) {
      Alert.alert('Erreur', 'L\'heure de fin doit être après l\'heure de début');
      return;
    }

    const eventData: Partial<CalendarEvent> = {
      ...(event && { id: event.id }),
      title: title.trim(),
      description: description.trim() || null,
      location: location.trim() || null,
      // type, // Supprimé - plus de catégories
      priority,
      allDay: isAllDay, // Correction: isAllDay -> allDay pour correspondre au type CalendarEvent
      startDate: startDate.toISOString(),
      endDate: isAllDay ? null : endDate.toISOString(),
      assignees: assignedTo.length > 0 ? assignedTo : null,
      tribsReward: tribsReward ? parseInt(tribsReward) : null,
      // color: getEventColor(), // Supprimé - couleur calculée dynamiquement à l'affichage
      recurrence: recurrence || null,
      reminders: reminders.length > 0 ? reminders : null,
      status: event?.status || 'pending'
    };

    onSave(eventData);
    onClose();
  };

  const handleDelete = () => {
    if (!event?.id) return;

    Alert.alert(
      'Supprimer l\'événement',
      'Êtes-vous sûr de vouloir supprimer cet événement ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            onDelete?.(event.id);
            onClose();
          }
        }
      ]
    );
  };

  const toggleAssignedMember = (memberId: string) => {
    // Trouver le membre pour récupérer son userId
    const member = familyMembers?.find(m => m.id === memberId);
    const userIdToUse = member?.userId || memberId; // Utiliser userId si disponible, sinon fallback sur memberId
    
    setAssignedTo(prev => 
      prev.includes(userIdToUse)
        ? prev.filter(id => id !== userIdToUse)
        : [...prev, userIdToUse]
    );
  };

  const toggleReminder = (minutes: number) => {
    setReminders(prev => 
      prev.includes(minutes)
        ? prev.filter(m => m !== minutes)
        : [...prev, minutes].sort((a, b) => a - b)
    );
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
    },
    headerButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
    headerButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
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
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
    },
    textArea: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    typeContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    typeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      gap: 6,
    },
    typeIcon: {
      fontSize: 16,
    },
    typeLabel: {
      fontSize: 14,
      fontWeight: '500',
    },
    dateButton: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      marginVertical: 4,
    },
    dateLabel: {
      fontSize: 12,
      fontWeight: '500',
      marginBottom: 4,
    },
    dateValue: {
      fontSize: 16,
    },
    priorityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    priorityToggleContainer: {
      alignItems: 'flex-end',
    },
    priorityToggle: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 6,
      borderWidth: 1,
      alignItems: 'center',
    },
    priorityToggleText: {
      fontSize: 12,
      fontWeight: '600',
    },
    membersContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    memberButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
    },
    memberLabel: {
      fontSize: 14,
      fontWeight: '500',
    },
    // Styles pour le sélecteur de couleur supprimés - couleur automatique
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    optionLabel: {
      fontSize: 16,
    },
    optionValue: {
      fontSize: 14,
    },
    remindersContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    reminderButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
    },
    reminderLabel: {
      fontSize: 12,
      fontWeight: '500',
    },
    deleteButton: {
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 20,
      marginBottom: 40,
    },
    deleteButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>
              Annuler
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            {isEditing ? 'Modifier l\'événement' : 'Nouvel événement'}
          </Text>
          
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>
              Sauvegarder
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Title */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Titre *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Titre de l'événement"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          {/* Section Type supprimée - plus de catégories */}

          {/* All Day Toggle */}
          <View style={styles.section}>
            <View style={styles.switchRow}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Toute la journée</Text>
              <Switch
                value={isAllDay}
                onValueChange={setIsAllDay}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.colors.background}
              />
            </View>
          </View>

          {/* Date and Time */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Date et heure</Text>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <TouchableOpacity
                style={[styles.dateButton, { 
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  flex: 1,
                  marginRight: isAllDay ? 0 : 5
                }]}
                onPress={() => {
                  console.log('🔍 EventModal - Opening start date picker');
                  try {
                    setShowStartDatePicker(true);
                    console.log('✅ EventModal - Start date picker state set to true');
                  } catch (error) {
                    console.error('💥 EventModal - Error opening start date picker:', error);
                  }
                }}
              >
                <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>Date de début</Text>
                <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                  {formatDate(startDate)}
                </Text>
              </TouchableOpacity>

              {!isAllDay && (
                <TouchableOpacity
                  style={[styles.dateButton, { 
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    flex: 1,
                    marginLeft: 5
                  }]}
                  onPress={() => {
                    try {
                      setShowStartTimePicker(true);
                    } catch (error) {
                      console.error('💥 EventModal - Error opening start time picker:', error);
                    }
                  }}
                >
                  <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>Heure de début</Text>
                  <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                    {startDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {!isAllDay && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                <TouchableOpacity
                  style={[styles.dateButton, { 
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    flex: 1,
                    marginRight: 5
                  }]}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>Date de fin</Text>
                  <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                    {formatDate(endDate)}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.dateButton, { 
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                    flex: 1,
                    marginLeft: 5
                  }]}
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>Heure de fin</Text>
                  <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                    {endDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Description</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Description de l'événement"
              placeholderTextColor={theme.colors.textSecondary}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Location */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Lieu</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              value={location}
              onChangeText={setLocation}
              placeholder="Lieu de l'événement"
              placeholderTextColor={theme.colors.textSecondary}
            />
          </View>

          {/* Priority */}
          <View style={styles.section}>
            <View style={styles.priorityRow}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Marquer comme urgent</Text>
              <View style={styles.priorityToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.priorityToggle,
                    {
                      backgroundColor: priority === 'urgent' 
                        ? '#D32F2F' 
                        : theme.colors.surface,
                      borderColor: '#D32F2F'
                    }
                  ]}
                  onPress={() => setPriority(priority === 'urgent' ? 'normal' : 'urgent')}
                >
                  <Text style={[
                    styles.priorityToggleText,
                    {
                      color: priority === 'urgent' 
                        ? theme.colors.background 
                        : '#D32F2F'
                    }
                  ]}>
                    {priority === 'urgent' ? '✓ URGENT' : 'URGENT'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Assigned Members */}
          {familyMembers && familyMembers.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Participants</Text>
              <View style={styles.membersContainer}>
                {familyMembers?.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.memberButton,
                      {
                        backgroundColor: (() => {
                          const userIdToCheck = member.userId || member.id;
                          // Vérifier si ce membre est assigné en comparant avec les userId stockés
                          return assignedTo.some(assignedId => {
                            const assignedMember = familyMembers?.find(m => m.id === assignedId);
                            return (assignedMember?.userId || assignedId) === userIdToCheck;
                          });
                        })() 
                          ? theme.colors.primary 
                          : theme.colors.surface,
                        borderColor: theme.colors.border
                      }
                    ]}
                    onPress={() => toggleAssignedMember(member.id)}
                  >
                    <Text style={[
                      styles.memberLabel,
                      {
                        color: (() => {
                          const userIdToCheck = member.userId || member.id;
                          // Vérifier si ce membre est assigné en comparant avec les userId stockés
                          const isAssigned = assignedTo.some(assignedId => {
                            const assignedMember = familyMembers?.find(m => m.id === assignedId);
                            return (assignedMember?.userId || assignedId) === userIdToCheck;
                          });
                          return isAssigned 
                            ? theme.colors.background 
                            : theme.colors.text;
                        })()
                      }
                    ]}>
                      {member.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Tribs Reward */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Récompense Tribs</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              value={tribsReward}
              onChangeText={setTribsReward}
              placeholder="Nombre de Tribs"
              placeholderTextColor={theme.colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          {/* Couleur automatique basée sur les participants - plus de sélection manuelle */}

          {/* Recurrence */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.optionButton, { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border
              }]}
              onPress={() => setShowRecurrenceSelector(true)}
            >
              <Text style={[styles.optionLabel, { color: theme.colors.text }]}>Récurrence</Text>
              <Text style={[styles.optionValue, { color: theme.colors.textSecondary }]}>
                {recurrence ? 'Configurée' : 'Aucune'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Reminders */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Rappels</Text>
            <View style={styles.remindersContainer}>
              {reminderOptions.map((reminder) => (
                <TouchableOpacity
                  key={reminder.value}
                  style={[
                    styles.reminderButton,
                    {
                      backgroundColor: reminders.includes(reminder.value) 
                        ? theme.colors.primary 
                        : theme.colors.surface,
                      borderColor: theme.colors.border
                    }
                  ]}
                  onPress={() => toggleReminder(reminder.value)}
                >
                  <Text style={[
                    styles.reminderLabel,
                    {
                      color: reminders.includes(reminder.value) 
                        ? theme.colors.background 
                        : theme.colors.text
                    }
                  ]}>
                    {reminder.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Delete Button */}
          {isEditing && onDelete && (
            <View style={styles.section}>
              <TouchableOpacity
                style={[styles.deleteButton, { backgroundColor: theme.colors.error }]}
                onPress={handleDelete}
              >
                <Text style={[styles.deleteButtonText, { color: theme.colors.background }]}>
                  Supprimer l'événement
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Date & Time Pickers */}
        {showStartDatePicker && (
          <DatePicker
            visible={showStartDatePicker}
            date={startDate}
            mode={'date'}
            onConfirm={(date) => {
              console.log('🔍 EventModal - DatePicker onConfirm called with:', date.toISOString());
              try {
                // Préserver l'heure actuelle
                const newDate = new Date(date);
                newDate.setHours(startDate.getHours(), startDate.getMinutes());
                
                setStartDate(newDate);
                if (!isAllDay && newDate >= endDate) {
                  const newEndDate = new Date(newDate.getTime() + 60 * 60 * 1000);
                  setEndDate(newEndDate);
                }
                setShowStartDatePicker(false);
                console.log('✅ EventModal - Start date updated successfully');
              } catch (error) {
                console.error('💥 EventModal - Error in onConfirm:', error);
              }
            }}
            onCancel={() => {
              console.log('❌ EventModal - DatePicker onCancel called');
              try {
                setShowStartDatePicker(false);
                console.log('✅ EventModal - Start date picker closed');
              } catch (error) {
                console.error('💥 EventModal - Error in onCancel:', error);
              }
            }}
          />
        )}

        {showStartTimePicker && (
          <DatePicker
            visible={showStartTimePicker}
            date={startDate}
            mode={'time'}
            onConfirm={(date) => {
              try {
                // Préserver la date actuelle
                const newDate = new Date(startDate);
                newDate.setHours(date.getHours(), date.getMinutes());
                
                setStartDate(newDate);
                if (newDate >= endDate) {
                  const newEndDate = new Date(newDate.getTime() + 60 * 60 * 1000);
                  setEndDate(newEndDate);
                }
                setShowStartTimePicker(false);
              } catch (error) {
                console.error('💥 EventModal - Error in time onConfirm:', error);
              }
            }}
            onCancel={() => setShowStartTimePicker(false)}
          />
        )}

        {showEndDatePicker && (
          <DatePicker
            visible={showEndDatePicker}
            date={endDate}
            mode={'date'}
            minimumDate={startDate}
            onConfirm={(date) => {
              // Préserver l'heure actuelle
              const newDate = new Date(date);
              newDate.setHours(endDate.getHours(), endDate.getMinutes());
              
              setEndDate(newDate);
              setShowEndDatePicker(false);
            }}
            onCancel={() => setShowEndDatePicker(false)}
          />
        )}

        {showEndTimePicker && (
          <DatePicker
            visible={showEndTimePicker}
            date={endDate}
            mode={'time'}
            onConfirm={(date) => {
              // Préserver la date actuelle
              const newDate = new Date(endDate);
              newDate.setHours(date.getHours(), date.getMinutes());
              
              setEndDate(newDate);
              setShowEndTimePicker(false);
            }}
            onCancel={() => setShowEndTimePicker(false)}
          />
        )}

        {/* Recurrence Selector */}
        <RecurrenceSelector
          visible={showRecurrenceSelector}
          recurrence={recurrence}
          onConfirm={(newRecurrence) => {
            setRecurrence(newRecurrence);
            setShowRecurrenceSelector(false);
          }}
          onCancel={() => setShowRecurrenceSelector(false)}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default EventModal;