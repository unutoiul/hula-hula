import { Box } from '@mui/material';
import { AnimatePresence, motion, useSpring, type MotionValue } from 'motion/react';
import { useEffect, useState } from 'react';
import { fonts } from '../../theme';
import { MotionBox } from '../common/motionPrimitives';

const MESSAGES = ['Filling the pool', 'Slicing pineapples', 'Fluffing the towels', 'Finding your sunnies'];

// What the hero frame shows while the resort video buffers, over a softly
// blurred poster: a swim ring spinning on spreading pool ripples (after
// Motion's "Loading ripple"), a message whose letters bob like a wave
// ("Split text: wavy") with jumping dots, and a bar that fills with how much
// of the video has actually downloaded ("Loading progress bar"). Rendered by
// HeroVideo only until the video starts playing.
export function HeroVideoLoader({ progress }: { progress: MotionValue<number> }) {
  const [message, setMessage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setMessage((m) => (m + 1) % MESSAGES.length), 1800);
    return () => clearInterval(id);
  }, []);
  const filled = useSpring(progress, { stiffness: 120, damping: 24 });

  return <MotionBox aria-hidden
    // Fades in only if loading takes a moment, so a cached video never flashes it.
    initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.35, duration: 0.4 } }} exit={{ opacity: 0, transition: { duration: 0.6 } }}
    sx={{
      position: 'absolute', inset: 0, zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2.5,
      pb: { xs: 12, sm: 8, md: 4 }, // sits a little high, clear of the "Make a splash!" polaroid
      background: 'radial-gradient(circle at 50% 45%, rgba(16,41,31,.18), rgba(16,41,31,.55))', backdropFilter: 'blur(4px)', color: 'white',
    }}>
    <Box sx={{ position: 'relative', width: 150, height: 150, display: 'grid', placeItems: 'center' }}>
      {[0, 1, 2].map((i) => <MotionBox key={i}
        animate={{ scale: [0.35, 1.25], opacity: [0.75, 0] }}
        transition={{ duration: 2.4, delay: i * 0.8, repeat: Infinity, ease: 'easeOut' }}
        sx={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2px solid rgba(255,255,255,.85)' }} />)}
      <MotionBox animate={{ y: [0, -7, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }} sx={{ filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.25))' }}>
        <MotionBox animate={{ rotate: 360 }} transition={{ duration: 3.2, repeat: Infinity, ease: 'linear' }} sx={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'conic-gradient(#f9f70c 0 25%, #fff 0 50%, #f9f70c 0 75%, #fff 0)',
          mask: 'radial-gradient(circle, transparent 40%, #000 41%)', WebkitMask: 'radial-gradient(circle, transparent 40%, #000 41%)',
        }} />
      </MotionBox>
    </Box>

    <Box sx={{ height: 30, display: 'flex', alignItems: 'center', fontFamily: fonts.playful, fontSize: { xs: 18, md: 21 }, textShadow: '0 2px 10px rgba(0,0,0,.3)' }}>
      <AnimatePresence mode="wait">
        <motion.span key={MESSAGES[message]} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} style={{ display: 'inline-flex', whiteSpace: 'pre' }}>
          {[...MESSAGES[message]].map((char, i) => <motion.span key={i} style={{ display: 'inline-block' }}
            animate={{ y: [0, -5, 0] }} transition={{ duration: 1.2, delay: i * 0.05, repeat: Infinity, ease: 'easeInOut' }}>{char}</motion.span>)}
        </motion.span>
      </AnimatePresence>
      <Box component="span" sx={{ display: 'inline-flex', gap: '3px', ml: '4px', alignSelf: 'flex-end', mb: '7px' }}>
        {[0, 1, 2].map((i) => <MotionBox key={i} animate={{ y: [0, -6, 0] }} transition={{ duration: 0.7, delay: i * 0.12, repeat: Infinity, ease: 'easeInOut' }}
          sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'secondary.main' }} />)}
      </Box>
    </Box>

    <Box sx={{ width: 150, height: 5, borderRadius: 3, overflow: 'hidden', bgcolor: 'rgba(255,255,255,.28)' }}>
      <MotionBox style={{ scaleX: filled, originX: 0 }} sx={{ height: '100%', bgcolor: 'secondary.main' }} />
    </Box>
  </MotionBox>;
}
