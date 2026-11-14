import { afterEach, describe, expect, it, onTestFinished, vi } from 'vitest';
import { effect, em, signal, tags } from '@em';
import { defineWidget } from '@em/widget/widget';
import { tick } from '@tests/helpers';

let count = 0;
const nextName = () => `browser-widget-${++count}`;

afterEach(() => {
  document.body.replaceChildren();
});

/** Two containers in the document, one to move into. */
const makeTargets = () => {
  const from = document.createElement('div');
  const to = document.createElement('div');
  document.body.append(from, to);
  return { from, to };
};

describe('component: moved and removed in a real engine', () => {
  /** A component whose `mounted` starts an effect and returns a cleanup; `order` records the hooks that ran. */
  const setup = () => {
    const outside = signal(0);
    const order: string[] = [];
    const run = vi.fn(() => void outside.value);
    const cleanup = vi.fn(() => void order.push('cleanup'));
    const unmounted = vi.fn(() => void order.push('unmounted'));
    const mounted = vi.fn(() => {
      effect(run);
      return cleanup;
    });
    const card = em.Card(
      { mounted, unmounted },
      tags.p(() => String(outside.value)),
    );
    return { outside, order, run, cleanup, mounted, unmounted, card };
  };

  it('stays alive when it is moved: the cleanup, `unmounted` and `mounted` run, and it follows signals in between', async () => {
    const { outside, order, run, cleanup, mounted, unmounted, card } = setup();
    const { from, to } = makeTargets();
    from.append(card);
    const paragraph = card.shadowRoot!.querySelector('p');
    expect(mounted).toHaveBeenCalledTimes(1);
    // the two halves of a move: it is disconnected, and a signal changes before it is connected again
    card.remove();
    outside.value = 1;
    expect(card.shadowRoot!.textContent).toBe('1');
    to.append(card);
    await tick();
    expect(card.parentElement).toBe(to);
    expect(card.shadowRoot!.querySelector('p')).toBe(paragraph);
    // documented: a move is a disconnect and a connect, so the cleanup, `unmounted` and `mounted` run
    expect(order).toEqual(['cleanup', 'unmounted']);
    expect(cleanup).toHaveBeenCalledTimes(1);
    expect(unmounted).toHaveBeenCalledTimes(1);
    expect(mounted).toHaveBeenCalledTimes(2);
    run.mockClear();
    outside.value = 2;
    expect(card.shadowRoot!.textContent).toBe('2');
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('runs the cleanup for good when it is removed, and stops following signals', async () => {
    const { outside, run, cleanup, card } = setup();
    document.body.append(card);
    card.remove();
    await tick();
    expect(cleanup).toHaveBeenCalledTimes(1);
    run.mockClear();
    outside.value = 1;
    expect(run).not.toHaveBeenCalled();
    expect(card.shadowRoot!.textContent).toBe('0');
  });
});

describe('widget: moved and removed in a real engine', () => {
  /** A widget whose `render` starts an effect and holds an input. */
  const setup = () => {
    const outside = signal(0);
    const run = vi.fn(() => void outside.value);
    const render = vi.fn(() => {
      effect(run);
      return tags.input();
    });
    const name = nextName();
    defineWidget(name, render);
    return { outside, run, render, element: document.createElement(name) };
  };

  it('does not run its cleanup when it is moved: the render and the state stay', async () => {
    const { outside, run, render, element } = setup();
    const { from, to } = makeTargets();
    from.append(element);
    const input = element.shadowRoot!.querySelector('input')!;
    input.value = 'typed';
    to.append(element);
    await tick();
    expect(element.parentElement).toBe(to);
    expect(render).toHaveBeenCalledTimes(1);
    expect(element.shadowRoot!.querySelector('input')).toBe(input);
    expect(input.value).toBe('typed');
    run.mockClear();
    outside.value = 1;
    expect(run).toHaveBeenCalledTimes(1);
  });

  it('stops what render started when it is removed, and renders again when it is put back', async () => {
    const { outside, run, render, element } = setup();
    document.body.append(element);
    element.remove();
    await tick();
    expect(element.shadowRoot!.childNodes).toHaveLength(0);
    run.mockClear();
    outside.value = 1;
    expect(run).not.toHaveBeenCalled();
    document.body.append(element);
    expect(render).toHaveBeenCalledTimes(2);
    expect(element.shadowRoot!.querySelector('input')).not.toBeNull();
  });
});

describe('widget: events across the shadow boundary', () => {
  it('delivers an emitted event to a listener outside the shadow root, from the host', () => {
    const name = nextName();
    defineWidget(name, ({ emit }) =>
      tags.button({ onclick: () => emit('pay', { amount: 5 }) }, 'Pay'),
    );
    const element = document.createElement(name);
    document.body.append(element);
    const heard = vi.fn((event: Event) => ({
      target: event.target,
      detail: (event as CustomEvent).detail,
    }));
    document.body.addEventListener('pay', heard);
    onTestFinished(() => document.body.removeEventListener('pay', heard));
    element.shadowRoot!.querySelector('button')!.click();
    expect(heard).toHaveBeenCalledTimes(1);
    expect(heard).toHaveReturnedWith({ target: element, detail: { amount: 5 } });
  });

  it('leaves the shadow root of a component that holds the widget, with the component as the target', () => {
    const name = nextName();
    defineWidget(name, ({ emit }) => tags.button({ onclick: () => emit('pay', 5) }, 'Pay'));
    const element = document.createElement(name);
    const card = em.Card(element);
    document.body.append(card);
    const heard = vi.fn((event: Event) => event.target);
    document.addEventListener('pay', heard);
    onTestFinished(() => document.removeEventListener('pay', heard));
    element.shadowRoot!.querySelector('button')!.click();
    expect(heard).toHaveBeenCalledTimes(1);
    expect(heard).toHaveReturnedWith(card);
  });

  it('reaches a listener on the document and can be cancelled by it', () => {
    const name = nextName();
    let result: boolean | undefined;
    defineWidget(name, ({ emit }) =>
      tags.button({ onclick: () => void (result = emit('pay')) }, 'Pay'),
    );
    const element = document.createElement(name);
    document.body.append(element);
    const cancel = (event: Event) => event.preventDefault();
    document.addEventListener('pay', cancel);
    onTestFinished(() => document.removeEventListener('pay', cancel));
    element.shadowRoot!.querySelector('button')!.click();
    expect(result).toBe(false);
  });
});
