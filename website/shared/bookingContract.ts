// The JSON shapes passed between the booking pages (src/booking) and the
// booking functions (api/booking, api/payment). Types only, so importing them
// from either side adds nothing to a bundle or a function. All money is in the
// property's currency (THB) as plain numbers with up to two decimals.

export type DepositType = 'full-amount' | 'first-night' | 'fixed-amount' | 'percentage' | null;

/** How many people one room can take. `children` 0 means the room isn't set up
 * for children separately, so a child simply takes an adult's place. */
export interface RoomCapacity { guests: number; adults: number; children: number }

export interface RateOffer {
  roomRateUuid: string;
  name: string;
  description: string | null;
  meals: { breakfast: boolean; lunch: boolean; dinner: boolean };
  cancellation: { refundable: boolean | null; summary: string };
  /** One room, whole stay, taxes and fees included. */
  total: number;
  nightly: { date: string; amount: number }[];
  promoDiscount: number;
  /** What one room of this rate costs today versus at the hotel. */
  deposit: { type: DepositType; dueNow: number; balance: number };
  maxQuantity: number;
}

export interface RoomTypeOffer {
  roomTypeUuid: string;
  name: string;
  description: string | null;
  roomSize: number | null;
  roomSizeUnit: string | null;
  capacity: RoomCapacity;
  /** Rooms left for the whole stay (SiteMinder's count minus our own unconfirmed sales). */
  available: number;
  rates: RateOffer[];
}

export interface AvailabilityResponse {
  checkIn: string;
  checkOut: string;
  nights: number;
  currency: string;
  occupancy: { adults: number; children: number };
  promo: { code: string; applied: boolean } | null;
  roomTypes: RoomTypeOffer[];
  policies: { terms: string | null; checkInTime: string | null; checkOutTime: string | null };
  maxRooms: number;
}

export interface GuestDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  /** ISO 3166-1 alpha-2, e.g. "TH". */
  country: string;
  arrivalTime?: string;
  specialRequests?: string;
}

/** One room each — a cart line of two rooms becomes two entries, each with
 * the guests who'll sleep in it. */
export interface BookingRoomRequest { roomRateUuid: string; adults: number; children: number }

export interface CreateBookingRequest {
  checkIn: string;
  checkOut: string;
  promo?: string;
  rooms: BookingRoomRequest[];
  guest: GuestDetails;
  acceptedPolicies: true;
  hp_ref?: string;
  elapsedMs?: number;
}

export type CreateBookingErrorCode = 'INVALID' | 'SOLD_OUT' | 'SITEMINDER_UNAVAILABLE' | 'PAYMENT_UNAVAILABLE' | 'NOT_CONFIGURED';

export type CreateBookingResponse =
  | { ok: true; ref: string; accessKey: string; webPaymentUrl: string; currency: string; total: number; deposit: number; balance: number; expiresAt: string }
  | { ok: false; code: CreateBookingErrorCode; message: string };

/** What the guest's browser may see. `confirmed` = paid and handed to the
 * resort; there is deliberately no personal data in here. */
export type PublicBookingStatus = 'pending' | 'confirmed' | 'expired' | 'failed';

export interface BookingLine { roomTypeName: string; rateName: string; quantity: number; adults: number; children: number }

export interface BookingStatusResponse {
  ref: string;
  status: PublicBookingStatus;
  checkIn: string;
  checkOut: string;
  nights: number;
  currency: string;
  total: number;
  deposit: number;
  balance: number;
  paidAmount: number | null;
  lines: BookingLine[];
  expiresAt: string;
}
