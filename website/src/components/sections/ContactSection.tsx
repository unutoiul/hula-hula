import ChatBubbleOutlineRounded from '@mui/icons-material/ChatBubbleOutlineRounded';
import Call from '@mui/icons-material/Call';
import Facebook from '@mui/icons-material/Facebook';
import Instagram from '@mui/icons-material/Instagram';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { CONTACT } from '../../data/content';
import { SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import { LineIcon } from '../common/LineIcon';
import { SocialIcon } from '../common/SocialIcon';
import { Reveal } from '../common/ScrollMotion';
import { useContactForm } from '../../context/ContactFormContext';
import { fonts } from '../../theme';
import { SunDoodle } from '../common/VacationDecor';

export function ContactSection() {
  const openContact = useContactForm();
  return <Box id="contact" component="section" aria-labelledby="contact-heading" sx={{ py: SECTION_Y, scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl"><Reveal sx={{ position: 'relative' }}>
      <Box sx={{ p: { xs: 1, md: 1.5 }, bgcolor: '#fffef8', border: '1px solid #d6e1ce', borderRadius: { xs: '24px', md: '32px' }, boxShadow: '0 18px 55px rgba(23,60,44,.07)' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '.95fr 1.05fr' }, borderRadius: { xs: '17px', md: '22px' }, overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', minHeight: { xs: 260, sm: 350, md: 560 }, bgcolor: '#d9f5fc' }}>
            <Box component="img" src="/images/hula-hula/illustrations/krabi-postcard.webp" alt="Watercolour Krabi coastline with palms, yellow hibiscus, and a pineapple relaxing in a hammock" loading="lazy" decoding="async" width="1536" height="1024"
              sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            <Box sx={{ position: 'absolute', top: { xs: 18, md: 26 }, left: { xs: 18, md: 26 }, px: 1.8, py: .8, borderRadius: '999px', bgcolor: 'rgba(255,254,248,.94)', border: '1px solid rgba(23,60,44,.1)' }}>
              <Typography variant="overline" sx={{ color: 'primary.dark', fontSize: 10 }}>Greetings from Krabi</Typography>
            </Box>
            <Box sx={{ position: 'absolute', bottom: { xs: 16, md: 24 }, left: { xs: 18, md: 26 }, px: 2, py: 1, bgcolor: '#fffef8', borderRadius: '8px', transform: 'rotate(-4deg)', boxShadow: '0 3px 10px rgba(23,60,44,.08)' }}>
              <Typography sx={{ fontFamily: fonts.playful, fontSize: { xs: 22, md: 28 }, color: 'primary.dark' }}>Wish you were Hula.</Typography>
            </Box>
          </Box>
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', px: { xs: 2, sm: 4, md: 5, lg: 7 }, pt: { xs: 9, md: 10 }, pb: { xs: 4, md: 6 }, textAlign: { xs: 'center', md: 'left' }, backgroundImage: 'radial-gradient(ellipse at 100% 0%, rgba(231,244,204,.55), transparent 65%)' }}>
            <Box aria-hidden="true" sx={{ position: 'absolute', top: 16, right: 18, display: 'flex', alignItems: 'center', gap: 1.3, color: 'success.main', transform: 'rotate(8deg)', opacity: .75 }}>
              <Box sx={{ borderTop: '1px solid', borderBottom: '1px solid', height: 13, width: 42, '&::after': { content: '""', display: 'block', borderTop: '1px solid', mt: '5px' } }} />
              <Box sx={{ display: 'grid', justifyItems: 'center', p: .7, border: '2px dotted', borderRadius: '4px' }}><SunDoodle size={30} /><Typography variant="overline" sx={{ fontSize: 8, letterSpacing: '.1em', mt: .3 }}>Krabi · Thailand</Typography></Box>
            </Box>
            <Typography variant="overline" color="success.main" sx={{ mb: 2 }}>A little hello from paradise</Typography>
            <Typography id="contact-heading" variant="h2" sx={{ fontSize: { xs: 38, sm: 48, md: 48, lg: 56 }, lineHeight: 1.07 }}>Got a little<br />question?<br /><Box component="span" color="primary.main">We’re all ears.</Box></Typography>
            <Typography sx={{ mt: 2.5, maxWidth: 400, mx: { xs: 'auto', md: 0 }, fontSize: 16, lineHeight: 1.75, color: 'text.secondary' }}>A holiday plan, a little question, or just a hello. Drop us a note — a warm Hula Hula welcome is waiting.</Typography>
            <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5} alignItems={{ xs: 'center', md: 'flex-start', lg: 'center' }} sx={{ mt: 3.5 }}>
              <Button onClick={() => openContact({ topic: 'General question', page: 'Got a little question?' })} variant="contained" startIcon={<ChatBubbleOutlineRounded />}>Send us a message</Button>
              <Button href={CONTACT.tel} variant="outlined" color="inherit" startIcon={<Call />} sx={{
                borderColor: 'primary.main', color: 'primary.main',
                '&:hover': { borderColor: 'info.main', bgcolor: 'info.main', color: 'info.contrastText' },
              }}>{CONTACT.phone}</Button>
            </Stack>
            <Typography sx={{ mt: 2.5, fontSize: 14, lineHeight: 1.8, color: 'text.secondary' }}>
              Reservations: <Box component="a" href={`mailto:${CONTACT.email}`} sx={{ color: 'primary.main', fontWeight: 700, whiteSpace: 'nowrap' }}>{CONTACT.email}</Box><br />
              Hotel: <Box component="a" href={CONTACT.landlineTel} sx={{ color: 'primary.main', fontWeight: 700, whiteSpace: 'nowrap' }}>{CONTACT.landline}</Box> · WhatsApp: <Box component="a" href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" sx={{ color: 'primary.main', fontWeight: 700, whiteSpace: 'nowrap' }}>{CONTACT.phone}</Box>
            </Typography>
            <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mt: 3.5, pt: 3, borderTop: '1px dashed #d6e1ce' }}>
              <SocialIcon href={CONTACT.facebook} label="Hula Hula on Facebook"><Facebook /></SocialIcon>
              <SocialIcon href={CONTACT.instagram} label="Hula Hula on Instagram"><Instagram /></SocialIcon>
              <SocialIcon href={CONTACT.whatsapp} label="Message Hula Hula on WhatsApp"><WhatsApp /></SocialIcon>
              <SocialIcon href={CONTACT.line} label="Message Hula Hula on Line"><LineIcon /></SocialIcon>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Reveal></Container>
  </Box>;
}
