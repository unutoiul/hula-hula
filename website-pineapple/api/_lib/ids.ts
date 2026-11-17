import { createHash, randomBytes, randomInt } from 'node:crypto';

// The guest-facing booking reference ("RP7K3M9Q"), the booking invoice number
// derived from it, and the secret that lets only the booking's own browser
// read its status. "RP" keeps Royal Pineapple's bookings apart from the
// resort's "HH" ones in the Stripe account the two hotels share.

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // no I, L, O or U to misread

export const REF_PATTERN = /^RP[0-9A-Z]{6}$/;
export const ACCESS_KEY_PATTERN = /^[\w-]{43}$/;

export const newRef = () => `RP${Array.from({ length: 6 }, () => CROCKFORD[randomInt(CROCKFORD.length)]).join('')}`;

// Keep invoice numbers stable and distinct from guest-facing references.
export const invoiceNoFor = (ref: string) => `WEB${ref}`;

export const newAccessKey = () => randomBytes(32).toString('base64url');

export const sha256Hex = (value: string) => createHash('sha256').update(value).digest('hex');
