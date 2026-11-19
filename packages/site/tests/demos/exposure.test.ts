import { afterEach, describe, expect, it } from 'vitest';
import { create } from '@site/demos/exposure';

afterEach(() => {
  document.body.replaceChildren();
});

const open = () => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  const root = demo.shadowRoot!;
  const readout = (name: string) => root.querySelector(`[data-readout="${name}"]`)!.textContent;
  const runs = (name: string) => root.querySelector(`[data-runs="${name}"]`)!.textContent;
  const key = (label: string) => root.querySelector<HTMLButtonElement>(`[aria-label="${label}"]`)!;
  const lock = root.querySelector<HTMLButtonElement>('.lock')!;
  const tape = () => root.querySelector('[data-tape]')!.textContent;
  return { demo, root, readout, runs, key, lock, tape };
};

describe('exposure example', () => {
  it('starts at f/5.6, 1/125 and ISO 400, which is EV 10, each text made once', () => {
    const { readout, runs } = open();
    expect(['aperture', 'shutter', 'iso', 'ev'].map(readout)).toEqual([
      'f/5.6',
      '1/125',
      '400',
      'EV 10.0',
    ]);
    expect(['aperture', 'shutter', 'iso', 'ev'].map(runs)).toEqual(['x1', 'x1', 'x1', 'x1']);
  });

  it('follows one value and the exposure value computed from it, and nothing else', () => {
    const { readout, runs, key, tape } = open();
    key('Narrower aperture').click();
    expect(readout('aperture')).toBe('f/8');
    expect(readout('ev')).toBe('EV 11.0');
    expect(['aperture', 'shutter', 'iso', 'ev'].map(runs)).toEqual(['x2', 'x1', 'x1', 'x2']);
    key('Slower shutter').click();
    key('Higher ISO').click();
    expect(readout('shutter')).toBe('1/60');
    expect(readout('iso')).toBe('800');
    expect(readout('ev')).toBe('EV 9.0');
    expect(tape()).toBe('TAPE 10 > 11 > 10 > 9');
  });

  it('keeps the exposure value and runs its text once when the lock moves two values in one batch', () => {
    const { readout, runs, key, lock, tape } = open();
    lock.click();
    expect(lock.textContent).toBe('EV lock: on');
    expect(lock.getAttribute('aria-pressed')).toBe('true');
    key('Narrower aperture').click();
    expect([readout('aperture'), readout('shutter')]).toEqual(['f/8', '1/60']);
    expect(readout('ev')).toBe('EV 10.0');
    expect(['aperture', 'shutter', 'iso', 'ev'].map(runs)).toEqual(['x2', 'x2', 'x1', 'x2']);
    key('Faster shutter').click();
    expect([readout('aperture'), readout('shutter')]).toEqual(['f/5.6', '1/125']);
    key('Higher ISO').click();
    expect([readout('iso'), readout('shutter')]).toEqual(['800', '1/250']);
    expect(readout('ev')).toBe('EV 10.0');
    expect(['aperture', 'shutter', 'iso', 'ev'].map(runs)).toEqual(['x3', 'x4', 'x2', 'x4']);
    expect(tape()).toBe('TAPE 10');
    lock.click();
    expect(lock.textContent).toBe('EV lock: off');
  });

  it('stops at the ends of a scale', () => {
    const { readout, key } = open();
    Array.from({ length: 8 }, () => key('Wider aperture').click());
    expect(readout('aperture')).toBe('f/1.4');
    Array.from({ length: 9 }, () => key('Narrower aperture').click());
    expect(readout('aperture')).toBe('f/16');
  });

  it('while locked also stops when the partner has no stop left', () => {
    const { readout, key, lock } = open();
    lock.click();
    Array.from({ length: 3 }, () => key('Narrower aperture').click());
    expect([readout('aperture'), readout('shutter'), readout('ev')]).toEqual([
      'f/16',
      '1/15',
      'EV 10.0',
    ]);
    key('Narrower aperture').click();
    key('Slower shutter').click();
    expect([readout('aperture'), readout('shutter')]).toEqual(['f/16', '1/15']);
    key('Wider aperture').click();
    expect([readout('aperture'), readout('shutter')]).toEqual(['f/11', '1/30']);
  });

  it('while locked also stops when the partner of a slower shutter is already at the narrowest aperture', () => {
    const { readout, key, lock } = open();
    Array.from({ length: 3 }, () => key('Narrower aperture').click());
    lock.click();
    key('Slower shutter').click();
    expect([readout('aperture'), readout('shutter')]).toEqual(['f/16', '1/125']);
  });

  it('stops writing the tape when it leaves the page', () => {
    const { demo, key, tape } = open();
    const before = tape();
    demo.remove();
    key('Narrower aperture').click();
    expect(tape()).toBe(before);
  });
});
