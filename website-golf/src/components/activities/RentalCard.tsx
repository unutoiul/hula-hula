import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import type { Rental } from '../../booking/config';
import { money } from '../../booking/pricing';
import { fonts } from '../../theme';

type Club = readonly ['wood' | 'iron' | 'putter', number];
interface Look { bg: string; bag: string; trim: string; stripe: string; wood: string; clubs: Club[]; mark: string; edge: string; blurb: string }

// Fuller bag and richer colours the higher the set. Worked out from the name
// staff give a set, so a set re-added in /admin keeps its picture.
const PREMIUM: Look = { bg: '#f8edc2', bag: '#124e39', trim: '#d9a521', stripe: '#f6d976', wood: '#d9a521', clubs: [['wood', 36], ['wood', 50], ['iron', 32], ['iron', 48], ['putter', 34]], mark: 'star', edge: '#d9a521', blurb: 'Our best clubs for your round.' };
const SET_A: Look = { bg: '#d9f5fc', bag: '#006d8a', trim: '#00495d', stripe: '#f9f70c', wood: '#00495d', clubs: [['wood', 40], ['iron', 50], ['iron', 34], ['putter', 44]], mark: 'A', edge: 'divider', blurb: 'Newer clubs & more variety.' };
const SET_B: Look = { bg: '#e7f4cc', bag: '#50830d', trim: '#315707', stripe: '#fffdf3', wood: '#315707', clubs: [['wood', 42], ['iron', 50], ['putter', 36]], mark: 'B', edge: 'divider', blurb: 'A standard set for your round.' };

function lookOf(label: string): Look {
  if (/premium/i.test(label)) return PREMIUM;
  const letter = /^set\s+([a-z])\b/i.exec(label.trim())?.[1].toUpperCase();
  return letter === 'A' ? SET_A : { ...SET_B, mark: letter ?? '' };
}

// Each drawn from the tip of its shaft, facing left.
const HEADS = {
  wood: 'M1.5 0C2.5-10-6-18-16-16-26-14-27-4-21 0-15 4-3 4 1.5 0Z',
  iron: 'M1.5-3-13-13C-17-15-20-12-19-8L-16 0C-15 3-12 4-9 3L1.5 0Z',
  putter: 'M1.5-6H-16C-19-6-20-4-20-2V1C-20 3-19 5-16 5H-8C-5 5-3 3-1 1L1.5-1Z',
};

/** A neutral equipment illustration, not a photograph of the actual inventory. */
function ClubBag({ look }: { look: Look }) {
  const { bag, trim, stripe, wood, clubs, mark } = look;
  const middle = (clubs.length - 1) / 2;
  return <Box component="svg" viewBox="0 0 140 180" aria-hidden="true" sx={{ display: 'block', height: '92%', width: 'auto' }}>
    <ellipse cx="70" cy="172" rx="46" ry="4" fill="#173c2c" opacity=".14" />
    {/* Leaning back on its stand, like a bag parked by the tee. */}
    <g transform="rotate(-7 72 168)">
      <path d="M56 104 30 167M58 108 44 168.5" stroke="#6f8389" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="72" cy="66" rx="23" ry="6.5" fill="#173c2c" />
      {clubs.map(([club, length], i) => {
        const step = i - middle;
        return <g key={i} transform={`translate(${72 + step * 9} 68) rotate(${step * 9})${step > 0 ? ' scale(-1 1)' : ''}`}>
          <path d={`M0 8V${-length}`} stroke="#90a2a6" strokeWidth="2.8" strokeLinecap="round" />
          <path transform={`translate(0 ${-length})`} d={HEADS[club]} fill={club === 'wood' ? wood : '#6f8389'} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
        </g>;
      })}
      <path d="M92 106C110 106 110 146 91 146Z" fill={trim} />
      <path d="M50 76H94L91 156Q90.5 166 81 166H63Q53.5 166 53 156Z" fill={bag} />
      <path d="M53.4 148H90.6L90.4 156Q90 166 81 166H63Q54 166 53.6 156Z" fill={trim} />
      <path d="M51.6 118H92.4L92.2 122H51.8Z" fill={stripe} />
      <path d="M48 66Q72 80 96 66V76Q96 83 89 83H55Q48 83 48 76Z" fill={trim} />
      <rect x="61" y="127" width="22" height="15" rx="4" fill="#fff" fillOpacity=".18" />
      <path d="M65 132H79" stroke={stripe} strokeWidth="2" strokeLinecap="round" />
      {mark === 'star'
        ? <path d="M72 88 74.8 95.6 82.5 96.1 76.6 101 78.5 108.4 72 104.3 65.5 108.4 67.4 101 61.5 96.1 69.2 95.6Z" fill={trim} />
        : mark && <>
          <circle cx="72" cy="100" r="12" fill="#fffdf3" />
          <text x="72" y="106" textAnchor="middle" fontFamily={fonts.serif} fontSize="17" fontWeight="600" fill={bag}>{mark}</text>
        </>}
    </g>
    {mark === 'star' && <g fill={trim}>
      <path d="m124 62 2.4 6.6 6.6 2.4-6.6 2.4-2.4 6.6-2.4-6.6-6.6-2.4 6.6-2.4Z" />
      <path d="m112 104 1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6Z" />
    </g>}
  </Box>;
}

export function RentalVisual({ rental, height = 148 }: { rental: Rental; height?: number | { xs: number; md: number } }) {
  return <Box sx={{ bgcolor: lookOf(rental.label).bg, borderRadius: '18px', height, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
    {rental.image ? <Box component="img" src={rental.image} alt={rental.label} loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <ClubBag look={lookOf(rental.label)} />}
  </Box>;
}

/** The sets side by side on large screens, one under another below that. */
export function RentalGrid({ children }: { children: ReactNode }) {
  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', md: 'repeat(3, minmax(0,1fr))' }, gap: { xs: 2, md: 3 } }}>{children}</Box>;
}

const BESIDE = { xs: '80px minmax(0,1fr)', sm: '96px minmax(0,1fr)' };

// Picture beside the words on small screens (and always when `compact`, for
// the narrow booking column); picture on top when the cards sit side by side.
export function RentalCard({ rental, children, compact = false }: { rental: Rental; children?: ReactNode; compact?: boolean }) {
  const look = lookOf(rental.label);
  return <Box sx={{ display: 'grid', gridTemplateColumns: compact ? BESIDE : { ...BESIDE, md: 'minmax(0,1fr)' }, alignContent: 'start', gap: 2, border: '1px solid', borderColor: look.edge, bgcolor: 'background.paper', borderRadius: '24px', p: 2, minWidth: 0 }}>
    <RentalVisual rental={rental} height={compact ? 96 : { xs: 96, md: 172 }} />
    <Box sx={{ minWidth: 0, alignSelf: 'center' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" spacing={1}><Typography sx={{ fontWeight: 700 }}>{rental.label}</Typography><Typography sx={{ fontWeight: 800, color: 'primary.main', whiteSpace: 'nowrap' }}>{money(rental.price)}</Typography></Stack>
      <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: .5 }}>{rental.description || look.blurb} Priced per set.</Typography>
      {children && <Box sx={{ mt: 1 }}>{children}</Box>}
    </Box>
  </Box>;
}
