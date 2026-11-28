import LockRounded from '@mui/icons-material/LockRounded';
import LogoutRounded from '@mui/icons-material/LogoutRounded';
import VisibilityOffRounded from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRounded from '@mui/icons-material/VisibilityRounded';
import West from '@mui/icons-material/West';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
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
  { label: '7-day programme', render: () => <ContentManager config={activitiesConfig} /> },
  { label: 'Events', render: () => <ContentManager config={eventsConfig} /> },
  { label: 'Offers', render: () => <ContentManager config={offersConfig} /> },
  { label: 'Bookings', render: () => <BookingsPanel /> },
];

export default function AdminApp() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [permissionAttempt, setPermissionAttempt] = useState(0);
  const [tab, setTab] = useState(0);
  const [passwordRecovery, setPasswordRecovery] = useState(
    () => new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery',
  );
  const phone = useMediaQuery(useTheme().breakpoints.down('sm'), { noSsr: true });

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;
        setSession(data.session);
        if (error) setConnectionError('We couldn’t restore your staff session. Please sign in again.');
      })
      .catch(() => {
        if (active) {
          setSession(null);
          setConnectionError('We couldn’t connect to staff sign-in. Please try again.');
        }
      });
    const { data } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !session) {
      setIsAdmin(null);
      return;
    }
    let active = true;
    setIsAdmin(null);
    setConnectionError(null);
    void Promise.resolve(supabase.rpc('is_admin'))
      .then(({ data, error }) => {
        if (!active) return;
        setIsAdmin(data === true && !error);
        if (error) setConnectionError('We couldn’t check your staff access. Please retry.');
      })
      .catch(() => {
        if (active) {
          setIsAdmin(false);
          setConnectionError('We couldn’t check your staff access. Please retry.');
        }
      });
    return () => {
      active = false;
    };
  }, [session, permissionAttempt]);

  // Everything before the editor — not connected, loading, signing in, not on
  // the staff list — is one card in the middle of the screen.
  if (!supabase)
    return (
      <CentredCard>
        <Alert severity="info">Staff sign-in is being connected. Please contact the website team for access.</Alert>
      </CentredCard>
    );
  if (session === undefined || (session && isAdmin === null))
    return (
      <CentredCard>
        <Stack alignItems="center" sx={{ py: 4 }}>
          <CircularProgress aria-label="Loading" />
        </Stack>
      </CentredCard>
    );
  if (!session)
    return (
      <CentredCard>
        {connectionError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {connectionError}
          </Alert>
        )}
        <SignIn />
      </CentredCard>
    );
  if (passwordRecovery)
    return (
      <CentredCard>
        <SetPassword
          onDone={() => {
            setPasswordRecovery(false);
            window.history.replaceState(null, '', '/admin');
          }}
        />
      </CentredCard>
    );
  if (connectionError)
    return (
      <CentredCard>
        <Alert severity="error">{connectionError}</Alert>
        <Button fullWidth variant="contained" onClick={() => setPermissionAttempt((attempt) => attempt + 1)} sx={{ mt: 2.5 }}>
          Retry connection
        </Button>
        <Button fullWidth onClick={() => void supabase!.auth.signOut()} sx={{ mt: 1 }}>
          Sign out
        </Button>
      </CentredCard>
    );
  if (!isAdmin)
    return (
      <CentredCard>
        <Alert severity="warning">{session.user.email} isn’t on the staff list for this website. Ask the website team to add you.</Alert>
        <Button fullWidth variant="outlined" onClick={() => void supabase!.auth.signOut()} sx={{ mt: 2.5 }}>
          Sign out
        </Button>
      </CentredCard>
    );

  const signOut = () => void supabase!.auth.signOut();
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: { xs: 2, md: 5 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} sx={{ mb: { xs: 2, md: 4 } }}>
          <Stack direction="row" alignItems="center" spacing={{ xs: 1.5, sm: 2 }} sx={{ minWidth: 0 }}>
            <Box
              component="img"
              src="/logo/royal-pineapple.svg"
              alt=""
              sx={{ height: { xs: 40, sm: 48 }, width: 'auto', aspectRatio: '863 / 733' }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h1" sx={{ fontSize: { xs: 22, md: 30 } }}>
                Website admin
              </Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', display: { xs: 'none', sm: 'block' } }}>
                The 7-day programme, events, offers and website bookings
              </Typography>
            </Box>
          </Stack>
          {phone ? (
            <IconButton aria-label="Sign out" onClick={signOut} sx={{ color: 'primary.main' }}>
              <LogoutRounded />
            </IconButton>
          ) : (
            <Button size="small" startIcon={<LogoutRounded />} onClick={signOut}>
              Sign out
            </Button>
          )}
        </Stack>
        {/* A fixed row, never scrollable: scrollable tabs add arrow buttons and
          slide the row along on every click. On phones the four tabs share
          the width equally. */}
        <Tabs
          value={tab}
          onChange={(_, next: number) => setTab(next)}
          variant={phone ? 'fullWidth' : 'standard'}
          sx={{
            mb: 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
            '& .MuiTab-root': phone ? { minWidth: 0, px: 0.5, fontSize: 14 } : {},
          }}
        >
          {TABS.map((t) => (
            <Tab key={t.label} label={t.label} />
          ))}
        </Tabs>
        {TABS[tab].render()}
      </Container>
    </Box>
  );
}

// The resort's cream page with soft lime and pool-blue light in the corners,
// and a card with the same green top edge as the booking panel.
function CentredCard({ children }: { children: ReactNode }) {
  return (
    <Box
      component="main"
      sx={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        py: { xs: 4, sm: 6 },
        bgcolor: 'background.default',
        backgroundImage:
          'radial-gradient(circle at 12% 8%, rgba(253,230,238,.9), transparent 42%), radial-gradient(circle at 88% 92%, rgba(217,245,252,.8), transparent 45%)',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 420 }}>
        <Box
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderTop: '5px solid #c92f6b',
            bgcolor: 'background.paper',
            borderRadius: '28px',
            boxShadow: '0 16px 36px rgba(90,36,72,.09)',
            px: { xs: 3, sm: 4.5 },
            pt: { xs: 3.5, sm: 4.5 },
            pb: { xs: 3, sm: 4 },
          }}
        >
          <Stack alignItems="center" sx={{ textAlign: 'center', mb: 3.5 }}>
            <Box
              component="img"
              src="/logo/royal-pineapple.svg"
              alt="Royal Pineapple Hotel"
              sx={{ height: 76, width: 'auto', aspectRatio: '863 / 733' }}
            />
            <Box
              component="span"
              sx={{
                mt: 2,
                px: 1.75,
                py: 0.75,
                borderRadius: 99,
                bgcolor: 'success.light',
                color: 'success.main',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '.12em',
                textTransform: 'uppercase',
                lineHeight: 1,
              }}
            >
              Website admin
            </Box>
            <Typography variant="h1" sx={{ fontSize: { xs: 28, sm: 32 }, mt: 1.75, lineHeight: 1.15 }}>
              Welcome back
            </Typography>
            <Typography sx={{ mt: 1, fontSize: 14, color: 'text.secondary', maxWidth: 300 }}>
              Sign in to update the 7-day programme, events and offers on the website.
            </Typography>
          </Stack>
          {children}
        </Box>
        <Stack alignItems="center" sx={{ mt: 2.5 }}>
          <Link
            href="/"
            onClick={linkClick('/')}
            underline="hover"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, fontSize: 13, fontWeight: 700, color: 'text.secondary' }}
          >
            <West sx={{ fontSize: 16 }} />
            Back to the website
          </Link>
        </Stack>
      </Box>
    </Box>
  );
}

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reset, setReset] = useState(false);
  const [sent, setSent] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (reset) {
        const { error: resetError } = await supabase!.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
          redirectTo: `${window.location.origin}/admin`,
        });
        if (resetError) setError('We couldn’t send the link. Please try again shortly.');
        else setSent(true);
        return;
      }
      const { error: signInError } = await supabase!.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (signInError)
        setError(
          signInError.message === 'Invalid login credentials'
            ? 'That email and password don’t match. Check for a missing or extra character.'
            : signInError.message,
        );
    } catch {
      setError('We couldn’t reach staff sign-in. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Box component="form" onSubmit={submit} noValidate>
      <Stack spacing={2}>
        {reset && <Alert severity="info">Enter your staff email to set or reset your password.</Alert>}
        {sent && (
          <Alert severity="success">If this email has staff access, a password link is on its way. Check your inbox and spam folder.</Alert>
        )}
        <TextField
          label="Email"
          type="email"
          autoComplete="username"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
        />
        {!reset && (
          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            fullWidth
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword((s) => !s)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffRounded /> : <VisibilityRounded />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        )}
        {error && <Alert severity="error">{error}</Alert>}
        <Button
          type="submit"
          variant="contained"
          size="large"
          fullWidth
          disabled={busy || !email || (!reset && !password)}
          startIcon={busy ? <CircularProgress size={16} color="inherit" /> : <LockRounded />}
        >
          {busy ? 'Please wait…' : reset ? 'Send password link' : 'Sign in'}
        </Button>
        <Button
          onClick={() => {
            setReset((value) => !value);
            setError(null);
            setSent(false);
          }}
          size="small"
          sx={{ fontFamily: fonts.sans }}
        >
          {reset ? 'Back to sign in' : 'Set or reset your password'}
        </Button>
      </Stack>
    </Box>
  );
}

function SetPassword({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (password.length < 12 || password !== confirm) return;
    setBusy(true);
    setError(null);
    try {
      const { error: updateError } = await supabase!.auth.updateUser({ password });
      if (updateError) setError(updateError.message);
      else onDone();
    } catch {
      setError('We couldn’t save your password. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Box component="form" onSubmit={submit}>
      <Stack spacing={2}>
        <Typography>Choose a staff password with at least 12 characters.</Typography>
        <TextField
          label="New password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          fullWidth
        />
        <TextField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          error={!!confirm && password !== confirm}
          required
          fullWidth
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Button type="submit" variant="contained" disabled={busy || password.length < 12 || password !== confirm}>
          {busy ? 'Saving…' : 'Save password'}
        </Button>
      </Stack>
    </Box>
  );
}
