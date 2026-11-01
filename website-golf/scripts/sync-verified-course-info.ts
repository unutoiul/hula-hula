// Run with node --experimental-transform-types --env-file=.env.local scripts/sync-verified-course-info.ts --apply
// Patches only the source-verified fields; other staff settings and rental photos are preserved.
import { rest } from '../api/_lib/db.ts';
import { DEFAULT_ACTIVITIES, DEFAULT_RENTALS } from '../src/booking/config.ts';

const rows = await rest<{id: string; data: Record<string, unknown>}[]>('/golf_activities?select=id,data&id=in.(golf,footgolf)');
const settings = await rest<{value: Record<string, unknown>[]}[]>('/golf_settings?select=value&key=eq.rentals');
const changes = rows.map((row) => {
  const source = DEFAULT_ACTIVITIES.find(a => a.id === row.id)!;
  const oldCard = (row.data.card ?? {}) as Record<string, unknown>;
  return { id: row.id, data: { ...row.data, tagline: source.tagline, about: source.about, options: source.options, rentals: source.rentals, askHandicap: source.askHandicap, askExperience: source.askExperience, card: { ...oldCard, kicker: source.card.kicker, detail: source.card.detail } } };
});
const rentals = (settings[0]?.value ?? DEFAULT_RENTALS).map(r => {
  const verified = DEFAULT_RENTALS.find(v => v.id === r.id);
  return verified ? { ...r, label: verified.label, price: verified.price } : r;
});
if (!process.argv.includes('--apply')) {
  console.log(JSON.stringify({ activities: changes, rentals }, null, 2));
} else {
  for (const row of changes) await rest(`/golf_activities?id=eq.${row.id}`, { method: 'PATCH', body: { data: row.data } });
  await rest('/golf_settings?key=eq.rentals', { method: 'PATCH', body: { value: rentals } });
  const verified = await rest<{id:string;data:{options:unknown}}[]>('/golf_activities?select=id,data&id=in.(golf,footgolf)');
  console.log(JSON.stringify(verified.map(r => ({ id:r.id, options:r.data.options }))));
}
