import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { calendarService } from './src/services/calendarService';
import { familyService } from './src/services/familyService';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function debugNotifications() {
  console.log('🔔 === DEBUG NOTIFICATIONS ===');
  
  // 1. Vérifier les permissions
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    console.log('📱 Permissions actuelles:', existing);
    
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      console.log('📱 Nouvelles permissions:', status);
    }
  } catch (error) {
    console.error('❌ Erreur permissions:', error);
  }
  
  // 2. Vérifier le projectId
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  console.log('🏗️ Project ID:', projectId);
  
  if (!projectId) {
    console.warn('⚠️ Project ID manquant dans la config Expo');
  }
  
  // 3. Tester l'obtention du token
  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId || Constants.expoConfig?.extra?.eas?.projectId,
    });
    console.log('🎫 Token obtenu:', tokenData.data.substring(0, 20) + '...');
  } catch (error) {
    console.error('❌ Erreur token:', error);
  }
  
  // 4. Tester une notification locale
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🧪 Test Tribly',
        body: 'Notification de test - si tu vois ça, ça marche !',
        data: { test: true },
      },
      trigger: { seconds: 2 },
    });
    console.log('📬 Notification programmée:', notificationId);
  } catch (error) {
    console.error('❌ Erreur notification locale:', error);
  }
  
  console.log('🔔 === FIN DEBUG ===');
}

export async function debugFirebaseEvents() {
  console.log('🔥 === DEBUG FIREBASE EVENTS ===');
  
  try {
    // Récupérer la famille de test
    const families = await familyService.getFamilies('user-001'); // Remplacer par un userId valide
    if (families.length === 0) {
      console.log('❌ Aucune famille trouvée');
      return;
    }
    
    const familyId = families[0].id;
    console.log('👨‍👩‍👧‍👦 Famille ID:', familyId);
    
    // Récupérer les événements
    calendarService.subscribeToEvents(familyId, (events, error) => {
      if (error) {
        console.error('❌ Erreur récupération événements:', error);
        return;
      }
      
      console.log('📅 Nombre d\'événements:', events.length);
      
      events.forEach((event, index) => {
        console.log(`\n📝 Événement ${index + 1}:`);
        console.log('  - Titre:', event.title);
        console.log('  - Start Date:', event.startDate);
        console.log('  - Reminders (raw):', event.reminders);
        console.log('  - Reminders type:', typeof event.reminders);
        console.log('  - Reminders length:', event.reminders?.length);
        console.log('  - Assignees:', event.assignees);
        
        if (event.reminders) {
          console.log('  - Reminders détail:', event.reminders.map((r, i) => `${i}: ${r} (${typeof r})`));
        }
      });
    });
    
  } catch (error) {
    console.error('❌ Erreur debug Firebase:', error);
  }
  
  console.log('🔥 === FIN DEBUG FIREBASE ===');
}

// Auto-exécution si appelé directement
if (typeof window !== 'undefined') {
  debugNotifications();
}