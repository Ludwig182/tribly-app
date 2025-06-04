import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { CalendarEvent, FamilyMember } from '../../types/calendar';

type EventCardProps = {
  event: CalendarEvent;
  viewMode: 'compact' | 'detailed' | 'timeline';
  onEdit: (event: CalendarEvent) => void;
  onComplete: (eventId: string) => void;
  onDelete: (eventId: string) => void;
  currentUser?: FamilyMember;
};

const EventCard: React.FC<EventCardProps> = ({
  event,
  viewMode,
  onEdit,
  onComplete,
  onDelete,
  currentUser
}) => {
  const theme = useTheme();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (startDate: Date, endDate?: Date) => {
    if (!endDate) return '';
    
    const duration = endDate.getTime() - startDate.getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`;
    }
    return `${minutes}min`;
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

  const renderCompactView = () => (
    <TouchableOpacity
      style={[
        styles.compactContainer,
        { borderLeftColor: eventColor },
        isCompleted && styles.completedContainer
      ]}
      onPress={() => onEdit(event)}
    >
      <View style={styles.compactHeader}>
        <Text style={styles.eventIcon}>{getEventTypeIcon(event.type)}</Text>
        <View style={styles.compactContent}>
          <Text style={[
            styles.compactTitle,
            isCompleted && styles.completedText
          ]} numberOfLines={1}>
            {event.title}
          </Text>
          <Text style={styles.compactTime}>
            {event.isAllDay ? 'Toute la journée' : formatTime(new Date(event.startDate))}
          </Text>
        </View>
        {event.priority && event.priority !== 'medium' && (
          <View style={[
            styles.priorityDot,
            { backgroundColor: getPriorityColor(event.priority) }
          ]} />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderDetailedView = () => (
    <TouchableOpacity
      style={[
        styles.detailedContainer,
        { borderLeftColor: eventColor },
        isCompleted && styles.completedContainer,
        isOverdue && styles.overdueContainer
      ]}
      onPress={() => onEdit(event)}
    >
      <View style={styles.detailedHeader}>
        <View style={styles.titleRow}>
          <Text style={styles.eventIcon}>{getEventTypeIcon(event.type)}</Text>
          <Text style={[
            styles.detailedTitle,
            isCompleted && styles.completedText
          ]} numberOfLines={2}>
            {event.title}
          </Text>
          {event.priority && event.priority !== 'medium' && (
            <View style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(event.priority) }
            ]}>
              <Text style={styles.priorityText}>
                {event.priority.toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>
            {event.isAllDay 
              ? 'Toute la journée'
              : `${formatTime(new Date(event.startDate))}${event.endDate ? ` - ${formatTime(new Date(event.endDate))}` : ''}`
            }
          </Text>
          {event.endDate && !event.isAllDay && (
            <Text style={styles.durationText}>
              ({formatDuration(new Date(event.startDate), new Date(event.endDate))})
            </Text>
          )}
        </View>

        {event.description && (
          <Text style={styles.description} numberOfLines={2}>
            {event.description}
          </Text>
        )}

        <View style={styles.metaRow}>
          {event.location && (
            <Text style={styles.metaText} numberOfLines={1}>
              📍 {event.location}
            </Text>
          )}
          {event.assignedTo && event.assignedTo.length > 0 && (
            <Text style={styles.metaText}>
              👥 {event.assignedTo.length} participant{event.assignedTo.length > 1 ? 's' : ''}
            </Text>
          )}
          {event.tribsReward && (
            <Text style={styles.tribsReward}>
              🏆 {event.tribsReward} Tribs
            </Text>
          )}
        </View>

        {(isOverdue || event.status === 'in_progress') && (
          <View style={styles.statusRow}>
            {isOverdue && (
              <View style={styles.overduebadge}>
                <Text style={styles.overdueBadgeText}>En retard</Text>
              </View>
            )}
            {event.status === 'in_progress' && (
              <View style={styles.inProgressBadge}>
                <Text style={styles.inProgressBadgeText}>En cours</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTimelineView = () => (
    <View style={styles.timelineContainer}>
      <View style={styles.timelineTime}>
        <Text style={styles.timelineTimeText}>
          {formatTime(new Date(event.startDate))}
        </Text>
        {event.endDate && (
          <Text style={styles.timelineEndTime}>
            {formatTime(new Date(event.endDate))}
          </Text>
        )}
      </View>
      
      <View style={styles.timelineLine}>
        <View style={[
          styles.timelineDot,
          { backgroundColor: eventColor }
        ]} />
        {event.endDate && (
          <View style={[
            styles.timelineBar,
            { backgroundColor: eventColor + '40' }
          ]} />
        )}
      </View>
      
      <TouchableOpacity
        style={[
          styles.timelineContent,
          isCompleted && styles.completedContainer
        ]}
        onPress={() => onEdit(event)}
      >
        <View style={styles.timelineHeader}>
          <Text style={styles.eventIcon}>{getEventTypeIcon(event.type)}</Text>
          <Text style={[
            styles.timelineTitle,
            isCompleted && styles.completedText
          ]} numberOfLines={1}>
            {event.title}
          </Text>
        </View>
        
        {event.description && (
          <Text style={styles.timelineDescription} numberOfLines={1}>
            {event.description}
          </Text>
        )}
        
        {event.location && (
          <Text style={styles.timelineLocation} numberOfLines={1}>
            📍 {event.location}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );

  const styles = StyleSheet.create({
    // Compact View Styles
    compactContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      borderLeftWidth: 4,
      marginVertical: 2,
      padding: 12,
    },
    compactHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    compactContent: {
      flex: 1,
      marginLeft: 12,
    },
    compactTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    compactTime: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    
    // Detailed View Styles
    detailedContainer: {
      backgroundColor: theme.colors.surface,
      borderRadius: 12,
      borderLeftWidth: 4,
      marginVertical: 6,
      padding: 16,
      shadowColor: theme.colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    detailedHeader: {
      gap: 8,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    detailedTitle: {
      flex: 1,
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      lineHeight: 22,
    },
    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    timeText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    durationText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    description: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
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
    statusRow: {
      flexDirection: 'row',
      gap: 8,
    },
    
    // Timeline View Styles
    timelineContainer: {
      flexDirection: 'row',
      paddingVertical: 8,
    },
    timelineTime: {
      width: 60,
      alignItems: 'flex-end',
      paddingRight: 12,
    },
    timelineTimeText: {
      fontSize: 12,
      fontWeight: '600',
      color: theme.colors.text,
    },
    timelineEndTime: {
      fontSize: 10,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    timelineLine: {
      width: 20,
      alignItems: 'center',
      position: 'relative',
    },
    timelineDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    timelineBar: {
      width: 2,
      flex: 1,
      marginTop: 4,
    },
    timelineContent: {
      flex: 1,
      backgroundColor: theme.colors.surface,
      borderRadius: 8,
      padding: 12,
      marginLeft: 8,
    },
    timelineHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    timelineTitle: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
    },
    timelineDescription: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: 4,
    },
    timelineLocation: {
      fontSize: 11,
      color: theme.colors.textSecondary,
      marginTop: 2,
    },
    
    // Common Styles
    eventIcon: {
      fontSize: 16,
    },
    priorityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    priorityBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    priorityText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.background,
    },
    completedContainer: {
      opacity: 0.6,
    },
    completedText: {
      textDecorationLine: 'line-through',
    },
    overdueContainer: {
      borderLeftColor: theme.colors.error,
    },
    overdueBadge: {
      backgroundColor: theme.colors.error,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    overdueBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.background,
    },
    inProgressBadge: {
      backgroundColor: theme.colors.warning,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    inProgressBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.background,
    },
  });

  switch (viewMode) {
    case 'compact':
      return renderCompactView();
    case 'timeline':
      return renderTimelineView();
    default:
      return renderDetailedView();
  }
};

export default EventCard;