import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { Box, IconButton, Popover, Typography } from '@mui/material';
import { useState, type ReactNode } from 'react';

// An (i) next to a heading that opens the instructions for that screen, so
// staff who know the ropes don't have to read them every time. A click
// popover rather than a hover tooltip, so it works on phones too.
export function InfoButton({ label, children }: { label: string; children: ReactNode }) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return <>
    <IconButton size="small" aria-label={label} onClick={(e) => setAnchor(e.currentTarget)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
      <InfoOutlined sx={{ fontSize: 20 }} />
    </IconButton>
    <Popover open={!!anchor} anchorEl={anchor} onClose={() => setAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      slotProps={{ paper: { sx: { p: 2, maxWidth: 'min(380px, calc(100vw - 32px))', borderRadius: '14px', border: '1px solid', borderColor: 'divider', boxShadow: '0 16px 36px rgba(23,60,44,.12)' } } }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, mb: .75 }}>{label}</Typography>
      <Box sx={{ fontSize: 13, lineHeight: 1.6, color: 'text.secondary', '& p': { m: 0 }, '& p + p': { mt: 1 } }}>{children}</Box>
    </Popover>
  </>;
}
