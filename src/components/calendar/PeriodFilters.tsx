import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export type PeriodFilter = 'all' | 'today' | 'week';

type PeriodFiltersProps = {
  selectedFilter: PeriodFilter;
  onFilterChange: (filter: PeriodFilter) => void;
};

const PeriodFilters: React.FC<PeriodFiltersProps> = ({
  selectedFilter,
  onFilterChange,
}) => {
  const theme = useTheme();

  const filters = [
    { key: 'all' as PeriodFilter, label: 'Tous' },
    { key: 'today' as PeriodFilter, label: "Aujourd'hui" },
    { key: 'week' as PeriodFilter, label: 'Cette semaine' },
  ];

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      backgroundColor: '#FFFFFF',
      borderWidth: 0,
      borderColor: '#E7EAF0',
      borderRadius: 18,
      paddingVertical: 4,
      paddingHorizontal: 8,
      marginHorizontal: 16,
      marginVertical: 8,
      justifyContent: 'space-between',
      gap: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.04,
      shadowRadius: 4,
    },
    filterButton: {
      paddingHorizontal: 2,
      paddingVertical: 8,
      borderRadius: 12,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      backgroundColor: 'rgba(184, 184, 184, 0.1)',
    },
    filterButtonActive: {
      backgroundColor: 'rgba(255, 92, 92, 0.15)',
    },
    filterText: {
      paddingHorizontal: 4, 
      fontSize: 16,
      fontWeight: '500',
      color: '#454D58',
      textAlign: 'center',
    },
    filterTextActive: {
      fontSize: 16,
      fontWeight: '500',
      color: '#C8102E',
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.key}
          style={[
            styles.filterButton,
            selectedFilter === filter.key && styles.filterButtonActive
          ]}
          onPress={() => onFilterChange(filter.key)}
        >
          <Text style={[
            styles.filterText,
            selectedFilter === filter.key && styles.filterTextActive
          ]}>
            {filter.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default PeriodFilters;