import { Box, type SxProps, type Theme } from '@mui/material';
import { photoByUrl } from '../../data/photos';

export function ClubPhoto({ image, alt, sizes = '(max-width: 600px) 100vw, 50vw', eager = false, sx }: {
  image: string; alt: string; sizes?: string; eager?: boolean; sx?: SxProps<Theme>;
}) {
  const photo = photoByUrl.get(image);
  const img = <Box component="img" src={image} srcSet={photo?.srcSet} sizes={sizes} alt={alt}
    width={photo?.width} height={photo?.height} loading={eager ? 'eager' : 'lazy'} decoding="async" fetchPriority={eager ? 'high' : 'auto'}
    sx={[{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]} />;
  if (!photo) return img;
  // AVIF for browsers that support it (about half the bytes), WebP otherwise.
  // display: contents keeps <picture> out of layout, so the img sizes itself
  // against the same parent as before.
  return <Box component="picture" sx={{ display: 'contents' }}>
    <source type="image/avif" srcSet={photo.avifSrcSet} sizes={sizes} />
    {img}
  </Box>;
}
