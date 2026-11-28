import Call from '@mui/icons-material/Call';
import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import Facebook from '@mui/icons-material/Facebook';
import Instagram from '@mui/icons-material/Instagram';
import MapRounded from '@mui/icons-material/MapRounded';
import MusicNoteRounded from '@mui/icons-material/MusicNoteRounded';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Box, Button, Container } from '@mui/material';
import { useContactForm } from '../../context/ContactFormContext';
import { CONTACT } from '../../data/content';
import { brand, fonts } from '../../theme';
import { artwork } from '../landing/artwork';
import { eyebrowSx, serifHeadingSx } from '../landing/landingStyles';
import { Reveal } from '../common/ScrollMotion';
import { SocialIcon } from '../common/SocialIcon';

// On tablets and phones the column narrows and centres; the buttons then fill it.
const columnSx = { maxWidth: { xs: 'none', md: 410 } } as const;
const actionSx = {
  justifyContent: 'center',
  minHeight: 55,
  p: { xs: '10px 9px', sm: '10px 12px' },
  '& .label': { lineHeight: 1.35, fontSize: 12 },
  '& small': { display: 'block', mt: '3px', fontSize: { xs: 9, sm: 10 }, fontWeight: 400 },
} as const;

export function ContactSection() {
  const openContact = useContactForm();
  return (
    <Box
      component="section"
      id="contact"
      aria-labelledby="contact-heading"
      sx={{ py: { xs: '50px', sm: '75px' }, scrollMarginTop: '100px', bgcolor: brand.cream }}
    >
      <Container maxWidth="xl">
        <Reveal>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.15fr 1fr' },
              alignItems: 'center',
              gap: { xs: '32px', md: '40px', lg: '65px' },
              maxWidth: { xs: 620, md: 'none' },
              mx: { xs: 'auto', md: 0 },
            }}
          >
            <Box
              sx={{
                position: 'relative',
                isolation: 'isolate',
                p: { xs: '5px 15px 12px', md: '10px 0 25px' },
                maxWidth: { xs: 550, md: 'none' },
                mx: { xs: 'auto', md: 0 },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  inset: '8% 2% 10%',
                  zIndex: -1,
                  borderRadius: '50%',
                  background: 'radial-gradient(ellipse, #f7dce6 0, #fff9f200 70%)',
                },
              }}
            >
              <Box
                component="img"
                src={artwork.writingSet}
                alt="An open pink envelope, a Royal Pineapple holiday postcard and a fountain pen, with watercolor tropical flowers"
                width={1000}
                height={667}
                loading="lazy"
                decoding="async"
                sx={{
                  display: 'block',
                  width: '100%',
                  height: 'auto',
                  objectFit: 'contain',
                  transform: 'rotate(-2deg)',
                  filter: 'drop-shadow(0 12px 16px #5a244812)',
                }}
              />
              <Box
                component="span"
                sx={{
                  display: 'block',
                  mt: '10px',
                  textAlign: 'center',
                  transform: 'rotate(-2deg)',
                  fontFamily: fonts.serif,
                  fontSize: { xs: 20, sm: 22 },
                  fontStyle: 'italic',
                  color: brand.royal,
                }}
              >
                A little note. A lovely beginning.
              </Box>
            </Box>
            <Box sx={{ width: { xs: '100%', md: 'auto' }, maxWidth: { xs: 480, md: 'none' }, mx: { xs: 'auto', md: 0 } }}>
              <Box component="p" sx={{ ...eyebrowSx, mb: '20px', fontSize: { xs: 8, sm: 10 } }}>
                A real person. A warm welcome.
              </Box>
              <Box
                component="h2"
                id="contact-heading"
                sx={{
                  ...serifHeadingSx,
                  fontSize: { xs: 'clamp(32px, 8.5vw, 43px)', sm: 45, md: 51 },
                  lineHeight: 1.08,
                  letterSpacing: '-.04em',
                  m: '0 0 22px',
                }}
              >
                A little question?
                <br />
                <em>Say hello.</em>
              </Box>
              <Box component="p" sx={{ fontSize: 14, lineHeight: 1.8, color: '#806373', maxWidth: 360, m: '0 0 25px' }}>
                Tell us what you’re dreaming of. A room, a little getaway, a special surprise — we’ll help with the details.
              </Box>
              <Button
                onClick={() => openContact({ topic: 'General question', page: 'Say hello' })}
                variant="contained"
                startIcon={<ChatBubbleOutlineRounded />}
                sx={{ ...columnSx, width: '100%', minHeight: 49 }}
              >
                Message the hotel
              </Button>
              <Box sx={{ ...columnSx, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: { xs: '9px', sm: '12px' }, m: '12px 0 24px' }}>
                <Button
                  href={CONTACT.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="outlined"
                  startIcon={<WhatsApp />}
                  sx={actionSx}
                >
                  <span className="label">
                    WhatsApp<small>{CONTACT.phone}</small>
                  </span>
                </Button>
                <Button href={CONTACT.landlineTel} variant="outlined" startIcon={<Call />} sx={actionSx}>
                  <span className="label">
                    Call the hotel<small>{CONTACT.landline}</small>
                  </span>
                </Button>
              </Box>
              <Box component="address" sx={{ fontSize: 12, lineHeight: 1.9, fontStyle: 'normal', color: '#886c7c', maxWidth: 350 }}>
                {CONTACT.address}
              </Box>
              <Box sx={{ ...columnSx, display: 'flex', gap: '12px', borderTop: '1px solid #eedce3', pt: '22px', mt: '22px' }}>
                <SocialIcon href={CONTACT.maps} label="Royal Pineapple on Google Maps">
                  <MapRounded />
                </SocialIcon>
                <SocialIcon href={CONTACT.facebook} label="Royal Pineapple on Facebook">
                  <Facebook />
                </SocialIcon>
                <SocialIcon href={CONTACT.instagram} label="Royal Pineapple on Instagram">
                  <Instagram />
                </SocialIcon>
                <SocialIcon href={CONTACT.tiktok} label="Royal Pineapple on TikTok">
                  <MusicNoteRounded />
                </SocialIcon>
              </Box>
            </Box>
          </Box>
        </Reveal>
      </Container>
    </Box>
  );
}
