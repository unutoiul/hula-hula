// Runs the api/ functions locally on port 3003, where `npm run dev` proxies
// /api (see vite.config.ts). `vercel dev` only picks up the project's cloud
// "Development" variables, so `npm run dev:api` loads .env.local first and
// hands it down — that's where the Supabase and Resend settings live.
import { spawn } from 'node:child_process';

spawn('vercel', ['dev', '--listen', '3003', '--yes'], { stdio: 'inherit', shell: true })
  .on('exit', (code) => process.exit(code ?? 0));
