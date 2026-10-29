import type { Reservation } from './api';
import { activityById } from './config';
import { KRABI_UTC_OFFSET_HOURS, toMinutes } from './dates';
import { CONTACT } from '../data/content';

// "Add to calendar" for a confirmed booking: a Google Calendar link and an
// .ics file (Apple Calendar, Outlook…). Times are converted from Krabi time to
// UTC so they land right in any calendar, wherever the guest lives.

const stamp = (date: string, minutes: number) => {
  const utc = new Date(Date.UTC(+date.slice(0, 4), +date.slice(5, 7) - 1, +date.slice(8, 10), 0, minutes - KRABI_UTC_OFFSET_HOURS * 60));
  return utc.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
};

function details(reservation: Reservation) {
  const activity = activityById(reservation.activity);
  const option = activity?.options.find((o) => o.id === reservation.option);
  const start = toMinutes(reservation.time);
  return {
    title: `${activity?.name ?? 'Golf'}${option ? ` · ${option.label}` : ''} at Hula Hula Golf Club`,
    start: stamp(reservation.date, start),
    end: stamp(reservation.date, start + reservation.minutes),
    description: `Booking ${reservation.ref}. Please arrive 20–30 minutes early. Questions: WhatsApp ${CONTACT.phone} or ${CONTACT.email}.`,
    location: `Hula Hula Golf Club, ${CONTACT.area}`,
  };
}

export function googleCalendarUrl(reservation: Reservation): string {
  const d = details(reservation);
  const params = new URLSearchParams({ action: 'TEMPLATE', text: d.title, dates: `${d.start}/${d.end}`, details: d.description, location: d.location });
  return `https://calendar.google.com/calendar/render?${params}`;
}

const escapeText = (text: string) => text.replace(/[\\,;]/g, (c) => `\\${c}`).replace(/\n/g, '\\n');

export function downloadIcs(reservation: Reservation) {
  const d = details(reservation);
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hula Hula Golf Club//Tee times//EN', 'BEGIN:VEVENT',
    `UID:${reservation.ref}@hulahulagolfclub.com`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
    `DTSTART:${d.start}`, `DTEND:${d.end}`, `SUMMARY:${escapeText(d.title)}`, `DESCRIPTION:${escapeText(d.description)}`, `LOCATION:${escapeText(d.location)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
  const link = Object.assign(document.createElement('a'), { href: url, download: `hula-hula-golf-${reservation.ref}.ics` });
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
