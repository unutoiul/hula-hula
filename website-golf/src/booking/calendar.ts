import type { ContactLinks } from './config';
import { KRABI_UTC_OFFSET_HOURS, toMinutes } from './dates';

// "Add to calendar" for a confirmed booking or event: a Google Calendar link
// and an .ics file (Apple Calendar, Outlook…). Times are converted from Krabi
// time to UTC so they land right in any calendar, wherever the guest lives.

export interface CalendarItem { uid: string; title: string; date: string; time: string; minutes: number; note: string }

const stamp = (date: string, minutes: number) => {
  const utc = new Date(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10), 0, minutes - KRABI_UTC_OFFSET_HOURS * 60));
  return utc.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

function details(item: CalendarItem, contact: ContactLinks) {
  const start = toMinutes(item.time);
  return {
    title: `${item.title} at Hula Hula Golf Club`,
    start: stamp(item.date, start),
    end: stamp(item.date, start + item.minutes),
    description: `${item.note} Questions: WhatsApp ${contact.phone} or ${contact.email}.`,
    location: `Hula Hula Golf Club, ${contact.area}`,
  };
}

export function googleCalendarUrl(item: CalendarItem, contact: ContactLinks): string {
  const d = details(item, contact);
  const params = new URLSearchParams({ action: 'TEMPLATE', text: d.title, dates: `${d.start}/${d.end}`, details: d.description, location: d.location });
  return `https://calendar.google.com/calendar/render?${params}`;
}

const escapeText = (text: string) => text.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

export function downloadIcs(item: CalendarItem, contact: ContactLinks) {
  const d = details(item, contact);
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hula Hula Golf Club//Bookings//EN', 'BEGIN:VEVENT',
    `UID:${item.uid}@hulahulagolfclub.com`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART:${d.start}`, `DTEND:${d.end}`, `SUMMARY:${escapeText(d.title)}`, `DESCRIPTION:${escapeText(d.description)}`, `LOCATION:${escapeText(d.location)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: `hula-hula-golf-${item.uid}.ics` });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
