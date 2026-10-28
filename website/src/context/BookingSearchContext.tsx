import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useDateRange, type DateRange } from '../hooks/useDateRange';

// The stay a guest is looking at — dates, guests and an optional promo code —
// shared by the hero search bar, the Arrival section's panel and the booking
// pages (/book), so whatever was picked on the homepage carries straight into
// the booking.
interface BookingSearchState extends DateRange {
  adults: number;
  setAdults: (n: number) => void;
  children: number;
  setChildren: (n: number) => void;
  promoCode: string;
  setPromoCode: (code: string) => void;
  /** /book?checkIn=…&checkOut=…&adults=…&children=…&promo=… for this search. */
  bookHref: string;
  /** SiteMinder's hosted booking engine for the same search — used while
   * on-site booking is switched off, and as the way out if it ever fails. */
  siteMinderUrl: string;
}

/** Set VITE_ONSITE_BOOKING=true once 2C2P and Supabase are configured. */
export const ONSITE_BOOKING = import.meta.env.VITE_ONSITE_BOOKING === 'true';

const BookingSearchContext = createContext<BookingSearchState | null>(null);

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** "2026-11-27" → a local Date at midnight, or null if it isn't a real date. */
export function parseISODate(value: string | null): Date | null {
  const match = value?.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return toISODate(date) === value ? date : null;
}

const SITEMINDER_BOOKING_URL = 'https://book-directonline.com/properties/HulaHulaResortAonangBeach';

export function toSiteMinderUrl(checkIn: Date, checkOut: Date, adults: number, children: number, promoCode: string): string {
  const params = new URLSearchParams({
    locale: 'en', currency: 'THB',
    checkInDate: toISODate(checkIn), checkOutDate: toISODate(checkOut),
    'items[0][adults]': String(adults), 'items[0][children]': String(children), 'items[0][infants]': '0',
  });
  if (promoCode) params.set('promocode', promoCode);
  return `${SITEMINDER_BOOKING_URL}?${params}`;
}

export function toBookHref(checkIn: Date, checkOut: Date, adults: number, children: number, promoCode: string, path = '/book'): string {
  const params = new URLSearchParams({ checkIn: toISODate(checkIn), checkOut: toISODate(checkOut), adults: String(adults), children: String(children) });
  if (promoCode) params.set('promo', promoCode);
  return `${path}?${params}`;
}

export function BookingSearchProvider({ children: providerChildren }: { children: ReactNode }) {
  const today = new Date();
  const defaultCheckIn = new Date(today); defaultCheckIn.setDate(defaultCheckIn.getDate() + 1);
  const defaultCheckOut = new Date(today); defaultCheckOut.setDate(defaultCheckOut.getDate() + 8);
  const dateRange = useDateRange(defaultCheckIn, defaultCheckOut);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [promoCode, setPromoCode] = useState('');

  const value = useMemo<BookingSearchState>(() => ({
    ...dateRange, adults, setAdults, children, setChildren, promoCode, setPromoCode,
    bookHref: toBookHref(dateRange.checkIn, dateRange.checkOut, adults, children, promoCode),
    siteMinderUrl: toSiteMinderUrl(dateRange.checkIn, dateRange.checkOut, adults, children, promoCode),
  }), [dateRange, adults, children, promoCode]);

  return <BookingSearchContext.Provider value={value}>{providerChildren}</BookingSearchContext.Provider>;
}

export function useBookingSearch(): BookingSearchState {
  const ctx = useContext(BookingSearchContext);
  if (!ctx) throw new Error('useBookingSearch must be used within a BookingSearchProvider');
  return ctx;
}
