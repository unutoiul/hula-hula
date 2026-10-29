import type { Slot } from './availability.ts';
import type { ActivityId, RentalId } from './config.ts';
import type { PriceLine } from './pricing.ts';

// What the booking pages and the server (api/) send each other.

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
  activity: ActivityId;
  option: string;
  date: string;
  time: string;
  players: number;
  rentals: Partial<Record<RentalId, number>>;
  /** Free shuttle pick-up time ("08:00"), or null when the guest makes their own way. */
  transfer: string | null;
  pickupFrom: string;
  /** Lessons: how much golf they've played. */
  experience: string;
  guest: Guest;
  /** Bot traps: a hidden field people never fill, and how long the form took. */
  hp: string;
  elapsedMs: number;
}

/** The booking as saved, priced by the server. */
export interface Reservation {
  ref: string;
  activity: ActivityId;
  option: string;
  date: string;
  time: string;
  minutes: number;
  players: number;
  rentals: Partial<Record<RentalId, number>>;
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

export interface ErrorResponse { error: string; code?: 'taken' | 'invalid' }
