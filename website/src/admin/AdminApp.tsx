import LogoutRounded from '@mui/icons-material/LogoutRounded';
import { Alert, Box, Button, CircularProgress, Container, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import type { Session } from '@supabase/supabase-js';
import { useEffect, useState, type FormEvent } from 'react';
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

  let body;
  if (!supabase) body = <Alert severity="warning">The CMS isn’t connected yet: set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY and redeploy.</Alert>;
  else if (session === undefined || (session && isAdmin === null)) body = <CircularProgress />;
  else if (!session) body = <SignIn />;
  else if (!isAdmin) body = <Stack spacing={2} alignItems="flex-start">
    <Alert severity="warning">{session.user.email} isn’t on the staff list for this website. Ask the website team to add you.</Alert>
    <Button onClick={() => void supabase!.auth.signOut()}>Sign out</Button>
  </Stack>;
  else body = <>
    <Tabs value={tab} onChange={(_, next: number) => setTab(next)} variant="scrollable" allowScrollButtonsMobile sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
      {TABS.map((t) => <Tab key={t.label} label={t.label} />)}
    </Tabs>
    {TABS[tab].render()}
  </>;

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
        {session && <Button size="small" startIcon={<LogoutRounded />} onClick={() => void supabase!.auth.signOut()}>Sign out</Button>}
      </Stack>
      {body}
    </Container>
  </Box>;
}

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true); setError(null);
    const { error: signInError } = await supabase!.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (signInError) setError(signInError.message === 'Invalid login credentials' ? 'That email and password don’t match.' : signInError.message);
  };
  return <Box component="form" onSubmit={submit} sx={{ maxWidth: 380, p: 3, border: '1px solid', borderColor: 'divider', borderRadius: '24px', bgcolor: 'background.paper' }}>
    <Typography variant="h2" sx={{ fontSize: 24, mb: 2 }}>Sign in</Typography>
    <Stack spacing={2}>
      <TextField label="Email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <TextField label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <Alert severity="error">{error}</Alert>}
      <Button type="submit" variant="contained" disabled={busy || !email || !password}>{busy ? 'Signing in…' : 'Sign in'}</Button>
    </Stack>
  </Box>;
}
