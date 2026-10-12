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

export function ContactSection() {
  const openContact = useContactForm();
  return <Box id="contact" component="section" sx={{ py: SECTION_Y, scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl" sx={{ textAlign: 'center' }}><Reveal sx={{ position: 'relative' }}>
      <Typography variant="h2" sx={{ mt: 2, fontSize: { xs: 44, md: 68 }, lineHeight: 1.04 }}>Got a little question?<br /><Box component="span" color="primary.main">We’re all ears.</Box></Typography>
      <Typography sx={{ mt: 2, maxWidth: 460, mx: 'auto', fontSize: 16, lineHeight: 1.6, color: 'text.secondary' }}>Send us a message, give us a call, or find us on social — whichever's easiest.</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center" alignItems="center" sx={{ mt: 4 }}>
        <Button onClick={() => openContact({ topic: 'General question', page: 'Got a little question?' })} variant="contained" startIcon={<ChatBubbleOutlineRounded />}>Send us a message</Button>
        <Button href={CONTACT.tel} variant="outlined" color="inherit" startIcon={<Call />} sx={{
          borderColor: 'primary.main', color: 'primary.main',
          '&:hover': { borderColor: 'info.main', bgcolor: 'info.main', color: 'info.contrastText' },
        }}>{CONTACT.phone}</Button>
      </Stack>
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 5 }}>
        <SocialIcon href={CONTACT.facebook} label="Hula Hula on Facebook"><Facebook /></SocialIcon>
        <SocialIcon href={CONTACT.instagram} label="Hula Hula on Instagram"><Instagram /></SocialIcon>
        <SocialIcon href={CONTACT.whatsapp} label="Message Hula Hula on WhatsApp"><WhatsApp /></SocialIcon>
        <SocialIcon href={CONTACT.line} label="Message Hula Hula on Line"><LineIcon /></SocialIcon>
      </Stack>
    </Reveal></Container>
  </Box>;
}
