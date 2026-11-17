import { Box } from '@mui/material';
import { AnimatePresence, motion, useInView, type Variants } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';
import { brand, fonts } from '../../theme';
import { visuallyHiddenSx } from './landingStyles';

const endings = ['Thai heart.', 'Pink pool days.', 'Krabi soul.'];
const word: Variants = {
  enter: {},
  center: { transition: { staggerChildren: .035 } },
  exit: { transition: { staggerChildren: .018 } },
};
const letter: Variants = {
  enter: { y: '.4em', opacity: 0, rotate: 7, filter: 'blur(6px)' },
  center: { y: 0, opacity: 1, rotate: 0, filter: 'blur(0px)', transition: { duration: .5, ease: [.22, 1, .36, 1] } },
  exit: { y: '-.3em', opacity: 0, filter: 'blur(4px)', transition: { duration: .2 } },
};

export function RoyalHeadline() {
  const { reduced } = useMotionPreference();
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { amount: .5 });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced || !inView) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setIndex(current => (current + 1) % endings.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [reduced, inView]);

  return <Box component="h1" id="royal-hero-title" ref={ref} sx={{
    m: 0, color: brand.plum, fontFamily: fonts.serif, fontWeight: 400, lineHeight: .99, letterSpacing: '-.055em',
    fontSize: { xs: 'clamp(52px, 15vw, 74px)', sm: '76px', md: 'clamp(59px, 6.2vw, 74px)', lg: 'clamp(62px, 6.1vw, 86px)' },
  }}>
    <Box component="span" sx={visuallyHiddenSx}>European charm. Thai heart. Royal Pineapple Hotel, Krabi.</Box>
    <span aria-hidden="true">
      {/* The line break keeps "charm." under "European" except on tablets, where the line is wide enough. */}
      <Box component="span" sx={{ display: 'block', '& > br': { display: { xs: 'initial', sm: 'none', md: 'initial' } } }}>European<br />charm.</Box>
      <Box component="span" sx={{
        display: 'block', position: 'relative', width: 'fit-content', maxWidth: '100%', mx: { xs: 'auto', md: 0 },
        minHeight: { xs: '1.45em', sm: '1.3em' }, mt: { xs: '8px', sm: '12px', md: '10px' }, pb: { xs: '15px', sm: '16px' },
        color: brand.royal, fontStyle: 'italic', fontSize: { xs: '.73em', sm: '.72em' }, lineHeight: 1.15, letterSpacing: '-.045em', whiteSpace: 'nowrap',
        '& > span, & > span > span': { display: 'inline-block' },
        '& > svg': { position: 'absolute', left: 0, bottom: 0, width: '100%', height: { xs: 11, sm: 14 }, color: '#eda4be', pointerEvents: 'none' },
      }}>
        {reduced ? <span>{endings[index]}</span> : <AnimatePresence initial={false} mode="wait">
          <motion.span key={index} variants={word} initial="enter" animate="center" exit="exit">
            {[...endings[index]].map((character, i) => <motion.span key={i} variants={letter}>{character === ' ' ? ' ' : character}</motion.span>)}
          </motion.span>
        </AnimatePresence>}
        <svg viewBox="0 0 350 16" fill="none" preserveAspectRatio="none"><motion.path d="M4 11C84 2 220 1 345 7M24 14C125 7 227 8 313 11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : 1.1, delay: reduced ? 0 : .5 }} /></svg>
      </Box>
    </span>
  </Box>;
}
