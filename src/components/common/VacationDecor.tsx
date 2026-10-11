import { Box, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';
import { fonts } from '../../theme';

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
  return <Box sx={[{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', bgcolor: color, color: '#173c2c', border: '3px solid #fbfdf4', borderRadius: '50%', width: 116, height: 116, px: 1.5, fontFamily: fonts.playful, fontWeight: 500, fontSize: 21, textAlign: 'center', lineHeight: 1.1, transform: `rotate(${rotate}deg)`, boxShadow: '0 5px 0 rgba(23,60,44,.09)' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>{children}</Box>;
}

export function WaveEdge({ fill = '#fbfdf4', flip = false }: { fill?: string; flip?: boolean }) {
  return <Box component="svg" aria-hidden="true" viewBox="0 0 1440 45" preserveAspectRatio="none" sx={{ display: 'block', width: '100%', height: { xs: 24, md: 42 }, transform: flip ? 'rotate(180deg)' : undefined }}>
    <path fill={fill} d="M0 22 Q120 0 240 22 T480 22 T720 22 T960 22 T1200 22 T1440 22 V45 H0Z" />
  </Box>;
}
