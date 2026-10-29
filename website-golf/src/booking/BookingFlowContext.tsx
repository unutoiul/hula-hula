import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createReservation, ApiError, type Guest, type Reservation } from './api';
import { isBookableDay } from './availability';
import { ACTIVITIES, activityById, HOLD_MINUTES, pickupFor, RENTALS, type Activity, type ActivityId, type ActivityOption, type RentalId } from './config';
import { isISODate, krabiNow } from './dates';
import { priceLines, totalOf, type PriceLine } from './pricing';

// The booking in progress, shared by every step: what's being booked and when,
// the picked time and how long it's held, extras, the guest's details, and —
// at the end — the reservation. Kept in this tab's sessionStorage, so a reload
// carries on where it was and closing the tab forgets it.

export interface Search { activity: ActivityId; option: string; date: string; players: number }
export interface Extras { rentals: Partial<Record<RentalId, number>>; transfer: string | null; pickupFrom: string; experience: string }
export type GuestForm = Guest & { acceptedPolicies: boolean };

interface FlowState {
  search: Search;
  time: string | null;
  heldUntil: number | null;
  extras: Extras;
  guest: GuestForm;
  reservation: Reservation | null;
}

const STORE = 'hhg-booking';
const emptyExtras: Extras = { rentals: {}, transfer: null, pickupFrom: '', experience: '' };
const emptyGuest: GuestForm = { firstName: '', lastName: '', email: '', phone: '', country: '', handicap: '', notes: '', acceptedPolicies: false };
export const defaultSearch = (): Search => ({ activity: 'golf', option: '9', date: krabiNow().date, players: 2 });

/** A search from a link (/book?activity=footgolf&option=18&date=…&players=3), with anything invalid dropped. */
export function searchFromQuery(query: URLSearchParams): Partial<Search> {
  const found: Partial<Search> = {};
  const activity = activityById(query.get('activity') ?? '');
  if (activity) {
    found.activity = activity.id;
    found.option = activity.options.some((o) => o.id === query.get('option')) ? query.get('option')! : activity.options[0].id;
  }
  const date = query.get('date');
  if (isISODate(date) && isBookableDay(date)) found.date = date;
  const players = Number(query.get('players'));
  if (Number.isInteger(players) && players > 0) found.players = players;
  return found;
}

/** Keeps a search valid for its activity: a known option, players within the group size, a bookable day. */
export function normalise(search: Search): Search {
  const activity = activityById(search.activity) ?? ACTIVITIES[0];
  const option = activity.options.some((o) => o.id === search.option) ? search.option : activity.options[0].id;
  const players = Math.min(activity.maxPlayers, Math.max(activity.minPlayers, search.players));
  const date = isBookableDay(search.date) ? search.date : krabiNow().date;
  return { activity: activity.id, option, date, players };
}

export const bookHref = (search: Partial<Search>) => {
  const params = new URLSearchParams(Object.entries(search).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]));
  return `/book${params.size ? `?${params}` : ''}`;
};

function load(): FlowState {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE) ?? 'null') as FlowState | null;
    if (saved?.search) return { ...saved, search: normalise(saved.search), heldUntil: saved.heldUntil && saved.heldUntil > Date.now() ? saved.heldUntil : null, time: saved.heldUntil && saved.heldUntil > Date.now() ? saved.time : null };
  } catch { /* start fresh */ }
  return { search: defaultSearch(), time: null, heldUntil: null, extras: emptyExtras, guest: emptyGuest, reservation: null };
}

interface BookingFlow extends FlowState {
  activity: Activity;
  option: ActivityOption;
  lines: PriceLine[];
  total: number;
  /** Set when a held time ran out, until the guest picks another. */
  holdExpired: boolean;
  setSearch: (change: Partial<Search>) => void;
  selectTime: (time: string) => void;
  releaseTime: () => void;
  updateExtras: (change: Partial<Extras>) => void;
  updateGuest: (change: Partial<GuestForm>) => void;
  confirm: (meta: { hp: string; elapsedMs: number }) => Promise<{ error: string; taken?: boolean } | { ok: true }>;
  startOver: () => void;
}

const BookingFlowContext = createContext<BookingFlow | null>(null);

export function BookingFlowProvider({ initial, children }: { initial: Partial<Search>; children: ReactNode }) {
  const [state, setState] = useState<FlowState>(() => {
    const loaded = load();
    // A link's search wins over the one saved in this tab.
    if (!Object.keys(initial).length) return loaded;
    const search = normalise({ ...loaded.search, ...initial });
    const same = (Object.keys(search) as (keyof Search)[]).every((k) => search[k] === loaded.search[k]);
    return same ? loaded : { ...loaded, search, time: null, heldUntil: null };
  });
  const [holdExpired, setHoldExpired] = useState(false);

  useEffect(() => {
    try { sessionStorage.setItem(STORE, JSON.stringify(state)); } catch { /* still works for this page view */ }
  }, [state]);

  // Let the time go when its hold runs out.
  useEffect(() => {
    if (!state.heldUntil) return;
    const id = window.setTimeout(() => {
      setState((s) => ({ ...s, time: null, heldUntil: null }));
      setHoldExpired(true);
    }, Math.max(0, state.heldUntil - Date.now()));
    return () => window.clearTimeout(id);
  }, [state.heldUntil]);

  const activity = activityById(state.search.activity) ?? ACTIVITIES[0];
  const option = activity.options.find((o) => o.id === state.search.option) ?? activity.options[0];

  const setSearch = useCallback((change: Partial<Search>) => setState((s) => {
    const search = normalise({ ...s.search, ...change });
    const changedActivity = search.activity !== s.search.activity;
    // A different activity, option, day or group size means picking a time again.
    return { ...s, search, time: null, heldUntil: null, extras: changedActivity ? emptyExtras : { ...s.extras, transfer: null } };
  }), []);

  const selectTime = useCallback((time: string) => {
    setHoldExpired(false);
    setState((s) => ({ ...s, time, heldUntil: Date.now() + HOLD_MINUTES * 60_000, extras: { ...s.extras, transfer: s.extras.transfer && pickupFor(time) === s.extras.transfer ? s.extras.transfer : null } }));
  }, []);
  const releaseTime = useCallback(() => setState((s) => ({ ...s, time: null, heldUntil: null })), []);
  const updateExtras = useCallback((change: Partial<Extras>) => setState((s) => ({ ...s, extras: { ...s.extras, ...change } })), []);
  const updateGuest = useCallback((change: Partial<GuestForm>) => setState((s) => ({ ...s, guest: { ...s.guest, ...change } })), []);
  const startOver = useCallback(() => setState((s) => ({ ...s, time: null, heldUntil: null, extras: emptyExtras, reservation: null })), []);

  // Rentals only for activities that have them, and never more sets than players.
  const rentals = useMemo(() => activity.rentals
    ? Object.fromEntries(RENTALS.map((r) => [r.id, Math.min(state.extras.rentals[r.id] ?? 0, state.search.players)]))
    : {}, [activity, state.extras.rentals, state.search.players]);
  const lines = useMemo(() => priceLines(activity, option, state.search.players, rentals), [activity, option, state.search.players, rentals]);

  const confirm = useCallback(async ({ hp, elapsedMs }: { hp: string; elapsedMs: number }) => {
    if (!state.time) return { error: 'Please pick a time first.' };
    try {
      const { acceptedPolicies: _accepted, ...guest } = state.guest;
      const reservation = await createReservation({
        ...state.search, time: state.time, rentals, transfer: state.extras.transfer,
        pickupFrom: state.extras.transfer ? state.extras.pickupFrom.trim() : '', experience: state.extras.experience,
        guest, hp, elapsedMs,
      });
      // Once it's booked, the guest's details don't need to stay in the browser.
      setState((s) => ({ ...s, reservation, time: null, heldUntil: null, extras: emptyExtras, guest: { ...emptyGuest, acceptedPolicies: false } }));
      return { ok: true as const };
    } catch (error) {
      return { error: error instanceof ApiError ? error.message : 'We couldn’t reach the booking system. Please try again, or WhatsApp us.', taken: error instanceof ApiError && error.code === 'taken' };
    }
  }, [state, rentals]);

  const value: BookingFlow = {
    ...state, extras: { ...state.extras, rentals }, activity, option, lines, total: totalOf(lines), holdExpired,
    setSearch, selectTime, releaseTime, updateExtras, updateGuest, confirm, startOver,
  };
  return <BookingFlowContext.Provider value={value}>{children}</BookingFlowContext.Provider>;
}

export function useBookingFlow(): BookingFlow {
  const flow = useContext(BookingFlowContext);
  if (!flow) throw new Error('useBookingFlow must be used inside BookingFlowProvider');
  return flow;
}

/** Seconds left on the hold, ticking once a second (null when nothing's held). */
export function useHoldSecondsLeft(): number | null {
  const { heldUntil } = useBookingFlow();
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!heldUntil) return;
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [heldUntil]);
  return heldUntil ? Math.max(0, Math.ceil((heldUntil - now) / 1000)) : null;
}
