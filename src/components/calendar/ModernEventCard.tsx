import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { CalendarEvent, FamilyMember } from '../../types/calendar';
import { useFamily } from '../../hooks/useFamily';
import { Image } from 'react-native';

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
  const { familyMembers } = useFamily();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // getEventTypeIcon supprimé - remplacé par les avatars des membres

  // getEventTypeColor supprimé - plus de catégories

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      normal: theme.colors.textSecondary,
      urgent: '#D32F2F'
    };
    return colors[priority] || theme.colors.textSecondary;
  };

  const isCompleted = event.status === 'completed';
  const isOverdue = new Date(event.startDate) < new Date() && !isCompleted;
  // Fonction pour calculer la couleur dynamiquement basée sur les assignés
  const getEventColor = () => {
    if (!event.assignees || event.assignees.length === 0) {
      return theme.colors.primary; // Couleur par défaut si aucun assigné
    }
    
    if (event.assignees.length === 1) {
      // Un seul assigné : utiliser sa couleur
      // Chercher d'abord par userId, puis par id en fallback
      const member = familyMembers?.find(m => m.userId === event.assignees[0]) || 
                     familyMembers?.find(m => m.id === event.assignees[0]);
      return member?.color || theme.colors.primary;
    }
    
    // Plusieurs assignés : utiliser une couleur neutre (gris-bleu)
    return '#6B7280'; // Gris-bleu pour différencier les événements multi-assignés
  };
  
  const eventColor = getEventColor();

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
    avatarsContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      width: 32,
      height: 'auto',
      gap: 0,
    },
    avatarWrapper: {
      borderWidth: 2,
      borderColor: '#FFFFFF',
      borderRadius: 16,
    },
    memberAvatar: {
      width: 28,
      height: 28,
      borderRadius: 14,
    },
    memberAvatarFallback: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    memberAvatarText: {
      fontSize: 12,
      fontWeight: '600',
    },
    defaultIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    defaultIcon: {
      fontSize: 16,
    },
    moreIndicator: {
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -4,
    },
    moreText: {
      fontSize: 10,
      fontWeight: '600',
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
    priorityBadge: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    priorityText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#FFFFFF',
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
          {/* Avatars des membres assignés */}
          <View style={styles.avatarsContainer}>
            {event.assignees && event.assignees.length > 0 ? (
              event.assignees.slice(0, 2).map((assigneeId, index) => {
                // Chercher d'abord par userId, puis par id en fallback
                const member = familyMembers?.find(m => m.userId === assigneeId) || 
                               familyMembers?.find(m => m.id === assigneeId);
                
                return (
                  <View 
                    key={assigneeId} 
                    style={[
                      styles.avatarWrapper,
                      index > 0 && { marginTop: -8 }
                    ]}
                  >
                    {member ? (
                      member.avatarUrl ? (
                        <Image 
                          source={{ uri: member.avatarUrl }} 
                          style={styles.memberAvatar}
                        />
                      ) : (
                        <View style={[styles.memberAvatarFallback, { backgroundColor: eventColor + '20' }]}>
                          <Text style={styles.memberAvatarText}>{member.avatar}</Text>
                        </View>
                      )
                    ) : (
                      <View style={[styles.defaultIconContainer, { backgroundColor: eventColor + '15' }]}>
                        <Text style={styles.defaultIcon}>📅</Text>
                      </View>
                    )}
                  </View>
                );
              })
            ) : (
              <View style={[styles.defaultIconContainer, { backgroundColor: eventColor + '15' }]}>
                <Text style={styles.defaultIcon}>📅</Text>
              </View>
            )}
            {event.assignees && event.assignees.length > 2 && (
              <View style={[styles.moreIndicator, { backgroundColor: theme.colors.textSecondary + '20' }]}>
                <Text style={[styles.moreText, { color: theme.colors.textSecondary }]}>+{event.assignees.length - 2}</Text>
              </View>
            )}
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
          {event.priority === 'urgent' && (
            <View style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(event.priority) }
            ]}>
              <Text style={styles.priorityText}>URGENT</Text>
            </View>
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