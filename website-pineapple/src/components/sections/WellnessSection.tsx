import CloudOutlined from '@mui/icons-material/CloudOutlined';
import { Box, Button, Container } from '@mui/material';
import { useContactForm } from '../../context/ContactFormContext';
import { onCloudMenu } from '../../data/content';
import { SECTION_SCROLL_OFFSET } from '../../layoutConstants';
import { brand, fonts } from '../../theme';
import { artwork } from '../landing/artwork';
import { Reveal } from '../common/ScrollMotion';
import { WellnessServiceIcon } from './WellnessServiceIcon';

const muted = '#8a6478';
// Partner logos: Aveda's white wordmark sits on a plum tag, Cirépil's on the card.
const brandTagSx = { aveda: { p: '6px 8px', borderRadius: '5px', bgcolor: brand.plum }, cirepil: { px: '5px' } } as const;

export function WellnessSection() {
  const openContact = useContactForm();
  return (
    <Box
      id="wellness"
      component="section"
      aria-labelledby="wellness-heading"
      sx={{ bgcolor: '#fcecf1', scrollMarginTop: SECTION_SCROLL_OFFSET, pb: { xs: 6, md: 8 } }}
    >
      <Container maxWidth="xl">
        <Reveal>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '.65fr 1.65fr', lg: '.72fr 1.65fr' },
              overflow: 'hidden',
              border: '1px solid #efdce4',
              borderRadius: { xs: '24px', md: '28px' },
              bgcolor: brand.paper,
              boxShadow: '0 12px 35px #5a24480a',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'row', md: 'column' },
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: '#fff7f3',
                gap: { xs: '15px', sm: '20px', md: '16px' },
                p: { xs: '13px 20px', sm: '15px 25px', md: '24px 16px', lg: '28px 24px' },
                '& > img': {
                  display: 'block',
                  width: { xs: 128, sm: 150, md: '100%' },
                  maxWidth: 320,
                  height: 'auto',
                  objectFit: 'contain',
                },
                '& > p': {
                  m: 0,
                  fontFamily: fonts.serif,
                  fontStyle: 'italic',
                  fontWeight: 400,
                  lineHeight: 1.3,
                  color: '#c72e69',
                  fontSize: { xs: 19, sm: 22, md: 21, lg: 23 },
                  textAlign: { xs: 'left', md: 'center' },
                  maxWidth: { xs: 150, sm: 200, md: 'none' },
                },
              }}
            >
              <img
                src={artwork.hammock}
                alt="A pink pineapple enjoying a peaceful moment in a tropical hammock"
                width={1000}
                height={667}
                loading="lazy"
              />
              <p>A little time on cloud nine.</p>
            </Box>
            <Box sx={{ minWidth: 0, p: { xs: '22px 20px', sm: '25px', md: '26px', lg: '30px 36px' } }}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: { xs: '5px 12px', sm: '16px' },
                  fontSize: { xs: 9, sm: 10 },
                  '& > span:first-of-type': {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#bc2b64',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '.12em',
                    '& > svg': { fontSize: 22 },
                  },
                  '& > span:last-of-type': { color: muted },
                }}
              >
                <span>
                  <CloudOutlined aria-hidden="true" />
                  On Cloud Wellness
                  <Box
                    component="span"
                    sx={{
                      ml: '4px',
                      p: '3px 9px',
                      borderRadius: '999px',
                      bgcolor: '#c6306d',
                      color: '#fff',
                      fontSize: { xs: 9, sm: 10 },
                      letterSpacing: '.1em',
                    }}
                  >
                    Opening soon
                  </Box>
                </span>
                <span>Official Aveda salon partner</span>
              </Box>
              <Box
                component="h2"
                id="wellness-heading"
                sx={{
                  m: '12px 0 9px',
                  fontFamily: fonts.serif,
                  fontWeight: 400,
                  fontSize: { xs: 33, sm: 'clamp(31px, 3.2vw, 44px)' },
                  lineHeight: 1.12,
                  letterSpacing: '-.035em',
                  color: brand.plum,
                }}
              >
                A little time, just for you.
              </Box>
              <Box component="p" sx={{ m: 0, color: '#806271', fontSize: { xs: 12, sm: 13 }, lineHeight: 1.7 }}>
                Our salon and spa are still being built. Soon: a sanctuary for self-care and sustainable beauty, with Aveda’s naturally
                derived rituals. Here’s a first look at the menu.
              </Box>
              <Box
                component="ul"
                aria-label="Wellness treatments"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                  gap: { xs: '8px', sm: '10px' },
                  listStyle: 'none',
                  m: { xs: '17px 0 0', sm: '21px 0 0' },
                  p: 0,
                }}
              >
                {onCloudMenu.map((item) => (
                  <Box
                    component="li"
                    key={item.icon}
                    sx={{
                      display: 'grid',
                      alignItems: 'center',
                      gridTemplateColumns: { xs: '32px minmax(0, 1fr)', sm: '30px minmax(0, 1fr)', lg: '36px minmax(0, 1fr)' },
                      gap: { xs: '10px', sm: '8px', lg: '11px' },
                      p: { xs: '11px', sm: '12px', md: '10px', lg: '12px' },
                      border: '1px solid #f0dde5',
                      borderRadius: '13px',
                      bgcolor: '#fffbf8',
                      '&:last-of-type': { gridColumn: '1 / -1' },
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        display: 'grid',
                        placeItems: 'center',
                        width: { xs: 30, lg: 36 },
                        height: 40,
                        color: '#c6306d',
                        '& > svg': { width: 30, height: 30 },
                      }}
                    >
                      <WellnessServiceIcon kind={item.icon} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px 10px' }}
                      >
                        <Box
                          component="h3"
                          sx={{
                            m: 0,
                            fontFamily: fonts.sans,
                            fontWeight: 700,
                            fontSize: { xs: 13, lg: 14 },
                            lineHeight: 1.4,
                            color: brand.plum,
                          }}
                        >
                          {item.title}
                        </Box>
                        {item.brand && (
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              ...brandTagSx[item.brand],
                              '& > img': { display: 'block', objectFit: 'contain' },
                            }}
                          >
                            <img
                              src={`/logo/wellness/${item.brand}.png`}
                              alt={item.brand === 'aveda' ? 'Aveda' : 'Cirépil'}
                              width={item.brand === 'aveda' ? 60 : 64}
                              height={item.brand === 'aveda' ? 16 : 29}
                              loading="lazy"
                            />
                          </Box>
                        )}
                      </Box>
                      <Box component="p" sx={{ m: '4px 0 0', fontSize: 12, lineHeight: 1.6, color: '#806271' }}>
                        {item.detail}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column-reverse', sm: 'row' },
                  alignItems: { xs: 'stretch', sm: 'center' },
                  justifyContent: 'space-between',
                  gap: { xs: '12px', sm: '16px' },
                  mt: { xs: '18px', sm: '20px' },
                  textAlign: { xs: 'center', sm: 'left' },
                }}
              >
                <Box component="p" sx={{ m: 0, color: muted, fontSize: { xs: 10, sm: 11 }, lineHeight: 1.6 }}>
                  Want to know when we open?
                  <br />
                  Leave us a note and we’ll tell you first.
                </Box>
                <Button
                  onClick={() =>
                    openContact({
                      topic: 'On Cloud salon & spa',
                      message: 'Hello Royal Pineapple! Please let me know when On Cloud opens.',
                      page: 'On Cloud Wellness',
                    })
                  }
                  variant="contained"
                  sx={{ flexShrink: 0 }}
                >
                  Tell me when it opens
                </Button>
              </Box>
            </Box>
          </Box>
        </Reveal>
      </Container>
    </Box>
  );
}
