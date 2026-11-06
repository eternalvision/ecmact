import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const library = readFileSync(fileURLToPath(new URL('../dist/index.js', import.meta.url)), 'utf8');
const rounds = Number(process.env.ROUNDS ?? 7);
const sizes = [1000, 10000];

const page = `
${library}
const makeRows = (count, from = 0) =>
  Array.from({ length: count }, (_, index) => ({ id: from + index, label: signal('row ' + (from + index)) }));
const rowOf = (row, shadow) =>
  em.Row({
    tag: 'tr',
    key: row.id,
    shadow,
    children: [
      tags.td({ content: String(row.id), shadow }),
      tags.td({ content: row.label, shadow }),
    ],
  });
window.bench = async (name, count, shadow, reuse) => {
  document.body.replaceChildren();
  const cache = new Map();
  const rowFor = (row) => {
    if (!reuse) return rowOf(row, shadow);
    if (!cache.has(row.id)) cache.set(row.id, rowOf(row, shadow));
    return cache.get(row.id);
  };
  const table = em.Table({ tag: 'tbody', shadow });
  document.body.append(table);
  let rows = [];
  const paint = () => table.setState({ children: rows.map(rowFor) });
  const frame = () => new Promise((done) => requestAnimationFrame(() => setTimeout(done)));
  const measure = async (action) => {
    const start = performance.now();
    action();
    await frame();
    return performance.now() - start;
  };
  const results = {};
  rows = makeRows(count);
  results.create = await measure(paint);
  results.update = await measure(() => rows.forEach((row, index) => index % 10 === 0 && (row.label.value += '!')));
  [rows[1], rows[rows.length - 2]] = [rows[rows.length - 2], rows[1]];
  results.swap = await measure(paint);
  rows.splice(Math.floor(rows.length / 2), 1);
  results.remove = await measure(paint);
  rows = rows.concat(makeRows(count / 10, count));
  results.append = await measure(paint);
  rows = [];
  results.clear = await measure(paint);
  return results;
};
`;

const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];

const browser = await chromium.launch();
const tab = await browser.newPage();
await tab.setContent('<table></table>');
await tab.addScriptTag({ type: 'module', content: page });
await tab.waitForFunction('window.bench');

console.log(`ECMact list benchmark, Chromium ${browser.version()}, median of ${rounds} runs, ms\n`);
console.log(
  '| rows | rows are | shadow | create | update 1 in 10 | swap two | remove one | append 10% | clear |',
);
console.log(
  '| ---- | -------- | ------ | ------ | -------------- | -------- | ---------- | ---------- | ----- |',
);
for (const count of sizes) {
  for (const [reuse, shadow] of [
    [false, false],
    [false, true],
    [true, false],
    [true, true],
  ]) {
    await tab.evaluate(([n, s, r]) => window.bench('warmup', n, s, r), [count, shadow, reuse]);
    const runs = [];
    for (let round = 0; round < rounds; round++) {
      runs.push(
        await tab.evaluate(([n, s, r]) => window.bench('run', n, s, r), [count, shadow, reuse]),
      );
    }
    const cell = (key) => median(runs.map((run) => run[key])).toFixed(1);
    console.log(
      `| ${count} | ${reuse ? 'reused' : 'rebuilt'} | ${shadow ? 'yes' : 'no'} | ${cell('create')} | ${cell('update')} | ${cell('swap')} | ${cell('remove')} | ${cell('append')} | ${cell('clear')} |`,
    );
  }
}
await browser.close();
