import West from '@mui/icons-material/West';
import WhatsApp from '@mui/icons-material/WhatsApp';
import { Box, Button, Container, Link, Stack, Typography } from '@mui/material';
import { useContact } from '../../context/SiteDataContext';
import { linkClick } from '../../router';
import { ClubMark } from '../common/ClubMark';

// The slim header on the booking and event pages: the club's mark, a way to
// ask a person, and the way back to the homepage.
export function PageHeader({ question = 'Questions about your booking?', back = '/' }: { question?: string; back?: string }) {
  const contact = useContact();
  return <Box component="header" sx={{ bgcolor: 'rgba(255,253,243,.96)', borderBottom: '1px solid', borderColor: 'divider' }}>
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ minHeight: { xs: 76, md: 92 }, py: 1 }}>
        <ClubMark size="small" href="/" />
        <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }}>
          <Stack sx={{ display: { xs: 'none', sm: 'flex' }, textAlign: 'right' }}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{question}</Typography>
            <Link href={contact.whatsapp} target="_blank" rel="noopener noreferrer" sx={{ fontSize: 14, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: .5, justifyContent: 'flex-end' }}><WhatsApp sx={{ fontSize: 16 }} />{contact.phone}</Link>
          </Stack>
          <Button href={back} onClick={linkClick(back)} size="small" variant="outlined" startIcon={<West sx={{ fontSize: 16 }} />}>The club</Button>
        </Stack>
      </Stack>
    </Container>
  </Box>;
}
