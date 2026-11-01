// Everything a guest typed is escaped before it goes into an email's HTML.
export const escape = (value: string) => value.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]!));

/** Keeps a template variable under Resend's 2,000-character limit without cutting an entity in half. */
export const clip = (html: string, max = 2000) => (html.length <= max ? html : `${html.slice(0, max - 1).replace(/&[^;]*$/, '')}…`);

export const whatsappLink = (phone: string) => { const digits = phone.replace(/\D/g, ''); return digits.length >= 8 ? `https://wa.me/${digits}` : undefined; };
