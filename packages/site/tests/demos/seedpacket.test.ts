import { afterEach, describe, expect, it } from 'vitest';
import { create } from '@site/demos/seedpacket';

afterEach(() => {
  document.body.replaceChildren();
});

const open = async () => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  await new Promise((resolve) => setTimeout(resolve, 0));
  const root = demo.shadowRoot!;
  const packet = root.querySelector('seed-packet') as HTMLElement;
  const inner = () => packet.shadowRoot!;
  const field = (label: string) =>
    [...root.querySelectorAll('label')]
      .find((item) => item.textContent?.startsWith(label))!
      .querySelector<HTMLInputElement | HTMLSelectElement>('input, select')!;
  const type = (control: HTMLInputElement | HTMLSelectElement, value: string) => {
    control.value = value;
    control.dispatchEvent(new Event('input', { bubbles: true }));
    control.dispatchEvent(new Event('change', { bubbles: true }));
  };
  const tear = () => inner().querySelector<HTMLButtonElement>('button')!;
  const status = () => inner().querySelector('.status')!.textContent;
  const log = () => root.querySelector('.event')!.textContent;
  const attributes = () => root.querySelector('.tag')!.textContent;
  return { demo, root, packet, inner, field, type, tear, status, log, attributes };
};

describe('seedpacket example', () => {
  it('shows a packet that a page configures with attributes, and the tag that would do it in HTML', async () => {
    const { packet, inner, attributes } = await open();
    expect(packet.localName).toBe('seed-packet');
    expect(inner().querySelector('.nm')?.textContent).toBe('Borage');
    expect(inner().querySelector('.sow')?.textContent).toBe('Sow in April · 1 cm deep');
    expect(inner().querySelector('.co')?.textContent).toBe('Heirloom seeds');
    expect(attributes()).toBe('<seed-packet plant="Borage" sow="4" depth="1">');
  });

  it('follows its attributes when the page changes them, whatever type they have', async () => {
    const { packet, inner } = await open();
    packet.setAttribute('plant', 'Nasturtium');
    packet.setAttribute('sow', '9');
    packet.setAttribute('depth', '3');
    packet.setAttribute('organic', '');
    expect(inner().querySelector('.nm')?.textContent).toBe('Nasturtium');
    expect(inner().querySelector('.sow')?.textContent).toBe('Sow in September · 3 cm deep');
    expect(inner().querySelector('.co')?.textContent).toBe('Organic heirloom seeds');
    packet.setAttribute('organic', 'false');
    expect(inner().querySelector('.co')?.textContent).toBe('Heirloom seeds');
    packet.setAttribute('sow', '40');
    expect(inner().querySelector('.sow')?.textContent).toBe('Sow in December · 3 cm deep');
    packet.setAttribute('sow', '-2');
    expect(inner().querySelector('.sow')?.textContent).toBe('Sow in January · 3 cm deep');
  });

  it('writes the attributes from the controls beside the packet', async () => {
    const { packet, field, type, attributes } = await open();
    type(field('Plant'), 'Calendula');
    type(field('Sowing month'), '6');
    type(field('Depth'), '2');
    field('Organic').click();
    expect(packet.getAttribute('plant')).toBe('Calendula');
    expect(packet.getAttribute('sow')).toBe('6');
    expect(packet.getAttribute('depth')).toBe('2');
    expect(packet.hasAttribute('organic')).toBe(true);
    expect(attributes()).toBe('<seed-packet plant="Calendula" sow="6" depth="2" organic>');
    field('Organic').click();
    expect(packet.hasAttribute('organic')).toBe(false);
  });

  it('dresses the packet with a custom property that the page sets', async () => {
    const { packet, root } = await open();
    expect(packet.style.getPropertyValue('--packet-ink')).toBe('#2f5d3a');
    root.querySelector<HTMLButtonElement>('[data-ink="Rust"]')!.click();
    expect(packet.style.getPropertyValue('--packet-ink')).toBe('#9a3b1d');
    expect(root.querySelector('[data-ink="Rust"]')?.getAttribute('aria-pressed')).toBe('true');
    expect(root.querySelector('[data-ink="Green"]')?.getAttribute('aria-pressed')).toBe('false');
  });

  it('fires sow when the packet is torn open, and the page accepts it in season', async () => {
    const { demo, tear, status, log } = await open();
    const heard: CustomEvent[] = [];
    demo.shadowRoot!.addEventListener('sow', (event) => heard.push(event as CustomEvent));
    tear().click();
    expect(heard).toHaveLength(1);
    expect(heard[0]?.detail).toEqual({ plant: 'Borage', month: 4 });
    expect(heard[0]?.bubbles && heard[0]?.composed && heard[0]?.cancelable).toBe(true);
    expect(status()).toBe('Sown. The page took the event.');
    expect(log()).toBe('sow: { plant: "Borage", month: 4 } - accepted');
  });

  it('reads false from emit when the page cancels the event out of season', async () => {
    const { field, type, tear, status, log, packet } = await open();
    type(field('Today is'), '7');
    tear().click();
    expect(status()).toBe('Not now. The page cancelled the event: emit returned false.');
    expect(log()).toBe('sow: { plant: "Borage", month: 4 } - cancelled by the page');
    packet.setAttribute('sow', '7');
    tear().click();
    expect(status()).toBe('Sown. The page took the event.');
  });

  it('can be created again, because the element is defined once', async () => {
    await open();
    expect(() => create()).not.toThrow();
  });
});
