import { Box, type SxProps, type Theme } from '@mui/material';
import { artworkAssets } from './artworkAssets';

/**
 * A piece of the homepage artwork (frames, badges, mascot) as a <picture>:
 * AVIF where the browser takes it, WebP otherwise, at the width the layout
 * needs (scripts/prepare-artwork.py makes the copies). Artwork without
 * copies falls back to a plain <img> of the original.
 */
export function ArtPicture({ image, sizes, alt = '', eager = false, sx }: {
  image: string; sizes: string; alt?: string; eager?: boolean; sx?: SxProps<Theme>;
}) {
  const asset = artworkAssets[image];
  const img = <Box component="img" src={asset?.src ?? image} srcSet={asset?.srcSet} sizes={asset ? sizes : undefined} alt={alt} aria-hidden={alt ? undefined : true}
    width={asset?.width} height={asset?.height} loading={eager ? 'eager' : 'lazy'} fetchPriority={eager ? 'high' : 'auto'} decoding="async" draggable={false} sx={sx} />;
  if (!asset) return img;
  // display: contents keeps <picture> out of layout, so the img sizes itself
  // against the same parent as before.
  return <Box component="picture" sx={{ display: 'contents' }}>
    <source type="image/avif" srcSet={asset.avifSrcSet} sizes={sizes} />
    {img}
  </Box>;
}
