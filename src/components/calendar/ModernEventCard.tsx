import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { CalendarEvent, FamilyMember } from '../../types/calendar';

type ModernEventCardProps = {
  event: CalendarEvent;
  onEdit: (event: CalendarEvent) => void;
  onComplete?: (eventId: string) => void;
  currentUser?: FamilyMember;
  compact?: boolean;
};

const ModernEventCard: React.FC<ModernEventCardProps> = ({
  event,
  onEdit,
  onComplete,
  currentUser,
  compact = false
}) => {
  const theme = useTheme();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getEventTypeIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      personal: '👤',
      family: '👨‍👩‍👧‍👦',
      chore: '🧹',
      appointment: '🏥',
      school: '🎓',
      leisure: '🎉',
      sport: '⚽',
      reminder: '⏰'
    };
    return icons[type] || '📅';
  };

  const getEventTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      personal: theme.colors.primary,
      family: '#4CAF50',
      chore: '#FF9800',
      appointment: '#2196F3',
      school: '#9C27B0',
      leisure: '#E91E63',
      sport: '#FF5722',
      reminder: '#607D8B'
    };
    return colors[type] || theme.colors.primary;
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      low: theme.colors.success,
      medium: theme.colors.warning,
      high: theme.colors.error,
      urgent: '#D32F2F'
    };
    return colors[priority] || theme.colors.textSecondary;
  };

  const isCompleted = event.status === 'completed';
  const isOverdue = new Date(event.startDate) < new Date() && !isCompleted;
  const eventColor = event.color || getEventTypeColor(event.type);

  const styles = StyleSheet.create({
    container: {
      backgroundColor: 'white',
      borderRadius: 16,
      padding: 16,
      marginHorizontal: 20,
      marginVertical: 6,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
      borderLeftWidth: 4,
      borderLeftColor: eventColor,
      opacity: isCompleted ? 0.7 : 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: compact ? 0 : 8,
    },
    leftContent: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      backgroundColor: eventColor + '15',
      alignItems: 'center',
      justifyContent: 'center',
    },
    eventIcon: {
      fontSize: 16,
    },
    textContent: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 4,
      textDecorationLine: isCompleted ? 'line-through' : 'none',
    },
    timeText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    description: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: 4,
      lineHeight: 20,
    },
    rightContent: {
      alignItems: 'flex-end',
      gap: 4,
    },
    priorityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      backgroundColor: theme.colors.success + '20',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.success,
    },
    overdueBadge: {
      backgroundColor: theme.colors.error + '20',
    },
    overdueText: {
      color: theme.colors.error,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    metaLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    metaText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    tribsReward: {
      fontSize: 12,
      color: theme.colors.warning,
      fontWeight: '600',
    },
  });

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onEdit(event)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.leftContent}>
          <View style={[styles.iconContainer, { backgroundColor: eventColor + '15' }]}>
            <Text style={styles.eventIcon}>{getEventTypeIcon(event.type)}</Text>
          </View>
          
          <View style={styles.textContent}>
            <Text style={styles.title} numberOfLines={compact ? 1 : 2}>
              {event.title}
            </Text>
            <Text style={styles.timeText}>
              {event.isAllDay 
                ? 'Toute la journée'
                : `${formatTime(new Date(event.startDate))}${event.endDate ? ` - ${formatTime(new Date(event.endDate))}` : ''}`
              }
            </Text>
            {!compact && event.description && (
              <Text style={styles.description} numberOfLines={2}>
                {event.description}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.rightContent}>
          {event.priority && event.priority !== 'medium' && (
            <View style={[
              styles.priorityDot,
              { backgroundColor: getPriorityColor(event.priority) }
            ]} />
          )}
          
          {isCompleted && (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✓</Text>
            </View>
          )}
          
          {isOverdue && (
            <View style={[styles.statusBadge, styles.overdueBadge]}>
              <Text style={[styles.statusText, styles.overdueText]}>!</Text>
            </View>
          )}
        </View>
      </View>
      
      {!compact && (event.location || event.assignedTo?.length || event.tribsReward) && (
        <View style={styles.metaRow}>
          <View style={styles.metaLeft}>
            {event.location && (
              <Text style={styles.metaText}>📍 {event.location}</Text>
            )}
            {event.assignedTo && event.assignedTo.length > 0 && (
              <Text style={styles.metaText}>
                👥 {event.assignedTo.length}
              </Text>
            )}
          </View>
          
          {event.tribsReward && (
            <Text style={styles.tribsReward}>
              🏆 {event.tribsReward} Tribs
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

export default ModernEventCard;