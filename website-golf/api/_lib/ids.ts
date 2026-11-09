import { createHash, randomBytes, randomInt } from 'node:crypto';

// The guest-facing event order reference ("HE7K3M9Q"), the payment reference
// derived from it, and the secret that lets only the order's own browser read
// its status.

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // no I, L, O or U to misread

export const ORDER_REF_PATTERN = /^HE[0-9A-Z]{6}$/;
export const ACCESS_KEY_PATTERN = /^[\w-]{43}$/;

export const newOrderRef = () => `HE${Array.from({ length: 6 }, () => CROCKFORD[randomInt(CROCKFORD.length)]).join('')}`;

export const PAYMENT_REF_PATTERN = /^[1-9]\d{11}$/;

// Payso's referenceNo: at most 12 characters, digits only in its older docs,
// and unique per payment. No leading zero, in case anything reads it as a number.
export const invoiceNoFor = (ref: string) => String(1e11 + (parseInt(sha256Hex(ref).slice(0, 12), 16) % 9e11));

export const newAccessKey = () => randomBytes(32).toString('base64url');

export const sha256Hex = (value: string) => createHash('sha256').update(value).digest('hex');
