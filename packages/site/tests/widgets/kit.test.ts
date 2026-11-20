import { afterEach, describe, expect, it } from 'vitest';
import { money, moveIndex, plain, readNumber, widgetCss } from '@site/widgets/kit';

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
    expect(money(12.4, 'nope', 2)).toBe('12.40 nope');
  });

  it('shows the decimals that are asked for', () => {
    expect(money(1.84, 'USD', 2)).toBe('$1.84');
    expect(money(184, 'USD', 2)).toBe('$184.00');
  });
});

describe('plain', () => {
  it('writes a number the way the language of the page does, with the decimals asked for', () => {
    expect(plain(1234)).toBe('1,234');
    expect(plain(1.5, 2)).toBe('1.50');
    document.documentElement.lang = 'de';
    expect(plain(1234.5, 1)).toBe('1.234,5');
  });
});

describe('moveIndex', () => {
  it('moves to the next and the previous item, wrapping around, and to the ends', () => {
    expect(moveIndex('ArrowRight', 0, 3)).toBe(1);
    expect(moveIndex('ArrowDown', 2, 3)).toBe(0);
    expect(moveIndex('ArrowLeft', 1, 3)).toBe(0);
    expect(moveIndex('ArrowUp', 0, 3)).toBe(2);
    expect(moveIndex('Home', 2, 3)).toBe(0);
    expect(moveIndex('End', 0, 3)).toBe(2);
  });

  it('moves nothing for any other key', () => {
    expect(moveIndex('Enter', 1, 3)).toBeUndefined();
    expect(moveIndex('a', 1, 3)).toBeUndefined();
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
