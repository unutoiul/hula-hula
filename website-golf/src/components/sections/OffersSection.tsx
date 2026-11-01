import East from '@mui/icons-material/East';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { activeOffers } from '../../booking/offers';
import { useContact, useSite } from '../../context/SiteDataContext';
import { linkClick } from '../../router';
import { ClubPhoto } from '../common/ClubPhoto';

export function OffersSection({ preview = false }: { preview?: boolean }) {
  const { club } = useSite();
  const contact = useContact();
  const offers = activeOffers(club.offers);
  if (!offers.length) return preview ? null : <Container sx={{ py: 8 }}><Typography variant="h2" sx={{ fontSize: 34 }}>More good days are on the way.</Typography><Typography sx={{ mt: 2 }}>Ask our team about current packages and group rates.</Typography><Button href={contact.whatsapp} target="_blank" rel="noopener noreferrer" sx={{ mt: 2 }}>Ask the club</Button></Container>;
  return <Box component="section" id="offers" aria-labelledby="offers-heading" sx={{ py: { xs: 6, md: 9 }, bgcolor: '#e7f4cc' }}>
    <Container maxWidth="lg">
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} gap={2} sx={{ mb: 3 }}>
        <Box><Typography variant="overline" color="success.dark">A little extra to enjoy</Typography><Typography id="offers-heading" variant="h2" sx={{ mt: 1, fontSize: { xs: 34, md: 46 } }}>Good days. Even better offers.</Typography></Box>
        {preview && <Button href="/offers" onClick={linkClick('/offers')} endIcon={<East />}>All offers</Button>}
      </Stack>
      <Stack spacing={3}>{offers.slice(0, preview ? 2 : undefined).map(offer => <Box id={offer.id} key={offer.id} component="article" sx={{ scrollMarginTop: 120, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(0,.85fr) minmax(0,1.15fr)' }, overflow: 'hidden', border: '1px solid #d6e1ce', borderRadius: '24px', bgcolor: 'background.paper' }}>
        <Box sx={{ minHeight: { xs: 230, md: 310 }, position: 'relative', bgcolor: 'primary.dark' }}>
          {offer.image && <Box sx={{ position: 'absolute', inset: 0 }}><ClubPhoto image={offer.image} alt="Friends enjoying a day at Hula Hula" sizes="(max-width: 900px) 90vw, 40vw" /></Box>}
          <Box sx={{ position: 'absolute', top: 18, left: 18, bgcolor: 'secondary.main', color: 'text.primary', px: 2, py: .75, borderRadius: 99, fontWeight: 800, fontSize: 13 }}>Club offer</Box>
        </Box>
        <Box sx={{ p: { xs: 3, md: 4 }, alignSelf: 'center' }}>
          <Typography variant="h3" sx={{ fontSize: { xs: 32, md: 42 }, lineHeight: 1.08 }}>{offer.title}</Typography>
          {offer.priceLabel && <Typography sx={{ fontSize: 22, color: 'primary.main', fontWeight: 800, mt: 1.5 }}>{offer.priceLabel}</Typography>}
          <Typography sx={{ mt: 1.5, color: 'text.secondary', lineHeight: 1.75, maxWidth: 560 }}>{offer.description}</Typography>
          <Button href={`${contact.whatsapp}?text=${encodeURIComponent(offer.message || `Hi! I'd like to ask about ${offer.title}.`)}`} target="_blank" rel="noopener noreferrer" variant="contained" endIcon={<East />} sx={{ mt: 2.5 }}>Ask about this offer</Button>
          {offer.endsOn && <Typography sx={{ fontSize: 12, mt: 1.5, color: 'text.secondary' }}>Available until {offer.endsOn}</Typography>}
        </Box>
      </Box>)}</Stack>
    </Container>
  </Box>;
}
