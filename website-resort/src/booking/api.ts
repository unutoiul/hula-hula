import type { AvailabilityResponse, BookingStatusResponse, CreateBookingRequest, CreateBookingResponse } from '../../shared/bookingContract';

// The booking pages' calls to api/booking — every price and status comes
// from the server; nothing here is trusted by it.

export class ApiError extends Error {
  constructor(readonly status: number, message: string) { super(message); }
}

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { accept: 'application/json' } });
  const body = await response.json().catch(() => ({})) as { error?: string };
  if (!response.ok) throw new ApiError(response.status, body.error ?? 'Something went wrong — please try again.');
  return body as T;
}

export const fetchAvailability = (search: URLSearchParams, signal?: AbortSignal) => getJson<AvailabilityResponse>(`/api/booking/availability?${search}`, signal);

export const fetchStatus = (ref: string, key: string) => getJson<BookingStatusResponse>(`/api/booking/status?${new URLSearchParams({ ref, key })}`);

export async function createBooking(request: CreateBookingRequest): Promise<CreateBookingResponse> {
  try {
    const response = await fetch('/api/booking/create', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(request) });
    const body = await response.json().catch(() => null) as CreateBookingResponse | null;
    if (body && typeof body.ok === 'boolean') return body;
  } catch {
    // fall through to the generic message
  }
  return { ok: false, code: 'PAYMENT_UNAVAILABLE', message: 'We couldn’t start your booking — please check your connection and try again.' };
}
