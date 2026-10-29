import { useEffect, useState } from 'react';
import type { ErrorResponse, EventOrderRequest, EventOrderStarted, EventOrderView, EventsResponse, PublicEvent } from '../booking/contract';
import { dayLabel, shortDayLabel, timeLabel } from '../booking/dates';

// The website's side of events: published events with their packages and
// places left (/api/events), starting an order that goes on to 2C2P, and
// following an order once the guest is back (/api/event-order).

export class EventApiError extends Error {
  constructor(message: string, readonly code?: ErrorResponse['code']) { super(message); }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  } catch {
    throw new EventApiError('We couldn’t reach the website. Check your connection and try again.');
  }
  const body = await response.json().catch(() => null) as (T & Partial<ErrorResponse>) | null;
  if (!response.ok || !body) throw new EventApiError(body?.error ?? 'Something went wrong on our side. Please try again, or WhatsApp us.', body?.code);
  return body;
}

export const fetchEvents = async () => (await call<EventsResponse>('/api/events')).events;
export const fetchEvent = async (slug: string) => { const r = await call<EventsResponse>(`/api/events?slug=${encodeURIComponent(slug)}`); return { event: r.events[0], testPayments: r.testPayments }; };
export const startOrder = (request: EventOrderRequest) => call<EventOrderStarted>('/api/event-order', { method: 'POST', body: JSON.stringify(request) });
export const fetchOrder = (ref: string, key: string) => call<EventOrderView>(`/api/event-order?${new URLSearchParams({ ref, key })}`);

/** Upcoming published events for the homepage (an empty list until loaded, or if it fails). */
export function useUpcomingEvents(): PublicEvent[] {
  const [events, setEvents] = useState<PublicEvent[]>([]);
  useEffect(() => { fetchEvents().then(setEvents).catch(() => setEvents([])); }, []);
  return events;
}

/** "Sat 14 Dec · 9:00 am – 4:00 pm", or "Sat 14 Dec – Sun 15 Dec" for a multi-day event. */
export function eventWhen(event: Pick<PublicEvent, 'startsOn' | 'endsOn' | 'startTime' | 'endTime'>, long = false): string {
  const day = long ? dayLabel : shortDayLabel;
  const days = event.endsOn && event.endsOn !== event.startsOn ? `${day(event.startsOn)} – ${day(event.endsOn)}` : day(event.startsOn);
  const times = event.startTime ? ` · ${timeLabel(event.startTime)}${event.endTime ? ` – ${timeLabel(event.endTime)}` : ''}` : '';
  return days + times;
}

export const fromPriceOf = (event: PublicEvent) => (event.packages.length ? Math.min(...event.packages.map((p) => p.price)) : null);
export const placesLeft = (event: PublicEvent) => event.packages.reduce((sum, p) => sum + p.left, 0);
