import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useDateRange, type DateRange } from '../hooks/useDateRange';

export interface RoomResult {
  roomTypeUuid: string;
  name: string;
  nights: number;
  fromPrice: number;
}

interface PropertySummary { currencyIsoCode: string }
interface Quote { roomTypeUuid: string; availability: number; lengthOfStay: number; price: { gross: number } }
interface RoomType { uuid: string; name: string }
type ApiError = { error: string };

type SearchStatus = 'idle' | 'loading' | 'results' | 'error';

interface BookingSearchState extends DateRange {
  adults: number;
  setAdults: (n: number) => void;
  children: number;
  setChildren: (n: number) => void;
  status: SearchStatus;
  results: RoomResult[];
  errorMessage: string | null;
  currency: string;
  // SiteMinder's hosted booking engine, deep-linked to the current dates and
  // guests — where every "Check availability" / "Book now" button sends people.
  bookingUrl: string;
  search: () => Promise<void>;
}

const BookingSearchContext = createContext<BookingSearchState | null>(null);

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// The property's bookingEngineUrl from SiteMinder's API. Kept as a constant so
// booking works even where the API keys aren't configured.
const SITEMINDER_BOOKING_URL = 'https://book-directonline.com/properties/HulaHulaResortAonangBeach';

function toBookingUrl(checkIn: Date, checkOut: Date, adults: number, children: number): string {
  const params = new URLSearchParams({
    locale: 'en', currency: 'THB',
    checkInDate: toISODate(checkIn), checkOutDate: toISODate(checkOut),
    'items[0][adults]': String(adults), 'items[0][children]': String(children), 'items[0][infants]': '0',
  });
  return `${SITEMINDER_BOOKING_URL}?${params}`;
}

// Property/room-type data barely changes stay to stay — fetched once per page
// load and reused across every search, instead of refetching alongside every
// date change.
let cachedProperty: PropertySummary | null = null;
let cachedRoomTypes: RoomType[] | null = null;

export function BookingSearchProvider({ children: providerChildren }: { children: ReactNode }) {
  const today = new Date();
  const defaultCheckIn = new Date(today); defaultCheckIn.setDate(defaultCheckIn.getDate() + 1);
  const defaultCheckOut = new Date(today); defaultCheckOut.setDate(defaultCheckOut.getDate() + 8);
  const dateRange = useDateRange(defaultCheckIn, defaultCheckOut);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [status, setStatus] = useState<SearchStatus>('idle');
  const [results, setResults] = useState<RoomResult[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currency, setCurrency] = useState('THB');

  const search = useCallback(async () => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      const params = new URLSearchParams({
        checkIn: toISODate(dateRange.checkIn),
        checkOut: toISODate(dateRange.checkOut),
        adults: String(adults),
        children: String(children),
      });

      const [quoteRes, property, roomTypes] = await Promise.all([
        fetch(`/api/siteminder-quote?${params}`),
        cachedProperty ?? fetch('/api/siteminder-property').then((r) => r.json() as Promise<PropertySummary>),
        cachedRoomTypes ?? fetch('/api/siteminder-room-types').then((r) => r.json() as Promise<RoomType[]>),
      ]);
      cachedProperty = property;
      cachedRoomTypes = roomTypes;
      setCurrency(property.currencyIsoCode ?? 'THB');

      const quotes: Quote[] | ApiError = await quoteRes.json();
      if (!quoteRes.ok) throw new Error('error' in quotes ? quotes.error : 'Search failed');
      if (!Array.isArray(quotes)) throw new Error('Unexpected response shape');

      const nameByUuid = new Map(roomTypes.map((rt) => [rt.uuid, rt.name]));
      // The quotes endpoint returns one row per room type *and* rate plan (e.g.
      // flexible vs. non-refundable), so several rows can share a roomTypeUuid.
      // Collapse to one "from" price per room type, like a hotel site's usual
      // "from $X" card.
      const byRoomType = new Map<string, RoomResult>();
      for (const q of quotes) {
        if (q.availability <= 0) continue;
        const existing = byRoomType.get(q.roomTypeUuid);
        if (!existing || q.price.gross < existing.fromPrice) {
          byRoomType.set(q.roomTypeUuid, {
            roomTypeUuid: q.roomTypeUuid,
            name: nameByUuid.get(q.roomTypeUuid) ?? 'Room',
            nights: q.lengthOfStay,
            fromPrice: q.price.gross,
          });
        }
      }

      setResults([...byRoomType.values()].sort((a, b) => a.fromPrice - b.fromPrice));
      setStatus('results');
    } catch {
      setResults([]);
      setStatus('error');
      setErrorMessage('Could not check availability right now — please try again.');
    }
  }, [dateRange.checkIn, dateRange.checkOut, adults, children]);

  const value = useMemo<BookingSearchState>(() => ({
    ...dateRange, adults, setAdults, children, setChildren,
    status, results, errorMessage, currency, search,
    bookingUrl: toBookingUrl(dateRange.checkIn, dateRange.checkOut, adults, children),
  }), [dateRange, adults, children, status, results, errorMessage, currency, search]);

  return <BookingSearchContext.Provider value={value}>{providerChildren}</BookingSearchContext.Provider>;
}

export function useBookingSearch(): BookingSearchState {
  const ctx = useContext(BookingSearchContext);
  if (!ctx) throw new Error('useBookingSearch must be used within a BookingSearchProvider');
  return ctx;
}
