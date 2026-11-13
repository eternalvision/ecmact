import { afterEach, describe, expect, it } from 'vitest';
import { compact, money, readNumber, widgetCss } from '@site/widgets/kit';

afterEach(() => {
  document.documentElement.lang = '';
});

describe('widgetCss', () => {
  it('starts with the reset that keeps the page out and lets hidden win, then the rules of the widget', () => {
    const text = widgetCss('.a { color: red; }');
    expect(text).toContain(':host { all: initial; }');
    expect(text).toContain(':host([hidden]) { display: none; }');
    expect(text).toContain('[hidden] { display: none !important; }');
    expect(text.indexOf('.a { color: red; }')).toBeGreaterThan(text.indexOf('[hidden]'));
  });
});

describe('money', () => {
  it('formats an amount in a currency', () => {
    expect(money(1234, 'USD')).toBe('$1,234');
  });

  it('writes the amount the way the language of the page does', () => {
    document.documentElement.lang = 'de';
    expect(money(1234, 'EUR')).toMatch(/1\.234\s€/);
  });

  it('falls back to English for a language tag the browser rejects', () => {
    document.documentElement.lang = 'not a language';
    expect(money(1234, 'USD')).toBe('$1,234');
  });

  it('falls back to plain text for an unknown currency', () => {
    expect(money(12.4, 'nope')).toBe('12 nope');
  });
});

describe('compact', () => {
  it('shortens counts, with a unit for every size', () => {
    expect(compact(950)).toBe('950');
    expect(compact(1234)).toBe('1.2K');
    expect(compact(9999)).toBe('10K');
    expect(compact(999999)).toBe('1M');
    expect(compact(2500000)).toBe('2.5M');
  });
});

describe('readNumber', () => {
  it('reads a number and falls back for anything that is not one', () => {
    expect(readNumber('45', 12)).toBe(45);
    expect(readNumber('0', 12)).toBe(0);
    expect(readNumber('', 12)).toBe(12);
    expect(readNumber('  ', 12)).toBe(12);
    expect(readNumber(null, 12)).toBe(12);
    expect(readNumber(undefined, 12)).toBe(12);
    expect(readNumber('abc', 12)).toBe(12);
    expect(readNumber('1,5', 12)).toBe(12);
    expect(readNumber('Infinity', 12)).toBe(12);
  });

  it('rejects a number below the minimum', () => {
    expect(readNumber('-5', 12)).toBe(12);
    expect(readNumber('-5', 12, -10)).toBe(-5);
  });
});
