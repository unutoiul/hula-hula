import { Box } from '@mui/material';
import { AnimatePresence, useInView, useMotionValue } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';
import { HeroVideoLoader } from './HeroVideoLoader';

const HERO_VIDEO_SRC = '/video/hero.mp4';
// The video's own first frame, so nothing jumps when playback starts.
const HERO_POSTER_SRC = '/video/hero-poster.webp';

// The resort film from the original site, filling the hero frame on its own —
// no captions or buttons over it, so the visuals get full attention. Muted,
// looping and inline so browsers allow autoplay; it holds still while motion
// is paused (the header toggle or the OS reduced-motion setting), and while
// it's scrolled out of view so it isn't decoding frames nobody sees. Until it
// actually starts playing, HeroVideoLoader covers the poster.
export function HeroVideo() {
  const { reduced } = useMotionPreference();
  const videoRef = useRef<HTMLVideoElement>(null);
  const inView = useInView(videoRef);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);
  const buffered = useMotionValue(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduced || !inView) video.pause();
    // Autoplay refused (e.g. data saver / low-power mode): the poster stays up.
    else video.play().catch((error: DOMException) => { if (error.name === 'NotAllowedError') setFailed(true); });
  }, [reduced, inView]);

  const trackBuffer = () => {
    const video = videoRef.current;
    if (!video?.duration || !video.buffered.length) return;
    buffered.set(Math.min(1, video.buffered.end(video.buffered.length - 1) / video.duration));
  };

  return <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
    {/* disablePictureInPicture / disableRemotePlayback also stop browsers from
        laying their own pop-out or cast buttons over it. */}
    <Box component="video" ref={videoRef} aria-hidden muted loop playsInline autoPlay={!reduced} disablePictureInPicture disableRemotePlayback
      preload={reduced ? 'metadata' : 'auto'} poster={HERO_POSTER_SRC} src={HERO_VIDEO_SRC}
      onPlaying={() => setStarted(true)} onProgress={trackBuffer} onLoadedMetadata={trackBuffer} onError={() => setFailed(true)}
      sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
    <AnimatePresence>{!reduced && !started && !failed && <HeroVideoLoader key="loader" progress={buffered} />}</AnimatePresence>
  </Box>;
}
