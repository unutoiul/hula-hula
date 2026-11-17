import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';

const names = ['contact-enquiry', 'contact-confirmation', 'booking-notification', 'booking-confirmation'];
const records = [];
for (const name of names) {
  const alias = `rp-${name}`;
  const response = await fetch(`https://api.resend.com/templates/${alias}`, {
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
  });
  assert.ok(response.ok, `${alias}: could not retrieve published template (${response.status})`);
  const template = await response.json();
  assert.equal(template.status, 'published');
  assert.equal(template.html, await readFile(new URL(`../emails/${name}.html`, import.meta.url), 'utf8'));
  assert.equal(template.text, await readFile(new URL(`../emails/${name}.txt`, import.meta.url), 'utf8'));
  assert.equal(template.variables.find(variable => variable.key === 'SITE_URL')?.fallback_value, 'https://hulahula-pineapple.vercel.app');
  const record = { alias, id: template.id, status: template.status, url: `https://resend.com/templates/${template.id}` };
  records.push(record);
  console.log(`Verified ${alias}: published HTML, plain text and production website URL match.`);
  await new Promise(resolve => setTimeout(resolve, 650));
}
await writeFile(new URL('../emails/published-templates.json', import.meta.url), JSON.stringify({ verifiedAt: new Date().toISOString(), templates: records }, null, 2)+'\n');
