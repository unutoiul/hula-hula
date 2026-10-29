import AddPhotoAlternateRounded from '@mui/icons-material/AddPhotoAlternateRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import CloudUploadRounded from '@mui/icons-material/CloudUploadRounded';
import { Alert, Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Stack, Tab, Tabs, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState, type ChangeEvent } from 'react';
import { ClubPhoto } from '../components/common/ClubPhoto';
import { photoAssets } from '../data/photos';
import { supabase } from './supabase';

const BUCKET = 'club-images';
const LIBRARY = Object.values(photoAssets).map((p) => p.src);
const MAX_SIDE = 1920;

// Shrinks a phone photo before it's uploaded: at most 1920 px on its longest
// side, as WebP — a few hundred KB instead of several MB, so pages stay fast.
async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = Object.assign(document.createElement('canvas'), { width: Math.round(bitmap.width * scale), height: Math.round(bitmap.height * scale) });
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not read that photo'))), 'image/webp', 0.82));
}

// Photos for an event cover or an activity card: chosen from the club's own
// photo library (already sized for the web) or uploaded from the phone.
// `max` 1 keeps a single photo; more lets staff build a small gallery.
export function ImagePicker({ value, onChange, max = 1, label = 'Photo' }: { value: string[]; onChange: (images: string[]) => void; max?: number; label?: string }) {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down('sm'));
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const add = (src: string) => { onChange(max === 1 ? [src] : [...value.filter((v) => v !== src), src].slice(0, max)); setOpen(false); };

  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true); setError(null);
    try {
      const blob = await shrink(file);
      const path = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}.webp`;
      const { error: uploadError } = await supabase!.storage.from(BUCKET).upload(path, blob, { contentType: 'image/webp', cacheControl: '31536000' });
      if (uploadError) throw uploadError;
      add(supabase!.storage.from(BUCKET).getPublicUrl(path).data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'That photo couldn’t be uploaded.');
    }
    setBusy(false);
  };

  return <Box>
    <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 1 }}>{label}{max > 1 ? ` (up to ${max}; the first one leads)` : ''}</Typography>
    <Stack direction="row" flexWrap="wrap" useFlexGap gap={1.25}>
      {value.map((src, i) => <Box key={src} sx={{ position: 'relative', width: 116, height: 84, borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
        <ClubPhoto image={src} alt={`Photo ${i + 1}`} sizes="120px" />
        <IconButton aria-label={`Remove photo ${i + 1}`} size="small" onClick={() => onChange(value.filter((v) => v !== src))} sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,.9)', '&:hover': { bgcolor: 'white' } }}><CloseRounded sx={{ fontSize: 16 }} /></IconButton>
      </Box>)}
      {value.length < max && <Button variant="outlined" onClick={() => setOpen(true)} startIcon={<AddPhotoAlternateRounded />} sx={{ height: 84, borderStyle: 'dashed', borderRadius: '12px', minWidth: 116 }}>{value.length ? 'Add' : 'Choose'}</Button>}
    </Stack>

    <Dialog open={open} onClose={() => setOpen(false)} fullScreen={phone} fullWidth maxWidth="md">
      <DialogTitle sx={{ pr: 7 }}>Choose a photo<IconButton aria-label="Close" onClick={() => setOpen(false)} sx={{ position: 'absolute', right: 12, top: 12 }}><CloseRounded /></IconButton></DialogTitle>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}><Tab label="Club photos" /><Tab label="Upload" /></Tabs>
      <DialogContent dividers>
        {tab === 0 ? <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 1.25 }}>
          {LIBRARY.map((src) => <Box key={src} component="button" type="button" onClick={() => add(src)} aria-label="Use this photo" sx={{ p: 0, border: '2px solid', borderColor: value.includes(src) ? 'primary.main' : 'transparent', borderRadius: '12px', overflow: 'hidden', aspectRatio: '4 / 3', cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}>
            <ClubPhoto image={src} alt="" sizes="(max-width: 600px) 45vw, 220px" />
          </Box>)}
        </Box>
          : <Stack alignItems="center" spacing={2} sx={{ py: 5, textAlign: 'center' }}>
            <CloudUploadRounded sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography sx={{ color: 'text.secondary', maxWidth: 360 }}>A JPG, PNG or WebP from your phone or computer. It’s resized for the web automatically.</Typography>
            <Button component="label" variant="contained" disabled={busy} startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <AddPhotoAlternateRounded />}>
              {busy ? 'Uploading…' : 'Pick a photo'}
              <input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => void upload(e)} />
            </Button>
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>}
      </DialogContent>
    </Dialog>
  </Box>;
}
