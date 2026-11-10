// The booking emails are Resend templates (emails/*.html) filled with the
// variables api/_lib/emails.ts builds. These check the two stay in step —
// every placeholder gets a variable, no variable goes nowhere — and that
// whatever a guest typed arrives escaped.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { describe, it } from 'node:test';
import { bookingConfirmation, bookingNotification, eventConfirmation, eventNotification, type PaidOrder, type TemplateMessage } from '../api/_lib/emails.ts';
import { DEFAULT_SITE } from '../src/booking/config.ts';
import type { Guest, Reservation } from '../src/booking/contract.ts';

const placeholders = (template: string) => new Set([...readFileSync(new URL(`../emails/${template}.html`, import.meta.url), 'utf8').matchAll(/\{\{\{\s*(\w+)\s*\}\}\}/g)].map((m) => m[1]));
const keys = (message: TemplateMessage) => new Set(Object.keys(message.variables));

const guest: Guest = { firstName: 'Ann <b>', lastName: 'Lee', email: 'ann@example.com', phone: '+66 81 234 5678', country: 'TH', handicap: '18', notes: 'Left-handed & <script>\nThanks' };
const reservation: Reservation = {
  ref: 'HG-7K2M', activity: 'golf', activityName: 'Golf', optionLabel: '9 holes', date: '2026-11-04', time: '08:30', minutes: 135, players: 2,
  rentals: { standard: 1 }, transfer: '08:00', privateTransfer: false, pickupFrom: 'Ao Nang', lines: [{ label: 'Golf · 9 holes', detail: '2 players × ฿1,600', amount: 3200 }], total: 3200, deposit: 500, balance: 2700, email: guest.email, emailed: false,
};
const order: PaidOrder = {
  ref: 'HE-4QX9', status: 'paid', eventTitle: 'Full Moon Scramble', eventSlug: 'full-moon-scramble', startsOn: '2026-11-21', startTime: '15:00', endTime: '20:00',
  packageName: 'Player & dinner', quantity: 2, total: 3000, email: 'bo@example.com', testPayment: true,
  firstName: 'Bo', lastName: 'Chan', phone: '+66 89 000 1111', country: 'GB', notes: 'Veggie <please>', unitPrice: 1500, flags: ['paid_after_expiry'],
};
const site = 'https://hulahula-golf.vercel.app';

describe('booking emails (Resend templates)', () => {
  const cases: [string, TemplateMessage][] = [
    ['golf-booking-confirmation', bookingConfirmation(reservation, guest, site, DEFAULT_SITE)],
    ['golf-booking-notification', bookingNotification(reservation, guest, 'Played a few times', site, DEFAULT_SITE)],
    ['golf-event-confirmation', eventConfirmation(order, site, DEFAULT_SITE)],
    ['golf-event-notification', eventNotification(order, site, DEFAULT_SITE)],
  ];
  for (const [template, message] of cases) {
    it(`${template}: fills exactly the template's placeholders`, () => {
      assert.equal(message.template, template);
      assert.deepEqual([...keys(message)].sort(), [...placeholders(template)].sort());
    });
  }

  it('escapes what the guest typed', () => {
    const club = bookingNotification(reservation, guest, '', site, DEFAULT_SITE).variables;
    assert.equal(club.GUEST_NAME, 'Ann &lt;b&gt; Lee');
    assert.equal(club.NOTES, 'Left-handed &amp; &lt;script&gt;<br>Thanks');
    assert.equal(bookingConfirmation(reservation, guest, site, DEFAULT_SITE).variables.GUEST_FIRST_NAME, 'Ann &lt;b&gt;');
    assert.equal(eventNotification(order, site, DEFAULT_SITE).variables.NOTES, 'Veggie &lt;please&gt;');
  });

  it('leaves optional details out, so the template shows its fallback', () => {
    const plain = { ...reservation, transfer: null, rentals: {} };
    const club = bookingNotification(plain, { ...guest, handicap: '', notes: '' }, '', site, DEFAULT_SITE).variables;
    for (const key of ['HANDICAP', 'EXPERIENCE', 'RENTALS', 'SHUTTLE', 'NOTES']) assert.equal(club[key], undefined, key);
    assert.equal(bookingConfirmation(plain, guest, site, DEFAULT_SITE).variables.PICKUP_DISPLAY, undefined);
  });

  it('shows the deposit paid and what is left to pay at the club', () => {
    const vars = bookingConfirmation(reservation, guest, site, DEFAULT_SITE).variables;
    assert.equal(vars.PAID_LABEL, 'Deposit paid online');
    assert.equal(vars.PAID_AMOUNT, '฿500');
    assert.equal(vars.TOTAL, '฿3,200');
    assert.equal(vars.BALANCE, '฿2,700');
    assert.equal(vars.BALANCE_DISPLAY, 'table-cell');
    assert.match(vars.RULES_HTML!, /฿500 deposit is paid online/);
    assert.match(vars.RULES_HTML!, /refund your deposit/);
    const full = bookingConfirmation({ ...reservation, deposit: 3200, balance: 0 }, guest, site, DEFAULT_SITE).variables;
    assert.equal(full.PAID_LABEL, 'Paid online');
    assert.equal(full.BALANCE_DISPLAY, undefined);
    assert.doesNotMatch(full.RULES_HTML!, /deposit/);
  });

  it('tells the guest and the club about a private transfer', () => {
    const car = { ...reservation, transfer: null, privateTransfer: true, pickupFrom: 'Railay <Beach>' };
    const toGuest = bookingConfirmation(car, guest, site, DEFAULT_SITE).variables;
    assert.equal(toGuest.PICKUP_DISPLAY, 'block');
    assert.match(toGuest.PICKUP_LINE!, /^Private transfer from Railay &lt;Beach&gt;/);
    assert.match(bookingNotification(car, guest, '', site, DEFAULT_SITE).variables.SHUTTLE!, /agree the price/);
  });

  it('flags a test payment and a late payment for the club, not the guest', () => {
    const club = eventNotification(order, site, DEFAULT_SITE).variables;
    assert.equal(club.FLAGS_DISPLAY, 'block');
    assert.match(club.FLAGS_HTML!, /TEST payment/);
    assert.match(club.FLAGS_HTML!, /hold on these places ran out/);
    assert.equal(eventNotification({ ...order, testPayment: false, flags: [] }, site, DEFAULT_SITE).variables.FLAGS_DISPLAY, undefined);
    assert.equal(eventConfirmation(order, site, DEFAULT_SITE).variables.PAID_LABEL, 'Paid (test — nothing was charged)');
  });
});
