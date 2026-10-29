import { createClient } from '@supabase/supabase-js';
import type { ActivityId, RentalId } from '../booking/config';
import type { PriceLine } from '../booking/pricing';

// The browser's Supabase client, for the staff app at /admin only: signs
// staff in, and row level security (golf_staff) decides what they can read
// and change. Uses the public (anon/publishable) key — never the secret one.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;

export type BookingStatus = 'booked' | 'checked_in' | 'no_show' | 'cancelled';
export type BookingSource = 'online' | 'phone' | 'walk_in';

/** A row of golf_bookings, as staff see it. Times come back as "HH:MM:SS". */
export interface StaffBooking {
  id: string;
  ref: string;
  activity: ActivityId;
  option: string;
  play_date: string;
  start_time: string;
  minutes: number;
  players: number;
  rentals: Partial<Record<RentalId, number>>;
  transfer: string | null;
  pickup_from: string;
  experience: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  handicap: string;
  notes: string;
  lines: PriceLine[];
  total: number;
  source: BookingSource;
  status: BookingStatus;
  created_at: string;
}

/** A row of golf_blocks: starts closed from start_time up to end_time. */
export interface StaffBlock {
  id: string;
  play_date: string;
  activity: ActivityId | null;
  start_time: string;
  end_time: string;
  reason: string;
}

export const hhmm = (time: string) => time.slice(0, 5);
