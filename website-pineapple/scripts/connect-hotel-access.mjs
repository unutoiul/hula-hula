// Load setup-only credentials from the ignored env file; never print them.
import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const credentials = {
  supabaseAccessToken: process.env.SUPABASE_ACCESS_TOKEN,
  siteMinderKey: process.env.SITEMINDER_API_KEY,
  propertyId: process.env.SITEMINDER_PROPERTY_ID,
};
const api = 'https://directbooking.siteminder.com/public-api/api';
const response = await fetch(`${api}/properties/${encodeURIComponent(credentials.propertyId)}`, {
  headers: { 'x-sm-api-key': credentials.siteMinderKey, accept: 'application/json' },
  signal: AbortSignal.timeout(20_000),
});
const property = await response.json();
if (!response.ok) throw new Error(`SiteMinder property verification returned ${response.status}`);
if (!/pineapple/i.test(property.name ?? '')) throw new Error('The SiteMinder property is not Royal Pineapple');

const projectResponse = await fetch('https://api.supabase.com/v1/projects', {
  headers: { Authorization: `Bearer ${credentials.supabaseAccessToken}` },
  signal: AbortSignal.timeout(20_000),
});
if (!projectResponse.ok) throw new Error(`Supabase project access returned ${projectResponse.status}`);
const projects = await projectResponse.json();
const project = projects.find(item => item.id === 'nmenfmqgwqpmlfhccdok');
if (!project || !/pineapple/i.test(project.name)) throw new Error('The expected separate Royal Pineapple Supabase project was not found');

const envPath = resolve('.env.local');
let environment = await readFile(envPath, 'utf8');
const settings = {
  SITEMINDER_API_KEY: credentials.siteMinderKey,
  SITEMINDER_PROPERTY_ID: credentials.propertyId,
  VITE_BOOKING_ENGINE_URL: property.bookingEngineUrl ?? '',
};
for (const [key, value] of Object.entries(settings)) {
  const line = `${key}=${JSON.stringify(value)}`;
  const pattern = new RegExp(`^${key}=.*$`, 'm');
  environment = pattern.test(environment) ? environment.replace(pattern, line) : environment.trimEnd() + '\n' + line + '\n';
}
await writeFile(envPath, environment);
console.log(JSON.stringify({
  property: { id: property.uuid, name: property.name, currency: property.currencyIsoCode, bookingEngineUrl: property.bookingEngineUrl },
  database: { id: project.id, name: project.name, region: project.region, status: project.status },
  credentialsSaved: true,
}, null, 2));
