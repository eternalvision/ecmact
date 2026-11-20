import fs from 'node:fs';
import { PNG } from 'pngjs';
import pw from 'playwright';
import { states } from './states.mjs';

/*
 * Measures the examples of the site in a browser: overflow, target size, text contrast, focus and the
 * boundaries of controls, per state. Run from the repository root (it needs `playwright` and `pngjs` from
 * node_modules), with a dev server of the site running:
 *
 *   BASE=http://localhost:5173/ecmact OUT=./out ENGINES=chromium,firefox,webkit node docs/sessions/19112026-DocsRedesign/build/measure.mjs
 *
 * Environment: BASE (address of the site, with its base path), OUT (folder for captures and report.json),
 * ENGINES, ONLY (ids of examples), ROUTE=1 (the atlas route), FOCUS=1 (focus stops at every width and
 * theme), REDUCED=1 (prefers-reduced-motion: reduce), FONTS=1 (every stack cut to its generic family),
 * SHOTS=1 (a capture of every state), WAIT (ms after each state).
 *
 * What it measures, and how:
 * - text: the text of the stage is made transparent, the stage is captured, and the colour of each text box
 *   (its own alpha, the opacity of the element and of its ancestors, and for a placeholder the opacity of
 *   `::placeholder` itself) is composited over the pixels behind it; the ratio is the 20th percentile of
 *   the samples, so that hairlines inside a box do not count. Text that a `::before` or `::after` draws with
 *   `content:` is measured too, over the box of its element.
 * - focus: for every Tab stop, the outline has to be 2 px or more, and the colour of the outline has to keep
 *   3:1 against the pixels just outside it (and in the gap, when there is an offset).
 * - boundaries: a field, select, textarea or switch shows its edge at 3:1 against its surroundings; for a
 *   switch drawn with a pseudo-element, the track is compared with what is behind it.
 */
const BASE = process.env.BASE ?? 'http://localhost:5173/ecmact';
const OUT = process.env.OUT ?? './out';
const engines = (process.env.ENGINES ?? 'chromium').split(',');
const only = process.env.ONLY ? process.env.ONLY.split(',') : null;

const lum = ([r, g, b]) => {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const x = lum(a),
    y = lum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
};

/** Runs in the page: gathers boxes. */
export const gather = (hostSel) => {
  const stage = document.querySelector(hostSel.stage);
  const host = stage.firstElementChild;
  const sr = stage.getBoundingClientRect();
  const all = [];
  const walk = (root) => {
    for (const el of root.querySelectorAll('*')) {
      all.push(el);
      if (el.shadowRoot) walk(el.shadowRoot);
    }
  };
  all.push(host);
  if (host.shadowRoot) walk(host.shadowRoot);
  else walk(host);
  const visible = (el) => {
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0;
  };
  const eff = (el) => {
    let o = 1;
    for (let n = el; n; n = n.parentElement || n.getRootNode().host) {
      o *= parseFloat(getComputedStyle(n).opacity);
      if (!n.parentElement && !n.getRootNode().host) break;
    }
    return o;
  };
  const deep = (x, y) => {
    let e = document.elementFromPoint(x, y);
    while (e && e.shadowRoot) {
      const n = e.shadowRoot.elementFromPoint(x, y);
      if (!n || n === e) break;
      e = n;
    }
    return e;
  };
  const overflow = [];
  const small = [];
  const texts = [];
  for (const el of all) {
    if (!visible(el)) continue;
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    // an element that an ancestor clips (a decoration that bleeds out of a card with overflow hidden) does not overflow
    let clippedByAncestor = false;
    for (
      let a = el.parentElement || el.getRootNode().host;
      a && a !== stage;
      a = a.parentElement || a.getRootNode().host
    ) {
      const o = getComputedStyle(a);
      const ar = a.getBoundingClientRect();
      if (
        /(auto|scroll|hidden|clip)/.test(o.overflowX) &&
        ar.left >= sr.left - 1 &&
        ar.right <= sr.right + 1
      ) {
        clippedByAncestor = true;
        break;
      }
    }
    if (
      !clippedByAncestor &&
      cs.position !== 'fixed' &&
      (r.left < sr.left - 1 || r.right > sr.right + 1)
    )
      overflow.push({
        tag: el.tagName + '.' + (el.className?.baseVal ?? el.className),
        l: Math.round(r.left - sr.left),
        r: Math.round(r.right - sr.left),
        sw: Math.round(sr.width),
      });
    const interactive = el.matches?.(
      'button,a[href],select,input:not([type=hidden]),textarea,[role=button],summary',
    );
    if (interactive) {
      let box = r;
      // a visually hidden input is judged by its label
      if (el.matches('input[type=checkbox],input[type=radio]')) {
        const lab =
          el.closest('label') ?? (el.id && el.getRootNode().querySelector(`label[for="${el.id}"]`));
        if (lab) box = lab.getBoundingClientRect();
      }
      if (box.width < 24 - 0.5 || box.height < 24 - 0.5)
        small.push({
          tag:
            el.tagName +
            '.' +
            el.className +
            ' ' +
            (el.getAttribute('aria-label') || el.textContent.trim().slice(0, 15)),
          w: +box.width.toFixed(1),
          h: +box.height.toFixed(1),
        });
    }
    // text that is visually hidden (a box of a pixel that clips itself) is for screen readers and is not measured
    const hiddenSelf =
      /(hidden|clip)/.test(cs.overflowX + cs.overflowY) && (r.width < 2 || r.height < 2);
    // text nodes
    for (const n of hiddenSelf ? [] : el.childNodes) {
      if (n.nodeType === 3 && n.textContent.trim() && !el.closest('[aria-hidden="true"]')) {
        const range = document.createRange();
        range.selectNodeContents(n);
        const rr = range.getBoundingClientRect();
        if (rr.width < 1 || rr.height < 1) continue;
        const hit = deep(rr.left + rr.width / 2, rr.top + rr.height / 2);
        const cx = rr.left + rr.width / 2,
          cy = rr.top + rr.height / 2;
        let clipped = false;
        for (
          let a = el.parentElement || el.getRootNode().host;
          a && a !== document.body;
          a = a.parentElement || a.getRootNode().host
        ) {
          const o = getComputedStyle(a);
          if (/(auto|scroll|hidden|clip)/.test(o.overflowY + o.overflowX)) {
            const ar = a.getBoundingClientRect();
            if (cy < ar.top || cy > ar.bottom || cx < ar.left || cx > ar.right) {
              clipped = true;
              break;
            }
          }
        }
        if (clipped) continue;
        if (hit && !(hit === el || el.contains(hit) || hit.contains(el))) continue;
        texts.push({
          text: n.textContent.trim().slice(0, 30),
          x: rr.left,
          y: rr.top,
          w: rr.width,
          h: rr.height,
          color: cs.color,
          fs: parseFloat(cs.fontSize),
          fw: parseInt(cs.fontWeight),
          op: eff(el),
          fill: cs.webkitTextFillColor,
        });
      }
    }
    if (
      el.matches?.(
        'input:not([type=checkbox]):not([type=radio]):not([type=range]),textarea,select',
      ) &&
      el.value
    ) {
      texts.push({
        text: 'value:' + String(el.value).slice(0, 20),
        x: r.left + 6,
        y: r.top + 4,
        w: Math.max(1, r.width - 12),
        h: Math.max(1, r.height - 8),
        color: cs.color,
        fs: parseFloat(cs.fontSize),
        fw: parseInt(cs.fontWeight),
        op: eff(el),
        fill: cs.webkitTextFillColor,
      });
    }
    if (el.matches?.('input[placeholder]') && !el.value) {
      const pc = getComputedStyle(el, '::placeholder');
      texts.push({
        text: 'placeholder:' + el.placeholder.slice(0, 20),
        x: r.left + 6,
        y: r.top + 4,
        w: Math.max(1, r.width - 12),
        h: Math.max(1, r.height - 8),
        color: pc.color,
        fs: parseFloat(cs.fontSize),
        fw: parseInt(cs.fontWeight),
        op: eff(el) * parseFloat(pc.opacity),
        fill: pc.color,
      });
    }
  }
  for (const el of all) {
    if (!visible(el) || el.closest('[aria-hidden="true"]')) continue;
    const r = el.getBoundingClientRect();
    for (const pseudo of ['::before', '::after']) {
      const pc = getComputedStyle(el, pseudo);
      if (
        pc.content === 'none' ||
        pc.content === 'normal' ||
        pc.display === 'none' ||
        pc.visibility === 'hidden'
      )
        continue;
      const text = pc.content === '""' || pc.content === "''" ? '' : pc.content;
      if (!text) continue;
      el.setAttribute('data-pt', '');
      texts.push({
        pseudo: true,
        text: pseudo + ':' + text.slice(0, 24),
        x: r.left,
        y: r.top,
        w: Math.max(1, r.width),
        h: Math.max(1, r.height),
        color: pc.color,
        fs: parseFloat(pc.fontSize),
        fw: parseInt(pc.fontWeight),
        op: eff(el) * parseFloat(pc.opacity),
        fill: pc.webkitTextFillColor,
      });
    }
  }
  const controls = [];
  for (const el of all) {
    if (!visible(el) || !el.matches?.(hostSel.controls)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) continue;
    controls.push({
      name:
        el.tagName +
        '.' +
        (el.className?.baseVal ?? el.className) +
        ' ' +
        (el.getAttribute('aria-label') || el.name || el.textContent.trim().slice(0, 15)),
      x: r.left,
      y: r.top,
      w: r.width,
      h: r.height,
      pseudo: el.matches(hostSel.switches),
      button: el.matches('button'),
      op: eff(el),
    });
  }
  return {
    sr: { x: sr.left, y: sr.top, w: sr.width, h: sr.height },
    sw: stage.scrollWidth,
    cw: stage.clientWidth,
    overflow,
    small,
    texts,
    controls,
    long: host.getBoundingClientRect().width,
  };
};

export const CONTROLS =
  'input:not([type=hidden]):not([type=range]),select,textarea,button[aria-pressed],[role=switch],[role=checkbox]';
export const SWITCHES =
  'button[aria-pressed],[role=switch],[role=checkbox],input[type=checkbox],input[type=radio]';
const hide = (on) => {
  const css =
    '*,*::before,*::after{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;caret-color:transparent!important}*::placeholder{color:transparent!important}[data-np]::before,[data-np]::after{visibility:hidden!important}';
  const roots = [document];
  const find = (root) => {
    for (const el of root.querySelectorAll('*'))
      if (el.shadowRoot) {
        roots.push(el.shadowRoot);
        find(el.shadowRoot);
      }
  };
  find(document);
  for (const r of roots) {
    const host = r === document ? document.head : r;
    const ex = host.querySelector('style[data-hide]');
    if (on && !ex) {
      const s = document.createElement('style');
      s.dataset.hide = '';
      s.textContent = css;
      host.appendChild(s);
    }
    if (!on && ex) ex.remove();
  }
};

const parseColor = (s) => {
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const v = m[1]
    .split(/[ ,/]+/)
    .filter(Boolean)
    .map(Number);
  return { rgb: v.slice(0, 3), a: v[3] ?? 1 };
};

const at = (png, x, y) => {
  x = Math.min(png.width - 1, Math.max(0, Math.round(x)));
  y = Math.min(png.height - 1, Math.max(0, Math.round(y)));
  const i = (png.width * y + x) * 4;
  return [png.data[i], png.data[i + 1], png.data[i + 2]];
};
const median = (list) => {
  const v = [...list].sort((p, q) => p - q);
  return v[Math.floor(v.length / 2)];
};

/** Marks the switches whose pseudo-elements are hidden for the second capture. */
const mark = (args) => {
  const [on, selector] = args;
  const walk = (r) => {
    for (const el of r.querySelectorAll('*')) {
      if (el.matches(selector)) {
        if (on) el.setAttribute('data-np', '');
        else el.removeAttribute('data-np');
      }
      if (el.shadowRoot) walk(el.shadowRoot);
    }
  };
  walk(document);
};

/** Edge of a control against its surroundings, and the track of a pseudo-element switch against its host. */
const boundaries = (a, b, sr, controls, sc) => {
  const out = [];
  for (const c of controls) {
    const x0 = (c.x - sr.x) * sc,
      y0 = (c.y - sr.y) * sc,
      x1 = x0 + c.w * sc,
      y1 = y0 + c.h * sc,
      cx = (x0 + x1) / 2,
      cy = (y0 + y1) / 2;
    // each side: the pixels 1 to 3 px inside the box against the pixels 1 to 4 px outside it, so that a ring drawn with a
    // box-shadow counts as the edge; the control by its best side (an underline is a boundary)
    const sides = [
      [cx, y0 + 1, 0, -1],
      [cx, y1 - 2, 0, 1],
      [x0 + 1, cy, -1, 0],
      [x1 - 2, cy, 1, 0],
    ];
    const edge = Math.max(
      ...sides.map(([ix, iy, dx, dy]) =>
        Math.max(
          ...[0, 1, 2].flatMap((i) =>
            [1, 2, 3, 4].map((d) =>
              ratio(at(b, ix - dx * i, iy - dy * i), at(b, ix + dx * (d + 1), iy + dy * (d + 1))),
            ),
          ),
        ),
      ),
    );
    let track = null;
    if (c.pseudo) {
      let minX = Infinity,
        minY = Infinity,
        maxX = -1,
        maxY = -1;
      for (let y = Math.max(0, Math.floor(y0)); y < Math.min(a.height, Math.ceil(y1)); y++)
        for (let x = Math.max(0, Math.floor(x0)); x < Math.min(a.width, Math.ceil(x1)); x++) {
          const p = at(a, x, y),
            q = at(b, x, y);
          if (Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]) > 12) {
            minX = Math.min(minX, x);
            maxX = Math.max(maxX, x);
            minY = Math.min(minY, y);
            maxY = Math.max(maxY, y);
          }
        }
      // a track is at least 24 px wide and smaller than its host; a dot, a sweep or an overlay is not a switch
      if (
        maxX - minX >= 24 &&
        maxY - minY > 8 &&
        (maxX - minX) * (maxY - minY) < 0.5 * (x1 - x0) * (y1 - y0)
      ) {
        const mx = (minX + maxX) / 2;
        track = +Math.min(
          ratio(at(a, mx, minY + 2), at(b, mx, minY + 2)),
          ratio(at(a, mx, maxY - 2), at(b, mx, maxY - 2)),
        ).toFixed(2);
      }
    }
    // a button is told apart by its text; of a toggle button only the track that a pseudo-element draws is held to 3:1
    out.push({ name: c.name, edge: c.button ? null : +edge.toFixed(2), track });
  }
  return out;
};

export const contrast = async (page, stageSel, data) => {
  await page.evaluate(hide, true);
  await page.waitForTimeout(50);
  const buf = await page
    .locator(stageSel)
    .screenshot({ animations: 'disabled' })
    .catch(() => null);
  await page.evaluate(mark, [true, SWITCHES + ',[data-pt]']);
  const buf2 = await page
    .locator(stageSel)
    .screenshot({ animations: 'disabled' })
    .catch(() => null);
  await page.evaluate(mark, [false, SWITCHES + ',[data-pt]']);
  await page.evaluate(hide, false);
  if (!buf) return { texts: [], boundaries: [] };
  const png = PNG.sync.read(buf);
  const sc = png.width / data.sr.w;
  const res = [];
  const png2 = buf2 ? PNG.sync.read(buf2) : null;
  for (const t of data.texts) {
    let x0 = Math.max(0, Math.floor((t.x - data.sr.x) * sc)),
      y0 = Math.max(0, Math.floor((t.y - data.sr.y) * sc));
    let x1 = Math.min(png.width, Math.ceil((t.x - data.sr.x + t.w) * sc)),
      y1 = Math.min(png.height, Math.ceil((t.y - data.sr.y + t.h) * sc));
    let painted = [];
    if (t.pseudo && png2) {
      // the pseudo-element may paint a shape of its own (a chip, a badge): the text sits on that, so measure
      // over the pixels it paints (the ones that change when it is hidden)
      for (let y = y0; y < y1; y += 1)
        for (let x = x0; x < x1; x += 1) {
          const p = at(png, x, y),
            q = at(png2, x, y);
          if (Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]) > 12)
            painted.push(p);
        }
      if (painted.length < 20) painted = [];
    }
    if (x1 <= x0 || y1 <= y0) continue;
    const c = parseColor(t.fill && t.fill.startsWith('rgb') ? t.fill : t.color);
    if (!c) continue;
    const px = painted.length
      ? painted.filter((_, i) => i % Math.max(1, Math.floor(painted.length / 200)) === 0)
      : [];
    if (!painted.length)
      for (let y = y0; y < y1; y += Math.max(1, Math.floor((y1 - y0) / 8)))
        for (let x = x0; x < x1; x += Math.max(1, Math.floor((x1 - x0) / 24)))
          px.push(at(png, x, y));
    if (!px.length) continue;
    const a = c.a * t.op;
    const rs = px
      .map((p) => {
        const fg = c.rgb.map((v, k) => v * a + p[k] * (1 - a));
        return ratio(fg, p);
      })
      .sort((p, q) => p - q);
    const large = t.fs >= 24 || (t.fs >= 18.66 && t.fw >= 700);
    res.push({
      text: t.text,
      ratio: +rs[Math.floor(rs.length * 0.2)].toFixed(2),
      min: +rs[0].toFixed(2),
      large,
      fs: t.fs,
    });
  }
  const bnd = png2 ? boundaries(png, png2, data.sr, data.controls, sc) : [];
  return { texts: res, boundaries: bnd };
};

/** Focus stops: the outline of each one, and its colour against the pixels outside it and in its gap. */
export const focusStops = async (page, stageSel, eng) => {
  const stops = [];
  await page.evaluate((s) => {
    const st = document.querySelector(s);
    const m = document.createElement('button');
    m.id = '__pre';
    m.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0';
    st.parentElement.insertBefore(m, st);
    m.focus();
  }, stageSel);
  for (let i = 0; i < 60; i++) {
    // WebKit on macOS moves focus to form fields only with Tab; Option+Tab visits every control, as the other engines do with Tab
    await page.keyboard.press(eng === 'webkit' ? 'Alt+Tab' : 'Tab');
    await page.waitForTimeout(60);
    const inStage = await page.evaluate((s) => {
      const st = document.querySelector(s);
      const a = document.activeElement;
      return st.contains(a) || a === st.firstElementChild;
    }, stageSel);
    if (!inStage) break;
    const shot = await page
      .locator(stageSel)
      .screenshot({ animations: 'allow', caret: 'hide' })
      .catch(() => null);
    const info = await page.evaluate((s) => {
      const st = document.querySelector(s);
      const sr = st.getBoundingClientRect();
      let a = document.activeElement;
      while (a.shadowRoot && a.shadowRoot.activeElement) a = a.shadowRoot.activeElement;
      const cs = getComputedStyle(a);
      const r = a.getBoundingClientRect();
      return {
        tag:
          a.tagName +
          '.' +
          a.className +
          ' ' +
          (a.getAttribute('aria-label') || a.textContent.trim().slice(0, 12)),
        os: cs.outlineStyle,
        ow: parseFloat(cs.outlineWidth),
        oc: cs.outlineColor,
        oo: parseFloat(cs.outlineOffset) || 0,
        bs: cs.boxShadow,
        w: r.width,
        h: r.height,
        vis: r.width > 0,
        box: { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height },
        sw: sr.width,
      };
    }, stageSel);
    if (shot && info.os !== 'none' && info.ow > 0) {
      const png = PNG.sync.read(shot);
      const sc = png.width / info.sw;
      const { x, y, w, h } = info.box;
      const c = parseColor(info.oc);
      const side = (d) =>
        [
          [x + w / 2, y - d],
          [x + w / 2, y + h + d],
          [x - d, y + h / 2],
          [x + w + d, y + h / 2],
        ].map(([px, py]) => [px * sc, py * sc]);
      const ratios = (d) =>
        side(d).map(([px, py]) => {
          if (px < 0 || py < 0 || px >= png.width || py >= png.height) return null;
          const bg = at(png, px, py);
          const f = c.rgb.map((v, k) => v * c.a + bg[k] * (1 - c.a));
          return ratio(f, bg);
        });
      const sets = [ratios(info.oo + info.ow + 2)];
      if (info.oo >= 2) sets.push(ratios(info.oo / 2));
      if (info.oo <= 0) sets.push(ratios(-2));
      // a side is told apart when any of its neighbours (outside, the gap, the element) keeps 3:1; the stop by the median side
      const perSide = [0, 1, 2, 3]
        .map((i) => {
          const v = sets.map((r) => r[i]).filter((n) => n !== null);
          return v.length ? Math.max(...v) : null;
        })
        .filter((n) => n !== null);
      info.ring = perSide.length ? +median(perSide).toFixed(2) : null;
    }
    delete info.box;
    stops.push(info);
  }
  await page.evaluate(() => document.getElementById('__pre')?.remove());
  return stops;
};
export const run = async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const report = {};
  for (const eng of engines) {
    const browser = await pw[eng].launch();
    for (const vp of [1280, 360])
      for (const theme of ['light', 'dark']) {
        const ctx = await browser.newContext({
          viewport: { width: vp, height: 900 },
          colorScheme: theme,
          reducedMotion: process.env.REDUCED ? 'reduce' : 'no-preference',
        });
        const page = await ctx.newPage();
        await page.goto(BASE + '/examples');
        await page.waitForSelector('.stage');
        await page.evaluate((t) => {
          document.documentElement.dataset.theme = t;
        }, theme);
        await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' });
        const ids = await page.evaluate(() =>
          [...document.querySelectorAll('section.demo')].map((s) => s.getAttribute('aria-label')),
        );
        if (process.env.ROUTE) {
          ids.length = 0;
          ids.push('ROUTE');
        }
        const map = {
          'Exposure triangle': 'exposure',
          'Setlist for tonight': 'setlist',
          'Field notebook': 'fieldbook',
          'Wood-type poster': 'typecase',
          'Customs declaration': 'customs',
          'Lighting plot': 'gels',
          'Telephone exchange': 'switchboard',
          'Library card catalogue': 'catalog',
          'Ferry departures': 'departures',
          'Darkroom trays': 'darkroom',
          'Seed packet': 'seedpacket',
          'Pocket atlas': 'atlas',
          ROUTE: 'atlasroute',
        };
        for (let i = 0; i < ids.length; i++) {
          const id = map[ids[i]];
          if (only && !only.includes(id)) continue;

          const stageSel = '.stage[data-m]';
          const stateList = process.env.ROUTE
            ? states.atlasroute
            : [{ name: 'default', go: async () => {} }, ...(states[id] ?? [])];
          for (const st of stateList) {
            const pg = await ctx.newPage();
            if (st.init) await pg.addInitScript(st.init);
            await pg.goto(BASE + (st.url ?? '/examples'));
            await pg.waitForSelector('.stage');
            const page = pg;
            await page.evaluate((t) => {
              document.documentElement.dataset.theme = t;
            }, theme);
            await page.evaluate(
              (i) => {
                document.querySelectorAll('section.demo')[i].querySelector('.stage').dataset.m =
                  '1';
              },
              process.env.ROUTE ? 0 : i,
            );
            await page.locator(stageSel).scrollIntoViewIfNeeded();
            await st.go(page, stageSel);
            await page.waitForTimeout(Number(process.env.WAIT ?? st.wait ?? 700));
            if (process.env.FONTS)
              await page.evaluate((sel) => {
                const h = document.querySelector(sel).firstElementChild;
                const w = (r) => {
                  for (const e of r.querySelectorAll('*')) {
                    const f = getComputedStyle(e).fontFamily.split(',').pop().trim();
                    e.style.setProperty('font-family', f, 'important');
                    if (e.shadowRoot) w(e.shadowRoot);
                  }
                };
                h.style.setProperty('font-family', 'sans-serif', 'important');
                w(h.shadowRoot ?? h);
              }, stageSel);
            const anims = await page.evaluate(() => {
              const out = [];
              const seen = new Set();
              const take = (list) => {
                for (const a of list)
                  if (!seen.has(a) && a.playState === 'running') {
                    seen.add(a);
                    out.push(
                      (a.animationName || a.transitionProperty || '?') +
                        ':' +
                        a.effect?.getTiming().iterations,
                    );
                  }
              };
              take(document.getAnimations());
              const walk = (r) => {
                for (const e of r.querySelectorAll('*'))
                  if (e.shadowRoot) {
                    take(e.shadowRoot.getAnimations());
                    walk(e.shadowRoot);
                  }
              };
              walk(document);
              return out;
            });
            const data = await page.evaluate(gather, {
              stage: stageSel,
              controls: CONTROLS,
              switches: SWITCHES,
            });
            const rec = {
              anims,
              overflow: data.overflow,
              small: data.small,
              scroll: [data.sw, data.cw],
            };
            const { texts: c, boundaries: bnd } = await contrast(page, stageSel, data);
            rec.boundaries = bnd.filter(
              (x) => (x.edge !== null && x.edge < 3) || (x.track !== null && x.track < 3),
            );
            rec.nBoundaries = bnd.length;
            rec.lowest = c
              .filter((x) => x.ratio < (x.large ? 3 : 4.5))
              .sort((a, b) => a.ratio - b.ratio);
            rec.minRatio = c.length ? Math.min(...c.map((x) => x.ratio)) : null;
            rec.nText = c.length;
            if ((vp === 1280 && theme === 'light' && st.name === 'default') || process.env.FOCUS)
              rec.focus = await focusStops(page, stageSel, eng);
            const file = `${OUT}/${eng}-${vp}-${theme}-${id}-${st.name}.png`;
            if (st.name === 'default' || process.env.SHOTS)
              await page
                .locator(stageSel)
                .screenshot({ path: file, animations: 'disabled' })
                .catch(() => {});
            report[`${eng}/${vp}/${theme}/${id}/${st.name}`] = rec;
            await pg.close();
          }
        }
        await ctx.close();
      }
    await browser.close();
  }
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
  return report;
};
if (import.meta.url === `file://${process.argv[1]}`) {
  const r = await run();
  let bad = 0;
  for (const [k, v] of Object.entries(r)) {
    const probs = [];
    if (v.overflow.length)
      probs.push(`overflow ${v.overflow.length}: ${JSON.stringify(v.overflow.slice(0, 2))}`);
    if (v.scroll[0] > v.scroll[1] + 1) probs.push(`scroll ${v.scroll}`);
    if (process.env.REDUCED && v.anims.length) probs.push('anims ' + v.anims);
    if (v.small.length)
      probs.push(`small ${v.small.length}: ${JSON.stringify(v.small.slice(0, 3))}`);
    if (v.lowest.length)
      probs.push(`contrast<${v.lowest.length}: ${JSON.stringify(v.lowest.slice(0, 3))}`);
    if (v.focus) {
      const nf = v.focus.filter((f) => !(f.os !== 'none' && f.ow >= 2));
      if (nf.length) probs.push(`focus weak ${nf.length}: ${JSON.stringify(nf.slice(0, 2))}`);
      const lc = v.focus.filter((f) => f.ring != null && f.ring < 3);
      if (lc.length)
        probs.push(
          `focus outline contrast under 3:1 ${lc.length}: ${JSON.stringify(lc.slice(0, 2))}`,
        );
    }
    if (v.boundaries?.length)
      probs.push(
        `boundary under 3:1 ${v.boundaries.length}: ${JSON.stringify(v.boundaries.slice(0, 3))}`,
      );
    console.log(
      k,
      `min=${v.minRatio} n=${v.nText}`,
      probs.length ? 'PROBLEMS' : 'ok',
      ...probs.map((p) => '\n   ' + p),
    );
    if (probs.length) bad++;
  }
  console.log('problem rows', bad);
}
