import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../theme/useTheme';
import { ViewMode, CalendarFilters as CalendarFiltersType } from '../../types/calendar';
import { FamilyMember } from '../../types/calendar';
import CalendarFilters from './CalendarFilters';

type ViewModeSelectorProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: CalendarFiltersType;
  familyMembers: FamilyMember[];
  onFiltersChange: (filters: CalendarFiltersType) => void;
};

const ViewModeSelector: React.FC<ViewModeSelectorProps> = ({
  viewMode,
  onViewModeChange,
  filters,
  familyMembers,
  onFiltersChange,
}) => {
  const theme = useTheme();
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

  const tabOptions = [
    { key: 'month' as ViewMode, label: 'Mois' },
    { key: 'week' as ViewMode, label: 'Semaine' },
    { key: 'day' as ViewMode, label: 'Jour' },
    { key: 'agenda' as ViewMode, label: 'Agenda' },
  ];

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    navigationContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 8,
      backgroundColor: '#F5F5F5',
      borderRadius: 16,
    },
    tabsGroup: {
      flexDirection: 'row',
      gap: 4,
      flex: 1,
    },
    tab: {
         paddingHorizontal: 4,
         paddingVertical: 12,
         borderRadius: 12,
         alignItems: 'center',
         justifyContent: 'center',
         backgroundColor: 'transparent',
         flex: 1,
       },
    tabActive: {
      backgroundColor: '#FFC107',
    },
    tabText: {
       fontSize: 14,
       fontWeight: '500',
       color: '#666666',
       textAlign: 'center',
     },
     tabTextActive: {
       fontSize: 14,
       fontWeight: '600',
       color: '#5D4037',
       textAlign: 'center',
     },
    menuButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: '#E0E0E0',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
    },
  });

  return (
    <>
      <View style={styles.container}>
        <View style={styles.navigationContainer}>
          <View style={styles.tabsGroup}>
            {tabOptions.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tab,
                  viewMode === tab.key && styles.tabActive,
                ]}
                onPress={() => onViewModeChange(tab.key)}
              >
                <Text
                  style={[
                    viewMode === tab.key ? styles.tabTextActive : styles.tabText,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setIsFiltersVisible(true)}
          >
            <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <Path 
                d="M3 12h18M3 6h18M3 18h18" 
                stroke="#333" 
                strokeWidth="2" 
                strokeLinecap="round"
              />
            </Svg>
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

export default ViewModeSelector;