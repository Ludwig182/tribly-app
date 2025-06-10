import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  StyleSheet,
  Switch
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { EventPriority, FamilyMember } from '../../types/calendar';

export type CalendarFilters = {
  searchQuery: string;
  // eventTypes: EventType[]; // Supprimé - plus de catégories
  priorities: EventPriority[];
  assignedMembers: string[];
  dateRange: {
    start?: Date;
    end?: Date;
  };
  showCompleted: boolean;
  showOverdue: boolean;
  hasTribs: boolean;
};

type CalendarFiltersProps = {
  visible?: boolean;
  filters: CalendarFilters;
  familyMembers: FamilyMember[];
  onFiltersChange: (filters: CalendarFilters) => void;
  onClose?: () => void;
  onReset?: () => void;
  // Navigation props
  viewMode?: any;
  onViewModeChange?: (mode: any) => void;
  onNavigateNext?: () => void;
  onNavigatePrevious?: () => void;
  onNavigateToday?: () => void;
  currentDate?: Date;
};

const CalendarFiltersComponent: React.FC<CalendarFiltersProps> = ({
  visible = false,
  filters,
  familyMembers,
  onFiltersChange,
  onClose,
  onReset,
  viewMode,
  onViewModeChange,
  onNavigateNext,
  onNavigatePrevious,
  onNavigateToday,
  currentDate
}) => {
  const theme = useTheme();
  const [localFilters, setLocalFilters] = useState<CalendarFilters>(filters);

  // eventTypes supprimé - plus de catégories

  const priorities: { value: EventPriority; label: string; color: string }[] = [
    { value: 'normal', label: 'Normal', color: theme.colors.textSecondary },
    { value: 'urgent', label: 'Urgent', color: '#D32F2F' }
  ];

  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, visible]);

  const updateFilters = (updates: Partial<CalendarFilters>) => {
    const newFilters = { ...localFilters, ...updates };
    setLocalFilters(newFilters);
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: CalendarFilters = {
      searchQuery: '',
      // eventTypes: [], // Supprimé - plus de catégories
      priorities: [],
      assignedMembers: [],
      dateRange: {},
      showCompleted: true,
      showOverdue: true,
      hasTribs: false
    };
    setLocalFilters(resetFilters);
    onReset();
  };

  // toggleEventType supprimé - plus de catégories

  const togglePriority = (priority: EventPriority) => {
    const newPriorities = localFilters.priorities.includes(priority)
      ? localFilters.priorities.filter(p => p !== priority)
      : [...localFilters.priorities, priority];
    updateFilters({ priorities: newPriorities });
  };

  const toggleMember = (memberId: string) => {
    const newMembers = localFilters.assignedMembers.includes(memberId)
      ? localFilters.assignedMembers.filter(m => m !== memberId)
      : [...localFilters.assignedMembers, memberId];
    updateFilters({ assignedMembers: newMembers });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.searchQuery) count++;
    // if (localFilters.eventTypes.length > 0) count++; // Supprimé - plus de catégories
    if (localFilters.priorities.length > 0) count++;
    if (localFilters.assignedMembers.length > 0) count++;
    if (localFilters.dateRange.start || localFilters.dateRange.end) count++;
    if (!localFilters.showCompleted) count++;
    if (!localFilters.showOverdue) count++;
    if (localFilters.hasTribs) count++;
    return count;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
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
      paddingHorizontal: 4,
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
      marginBottom: 12,
    },
    searchInput: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 16,
    },
    filterGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      gap: 6,
    },
    filterIcon: {
      fontSize: 14,
    },
    filterText: {
      fontSize: 14,
      fontWeight: '500',
    },
    memberItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    memberAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    memberAvatarText: {
      fontSize: 14,
      fontWeight: '600',
      color: 'white',
    },
    memberName: {
      flex: 1,
      fontSize: 16,
    },
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },
    switchLabel: {
      fontSize: 16,
    },
    dateRangeContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    dateButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
    },
    dateButtonText: {
      fontSize: 14,
      fontWeight: '500',
    },
    quickFilters: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    quickFilter: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 16,
      borderWidth: 1,
    },
    quickFilterText: {
      fontSize: 12,
      fontWeight: '500',
    },
    resetButton: {
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: 'center',
      marginBottom: 40,
    },
    resetButtonText: {
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
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>
              Annuler
            </Text>
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
            Filtres ({getActiveFiltersCount()})
          </Text>
          
          <TouchableOpacity onPress={handleApply} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.colors.primary }]}>
              Appliquer
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Recherche</Text>
            <TextInput
              style={[styles.searchInput, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                color: theme.colors.text
              }]}
              value={localFilters.searchQuery}
              onChangeText={(text) => updateFilters({ searchQuery: text })}
              placeholder="Rechercher dans les événements..."
              placeholderTextColor={theme.colors.textSecondary}
              clearButtonMode="while-editing"
            />
          </View>

          {/* Section Types supprimée - plus de catégories */}

          {/* Priorities */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Priorités</Text>
            <View style={styles.filterGrid}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority.value}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: localFilters.priorities.includes(priority.value)
                        ? priority.color
                        : theme.colors.surface,
                      borderColor: priority.color
                    }
                  ]}
                  onPress={() => togglePriority(priority.value)}
                >
                  <Text style={[
                    styles.filterText,
                    {
                      color: localFilters.priorities.includes(priority.value)
                        ? theme.colors.background
                        : priority.color
                    }
                  ]}>
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Family Members */}
          {familyMembers.length > 0 && (
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.text }]}>Participants</Text>
              <View style={styles.filterGrid}>
                {familyMembers.map((member) => (
                  <TouchableOpacity
                    key={member.id}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: localFilters.assignedMembers.includes(member.id)
                          ? theme.colors.primary
                          : theme.colors.surface,
                        borderColor: theme.colors.border
                      }
                    ]}
                    onPress={() => toggleMember(member.id)}
                  >
                    <Text style={[
                      styles.filterText,
                      {
                        color: localFilters.assignedMembers.includes(member.id)
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

          {/* Date Range */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Période</Text>
            <View style={styles.dateRangeContainer}>
              <TouchableOpacity
                style={[styles.dateButton, {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border
                }]}
              >
                <Text style={[styles.dateButtonText, { color: theme.colors.textSecondary }]}>Du</Text>
                <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
                  {localFilters.dateRange.start
                    ? localFilters.dateRange.start.toLocaleDateString('fr-FR')
                    : 'Sélectionner'
                  }
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.dateButton, {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border
                }]}
              >
                <Text style={[styles.dateButtonText, { color: theme.colors.textSecondary }]}>Au</Text>
                <Text style={[styles.dateButtonText, { color: theme.colors.text }]}>
                  {localFilters.dateRange.end
                    ? localFilters.dateRange.end.toLocaleDateString('fr-FR')
                    : 'Sélectionner'
                  }
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Status Options */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Statut</Text>
            
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Afficher les événements terminés</Text>
              <Switch
                value={localFilters.showCompleted}
                onValueChange={(value) => updateFilters({ showCompleted: value })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.colors.background}
              />
            </View>
            
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Afficher les événements en retard</Text>
              <Switch
                value={localFilters.showOverdue}
                onValueChange={(value) => updateFilters({ showOverdue: value })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.colors.background}
              />
            </View>
          </View>

          {/* Special Filters */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Filtres spéciaux</Text>
            
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: theme.colors.text }]}>Événements avec récompense Tribs</Text>
              <Switch
                value={localFilters.hasTribs}
                onValueChange={(value) => updateFilters({ hasTribs: value })}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor={theme.colors.background}
              />
            </View>
          </View>

          {/* Quick Filters */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: theme.colors.text }]}>Filtres rapides</Text>
            <View style={styles.quickFilters}>
              <TouchableOpacity
                style={[styles.quickFilter, {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border
                }]}
                onPress={() => {
                  const today = new Date();
                  updateFilters({
                    dateRange: {
                      start: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
                      end: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
                    }
                  });
                }}
              >
                <Text style={[styles.quickFilterText, { color: theme.colors.text }]}>Aujourd'hui</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.quickFilter, {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border
                }]}
                onPress={() => {
                  const today = new Date();
                  const startOfWeek = new Date(today);
                  startOfWeek.setDate(today.getDate() - today.getDay() + 1);
                  const endOfWeek = new Date(startOfWeek);
                  endOfWeek.setDate(startOfWeek.getDate() + 6);
                  endOfWeek.setHours(23, 59, 59);
                  
                  updateFilters({
                    dateRange: {
                      start: startOfWeek,
                      end: endOfWeek
                    }
                  });
                }}
              >
                <Text style={[styles.quickFilterText, { color: theme.colors.text }]}>Cette semaine</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.quickFilter, {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border
                }]}
                onPress={() => {
                  const today = new Date();
                  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
                  
                  updateFilters({
                    dateRange: {
                      start: startOfMonth,
                      end: endOfMonth
                    }
                  });
                }}
              >
                <Text style={[styles.quickFilterText, { color: theme.colors.text }]}>Ce mois</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Reset Button */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.resetButton, {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border
              }]}
              onPress={handleReset}
            >
              <Text style={[styles.resetButtonText, { color: theme.colors.text }]}>
                Réinitialiser tous les filtres
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );


};

export default CalendarFiltersComponent;