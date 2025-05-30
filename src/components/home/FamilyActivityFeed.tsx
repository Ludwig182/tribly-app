// src/components/home/FamilyActivityFeed.tsx
import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Animated,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';

interface Member {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  color: string;
  status?: string;
}

interface Props {
  members: Member[];
}

// Activités simulées (en attendant l'intégration temps réel)
const mockActivities = [
  { id: '1', type: 'task', member: 'Clémentine', action: 'a terminé', detail: 'Ranger sa chambre', time: 'Il y a 5 min', tribs: 15 },
  { id: '2', type: 'shopping', member: 'Ludwig', action: 'a ajouté', detail: '3 articles aux courses', time: 'Il y a 15 min' },
  { id: '3', type: 'calendar', member: 'Jacob', action: 'participe à', detail: 'Entraînement foot', time: 'Dans 1h' },
];

export default function FamilyActivityFeed({ members }: Props) {
  const { colors, name: themeName } = useTheme();
  const fadeAnims = useRef(mockActivities.map(() => new Animated.Value(0))).current;
  const slideAnims = useRef(mockActivities.map(() => new Animated.Value(20))).current;

  useEffect(() => {
    // Animation d'entrée des items
    mockActivities.forEach((_, index) => {
      Animated.parallel([
        Animated.timing(fadeAnims[index], {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[index], {
          toValue: 0,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        })
      ]).start();
    });
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task': return '✅';
      case 'shopping': return '🛒';
      case 'calendar': return '📅';
      default: return '📌';
    }
  };

  const getMemberData = (memberName: string) => {
    const member = members.find(m => m.name === memberName);
    return member || { 
      avatar: '👤', 
      color: colors.primary,
      avatarUrl: null 
    };
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {themeName === 'child' ? '🎯 La famille bouge !' : '👥 Activité famille'}
        </Text>
        <View style={styles.liveIndicator}>
          <Animated.View style={styles.liveDot}>
            <View style={[styles.liveDotInner, { backgroundColor: '#4CAF50' }]} />
          </Animated.View>
          <Text style={[styles.liveText, { color: colors.textSecondary }]}>En direct</Text>
        </View>
      </View>

      <View style={[styles.feedContainer, { backgroundColor: colors.card }]}>
        {mockActivities.map((activity, index) => {
          const memberData = getMemberData(activity.member);
          
          return (
            <Animated.View
              key={activity.id}
              style={[
                styles.activityItem,
                {
                  opacity: fadeAnims[index],
                  transform: [{ translateX: slideAnims[index] }]
                }
              ]}
            >
              <TouchableOpacity activeOpacity={0.7} style={styles.activityTouchable}>
                {/* Avatar */}
                <View style={styles.avatarContainer}>
                  {memberData.avatarUrl ? (
                    <Image 
                      source={{ uri: memberData.avatarUrl }} 
                      style={styles.avatarImage}
                    />
                  ) : (
                    <LinearGradient
                      colors={[memberData.color, memberData.color]}
                      style={styles.avatarGradient}
                    >
                      <Text style={styles.avatarEmoji}>{memberData.avatar}</Text>
                    </LinearGradient>
                  )}
                  <View style={[styles.activityIcon, { backgroundColor: colors.background }]}>
                    <Text style={styles.activityIconText}>{getActivityIcon(activity.type)}</Text>
                  </View>
                </View>

                {/* Content */}
                <View style={styles.activityContent}>
                  <Text style={[styles.activityText, { color: colors.text }]}>
                    <Text style={styles.memberName}>{activity.member}</Text>
                    {' '}{activity.action}{' '}
                    <Text style={styles.activityDetail}>{activity.detail}</Text>
                  </Text>
                  <View style={styles.activityMeta}>
                    <Text style={[styles.timeText, { color: colors.textTertiary }]}>
                      {activity.time}
                    </Text>
                    {activity.tribs && (
                      <View style={[styles.tribsBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Text style={[styles.tribsText, { color: colors.primary }]}>
                          +{activity.tribs} Tribs
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Arrow */}
                <Text style={[styles.arrow, { color: colors.textTertiary }]}>›</Text>
              </TouchableOpacity>

              {index < mockActivities.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
              )}
            </Animated.View>
          );
        })}

        {/* Call to action pour thème enfant */}
        {themeName === 'child' && (
          <TouchableOpacity style={styles.ctaContainer}>
            <LinearGradient
              colors={['#4FC3F7', '#29B6F6']}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaText}>🎯 Ajoute ta propre activité !</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  liveDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  liveText: {
    fontSize: 12,
    fontWeight: '500',
  },

  feedContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  activityItem: {
    paddingHorizontal: 16,
  },

  activityTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },

  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },

  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  avatarGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarEmoji: {
    fontSize: 18,
  },

  activityIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },

  activityIconText: {
    fontSize: 10,
  },

  activityContent: {
    flex: 1,
  },

  activityText: {
    fontSize: 14,
    lineHeight: 20,
  },

  memberName: {
    fontWeight: '600',
  },

  activityDetail: {
    fontWeight: '500',
  },

  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },

  timeText: {
    fontSize: 12,
  },

  tribsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },

  tribsText: {
    fontSize: 11,
    fontWeight: '600',
  },

  arrow: {
    fontSize: 20,
    marginLeft: 8,
  },

  divider: {
    height: 1,
    marginLeft: 52,
  },

  ctaContainer: {
    padding: 12,
  },

  ctaGradient: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});