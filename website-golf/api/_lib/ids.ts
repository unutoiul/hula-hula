import { createHash, randomBytes, randomInt } from 'node:crypto';

// The guest-facing event order reference ("HE7K3M9Q"), the 2C2P invoice
// number derived from it, and the secret that lets only the order's own
// browser read its status.

const CROCKFORD = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // no I, L, O or U to misread

export const ORDER_REF_PATTERN = /^HE[0-9A-Z]{6}$/;
export const ACCESS_KEY_PATTERN = /^[\w-]{43}$/;

export const newOrderRef = () => `HE${Array.from({ length: 6 }, () => CROCKFORD[randomInt(CROCKFORD.length)]).join('')}`;

// Letters and digits only, and at most 20 of them: QR payments (PromptPay)
// refuse anything longer. "GEV" keeps them apart from the resort's "WEB…".
export const invoiceNoFor = (ref: string) => `GEV${ref}`;

export const newAccessKey = () => randomBytes(32).toString('base64url');

export const sha256Hex = (value: string) => createHash('sha256').update(value).digest('hex');
