import TimerOutlined from '@mui/icons-material/TimerOutlined';
import { Box, Chip, Divider, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { fonts } from '../../theme';
import { ActivityIcon } from '../activityIcons';
import { useBookingFlow, useHoldSecondsLeft } from '../BookingFlowContext';
import { durationLabel, shortDayLabel, timeLabel } from '../dates';
import { money, peopleLabel } from '../pricing';

const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

// The running summary beside every step: what, when, for how many, the hold
// on the picked time, and the price — all paid at the club on the day.
export function BookingSummary({ action }: { action?: ReactNode }) {
  const { activity, option, search, time, lines, total, extras } = useBookingFlow();
  const secondsLeft = useHoldSecondsLeft();
  const people = peopleLabel(activity, search.players);

  return <Box sx={{ border: '1px solid', borderColor: 'divider', borderTop: '5px solid #50830d', bgcolor: 'background.paper', borderRadius: '24px', p: { xs: 2.5, md: 3 }, boxShadow: '0 16px 36px rgba(23,60,44,.07)' }}>
    <Typography variant="overline" sx={{ color: 'text.secondary' }}>Your booking</Typography>
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
      <Box aria-hidden sx={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', display: 'grid', placeItems: 'center', bgcolor: 'success.light', color: 'success.dark' }}><ActivityIcon icon={activity.icon} /></Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontFamily: fonts.playful, fontSize: 19, lineHeight: 1.2 }}>{activity.name}</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{option.label} · {durationLabel(option.minutes)}</Typography>
      </Box>
    </Stack>

    <Box sx={{ mt: 2, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
      <Box><Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 10 }}>Day</Typography><Typography sx={{ fontWeight: 700, fontSize: 14 }}>{shortDayLabel(search.date)}</Typography></Box>
      <Box><Typography variant="overline" sx={{ color: 'text.secondary', fontSize: 10 }}>{activity.slotNoun === 'tee time' ? 'Tee time' : 'Start'}</Typography><Typography sx={{ fontWeight: 700, fontSize: 14, color: time ? 'text.primary' : 'text.secondary' }}>{time ? timeLabel(time) : 'Pick a time'}</Typography></Box>
      <Box sx={{ gridColumn: '1 / -1' }}><Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{people}{extras.transfer ? ` · free pick-up at ${timeLabel(extras.transfer)}` : ''}</Typography></Box>
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
      {extras.transfer && <Stack direction="row" justifyContent="space-between"><Typography sx={{ fontSize: 14, fontWeight: 700 }}>Shuttle pick-up</Typography><Typography sx={{ fontSize: 14, color: 'success.dark', fontWeight: 700 }}>Free</Typography></Stack>}
    </Stack>
    <Divider sx={{ my: 2 }} />
    <Stack direction="row" justifyContent="space-between" alignItems="baseline"><Typography sx={{ fontWeight: 700 }}>Total</Typography><Typography sx={{ fontFamily: fonts.playful, fontSize: 24 }}>{money(total)}</Typography></Stack>
    <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: .25 }}>Paid at the club on the day — nothing to pay online.</Typography>
    <Stack direction="row" flexWrap="wrap" useFlexGap gap={.75} sx={{ mt: 1.5 }}>
      {activity.includes.map((item) => <Chip key={item} label={item} size="small" sx={{ bgcolor: 'success.light', color: 'success.dark', fontWeight: 600, fontSize: 11 }} />)}
    </Stack>
    {action && <Box sx={{ mt: 2.5 }}>{action}</Box>}
  </Box>;
}
