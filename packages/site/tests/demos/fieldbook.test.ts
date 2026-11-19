import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { create } from '@site/demos/fieldbook';

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});

const open = () => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  const root = demo.shadowRoot!;
  const rows = () =>
    [...root.querySelectorAll('.row')].map((row) => [
      row.querySelector('.name')?.textContent,
      row.querySelector('.tally')?.getAttribute('aria-label'),
    ]);
  const button = (label: string) =>
    root.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
  const status = () => root.querySelector('[role="status"]')!;
  const add = (name: string) => {
    const field = root.querySelector('input')!;
    field.value = name;
    field.dispatchEvent(new Event('input'));
    root.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
  };
  const tear = () => root.querySelector<HTMLButtonElement>('.tear')!.click();
  return { root, rows, button, status, add, tear };
};

const stored = () => JSON.parse(localStorage.getItem('ecmact-site-fieldbook')!);

describe('fieldbook example', () => {
  it('opens a page of sample sightings drawn as tally marks', () => {
    const { rows, root, status } = open();
    expect(rows()).toEqual([
      ['Wren', '7 Wren'],
      ['Curlew', '2 Curlew'],
      ['Heron', '1 Heron'],
    ]);
    expect(root.querySelector('.tally')?.innerHTML).toBe('<s>||||</s>||');
    expect(status().textContent).toBe('10 seen so far. Add a sighting, then reload the page.');
    expect(localStorage.getItem('ecmact-site-fieldbook')).toBeNull();
  });

  it('writes a sighting to the storage and reads the entries back in a new notebook', () => {
    const first = open();
    first.button('One more Wren').click();
    first.button('One more Heron').click();
    expect(stored()).toEqual({ state: { birds: expect.any(Array) }, version: 2 });
    expect(stored().state.birds[0]).toEqual({ name: 'Wren', count: 8 });
    expect(first.status().textContent).toBe(
      '12 seen. Written in pencil: reload the page and it stays.',
    );
    document.body.replaceChildren();
    const second = open();
    expect(second.rows()).toEqual([
      ['Wren', '8 Wren'],
      ['Curlew', '2 Curlew'],
      ['Heron', '2 Heron'],
    ]);
    expect(second.status().textContent).toContain('Written in pencil');
  });

  it('adds a bird once, in capitals, and ignores an empty name', () => {
    const { rows, add, button } = open();
    add('  plover ');
    add('PLOVER');
    add('   ');
    expect(rows().at(-1)).toEqual(['Plover', '1 Plover']);
    expect(rows()).toHaveLength(4);
    button('One more Plover').click();
    expect(rows().at(-1)).toEqual(['Plover', '2 Plover']);
  });

  it('tears the page out: the sample page comes back and the storage is empty', () => {
    const { rows, button, tear, status } = open();
    button('One more Curlew').click();
    expect(localStorage.getItem('ecmact-site-fieldbook')).not.toBeNull();
    tear();
    expect(rows()[1]).toEqual(['Curlew', '2 Curlew']);
    expect(localStorage.getItem('ecmact-site-fieldbook')).toBeNull();
    expect(status().textContent).toContain('Add a sighting');
  });

  it('converts a notebook that an older version stored', () => {
    localStorage.setItem(
      'ecmact-site-fieldbook',
      JSON.stringify({ state: { tally: { wren: 3, plover: 6 } }, version: 1 }),
    );
    const { rows } = open();
    expect(rows()).toEqual([
      ['Wren', '3 Wren'],
      ['Plover', '6 Plover'],
    ]);
    expect(stored().version).toBe(2);
    expect(stored().state.birds).toEqual([
      { name: 'Wren', count: 3 },
      { name: 'Plover', count: 6 },
    ]);
  });

  it('starts again from the sample page when the stored version is unknown', () => {
    localStorage.setItem(
      'ecmact-site-fieldbook',
      JSON.stringify({ state: { birds: [{ name: 'Kite', count: 1 }] }, version: 9 }),
    );
    expect(open().rows()).toHaveLength(3);
  });

  it('works for the visit and says so when the storage is blocked', () => {
    const blocked = {
      getItem: () => {
        throw new DOMException('blocked', 'SecurityError');
      },
      setItem: () => {
        throw new DOMException('blocked', 'SecurityError');
      },
      removeItem: () => {
        throw new DOMException('blocked', 'SecurityError');
      },
    };
    vi.stubGlobal('localStorage', blocked);
    const { rows, button, status, tear } = open();
    expect(status().textContent).toBe(
      'Storage is blocked: this page will not be kept after the visit.',
    );
    expect(status().classList.contains('lost')).toBe(true);
    button('One more Wren').click();
    expect(rows()[0]).toEqual(['Wren', '8 Wren']);
    tear();
    expect(rows()[0]).toEqual(['Wren', '7 Wren']);
    expect(status().textContent).toContain('will not be kept');
  });

  it('says the page will not be kept when a write fails after the read worked', () => {
    const { button, status } = open();
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new DOMException('full', 'QuotaExceededError');
      },
      removeItem: () => {},
    });
    button('One more Wren').click();
    expect(status().textContent).toContain('will not be kept');
  });
});
