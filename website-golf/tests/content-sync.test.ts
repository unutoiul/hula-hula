import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { TestContext } from 'node:test';
import type { ClubOffer } from '../src/booking/config.ts';
import { activeOffers, offerStatus, offerValidation } from '../src/booking/offers.ts';
import { CONTENT_CHANGE_KEY, CONTENT_REFRESH_MS, notifyContentChanged, watchContent } from '../src/data/contentSync.ts';
import type { ContentScope } from '../src/data/contentSync.ts';

// All browser state is local to each test; Node's fake clock drives the window.
class FakeWindow extends EventTarget {
  readonly localStorage = { setItem(_key: string, _value: string): void {} };

  setInterval(callback: () => void, milliseconds: number) {
    return globalThis.setInterval(callback, milliseconds);
  }

  clearInterval(timer: ReturnType<typeof globalThis.setInterval>) {
    globalThis.clearInterval(timer);
  }
}

class FakeDocument extends EventTarget {
  visibilityState: DocumentVisibilityState = 'visible';
}

// Let the refresh continuation and any immediately resolved follow-up finish.
async function flushRefreshes() {
  await Promise.resolve();
  await Promise.resolve();
}

function harness(t: TestContext, visibility: DocumentVisibilityState = 'visible') {
  t.mock.timers.enable({ apis: ['setInterval'] });
  const window = new FakeWindow();
  const document = new FakeDocument();
  document.visibilityState = visibility;
  const environment = { window: window as unknown as Window, document: document as unknown as Document };

  return {
    window,
    document,
    watch(scope: ContentScope, refresh: () => Promise<void>) {
      const stop = watchContent(scope, refresh, environment);
      t.after(stop);
      return stop;
    },
    notify(scope: ContentScope) {
      notifyContentChanged(scope, environment.window);
    },
    async tick(milliseconds: number) {
      t.mock.timers.tick(milliseconds);
      await flushRefreshes();
    },
  };
}

function storageEvent(window: FakeWindow, newValue: string | null, key: string | null = CONTENT_CHANGE_KEY) {
  // Node has EventTarget and CustomEvent, but no browser StorageEvent.
  window.dispatchEvent(Object.assign(new Event('storage'), { key, newValue }));
}

function deferred() {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((onResolve, onReject) => {
    resolve = onResolve;
    reject = onReject;
  });
  return { promise, resolve, reject };
}

function pendingRefresh(t: TestContext) {
  const requests: ReturnType<typeof deferred>[] = [];
  const refresh = t.mock.fn(() => {
    const request = deferred();
    requests.push(request);
    return request.promise;
  });
  return { requests, refresh };
}

describe('watchContent', () => {
  it('fetches immediately and polls at 30-second intervals', async t => {
    const browser = harness(t);
    const refresh = t.mock.fn(async () => {});
    browser.watch('site', refresh);
    assert.equal(refresh.mock.callCount(), 1, 'the initial fetch starts before watchContent returns');
    assert.equal(CONTENT_REFRESH_MS, 30_000);
    await flushRefreshes();

    await browser.tick(29_999);
    assert.equal(refresh.mock.callCount(), 1);
    await browser.tick(1);
    assert.equal(refresh.mock.callCount(), 2);
    await browser.tick(29_999);
    assert.equal(refresh.mock.callCount(), 2);
    await browser.tick(1);
    assert.equal(refresh.mock.callCount(), 3);
  });

  it('fetches initially even when hidden, then polls only while visible', async t => {
    const browser = harness(t, 'hidden');
    const refresh = t.mock.fn(async () => {});
    browser.watch('events', refresh);
    assert.equal(refresh.mock.callCount(), 1);
    await flushRefreshes();

    await browser.tick(90_000);
    assert.equal(refresh.mock.callCount(), 1);
    browser.document.visibilityState = 'visible';
    await browser.tick(30_000);
    assert.equal(refresh.mock.callCount(), 2);
    browser.document.visibilityState = 'hidden';
    await browser.tick(60_000);
    assert.equal(refresh.mock.callCount(), 2);
  });

  for (const event of ['focus', 'online', 'visibilitychange']) {
    it(`refreshes on ${event} only when the document is visible`, async t => {
      const browser = harness(t);
      const refresh = t.mock.fn(async () => {});
      browser.watch('site', refresh);
      await flushRefreshes();
      const target = event === 'visibilitychange' ? browser.document : browser.window;

      target.dispatchEvent(new Event(event));
      assert.equal(refresh.mock.callCount(), 2);
      await flushRefreshes();
      browser.document.visibilityState = 'hidden';
      target.dispatchEvent(new Event(event));
      await flushRefreshes();
      assert.equal(refresh.mock.callCount(), 2);
      browser.document.visibilityState = 'visible';
      target.dispatchEvent(new Event(event));
      assert.equal(refresh.mock.callCount(), 3);
      await flushRefreshes();
    });
  }

  it('notifies same-tab subscribers only for the saved scope and writes an invalidation marker', async t => {
    const browser = harness(t);
    const site = t.mock.fn(async () => {});
    const events = t.mock.fn(async () => {});
    const write = t.mock.method(browser.window.localStorage, 'setItem');
    browser.watch('site', site);
    browser.watch('events', events);
    await flushRefreshes();

    browser.notify('site');
    assert.equal(site.mock.callCount(), 2, 'same-tab notification is immediate');
    assert.equal(events.mock.callCount(), 1);
    await flushRefreshes();
    browser.notify('events');
    assert.equal(site.mock.callCount(), 2);
    assert.equal(events.mock.callCount(), 2);
    await flushRefreshes();

    assert.equal(write.mock.callCount(), 2);
    for (const [index, scope] of ['site', 'events'].entries()) {
      const [key, value] = write.mock.calls[index].arguments;
      assert.equal(key, CONTENT_CHANGE_KEY);
      const marker = JSON.parse(value);
      assert.deepEqual(Object.keys(marker).sort(), ['nonce', 'scope']);
      assert.equal(marker.scope, scope);
      assert.equal(typeof marker.nonce, 'string');
      assert.ok(marker.nonce.length > 0);
    }
  });

  it('filters cross-tab storage by key and scope and ignores missing or malformed markers', async t => {
    const browser = harness(t);
    const site = t.mock.fn(async () => {});
    const events = t.mock.fn(async () => {});
    browser.watch('site', site);
    browser.watch('events', events);
    await flushRefreshes();

    const ignored: [string | null, string | null][] = [
      ['unrelated-key', '{"scope":"site"}'],
      [null, '{"scope":"site"}'],
      [CONTENT_CHANGE_KEY, null],
      [CONTENT_CHANGE_KEY, ''],
      [CONTENT_CHANGE_KEY, '{'],
      [CONTENT_CHANGE_KEY, 'null'],
      [CONTENT_CHANGE_KEY, 'true'],
      [CONTENT_CHANGE_KEY, '42'],
      [CONTENT_CHANGE_KEY, '"site"'],
      [CONTENT_CHANGE_KEY, '[]'],
      [CONTENT_CHANGE_KEY, '{}'],
      [CONTENT_CHANGE_KEY, '{"scope":null}'],
      [CONTENT_CHANGE_KEY, '{"scope":["site"]}'],
      [CONTENT_CHANGE_KEY, '{"scope":"booking"}'],
      [CONTENT_CHANGE_KEY, '{"scope":"SITE"}'],
    ];
    for (const [key, value] of ignored) {
      storageEvent(browser.window, value, key);
      await flushRefreshes();
      assert.equal(site.mock.callCount(), 1, `ignored site marker: ${key} / ${value}`);
      assert.equal(events.mock.callCount(), 1, `ignored events marker: ${key} / ${value}`);
    }

    storageEvent(browser.window, '{"scope":"site","nonce":"other-tab-1"}');
    assert.equal(site.mock.callCount(), 2);
    assert.equal(events.mock.callCount(), 1);
    await flushRefreshes();
    storageEvent(browser.window, '{"scope":"events","nonce":"other-tab-2"}');
    assert.equal(site.mock.callCount(), 2);
    assert.equal(events.mock.callCount(), 2);
    await flushRefreshes();
  });

  it('applies same-tab and cross-tab invalidations even while hidden', async t => {
    const browser = harness(t, 'hidden');
    const refresh = t.mock.fn(async () => {});
    browser.watch('site', refresh);
    await flushRefreshes();

    browser.notify('site');
    assert.equal(refresh.mock.callCount(), 2);
    await flushRefreshes();
    storageEvent(browser.window, '{"scope":"site","nonce":"other-tab"}');
    assert.equal(refresh.mock.callCount(), 3);
    await flushRefreshes();
    await browser.tick(30_000);
    assert.equal(refresh.mock.callCount(), 3);
  });

  for (const blocked of ['getter', 'setItem'] as const) {
    it(`keeps notifications, focus and polling working when the localStorage ${blocked} throws`, async t => {
      const browser = harness(t);
      const denied = t.mock.fn(() => { throw new Error('Storage access blocked'); });
      if (blocked === 'getter') {
        Object.defineProperty(browser.window, 'localStorage', { get: denied });
      } else {
        t.mock.method(browser.window.localStorage, 'setItem', denied);
      }
      const refresh = t.mock.fn(async () => {});
      browser.watch('site', refresh);
      await flushRefreshes();

      assert.doesNotThrow(() => browser.notify('site'));
      assert.equal(denied.mock.callCount(), 1);
      assert.equal(refresh.mock.callCount(), 2);
      await flushRefreshes();
      browser.window.dispatchEvent(new Event('focus'));
      assert.equal(refresh.mock.callCount(), 3);
      await flushRefreshes();
      await browser.tick(30_000);
      assert.equal(refresh.mock.callCount(), 4);
    });
  }

  it('coalesces all triggers during a pending fetch into one follow-up without overlapping fetches', async t => {
    const browser = harness(t);
    const { requests, refresh } = pendingRefresh(t);
    browser.watch('site', refresh);
    assert.equal(requests.length, 1);

    browser.window.dispatchEvent(new Event('focus'));
    browser.window.dispatchEvent(new Event('online'));
    browser.document.dispatchEvent(new Event('visibilitychange'));
    browser.notify('site');
    browser.notify('site');
    storageEvent(browser.window, '{"scope":"site","nonce":"other-tab"}');
    await browser.tick(60_000);
    assert.equal(requests.length, 1, 'no trigger starts a concurrent fetch');

    requests[0].resolve();
    await flushRefreshes();
    assert.equal(requests.length, 2, 'all pending triggers share one follow-up');
    requests[1].resolve();
    await flushRefreshes();
    assert.equal(requests.length, 2, 'the trigger burst does not create more follow-ups');
  });

  it('does not queue a follow-up for an unrelated scope during a pending fetch', async t => {
    const browser = harness(t);
    const { requests, refresh } = pendingRefresh(t);
    browser.watch('site', refresh);
    browser.notify('events');
    storageEvent(browser.window, '{"scope":"events","nonce":"other-tab"}');

    requests[0].resolve();
    await flushRefreshes();
    assert.equal(requests.length, 1);
  });

  it('preserves invalidations that arrive during the follow-up fetch', async t => {
    const browser = harness(t);
    const { requests, refresh } = pendingRefresh(t);
    browser.watch('events', refresh);
    browser.notify('events');
    requests[0].resolve();
    await flushRefreshes();
    assert.equal(requests.length, 2);

    browser.notify('events');
    storageEvent(browser.window, '{"scope":"events","nonce":"newer-save"}');
    assert.equal(requests.length, 2);
    requests[1].resolve();
    await flushRefreshes();
    assert.equal(requests.length, 3, 'the newer save needs another fetch');
    requests[2].resolve();
    await flushRefreshes();
    assert.equal(requests.length, 3);
  });

  it('keeps in-flight state and cleanup independent for subscribers to the same scope', async t => {
    const browser = harness(t);
    const first = pendingRefresh(t);
    const second = pendingRefresh(t);
    const stopFirst = browser.watch('site', first.refresh);
    browser.watch('site', second.refresh);
    assert.equal(first.requests.length, 1);
    assert.equal(second.requests.length, 1);
    browser.notify('site');

    stopFirst();
    first.requests[0].resolve();
    second.requests[0].resolve();
    await flushRefreshes();
    assert.equal(first.requests.length, 1);
    assert.equal(second.requests.length, 2);
    second.requests[1].resolve();
    await flushRefreshes();
    await browser.tick(30_000);
    assert.equal(first.requests.length, 1);
    assert.equal(second.requests.length, 3);
    second.requests[2].resolve();
    await flushRefreshes();
  });

  for (const failure of ['rejection', 'synchronous throw'] as const) {
    it(`recovers from a refresh ${failure} on later polling and events`, async t => {
      const browser = harness(t);
      let attempts = 0;
      const refresh = t.mock.fn(() => {
        if (++attempts === 1) {
          const error = new Error('Fetch failed');
          if (failure === 'synchronous throw') throw error;
          return Promise.reject(error);
        }
        return Promise.resolve();
      });
      assert.doesNotThrow(() => browser.watch('site', refresh));
      await flushRefreshes();
      assert.equal(refresh.mock.callCount(), 1, 'a failure alone does not spin in a retry loop');

      await browser.tick(30_000);
      assert.equal(refresh.mock.callCount(), 2);
      browser.window.dispatchEvent(new Event('online'));
      assert.equal(refresh.mock.callCount(), 3);
      await flushRefreshes();
    });
  }

  it('honors a queued invalidation after rejection and can recover after the follow-up also fails', async t => {
    const browser = harness(t);
    const { requests, refresh } = pendingRefresh(t);
    browser.watch('site', refresh);
    browser.notify('site');
    requests[0].reject(new Error('Initial fetch failed'));
    await flushRefreshes();
    assert.equal(requests.length, 2);
    requests[1].reject(new Error('Follow-up failed'));
    await flushRefreshes();
    assert.equal(requests.length, 2);

    browser.notify('site');
    assert.equal(requests.length, 3);
    requests[2].resolve();
    await flushRefreshes();
    await browser.tick(30_000);
    assert.equal(requests.length, 4);
    requests[3].resolve();
    await flushRefreshes();
  });

  it('clears the interval, removes every listener and tolerates repeated cleanup', async t => {
    const browser = harness(t);
    const addWindow = t.mock.method(browser.window, 'addEventListener');
    const removeWindow = t.mock.method(browser.window, 'removeEventListener');
    const addDocument = t.mock.method(browser.document, 'addEventListener');
    const removeDocument = t.mock.method(browser.document, 'removeEventListener');
    const interval = t.mock.method(browser.window, 'setInterval');
    const clear = t.mock.method(browser.window, 'clearInterval');
    const refresh = t.mock.fn(async () => {});
    const stop = browser.watch('site', refresh);
    await flushRefreshes();

    assert.deepEqual(addWindow.mock.calls.map(call => call.arguments[0]).sort(), ['focus', 'hhg:content-change', 'online', 'storage']);
    assert.deepEqual(addDocument.mock.calls.map(call => call.arguments[0]), ['visibilitychange']);
    assert.equal(interval.mock.callCount(), 1);
    assert.equal(interval.mock.calls[0].arguments[1], 30_000);
    stop();
    assert.deepEqual(removeWindow.mock.calls.map(call => call.arguments), addWindow.mock.calls.map(call => call.arguments));
    assert.deepEqual(removeDocument.mock.calls.map(call => call.arguments), addDocument.mock.calls.map(call => call.arguments));
    assert.equal(clear.mock.callCount(), 1);
    assert.equal(clear.mock.calls[0].arguments[0], interval.mock.calls[0].result);
    assert.doesNotThrow(stop);

    browser.notify('site');
    storageEvent(browser.window, '{"scope":"site","nonce":"after-cleanup"}');
    browser.window.dispatchEvent(new Event('focus'));
    browser.window.dispatchEvent(new Event('online'));
    browser.document.dispatchEvent(new Event('visibilitychange'));
    await browser.tick(90_000);
    assert.equal(refresh.mock.callCount(), 1);
  });

  for (const outcome of ['resolve', 'reject'] as const) {
    it(`discards queued work when disposed before the in-flight fetch can ${outcome}`, async t => {
      const browser = harness(t);
      const { requests, refresh } = pendingRefresh(t);
      const stop = browser.watch('site', refresh);
      browser.notify('site');
      stop();
      assert.doesNotThrow(stop);
      browser.notify('site');
      storageEvent(browser.window, '{"scope":"site","nonce":"after-cleanup"}');
      browser.window.dispatchEvent(new Event('focus'));
      browser.window.dispatchEvent(new Event('online'));
      browser.document.dispatchEvent(new Event('visibilitychange'));
      await browser.tick(90_000);
      assert.equal(requests.length, 1);

      if (outcome === 'resolve') requests[0].resolve();
      else requests[0].reject(new Error('Fetch failed after cleanup'));
      await flushRefreshes();
      await browser.tick(30_000);
      browser.notify('site');
      await flushRefreshes();
      assert.equal(requests.length, 1, 'settling a disposed fetch must not start the queued refresh');
    });
  }
});

const today = '2026-11-02';
const offer = (overrides: Partial<ClubOffer> = {}): ClubOffer => ({
  id: 'test-offer', title: 'November golf', description: '', priceLabel: '',
  image: '', active: true, startsOn: '', endsOn: '', message: '', ...overrides,
});

describe('offerValidation', () => {
  it('requires a nonblank title', () => {
    for (const title of ['', '   ', '\t\r\n']) {
      assert.match(offerValidation(offer({ title }))!, /title/i);
    }
    assert.equal(offerValidation(offer({ title: '  November golf  ' })), null);
  });

  it('allows undated, one-sided, same-day and valid leap-day date windows', () => {
    for (const dates of [
      {},
      { startsOn: today },
      { endsOn: today },
      { startsOn: today, endsOn: today },
      { startsOn: '2026-11-01', endsOn: '2026-11-03' },
      { startsOn: '2028-02-29', endsOn: '2028-02-29' },
    ]) {
      assert.equal(offerValidation(offer(dates)), null, JSON.stringify(dates));
    }
  });

  for (const field of ['startsOn', 'endsOn'] as const) {
    it(`rejects malformed and impossible ${field} dates`, () => {
      for (const date of ['tomorrow', ' ', '2026-2-03', '03/11/2026', '2026-11-02T00:00:00Z', '2026-02-29', '2026-02-30', '2026-04-31', '2026-00-01', '2026-13-01', '2026-11-00', '2026-11-32']) {
        const invalid = offer({ [field]: date });
        assert.match(offerValidation(invalid)!, /valid start and end date/i, `${field}: ${date}`);
        assert.equal(offerStatus(invalid, today), 'invalid');
      }
    });
  }

  it('rejects reversed ranges, including on hidden offers', () => {
    for (const active of [true, false]) {
      const invalid = offer({ active, startsOn: '2026-11-03', endsOn: '2026-11-01' });
      assert.match(offerValidation(invalid)!, /end date cannot be before its start date/i);
      assert.equal(offerStatus(invalid, today), 'invalid');
    }
  });
});

describe('offerStatus', () => {
  const cases: [string, Partial<ClubOffer>, ReturnType<typeof offerStatus>][] = [
    ['undated active offer', {}, 'live'],
    ['inclusive first day', { startsOn: today, endsOn: '2026-11-03' }, 'live'],
    ['inclusive last day', { startsOn: '2026-11-01', endsOn: today }, 'live'],
    ['single-day offer on that day', { startsOn: today, endsOn: today }, 'live'],
    ['start-only offer on its first day', { startsOn: today }, 'live'],
    ['end-only offer on its last day', { endsOn: today }, 'live'],
    ['day before the start', { startsOn: '2026-11-03' }, 'scheduled'],
    ['day after the end', { endsOn: '2026-11-01' }, 'expired'],
    ['inactive undated offer', { active: false }, 'hidden'],
    ['inactive future offer', { active: false, startsOn: '2026-11-03' }, 'hidden'],
    ['inactive past offer', { active: false, endsOn: '2026-11-01' }, 'hidden'],
    ['blank title', { title: '  ' }, 'invalid'],
    ['reversed date range', { startsOn: '2026-11-03', endsOn: '2026-11-01' }, 'invalid'],
    ['hidden offer with invalid dates', { active: false, startsOn: 'not-a-date' }, 'invalid'],
    ['hidden offer with no title', { active: false, title: '' }, 'invalid'],
  ];
  for (const [label, overrides, expected] of cases) {
    it(`${label} is ${expected}`, () => {
      assert.equal(offerStatus(offer(overrides), today), expected);
    });
  }

  it('defaults to the club date at Krabi midnight, before the UTC date changes', t => {
    t.mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-11-01T17:00:00Z') });
    assert.equal(offerStatus(offer({ startsOn: today, endsOn: today })), 'live');
    assert.equal(offerStatus(offer({ endsOn: '2026-11-01' })), 'expired');
    assert.equal(offerStatus(offer({ startsOn: '2026-11-03' })), 'scheduled');
  });

  it('publishes only valid live offers in their original order', () => {
    const oneDay = offer({ id: 'one-day', startsOn: today, endsOn: today });
    const undated = offer({ id: 'undated' });
    const offers = [
      offer({ active: false }), oneDay,
      offer({ startsOn: '2026-11-03' }), offer({ endsOn: '2026-11-01' }),
      offer({ title: '' }), offer({ startsOn: '2026-02-30' }),
      offer({ startsOn: '2026-11-03', endsOn: '2026-11-01' }), undated,
    ];
    assert.deepEqual(activeOffers(offers, today), [oneDay, undated]);
    assert.deepEqual(activeOffers([], today), []);
  });
});
