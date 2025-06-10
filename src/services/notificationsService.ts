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

    let start: Date;
    if (
      event.startDate &&
      typeof (event.startDate as any).toDate === 'function'
    ) {
      start = (event.startDate as any).toDate();
    } else {
      start = new Date(event.startDate as any);
    }

    if (isNaN(start.getTime())) {
      console.warn('Invalid start date for event', event);
      return;
    }

    const now = Date.now();
    
    console.log('🔔 [scheduleLocalEvent] Event:', event.title);
    console.log('🔔 [scheduleLocalEvent] Start date raw:', event.startDate);
    console.log('🔔 [scheduleLocalEvent] Start date parsed:', start);
    console.log('🔔 [scheduleLocalEvent] Current time:', new Date(now));
    console.log('🔔 [scheduleLocalEvent] Reminders:', event.reminders);
    
    for (const minutes of event.reminders) {
      const triggerTime = start.getTime() - minutes * 60000;
      const triggerDate = new Date(triggerTime);
      
      console.log(`🔔 [scheduleLocalEvent] Reminder ${minutes}min before:`);
      console.log(`🔔 [scheduleLocalEvent] - Trigger time: ${triggerDate}`);
      console.log(`🔔 [scheduleLocalEvent] - Is in past? ${triggerTime <= now}`);
      
      // Ajouter une marge de sécurité de 30 secondes pour éviter les notifications immédiates
      const safetyMargin = 30 * 1000; // 30 secondes en millisecondes
      if (triggerTime <= now + safetyMargin) {
        console.log('🔔 [scheduleLocalEvent] ⚠️ Skipping past/immediate reminder (with 30s safety margin)');
        continue;
      }
      
      console.log('🔔 [scheduleLocalEvent] ✅ Scheduling notification');
      await Notifications.scheduleNotificationAsync({
        content: {
          title: event.title,
          body: event.location ? `\uD83D\uDCCD ${event.location}` : 'Rappel',
          data: { eventId: event.id },
        },
        trigger: { date: triggerDate },
      });
    }
  },
};
