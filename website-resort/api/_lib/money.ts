// Money is added up in whole satang (1/100 baht) so totals never drift by a
// floating-point fraction, and only turned back into baht at the edges.
export const toSatang = (amount: number) => Math.round(amount * 100);
export const fromSatang = (satang: number) => satang / 100;

const thb = new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
export const formatMoney = (amount: number, currency = 'THB') => `${currency} ${thb.format(amount)}`;
