import type { Slot } from './availability.ts';
import type { PriceLine } from './pricing.ts';

// What the website and the server (api/) send each other.

export interface Guest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** ISO 3166 code, e.g. "TH". */
  country: string;
  handicap: string;
  notes: string;
}

/** POST /api/reservations */
export interface ReservationRequest {
  activity: string;
  option: string;
  date: string;
  time: string;
  players: number;
  rentals: Record<string, number>;
  /** Free shuttle pick-up time ("08:00"), or null when the guest makes their own way. */
  transfer: string | null;
  pickupFrom: string;
  /** How much golf they've played, for activities that ask (lessons). */
  experience: string;
  guest: Guest;
  /** Bot traps: a hidden field people never fill, and how long the form took. */
  hp: string;
  elapsedMs: number;
}

/** The booking as saved, priced by the server. */
export interface Reservation {
  ref: string;
  activity: string;
  activityName: string;
  optionLabel: string;
  date: string;
  time: string;
  minutes: number;
  players: number;
  rentals: Record<string, number>;
  transfer: string | null;
  pickupFrom: string;
  lines: PriceLine[];
  total: number;
  email: string;
  /** Whether the confirmation email went out. */
  emailed: boolean;
}

/** GET /api/tee-sheet */
export interface TeeSheetResponse { slots: Slot[] }

export interface ErrorResponse { error: string; code?: 'taken' | 'invalid' | 'sold_out' | 'unavailable' }

// ── Events ─────────────────────────────────────────────────────────────────

export interface ScheduleItem { time: string; text: string }

export interface PublicPackage {
  id: string;
  name: string;
  description: string;
  includes: string[];
  price: number;
  maxPerOrder: number;
  /** Places still for sale (0 = sold out). */
  left: number;
}

export interface PublicEvent {
  slug: string;
  title: string;
  tagline: string;
  startsOn: string;
  endsOn: string | null;
  startTime: string | null;
  endTime: string | null;
  description: string;
  highlights: string[];
  schedule: ScheduleItem[];
  coverImage: string | null;
  salesOpen: boolean;
  packages: PublicPackage[];
}

/** GET /api/events (list) or /api/events?slug=… (one). `testPayments`: 2C2P is on its sandbox, nothing is charged. */
export interface EventsResponse { events: PublicEvent[]; testPayments: boolean }

/** POST /api/event-order */
export interface EventOrderRequest {
  slug: string;
  packageId: string;
  quantity: number;
  guest: Omit<Guest, 'handicap'>;
  hp: string;
  elapsedMs: number;
}
export interface EventOrderStarted { ref: string; key: string; webPaymentUrl: string }

export type EventOrderStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled' | 'refunded';
/** GET /api/event-order?ref&key */
export interface EventOrderView {
  ref: string;
  status: EventOrderStatus;
  eventTitle: string;
  eventSlug: string;
  startsOn: string;
  startTime: string | null;
  endTime: string | null;
  packageName: string;
  quantity: number;
  total: number;
  email: string;
  testPayment: boolean;
  failureReason?: string;
}
