import CloseRounded from '@mui/icons-material/CloseRounded';
import DownloadRounded from '@mui/icons-material/DownloadRounded';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useId } from 'react';
import type { PostcardArtwork } from './artwork';

export function PostcardDialog({ postcard, onClose }: { postcard: PostcardArtwork | null; onClose: () => void }) {
  const titleId = useId();
  return <Dialog open={postcard !== null} onClose={onClose} maxWidth="md" fullWidth aria-labelledby={titleId}>
    <DialogTitle id={titleId} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}><img src="/logo/royal-pineapple.svg" width={47} height={40} alt="" aria-hidden="true" /><span style={{ flex: 1 }}>{postcard?.title}</span><IconButton onClick={onClose} aria-label="Close postcard"><CloseRounded /></IconButton></DialogTitle>
    <DialogContent>{postcard && <img src={postcard.fullImage} alt={postcard.alt} width={postcard.width} height={postcard.height} style={{ display: 'block', width: '100%', height: 'auto', maxHeight: '70vh', objectFit: 'contain' }} />}</DialogContent>
    <DialogActions sx={{ px: 3, pb: 3 }}>{postcard && <Button component="a" href={postcard.fullImage} download={`royal-pineapple-${postcard.id}.webp`} variant="contained" startIcon={<DownloadRounded />}>Save postcard</Button>}</DialogActions>
  </Dialog>;
}
