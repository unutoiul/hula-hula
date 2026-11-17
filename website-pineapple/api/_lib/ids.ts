import { createHash, randomBytes, randomInt } from 'node:crypto';

// The guest-facing booking reference ("HH7K3M9Q"), the booking invoice number
// derived from it, and the secret that lets only the booking's own browser
// read its status.

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // no I, L, O or U to misread

export const REF_PATTERN = /^HH[0-9A-Z]{6}$/;
export const ACCESS_KEY_PATTERN = /^[\w-]{43}$/;

export const newRef = () => `HH${Array.from({ length: 6 }, () => CROCKFORD[randomInt(CROCKFORD.length)]).join('')}`;

// Keep invoice numbers stable and distinct from guest-facing references.
export const invoiceNoFor = (ref: string) => `WEB${ref}`;

export const newAccessKey = () => randomBytes(32).toString('base64url');

export const sha256Hex = (value: string) => createHash('sha256').update(value).digest('hex');
