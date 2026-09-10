import { EventRow } from '../services/eventsService';

// Format Date to iCal ISO string: YYYYMMDDTHHMMSSZ
function formatDateToICal(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

// Generate Google Calendar Link for an event
export function getGoogleCalendarUrl(event: EventRow): string {
  const title = encodeURIComponent(event.title);
  const details = encodeURIComponent(event.description || 'Evento criado no NEXO');
  const location = encodeURIComponent(event.location || '');
  const startStr = formatDateToICal(event.start_time);
  const endStr = formatDateToICal(event.end_time);

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
}

// Export single event as .ics file download
export function downloadEventICS(event: EventRow): void {
  const startStr = formatDateToICal(event.start_time);
  const endStr = formatDateToICal(event.end_time);
  const nowStr = formatDateToICal(new Date().toISOString());

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NEXO App//Calendar Export//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:nexo-event-${event.id}@nexo.app`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description || 'Evento criado no NEXO'}`,
    `LOCATION:${event.location || ''}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export array of events as combined .ics file
export function downloadAllEventsICS(events: EventRow[], fileName = 'nexo-agenda.ics'): void {
  if (events.length === 0) return;

  const nowStr = formatDateToICal(new Date().toISOString());

  const vevents = events.map((event) => {
    const startStr = formatDateToICal(event.start_time);
    const endStr = formatDateToICal(event.end_time);
    return [
      'BEGIN:VEVENT',
      `UID:nexo-event-${event.id}@nexo.app`,
      `DTSTAMP:${nowStr}`,
      `DTSTART:${startStr}`,
      `DTEND:${endStr}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || 'Evento criado no NEXO'}`,
      `LOCATION:${event.location || ''}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
    ].join('\r\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NEXO App//Agenda Completa Export//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...vevents,
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
