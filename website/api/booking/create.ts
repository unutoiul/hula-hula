import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { BookingRoomRequest, CreateBookingErrorCode, CreateBookingResponse, GuestDetails } from '../../shared/bookingContract.js';
import { fits } from '../../shared/occupancy.js';
import { type BookingItem, insertPending, PII_WIPE, softHolds, updateWhere } from '../_lib/bookings.js';
import { DbError, dbConfigured } from '../_lib/db.js';
import { loadDeals } from '../_lib/deals.js';
import { defaultDeposit } from '../_lib/deposit.js';
import { allowMethods, readJsonBody, siteUrl, withPreviewBypass } from '../_lib/http.js';
import { invoiceNoFor, newAccessKey, newRef, sha256Hex } from '../_lib/ids.js';
import { fromSatang } from '../_lib/money.js';
import { maxRoomsPerBooking, type PricedRate, priceQuotes } from '../_lib/rooms.js';
import { MAX_ADULTS, MAX_CHILDREN, parseStay, todayInBangkok } from '../_lib/search.js';
import { getCatalog, getQuotes, SiteMinderError } from '../_lib/siteminder.js';
import { createPaymentToken, isConfigured as paymentConfigured } from '../_lib/twoc2p.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+()\d\s.-]{6,30}$/;
const COUNTRY = /^[A-Z]{2}$/;
const shortDate = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

// POST /api/booking/create — "Continue to secure payment". Never trusts a
// price from the browser: it asks SiteMinder again for every room, checks
// they're still free and that the guests fit, works out what's due now from
// each rate's deposit, saves a pending booking that holds the rooms for
// BOOKING_HOLD_MINUTES, and asks 2C2P for a payment page for exactly that
// amount. The answer carries the 2C2P page for the Drop-in UI plus the
// booking reference and a private key the browser uses to follow its status.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['POST'])) return;
  res.setHeader('Cache-Control', 'no-store');
  const fail = (status: number, code: CreateBookingErrorCode, message: string) => res.status(status).json({ ok: false, code, message } satisfies CreateBookingResponse);

  const body = readJsonBody(req);
  if (body.hp_ref) {
    console.info('Booking ignored: honeypot filled');
    return fail(400, 'INVALID', 'Something went wrong — please try again.');
  }
  if (typeof body.elapsedMs === 'number' && Number.isFinite(body.elapsedMs) && body.elapsedMs < 4000) {
    return fail(429, 'INVALID', 'Please take a moment to check your details, then try again.');
  }
  if (!dbConfigured() || !paymentConfigured()) {
    console.error('Booking unavailable: Supabase or 2C2P is not configured');
    return fail(503, 'NOT_CONFIGURED', 'Online booking isn’t available right now — please contact us and we’ll book it for you.');
  }

  const stay = parseStay({ checkIn: body.checkIn, checkOut: body.checkOut, promo: body.promo });
  if ('error' in stay) return fail(400, 'INVALID', stay.error);
  const rooms = parseRooms(body.rooms);
  if (typeof rooms === 'string') return fail(400, 'INVALID', rooms);
  const guest = parseGuest(body.guest);
  if (typeof guest === 'string') return fail(400, 'INVALID', guest);
  if (body.acceptedPolicies !== true) return fail(400, 'INVALID', 'Please accept the booking conditions to continue.');

  // Price every room again, once per different room occupancy.
  let priced: Map<string, PricedRate>;
  let currency: string;
  try {
    const catalog = await getCatalog();
    currency = catalog.property.currencyIsoCode || 'THB';
    const [holds, deals] = await Promise.all([softHolds(stay.checkIn, stay.checkOut), loadDeals()]);
    const occupancies = [...new Set(rooms.map((room) => `${room.adults}|${room.children}`))];
    priced = new Map();
    await Promise.all(occupancies.map(async (key) => {
      const [adults, children] = key.split('|').map(Number);
      const quotes = await getQuotes({ ...stay, adults, children });
      for (const p of priceQuotes(quotes, catalog, holds, stay.checkIn, stay.promo, defaultDeposit(), deals, todayInBangkok())) priced.set(`${p.rate.uuid}|${key}`, p);
    }));
  } catch (error) {
    console.error('Booking: re-pricing failed', error);
    return fail(error instanceof SiteMinderError && error.status === 429 ? 429 : 502, 'SITEMINDER_UNAVAILABLE', 'We couldn’t confirm today’s prices — please try again in a minute.');
  }

  const lines = new Map<string, { p: PricedRate; room: BookingRoomRequest; quantity: number }>();
  const perRoomType = new Map<string, number>();
  const perRate = new Map<string, number>();
  for (const room of rooms) {
    const key = `${room.roomRateUuid}|${room.adults}|${room.children}`;
    const p = priced.get(key);
    if (!p) return fail(409, 'SOLD_OUT', 'One of your rooms has just been booked by someone else — please choose again.');
    if (!fits(p.capacity, room.adults, room.children)) return fail(400, 'INVALID', `The ${p.roomType.name} sleeps up to ${p.capacity.guests} — please add another room.`);
    perRoomType.set(p.roomType.uuid, (perRoomType.get(p.roomType.uuid) ?? 0) + 1);
    perRate.set(p.rate.uuid, (perRate.get(p.rate.uuid) ?? 0) + 1);
    if (perRoomType.get(p.roomType.uuid)! > p.available) return fail(409, 'SOLD_OUT', `Only ${p.available} ${p.roomType.name} ${p.available === 1 ? 'is' : 'are'} left for these dates — please choose again.`);
    if (p.rate.maxNumberOfRooms && perRate.get(p.rate.uuid)! > p.rate.maxNumberOfRooms) return fail(400, 'INVALID', `${p.rate.name} can be booked for up to ${p.rate.maxNumberOfRooms} rooms at a time.`);
    const line = lines.get(key);
    if (line) line.quantity += 1; else lines.set(key, { p, room, quantity: 1 });
  }

  const items: BookingItem[] = [...lines.values()].map(({ p, room, quantity }) => ({
    roomTypeUuid: p.roomType.uuid, roomTypeName: p.roomType.name, roomRateUuid: p.rate.uuid, rateName: p.rate.name,
    meals: { breakfast: p.rate.breakfastIncluded, lunch: p.rate.lunchIncluded, dinner: p.rate.dinnerIncluded },
    cancellation: p.cancellation.summary, depositType: p.depositType,
    adults: room.adults, children: room.children, quantity,
    unitTotal: fromSatang(p.total), unitOriginalTotal: fromSatang(p.originalTotal), unitDeposit: fromSatang(p.dueNow),
    offer: p.offer ? { title: p.offer.title, percent: p.offer.percent, perks: p.offer.perks, savings: fromSatang(p.offer.savings) } : null,
    nightly: p.nightly.map((n) => ({ date: n.date, amount: fromSatang(n.amount) })),
    promoDiscount: fromSatang(p.promoDiscount),
  }));
  const totalSatang = [...lines.values()].reduce((sum, { p, quantity }) => sum + p.total * quantity, 0);
  const depositSatang = [...lines.values()].reduce((sum, { p, quantity }) => sum + p.dueNow * quantity, 0);

  const holdMinutes = Math.max(5, Math.min(60, Number(process.env.BOOKING_HOLD_MINUTES) || 15));
  const expiresAt = new Date(Date.now() + holdMinutes * 60_000);
  const accessKey = newAccessKey();

  let booking;
  for (let attempt = 0; ; attempt++) {
    const ref = newRef();
    try {
      booking = await insertPending({
        ref, invoice_no: invoiceNoFor(ref), access_key_hash: sha256Hex(accessKey),
        check_in: stay.checkIn, check_out: stay.checkOut, promo_code: stay.promo ?? null, items, currency,
        total_amount: fromSatang(totalSatang), deposit_amount: fromSatang(depositSatang),
        guest_first_name: guest.firstName, guest_last_name: guest.lastName, guest_email: guest.email, guest_phone: guest.phone,
        guest_country: guest.country, arrival_time: guest.arrivalTime ?? null, special_requests: guest.specialRequests ?? null,
        expires_at: expiresAt.toISOString(),
      });
      break;
    } catch (error) {
      // A reference already taken (one in a billion) — draw another once.
      if (error instanceof DbError && error.status === 409 && attempt === 0) continue;
      console.error('Booking: could not save the pending booking', error);
      return fail(502, 'PAYMENT_UNAVAILABLE', 'We couldn’t start your booking — please try again.');
    }
  }

  const site = siteUrl(req);
  const roomCount = rooms.length;
  try {
    const { webPaymentUrl, paymentToken } = await createPaymentToken({
      invoiceNo: booking.invoice_no,
      description: `Hula Hula Resort · ${roomCount} room${roomCount === 1 ? '' : 's'} · ${shortDate.format(new Date(`${stay.checkIn}T00:00:00Z`))} – ${shortDate.format(new Date(`${stay.checkOut}T00:00:00Z`))} · ${booking.ref}`,
      amount: fromSatang(depositSatang),
      currencyCode: currency,
      paymentExpiry: expiresAt,
      frontendReturnUrl: `${site}/api/payment/2c2p-return?ref=${booking.ref}&key=${accessKey}`,
      backendReturnUrl: withPreviewBypass(`${site}/api/payment/2c2p-backend`),
      ref: booking.ref,
      guest: { name: `${guest.firstName} ${guest.lastName}`, email: guest.email, country: guest.country },
    });
    await updateWhere(`id=eq.${booking.id}`, { payment_token: paymentToken });
    console.info('Booking pending payment', booking.ref, booking.invoice_no);
    return res.status(200).json({
      ok: true, ref: booking.ref, accessKey, webPaymentUrl, currency,
      total: fromSatang(totalSatang), deposit: fromSatang(depositSatang), balance: fromSatang(totalSatang - depositSatang),
      expiresAt: expiresAt.toISOString(),
    } satisfies CreateBookingResponse);
  } catch (error) {
    console.error('Booking: 2C2P payment token failed', booking.ref, error);
    await updateWhere(`id=eq.${booking.id}`, { status: 'failed', ...PII_WIPE, pii_wiped_at: new Date().toISOString() }).catch(() => {});
    return fail(502, 'PAYMENT_UNAVAILABLE', 'Our payment provider isn’t responding — please try again in a few minutes.');
  }
}

function parseRooms(value: unknown): BookingRoomRequest[] | string {
  if (!Array.isArray(value) || value.length === 0) return 'Please choose at least one room.';
  if (value.length > maxRoomsPerBooking()) return `Online bookings are for up to ${maxRoomsPerBooking()} rooms — please contact us for groups.`;
  const rooms: BookingRoomRequest[] = [];
  for (const raw of value as Record<string, unknown>[]) {
    const { roomRateUuid, adults, children } = raw ?? {};
    if (typeof roomRateUuid !== 'string' || !/^[\w-]{1,64}$/.test(roomRateUuid)) return 'Please choose your rooms again.';
    if (!Number.isInteger(adults) || (adults as number) < 1 || (adults as number) > MAX_ADULTS) return 'Each room needs at least one adult.';
    if (!Number.isInteger(children) || (children as number) < 0 || (children as number) > MAX_CHILDREN) return 'Please check the number of children.';
    rooms.push({ roomRateUuid, adults: adults as number, children: children as number });
  }
  return rooms;
}

function parseGuest(value: unknown): GuestDetails | string {
  const raw = (value ?? {}) as Record<string, unknown>;
  const text = (key: string, max: number) => (typeof raw[key] === 'string' ? (raw[key] as string).trim().slice(0, max) : '');
  const guest: GuestDetails = {
    firstName: text('firstName', 60), lastName: text('lastName', 60), email: text('email', 120).toLowerCase(),
    phone: text('phone', 30), country: text('country', 2).toUpperCase(),
    arrivalTime: text('arrivalTime', 40) || undefined, specialRequests: text('specialRequests', 1000) || undefined,
  };
  if (!guest.firstName || !guest.lastName) return 'Please add the guest’s first and last name.';
  if (!EMAIL.test(guest.email)) return 'Please add a valid email address — your confirmation goes there.';
  if (!PHONE.test(guest.phone)) return 'Please add a phone number we can reach you on.';
  if (!COUNTRY.test(guest.country)) return 'Please choose your country.';
  return guest;
}
