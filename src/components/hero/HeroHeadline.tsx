import { Box, Typography } from '@mui/material';
import { AnimatePresence, motion, useInView, type Variants } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';

// "A little ___. / A lot of ___." — the two blanks rotate through these pairs.
// Kept short (≤ "pineapple." / "fun.") so no line ever wraps on a phone.
const MESSAGES: [string, string][] = [
  ['tropical.', 'fun.'],
  ['splashy.', 'sun.'],
  ['pineapple.', 'yum.'],
  ['barefoot.', 'joy.'],
];
const CYCLE_MS = 4200;

// Pixel strings on purpose: MUI reads a bare width/height of 1 as 100%.
const visuallyHidden = { position: 'absolute', width: '1px', height: '1px', m: '-1px', p: 0, border: 0, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' } as const;

// Letters drift up out of a soft blur, one after another, and leave the same
// way upwards — gentle enough to read as "breathing", not flashing.
const word: Variants = {
  enter: {},
  center: { transition: { staggerChildren: 0.035 } },
  exit: { transition: { staggerChildren: 0.02 } },
};
const letter: Variants = {
  enter: { y: '0.4em', opacity: 0, rotate: 8, filter: 'blur(8px)' },
  center: { y: 0, opacity: 1, rotate: 0, filter: 'blur(0px)', transition: { type: 'spring', stiffness: 220, damping: 20 } },
  exit: { y: '-0.3em', opacity: 0, filter: 'blur(6px)', transition: { duration: 0.22, ease: 'easeIn' } },
};

function SwapWord({ text, delay = 0 }: { text: string; delay?: number }) {
  return <AnimatePresence mode="wait" initial={false}>
    <motion.span key={text} variants={word} initial="enter" animate="center" exit="exit"
      transition={{ delayChildren: delay }} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
      {[...text].map((char, i) => <motion.span key={i} variants={letter} style={{ display: 'inline-block' }}>{char}</motion.span>)}
    </motion.span>
  </AnimatePresence>;
}

// The hero's big headline. Screen readers and search engines get the first
// message as plain text; the animated copy is aria-hidden. Cycling only runs
// while the headline is on screen and motion isn't paused (header toggle or
// OS reduced-motion), in which case it simply holds its current message.
export function HeroHeadline() {
  const { reduced } = useMotionPreference();
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { amount: 0.5 });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % MESSAGES.length), CYCLE_MS);
    return () => clearInterval(id);
  }, [reduced, inView]);

  const [little, lot] = MESSAGES[index];
  // Each line rises in once on page load, a beat apart.
  const line = (i: number) => reduced ? {} : {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay: 0.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  };

  return <Typography ref={ref} variant="h1" sx={{ fontSize: { xs: 'clamp(3.15rem, 12.5vw, 4.8rem)', md: 'clamp(4.8rem, 6.1vw, 6.6rem)' }, lineHeight: 1.02, color: 'primary.main', maxWidth: 680 }}>
    <Box component="span" sx={visuallyHidden}>A little {MESSAGES[0][0]} A lot of {MESSAGES[0][1]}</Box>
    <Box component="span" aria-hidden sx={{ display: 'block' }}>
      <motion.span {...line(0)} style={{ display: 'block' }}>A little</motion.span>
      <motion.span {...line(1)} style={{ display: 'block', whiteSpace: 'nowrap' }}><SwapWord text={little} /></motion.span>
      <motion.span {...line(2)} style={{ display: 'block', whiteSpace: 'nowrap' }}>
        <Box component="span" sx={{ position: 'relative', display: 'inline-block', color: 'text.primary', zIndex: 0 }}>
          A lot of <SwapWord text={lot} delay={0.18} />
          {/* The highlighter swipe: wipes off to the right as the old word
              leaves, then draws back in from the left under the new one. */}
          <AnimatePresence initial={false}>
            <motion.span key={lot} aria-hidden
              initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1, originX: 0, transition: { delay: reduced ? 0 : 0.55, duration: 0.6, ease: [0.65, 0, 0.35, 1] } }}
              exit={{ scaleX: 0, originX: 1, transition: { duration: 0.3, ease: 'easeIn' } }}
              style={{ position: 'absolute', left: -5, right: -8, bottom: 4, height: '28%', rotate: -2, zIndex: -1, borderRadius: '45% 25% 40% 30%', background: '#f9f70c' }} />
          </AnimatePresence>
        </Box>
      </motion.span>
    </Box>
  </Typography>;
}
