import { describe, expect, it } from 'vitest';

describe('bundle', () => {
  it('registers the widgets when it is loaded', async () => {
    await import('@site/widgets/bundle');
    expect(customElements.get('poll-widget')).toBeDefined();
  });
});
