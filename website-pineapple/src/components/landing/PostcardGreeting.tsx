import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { BadgePicture } from './BadgePicture';

/** A transparent frame keeps the greeting clear of every carousel photo. */
export function PostcardGreeting({ children, label }: { children: ReactNode; label: string }) {
  return (
    <BadgePicture
      frameName="greeting-postcard"
      label={`Greetings from... ${label}`}
      sizes="(max-width: 900px) 94vw, 50vw"
      eager
      shadow="0 12px 18px #5a244821"
    >
      <Box sx={{ position: 'absolute', inset: 0, filter: 'sepia(.08) saturate(.94) contrast(.98)' }}>{children}</Box>
      <Box
        aria-hidden="true"
        sx={{ position: 'absolute', inset: 0, bgcolor: '#f8dfb2', opacity: 0.16, mixBlendMode: 'soft-light', pointerEvents: 'none' }}
      />
    </BadgePicture>
  );
}
