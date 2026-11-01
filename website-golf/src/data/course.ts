// Yardages verified against the club's published first- and second-round guides.
// Tee distances must not be inferred from the length or scale of the artwork.
export const GOLF_HOLES = [
  { par: 4, first: [309, 294, 247], second: [314, 286, 256] },
  { par: 3, first: [185, 155, 123], second: [196, 172, 130] },
  { par: 5, first: [526, 490, 415], second: [534, 505, 395] },
  { par: 4, first: [298, 249, 194], second: [311, 296, 252] },
  { par: 3, first: [92, 77, 65], second: [102, 87, 81] },
  { par: 5, first: [507, 467, 423], second: [533, 492, 456] },
  { par: 4, first: [335, 298, 197], second: [345, 285, 210] },
  { par: 4, first: [363, 320, 280], second: [353, 332, 298] },
  { par: 4, first: [338, 299, 268], second: [320, 294, 250] },
] as const;

export function golfHole(number: number) {
  const physical = (number - 1) % 9;
  const hole = GOLF_HOLES[physical];
  return { number, physical: physical + 1, par: hole.par, round: number > 9 ? 2 : 1, yards: number > 9 ? hole.second : hole.first };
}

/** A single map per physical hole; Golf's second round reuses the same layout. */
export function courseMapImage(activity: 'golf' | 'footgolf', number: number) {
  if (!Number.isInteger(number) || number < 1 || number > 18) throw new RangeError('Choose a hole from 1 to 18.');
  const name = activity === 'footgolf'
    ? `footgolf-hole-${String(number).padStart(2, '0')}`
    : `golf-guide-${golfHole(number).physical - 1}`;
  return `/images/course-guides/${name}.svg`;
}
