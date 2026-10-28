import AddPhotoAlternateRounded from '@mui/icons-material/AddPhotoAlternateRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import CollectionsRounded from '@mui/icons-material/CollectionsRounded';
import { Alert, Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import { useRef, useState } from 'react';
import { photoAssets, photoByUrl } from '../data/photos';
import { CONTENT_BUCKET, supabase } from './supabase';

// Pictures for a CMS item: either one of the resort's own photos (already
// optimised, with responsive versions) or an upload — shrunk in the browser to
// a 1600px WebP first, so a phone photo doesn't become a 10 MB download.

const MAX_SIDE = 1600;
// A resort photo's smallest (480px) version for thumbnails; uploads as they are.
const thumbOf = (src: string) => photoByUrl.get(src)?.srcSet.split(',')[0].trim().split(' ')[0] ?? src;

async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not convert the image'))), 'image/webp', 0.82));
}

export function ImageField({ label, value, onChange, multiple, folder }: { label: string; value: string[]; onChange: (next: string[]) => void; multiple: boolean; folder: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const add = (src: string) => onChange(multiple ? [...value, src] : [src]);

  const upload = async (file: File | undefined) => {
    if (!file || !supabase) return;
    setBusy(true); setError(null);
    try {
      const blob = await shrink(file);
      const path = `${folder}/${crypto.randomUUID()}.webp`;
      const { error: uploadError } = await supabase.storage.from(CONTENT_BUCKET).upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000' });
      if (uploadError) throw uploadError;
      add(supabase.storage.from(CONTENT_BUCKET).getPublicUrl(path).data.publicUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return <Box>
    <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>{label}</Typography>
    <Stack direction="row" flexWrap="wrap" useFlexGap gap={1.5}>
      {value.map((src, i) => <Box key={`${src}-${i}`} sx={{ position: 'relative', width: 120, height: 90, borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <Box component="img" src={thumbOf(src)} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <IconButton size="small" aria-label="Remove picture" onClick={() => onChange(value.filter((_, j) => j !== i))} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,.9)', '&:hover': { bgcolor: 'white' } }}><CloseRounded sx={{ fontSize: 16 }} /></IconButton>
      </Box>)}
    </Stack>
    {(multiple || value.length === 0) && <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
      <Button size="small" variant="outlined" startIcon={busy ? <CircularProgress size={14} /> : <AddPhotoAlternateRounded />} disabled={busy} onClick={() => input.current?.click()}>Upload</Button>
      <Button size="small" startIcon={<CollectionsRounded />} onClick={() => setPicking(true)}>Resort photos</Button>
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => void upload(e.target.files?.[0])} />
    </Stack>}
    {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}

    <Dialog open={picking} onClose={() => setPicking(false)} maxWidth="md" fullWidth>
      <DialogTitle>Choose a resort photo</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1.5 }}>
          {Object.entries(photoAssets).map(([name, photo]) => <Box key={name} component="button" type="button" onClick={() => { add(photo.src); setPicking(false); }}
            sx={{ p: 0, border: '2px solid transparent', borderRadius: 2, overflow: 'hidden', cursor: 'pointer', bgcolor: 'transparent', '&:hover, &:focus-visible': { borderColor: 'primary.main' } }}>
            <Box component="img" src={thumbOf(photo.src)} alt={name} loading="lazy" sx={{ display: 'block', width: '100%', aspectRatio: '4 / 3', objectFit: 'cover' }} />
          </Box>)}
        </Box>
      </DialogContent>
    </Dialog>
  </Box>;
}
