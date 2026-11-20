const deepAll = `(host, sel) => { const out = []; const walk = (r) => { out.push(...r.querySelectorAll(sel)); for (const e of r.querySelectorAll('*')) if (e.shadowRoot) walk(e.shadowRoot); }; walk(host.shadowRoot ?? host); return out; }`;
/** run fn(host, deepAll, arg) in the page */
const ev = (page, sel, fn, arg) =>
  page.evaluate(
    `(async () => { const host = document.querySelector('${sel}').firstElementChild; const all = ${deepAll}; return (${fn.toString()})(host, all, ${JSON.stringify(arg ?? null)}); })()`,
  );
const seq =
  (...steps) =>
  async (page, s) => {
    for (const st of steps) {
      await st(page, s);
      await page.waitForTimeout(150);
    }
  };
const times = (n, st) => async (page, s) => {
  for (let i = 0; i < n; i++) {
    await st(page, s);
    await page.waitForTimeout(20);
  }
};
const clickAria = (label) => async (page, s) =>
  ev(
    page,
    s,
    (h, all, l) => {
      all(h, 'button')
        .find((b) => b.getAttribute('aria-label') === l)
        ?.click();
    },
    label,
  );
const clickText = (text) => async (page, s) =>
  ev(
    page,
    s,
    (h, all, t) => {
      all(h, 'button,a')
        .find((b) => b.textContent.trim() === t)
        ?.click();
    },
    text,
  );
const setField = (selector, value) => async (page, s) =>
  ev(
    page,
    s,
    (h, all, a) => {
      const i = all(h, a.selector)[0];
      i.value = a.value;
      i.dispatchEvent(new Event('input', { bubbles: true }));
      i.dispatchEvent(new Event('change', { bubbles: true }));
    },
    { selector, value },
  );
const inks = ['Black', 'Red', 'Blue'],
  stocks = ['Mint', 'White', 'Lemon'];
const typecase = [];
for (const i of inks)
  for (const k of stocks)
    typecase.push({ name: `${i}-${k}`, go: seq(clickAria(`${i} ink`), clickAria(`${k} stock`)) });
const gels = [];
for (let n = 1; n <= 5; n++)
  gels.push({
    name: `gel${n}`,
    go: async (page, s) => {
      for (let k = 0; k < n; k++)
        await ev(page, s, (h, all) => {
          all(h, '.head button').forEach((b) => b.click());
        });
      await page.waitForTimeout(300);
    },
  });
const blocked = `Object.defineProperty(window, 'localStorage', { get() { throw new DOMException('x', 'SecurityError'); } });`;
export const states = {
  exposure: [{ name: 'locked', go: clickText('EV lock: off') }],
  setlist: [
    { name: 'over', go: times(20, clickAria('Curfew 5 minutes earlier')) },
    {
      name: 'empty',
      go: async (page, s) => {
        for (const t of ['Opening drone', 'Harbour lights', 'The long one', 'Encore, maybe']) {
          await clickAria(`Remove ${t}`)(page, s);
          await page.waitForTimeout(50);
        }
      },
    },
    { name: 'played', go: clickAria('Played The long one') },
  ],
  fieldbook: [
    { name: 'kept', go: clickAria('One more Wren') },
    { name: 'lost', init: blocked, go: clickAria('One more Wren') },
  ],
  catalog: [
    {
      name: 'notice',
      go: seq(
        async (p) => p.waitForTimeout(900),
        clickText('Close the desk'),
        async (p, s) => ev(p, s, (h, all) => all(h, '.card button')[0]?.click()),
      ),
      wait: 1500,
    },
    {
      name: 'wait',
      go: async (p, s) => {
        await p.waitForTimeout(900);
        for (let i = 0; i < 7; i++) {
          await ev(p, s, (h, all) => all(h, '.card button')[0]?.click());
          await p.waitForTimeout(400);
        }
      },
      wait: 500,
    },
    { name: 'none', go: setField('input', 'zeppelin'), wait: 900 },
  ],
  departures: [
    { name: 'loading', go: async () => {}, wait: 0 },
    { name: 'error', go: seq(clickText('Fog'), clickText('Saltmarsh')), wait: 1500 },
    { name: 'rough', go: clickText('Rough sea'), wait: 900 },
  ],
  customs: [
    {
      name: 'refused',
      go: async (page, s) => {
        await ev(page, s, (h, all) => {
          const f = all(h, 'form')[0];
          const inp = all(h, 'input')[0];
          inp.value = 'zz';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          if (f.requestSubmit) f.requestSubmit();
          else f.dispatchEvent(new Event('submit', { cancelable: true }));
        });
      },
    },
    {
      name: 'nofilter',
      go: async (page, s) =>
        ev(page, s, (h) => {
          const strip = (t) => {
            const i = t.indexOf('@supports');
            if (i < 0) return t;
            let d = 0,
              j = t.indexOf('{', i);
            for (; j < t.length; j++) {
              if (t[j] === '{') d++;
              if (t[j] === '}' && --d === 0) break;
            }
            return t.slice(0, i) + t.slice(j + 1);
          };
          let n = 0;
          const walk = (r) => {
            for (const st of r.querySelectorAll('style')) {
              const t = strip(st.textContent);
              if (t !== st.textContent) {
                st.textContent = t;
                n++;
              }
            }
            if (r.adoptedStyleSheets)
              for (const sh of r.adoptedStyleSheets) {
                const css = [...sh.cssRules].map((x) => x.cssText).join('\n');
                const t = strip(css);
                if (t !== css) {
                  sh.replaceSync(t);
                  n++;
                }
              }
            for (const e of r.querySelectorAll('*')) if (e.shadowRoot) walk(e.shadowRoot);
          };
          walk(h.shadowRoot ?? h);
          return n;
        }),
    },
    {
      name: 'cleared',
      go: async (page, s) => {
        await ev(page, s, (h, all) => {
          const f = all(h, 'form')[0];
          const inp = all(h, 'input')[0];
          inp.value = 'ab123456';
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          if (f.requestSubmit) f.requestSubmit();
          else f.dispatchEvent(new Event('submit', { cancelable: true }));
        });
      },
      wait: 1200,
    },
  ],
  atlasroute: [
    { name: 'default', url: '/examples/atlas', go: async () => {} },
    { name: 'place', url: '/examples/atlas', go: clickText('Saltmarsh') },
    { name: 'waiting', url: '/examples/atlas', go: clickText('North Shoal'), wait: 30 },
    { name: 'shoal', url: '/examples/atlas', go: clickText('North Shoal'), wait: 1500 },
    { name: 'missing', url: '/examples/atlas/nowhere', go: async () => {} },
    { name: 'notice', url: '/examples/atlas?closed=lighthouse', go: async () => {} },
    {
      name: 'night',
      url: '/examples/atlas',
      go: seq(
        async (p, s) => ev(p, s, (h, all) => all(h, '.controls button')[0].click()),
        clickText('The Lighthouse'),
      ),
      wait: 900,
    },
    { name: 'layer', url: '/examples/atlas/saltmarsh?layer=birds', go: async () => {} },
  ],
  typecase,
  seedpacket: ['Green', 'Rust', 'Indigo'].map((n) => ({
    name: n,
    go: async (page, s) => ev(page, s, (h, all, x) => all(h, `[data-ink="${x}"]`)[0].click(), n),
  })),
  switchboard: ['Clear', 'Slow', 'Crackly', 'Dead'].flatMap((n) => [
    { name: n + '-start', go: clickAria(`${n} line`), wait: 120 },
    { name: n + '-end', go: clickAria(`${n} line`), wait: 2500 },
  ]),
  gels,
  darkroom: [
    { name: 'pulled', go: clickText('Pull out') },
    { name: 'moved', go: clickText('Move to the next tray') },
  ],
};
