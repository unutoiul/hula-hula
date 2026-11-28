import AddPhotoAlternateRounded from '@mui/icons-material/AddPhotoAlternateRounded';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import CloseRounded from '@mui/icons-material/CloseRounded';
import CollectionsRounded from '@mui/icons-material/CollectionsRounded';
import VideoCallRounded from '@mui/icons-material/VideoCallRounded';
import YouTube from '@mui/icons-material/YouTube';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useRef, useState } from 'react';
import { MediaThumb, youTubeId } from '../components/common/EventMedia';
import { photoAssets, photoByUrl } from '../data/photos';
import { CONTENT_BUCKET, supabase } from './supabase';

// An event's extra photos and videos: photos uploaded several at a time
// (shrunk in the browser to a 1600px WebP first), the resort's own photos,
// video files (MP4/WebM/MOV, uploaded as they are, up to 50 MB — the storage
// bucket's limit, see supabase/migrations/0008_event_gallery.sql) and YouTube
// links for anything bigger. Saved as one list; the first one shows first.

const MAX_SIDE = 1600;
const MAX_ITEMS = 30;
const MAX_VIDEO_MB = 50;
const VIDEO_TYPES: Record<string, string> = { 'video/mp4': 'mp4', 'video/webm': 'webm', 'video/quicktime': 'mov' };

const thumbOf = (src: string) => photoByUrl.get(src)?.srcSet.split(',')[0].trim().split(' ')[0] ?? src;

async function shrink(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not convert the image'))), 'image/webp', 0.82),
  );
}

/** The video's extension from its type, or its name (some phones send no type). */
function videoExtension(file: File): string | null {
  const fromType = VIDEO_TYPES[file.type];
  if (fromType) return fromType;
  const fromName = /\.(mp4|m4v|webm|mov)$/i.exec(file.name)?.[1].toLowerCase();
  return fromName === 'm4v' ? 'mp4' : (fromName ?? null);
}

export function MediaField({
  label,
  helper,
  value,
  onChange,
  folder,
}: {
  label: string;
  helper?: string;
  value: string[];
  onChange: (next: string[]) => void;
  folder: string;
}) {
  const photosInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [linking, setLinking] = useState(false);
  const [link, setLink] = useState('');
  const room = MAX_ITEMS - value.length;

  const store = async (body: Blob, extension: string, contentType: string) => {
    const path = `${folder}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase!.storage
      .from(CONTENT_BUCKET)
      .upload(path, body, { contentType, cacheControl: '31536000' });
    if (uploadError) throw uploadError;
    return supabase!.storage.from(CONTENT_BUCKET).getPublicUrl(path).data.publicUrl;
  };

  const uploadPhotos = async (files: File[]) => {
    if (!files.length || !supabase) return;
    setError(null);
    const added: string[] = [];
    try {
      for (const [i, file] of files.slice(0, room).entries()) {
        setBusy(files.length > 1 ? `Uploading ${i + 1} of ${Math.min(files.length, room)}…` : 'Uploading…');
        added.push(await store(await shrink(file), 'webp', 'image/webp'));
      }
      if (files.length > room) setError(`Only ${MAX_ITEMS} photos and videos fit — the last ${files.length - room} weren’t added.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      if (added.length) onChange([...value, ...added]);
      setBusy(null);
      if (photosInput.current) photosInput.current.value = '';
    }
  };

  const uploadVideo = async (file: File | undefined) => {
    if (!file || !supabase) return;
    setError(null);
    const extension = videoExtension(file);
    if (!extension) {
      setError('That file isn’t a video we can play on the website. Use an MP4 (or WebM / MOV).');
      return;
    }
    const megabytes = file.size / 1024 / 1024;
    if (megabytes > MAX_VIDEO_MB) {
      setError(
        `That video is ${Math.round(megabytes)} MB — the limit is ${MAX_VIDEO_MB} MB. Trim it or send it in a smaller size, or put it on YouTube and add the link instead.`,
      );
      if (videoInput.current) videoInput.current.value = '';
      return;
    }
    setBusy(`Uploading the video (${Math.round(megabytes)} MB)…`);
    try {
      onChange([...value, await store(file, extension, file.type || `video/${extension === 'mov' ? 'quicktime' : extension}`)]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(null);
      if (videoInput.current) videoInput.current.value = '';
    }
  };

  const addLink = () => {
    const id = youTubeId(link.trim());
    if (!id) {
      setError('That doesn’t look like a YouTube link. Copy it from the Share button on YouTube.');
      return;
    }
    onChange([...value, `https://www.youtube.com/watch?v=${id}`]);
    setLink('');
    setLinking(false);
    setError(null);
  };

  const moveEarlier = (i: number) => onChange(value.map((src, j) => (j === i - 1 ? value[i] : j === i ? value[i - 1] : src)));

  return (
    <Box>
      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{label}</Typography>
      {helper && <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>{helper}</Typography>}
      {value.length > 0 && (
        <Stack direction="row" flexWrap="wrap" useFlexGap gap={1.5} sx={{ mt: 1 }}>
          {value.map((src, i) => (
            <Box
              key={`${src}-${i}`}
              sx={{
                position: 'relative',
                width: 120,
                height: 90,
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <MediaThumb src={thumbOf(src)} alt="" sizes="120px" badgeSize={30} />
              {i > 0 && (
                <IconButton
                  size="small"
                  aria-label={`Move ${i + 1} earlier`}
                  onClick={() => moveEarlier(i)}
                  sx={{ position: 'absolute', top: 4, left: 4, bgcolor: 'rgba(255,255,255,.9)', '&:hover': { bgcolor: 'white' } }}
                >
                  <ChevronLeft sx={{ fontSize: 16 }} />
                </IconButton>
              )}
              <IconButton
                size="small"
                aria-label={`Remove ${i + 1}`}
                onClick={() => onChange(value.filter((_, j) => j !== i))}
                sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'rgba(255,255,255,.9)', '&:hover': { bgcolor: 'white' } }}
              >
                <CloseRounded sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}
      {room > 0 && (
        <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ mt: 1.5 }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={busy ? <CircularProgress size={14} /> : <AddPhotoAlternateRounded />}
            disabled={!!busy}
            onClick={() => photosInput.current?.click()}
          >
            Upload photos
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<VideoCallRounded />}
            disabled={!!busy}
            onClick={() => videoInput.current?.click()}
          >
            Upload a video
          </Button>
          <Button size="small" startIcon={<YouTube />} disabled={!!busy} onClick={() => setLinking((open) => !open)}>
            YouTube link
          </Button>
          <Button size="small" startIcon={<CollectionsRounded />} disabled={!!busy} onClick={() => setPicking(true)}>
            Resort photos
          </Button>
          <input
            ref={photosInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => void uploadPhotos([...(e.target.files ?? [])])}
          />
          <input
            ref={videoInput}
            type="file"
            accept="video/mp4,video/webm,video/quicktime,.mp4,.m4v,.webm,.mov"
            hidden
            onChange={(e) => void uploadVideo(e.target.files?.[0])}
          />
        </Stack>
      )}
      {busy && <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1 }}>{busy}</Typography>}
      {linking && (
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            autoFocus
            label="YouTube link"
            placeholder="https://youtu.be/…"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLink();
              }
            }}
          />
          <Button variant="contained" onClick={addLink} disabled={!link.trim()}>
            Add
          </Button>
        </Stack>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 1 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Dialog open={picking} onClose={() => setPicking(false)} maxWidth="md" fullWidth>
        <DialogTitle>Choose a resort photo</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 1.5 }}>
            {Object.entries(photoAssets).map(([name, photo]) => (
              <Box
                key={name}
                component="button"
                type="button"
                onClick={() => {
                  onChange([...value, photo.src]);
                  setPicking(false);
                }}
                sx={{
                  p: 0,
                  border: '2px solid transparent',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  bgcolor: 'transparent',
                  '&:hover, &:focus-visible': { borderColor: 'primary.main' },
                }}
              >
                <Box
                  component="img"
                  src={thumbOf(photo.src)}
                  alt={name}
                  loading="lazy"
                  sx={{ display: 'block', width: '100%', aspectRatio: '4 / 3', objectFit: 'cover' }}
                />
              </Box>
            ))}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
