import { describe, expect, it } from 'vitest';
import { computed, signal } from '@em';
import { resolveProps } from '@em/utils/resolveProps';

describe('resolveProps', () => {
  it('passes plain values through', () => {
    const handler = () => {};
    const children = [document.createElement('i')];
    expect(resolveProps({ content: 'a', title: 'b', onclick: handler, children })).toEqual({
      content: 'a',
      title: 'b',
      onclick: handler,
      children,
    });
  });

  it('unwraps signals and computed signals', () => {
    const text = signal('a');
    const lang = computed(() => 'en');
    expect(resolveProps({ content: text, lang })).toEqual({ content: 'a', lang: 'en' });
  });

  it('reads the current value', () => {
    const text = signal('a');
    text.value = 'b';
    expect(resolveProps({ content: text }).content).toBe('b');
  });

  it('unwraps the values of a style object', () => {
    const color = signal('red');
    expect(resolveProps({ style: { color, padding: '1px', zIndex: 2 } }).style).toEqual({
      color: 'red',
      padding: '1px',
      zIndex: 2,
    });
  });

  it('unwraps a style signal and the values inside it', () => {
    const color = signal('red');
    const style = signal({ color, margin: '0' });
    expect(resolveProps({ style }).style).toEqual({ color: 'red', margin: '0' });
  });

  it('leaves a missing or non-object style alone', () => {
    expect(resolveProps({}).style).toBeUndefined();
    expect(resolveProps({ style: null as never }).style).toBeNull();
    expect(resolveProps({ style: 'x' as never }).style).toBe('x');
  });

  it('returns a new object', () => {
    const props = { content: 'a' };
    expect(resolveProps(props)).not.toBe(props);
  });
});
