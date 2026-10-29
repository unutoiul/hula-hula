import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildSheet, isBookableDay } from '../src/booking/availability.ts';
import { activityById } from '../src/booking/config.ts';
import type { TeeSheetResponse } from '../src/booking/contract.ts';
import { isISODate } from '../src/booking/dates.ts';
import { allowMethods, queryString } from './_lib/http.ts';
import { loadDay } from './_lib/sheet.ts';

// GET /api/tee-sheet?activity=golf&option=9&date=2026-11-02 — every start
// for that day with the places left, from the bookings in Supabase.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!allowMethods(req, res, ['GET'])) return;
  res.setHeader('Cache-Control', 'no-store');

  const activity = activityById(queryString(req, 'activity'));
  const option = activity?.options.find((o) => o.id === queryString(req, 'option'));
  const date = queryString(req, 'date');
  if (!activity || !option || !isISODate(date)) return res.status(400).json({ error: 'That isn’t something we can show a tee sheet for.', code: 'invalid' });
  if (!isBookableDay(date)) return res.status(200).json({ slots: [] } satisfies TeeSheetResponse);

  try {
    const { bookings, blocks } = await loadDay(activity.id, date);
    return res.status(200).json({ slots: buildSheet(activity, option, date, bookings, blocks) } satisfies TeeSheetResponse);
  } catch (error) {
    console.error('Tee sheet failed', error);
    return res.status(500).json({ error: 'We couldn’t load the tee sheet just now. Please try again, or WhatsApp us.' });
  }
}
