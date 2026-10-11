import Call from '@mui/icons-material/Call';
import Facebook from '@mui/icons-material/Facebook';
import Instagram from '@mui/icons-material/Instagram';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { CONTACT } from '../../data/content';
import { SECTION_SCROLL_OFFSET, SECTION_Y } from '../../layoutConstants';
import { LineIcon } from '../common/LineIcon';
import { MetaLabel } from '../common/MetaLabel';
import { SocialIcon } from '../common/SocialIcon';

export function ContactSection() {
  return <Box id="contact" component="section" sx={{ py: SECTION_Y, scrollMarginTop: SECTION_SCROLL_OFFSET }}>
    <Container maxWidth="xl" sx={{ textAlign: 'center' }}>
      <MetaLabel>05 / Contact</MetaLabel>
      <Typography variant="h2" sx={{ mt: 2, fontSize: { xs: 36, md: 64 }, lineHeight: .92 }}>Say hello,<br /><Box component="em">any way you like.</Box></Typography>
      <Typography sx={{ mt: 2, maxWidth: 460, mx: 'auto', fontSize: 16, lineHeight: 1.6, color: 'text.secondary' }}>Call, message, or find us on social — whichever's easiest.</Typography>
      <Button href={CONTACT.tel} variant="outlined" color="inherit" startIcon={<Call />} sx={{
        mt: 5, px: 3.5, py: 1.4, borderColor: 'text.primary', color: 'text.primary',
        '&:hover': { borderColor: 'info.main', bgcolor: 'info.main', color: 'info.contrastText' },
      }}>{CONTACT.phone}</Button>
      <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 5 }}>
        <SocialIcon href={CONTACT.facebook} label="Hula Hula on Facebook"><Facebook /></SocialIcon>
        <SocialIcon href={CONTACT.instagram} label="Hula Hula on Instagram"><Instagram /></SocialIcon>
        <SocialIcon href={CONTACT.whatsapp} label="Message Hula Hula on WhatsApp"><WhatsApp /></SocialIcon>
        <SocialIcon href={CONTACT.line} label="Message Hula Hula on Line"><LineIcon /></SocialIcon>
      </Stack>
    </Container>
  </Box>;
}
