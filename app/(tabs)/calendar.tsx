import React from 'react';
import { StyleSheet } from 'react-native';
import CalendarScreen from '../../src/components/calendar/CalendarScreen';
import { CalendarProvider } from '../../src/hooks/useCalendar';

export default function CalendarTab() {
  return (
    <CalendarProvider>
      <CalendarScreen />
    </CalendarProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  eventsSection: {
    padding: 20,
  },
  eventsSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d4150',
    marginBottom: 15,
  },
  eventItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventTime: {
    backgroundColor: '#7986CB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eventTimeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d4150',
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    color: '#718096',
  },
  noEvents: {
    alignItems: 'center',
    padding: 30,
  },
  noEventsText: {
    fontSize: 16,
    color: '#a0aec0',
    marginBottom: 20,
    textAlign: 'center',
  },
  addEventButton: {
    backgroundColor: '#7986CB',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  addEventButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectDatePrompt: {
    alignItems: 'center',
    padding: 30,
  },
  selectDateText: {
    fontSize: 16,
    color: '#a0aec0',
    textAlign: 'center',
  },
});