/**
 * A room type's name, even when the hotel hasn't given it one in SiteMinder
 * (it then sends null or ""): its code in words ("ONE_BEDROOM_VILLA" → "One
 * bedroom villa"), else "Room". Everything downstream — the booking page, the
 * booking and its emails — expects a name, and a missing one crashed /book.
 */
export function roomTypeName({ name, code }: { name: string | null; code?: string | null }): string {
  const given = name?.trim();
  if (given) return given;
  const words = (code ?? '').replace(/[_-]+/g, ' ').trim().toLowerCase();
  return words ? words[0].toUpperCase() + words.slice(1) : 'Room';
}
