import { AnimatePresence, motion, useInView, type Variants } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';

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

  return <h1 className="story-headline" id="royal-hero-title" ref={ref}>
    <span className="story-sr-only">European charm. Thai heart. Royal Pineapple Hotel, Krabi.</span>
    <span aria-hidden="true">
      <span className="story-headline-static">European<br />charm.</span>
      <span className="story-headline-ending">
        {reduced ? <span>{endings[index]}</span> : <AnimatePresence initial={false} mode="wait">
          <motion.span key={index} className="story-headline-word" variants={word} initial="enter" animate="center" exit="exit">
            {[...endings[index]].map((character, i) => <motion.span key={i} variants={letter}>{character === ' ' ? '\u00a0' : character}</motion.span>)}
          </motion.span>
        </AnimatePresence>}
        <svg className="story-headline-underline" viewBox="0 0 350 16" fill="none" preserveAspectRatio="none"><motion.path d="M4 11C84 2 220 1 345 7M24 14C125 7 227 8 313 11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: reduced ? 0 : 1.1, delay: reduced ? 0 : .5 }} /></svg>
      </span>
    </span>
  </h1>;
}
