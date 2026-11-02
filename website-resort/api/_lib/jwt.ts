import { createHmac, timingSafeEqual } from 'node:crypto';

// HS256 JSON Web Tokens, which is how 2C2P signs every request and response:
// the payload is signed with the merchant's secret key. Small enough not to
// need a library.

const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString('base64url');
const sign = (input: string, secret: string) => createHmac('sha256', secret).update(input).digest();

export function signHS256(payload: object, secret: string): string {
  const head = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}`;
  return `${head}.${sign(head, secret).toString('base64url')}`;
}

export function verifyHS256<T>(token: string, secret: string): T {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed token');
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8')) as { alg?: string };
  // Only ever accept the algorithm we expect — never "none" or a swap.
  if (header.alg !== 'HS256') throw new Error('Unexpected token algorithm');
  const expected = sign(`${parts[0]}.${parts[1]}`, secret);
  const given = Buffer.from(parts[2], 'base64url');
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) throw new Error('Bad token signature');
  return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as T;
}
