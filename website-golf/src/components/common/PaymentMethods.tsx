import { Box, Stack, Typography, type SxProps, type Theme } from '@mui/material';

// The payment methods Payso has switched on for the club's account (its List
// Payment Channels API, checked 2026-11-09). If methods are added or removed in
// Payso, update these lists; the logos are in public/images/payments/.
// Payso's own payment page shows only the ones that apply to the amount.

interface Method { file: string; name: string }

const CARDS: Method[] = [{ file: 'visa', name: 'Visa' }, { file: 'mastercard', name: 'Mastercard' }, { file: 'jcb', name: 'JCB' }, { file: 'unionpay', name: 'UnionPay' }];
const QR_AND_WALLET: Method[] = [{ file: 'promptpay', name: 'PromptPay QR' }, { file: 'truemoney-wallet', name: 'TrueMoney Wallet' }];

const GROUPS: { label: string; methods: Method[] }[] = [
  { label: 'Cards', methods: CARDS },
  { label: 'QR & wallet', methods: QR_AND_WALLET },
  { label: 'Bank apps', methods: [{ file: 'scb', name: 'SCB' }, { file: 'kplus', name: 'K PLUS' }, { file: 'krungsri', name: 'Krungsri' }, { file: 'bangkok-bank', name: 'Bangkok Bank' }] },
  { label: 'Instalments from ฿3,000', methods: [{ file: 'kbank-card', name: 'Kasikorn card' }, { file: 'scb-cardx', name: 'SCB CardX' }, { file: 'bangkok-bank', name: 'Bangkok Bank card' }, { file: 'krungsri', name: 'Krungsri card' }, { file: 'ktc', name: 'KTC' }, { file: 'first-choice', name: 'Krungsri First Choice' }, { file: 'ttb', name: 'ttb' }] },
  { label: 'At the counter', methods: [{ file: 'big-c', name: 'Big C' }, { file: 'lotus', name: 'Lotus’s' }, { file: 'mpay', name: 'mPay' }, { file: 'cenpay', name: 'CenPay' }, { file: 'pay-at-post', name: 'Pay@Post' }, { file: 'truemoney-express', name: 'TrueMoney Express' }] },
];

function Logos({ methods, size, sx, more = false }: { methods: Method[]; size: number; sx?: SxProps<Theme>; more?: boolean }) {
  return <Stack component="ul" direction="row" flexWrap="wrap" alignItems="center" useFlexGap gap={.75} sx={[{ listStyle: 'none', m: 0, p: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
    {methods.map((method) => <Box component="li" key={method.name} sx={{ display: 'flex' }}>
      <Box component="img" src={`/images/payments/${method.file}.webp`} alt={method.name} title={method.name} width={size} height={size} loading="lazy" decoding="async" sx={{ display: 'block', width: size, height: size, borderRadius: `${Math.round(size / 4.5)}px`, bgcolor: 'common.white', boxShadow: '0 0 0 1px rgba(23,60,44,.12)' }} />
    </Box>)}
    {more && <Box component="li"><Typography component="span" sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', whiteSpace: 'nowrap' }}>+ more</Typography></Box>}
  </Stack>;
}

/** The main ways to pay in one short row, for beside a price or a pay button. */
export function PaymentLogos({ size = 28, sx }: { size?: number; sx?: SxProps<Theme> }) {
  return <Logos methods={[...CARDS, ...QR_AND_WALLET]} size={size} sx={sx} more />;
}

/** Every way to pay, grouped, for the footer. */
export function AllPaymentMethods() {
  return <Box component="section" aria-label="Ways to pay" sx={{ width: '100%', maxWidth: 1040 }}>
    <Typography variant="overline" component="h2" sx={{ display: 'block', fontWeight: 700 }}>Ways to pay online</Typography>
    <Stack direction="row" flexWrap="wrap" justifyContent="center" useFlexGap gap={{ xs: 2, md: 3 }} sx={{ mt: 1.5 }}>
      {GROUPS.map((group) => <Box key={group.label}>
        <Typography sx={{ fontSize: 12, fontWeight: 700, mb: .75 }}>{group.label}</Typography>
        <Logos methods={group.methods} size={32} sx={{ justifyContent: 'center' }} />
      </Box>)}
    </Stack>
  </Box>;
}
