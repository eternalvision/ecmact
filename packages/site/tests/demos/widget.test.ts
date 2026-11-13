import { afterEach, describe, expect, it } from 'vitest';
import { create } from '@site/demos/widget';

afterEach(() => {
  document.body.replaceChildren();
});

const open = () => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  const root = demo.shadowRoot!;
  const badge = root.querySelector('hello-badge') as HTMLElement;
  const button = () => badge.shadowRoot!.querySelector('button')!;
  const [name, greeting, color] = [...root.querySelectorAll<HTMLInputElement>('input')];
  return { root, badge, button, name: name!, greeting: greeting!, color: color! };
};

const type = (input: HTMLInputElement, value: string) => {
  input.value = value;
  input.dispatchEvent(new Event('input'));
};

describe('widget demo', () => {
  it('registers the badge once, even when the demo is created twice', () => {
    open();
    document.body.replaceChildren();
    expect(() => open()).not.toThrow();
    expect(customElements.get('hello-badge')).toBeDefined();
  });

  it('greets the world when no attribute is set', () => {
    open();
    const bare = document.createElement('hello-badge');
    document.body.append(bare);
    expect(bare.shadowRoot!.querySelector('button')?.textContent).toBe('Hello, world!');
  });

  it('follows the attributes, which follow the inputs', () => {
    const { badge, button, name, greeting } = open();
    expect(badge.getAttribute('name')).toBe('ECMact');
    expect(button().textContent).toBe('Hello, ECMact!');
    type(name, 'Ada');
    type(greeting, 'Hi');
    expect(badge.getAttribute('name')).toBe('Ada');
    expect(badge.getAttribute('greeting')).toBe('Hi');
    expect(button().textContent).toBe('Hi, Ada!');
  });

  it('is colored from outside and reports the click', () => {
    const { root, badge, button, color } = open();
    type(color, '#ff0000');
    expect(badge.style.getPropertyValue('--badge-color')).toBe('#ff0000');
    button().click();
    expect(root.querySelector('pre')?.textContent).toBe('greet {"name":"ECMact"}');
  });
});
