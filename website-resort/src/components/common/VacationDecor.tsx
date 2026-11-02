import { Box, Typography, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';
import { fonts } from '../../theme';
import { ResortPhoto } from './ResortPhoto';

export function SunDoodle({ size = 96, color = 'currentColor', sx }: { size?: number; color?: string; sx?: SxProps<Theme> }) {
  return <Box component="svg" aria-hidden="true" viewBox="0 0 100 100" sx={[{ width: size, height: size, color, flexShrink: 0 }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
    <g fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
      <circle cx="50" cy="50" r="26" />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d="M50 5 L50 14" transform={`rotate(${i * 30} 50 50)`} />)}
      <path d="M38 48v3 M61 48v3 M39 59q11 12 23-1" />
    </g>
  </Box>;
}

export function Sticker({ children, color = '#f9f70c', rotate = -7, sx }: { children: ReactNode; color?: string; rotate?: number; sx?: SxProps<Theme> }) {
  return <Box sx={[{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', bgcolor: color, color: '#173c2c', border: '3px solid #fffef8', borderRadius: '50%', width: 116, height: 116, px: 1.5, fontFamily: fonts.playful, fontWeight: 500, fontSize: 21, textAlign: 'center', lineHeight: 1.1, transform: `rotate(${rotate}deg)`, boxShadow: '0 5px 0 rgba(23,60,44,.09)', '&::after': { content: '""', position: 'absolute', inset: 6, border: '1px dashed rgba(23,60,44,.22)', borderRadius: 'inherit', pointerEvents: 'none' } }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>{children}</Box>;
}

// The instant-photo card used for "Make a splash!" and "A very good morning.":
// an even white border, a softly rounded photo, and the caption centred in
// its own strip below — so the photo never pokes into the card's corners and
// the caption never crowds the edge. It fills whatever box it's placed in.
export function Polaroid({ image, alt, caption, rotate = 0, sizes, objectPosition }: { image: string; alt: string; caption: string; rotate?: number; sizes: string; objectPosition?: string }) {
  return <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'background.paper', p: { xs: 1, md: 1.25 }, pb: 0, borderRadius: '10px', boxShadow: '0 14px 32px rgba(23,60,44,.18)', transform: `rotate(${rotate}deg)` }}>
    <Box sx={{ flex: 1, minHeight: 0, borderRadius: '6px', overflow: 'hidden' }}>
      <ResortPhoto image={image} alt={alt} sizes={sizes} sx={{ objectPosition }} />
    </Box>
    <Typography sx={{ fontFamily: fonts.playful, textAlign: 'center', whiteSpace: 'nowrap', fontSize: { xs: 14, md: 18 }, lineHeight: 1.1, py: { xs: 1.1, md: 1.5 } }}>{caption}</Typography>
  </Box>;
}
