import Call from '@mui/icons-material/Call';
import Facebook from '@mui/icons-material/Facebook';
import GolfCourseRounded from '@mui/icons-material/GolfCourseRounded';
import Instagram from '@mui/icons-material/Instagram';
import MailOutlineRounded from '@mui/icons-material/MailOutlineRounded';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { CONTACT } from '../../data/content';
import { photoAssets as p } from '../../data/photos';
import { SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import { linkClick } from '../../router';
import { fonts } from '../../theme';
import { ClubPhoto } from '../common/ClubPhoto';
import { LineIcon } from '../common/LineIcon';
import { Reveal } from '../common/ScrollMotion';
import { SocialIcon } from '../common/SocialIcon';
import { SunDoodle } from '../common/VacationDecor';

// The two secondary contact buttons: same size, label over number.
const quickActionSx = { justifyContent: 'flex-start', minHeight: 56, borderColor: 'primary.main', color: 'primary.main', '@media (hover: none)': { '&:hover': { bgcolor: 'transparent' } }, '@media (hover: hover)': { '&:hover': { borderColor: 'info.main', bgcolor: 'info.main', color: 'info.contrastText', '& svg': { color: 'inherit' } } } } as const;

// A postcard from the club: the clubhouse on the front, every way to reach a
// person on the back. Booking is the main action; the rest are one tap away.
export function ContactSection() {
  return <Box id="contact" component="section" aria-labelledby="contact-heading" sx={{ py: SECTION_Y, scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl"><Reveal sx={{ position: 'relative' }}>
      <Box sx={{ p: { xs: 1, md: 1.5 }, bgcolor: '#fffef8', border: '1px solid #d6e1ce', borderRadius: { xs: '24px', md: '32px' }, boxShadow: '0 18px 55px rgba(23,60,44,.07)' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '.95fr 1.05fr' }, borderRadius: { xs: '17px', md: '22px' }, overflow: 'hidden' }}>
          <Box sx={{ position: 'relative', minHeight: { xs: 260, sm: 350, md: 560 }, bgcolor: '#d9f5fc' }}>
            <Box sx={{ position: 'absolute', inset: 0 }}><ClubPhoto image={p.fairwayBalcony.src} alt="Striped fairways seen from the white railings of the clubhouse balcony" sizes="(max-width: 900px) 100vw, 45vw" /></Box>
            <Box sx={{ position: 'absolute', top: { xs: 18, md: 26 }, left: { xs: 18, md: 26 }, px: 1.8, py: .8, borderRadius: '999px', bgcolor: 'rgba(255,254,248,.94)', border: '1px solid rgba(23,60,44,.1)' }}>
              <Typography variant="overline" sx={{ color: 'primary.dark', fontSize: 10 }}>Greetings from the clubhouse</Typography>
            </Box>
            <Box sx={{ position: 'absolute', bottom: { xs: 16, md: 24 }, left: { xs: 18, md: 26 }, px: 2, py: 1, bgcolor: '#fffef8', borderRadius: '8px', transform: 'rotate(-4deg)', boxShadow: '0 3px 10px rgba(23,60,44,.08)' }}>
              <Typography sx={{ fontFamily: fonts.playful, fontSize: { xs: 22, md: 28 }, color: 'primary.dark' }}>Wish you were here. Fore!</Typography>
            </Box>
          </Box>
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'center', px: { xs: 2, sm: 4, md: 5, lg: 7 }, pt: { xs: 9, md: 10 }, pb: { xs: 4, md: 6 }, textAlign: { xs: 'center', md: 'left' }, backgroundImage: 'radial-gradient(ellipse at 100% 0%, rgba(231,244,204,.55), transparent 65%)' }}>
            <Box aria-hidden="true" sx={{ position: 'absolute', top: 16, right: 18, display: 'flex', alignItems: 'center', gap: 1.3, color: 'success.main', transform: 'rotate(8deg)', opacity: .75 }}>
              <Box sx={{ borderTop: '1px solid', borderBottom: '1px solid', height: 13, width: 42, '&::after': { content: '""', display: 'block', borderTop: '1px solid', mt: '5px' } }} />
              <Box sx={{ display: 'grid', justifyItems: 'center', p: .7, border: '2px dotted', borderRadius: '4px' }}><SunDoodle size={30} /><Typography variant="overline" sx={{ fontSize: 8, letterSpacing: '.1em', mt: .3 }}>Krabi · Thailand</Typography></Box>
            </Box>
            <Typography variant="overline" color="success.main" sx={{ mb: 2 }}>A little hello from the fairway</Typography>
            <Typography id="contact-heading" variant="h2" sx={{ fontSize: { xs: 38, sm: 48, md: 48, lg: 56 }, lineHeight: 1.07 }}>Got a little<br />question?<br /><Box component="span" color="primary.main">We’re all ears.</Box></Typography>
            <Typography sx={{ mt: 2.5, maxWidth: 420, mx: { xs: 'auto', md: 0 }, fontSize: 16, lineHeight: 1.75, color: 'text.secondary' }}>A group outing, a birthday round, or just “which shoes?” — message us and the team will get back to you.</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mt: 3.5, maxWidth: 460, mx: { xs: 'auto', md: 0 } }}>
              <Button href="/book" onClick={linkClick('/book')} variant="contained" startIcon={<GolfCourseRounded />} sx={{ gridColumn: '1 / -1' }}>Book a tee time</Button>
              <Button href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<WhatsApp sx={{ color: '#25a366' }} />} sx={quickActionSx}>
                <Box component="span" sx={{ display: 'grid', textAlign: 'left', lineHeight: 1.2 }}>WhatsApp<Box component="span" sx={{ fontSize: 12, fontWeight: 500, opacity: .8 }}>{CONTACT.phone}</Box></Box>
              </Button>
              <Button href={CONTACT.tel} variant="outlined" startIcon={<Call />} sx={quickActionSx}>
                <Box component="span" sx={{ display: 'grid', textAlign: 'left', lineHeight: 1.2 }}>Call the club<Box component="span" sx={{ fontSize: 12, fontWeight: 500, opacity: .8 }}>{CONTACT.phone}</Box></Box>
              </Button>
              <Button href={`mailto:${CONTACT.email}`} variant="outlined" startIcon={<MailOutlineRounded />} sx={{ ...quickActionSx, gridColumn: '1 / -1' }}>
                <Box component="span" sx={{ display: 'grid', textAlign: 'left', lineHeight: 1.2, minWidth: 0 }}>Email<Box component="span" sx={{ fontSize: 12, fontWeight: 500, opacity: .8, overflow: 'hidden', textOverflow: 'ellipsis' }}>{CONTACT.email}</Box></Box>
              </Button>
            </Box>
            <Stack direction="row" spacing={2} justifyContent={{ xs: 'center', md: 'flex-start' }} sx={{ mt: 3.5, pt: 3, borderTop: '1px dashed #d6e1ce' }}>
              <SocialIcon href={CONTACT.facebook} label="Hula Hula Golf Club on Facebook"><Facebook /></SocialIcon>
              <SocialIcon href={CONTACT.instagram} label="Hula Hula Golf Club on Instagram"><Instagram /></SocialIcon>
              <SocialIcon href={CONTACT.line} label={`Message Hula Hula Golf Club on Line (${CONTACT.lineId})`}><LineIcon /></SocialIcon>
            </Stack>
          </Box>
        </Box>
      </Box>
    </Reveal></Container>
  </Box>;
}
