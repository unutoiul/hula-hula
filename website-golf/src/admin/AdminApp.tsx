import LockRounded from '@mui/icons-material/LockRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import SearchRounded from '@mui/icons-material/SearchRounded';
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import West from '@mui/icons-material/West';
import { Alert, Box, Button, CircularProgress, Container, IconButton, InputAdornment, Link, Stack, TextField, Tooltip, Typography } from '@mui/material';
import type { Session } from '@supabase/supabase-js';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { linkClick } from '../router';
import { DaySheet } from './DaySheet';
import { SearchDialog } from './SearchDialog';
import { supabase } from './supabase';

// /admin — the golf club's staff app, made for a phone at the front desk:
// the day's tee sheet, check-ins, phone and walk-in bookings, and blocked
// times. Staff sign in with the email and password set up for them in
// the golf club's Supabase project (Authentication → Users); only addresses
// on golf_staff get in.

export default function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isStaff, setIsStaff] = useState<boolean | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [jumpTo, setJumpTo] = useState<string | null>(null);

  // Keep the staff app out of search engines.
  useEffect(() => {
    const robots = Object.assign(document.createElement('meta'), { name: 'robots', content: 'noindex, nofollow' });
    document.head.appendChild(robots);
    const previous = document.title;
    document.title = 'Tee sheet — Hula Hula Golf Club';
    return () => { robots.remove(); document.title = previous; };
  }, []);

  useEffect(() => {
    if (!supabase) return;
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!supabase || !session) { setIsStaff(null); return; }
    void supabase.rpc('is_golf_staff').then(({ data }) => setIsStaff(data === true));
  }, [session]);

  if (!supabase) return <CentredCard><Alert severity="warning">The staff app isn’t connected yet: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and redeploy.</Alert></CentredCard>;
  if (session === undefined || (session && isStaff === null)) return <CentredCard><Stack alignItems="center" sx={{ py: 4 }}><CircularProgress aria-label="Loading" /></Stack></CentredCard>;
  if (!session) return <CentredCard><SignIn /></CentredCard>;
  if (!isStaff) return <CentredCard>
    <Alert severity="warning">{session.user.email} isn’t on the golf club’s staff list. Ask the website team to add you.</Alert>
    <Button fullWidth variant="outlined" onClick={() => void supabase!.auth.signOut()} sx={{ mt: 2.5 }}>Sign out</Button>
  </CentredCard>;

  return <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: { xs: 12, md: 6 } }}>
    <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 10, bgcolor: 'rgba(255,253,243,.96)', backdropFilter: 'blur(12px)', borderBottom: '1px solid', borderColor: 'divider' }}>
      <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 3 } }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minHeight: 60 }}>
          <Box component="img" src="/logo/hula-hula-golf.svg" alt="" sx={{ height: 40, width: 'auto' }} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontFamily: 'inherit', fontWeight: 700, lineHeight: 1.2 }}>Tee sheet</Typography>
            <Typography noWrap sx={{ fontSize: 12, color: 'text.secondary' }}>{session.user.email}</Typography>
          </Box>
          <Tooltip title="Find a booking"><IconButton aria-label="Find a booking" onClick={() => setSearchOpen(true)} sx={{ border: '1px solid', borderColor: 'divider' }}><SearchRounded /></IconButton></Tooltip>
          <Tooltip title="Sign out"><IconButton aria-label="Sign out" onClick={() => void supabase!.auth.signOut()} sx={{ border: '1px solid', borderColor: 'divider' }}><LogoutRounded /></IconButton></Tooltip>
        </Stack>
      </Container>
    </Box>
    <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 3 }, pt: 2 }}>
      <DaySheet jumpTo={jumpTo} />
    </Container>
    <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} onPick={(date) => { setJumpTo(`${date}#${Date.now()}`); setSearchOpen(false); }} />
  </Box>;
}

function CentredCard({ children }: { children: ReactNode }) {
  return <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 2 }}>
    <Box sx={{ width: '100%', maxWidth: 420 }}>
      <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderTop: '5px solid #50830d', borderRadius: '24px', p: { xs: 3, sm: 4 }, boxShadow: '0 16px 36px rgba(23,60,44,.07)' }}>
        <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
          <Box component="img" src="/logo/hula-hula-golf.svg" alt="Hula Hula Golf Club" sx={{ height: 72, width: 'auto' }} />
          <Typography variant="h3" sx={{ fontSize: 26 }}>Staff tee sheet</Typography>
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
    // A copied password often brings a stray space along.
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
      <Typography sx={{ fontSize: 12, color: 'text.secondary', textAlign: 'center' }}>Forgot your password? Ask the website team to reset it.</Typography>
    </Stack>
  </Box>;
}
