import Add from '@mui/icons-material/Add';
import BedOutlined from '@mui/icons-material/BedOutlined';
import BlockRounded from '@mui/icons-material/BlockRounded';
import CardGiftcardRounded from '@mui/icons-material/CardGiftcardRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import East from '@mui/icons-material/East';
import EventAvailableRounded from '@mui/icons-material/EventAvailableRounded';
import FreeBreakfastOutlined from '@mui/icons-material/FreeBreakfastOutlined';
import PeopleOutlineRounded from '@mui/icons-material/PeopleOutlineRounded';
import Remove from '@mui/icons-material/Remove';
import SquareFootRounded from '@mui/icons-material/SquareFootRounded';
import { Alert, Box, Button, Chip, Collapse, IconButton, Link, Popover, Skeleton, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import type { RateOffer, RoomTypeOffer } from '../../../shared/bookingContract';
import { ResortPhoto } from '../../components/common/ResortPhoto';
import { GuestStepper } from '../../components/booking/GuestStepper';
import { RangeCalendar } from '../../components/booking/RangeCalendar';
import { toBookHref, toISODate, useBookingSearch } from '../../context/BookingSearchContext';
import { useContactForm } from '../../context/ContactFormContext';
import { navigate } from '../../router';
import { fonts } from '../../theme';
import { useBookingFlow } from '../BookingFlowContext';
import { CartSummary } from '../components/CartSummary';
import { guestsLabel, mealsLabel, money, nightsLabel, plural, stayLabel } from '../format';
import { roomContent } from '../roomContent';

// Step 1: the rooms free for the stay, each with its rate plans (meal plan,
// cancellation terms, price, what's paid now) — pick one or more, then
// continue. The search can be changed right here.
export function RoomsStep() {
  const search = useBookingSearch();
  const { availability, reload, cart, totals, plan } = useBookingFlow();
  const openContact = useContactForm();
  const data = availability.data;

  // Keep the address bar in step with the search, so a reload or a shared
  // link shows the same rooms.
  useEffect(() => {
    if (search.selectingCheckout) return;
    navigate(toBookHref(search.checkIn, search.checkOut, search.adults, search.children, search.promoCode), { replace: true });
  }, [search.checkIn, search.checkOut, search.adults, search.children, search.promoCode, search.selectingCheckout]);

  const goOn = () => { if (plan) navigate('/book/details'); };
  const continueButton = <Button fullWidth variant="contained" disabled={!plan} onClick={goOn} endIcon={<East />}>Continue</Button>;

  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 340px' }, gap: { xs: 3, md: 4 }, alignItems: 'start' }}>
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 46 }, lineHeight: 1.1 }}>Choose your room</Typography>
      <Typography sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>Live prices for your dates, straight from our booking system.</Typography>
      <SearchBar />

      {data?.promo && (data.promo.applied
        ? <Alert severity="success" sx={{ mt: 2 }}>Promo code <strong>{data.promo.code}</strong> applied — the prices below include it.</Alert>
        : <Alert severity="warning" sx={{ mt: 2 }}>The code <strong>{data.promo.code}</strong> doesn’t change prices for these dates. Check the code, or the dates it’s valid for.</Alert>)}

      <Stack spacing={3} sx={{ mt: 3 }} aria-busy={availability.status === 'loading'}>
        {availability.status === 'loading' && !data && [0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={260} sx={{ borderRadius: '24px' }} />)}
        {availability.status === 'error' && <Alert severity="error" action={<Button color="inherit" size="small" onClick={reload}>Try again</Button>}>
          {availability.error} <Link href={search.siteMinderUrl} target="_blank" rel="noopener">Or book on our partner page</Link>.
        </Alert>}
        {data && data.roomTypes.length === 0 && <Box sx={{ textAlign: 'center', py: 6, px: 2, border: '1px dashed', borderColor: 'divider', borderRadius: '24px' }}>
          <Typography variant="h3" sx={{ fontSize: 26 }}>No rooms free for those dates</Typography>
          <Typography sx={{ color: 'text.secondary', mt: 1, mb: 3 }}>Try moving your dates a little — or ask us, we’ll do our best to find you a spot.</Typography>
          <Button variant="outlined" onClick={() => openContact({ topic: 'Room booking & availability', message: `Hi Hula Hula! Do you have anything free ${stayLabel(toISODate(search.checkIn), toISODate(search.checkOut))} for ${guestsLabel(search.adults, search.children)}?`, page: 'Booking — no availability' })}>Ask our team</Button>
        </Box>}
        {data?.roomTypes.map((roomType) => <RoomTypeCard key={roomType.roomTypeUuid} roomType={roomType} nights={data.nights} currency={data.currency} />)}
        {data && data.roomTypes.length > 0 && <Typography sx={{ fontSize: 13, color: 'text.secondary', textAlign: 'center' }}>
          More than {data.maxRooms} rooms, or a group? <Link component="button" onClick={() => openContact({ topic: 'Room booking & availability', message: 'Hi Hula Hula! We’re a group and would like to book several rooms.', page: 'Booking — group' })}>Ask us about group bookings</Link>.
        </Typography>}
      </Stack>
    </Box>

    <Box sx={{ position: { md: 'sticky' }, top: { md: 24 } }}>
      <CartSummary action={continueButton} />
    </Box>

    {/* Phones: the total and the way on, always within thumb's reach. */}
    {cart.length > 0 && <Box sx={{ display: { md: 'none' }, position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 10, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', boxShadow: '0 -8px 24px rgba(23,60,44,.10)', px: 2, py: 1.5 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{plural(totals.rooms, 'room')} · pay {money(totals.dueNow, totals.currency)} now</Typography>
          <Typography sx={{ fontFamily: fonts.playful, fontSize: 20 }}>{money(totals.total, totals.currency)}</Typography>
        </Box>
        <Button variant="contained" disabled={!plan} onClick={goOn} endIcon={<East />}>Continue</Button>
      </Stack>
    </Box>}
  </Box>;
}

const fieldButton = {
  border: 0, bgcolor: 'transparent', color: 'inherit', textAlign: 'left', flex: '1 1 0', minWidth: 0, px: 2.5, py: 1.4, cursor: 'pointer',
  transition: 'background-color .2s ease', '&:hover': { bgcolor: 'secondary.light' }, '&:focus-visible': { outlineOffset: -4 },
} as const;

function SearchBar() {
  const search = useBookingSearch();
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const barRef = useRef<HTMLDivElement>(null);
  const [dateOpen, setDateOpen] = useState(false);
  const [guestAnchor, setGuestAnchor] = useState<HTMLElement | null>(null);
  const [promoOpen, setPromoOpen] = useState(Boolean(search.promoCode));
  const [promoDraft, setPromoDraft] = useState(search.promoCode);
  const nights = Math.round((search.checkOut.getTime() - search.checkIn.getTime()) / 86_400_000);

  const wasSelecting = useRef(search.selectingCheckout);
  useEffect(() => {
    if (wasSelecting.current && !search.selectingCheckout) setDateOpen(false);
    wasSelecting.current = search.selectingCheckout;
  }, [search.selectingCheckout]);

  return <Box>
    <Box ref={barRef} sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '20px', overflow: 'hidden' }}>
      <Box component="button" type="button" aria-label="Change stay dates" aria-expanded={dateOpen} onClick={() => setDateOpen(true)} sx={{ ...fieldButton, borderBottom: { xs: '1px solid #d6e1ce', sm: 'none' }, borderRight: { sm: '1px solid #d6e1ce' } }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 11 }}>Dates · {nightsLabel(nights)}</Typography>
        <Typography sx={{ fontFamily: fonts.playful, fontSize: 15 }}>{stayLabel(toISODate(search.checkIn), toISODate(search.checkOut))}</Typography>
      </Box>
      <Box component="button" type="button" aria-label="Change guests" aria-expanded={!!guestAnchor} onClick={(e) => setGuestAnchor(e.currentTarget)} sx={fieldButton}>
        <Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 11 }}>Guests</Typography>
        <Typography sx={{ fontFamily: fonts.playful, fontSize: 15 }}>{guestsLabel(search.adults, search.children)}</Typography>
      </Box>
    </Box>
    {!promoOpen && <Button size="small" onClick={() => setPromoOpen(true)} sx={{ mt: 1, minHeight: 0, fontSize: 13 }}>Have a promo code?</Button>}
    <Collapse in={promoOpen}>
      <Stack component="form" direction="row" spacing={1} sx={{ mt: 1.5, maxWidth: 420 }} onSubmit={(e) => { e.preventDefault(); search.setPromoCode(promoDraft.trim()); }}>
        <TextField size="small" label="Promo code" value={promoDraft} onChange={(e) => setPromoDraft(e.target.value.replace(/[^\w-]/g, '').slice(0, 40))} sx={{ flex: 1 }} slotProps={{ htmlInput: { autoCapitalize: 'characters', spellCheck: false } }} />
        <Button type="submit" variant="outlined" size="small">Apply</Button>
        {search.promoCode && <Button size="small" onClick={() => { setPromoDraft(''); search.setPromoCode(''); }}>Remove</Button>}
      </Stack>
    </Collapse>

    <Popover open={dateOpen} anchorEl={barRef.current} onClose={() => setDateOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} slotProps={{ paper: { sx: { mt: 1, borderRadius: '24px', width: { xs: 380, sm: 520 } } } }}>
      <RangeCalendar checkIn={search.checkIn} checkOut={search.checkOut} minDate={today} onSelectDay={search.selectDay} />
    </Popover>
    <Popover open={!!guestAnchor} anchorEl={guestAnchor} onClose={() => setGuestAnchor(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} slotProps={{ paper: { sx: { mt: 1, borderRadius: '24px', minWidth: 260 } } }}>
      <Stack spacing={2} sx={{ p: 3 }}>
        <GuestStepper label="Adults" value={search.adults} min={1} max={12} onChange={search.setAdults} />
        <GuestStepper label="Children" value={search.children} min={0} max={8} onChange={search.setChildren} />
        <Button variant="contained" size="small" onClick={() => setGuestAnchor(null)}>Done</Button>
      </Stack>
    </Popover>
  </Box>;
}

function RoomTypeCard({ roomType, nights, currency }: { roomType: RoomTypeOffer; nights: number; currency: string }) {
  const { images, blurb } = roomContent(roomType.roomTypeUuid, roomType.name);
  const [index, setIndex] = useState(0);
  return <Box component="article" sx={{ border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 8px 22px rgba(23,60,44,.06)' }}>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: '260px minmax(0, 1fr)' } }}>
      <Box sx={{ position: 'relative', aspectRatio: { xs: '16 / 10', sm: 'auto' }, minHeight: { sm: 220 } }}>
        <ResortPhoto image={images[index]} alt={`${roomType.name}, photo ${index + 1}`} sizes="(max-width: 600px) 100vw, 260px" sx={{ position: { sm: 'absolute' }, inset: 0 }} />
        {images.length > 1 && <>
          <IconButton aria-label={`Previous photo of ${roomType.name}`} onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)} sx={{ position: 'absolute', left: 8, top: 'calc(50% - 20px)', bgcolor: '#fbfdf4', width: 40, height: 40, '&:hover': { bgcolor: 'secondary.main' } }}><ChevronLeft fontSize="small" /></IconButton>
          <IconButton aria-label={`Next photo of ${roomType.name}`} onClick={() => setIndex((i) => (i + 1) % images.length)} sx={{ position: 'absolute', right: 8, top: 'calc(50% - 20px)', bgcolor: '#fbfdf4', width: 40, height: 40, '&:hover': { bgcolor: 'secondary.main' } }}><ChevronRight fontSize="small" /></IconButton>
        </>}
      </Box>
      <Box sx={{ p: { xs: 2.5, md: 3 } }}>
        <Typography variant="h2" sx={{ fontSize: { xs: 24, md: 28 }, lineHeight: 1.15 }}>{roomType.name}</Typography>
        <Stack direction="row" flexWrap="wrap" useFlexGap gap={2} sx={{ mt: 1, color: 'text.secondary', fontSize: 13, '& svg': { fontSize: 18, verticalAlign: 'text-bottom', mr: .5 } }}>
          <span><PeopleOutlineRounded />Sleeps {roomType.capacity.guests}</span>
          {roomType.roomSize && <span><SquareFootRounded />{roomType.roomSize} {roomType.roomSizeUnit}</span>}
          {roomType.available <= 3 && <Box component="span" sx={{ color: 'warning.dark', fontWeight: 700 }}>Only {roomType.available} left</Box>}
        </Stack>
        {(blurb ?? roomType.description) && <Typography sx={{ mt: 1.5, fontSize: 14, lineHeight: 1.7, color: 'text.secondary' }}>{blurb ?? roomType.description}</Typography>}
      </Box>
    </Box>
    <Box>{roomType.rates.map((rate) => <RatePlanRow key={rate.roomRateUuid} roomType={roomType} rate={rate} nights={nights} currency={currency} />)}</Box>
  </Box>;
}

function RatePlanRow({ roomType, rate, nights, currency }: { roomType: RoomTypeOffer; rate: RateOffer; nights: number; currency: string }) {
  const { quantityOf, roomsLeft, setQuantity } = useBookingFlow();
  const quantity = quantityOf(rate.roomRateUuid);
  const canAdd = quantity < rate.maxQuantity && roomsLeft(roomType) > 0;
  const payAll = rate.deposit.balance <= 0;
  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'minmax(0, 1fr) auto' }, gap: 2, alignItems: 'center', px: { xs: 2.5, md: 3 }, py: 2.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: quantity ? 'rgba(231,244,204,.45)' : 'transparent' }}>
    <Box sx={{ minWidth: 0 }}>
      {rate.offer && <Chip size="small" icon={<CardGiftcardRounded />} color="secondary"
        label={`${rate.offer.badge || 'Special offer'} · ${rate.offer.title}${rate.offer.percent > 0 ? ` −${rate.offer.percent}%` : ''}`}
        sx={{ mb: 1, fontWeight: 700, maxWidth: '100%', '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' } }} />}
      <Typography sx={{ fontWeight: 700 }}>{rate.name}</Typography>
      <Stack direction="row" flexWrap="wrap" useFlexGap gap={1} sx={{ mt: 1 }}>
        {mealsLabel(rate.meals).toLowerCase() !== rate.name.toLowerCase() && <Chip size="small" icon={rate.meals.breakfast ? <FreeBreakfastOutlined /> : <BedOutlined />} label={mealsLabel(rate.meals)} sx={{ bgcolor: rate.meals.breakfast ? 'success.light' : 'background.default' }} />}
        {rate.promoDiscount > 0 && <Chip size="small" color="secondary" label={`You save ${money(rate.promoDiscount, currency)}`} />}
      </Stack>
      <Typography sx={{ mt: 1, fontSize: 13, color: 'text.secondary', display: 'flex', gap: .75, alignItems: 'flex-start' }}>
        {rate.cancellation.refundable ? <EventAvailableRounded sx={{ fontSize: 17, color: 'success.main', mt: '1px' }} /> : <BlockRounded sx={{ fontSize: 16, mt: '2px' }} />}
        {rate.cancellation.summary}
      </Typography>
      {rate.description && <Typography sx={{ mt: .75, fontSize: 13, color: 'text.secondary' }}>{rate.description}</Typography>}
      {rate.offer && rate.offer.perks.length > 0 && <Stack component="ul" spacing={.25} sx={{ listStyle: 'none', p: 0, m: 0, mt: 1 }}>
        {rate.offer.perks.map((perk) => <Typography component="li" key={perk} sx={{ fontSize: 13, color: 'success.dark', display: 'flex', alignItems: 'flex-start', gap: .75 }}>
          <CheckRounded sx={{ fontSize: 16, mt: '2px' }} />{perk}
        </Typography>)}
      </Stack>}
    </Box>
    <Stack direction={{ xs: 'row', sm: 'column' }} alignItems={{ xs: 'center', sm: 'flex-end' }} justifyContent="space-between" spacing={1.25} sx={{ textAlign: { sm: 'right' } }}>
      <Box>
        {rate.offer && rate.originalTotal > rate.total && <Typography sx={{ fontSize: 14, color: 'text.secondary', textDecoration: 'line-through' }}>{money(rate.originalTotal, currency)}</Typography>}
        <Typography sx={{ fontFamily: fonts.playful, fontSize: 24, lineHeight: 1.1 }}>{money(rate.total, currency)}</Typography>
        {rate.offer && rate.offer.savings > 0 && <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'secondary.dark' }}>You save {money(rate.offer.savings, currency)}</Typography>}
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{nightsLabel(nights)} · {money(Math.round(rate.total / nights), currency)} avg/night</Typography>
        <Typography sx={{ fontSize: 12, color: 'success.dark', fontWeight: 700 }}>{payAll ? 'Pay in full today' : `Pay ${money(rate.deposit.dueNow, currency)} today`}</Typography>
      </Box>
      {quantity === 0
        ? <Button variant="contained" size="small" disabled={!canAdd} onClick={() => setQuantity(roomType, rate, 1)}>{canAdd ? 'Select' : 'No more left'}</Button>
        : <Stack direction="row" alignItems="center" spacing={1} aria-label={`${rate.name}: ${quantity} selected`}>
          <IconButton size="small" aria-label={`One fewer ${roomType.name}`} onClick={() => setQuantity(roomType, rate, quantity - 1)} sx={{ border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}><Remove sx={{ fontSize: 16 }} /></IconButton>
          <Typography sx={{ minWidth: 56, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{plural(quantity, 'room')}</Typography>
          <IconButton size="small" aria-label={`One more ${roomType.name}`} disabled={!canAdd} onClick={() => setQuantity(roomType, rate, quantity + 1)} sx={{ border: '1px solid', borderColor: 'divider', width: 40, height: 40 }}><Add sx={{ fontSize: 16 }} /></IconButton>
        </Stack>}
    </Stack>
  </Box>;
}
