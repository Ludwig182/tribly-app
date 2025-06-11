import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { ViewMode } from '../../types/calendar';

type CalendarHeaderProps = {
  viewMode: ViewMode;
  onNavigateNext: () => void;
  onNavigatePrevious: () => void;
  onNavigateToday: () => void;
  currentDate: Date;
};

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  onNavigateNext,
  onNavigatePrevious,
  onNavigateToday,
  currentDate
}) => {
  const theme = useTheme();

  const formatCurrentDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    };
    return currentDate.toLocaleDateString('fr-FR', options);
  };

  const formatDateForViewMode = () => {
    switch (viewMode) {
      case 'month':
        return currentDate.toLocaleDateString('fr-FR', { 
          month: 'long', 
          year: 'numeric' 
        });
      case 'week':
        // Calculer le début et la fin de la semaine
        const startOfWeek = new Date(currentDate);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day;
        startOfWeek.setDate(diff);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        const startMonth = startOfWeek.toLocaleDateString('fr-FR', { month: 'short' });
        const endMonth = endOfWeek.toLocaleDateString('fr-FR', { month: 'short' });
        const year = currentDate.getFullYear();
        
        if (startOfWeek.getMonth() === endOfWeek.getMonth()) {
          return `${startOfWeek.getDate()}-${endOfWeek.getDate()} ${startMonth} ${year}`;
        } else {
          return `${startOfWeek.getDate()} ${startMonth} - ${endOfWeek.getDate()} ${endMonth} ${year}`;
        }
      case 'day':
        return currentDate.toLocaleDateString('fr-FR', { 
          weekday: 'long',
          day: 'numeric', 
          month: 'long',
          year: 'numeric'
        });
      case 'agenda':
        return '';
      default:
        return formatCurrentDate();
    }
  };



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
      marginBottom: 1,
    },
    navigationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    agendaContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: theme.colors.calendarNavBackground,
      minWidth: 40,
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.calendarNavIcon,
    },
    currentDateText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
    },
    todayButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.colors.calendarTodayBackground,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    todayButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: 'white',
    },

  });

  return (
    <>
      <View style={styles.container}>
        <View style={styles.topRow}>
          {viewMode === 'agenda' ? (
            // Mode agenda : pas de navigation, juste le titre centré
            <View style={styles.agendaContainer}>
              <Text style={styles.currentDateText}>
                {formatDateForViewMode()}
              </Text>
            </View>
          ) : (
            // Autres modes : navigation normale
            <View style={styles.navigationContainer}>
              <TouchableOpacity style={styles.navButton} onPress={onNavigatePrevious}>
                <Text style={styles.navButtonText}>‹</Text>
              </TouchableOpacity>
              
              <Text style={styles.currentDateText}>
                {formatDateForViewMode()}
              </Text>
              
              <TouchableOpacity style={styles.navButton} onPress={onNavigateNext}>
                <Text style={styles.navButtonText}>›</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {viewMode !== 'agenda' && (
            <TouchableOpacity style={styles.todayButton} onPress={onNavigateToday}>
              <Text style={styles.todayButtonText}>Aujourd'hui</Text>
            </TouchableOpacity>
          )}
        </View>


      </View>


    </>
  );
};

export default CalendarHeader;