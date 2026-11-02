import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AvailabilityResponse, RateOffer, RoomTypeOffer } from '../../shared/bookingContract';
import { distributeGuests, type Occupancy } from '../../shared/occupancy';
import { toISODate, useBookingSearch } from '../context/BookingSearchContext';
import { useLocation } from '../router';
import { createBooking, fetchAvailability } from './api';
import { guessCountry } from './countries';

// Everything the booking pages share: the live room list for the current
// search, the rooms picked (the cart), the guest's details and the payment
// session started on 2C2P. Kept in sessionStorage so a reload — or the round
// trip through a bank's 3-D Secure page — doesn't lose anything, and cleared
// once the booking is confirmed.

export interface CartLine { roomTypeUuid: string; roomRateUuid: string; quantity: number }

export interface GuestForm {
  firstName: string; lastName: string; email: string; emailConfirm: string; phone: string; country: string;
  arrivalTime: string; specialRequests: string; acceptedPolicies: boolean;
}

export interface PaymentSession {
  ref: string; accessKey: string; webPaymentUrl: string; currency: string;
  total: number; deposit: number; balance: number; expiresAt: string;
  email: string; signature: string;
}

export interface ResolvedLine { line: CartLine; roomType: RoomTypeOffer; rate: RateOffer }

type AvailabilityState = { status: 'loading' | 'ready' | 'error'; data: AvailabilityResponse | null; error: string | null; key: string };

interface BookingFlow {
  searchKey: string;
  availability: AvailabilityState;
  reload: () => void;
  cart: ResolvedLine[];
  quantityOf: (roomRateUuid: string) => number;
  /** How many more of this room type could still go in the cart. */
  roomsLeft: (roomType: RoomTypeOffer) => number;
  setQuantity: (roomType: RoomTypeOffer, rate: RateOffer, quantity: number) => void;
  totals: { rooms: number; total: number; dueNow: number; balance: number; currency: string };
  /** Guests per room, lined up with the rooms in the cart — null when they don't fit. */
  plan: Occupancy[] | null;
  guest: GuestForm;
  updateGuest: (patch: Partial<GuestForm>) => void;
  payment: PaymentSession | null;
  startPayment: (extras: { hp: string; elapsedMs: number }) => Promise<string | null>;
  forgetBooking: () => void;
}

const STORAGE_KEY = 'hh-booking';
const EMPTY_GUEST: GuestForm = { firstName: '', lastName: '', email: '', emailConfirm: '', phone: '', country: '', arrivalTime: '', specialRequests: '', acceptedPolicies: false };

interface Stored { searchKey: string; cart: CartLine[]; guest: GuestForm; payment: PaymentSession | null }

function readStored(): Stored | null {
  try { return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null') as Stored | null; } catch { return null; }
}
/** The search the stored cart belongs to — so a page with no search in its URL
 * (the confirmation page after a bank redirect) can pick the stay back up. */
export function storedSearch(): URLSearchParams | null {
  const stored = readStored();
  return stored?.searchKey ? new URLSearchParams(stored.searchKey) : null;
}

function writeStored(value: Stored | null) {
  try { if (value) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value)); else sessionStorage.removeItem(STORAGE_KEY); } catch { /* private mode: just don't persist */ }
}

/** The private key for a booking's status, kept per reference for the confirmation page. */
export const accessKeyStore = {
  get: (ref: string) => { try { return sessionStorage.getItem(`hh-booking-key:${ref}`); } catch { return null; } },
  set: (ref: string, key: string) => { try { sessionStorage.setItem(`hh-booking-key:${ref}`, key); } catch { /* ignore */ } },
};

const BookingFlowContext = createContext<BookingFlow | null>(null);

// Rooms of a type are shared between its rates, and the whole booking has a
// room limit — trim the cart back whenever fresh availability says so.
function prune(lines: CartLine[], data: AvailabilityResponse): CartLine[] {
  const usedByType = new Map<string, number>();
  let usedTotal = 0;
  const next: CartLine[] = [];
  for (const line of lines) {
    const roomType = data.roomTypes.find((rt) => rt.roomTypeUuid === line.roomTypeUuid);
    const rate = roomType?.rates.find((r) => r.roomRateUuid === line.roomRateUuid);
    if (!roomType || !rate) continue;
    const used = usedByType.get(roomType.roomTypeUuid) ?? 0;
    const quantity = Math.min(line.quantity, rate.maxQuantity, roomType.available - used, data.maxRooms - usedTotal);
    if (quantity <= 0) continue;
    usedByType.set(roomType.roomTypeUuid, used + quantity);
    usedTotal += quantity;
    next.push({ ...line, quantity });
  }
  return next;
}

export function BookingFlowProvider({ children }: { children: ReactNode }) {
  const { checkIn, checkOut, adults, children: kids, promoCode, selectingCheckout } = useBookingSearch();
  const { pathname } = useLocation();
  const searchParams = useMemo(() => {
    const params = new URLSearchParams({ checkIn: toISODate(checkIn), checkOut: toISODate(checkOut), adults: String(adults), children: String(kids) });
    if (promoCode) params.set('promo', promoCode);
    return params;
  }, [checkIn, checkOut, adults, kids, promoCode]);
  const searchKey = searchParams.toString();

  const [stored] = useState(readStored);
  const [cartKey, setCartKey] = useState(stored?.searchKey ?? searchKey);
  const [lines, setLines] = useState<CartLine[]>(stored?.cart ?? []);
  const [guest, setGuest] = useState<GuestForm>(stored?.guest ?? { ...EMPTY_GUEST, country: guessCountry() });
  const [payment, setPayment] = useState<PaymentSession | null>(stored?.payment ?? null);
  const [availability, setAvailability] = useState<AvailabilityState>({ status: 'loading', data: null, error: null, key: '' });
  const [reloads, setReloads] = useState(0);

  // A different stay means different rooms and prices: start the cart over.
  useEffect(() => {
    if (cartKey === searchKey) return;
    setCartKey(searchKey);
    setLines([]);
    setPayment(null);
  }, [cartKey, searchKey]);

  // Live rooms and prices, on the steps that show them (not while the second
  // date of a range is still being picked).
  const needsRooms = pathname === '/book' || pathname === '/book/details';
  useEffect(() => {
    if (!needsRooms || selectingCheckout) return;
    const controller = new AbortController();
    // A refresh of the same search keeps showing the rooms while it loads.
    setAvailability((prev) => ({ status: 'loading', data: prev.key === searchKey ? prev.data : null, error: null, key: searchKey }));
    fetchAvailability(searchParams, controller.signal)
      .then((data) => {
        setAvailability({ status: 'ready', data, error: null, key: searchKey });
        setLines((current) => prune(current, data));
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return;
        setAvailability({ status: 'error', data: null, error: error.message, key: searchKey });
      });
    return () => controller.abort();
  }, [needsRooms, selectingCheckout, searchParams, searchKey, reloads]);

  useEffect(() => { writeStored({ searchKey: cartKey, cart: lines, guest, payment }); }, [cartKey, lines, guest, payment]);

  const data = availability.data;
  const cart = useMemo<ResolvedLine[]>(() => lines.flatMap((line) => {
    const roomType = data?.roomTypes.find((rt) => rt.roomTypeUuid === line.roomTypeUuid);
    const rate = roomType?.rates.find((r) => r.roomRateUuid === line.roomRateUuid);
    return roomType && rate ? [{ line, roomType, rate }] : [];
  }), [lines, data]);

  const totals = useMemo(() => {
    const total = cart.reduce((sum, { line, rate }) => sum + rate.total * line.quantity, 0);
    const dueNow = cart.reduce((sum, { line, rate }) => sum + rate.deposit.dueNow * line.quantity, 0);
    return { rooms: cart.reduce((sum, { line }) => sum + line.quantity, 0), total, dueNow, balance: total - dueNow, currency: data?.currency ?? 'THB' };
  }, [cart, data]);

  const expanded = useMemo(() => cart.flatMap(({ line, roomType, rate }) => Array.from({ length: line.quantity }, () => ({ roomType, rate }))), [cart]);
  const plan = useMemo(() => distributeGuests(expanded.map(({ roomType }) => roomType.capacity), adults, kids), [expanded, adults, kids]);

  const quantityOf = useCallback((roomRateUuid: string) => lines.find((line) => line.roomRateUuid === roomRateUuid)?.quantity ?? 0, [lines]);

  const roomsLeft = useCallback((roomType: RoomTypeOffer) => {
    const inType = lines.filter((line) => line.roomTypeUuid === roomType.roomTypeUuid).reduce((sum, line) => sum + line.quantity, 0);
    const inCart = lines.reduce((sum, line) => sum + line.quantity, 0);
    return Math.max(0, Math.min(roomType.available - inType, (data?.maxRooms ?? 5) - inCart));
  }, [lines, data]);

  const setQuantity = useCallback((roomType: RoomTypeOffer, rate: RateOffer, quantity: number) => {
    setPayment(null);
    setLines((current) => {
      const others = current.filter((line) => line.roomRateUuid !== rate.roomRateUuid);
      const inType = others.filter((line) => line.roomTypeUuid === roomType.roomTypeUuid).reduce((sum, line) => sum + line.quantity, 0);
      const inCart = others.reduce((sum, line) => sum + line.quantity, 0);
      const allowed = Math.max(0, Math.min(quantity, rate.maxQuantity, roomType.available - inType, (data?.maxRooms ?? 5) - inCart));
      const existing = current.find((line) => line.roomRateUuid === rate.roomRateUuid);
      if (allowed === 0) return others;
      if (existing) return current.map((line) => (line === existing ? { ...line, quantity: allowed } : line));
      return [...current, { roomTypeUuid: roomType.roomTypeUuid, roomRateUuid: rate.roomRateUuid, quantity: allowed }];
    });
  }, [data]);

  const updateGuest = useCallback((patch: Partial<GuestForm>) => setGuest((current) => ({ ...current, ...patch })), []);

  const startPayment = useCallback(async ({ hp, elapsedMs }: { hp: string; elapsedMs: number }): Promise<string | null> => {
    if (!plan || expanded.length === 0) return 'Please choose rooms that fit everyone first.';
    const rooms = expanded.map(({ rate }, index) => ({ roomRateUuid: rate.roomRateUuid, adults: plan[index].adults, children: plan[index].children }));
    const details = {
      firstName: guest.firstName.trim(), lastName: guest.lastName.trim(), email: guest.email.trim(), phone: guest.phone.trim(), country: guest.country,
      arrivalTime: guest.arrivalTime || undefined, specialRequests: guest.specialRequests.trim() || undefined,
    };
    // Going back and forth without changing anything keeps the same payment
    // (and the same hold on the rooms) instead of starting a second one.
    const signature = JSON.stringify({ searchKey, rooms, details });
    if (payment?.signature === signature && Date.parse(payment.expiresAt) - Date.now() > 3 * 60_000) return null;

    const response = await createBooking({
      checkIn: searchParams.get('checkIn')!, checkOut: searchParams.get('checkOut')!, promo: promoCode || undefined,
      rooms, guest: details, acceptedPolicies: true, hp_ref: hp, elapsedMs,
    });
    if (!response.ok) {
      if (response.code === 'SOLD_OUT') setReloads((n) => n + 1);
      return response.message;
    }
    accessKeyStore.set(response.ref, response.accessKey);
    setPayment({
      ref: response.ref, accessKey: response.accessKey, webPaymentUrl: response.webPaymentUrl, currency: response.currency,
      total: response.total, deposit: response.deposit, balance: response.balance, expiresAt: response.expiresAt,
      email: details.email, signature,
    });
    return null;
  }, [plan, expanded, guest, searchKey, searchParams, promoCode, payment]);

  const forgetBooking = useCallback(() => {
    setLines([]);
    setPayment(null);
    setGuest({ ...EMPTY_GUEST, country: guessCountry() });
  }, []);

  const value = useMemo<BookingFlow>(() => ({
    searchKey, availability, reload: () => setReloads((n) => n + 1),
    cart, quantityOf, roomsLeft, setQuantity, totals, plan: expanded.length ? plan : null,
    guest, updateGuest, payment, startPayment, forgetBooking,
  }), [searchKey, availability, cart, quantityOf, roomsLeft, setQuantity, totals, plan, expanded, guest, updateGuest, payment, startPayment, forgetBooking]);

  return <BookingFlowContext.Provider value={value}>{children}</BookingFlowContext.Provider>;
}

export function useBookingFlow(): BookingFlow {
  const ctx = useContext(BookingFlowContext);
  if (!ctx) throw new Error('useBookingFlow must be used within a BookingFlowProvider');
  return ctx;
}
