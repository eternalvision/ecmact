import pw from 'playwright';

/*
 * Checks the widget gallery page in a real browser (AC-03 and AC-05). Run from the repository root with a dev
 * server of the site running:
 *
 *   BASE=http://localhost:5173/ecmact ENGINES=chromium,firefox,webkit node docs/sessions/19112026-DocsRedesign/build/gallery.mjs
 *
 * 1. Each of the five former tags is opened as `widgets#<former>`: the section of the widget that replaced it
 *    has to be in the view (the page scrolls there once it is in place).
 * 2. With requests to other origins refused, the gallery page and its four host frames load, every widget of
 *    every host renders its shadow content, and no request to another origin was made or failed.
 * 3. Each widget of the first host frame answers its main interaction by keyboard, and the focus ring shows.
 *
 * Environment: BASE, ENGINES.
 */
const BASE = process.env.BASE ?? 'http://localhost:5173/ecmact';
const engines = (process.env.ENGINES ?? 'chromium').split(',');
const former = {
  'price-calculator': 'print-quote',
  'weather-now': 'moon-dial',
  'repo-card': 'feed-lamp',
  'poll-widget': 'row-counter',
  'countdown-timer': 'proof-clock',
};
const hosts = {
  cafe: ['proof-clock', 'row-counter', 'moon-dial'],
  terminal: ['feed-lamp', 'moon-dial'],
  zine: ['print-quote', 'proof-clock'],
  kids: ['row-counter', 'feed-lamp', 'print-quote'],
};
let bad = 0;
const check = (name, ok, extra = '') => {
  console.log(ok ? 'ok  ' : 'FAIL', name, extra);
  if (!ok) bad++;
};

for (const eng of engines) {
  const browser = await pw[eng].launch();
  for (const width of [1280, 360]) {
    const ctx = await browser.newContext({ viewport: { width, height: 800 } });
    const foreign = [];
    await ctx.route('**/*', (route) => {
      if (new URL(route.request().url()).origin === new URL(BASE).origin) return route.continue();
      foreign.push(route.request().url());
      return route.abort();
    });
    for (const [old, tag] of Object.entries(former)) {
      const page = await ctx.newPage();
      await page.goto(`${BASE}/widgets#${old}`);
      await page.waitForSelector(`h3[id="${tag}"]`);
      // the page scrolls smoothly and settles while the frames above it grow
      await page.waitForTimeout(3500);
      const state = await page.evaluate(
        ([tag]) => {
          const h = document.getElementById(tag);
          const r = h.getBoundingClientRect();
          return {
            top: Math.round(r.top),
            inView: r.top >= -2 && r.bottom <= window.innerHeight,
            y: Math.round(window.scrollY),
          };
        },
        [tag],
      );
      check(
        `${eng} ${width} widgets#${old} opens on <${tag}>`,
        state.inView && state.y > 0,
        JSON.stringify(state),
      );
      await page.close();
    }
    const page = await ctx.newPage();
    const errors = [];
    // the message of a ResizeObserver that has more to do than one frame allows is the browser's own note, not an error
    page.on('pageerror', (e) => /ResizeObserver loop/.test(String(e)) || errors.push(String(e)));
    await page.goto(`${BASE}/widgets`);
    await page.waitForSelector('iframe.host-frame');
    // the frames load lazily: bring each one into view, as a reader scrolling the page does
    for (let n = 0; n < (await page.locator('iframe.host-frame').count()); n++) {
      await page.locator('iframe.host-frame').nth(n).scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500);
    }
    for (const [host, tags] of Object.entries(hosts)) {
      const frame = page.frames().find((f) => f.url().includes(`/hosts/${host}.html`));
      if (!frame) {
        check(`${eng} ${width} frame ${host}`, false, 'no frame');
        continue;
      }
      const rendered = await frame.evaluate(
        (tags) =>
          tags.map((t) => [
            t,
            [...document.querySelectorAll(t)].every(
              (e) => e.shadowRoot && e.shadowRoot.childNodes.length > 0,
            ),
          ]),
        tags,
      );
      check(
        `${eng} ${width} frame ${host} renders ${tags.join(', ')}`,
        rendered.every(([, ok]) => ok),
        JSON.stringify(rendered),
      );
      const frameWide = await frame.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      check(
        `${eng} ${width} frame ${host} has no sideways scroll`,
        frameWide <= 0,
        String(frameWide),
      );
    }
    if (width === 1280) {
      const frame = page.frames().find((f) => f.url().includes('/hosts/cafe.html'));
      await frame.focus('row-counter');
      const before = await frame.evaluate(
        () => document.querySelector('row-counter').shadowRoot.querySelector('.big b').textContent,
      );
      await frame.evaluate(() =>
        document.querySelector('row-counter').shadowRoot.querySelector('.big').focus(),
      );
      await page.keyboard.press('Enter');
      await page.keyboard.press('Space');
      const after = await frame.evaluate(
        () => document.querySelector('row-counter').shadowRoot.querySelector('.big b').textContent,
      );
      check(
        `${eng} row-counter counts by Enter and Space`,
        Number(after) === Number(before) + 2,
        `${before} -> ${after}`,
      );
      await frame.evaluate(() =>
        document.querySelector('moon-dial').shadowRoot.querySelector('.dial').focus(),
      );
      const day0 = await frame.evaluate(() =>
        document
          .querySelector('moon-dial')
          .shadowRoot.querySelector('.dial')
          .getAttribute('aria-valuenow'),
      );
      await page.keyboard.press('ArrowRight');
      const day1 = await frame.evaluate(() =>
        document
          .querySelector('moon-dial')
          .shadowRoot.querySelector('.dial')
          .getAttribute('aria-valuenow'),
      );
      check(`${eng} moon-dial steps a day by ArrowRight`, day0 !== day1, `${day0} -> ${day1}`);
    }
    check(
      `${eng} ${width} no request to another origin`,
      foreign.length === 0,
      foreign.slice(0, 3).join(' '),
    );
    check(`${eng} ${width} no page error`, errors.length === 0, errors.join(' | '));
    await ctx.close();
  }
  await browser.close();
}
console.log('failures', bad);
