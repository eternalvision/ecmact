import { afterEach, describe, expect, it } from 'vitest';
import { create } from '@site/demos/gels';

afterEach(() => {
  document.body.replaceChildren();
});

const colours = {
  rose: '#ff5d73',
  sky: '#57c7ff',
  amber: '#ffd166',
  mint: '#8aff9c',
  none: '#9aa0b5',
};

const open = async () => {
  const demo = create() as HTMLElement;
  document.body.append(demo);
  await new Promise((resolve) => setTimeout(resolve, 0));
  const house = demo.shadowRoot!.querySelector('em-zone') as HTMLElement;
  const stage = house.shadowRoot!.querySelector('em-zone') as HTMLElement;
  const spot = stage.shadowRoot!.querySelector('em-zone') as HTMLElement;
  const zones = { house, stage, spot };
  const actor = (zone: HTMLElement) => zone.shadowRoot!.querySelector<HTMLElement>('.actor')!;
  const colour = (zone: HTMLElement) => actor(zone).style.getPropertyValue('--c');
  const button = (zone: HTMLElement) =>
    zone.shadowRoot!.querySelector<HTMLButtonElement>('.head button')!;
  return { zones, actor, colour, button };
};

describe('gels example', () => {
  it('nests three zones, each with an actor and a button for its gel', async () => {
    const { zones, actor, button } = await open();
    expect(Object.values(zones).map((zone) => actor(zone).textContent)).toEqual([
      'Usher',
      'Chorus',
      'Soloist',
    ]);
    expect(Object.values(zones).map((zone) => button(zone).textContent)).toEqual([
      'amber',
      'no gel',
      'sky',
    ]);
    expect(button(zones.stage).getAttribute('aria-label')).toBe('Change the stage gel, now no gel');
    button(zones.stage).click();
    expect(button(zones.stage).getAttribute('aria-label')).toBe('Change the stage gel, now rose');
  });

  it('gives every actor the colour of the nearest zone that has a gel', async () => {
    const { zones, colour } = await open();
    expect(colour(zones.house)).toBe(colours.amber);
    expect(colour(zones.stage)).toBe(colours.amber);
    expect(colour(zones.spot)).toBe(colours.sky);
    expect(zones.stage.style.getPropertyValue('--c')).toBe(colours.amber);
  });

  it('follows a gel that is put in, and falls back to the next zone when it is taken away, without rebuilding the actor', async () => {
    const { zones, actor, colour, button } = await open();
    const soloist = actor(zones.spot);
    button(zones.stage).click();
    expect(colour(zones.stage)).toBe(colours.rose);
    expect(colour(zones.spot)).toBe(colours.sky);
    button(zones.spot).click();
    expect(colour(zones.spot)).toBe(colours.amber);
    button(zones.spot).click();
    button(zones.spot).click();
    expect(button(zones.spot).textContent).toBe('no gel');
    expect(colour(zones.spot)).toBe(colours.rose);
    expect(actor(zones.spot)).toBe(soloist);
    button(zones.house).click();
    expect(colour(zones.house)).toBe(colours.mint);
    expect(colour(zones.spot)).toBe(colours.rose);
  });

  it('shows the default colour while no zone has a gel', async () => {
    const { zones, colour, button } = await open();
    button(zones.house).click();
    button(zones.house).click();
    expect(button(zones.house).textContent).toBe('no gel');
    button(zones.spot).click();
    button(zones.spot).click();
    button(zones.spot).click();
    expect(button(zones.spot).textContent).toBe('no gel');
    expect(Object.values(zones).map(colour)).toEqual([colours.none, colours.none, colours.none]);
  });
});
