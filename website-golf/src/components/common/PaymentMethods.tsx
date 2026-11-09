import { Box, Stack, Typography, type SxProps, type Theme } from '@mui/material';

// The ways to pay the club shows guests: cards and PromptPay.
// The logos are in public/images/payments/.
const CARDS = [{ file: 'visa', name: 'Visa' }, { file: 'mastercard', name: 'Mastercard' }, { file: 'jcb', name: 'JCB' }, { file: 'unionpay', name: 'UnionPay' }];

const chip = (size: number) => ({ display: 'flex', alignItems: 'center', height: size, overflow: 'hidden', borderRadius: `${Math.round(size / 4)}px`, bgcolor: 'common.white', boxShadow: '0 0 0 1px rgba(23,60,44,.12)' });

/** The card brands and PromptPay in one tidy row, for beside a price or a pay button. */
export function PaymentLogos({ size = 28, sx }: { size?: number; sx?: SxProps<Theme> }) {
  const logoWidth = Math.round(size * 1.5);
  return <Stack component="ul" direction="row" flexWrap="wrap" alignItems="center" useFlexGap gap={.75} sx={[{ listStyle: 'none', m: 0, p: 0 }, ...(Array.isArray(sx) ? sx : [sx])]}>
    {CARDS.map((card) => <Box component="li" key={card.name} sx={chip(size)}>
      <Box component="img" src={`/images/payments/${card.file}.webp`} alt={card.name} title={card.name} width={logoWidth} height={size} loading="lazy" decoding="async" sx={{ display: 'block', objectFit: 'cover' }} />
    </Box>)}
    <Box component="li" sx={{ ...chip(size), gap: .5, pr: 1 }}>
      <Box component="img" src="/images/payments/promptpay.webp" alt="" width={size} height={size} loading="lazy" decoding="async" sx={{ display: 'block' }} />
      <Typography component="span" sx={{ fontSize: Math.max(11, Math.round(size * .43)), fontWeight: 700, color: '#0b3c6d', whiteSpace: 'nowrap' }}>PromptPay</Typography>
    </Box>
  </Stack>;
}
