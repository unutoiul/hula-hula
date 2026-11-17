// Resend drops variables into the template with {{{triple braces}}} — the
// unescaped kind — so everything a guest typed is escaped first.
export const escape = (value: string) => value.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]!));

// Resend caps a variable at 2,000 characters, which escaping can push a long
// message past; trim it back without splitting an entity.
export const clip = (html: string, max = 2000) => (html.length <= max ? html : `${html.slice(0, max - 1).replace(/&[^;]*$/, '')}…`);

export const whatsappLink = (phone: string) => { const digits = phone.replace(/\D/g, ''); return digits.length >= 8 ? `https://wa.me/${digits}` : undefined; };
