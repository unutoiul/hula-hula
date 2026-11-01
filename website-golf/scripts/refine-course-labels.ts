// Replace traced lettering with real SVG text, without retracing course geometry.
// Run with Node's TypeScript support: node scripts/refine-course-labels.ts
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { GOLF_HOLES } from '../src/data/course.ts';

interface Bounds { x: number; y: number; right: number; bottom: number }
interface Shape { markup: string; attributes: string; rings: { path: string; bounds: Bounds }[]; fill: string }

// First-round distance callouts, verified against the club's hole guides, top to bottom.
const CALLOUTS = [[270, 200], [170, 150], [440, 370, 190, 145], [230, 200, 180], [110, 77], [390, 240, 220, 175], [265, 200, 110], [230, 180], [270, 230, 210, 160]];
const FONT = 'Arial, Helvetica, sans-serif';
const INK = '#23382c';
const BLUE = '#365a94';
const TEES = [BLUE, '#ffffff', '#cb4c43'];

function bounds(path: string): Bounds {
  const points = [...path.matchAll(/(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map(([, x, y]) => [+x, +y]);
  return {
    x: Math.min(...points.map(p => p[0])), y: Math.min(...points.map(p => p[1])),
    right: Math.max(...points.map(p => p[0])), bottom: Math.max(...points.map(p => p[1])),
  };
}

const inside = (shape: Bounds, area: Bounds) => shape.x >= area.x && shape.y >= area.y && shape.right <= area.right && shape.bottom <= area.bottom;
const pad = (area: Bounds, amount: number): Bounds => ({ x: area.x - amount, y: area.y - amount, right: area.right + amount, bottom: area.bottom + amount });
const text = (x: number, y: number, value: string | number, size: number, extra = '') => `<text x="${x}" y="${y}" font-size="${size}" ${extra}>${value}</text>`;

function shapes(svg: string): Shape[] {
  return [...svg.matchAll(/<path\b([^>]*?)\bd="([^"]+)"([^>]*?)\/>/g)].map(([markup, before, data, after]) => ({
    markup, attributes: before + after, fill: before.match(/fill="([^"]+)"/)?.[1] ?? '',
    rings: (data.match(/M[^M]+/g) ?? []).map(path => ({ path, bounds: bounds(path) })),
  }));
}

function roundCard(y: number, title: string, yards: readonly number[]) {
  return `<g aria-label="${title}">
    ${text(97, y + 18, title, 17, 'text-anchor="middle" font-weight="700"')}
    <rect x="30" y="${y + 25}" width="137" height="92" rx="9" fill="#eef1ea"/>
    ${yards.map((value, i) => `<circle cx="47" cy="${y + 45 + i * 26}" r="5.5" fill="${TEES[i]}" stroke="#b3c1b1" stroke-width=".5"/>${text(60, y + 51 + i * 26, `${value} yd`, 17, 'font-weight="600"')}`).join('')}
  </g>`;
}

function pinLegend() {
  return `<g aria-label="Pin positions"><rect x="390" y="538" width="76" height="95" rx="14" fill="#f2f4ef"/>
    ${['Front', 'Middle', 'Back'].map((label, i) => {
      const y = 549 + i * 29;
      return `<path d="M407 ${y}v20" fill="none" stroke="#8c9b8a" stroke-width=".9"/><path d="M407 ${y}q-4 6-10 4v8q6 2 10-4Z" fill="${['#cb4c43', '#ffffff', '#ecd13b'][i]}" stroke="#c6cec1" stroke-width=".4"/>${text(416, y + 13, label, 12, 'font-weight="600"')}`;
    }).join('')}</g>`;
}

export function refineMapLabels(svg: string, activity: 'golf' | 'footgolf', number: number) {
  if (svg.includes('id="course-labels"')) return svg;
  const paths = shapes(svg);
  const erase: Bounds[] = [];
  let labels = '';
  if (activity === 'footgolf') {
    erase.push({ x: 496, y: -1, right: 622, bottom: 141 });
    labels = `<path d="M500 0H619V102Q619 137 584 137H535Q500 137 500 102Z" fill="#db8425"/>${text(559.5, 101, number, 58, 'fill="#ffffff" text-anchor="middle" font-weight="700"')}`;
  } else {
    const hole = GOLF_HOLES[number - 1];
    if (!hole) throw new Error(`Unknown Golf hole ${number}`);
    erase.push(
      { x: 25, y: 40, right: 250, bottom: 83 },
      { x: 25, y: 92, right: 171, bottom: 216 },
      { x: 25, y: 515, right: 171, bottom: 637 },
      { x: 389, y: 536, right: 468, bottom: 638 },
    );
    labels = `${text(31, 74, `HOLE ${number}`, 34, 'font-weight="700"')}${text(176, 74, `Par ${hole.par}`, 23, 'font-weight="700"')}${roundCard(94, '1st round', hole.first)}${roundCard(514, '2nd round', hole.second)}${pinLegend()}`;
    const badges = paths.filter(path => path.fill === BLUE).flatMap(path => path.rings.map(ring => ring.bounds))
      .filter(b => b.right - b.x >= 17 && b.right - b.x <= 19 && b.bottom - b.y >= 17 && b.bottom - b.y <= 20 && b.y > 160 && b.y < 500)
      .sort((a, b) => a.y - b.y);
    const distances = CALLOUTS[number - 1];
    if (badges.length !== distances.length) throw new Error(`Unexpected callout count on Golf hole ${number}: ${badges.length}`);
    badges.forEach((badge, i) => {
      const digits = paths.filter(path => path.fill === INK).flatMap(path => path.rings.map(ring => ring.bounds))
        .filter(b => b.x > badge.right && b.right < badge.right + 53 && b.y >= badge.y - 1 && b.bottom <= badge.bottom + 3 && b.right - b.x <= 15 && b.bottom - b.y >= 8);
      if (!digits.length) throw new Error(`Missing distance lettering on Golf hole ${number}, marker ${i + 1}`);
      const lettering = {
        x: Math.min(...digits.map(b => b.x)), y: Math.min(...digits.map(b => b.y)),
        right: Math.max(...digits.map(b => b.right)), bottom: Math.max(...digits.map(b => b.bottom)),
      };
      erase.push(pad(badge, 1.5), pad(lettering, 1.5));
      const cx = (badge.x + badge.right) / 2;
      const cy = (badge.y + badge.bottom) / 2;
      labels += `<g aria-label="First-round marker ${distances[i]} yards"><circle cx="${cx}" cy="${cy}" r="9" fill="${BLUE}"/>${text(cx, cy + 3, '1st', 8, 'fill="#ffffff" text-anchor="middle" font-weight="700"')}${text(lettering.x, lettering.bottom, distances[i], 17.5, 'font-weight="700"')}</g>`;
    });
  }
  // Only closed contours wholly inside annotation regions are removed. Leaders
  // crossing the fairway and every course/hazard contour are left untouched.
  let result = svg;
  for (const shape of paths) {
    const kept = shape.rings.filter(ring => !erase.some(area => inside(ring.bounds, area)));
    result = result.replace(shape.markup, kept.length ? `<path${shape.attributes}d="${kept.map(ring => ring.path).join('')}"/>` : '');
  }
  return result.replace('</svg>', `<g id="course-labels" font-family="${FONT}" fill="${INK}" text-rendering="geometricPrecision">${labels}</g></svg>`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const folder = new URL('../public/images/course-guides/', import.meta.url);
  for (const name of readdirSync(folder).filter(name => name.endsWith('.svg'))) {
    const activity = name.startsWith('footgolf') ? 'footgolf' : 'golf';
    const index = Number(name.match(/(\d+)\.svg$/)?.[1]);
    const file = new URL(name, folder);
    const before = readFileSync(file, 'utf8');
    const after = refineMapLabels(before, activity, activity === 'golf' ? index + 1 : index);
    if (after !== before) writeFileSync(file, after);
    console.log(`${name}: crisp SVG labels${after === before ? ' (already updated)' : ''}`);
  }
}
