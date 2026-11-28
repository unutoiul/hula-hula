import { Box, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

/** A quiet paper-and-ink frame for photographs, with room for the subject. */
export function PostcardFrame({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Box
      className="simple-postcard-frame"
      sx={[
        {
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minWidth: 0,
          aspectRatio: '16 / 10',
          p: { xs: '9px', sm: '12px' },
          borderRadius: '20px',
          border: '1px solid #c783a0',
          bgcolor: '#fff9f2',
          boxShadow: '0 12px 28px rgba(42,13,33,.12)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 4,
            border: '1px solid #e9bacd',
            borderRadius: '16px',
            pointerEvents: 'none',
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box sx={{ position: 'relative', flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden', borderRadius: '10px' }}>{children}</Box>
    </Box>
  );
}
