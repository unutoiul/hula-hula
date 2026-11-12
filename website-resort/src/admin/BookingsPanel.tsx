import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded';
import CloseRounded from '@mui/icons-material/CloseRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import {
  Alert, Box, Button, ButtonBase, Checkbox, CircularProgress, FormControlLabel, IconButton, InputAdornment, MenuItem, Stack, Table, TableBody,
  TableCell, TableHead, TablePagination, TableRow, TextField, Tooltip, Typography, useMediaQuery, useTheme,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { countryName } from '../booking/countries';
import { dayMonthLabel, money, plural, shortDayLabel } from '../booking/format';
import { BookingDetail, StatusChip } from './BookingDetail';
import {
  addDays, applyFilters, DEFAULT_FILTERS, type DeskBooking, type Filters, guestName, inView, isPaid, isTest, needsAction, nightCount,
  paymentBadge, roomCount, siteMinderBadge, SORTS, STAY_FILTERS, stampShortLabel, todayInBangkok, VIEWS,
} from './bookingModel';
import { InfoButton } from './InfoButton';
import { supabase } from './supabase';

const PAGE_SIZES = [25, 100, 250];
const PAGE_SIZE_KEY = 'hh-admin-bookings-per-page';

// The page size each person picked, kept in their browser.
function savedPageSize(): number {
  try { const n = Number(localStorage.getItem(PAGE_SIZE_KEY)); return PAGE_SIZES.includes(n) ? n : PAGE_SIZES[0]; } catch { return PAGE_SIZES[0]; }
}
const REFRESH_MS = 60_000;

// /admin → Bookings: the reservations desk. Every booking made on the
// website, with the guest's details, payment and SiteMinder status; a to-do
// count up top, filters, and the whole booking in a side panel.
export function BookingsPanel() {
  const [rows, setRows] = useState<DeskBooking[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(savedPageSize);
  const [openRef, setOpenRef] = useState<string | null>(null);
  const wide = useMediaQuery(useTheme().breakpoints.up('md'), { noSsr: true });

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase!.rpc('admin_booking_list');
    setLoading(false);
    if (loadError) { setError(loadError.message); return; }
    setRows(data as DeskBooking[]); setError(null); setLoadedAt(new Date());
  }, []);
  // New bookings turn up on their own while the tab is open.
  useEffect(() => {
    void load();
    const timer = window.setInterval(() => { if (document.visibilityState === 'visible') void load(); }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  const update = (next: Partial<Filters>) => { setFilters((current) => ({ ...current, ...next })); setPage(0); };
  const list = useMemo(() => applyFilters(rows ?? [], filters), [rows, filters]);
  const counts = useMemo(() => Object.fromEntries(VIEWS.map((v) => [v.value, (rows ?? []).filter((b) => inView(b, v.value)).length])), [rows]);
  // Stay on a page that still exists when the list shrinks (an archive, a refresh).
  const lastPage = Math.max(0, Math.ceil(list.length / perPage) - 1);
  const current = Math.min(page, lastPage);
  const pageRows = list.slice(current * perPage, (current + 1) * perPage);
  const open = rows?.find((b) => b.ref === openRef) ?? null;
  const filtered = filters.query || filters.stay !== 'any' || filters.hideTests || filters.sort !== 'booked';

  if (error && !rows) return <Alert severity="error" action={<Button color="inherit" size="small" onClick={() => void load()}>Try again</Button>}>{error}</Alert>;
  if (!rows) return <Stack alignItems="center" sx={{ py: 8 }}><CircularProgress aria-label="Loading bookings" /></Stack>;

  return <Box>
    <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
      <Stack direction="row" alignItems="center" spacing={.5}>
        <Typography sx={{ fontWeight: 700 }}>Reservations</Typography>
        <InfoButton label="About bookings">
          <p>Every booking made on the website, with the guest’s details. Reservations must add each paid booking to SiteMinder manually using the emailed booking details, then open it here and press “Entered in SiteMinder”.</p>
          <p>“Unfinished” are guests who started booking but didn’t pay; they’re deleted after 30 days. Archive bookings you’re done with to keep the list short — nothing is deleted.</p>
          <p>Voids and refunds are made in the payment provider’s portal: the 2C2P merchant portal, or the Stripe Dashboard for Stripe payments. Open a booking and press “Check 2C2P status” (or “Check Stripe status”) to sync its payment. Reversed payments appear under “Needs attention” for review.</p>
        </InfoButton>
      </Stack>
      <Stack direction="row" alignItems="center" spacing={.5}>
        {loadedAt && <Typography sx={{ fontSize: 12, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>Updated {loadedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</Typography>}
        <Tooltip title="Refresh"><span><IconButton aria-label="Refresh" onClick={() => void load()} disabled={loading}>{loading ? <CircularProgress size={18} /> : <RefreshRounded />}</IconButton></span></Tooltip>
      </Stack>
    </Stack>
    {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

    <Summary rows={rows} filters={filters} onPick={(next) => update(next)} />

    {/* Which bookings: a row of views with counts, then search and filters. */}
    <Stack direction="row" flexWrap="wrap" useFlexGap gap={.75} sx={{ mt: 3, mb: 1.5 }} role="tablist" aria-label="Which bookings">
      {VIEWS.map((v) => {
        const active = filters.view === v.value;
        return <Tooltip key={v.value} title={v.hint}>
          <ButtonBase role="tab" aria-selected={active} onClick={() => update({ view: v.value })} sx={{
            px: 1.5, height: 34, borderRadius: 99, fontSize: 13, fontWeight: 700, gap: .75,
            border: '1px solid', borderColor: active ? 'primary.main' : 'divider', bgcolor: active ? 'primary.main' : 'background.paper', color: active ? '#fff' : 'text.primary',
          }}>
            {v.label}
            <Box component="span" sx={{ minWidth: 20, px: .6, height: 20, borderRadius: 99, display: 'inline-grid', placeItems: 'center', fontSize: 11,
              bgcolor: active ? 'rgba(255,255,255,.22)' : v.value === 'action' && counts.action ? '#fff1cc' : 'rgba(23,60,44,.06)', color: active ? '#fff' : v.value === 'action' && counts.action ? '#7a4f00' : 'text.secondary' }}>{counts[v.value]}</Box>
          </ButtonBase>
        </Tooltip>;
      })}
    </Stack>
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr) minmax(0, 1fr)', md: 'minmax(0, 2fr) minmax(0, 1fr) minmax(0, 1fr)' }, gap: 1.25, mb: 1 }}>
      <TextField size="small" placeholder="Search name, email, phone, reference…" value={filters.query} onChange={(e) => update({ query: e.target.value })}
        sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}
        slotProps={{ input: {
          startAdornment: <InputAdornment position="start"><SearchRounded sx={{ fontSize: 20 }} /></InputAdornment>,
          endAdornment: filters.query ? <InputAdornment position="end"><IconButton size="small" aria-label="Clear search" onClick={() => update({ query: '' })}><CloseRounded sx={{ fontSize: 18 }} /></IconButton></InputAdornment> : undefined,
        } }} />
      <TextField size="small" select label="Stay dates" value={filters.stay} onChange={(e) => update({ stay: e.target.value as Filters['stay'] })}>
        {STAY_FILTERS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
      </TextField>
      <TextField size="small" select label="Sort" value={filters.sort} onChange={(e) => update({ sort: e.target.value as Filters['sort'] })}>
        {SORTS.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
      </TextField>
    </Box>
    {filters.stay === 'custom' && <Stack direction="row" spacing={1.25} sx={{ mb: 1 }}>
      <TextField size="small" type="date" label="Arriving from" value={filters.from} onChange={(e) => update({ from: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} sx={{ flex: 1 }} />
      <TextField size="small" type="date" label="Arriving until" value={filters.to} onChange={(e) => update({ to: e.target.value })} slotProps={{ inputLabel: { shrink: true } }} sx={{ flex: 1 }} />
    </Stack>}
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{plural(list.length, 'booking')}</Typography>
      <Stack direction="row" alignItems="center">
        <FormControlLabel control={<Checkbox size="small" checked={filters.hideTests} onChange={(e) => update({ hideTests: e.target.checked })} />} label={<Typography sx={{ fontSize: 13 }}>Hide test payments</Typography>} sx={{ mr: filtered ? 1 : 0 }} />
        {filtered && <Button size="small" variant="text" onClick={() => update({ ...DEFAULT_FILTERS, view: filters.view })} sx={{ minHeight: 0 }}>Clear filters</Button>}
      </Stack>
    </Stack>

    {list.length === 0
      ? <Box sx={{ py: 7, textAlign: 'center', border: '1px dashed', borderColor: 'divider', borderRadius: '18px' }}>
        <Typography sx={{ fontWeight: 700 }}>{filters.view === 'action' && !filtered ? 'All caught up' : 'No bookings match'}</Typography>
        <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: .5 }}>{filters.view === 'action' && !filtered ? 'Every paid booking is in SiteMinder.' : 'Try another view or clear the filters.'}</Typography>
      </Box>
      : <>
        {wide ? <BookingTable rows={pageRows} onOpen={setOpenRef} /> : <BookingCards rows={pageRows} onOpen={setOpenRef} />}
        <TablePagination component="div" count={list.length} page={current} onPageChange={(_, next) => { setPage(next); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          rowsPerPage={perPage} rowsPerPageOptions={PAGE_SIZES} labelRowsPerPage="Per page"
          onRowsPerPageChange={(e) => { const n = Number(e.target.value); setPerPage(n); setPage(0); try { localStorage.setItem(PAGE_SIZE_KEY, String(n)); } catch { /* private window */ } }}
          sx={{ mt: 1, borderBottom: 0, '& .MuiTablePagination-toolbar': { px: 0, flexWrap: 'wrap', justifyContent: 'flex-end' }, '& .MuiTablePagination-spacer': { display: 'none' } }} />
      </>}

    <BookingDetail booking={open} onClose={() => setOpenRef(null)} onChanged={load} />
  </Box>;
}

// Four numbers that answer "what needs doing?" — each one a shortcut to the matching list.
function Summary({ rows, filters, onPick }: { rows: DeskBooking[]; filters: Filters; onPick: (next: Partial<Filters>) => void }) {
  const today = todayInBangkok();
  const live = rows.filter((b) => isPaid(b) && !b.archived_at);
  const month = today.slice(0, 7);
  const paidThisMonth = rows.filter((b) => isPaid(b) && b.paid_at && new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Bangkok' }).format(new Date(b.paid_at)).startsWith(month));
  const takings = paidThisMonth.reduce((sum, b) => sum + (b.paid_amount ?? b.deposit_amount), 0);
  const tiles = [
    { label: 'Needs attention', value: String(rows.filter(needsAction).length), note: 'SiteMinder entry or payment review', tone: rows.some(needsAction) ? 'warning' : 'ok', pick: { view: 'action', stay: 'any', sort: 'booked' } },
    { label: 'Arriving in 7 days', value: String(live.filter((b) => b.check_in >= today && b.check_in <= addDays(today, 7)).length), note: `Today: ${live.filter((b) => b.check_in === today).length}`, tone: 'ok', pick: { view: 'paid', stay: 'week', sort: 'arrival' } },
    { label: 'Staying now', value: String(live.filter((b) => b.check_in <= today && b.check_out > today).length), note: 'Website guests in house', tone: 'ok', pick: { view: 'paid', stay: 'inHouse', sort: 'arrival' } },
    { label: 'Paid online this month', value: money(takings, rows[0]?.currency ?? 'THB'), note: `${plural(paidThisMonth.length, 'booking')}${paidThisMonth.some(isTest) ? ' · incl. test payments' : ''}`, tone: 'ok', pick: { view: 'paid', stay: 'any', sort: 'booked' } },
  ] as const;
  return <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: { xs: 1, sm: 1.5 } }}>
    {tiles.map((tile) => {
      const active = filters.view === tile.pick.view && filters.stay === tile.pick.stay && filters.sort === tile.pick.sort;
      const warn = tile.tone === 'warning';
      return <ButtonBase key={tile.label} onClick={() => onPick(tile.pick)} sx={{
        display: 'block', textAlign: 'left', p: { xs: 1.5, sm: 2 }, borderRadius: '18px', border: '1px solid', minWidth: 0,
        borderColor: active ? 'primary.main' : warn ? '#f0d27a' : 'divider', bgcolor: warn ? '#fffaeb' : 'background.paper',
        boxShadow: active ? '0 0 0 1px #006d8a inset' : 'none', transition: 'border-color .15s', '&:hover': { borderColor: 'primary.main' },
      }}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: warn ? '#7a4f00' : 'text.secondary', lineHeight: 1.3 }}>{tile.label}</Typography>
        <Typography sx={{ fontFamily: 'Fredoka, sans-serif', fontSize: { xs: 24, sm: 30 }, lineHeight: 1.2, mt: .5, fontVariantNumeric: 'tabular-nums', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tile.value}</Typography>
        <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: .25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tile.note}</Typography>
      </ButtonBase>;
    })}
  </Box>;
}

const stayText = (b: DeskBooking) => `${shortDayLabel(b.check_in)} → ${dayMonthLabel(b.check_out)}`;
const roomsText = (b: DeskBooking) => b.items.length === 1 ? `${b.items[0].quantity > 1 ? `${b.items[0].quantity} × ` : ''}${b.items[0].roomTypeName}` : plural(roomCount(b), 'room');
const amountOf = (b: DeskBooking) => (isPaid(b) ? b.paid_amount ?? b.deposit_amount : b.deposit_amount);

function BookingTable({ rows, onOpen }: { rows: DeskBooking[]; onOpen: (ref: string) => void }) {
  const head = { fontSize: 12, fontWeight: 700, color: 'text.secondary', py: 1.25, borderColor: 'divider', whiteSpace: 'nowrap' } as const;
  return <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '18px', overflow: 'hidden', bgcolor: 'background.paper' }}>
    <Table size="small" sx={{ '& td': { borderColor: 'divider', py: 1.5 } }}>
      <TableHead sx={{ bgcolor: 'rgba(23,60,44,.03)' }}>
        <TableRow>
          <TableCell sx={head}>Guest</TableCell>
          <TableCell sx={head}>Stay</TableCell>
          <TableCell sx={head}>Booked</TableCell>
          <TableCell sx={head} align="right">Paid</TableCell>
          <TableCell sx={head}>Payment</TableCell>
          <TableCell sx={head}>SiteMinder</TableCell>
          <TableCell sx={{ ...head, width: 32 }} />
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((b) => {
          const sm = siteMinderBadge(b);
          return <TableRow key={b.ref} hover tabIndex={0} onClick={() => onOpen(b.ref)} onKeyDown={(e) => { if (e.key === 'Enter') onOpen(b.ref); }}
            sx={{ cursor: 'pointer', opacity: isPaid(b) || b.status === 'pending' ? 1 : .72, '&:last-child td': { borderBottom: 0 }, '&:focus-visible': { outline: '2px solid #006d8a', outlineOffset: -2 } }}>
            <TableCell sx={{ maxWidth: 240 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guestName(b)}</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.ref}{b.guest_country ? ` · ${countryName(b.guest_country)}` : ''}</Typography>
            </TableCell>
            <TableCell>
              <Typography sx={{ fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}>{stayText(b)}</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' }}>{plural(nightCount(b), 'night')} · {roomsText(b)}</Typography>
            </TableCell>
            <TableCell sx={{ fontSize: 13, color: 'text.secondary', whiteSpace: 'nowrap' }}>{stampShortLabel(b.created_at)}</TableCell>
            <TableCell align="right">
              <Typography sx={{ fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{money(amountOf(b), b.currency)}</Typography>
              {b.balance_amount > 0 && <Typography sx={{ fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap' }}>of {money(b.total_amount, b.currency)}</Typography>}
            </TableCell>
            <TableCell><Stack direction="row" spacing={.5}><StatusChip badge={paymentBadge(b)} />{isTest(b) && <StatusChip badge={{ label: 'Test', tone: 'info' }} />}</Stack></TableCell>
            <TableCell>{sm ? <StatusChip badge={sm} /> : <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>—</Typography>}</TableCell>
            <TableCell sx={{ pl: 0 }}><ChevronRightRounded sx={{ color: 'text.secondary', display: 'block' }} /></TableCell>
          </TableRow>;
        })}
      </TableBody>
    </Table>
  </Box>;
}

function BookingCards({ rows, onOpen }: { rows: DeskBooking[]; onOpen: (ref: string) => void }) {
  return <Stack spacing={1.25}>
    {rows.map((b) => {
      const sm = siteMinderBadge(b);
      return <ButtonBase key={b.ref} onClick={() => onOpen(b.ref)} sx={{
        display: 'block', textAlign: 'left', p: 1.75, borderRadius: '18px', border: '1px solid', bgcolor: 'background.paper',
        borderColor: needsAction(b) ? '#f0d27a' : 'divider', opacity: isPaid(b) || b.status === 'pending' ? 1 : .75,
      }}>
        <Stack direction="row" justifyContent="space-between" spacing={1.5}>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guestName(b)}</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{stayText(b)} · {plural(nightCount(b), 'night')}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
            <Typography sx={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{money(amountOf(b), b.currency)}</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{b.ref}</Typography>
          </Box>
        </Stack>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: .25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{roomsText(b)} · booked {stampShortLabel(b.created_at)}</Typography>
        <Stack direction="row" flexWrap="wrap" useFlexGap gap={.5} sx={{ mt: 1 }}>
          <StatusChip badge={paymentBadge(b)} />
          {sm && <StatusChip badge={sm} />}
          {isTest(b) && <StatusChip badge={{ label: 'Test', tone: 'info' }} />}
        </Stack>
      </ButtonBase>;
    })}
  </Stack>;
}
