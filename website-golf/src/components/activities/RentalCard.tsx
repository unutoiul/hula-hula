import StarRounded from '@mui/icons-material/StarRounded';
import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { groupRentals, rentalSetLetter, type Rental } from '../../booking/config';
import { money } from '../../booking/pricing';
import { fonts } from '../../theme';

const ICON_SX = { display: 'block', height: '88%', width: 'auto', maxWidth: '100%' };

/** Set A: a stand bag leaning back on its legs. An illustration, not the actual inventory. */
function StandBag() {
  const line = '#36544a';
  const trim = '#c9773b';
  return <Box component="svg" viewBox="40 70 600 680" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round" sx={ICON_SX}>
    <path d="M478 372 456 646M480 372 600 718" stroke="#7c6a45" strokeWidth="9" />
    <circle cx="456" cy="648" r="10" fill={trim} />
    <circle cx="600" cy="720" r="10" fill={trim} />
    <path d="M452 132 438 186M510 172 496 206M578 130 530 210" stroke="#7b878d" strokeWidth="9" />
    <g fill="#c5ced2" stroke="#7b878d" strokeWidth="6">
      <rect x="436" y="96" width="76" height="38" rx="10" transform="rotate(14 474 115)" />
      <rect x="472" y="138" width="86" height="40" rx="10" transform="rotate(10 515 158)" />
      <rect x="562" y="144" width="60" height="36" rx="9" transform="rotate(-8 592 162)" />
    </g>
    <ellipse cx="584" cy="110" rx="44" ry="26" transform="rotate(8 584 110)" fill="#7d7592" stroke="#544d66" strokeWidth="6" />
    <path d="M345 170Q440 158 522 226C508 290 470 380 440 440 420 520 380 620 298 714 225 735 130 730 68 702 52 660 50 610 92 524 120 490 160 470 178 452Z" fill="#93b494" stroke={line} strokeWidth="8" />
    <path d="M283 415Q345 425 392 470C398 500 396 525 388 552 372 600 345 650 302 694 260 690 205 668 178 642 190 590 235 490 283 415Z" fill="#a6c3a4" stroke={line} strokeWidth="8" />
    <path d="M252 418C215 480 170 565 150 645M178 462C135 530 100 590 72 644M72 650C140 690 220 706 298 702" stroke={line} strokeWidth="6" />
    <path d="M252 366C215 360 190 385 192 425" stroke={line} strokeWidth="7" />
    <path d="M344 184 322 222M322 248 258 350M244 376 188 454" stroke={line} strokeWidth="28" />
    <path d="M344 184 322 222M322 248 258 350M244 376 188 454" stroke={trim} strokeWidth="19" />
    <path d="M338 176Q440 158 524 228" stroke={line} strokeWidth="20" />
    <path d="M338 176Q440 158 524 228" stroke={trim} strokeWidth="12" />
    <path d="M396 178V198" stroke={trim} strokeWidth="13" />
    <circle cx="396" cy="213" r="15" stroke={line} strokeWidth="7" />
    <path d="M66 702C130 732 225 735 296 716" stroke={trim} strokeWidth="15" />
    <path d="M60 652C78 658 96 660 116 658" stroke={trim} strokeWidth="13" />
  </Box>;
}

/** Set B: a driver, a fairway wood and a putter, standing up in a row. */
function ThreeClubs() {
  const ink = '#141b18';
  const pale = '#f2f7e8';
  return <Box component="svg" viewBox="60 70 600 740" aria-hidden="true" fill="none" strokeLinecap="round" strokeLinejoin="round" sx={ICON_SX}>
    <path d="M254 782Q254 792 262 792 270 792 270 782V282C270 240 284 190 286 138 288 118 278 102 258 98L134 96C112 100 88 122 78 146 72 160 84 170 100 176 150 190 215 194 236 214 248 236 254 262 254 282Z" fill={ink} />
    <ellipse cx="186" cy="143" rx="43" ry="41" fill={pale} />
    <path d="M150 124H224M144 143H230M150 162H224" stroke={ink} strokeWidth="8" />
    <path d="M90 150C98 130 110 112 128 100" stroke={pale} strokeWidth="6" />
    <path d="M332 782Q332 792 340 792 348 792 348 782V300L350 226C420 205 470 172 498 136 512 124 512 108 500 100 460 78 390 84 360 112 326 150 322 190 330 232L332 300Z" fill={ink} />
    <path d="M344 206C336 176 342 150 370 124 395 102 450 96 488 112 462 150 415 186 344 206Z" fill={pale} />
    <path d="M362 154 428 122M358 180 462 126M392 176 440 150" stroke={ink} strokeWidth="8" />
    <path d="M409 782Q409 792 417 792 425 792 425 782V370L431 339H610C628 339 640 326 640 310 640 294 628 281 610 281H400C384 281 372 294 372 310 372 326 382 340 400 340H403L409 370Z" fill={ink} />
    <path d="M436 294H476M426 310H500M412 326H528" stroke={pale} strokeWidth="6" />
  </Box>;
}

interface Look { bg: string; Icon: () => ReactNode; blurb: string }

// Worked out from the name staff give a set, so a set re-added in /admin keeps its picture.
const SET_A: Look = { bg: '#f8edc9', Icon: StandBag, blurb: 'Newer clubs & more variety.' };
const SET_B: Look = { bg: '#dcebc6', Icon: ThreeClubs, blurb: 'A standard set for your round.' };
const PREMIUM: Look = { ...SET_A, blurb: 'Our best clubs for your round.' };

function lookOf(rental: Pick<Rental, 'label' | 'group'>): Look {
  const letter = rentalSetLetter(rental.label);
  const look = letter ? (letter === 'A' ? SET_A : SET_B) : /premium/i.test(rental.label) ? PREMIUM : SET_B;
  return /premium/i.test(rental.group ?? '') ? { ...look, blurb: PREMIUM.blurb } : look;
}

export function RentalVisual({ rental, height = 148 }: { rental: Pick<Rental, 'label' | 'image' | 'group'>; height?: number | { xs: number; md: number } }) {
  const { bg, Icon } = lookOf(rental);
  return <Box sx={{ bgcolor: bg, borderRadius: '18px', height, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
    {rental.image ? <Box component="img" src={rental.image} alt={rental.label} loading="lazy" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Icon />}
  </Box>;
}

const BESIDE = { xs: '80px minmax(0,1fr)', sm: '96px minmax(0,1fr)' };

type Control = (rental: Rental, label: ReactNode) => ReactNode;

// One set: its picture and words, then its price with room for a stepper
// beside it, even on the narrowest phones.
function RentalItem({ rental, compact, control }: { rental: Rental; compact: boolean; control?: Control }) {
  const price = <Stack direction="row" flexWrap="wrap" alignItems="baseline" columnGap={.75}>
    <Typography component="span" sx={{ fontSize: 16, fontWeight: 800, color: 'primary.main', whiteSpace: 'nowrap' }}>{money(rental.price)}</Typography>
    <Typography component="span" sx={{ fontSize: 13, color: 'text.secondary', whiteSpace: 'nowrap' }}>per set</Typography>
  </Stack>;
  return <Box sx={{ display: 'grid', gridTemplateColumns: compact ? '64px minmax(0,1fr)' : { ...BESIDE, md: 'minmax(0,1fr)' }, alignContent: 'start', columnGap: compact ? 1.5 : 2, rowGap: 1.25, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '20px', p: compact ? 1.5 : 2, minWidth: 0 }}>
    <RentalVisual rental={rental} height={compact ? 64 : { xs: 96, md: 172 }} />
    <Box sx={{ minWidth: 0, alignSelf: 'center' }}>
      <Typography sx={{ fontWeight: 700, fontSize: compact ? 16 : 17, lineHeight: 1.25 }}>{rental.label}</Typography>
      <Typography sx={{ fontSize: 13, lineHeight: 1.4, color: 'text.secondary', mt: .25 }}>{rental.description || lookOf(rental).blurb}</Typography>
    </Box>
    <Box sx={{ gridColumn: '1 / -1', minWidth: 0, pt: control ? .75 : 1, borderTop: '1px solid', borderColor: 'divider' }}>
      {control ? control(rental, price) : price}
    </Box>
  </Box>;
}

/** The rentals under their group headings (Premium, Normal…), each group's sets side by side where there's room. */
export function RentalSets({ rentals, compact = false, control }: { rentals: Rental[]; compact?: boolean; control?: Control }) {
  return <Stack spacing={compact ? 2.25 : 4}>
    {groupRentals(rentals).map((group) => <Box key={group.id} component="section" aria-label={group.name || undefined}>
      {group.name && <Stack direction="row" alignItems="center" spacing={.5} sx={{ mb: compact ? 1 : 1.5 }}>
        {/premium/i.test(group.name) && <StarRounded aria-hidden sx={{ fontSize: compact ? 19 : 24, color: '#d9a521' }} />}
        <Typography component="h3" sx={{ fontFamily: fonts.playful, fontSize: compact ? 20 : 26, lineHeight: 1.2 }}>{group.name}</Typography>
      </Stack>}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0,1fr)', sm: 'repeat(2, minmax(0,1fr))', ...(!compact && { md: `repeat(${Math.max(2, Math.min(group.rentals.length, 3))}, minmax(0,1fr))` }) }, gap: compact ? 1.25 : { xs: 2, md: 3 } }}>
        {group.rentals.map((rental) => <RentalItem key={rental.id} rental={rental} compact={compact} control={control} />)}
      </Box>
    </Box>)}
  </Stack>;
}
