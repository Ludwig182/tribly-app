import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { ViewMode, CalendarFilters as CalendarFiltersType } from '../../types/calendar';
import { FamilyMember } from '../../types/calendar';
import CalendarFilters from './CalendarFilters';

type CalendarHeaderProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: CalendarFiltersType;
  familyMembers: FamilyMember[];
  onFiltersChange: (filters: CalendarFiltersType) => void;
  onNavigateNext: () => void;
  onNavigatePrevious: () => void;
  onNavigateToday: () => void;
  currentDate: Date;
};

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  onViewModeChange,
  filters,
  familyMembers,
  onFiltersChange,
  onNavigateNext,
  onNavigatePrevious,
  onNavigateToday,
  currentDate
}) => {
  const theme = useTheme();
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const formatCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    };
    return currentDate.toLocaleDateString('fr-FR', options);
  };

  const viewModeOptions = [
    { key: 'month', label: 'Mois' },
    { key: 'week', label: 'Semaine' },
    { key: 'day', label: 'Jour' },
    { key: 'agenda', label: 'Agenda' }
  ];

  const styles = StyleSheet.create({
    container: {
      // Padding géré par navigationSection dans CalendarScreen
      justifyContent: 'space-between',
      gap: 12,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'white',
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.9)',
      marginBottom: 16,
      textTransform: 'capitalize',
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    navigationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    navButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.primary,
      minWidth: 40,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: 'white',
    },
    currentDateText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    todayButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: theme.colors.primary,
    },
    todayButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: 'white',
    },
    bottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    viewModeContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 2,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    viewModeButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      minHeight: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    viewModeButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    viewModeButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
    },
    viewModeButtonTextActive: {
      color: 'white',
    },
    filtersButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      gap: 6,
      minHeight: 40,
      justifyContent: 'center',
    },
    filtersButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.text,
    },
  });

  return (
    <>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.navigationContainer}>
            <TouchableOpacity style={styles.navButton} onPress={onNavigatePrevious}>
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>
            
            <Text style={styles.currentDateText}>
              {viewMode === 'month' ? 'Mois' : viewMode === 'week' ? 'Semaine' : viewMode === 'day' ? 'Jour' : 'Agenda'}
            </Text>
            
            <TouchableOpacity style={styles.navButton} onPress={onNavigateNext}>
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity style={styles.todayButton} onPress={onNavigateToday}>
            <Text style={styles.todayButtonText}>Aujourd'hui</Text>
          </TouchableOpacity>
        </View>

        {/* View Mode and Filters Row */}
        <View style={styles.bottomRow}>
          <View style={styles.viewModeContainer}>
            {viewModeOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.viewModeButton,
                  viewMode === option.key && styles.viewModeButtonActive
                ]}
                onPress={() => onViewModeChange(option.key as ViewMode)}
              >
                <Text
                  style={[
                    styles.viewModeButtonText,
                    viewMode === option.key && styles.viewModeButtonTextActive
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity 
            style={styles.filtersButton} 
            onPress={() => setIsFiltersVisible(true)}
          >
            <Text style={styles.filtersButtonText}>🔍</Text>
            <Text style={styles.filtersButtonText}>Filtres</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filters Modal */}
      <CalendarFilters
        visible={isFiltersVisible}
        filters={filters}
        familyMembers={familyMembers}
        onFiltersChange={onFiltersChange}
        onClose={() => setIsFiltersVisible(false)}
        onReset={() => {
          onFiltersChange({
            searchQuery: '',
            eventTypes: [],
            priorities: [],
            assignedMembers: [],
            dateRange: {},
            showCompleted: true,
            showOverdue: true,
            hasTribs: false
          });
        }}
      />
    </>
  );
};

export default CalendarHeader;