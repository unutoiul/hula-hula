import { Box } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';

const HERO_VIDEO_SRC = '/video/hero.mp4';
// The video's own first frame, so nothing jumps when playback starts.
const HERO_POSTER_SRC = '/video/hero-poster.webp';

// The resort film from the original site, filling the hero frame on its own —
// no captions or buttons over it, so the visuals get full attention. Muted,
// looping and inline so browsers allow autoplay; it holds still while motion
// is paused (the header toggle or the OS reduced-motion setting).
export function HeroVideo() {
  const { reduced } = useMotionPreference();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduced) video.pause();
    else video.play().catch(() => { /* Autoplay refused (e.g. data saver): the poster stays up. */ });
  }, [reduced]);

  // disablePictureInPicture / disableRemotePlayback also stop browsers from
  // laying their own pop-out or cast buttons over it.
  return <Box component="video" ref={videoRef} aria-hidden muted loop playsInline autoPlay={!reduced} disablePictureInPicture disableRemotePlayback
    preload={reduced ? 'metadata' : 'auto'} poster={HERO_POSTER_SRC} src={HERO_VIDEO_SRC}
    sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />;
}
