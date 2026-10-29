// Everything a guest typed is escaped before it goes into an email's HTML.
export const escape = (value: string) => value.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]!));

export const whatsappLink = (phone: string) => { const digits = phone.replace(/\D/g, ''); return digits.length >= 8 ? `https://wa.me/${digits}` : undefined; };
