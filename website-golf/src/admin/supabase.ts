import { createClient } from '@supabase/supabase-js';
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
  activity: string;
  option: string;
  play_date: string;
  start_time: string;
  minutes: number;
  players: number;
  rentals: Record<string, number>;
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
  activity: string | null;
  start_time: string;
  end_time: string;
  reason: string;
}

export const hhmm = (time: string) => time.slice(0, 5);

/** A row of golf_events. */
export interface StaffEvent {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  starts_on: string;
  ends_on: string | null;
  start_time: string | null;
  end_time: string | null;
  description: string;
  highlights: string[];
  schedule: { time: string; text: string }[];
  cover_image: string | null;
  published: boolean;
  sales_open: boolean;
}

/** A row of golf_event_packages. */
export interface StaffPackage {
  id: string;
  event_id: string;
  name: string;
  description: string;
  includes: string[];
  price: number;
  capacity: number;
  max_per_order: number;
  sort_order: number;
  active: boolean;
}

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled' | 'refunded';

/** A row of golf_event_orders, as staff see it. */
export interface StaffOrder {
  id: string;
  ref: string;
  event_id: string;
  package_id: string;
  package_name: string;
  quantity: number;
  total: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  notes: string;
  source: 'online' | 'desk';
  status: OrderStatus;
  test_payment: boolean;
  flags: string[];
  expires_at: string | null;
  tran_ref: string | null;
  paid_at: string | null;
  created_at: string;
}

/** Places a package has used: paid, plus online orders still inside their payment window. */
export const takenPlaces = (orders: StaffOrder[], packageId: string) => orders
  .filter((o) => o.package_id === packageId && (o.status === 'paid' || (o.status === 'pending' && !!o.expires_at && Date.parse(o.expires_at) > Date.now())))
  .reduce((sum, o) => sum + o.quantity, 0);
