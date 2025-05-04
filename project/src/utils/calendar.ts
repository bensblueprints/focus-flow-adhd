import ICAL from 'ical.js';
import { CalendarEvent } from '../types';

export async function syncToGoogleCalendar(events: CalendarEvent[]): Promise<void> {
  // This would be implemented with Google Calendar API
  // For now, we'll create an iCal file for download
  const calendar = new ICAL.Component(['vcalendar', [], []]);
  
  calendar.updatePropertyWithValue('prodid', '-//FocusFlow//EN');
  calendar.updatePropertyWithValue('version', '2.0');
  
  events.forEach(event => {
    const vevent = new ICAL.Component('vevent');
    
    vevent.updatePropertyWithValue('summary', event.title);
    vevent.updatePropertyWithValue('dtstart', ICAL.Time.fromString(event.startTime));
    vevent.updatePropertyWithValue('dtend', ICAL.Time.fromString(event.endTime));
    vevent.updatePropertyWithValue('description', event.description || '');
    
    calendar.addSubcomponent(vevent);
  });
  
  const blob = new Blob([calendar.toString()], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'focusflow-calendar.ics';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function syncToAppleCalendar(events: CalendarEvent[]): Promise<void> {
  // For now, this will use the same iCal export as Google Calendar
  await syncToGoogleCalendar(events);
}

export function generateCalendarEvents(habits: Habit[]): CalendarEvent[] {
  return habits
    .filter(habit => habit.calendarSync && habit.startTime && habit.endTime)
    .map(habit => ({
      id: `habit-${habit.id}`,
      title: habit.title,
      startTime: habit.startTime,
      endTime: habit.endTime,
      description: habit.description,
      type: 'habit' as const,
      itemId: habit.id
    }));
}