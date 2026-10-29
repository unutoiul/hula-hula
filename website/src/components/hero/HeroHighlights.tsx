import { Box, Button, ButtonBase, Link, Stack, Typography } from '@mui/material';
import { motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useMotionPreference } from '../../context/MotionPreferenceContext';
import { fonts } from '../../theme';
import { ResortPhoto } from '../common/ResortPhoto';
import type { Highlight } from '../sections/cmsCards';

const ROTATE_MS = 6000;

// The hero's instant photo while offers or events are running: one at a
// time as a tilted polaroid (picture, its discount or date, its name and its
// button), moving on by itself every few seconds — never while the pointer or
// keyboard is on it, or when the visitor prefers less motion. The dots pick
// one; "See all" goes to the "Offers & what's on" section. Hero.tsx shows the
// "Make a splash!" photo when there's nothing running.
export function HeroHighlights({ items }: { items: Highlight[] }) {
  const { reduced } = useMotionPreference();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;
  const item = items[index % count];

  useEffect(() => {
    if (count < 2 || paused || reduced) return;
    const timer = window.setTimeout(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => window.clearTimeout(timer);
  }, [index, count, paused, reduced]);

  return <Box component="section" aria-roledescription={count > 1 ? 'carousel' : undefined} aria-label="Offers and what’s on"
    onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
    onFocus={() => setPaused(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false); }}
    sx={{
      bgcolor: 'background.paper', p: { xs: 1, md: 1.25 }, borderRadius: '12px',
      boxShadow: '0 18px 40px rgba(23,60,44,.22)', transform: 'rotate(-6deg)', transition: 'transform .3s ease',
      '&:hover': { transform: 'rotate(-3deg) scale(1.02)' },
    }}>
    <motion.div key={item.id} initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .45 }} aria-live={paused ? 'polite' : 'off'}>
      <Box sx={{ position: 'relative', aspectRatio: '5 / 4', borderRadius: '8px', overflow: 'hidden' }}>
        <ResortPhoto image={item.image} alt={item.title} sizes="(max-width: 899px) 200px, 280px" />
        {item.tag && <Box sx={{
          position: 'absolute', bottom: { xs: 6, md: 8 }, right: { xs: 6, md: 8 }, px: { xs: 1, md: 1.25 }, py: { xs: .25, md: .4 }, borderRadius: 99,
          bgcolor: item.kind === 'offer' ? 'secondary.main' : '#fffef8', color: 'text.primary', fontFamily: fonts.playful, fontSize: { xs: 15, md: 19 }, lineHeight: 1.2,
          boxShadow: '0 3px 10px rgba(23,60,44,.18)',
        }}>{item.tag}</Box>}
      </Box>
      <Box sx={{ px: { xs: .5, md: .75 }, pt: { xs: 1, md: 1.25 } }}>
        <Typography variant="overline" noWrap sx={{ display: 'block', color: 'success.main', fontSize: { xs: 9.5, md: 10.5 }, lineHeight: 1.4 }}>{item.label}</Typography>
        <Typography noWrap sx={{ fontFamily: fonts.playful, fontSize: { xs: 17, md: 21 }, lineHeight: 1.15, mt: .25 }}>{item.title}</Typography>
        {item.ctaLabel && <Button fullWidth size="small" variant="contained" color="secondary" endIcon={item.ctaIcon}
          {...(item.onCta ? { onClick: item.onCta } : { href: item.ctaHref })} sx={{ mt: { xs: 1, md: 1.25 }, minHeight: { xs: 34, md: 40 }, fontSize: { xs: 12, md: 13 } }}>
          {item.ctaLabel}
        </Button>}
      </Box>
    </motion.div>
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: { xs: .5, md: .75 }, pt: { xs: .9, md: 1.1 }, pb: { xs: .4, md: .5 } }}>
      <Stack direction="row" spacing={.5} alignItems="center">
        {count > 1 && items.map((other, i) => <ButtonBase key={other.id} onClick={() => setIndex(i)} aria-label={`Show ${other.title}`} aria-current={i === index % count}
          sx={{ p: .5, borderRadius: 99, '&::after': { content: '""', display: 'block', height: 6, width: i === index % count ? 18 : 6, borderRadius: 99, bgcolor: i === index % count ? 'success.main' : 'rgba(23,60,44,.22)', transition: 'width .3s ease, background-color .3s ease' } }} />)}
      </Stack>
      <Link href="#offers" underline="hover" sx={{ fontSize: { xs: 11, md: 12 }, fontWeight: 700, color: 'text.secondary' }}>See all →</Link>
    </Stack>
  </Box>;
}
