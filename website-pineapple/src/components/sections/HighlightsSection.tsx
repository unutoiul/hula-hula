import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import { Box } from '@mui/material';
import { SECTION_HEADING } from '../../layoutConstants';
import { fonts } from '../../theme';
import { ResortPhoto } from '../common/ResortPhoto';
import { Reveal } from '../common/ScrollMotion';
import { BadgePicture } from '../landing/BadgePicture';
import { eyebrowSx, serifHeadingSx } from '../landing/landingStyles';
import { useHomepageHighlights, type Highlight } from './cmsCards';

export function HighlightsSection() {
  const items = useHomepageHighlights();
  const preview = items.some(item => item.preview);

  return <Box component="section" id="offers" aria-labelledby="offers-heading" sx={{
    display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '.68fr 2fr' }, alignItems: 'center', gap: { xs: '32px', lg: '44px' },
    pt: { xs: '32px', md: '48px' }, pb: { xs: '56px', md: '80px' }, scrollMarginTop: '110px',
  }}>
    <Box sx={{ textAlign: { xs: 'center', lg: 'left' } }}>
      <Reveal>
        <Box component="p" sx={{ ...eyebrowSx, justifyContent: { xs: 'center', lg: 'flex-start' } }}><span />A little extra, just for you</Box>
        <Box component="h2" id="offers-heading" sx={{ ...serifHeadingSx, fontSize: SECTION_HEADING, lineHeight: 1.08, letterSpacing: '-.04em', m: '21px 0', '& > br': { display: { xs: 'none', lg: 'initial' } } }}>Your stay.<br /><em>Even sweeter.</em></Box>
        <Box component="p" sx={{ color: '#806271', fontSize: 14, lineHeight: 1.9, maxWidth: { xs: 460, lg: 300 }, mx: { xs: 'auto', lg: 0 } }}>Good days, lovely little extras, and one more reason to make it a Royal Pineapple holiday.</Box>
        {preview && <Box component="span" sx={{ display: 'inline-block', mt: '16px', pb: '6px', fontSize: 10, color: '#936b80', borderBottom: '1px solid #e4c2d1' }}>Two offer ideas to explore</Box>}
      </Reveal>
    </Box>
    <Box sx={{
      display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, alignItems: 'stretch', gap: { xs: '28px', sm: '30px', lg: '25px' },
      width: '100%', maxWidth: { xs: 420, sm: 850, lg: 'none' }, mx: { xs: 'auto', lg: 0 },
    }}>
      {items.map((item, index) => <Reveal key={item.id} delay={index * .1} sx={{ display: 'flex', minWidth: 0 }}><HighlightCard item={item} alternate={index % 2 === 1} /></Reveal>)}
    </Box>
  </Box>;
}

// The two card colourways: cream, and plum for every second card.
const TONES = {
  cream: { ink: '#602545', muted: '#846477', accent: '#be2f67', line: '#e9c6d5', paper: '#fff8ed', edge: '#e6c4d2', shadow: '0 4px 5px #5a244818', logo: '/logo/royal-pineapple.svg' },
  plum: { ink: '#fff2df', muted: '#e5c8d6', accent: '#ffbad2', line: '#ffffff30', paper: '#632747', edge: '#632747', shadow: '0 4px 5px #230b1e30', logo: '/logo/royal-pineapple-white.svg' },
} as const;

/** Also used by the CMS preview; published cards keep their original CTA and terms. */
export function HighlightCard({ item, alternate = false }: { item: Highlight; alternate?: boolean }) {
  const tone = alternate ? TONES.plum : TONES.cream;
  const discount = item.tag?.includes('%');
  const ctaSx = {
    mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', width: '100%', minHeight: 46, py: '13px', px: 0,
    border: 0, borderTop: `1px dashed ${tone.line}`, borderBottom: `1px dashed ${tone.line}`, bgcolor: 'transparent', color: tone.ink, cursor: 'pointer',
    textAlign: 'left', textDecoration: 'none', fontFamily: 'inherit', fontSize: { xs: 12, sm: 11 }, fontWeight: 700,
    '& > svg': { fontSize: 17, color: tone.accent }, '&:focus-visible': { outline: '3px solid #ce3672', outlineOffset: 5 },
  } as const;
  return <Box component="article" sx={{
    position: 'relative', display: 'flex', flexDirection: 'column', width: '100%', p: { xs: '15px', sm: '14px' },
    border: `1px solid ${tone.edge}`, borderRadius: '9px', bgcolor: tone.paper, color: tone.ink, boxShadow: '0 12px 25px #5a24480a',
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', p: '0 3px 10px' }}>
      <Box component="span" sx={{ fontSize: 8, letterSpacing: '.13em', fontWeight: 700 }}>{item.preview ? 'OFFER PREVIEW' : item.kind === 'offer' ? 'BOOK A LITTLE HAPPINESS' : 'WHAT’S ON'}</Box>
      <Box component="img" src={tone.logo} alt="Royal Pineapple Hotel" width={43} height={37} loading="lazy" sx={{ width: 43, height: 37, objectFit: 'contain' }} />
    </Box>
    <BadgePicture frameName={alternate ? 'evening-garden' : 'pool-club'} label={item.title} sizes="(max-width: 600px) 90vw, 33vw" shadow={tone.shadow}>
      <ResortPhoto image={item.image} alt={item.title} sizes="(max-width: 600px) 90vw, 33vw" />
    </BadgePicture>
    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', flex: 1, p: '10px 8px 4px' }}>
      {item.tag && <Box component="span" sx={{
        display: 'block', color: tone.accent, fontFamily: fonts.serif, fontWeight: 400, lineHeight: 1.1,
        ...(discount ? { fontStyle: 'normal', fontSize: 60, letterSpacing: '-.05em', m: '0 0 10px' } : { fontStyle: 'italic', fontSize: 28, m: '6px 0 18px' }),
      }}>{item.tag}</Box>}
      <Box component="p" sx={{ color: tone.muted, fontSize: 8, letterSpacing: '.1em', textTransform: 'uppercase', lineHeight: 1.6, m: '0 0 7px' }}>{item.label}</Box>
      <Box component="h3" sx={{ fontFamily: fonts.serif, fontWeight: 400, fontSize: { xs: 31, sm: 29 }, lineHeight: 1.08, letterSpacing: '-.025em', color: tone.ink, m: 0 }}>{item.title}</Box>
      {item.description && <Box component="p" sx={{ color: tone.muted, fontSize: { xs: 13, sm: 12 }, lineHeight: 1.8, m: '14px 0' }}>{item.description}</Box>}
      {item.perks.length > 0 && <Box component="ul" sx={{
        listStyle: 'none', p: 0, m: '0 0 22px',
        '& > li': { display: 'flex', alignItems: 'flex-start', gap: '8px', mt: '7px', color: tone.muted, fontSize: { xs: 12, sm: 11 }, lineHeight: 1.6 },
        '& > li > svg': { color: tone.accent, fontSize: 15, flexShrink: 0 },
      }}>{item.perks.slice(0, 3).map(perk => <li key={perk}><CheckRounded aria-hidden="true" />{perk}</li>)}</Box>}
      {item.ctaLabel && (item.onCta
        ? <Box component="button" type="button" onClick={item.onCta} sx={ctaSx}>{item.ctaLabel}<ArrowForwardRounded aria-hidden="true" /></Box>
        : <Box component="a" href={item.ctaHref} sx={ctaSx}>{item.ctaLabel}<ArrowForwardRounded aria-hidden="true" /></Box>)}
      {item.note && <Box component="p" sx={{ color: tone.muted, fontSize: { xs: 10, sm: 9 }, lineHeight: 1.7, m: '13px 0 0' }}>{item.note}</Box>}
    </Box>
  </Box>;
}
