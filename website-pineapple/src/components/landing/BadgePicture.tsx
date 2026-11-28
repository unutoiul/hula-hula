import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { ArtPicture } from './ArtPicture';
import { badgeFrames, type BadgeFrameName } from './badgeFrames';

/**
 * A fixed decorative frame with its picture/content behind the frame's alpha
 * mask. `shadow` is the drop shadow around the whole cut-out shape; `sizes`
 * is how wide the frame shows (the img sizes attribute), so phones get a
 * small copy of the frame artwork.
 */
export function BadgePicture({
  frameName,
  children,
  label,
  sizes,
  eager = false,
  shadow = '0 12px 18px #5a24481c',
}: {
  frameName: BadgeFrameName;
  children: ReactNode;
  label?: string;
  sizes: string;
  eager?: boolean;
  shadow?: string;
}) {
  const frame = badgeFrames[frameName];
  const mask = `url("${frame.mask}")`;
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: `${frame.width} / ${frame.height}`,
        isolation: 'isolate',
        filter: `drop-shadow(${shadow})`,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          maskImage: mask,
          WebkitMaskImage: mask,
          maskSize: '100% 100%',
          WebkitMaskSize: '100% 100%',
          maskRepeat: 'no-repeat',
          WebkitMaskRepeat: 'no-repeat',
          maskMode: 'alpha',
        }}
      >
        <Box
          role={label ? 'img' : undefined}
          aria-label={label}
          sx={{
            position: 'absolute',
            left: `${frame.window.left}%`,
            top: `${frame.window.top}%`,
            width: `${frame.window.width}%`,
            height: `${frame.window.height}%`,
            overflow: 'hidden',
            isolation: 'isolate',
            bgcolor: '#ead5c6',
          }}
        >
          {children}
        </Box>
      </Box>
      <ArtPicture
        image={frame.image}
        sizes={sizes}
        eager={eager}
        sx={{
          position: 'absolute',
          zIndex: 2,
          inset: 0,
          display: 'block',
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
    </Box>
  );
}
