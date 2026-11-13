import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const library = readFileSync(fileURLToPath(new URL('../dist/index.js', import.meta.url)), 'utf8');
const rounds = Number(process.env.ROUNDS ?? 7);
const sizes = [1000, 10000];
const html = process.env.BENCH_HTML;

const page = `
${library}
const { table, tbody, td, tr } = tags;
const steps = ['create', 'update', 'swap', 'remove', 'append', 'clear'];
const makeRows = (count, from = 0) =>
  Array.from({ length: count }, (_, index) => ({ id: from + index, label: signal('row ' + (from + index)) }));
const frame = () => new Promise((done) => requestAnimationFrame(() => setTimeout(done)));
const measure = async (action) => {
  const start = performance.now();
  action();
  await frame();
  return performance.now() - start;
};
const bench = async (count) => {
  document.body.replaceChildren();
  const rows = signal([]);
  mount(
    document.body,
    table(tbody(each(rows, (row) => tr(td(String(row.id)), td(row.label)), { by: (row) => row.id }))),
  );
  const results = {};
  results.create = await measure(() => (rows.value = makeRows(count)));
  results.update = await measure(() =>
    rows.value.forEach((row, index) => index % 10 === 0 && (row.label.value += '!')),
  );
  results.swap = await measure(() => {
    const next = [...rows.value];
    [next[1], next[next.length - 2]] = [next[next.length - 2], next[1]];
    rows.value = next;
  });
  results.remove = await measure(() => {
    const next = [...rows.value];
    next.splice(Math.floor(next.length / 2), 1);
    rows.value = next;
  });
  results.append = await measure(() => (rows.value = rows.value.concat(makeRows(count / 10, count))));
  results.clear = await measure(() => (rows.value = []));
  return results;
};
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
window.run = async (rounds, sizes) => {
  const lines = [
    '| rows | create | update 1 in 10 | swap two | remove one | append 10% | clear |',
    '| ---- | ------ | -------------- | -------- | ---------- | ---------- | ----- |',
  ];
  for (const count of sizes) {
    await bench(count);
    const runs = [];
    for (let round = 0; round < rounds; round++) runs.push(await bench(count));
    const cells = steps.map((step) => median(runs.map((run) => run[step])).toFixed(1));
    lines.push('| ' + [count, ...cells].join(' | ') + ' |');
  }
  document.body.replaceChildren();
  return lines.join('\\n');
};
`;

/**
 * Writes the line that says what was measured and where.
 *
 * @param {string} browser - The name of the browser.
 * @returns {string} The title of the table.
 */
const title = (browser) =>
  `ECMact list benchmark, ${browser}, median of ${rounds} runs, ms. Every row is a tr with two td, kept by key with each(); the time includes the next frame.`;

if (html) {
  writeFileSync(
    html,
    `<!doctype html><meta charset="utf-8"><title>ECMact benchmark</title><body><script type="module">${page}
const result = await window.run(${rounds}, ${JSON.stringify(sizes)});
const output = document.createElement('pre');
output.id = 'result';
output.textContent = ${JSON.stringify(title('this browser'))} + '\\n\\n' + result;
document.body.append(output);
</script></body>`,
  );
  console.log(`wrote ${html}: open it in a browser, the table appears when the runs are done`);
} else {
  const { chromium } = createRequire(import.meta.url)('playwright');
  const browser = await chromium.launch();
  const tab = await browser.newPage();
  await tab.setContent('<body></body>');
  await tab.addScriptTag({ type: 'module', content: page });
  await tab.waitForFunction('window.run');
  console.log(`${title(`Chromium ${browser.version()}`)}\n`);
  console.log(await tab.evaluate(([count, list]) => globalThis.run(count, list), [rounds, sizes]));
  await browser.close();
}
