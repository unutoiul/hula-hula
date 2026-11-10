import TimerOutlined from '@mui/icons-material/TimerOutlined';
import { Box, Divider, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { PaymentLogos } from '../../components/common/PaymentMethods';
import { fonts } from '../../theme';
import { ActivityIcon } from '../activityIcons';
import { useBookingFlow, useHoldSecondsLeft } from '../BookingFlowContext';
import { durationLabel, shortDayLabel, timeLabel } from '../dates';
import { money, peopleLabel } from '../pricing';

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

function Fact({ label, muted, children }: { label: string; muted?: boolean; children: ReactNode }) {
  return <Box sx={{ minWidth: 0 }}>
    <Typography variant="overline" sx={{ display: 'block', color: 'text.secondary', fontSize: 10, lineHeight: 1.6 }}>{label}</Typography>
    <Typography sx={{ fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', color: muted ? 'text.secondary' : 'text.primary' }}>{children}</Typography>
  </Box>;
}

// The running summary beside every step: what, when, for how many, the hold
// on the picked time, the price, and what's paid now against what's left for
// the club.
export function BookingSummary({ action }: { action?: ReactNode }) {
  const { activity, option, search, time, lines, total, deposit, extras } = useBookingFlow();
  const secondsLeft = useHoldSecondsLeft();
  const balance = total - deposit;

  return <Box sx={{ border: '1px solid', borderColor: 'divider', borderTop: '5px solid #50830d', bgcolor: 'background.paper', borderRadius: '24px', p: { xs: 2.5, md: 3 }, boxShadow: '0 16px 36px rgba(23,60,44,.07)' }}>
    <Typography variant="overline" sx={{ color: 'text.secondary' }}>Your booking</Typography>
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
      <Box aria-hidden sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'success.light', color: 'success.dark' }}><ActivityIcon icon={activity.icon} /></Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontFamily: fonts.playful, fontSize: 19, lineHeight: 1.2 }}>{activity.name}</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{option.label} · {durationLabel(option.minutes)}</Typography>
      </Box>
    </Stack>

    <Box sx={{ mt: 2.25, display: 'grid', gridTemplateColumns: 'repeat(3, auto)', justifyContent: 'space-between', columnGap: 1.5 }}>
      <Fact label="Day">{shortDayLabel(search.date)}</Fact>
      <Fact label={activity.slotNoun === 'tee time' ? 'Tee time' : 'Start'} muted={!time}>{time ? timeLabel(time) : 'Pick a time'}</Fact>
      <Fact label="Group">{peopleLabel(activity, search.players)}</Fact>
    </Box>

    {secondsLeft !== null && <Stack direction="row" spacing={1} alignItems="center" role="timer" aria-live="off" sx={{ mt: 2, px: 1.5, py: 1, borderRadius: '12px', bgcolor: secondsLeft < 120 ? 'secondary.light' : 'primary.light', color: secondsLeft < 120 ? 'secondary.dark' : 'primary.dark' }}>
      <TimerOutlined sx={{ fontSize: 18 }} />
      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>We’re holding this time for you · <Box component="span" sx={{ fontVariantNumeric: 'tabular-nums' }}>{clock(secondsLeft)}</Box></Typography>
    </Stack>}

    <Divider sx={{ my: 2 }} />
    <Stack spacing={1.25}>
      {lines.map((line) => <Stack key={line.label} direction="row" justifyContent="space-between" spacing={2}>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{line.label}</Typography>
          {line.detail && <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{line.detail}</Typography>}
        </Box>
        <Typography sx={{ fontSize: 14, whiteSpace: 'nowrap' }}>{money(line.amount)}</Typography>
      </Stack>)}
      {extras.transfer && <Stack direction="row" justifyContent="space-between" spacing={2}>
        <Box><Typography sx={{ fontSize: 14, fontWeight: 700 }}>Shuttle pick-up</Typography><Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{timeLabel(extras.transfer)}</Typography></Box>
        <Typography sx={{ fontSize: 14, color: 'success.dark', fontWeight: 700 }}>Free</Typography>
      </Stack>}
      {extras.privateTransfer && <Stack direction="row" justifyContent="space-between" spacing={2}><Typography sx={{ fontSize: 14, fontWeight: 700 }}>Private transfer</Typography><Typography sx={{ fontSize: 13, color: 'text.secondary', whiteSpace: 'nowrap' }}>Price by WhatsApp</Typography></Stack>}
    </Stack>

    {balance > 0
      ? <>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mt: 1.75, pt: 1.75, borderTop: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Total</Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{money(total)}</Typography>
        </Stack>
        <Box sx={{ mt: 1.5, borderRadius: '16px', overflow: 'hidden', border: '1px solid', borderColor: 'success.main' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ px: 1.75, py: 1.5, bgcolor: 'success.light' }}>
            <Box>
              <Typography variant="overline" sx={{ display: 'block', fontSize: 10, lineHeight: 1.6, color: 'success.dark' }}>Pay now</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 700 }}>Deposit to book</Typography>
            </Box>
            <Typography sx={{ fontFamily: fonts.playful, fontWeight: 500, fontSize: 30, lineHeight: 1, color: 'success.dark', whiteSpace: 'nowrap' }}>{money(deposit)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ px: 1.75, py: 1.25, borderTop: '1px dashed', borderColor: 'success.main' }}>
            <Box>
              <Typography variant="overline" sx={{ display: 'block', fontSize: 10, lineHeight: 1.6, color: 'text.secondary' }}>At the club</Typography>
              <Typography sx={{ fontSize: 13 }}>Pay the rest on the day</Typography>
            </Box>
            <Typography sx={{ fontSize: 17, fontWeight: 700, whiteSpace: 'nowrap' }}>{money(balance)}</Typography>
          </Stack>
        </Box>
      </>
      : <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} sx={{ mt: 1.75, pt: 1.75, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box>
          <Typography sx={{ fontWeight: 700 }}>Total</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{total > 0 ? 'Paid online when you book' : 'Nothing to pay'}</Typography>
        </Box>
        <Typography sx={{ fontFamily: fonts.playful, fontWeight: 500, fontSize: 30, lineHeight: 1, whiteSpace: 'nowrap' }}>{money(total)}</Typography>
      </Stack>}

    {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
    {deposit > 0 && <PaymentLogos size={22} sx={{ mt: 1.5, justifyContent: 'center' }} />}
  </Box>;
}
