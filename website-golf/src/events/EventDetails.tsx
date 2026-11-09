import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import FlagRounded from '@mui/icons-material/FlagRounded';
import LockOutlined from '@mui/icons-material/LockOutlined';
import ScheduleRounded from '@mui/icons-material/ScheduleRounded';
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import type { PublicEvent, PublicPackage } from '../booking/contract';
import { money } from '../booking/pricing';
import { GuestStepper } from '../components/booking/GuestStepper';
import { PaymentLogos } from '../components/common/PaymentMethods';
import { PineappleGolfer } from '../components/common/PineappleGolfer';
import { SECTION_SCROLL_OFFSET, STICKY_TOP } from '../layoutConstants';
import { fonts } from '../theme';

/** Keep a single package beside the story; give several packages room to compare. */
export function EventDetails({ event, phone, onBuy }: { event: PublicEvent; phone: string; onBuy: (pack: PublicPackage, quantity: number) => void }) {
  const singlePackage = event.packages.length === 1;
  const paragraphs = event.description.split(/\n\s*\n/).map(text => text.trim()).filter(Boolean);

  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: singlePackage ? 'minmax(0, 1.35fr) minmax(0, 1fr)' : 'minmax(0, 1fr)' }, gap: { xs: 4, md: 5, lg: 7 }, alignItems: 'start' }}>
    <Box sx={{ minWidth: 0, display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: singlePackage ? 'minmax(0, 1fr)' : 'minmax(0, 1.35fr) minmax(0, 1fr)' }, gap: 4, alignItems: 'start' }}>
      <Box component="section" aria-labelledby="about-the-day">
        <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'success.dark', mb: 1 }}>
          <FlagRounded sx={{ fontSize: 18 }} />
          <Typography variant="overline">A little golf. A good day.</Typography>
        </Stack>
        <Typography id="about-the-day" variant="h2" sx={{ fontSize: { xs: 34, md: 42 }, lineHeight: 1.12 }}>About the day</Typography>
        {paragraphs.map((text, i) => <Typography key={i} sx={{ mt: 2, fontSize: 16.5, lineHeight: 1.8, color: 'text.secondary', whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{text}</Typography>)}
        {event.highlights.length > 0 && <Box sx={{ mt: 3 }}>
          <Typography variant="h3" sx={{ fontSize: 21, mb: 1.5 }}>Good things in store</Typography>
          <Box component="ul" sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 1.25, listStyle: 'none', m: 0, p: 0 }}>
            {event.highlights.map((highlight, i) => <Stack component="li" key={highlight} direction="row" spacing={1.25} alignItems="center" sx={{ p: 1.75, borderRadius: '18px', bgcolor: i % 3 === 1 ? '#f5f3d6' : 'success.light' }}>
              <Box sx={{ display: 'grid', placeItems: 'center', flexShrink: 0, width: 28, height: 28, bgcolor: 'background.paper', borderRadius: '50%', color: 'success.dark' }}><CheckRounded sx={{ fontSize: 18 }} /></Box>
              <Typography sx={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5, overflowWrap: 'anywhere' }}>{highlight}</Typography>
            </Stack>)}
          </Box>
        </Box>}
      </Box>

      {event.schedule.length > 0 && <Box component="section" aria-labelledby="event-schedule" sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: '28px', bgcolor: 'primary.dark', color: '#fffef8', position: 'relative', overflow: 'hidden' }}>
        <Box aria-hidden sx={{ position: 'absolute', width: 170, height: 170, border: '1px solid rgba(231,244,204,.12)', borderRadius: '50%', right: -70, top: -70, boxShadow: '0 0 0 24px rgba(231,244,204,.04), 0 0 0 48px rgba(231,244,204,.03)' }} />
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ position: 'relative', mb: 2.5 }}>
          <Box>
            <Typography variant="overline" sx={{ color: '#d8ecad' }}>From hello to the last hole</Typography>
            <Typography id="event-schedule" variant="h3" sx={{ fontSize: 28, mt: .5 }}>The game plan</Typography>
          </Box>
          <ScheduleRounded sx={{ color: '#d8ecad', fontSize: 28, ml: 1 }} />
        </Stack>
        <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0 }}>
          {event.schedule.map((item, i) => <Box component="li" key={i} sx={{ display: 'grid', gridTemplateColumns: '34px minmax(0, 1fr)', columnGap: 1.75, position: 'relative', pb: i === event.schedule.length - 1 ? 0 : 2.5 }}>
            {i < event.schedule.length - 1 && <Box aria-hidden sx={{ position: 'absolute', left: 16, top: 36, bottom: 3, borderLeft: '1px dashed rgba(231,244,204,.35)' }} />}
            <Box aria-hidden sx={{ width: 34, height: 34, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: i === 0 ? 'primary.dark' : '#e7f4cc', bgcolor: i === 0 ? 'secondary.main' : 'rgba(231,244,204,.1)', border: '1px solid rgba(231,244,204,.2)' }}>{String(i + 1).padStart(2, '0')}</Box>
            <Box sx={{ py: .5, minWidth: 0 }}>
              {item.time && <Typography sx={{ color: '#d8ecad', fontSize: 12, fontWeight: 700, mb: .25 }}>{item.time}</Typography>}
              <Typography sx={{ fontSize: 15, lineHeight: 1.6, overflowWrap: 'anywhere' }}>{item.text}</Typography>
            </Box>
          </Box>)}
        </Box>
      </Box>}
    </Box>

    <Box component="section" id="packages" aria-labelledby="event-packages" sx={{ minWidth: 0, scrollMarginTop: SECTION_SCROLL_OFFSET, position: singlePackage ? { md: 'sticky' } : undefined, top: singlePackage ? { md: STICKY_TOP } : undefined }}>
      <Box sx={{ p: { xs: 2, sm: 3 }, borderRadius: '32px', bgcolor: '#eef2e5', border: '1px solid #e0e7d5' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 2.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="overline" sx={{ color: 'success.dark' }}>See you on the green</Typography>
            <Typography id="event-packages" variant="h2" sx={{ mt: .5, fontSize: { xs: 30, lg: 34 }, lineHeight: 1.12 }}>Choose your package</Typography>
          </Box>
          <PineappleGolfer sizes="76px" sx={{ width: { xs: 60, sm: 76 }, flexShrink: 0, transform: 'rotate(7deg)' }} />
        </Stack>
        {!event.salesOpen && <Alert severity="info" sx={{ mb: 2 }}>Online sales for this event are closed. WhatsApp us on {phone} and we’ll see what we can do.</Alert>}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: `repeat(${Math.min(2, Math.max(1, event.packages.length))}, minmax(0, 1fr))`, lg: `repeat(${Math.min(3, Math.max(1, event.packages.length))}, minmax(0, 1fr))` }, gap: 2 }}>
          {event.packages.map(pack => <PackageCard key={pack.id} pack={pack} open={event.salesOpen} onBuy={quantity => onBuy(pack, quantity)} />)}
        </Box>
        {event.packages.length === 0 && <Typography sx={{ color: 'text.secondary' }}>Packages are coming soon — WhatsApp us to save a place.</Typography>}
        {event.salesOpen && event.packages.length > 0 && <Stack alignItems="center" spacing={1.25} sx={{ mt: 2.5 }}>
          <Stack direction="row" spacing={.75} alignItems="center" sx={{ color: 'text.secondary' }}><LockOutlined sx={{ fontSize: 14 }} /><Typography sx={{ fontSize: 12 }}>Secure checkout with Payso</Typography></Stack>
          <PaymentLogos size={23} sx={{ justifyContent: 'center' }} />
        </Stack>}
      </Box>
    </Box>
  </Box>;
}

function PackageCard({ pack, open, onBuy }: { pack: PublicPackage; open: boolean; onBuy: (quantity: number) => void }) {
  const max = Math.min(pack.maxPerOrder, pack.left);
  const [quantity, setQuantity] = useState(1);
  useEffect(() => { setQuantity(value => Math.max(1, Math.min(value, max))); }, [max]);
  const soldOut = pack.left === 0;

  return <Box component="article" sx={{ minWidth: 0, display: 'flex', flexDirection: 'column', p: { xs: 2.25, sm: 3 }, borderRadius: '22px', bgcolor: 'background.paper', border: '1px solid rgba(23,60,44,.1)', boxShadow: '0 8px 24px rgba(23,60,44,.04)' }}>
    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 2 }}>
      <Box sx={{ width: 42, height: 42, display: 'grid', placeItems: 'center', bgcolor: soldOut ? '#eef0ea' : 'success.light', color: 'success.dark', borderRadius: '14px', transform: 'rotate(-6deg)' }}><FlagRounded /></Box>
      <Chip size="small" label={soldOut ? 'Sold out' : !open ? 'Sales closed' : pack.left <= 10 ? `${pack.left} left` : 'Available'} sx={{ fontSize: 11, fontWeight: 700, bgcolor: soldOut || !open ? '#eef0ea' : pack.left <= 10 ? '#fff0cf' : 'success.light', color: soldOut || !open ? 'text.secondary' : pack.left <= 10 ? '#785008' : 'success.dark' }} />
    </Stack>
    <Typography variant="h3" sx={{ fontSize: 26, lineHeight: 1.2, overflowWrap: 'anywhere' }}>{pack.name}</Typography>
    <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mt: 1.75, flexWrap: 'wrap' }}>
      <Typography sx={{ fontFamily: fonts.playful, fontSize: 48, color: 'primary.dark', lineHeight: 1.1, letterSpacing: '-.04em', overflowWrap: 'anywhere' }}>{money(pack.price)}</Typography>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>per person</Typography>
    </Stack>
    {pack.description && <Typography sx={{ color: 'text.secondary', mt: 1.75, fontSize: 14, lineHeight: 1.7, overflowWrap: 'anywhere' }}>{pack.description}</Typography>}
    {pack.includes.length > 0 && <Stack component="ul" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0, mt: 2 }}>
      {pack.includes.map(item => <Stack component="li" key={item} direction="row" spacing={1} alignItems="flex-start"><CheckRounded sx={{ fontSize: 18, color: 'success.main', mt: '2px' }} /><Typography sx={{ fontSize: 14, overflowWrap: 'anywhere' }}>{item}</Typography></Stack>)}
    </Stack>}
    {open && !soldOut && <Box sx={{ mt: 'auto', pt: 2.5 }}>
      <Box sx={{ borderTop: '1px dashed', borderColor: 'divider', pt: 2.5 }}>
        {max > 1 && <GuestStepper label="Players" value={quantity} min={1} max={max} onChange={setQuantity} />}
        <Stack direction="row" justifyContent="space-between" spacing={1} alignItems="baseline" sx={{ mt: max > 1 ? 2 : 0, mb: 1.5 }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Total for {quantity} {quantity === 1 ? 'person' : 'people'}</Typography>
          <Typography aria-live="polite" aria-atomic="true" sx={{ fontWeight: 700, fontSize: 18 }}>{money(pack.price * quantity)}</Typography>
        </Stack>
        <Button fullWidth variant="contained" endIcon={<ArrowForwardRounded />} onClick={() => onBuy(quantity)} sx={{ minHeight: 52, justifyContent: 'space-between', px: 2.5 }}>Let’s play · {money(pack.price * quantity)}</Button>
      </Box>
    </Box>}
  </Box>;
}
