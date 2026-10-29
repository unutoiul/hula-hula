import type { Slot } from './availability';
import type { ActivityId } from './config';
import type { ErrorResponse, Reservation, ReservationRequest, TeeSheetResponse } from './contract';

export type { Guest, Reservation, ReservationRequest } from './contract';

// The booking pages' only way to the club's tee sheet: the functions in api/,
// which read and write the bookings in Supabase.

export class ApiError extends Error {
  constructor(message: string, readonly code?: ErrorResponse['code']) { super(message); }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, { ...init, headers: { 'Content-Type': 'application/json', ...init?.headers } });
  } catch {
    throw new ApiError('We couldn’t reach the booking system. Check your connection and try again.');
  }
  const body = await response.json().catch(() => null) as (T & Partial<ErrorResponse>) | null;
  if (!response.ok || !body) throw new ApiError(body?.error ?? 'Something went wrong on our side. Please try again, or WhatsApp us.', body?.code);
  return body;
}

export async function fetchTeeSheet(activity: ActivityId, option: string, date: string): Promise<Slot[]> {
  const params = new URLSearchParams({ activity, option, date });
  return (await call<TeeSheetResponse>(`/api/tee-sheet?${params}`)).slots;
}

export function createReservation(request: ReservationRequest): Promise<Reservation> {
  return call<Reservation>('/api/reservations', { method: 'POST', body: JSON.stringify(request) });
}
