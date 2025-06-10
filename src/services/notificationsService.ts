import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { familyService } from './familyService';

export interface CalendarEventLike {
  id: string;
  title: string;
  startDate: Date;
  location?: string;
  reminders?: number[] | null;
  assignees?: string[] | null;
}

async function requestPermissions() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  }
  return existing === 'granted';
}

export const notificationsService = {
  async registerDevice(familyId: string, memberId: string) {
    const granted = await requestPermissions();
    if (!granted) return null;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
    const token = tokenData.data;
    try {
      await familyService.updateMember(familyId, memberId, { expoPushToken: token });
    } catch (err) {
      console.warn('Unable to save push token', err);
    }
    return token;
  },

  async scheduleLocalEvent(event: CalendarEventLike) {
    if (!event.reminders || !event.assignees) return;
    const start = new Date(event.startDate);
    for (const minutes of event.reminders) {
      const triggerTime = start.getTime() - minutes * 60000;
      if (triggerTime <= Date.now()) continue;
      await Notifications.scheduleNotificationAsync({
        content: {
          title: event.title,
          body: event.location ? `\uD83D\uDCCD ${event.location}` : 'Rappel',
          data: { eventId: event.id },
        },
        trigger: { date: new Date(triggerTime) },
      });
    }
  },
};
