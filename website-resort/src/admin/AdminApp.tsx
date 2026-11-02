import LockRounded from '@mui/icons-material/LockRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import West from '@mui/icons-material/West';
import { Alert, Box, Button, CircularProgress, Container, IconButton, InputAdornment, Link, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import type { Session } from '@supabase/supabase-js';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { linkClick } from '../router';
import { fonts } from '../theme';
import { BookingsPanel } from './BookingsPanel';
import { ContentManager } from './ContentManager';
import { activitiesConfig, eventsConfig, offersConfig } from './contentConfigs';
import { supabase } from './supabase';

// /admin — the website's small CMS. Staff sign in with the email and password
// set up for them in Supabase (Authentication → Users); only addresses on the
// admins list get in. Changes show on the website within about a minute.

const TABS = [
  { label: 'Activities', render: () => <ContentManager config={activitiesConfig} /> },
  { label: 'Events', render: () => <ContentManager config={eventsConfig} /> },
  { label: 'Offers', render: () => <ContentManager config={offersConfig} /> },
  { label: 'Bookings', render: () => <BookingsPanel /> },
];

export default function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState(0);

  // Keep the CMS out of search engines.
  useEffect(() => {
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    document.head.appendChild(robots);
    const previous = document.title;
    document.title = 'Website admin — Hula Hula Resort';
    return () => { robots.remove(); document.title = previous; };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session) { setIsAdmin(null); return; }
    void supabase.rpc('is_admin').then(({ data }) => setIsAdmin(data === true));
  }, [session]);

  // Everything before the editor — not connected, loading, signing in, not on
  // the staff list — is one card in the middle of the screen.
  if (!supabase) return <CentredCard><Alert severity="warning">The CMS isn’t connected yet: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and redeploy.</Alert></CentredCard>;
  if (session === undefined || (session && isAdmin === null)) return <CentredCard><Stack alignItems="center" sx={{ py: 4 }}><CircularProgress aria-label="Loading" /></Stack></CentredCard>;
  if (!session) return <CentredCard><SignIn /></CentredCard>;
  if (!isAdmin) return <CentredCard>
    <Alert severity="warning">{session.user.email} isn’t on the staff list for this website. Ask the website team to add you.</Alert>
    <Button fullWidth variant="outlined" onClick={() => void supabase!.auth.signOut()} sx={{ mt: 2.5 }}>Sign out</Button>
  </CentredCard>;

  return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 3, md: 5 } }}>
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Box component="img" src="/logo/hula-hula.svg" alt="" sx={{ height: 48, width: 'auto' }} />
          <Box>
            <Typography variant="h1" sx={{ fontSize: { xs: 24, md: 30 } }}>Website admin</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>Activities, events, offers and website bookings</Typography>
          </Box>
        </Stack>
        <Button size="small" startIcon={<LogoutRounded />} onClick={() => void supabase!.auth.signOut()}>Sign out</Button>
      </Stack>
      <Tabs value={tab} onChange={(_, next: number) => setTab(next)} variant="scrollable" allowScrollButtonsMobile sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
        {TABS.map((t) => <Tab key={t.label} label={t.label} />)}
      </Tabs>
      {TABS[tab].render()}
    </Container>
  </Box>;
}

// The resort's cream page with soft lime and pool-blue light in the corners,
// and a card with the same green top edge as the booking panel.
function CentredCard({ children }: { children: ReactNode }) {
  return <Box component="main" sx={{
    minHeight: '100dvh', display: 'grid', placeItems: 'center', px: 2, py: { xs: 4, sm: 6 }, bgcolor: 'background.default',
    backgroundImage: 'radial-gradient(circle at 12% 8%, rgba(231,244,204,.9), transparent 42%), radial-gradient(circle at 88% 92%, rgba(217,245,252,.8), transparent 45%)',
  }}>
    <Box sx={{ width: '100%', maxWidth: 420 }}>
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderTop: '5px solid #50830d', bgcolor: 'background.paper', borderRadius: '28px', boxShadow: '0 16px 36px rgba(23,60,44,.09)', px: { xs: 3, sm: 4.5 }, pt: { xs: 3.5, sm: 4.5 }, pb: { xs: 3, sm: 4 } }}>
        <Stack alignItems="center" sx={{ textAlign: 'center', mb: 3.5 }}>
          <Box component="img" src="/logo/hula-hula.svg" alt="Hula Hula Resort" sx={{ height: 76, width: 'auto', aspectRatio: '159 / 137.25' }} />
          <Box component="span" sx={{ mt: 2, px: 1.75, py: .75, borderRadius: 99, bgcolor: 'success.light', color: 'success.main', fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', lineHeight: 1 }}>Website admin</Box>
          <Typography variant="h1" sx={{ fontSize: { xs: 28, sm: 32 }, mt: 1.75, lineHeight: 1.15 }}>Welcome back</Typography>
          <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary', maxWidth: 300 }}>Sign in to update activities, events and offers on the website.</Typography>
        </Stack>
        {children}
      </Box>
      <Stack alignItems="center" sx={{ mt: 2.5 }}>
        <Link href="/" onClick={linkClick('/')} underline="hover" sx={{ display: 'inline-flex', alignItems: 'center', gap: .75, fontSize: 13, fontWeight: 700, color: 'text.secondary' }}><West sx={{ fontSize: 16 }} />Back to the website</Link>
      </Stack>
    </Box>
  </Box>;
}

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError(null);
    // A copied password often brings a stray space along — ours never have one.
    const { error: signInError } = await supabase!.auth.signInWithPassword({ email: email.trim().toLowerCase(), password: password.trim() });
    setBusy(false);
    if (signInError) setError(signInError.message === 'Invalid login credentials' ? 'That email and password don’t match. Check for a missing or extra character.' : signInError.message);
  };
  return <Box component="form" onSubmit={submit} noValidate>
    <Stack spacing={2}>
      <TextField label="Email" type="email" autoComplete="username" autoFocus value={email} onChange={(e) => setEmail(e.target.value)} required fullWidth />
      <TextField label="Password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required fullWidth
        slotProps={{ input: { endAdornment: <InputAdornment position="end">
          <IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((s) => !s)} edge="end">
            {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
          </IconButton>
        </InputAdornment> } }} />
      {error && <Alert severity="error">{error}</Alert>}
      <Button type="submit" variant="contained" size="large" fullWidth disabled={busy || !email || !password} startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <LockRounded />}>
        {busy ? 'Signing in…' : 'Sign in'}
      </Button>
      <Typography sx={{ fontFamily: fonts.sans, fontSize: 12, color: 'text.secondary', textAlign: 'center' }}>Forgot your password? Ask the website team to reset it.</Typography>
    </Stack>
  </Box>;
}
