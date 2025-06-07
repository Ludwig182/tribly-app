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
import { CalendarEvent, FamilyMember, EventType, EventPriority } from '../../types/calendar';
import DatePicker from './DatePicker';
import RecurrenceSelector from './RecurrenceSelector';

type EventModalProps = {
  visible: boolean;
  event?: CalendarEvent;
  selectedDate?: Date;
  familyMembers: FamilyMember[];
  onSave: (event: Partial<CalendarEvent>) => void;
  onDelete?: (eventId: string) => void;
  onClose: () => void;
};

const EventModal: React.FC<EventModalProps> = ({
  visible,
  event,
  selectedDate,
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
  const [type, setType] = useState<EventType>('personal');
  const [priority, setPriority] = useState<EventPriority>('medium');
  const [isAllDay, setIsAllDay] = useState(false);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [assignedTo, setAssignedTo] = useState<string[]>([]);
  const [tribsReward, setTribsReward] = useState('');
  const [color, setColor] = useState('');
  const [recurrence, setRecurrence] = useState<any>(null);
  const [reminders, setReminders] = useState<number[]>([]);

  // UI state
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showRecurrenceSelector, setShowRecurrenceSelector] = useState(false);

  const eventTypes: { value: EventType; label: string; icon: string }[] = [
    { value: 'personal', label: 'Personnel', icon: '👤' },
    { value: 'family', label: 'Famille', icon: '👨‍👩‍👧‍👦' },
    { value: 'chore', label: 'Tâche ménagère', icon: '🧹' },
    { value: 'appointment', label: 'Rendez-vous', icon: '🏥' },
    { value: 'school', label: 'École', icon: '🎓' },
    { value: 'leisure', label: 'Loisir', icon: '🎉' },
    { value: 'sport', label: 'Sport', icon: '⚽' },
    { value: 'reminder', label: 'Rappel', icon: '⏰' }
  ];

  const priorities: { value: EventPriority; label: string; color: string }[] = [
    { value: 'low', label: 'Faible', color: theme.colors.success },
    { value: 'medium', label: 'Moyenne', color: theme.colors.warning },
    { value: 'high', label: 'Élevée', color: theme.colors.error },
    { value: 'urgent', label: 'Urgente', color: '#D32F2F' }
  ];

  const eventColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];

  const reminderOptions = [
    { value: 0, label: 'À l\'heure' },
    { value: 5, label: '5 minutes avant' },
    { value: 15, label: '15 minutes avant' },
    { value: 30, label: '30 minutes avant' },
    { value: 60, label: '1 heure avant' },
    { value: 1440, label: '1 jour avant' }
  ];

  useEffect(() => {
    if (event) {
      // Load existing event data
      setTitle(event.title);
      setDescription(event.description || '');
      setLocation(event.location || '');
      setType(event.type);
      setPriority(event.priority);
      setIsAllDay(event.isAllDay);
      setStartDate(new Date(event.startDate));
      setEndDate(event.endDate ? new Date(event.endDate) : new Date(event.startDate));
      setAssignedTo(event.assignedTo || []);
      setTribsReward(event.tribsReward?.toString() || '');
      setColor(event.color || '');
      setRecurrence(event.recurrence || null);
      setReminders(event.reminders || []);
    } else {
      // Reset form for new event
      resetForm();
      if (selectedDate) {
        setStartDate(selectedDate);
        setEndDate(new Date(selectedDate.getTime() + 60 * 60 * 1000)); // +1 hour
      }
    }
  }, [event, selectedDate, visible]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setType('personal');
    setPriority('medium');
    setIsAllDay(false);
    setStartDate(new Date());
    setEndDate(new Date());
    setAssignedTo([]);
    setTribsReward('');
    setColor('');
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
      description: description.trim() || undefined,
      location: location.trim() || undefined,
      type,
      priority,
      isAllDay,
      startDate: startDate.toISOString(),
      endDate: isAllDay ? undefined : endDate.toISOString(),
      assignedTo: assignedTo.length > 0 ? assignedTo : undefined,
      tribsReward: tribsReward ? parseInt(tribsReward) : undefined,
      color: color || undefined,
      recurrence: recurrence || undefined,
      reminders: reminders.length > 0 ? reminders : undefined,
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
    setAssignedTo(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
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
    priorityContainer: {
      flexDirection: 'row',
      gap: 8,
    },
    priorityButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
    },
    priorityLabel: {
      fontSize: 14,
      fontWeight: '500',
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
    colorContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    colorButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    selectedColor: {
      borderWidth: 3,
      borderColor: '#000',
    },
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

          {/* Event Type */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.typeContainer}>
                {eventTypes.map((eventType) => (
                  <TouchableOpacity
                    key={eventType.value}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor: type === eventType.value 
                          ? theme.colors.primary 
                          : theme.colors.surface,
                        borderColor: theme.colors.border
                      }
                    ]}
                    onPress={() => setType(eventType.value)}
                  >
                    <Text style={styles.typeIcon}>{eventType.icon}</Text>
                    <Text style={[
                      styles.typeLabel,
                      {
                        color: type === eventType.value 
                          ? theme.colors.background 
                          : theme.colors.text
                      }
                    ]}>
                      {eventType.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

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
            
            <TouchableOpacity
              style={[styles.dateButton, { 
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border
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
              <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>Début</Text>
              <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                {isAllDay ? formatDate(startDate) : formatDateTime(startDate)}
              </Text>
            </TouchableOpacity>

            {!isAllDay && (
              <TouchableOpacity
                style={[styles.dateButton, { 
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border
                }]}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={[styles.dateLabel, { color: theme.colors.textSecondary }]}>Fin</Text>
                <Text style={[styles.dateValue, { color: theme.colors.text }]}>
                  {formatDateTime(endDate)}
                </Text>
              </TouchableOpacity>
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
            <Text style={[styles.label, { color: theme.colors.text }]}>Priorité</Text>
            <View style={styles.priorityContainer}>
              {priorities.map((priorityOption) => (
                <TouchableOpacity
                  key={priorityOption.value}
                  style={[
                    styles.priorityButton,
                    {
                      backgroundColor: priority === priorityOption.value 
                        ? priorityOption.color 
                        : theme.colors.surface,
                      borderColor: priorityOption.color
                    }
                  ]}
                  onPress={() => setPriority(priorityOption.value)}
                >
                  <Text style={[
                    styles.priorityLabel,
                    {
                      color: priority === priorityOption.value 
                        ? theme.colors.background 
                        : priorityOption.color
                    }
                  ]}>
                    {priorityOption.label}
                  </Text>
                </TouchableOpacity>
              ))}
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
                        backgroundColor: assignedTo.includes(member.id) 
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
                        color: assignedTo.includes(member.id) 
                          ? theme.colors.background 
                          : theme.colors.text
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

          {/* Color */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Couleur</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.colorContainer}>
                {eventColors.map((eventColor) => (
                  <TouchableOpacity
                    key={eventColor}
                    style={[
                      styles.colorButton,
                      { backgroundColor: eventColor },
                      color === eventColor && styles.selectedColor
                    ]}
                    onPress={() => setColor(eventColor)}
                  />
                ))}
              </View>
            </ScrollView>
          </View>

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

        {/* Date Pickers */}
        {showStartDatePicker && (
          <DatePicker
            visible={showStartDatePicker}
            date={startDate}
            mode={'date'}
            onConfirm={(date) => {
              console.log('🔍 EventModal - DatePicker onConfirm called with:', date.toISOString());
              try {
                setStartDate(date);
                if (!isAllDay && date >= endDate) {
                  setEndDate(new Date(date.getTime() + 60 * 60 * 1000));
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

        {showEndDatePicker && (
          <DatePicker
            visible={showEndDatePicker}
            date={endDate}
            mode={'date'}
            minimumDate={startDate}
            onConfirm={(date) => {
              setEndDate(date);
              setShowEndDatePicker(false);
            }}
            onCancel={() => setShowEndDatePicker(false)}
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