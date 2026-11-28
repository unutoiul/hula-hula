import assert from 'node:assert/strict';
import { it } from 'node:test';
import { ALWAYS_BCC, sendTemplate } from '../api/_lib/resend.ts';

// Every email the site sends carries a hidden copy for Bluetrendy, and nobody
// who gets the email can see it. The same test lives in all three sites.

type Payload = { to: string[]; cc?: string[]; bcc?: string[] };

async function captured(send: () => Promise<unknown>): Promise<Payload> {
  const previousFetch = globalThis.fetch;
  const previousKey = process.env.RESEND_API_KEY;
  let payload: Payload | undefined;
  process.env.RESEND_API_KEY = 'synthetic-key-never-sent';
  globalThis.fetch = (async (_url: string, init: { body: string }) => {
    payload = JSON.parse(init.body);
    return new Response('{}', { status: 200 });
  }) as typeof fetch;
  try {
    await send();
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previousKey;
  }
  assert.ok(payload, 'no email was sent');
  return payload;
}

const hidden = (payload: Payload) => {
  assert.ok(payload.bcc?.includes(ALWAYS_BCC), 'Bluetrendy is blind-copied');
  assert.ok(!payload.to.some((address) => address.toLowerCase() === ALWAYS_BCC), 'and is not a visible recipient');
  assert.equal(payload.cc, undefined, 'nobody is copied visibly');
};

it('a guest confirmation carries the hidden copy', async () => {
  hidden(
    await captured(() =>
      sendTemplate({
        from: 'Hotel <reservation@example.com>',
        to: ['guest@example.org'],
        subject: 'Booked',
        template: 'booking-confirmation',
        variables: {},
      }),
    ),
  );
});

it('a team notification keeps its own blind copies and adds the hidden one once', async () => {
  const payload = await captured(() =>
    sendTemplate({
      from: 'Hotel <reservation@example.com>',
      to: ['reservation@example.com'],
      bcc: ['CONTACT@bluetrendy.com', 'manager@example.com'],
      subject: 'New booking',
      template: 'booking-notification',
      variables: {},
    }),
  );
  hidden(payload);
  assert.equal(payload.bcc?.filter((address) => address.toLowerCase() === ALWAYS_BCC).length, 1);
  assert.ok(payload.bcc?.includes('manager@example.com'));
});

it('a misconfigured inbox that lists Bluetrendy still keeps it hidden', async () => {
  const payload = await captured(() =>
    sendTemplate({
      from: 'Hotel <reservation@example.com>',
      to: ['reservation@example.com', 'contact@bluetrendy.com'],
      subject: 'New enquiry',
      template: 'contact-enquiry',
      variables: {},
    }),
  );
  hidden(payload);
  assert.deepEqual(payload.to, ['reservation@example.com']);
});
