import { afterEach, describe, expect, it } from 'vitest';
import { create } from '@site/demos/widget';

afterEach(() => {
  document.body.replaceChildren();
});

const open = async () => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  await new Promise((resolve) => setTimeout(resolve, 0));
  const root = demo.shadowRoot!;
  const inner = () => (badge.shadowRoot!.querySelector('em-button') as HTMLElement).shadowRoot!;
  const badge = root.querySelector('hello-badge') as HTMLElement;
  const [name, greeting, color] = [...root.querySelectorAll<HTMLInputElement>('input')];
  return { root, badge, inner, name: name!, greeting: greeting!, color: color! };
};

describe('widget demo', () => {
  it('registers the badge once, even when the demo is created twice', async () => {
    await open();
    document.body.replaceChildren();
    await open();
    expect(customElements.get('hello-badge')).toBeDefined();
  });

  it('greets the world when no attribute is set', async () => {
    await open();
    const bare = document.createElement('hello-badge');
    document.body.append(bare);
    await new Promise((resolve) => setTimeout(resolve, 0));
    const inner = bare.shadowRoot!.querySelector('em-button') as HTMLElement;
    expect(inner.shadowRoot!.textContent).toBe('Hello, world!');
  });

  it('follows the attributes', async () => {
    const { inner, name, greeting } = await open();
    expect(inner().textContent).toBe('Hello, ECMact!');
    name.value = 'Ada';
    name.dispatchEvent(new Event('input'));
    greeting.value = 'Hi';
    greeting.dispatchEvent(new Event('input'));
    expect(inner().textContent).toBe('Hi, Ada!');
  });

  it('is colored from outside and reports the click', async () => {
    const { root, badge, inner, color } = await open();
    color.value = '#ff0000';
    color.dispatchEvent(new Event('input'));
    expect(badge.style.getPropertyValue('--badge-color')).toBe('#ff0000');
    inner().querySelector('button')!.click();
    expect(root.querySelector('pre')?.textContent).toBe('greet {"name":"ECMact"}');
  });
});
