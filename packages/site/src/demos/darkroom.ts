import { effect, em, signal, tags } from 'ecmact';

const { button, div, li, ol } = tags;

const css = `
  :host {
    display: block;
    color-scheme: dark;
    padding: 20px;
    background: radial-gradient(120% 70% at 50% 0, #2a0403 0, #0a0000 62%);
    color: #ff3b2f;
    font-family: 'Helvetica Neue', 'Segoe UI', Roboto, 'Noto Sans', Arial, sans-serif;
    font-weight: 300;
  }
  .trays {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
  }
  .tray {
    min-height: 164px;
    padding: 14px 10px 12px;
    border-radius: 26px;
    background: linear-gradient(#140101, #2b0403);
    box-shadow:
      inset 0 10px 18px #000000,
      inset 0 -2px 0 rgba(255, 59, 47, 0.45),
      0 1px 0 rgba(255, 59, 47, 0.2);
    font-size: 17px;
    text-align: center;
    overflow-wrap: anywhere;
  }
  .acts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 18px;
  }
  button {
    min-height: 44px;
    padding: 0 20px;
    border: 0;
    border-radius: 999px;
    background: #2b0605;
    color: #ff6a5e;
    font: inherit;
    font-size: 15.5px;
    font-weight: 400;
    cursor: pointer;
  }
  .acts button:first-child {
    background: #ff3b2f;
    color: #0a0000;
    font-weight: 500;
  }
  button[aria-disabled='true'] {
    background: transparent;
    box-shadow: inset 0 0 0 2px #5c1a16;
    color: #c4665d;
    cursor: default;
  }
  .log ol {
    display: grid;
    gap: 6px;
    margin: 18px 0 0;
    padding: 0;
    list-style: none;
    font-size: 15.5px;
    overflow-wrap: anywhere;
  }
  .log li {
    display: flex;
    align-items: baseline;
    gap: 12px;
    color: #e0584c;
  }
  .log li::before {
    content: '';
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: currentColor;
  }
  .log li:last-child {
    color: #ff3b2f;
  }
  .log li:last-child::before {
    box-shadow: 0 0 12px 3px rgba(255, 59, 47, 0.7);
  }
  :focus-visible {
    outline: 3px solid #ff6a5e;
    outline-offset: 3px;
  }
  @media (max-width: 480px) {
    :host {
      padding: 16px 12px;
    }
    .trays {
      gap: 6px;
    }
    .tray {
      padding: 12px 6px 10px;
      font-size: 14px;
    }
  }
`;

const printCss = `
  :host {
    display: block;
    width: 84%;
    margin: 12px auto 0;
    padding: 5px 5px 14px;
    box-sizing: border-box;
    border-radius: 8px;
    background: #ffd9d4;
    box-shadow: 0 0 26px rgba(255, 59, 47, 0.55);
  }
  .picture {
    aspect-ratio: 5 / 4;
    border-radius: 4px;
    background:
      radial-gradient(circle at 68% 34%, #ffe3de 0 13%, transparent 14%),
      linear-gradient(168deg, transparent 0 56%, #7a0f08 57%),
      linear-gradient(192deg, transparent 0 66%, #3a0503 67%), linear-gradient(#ff8a7e, #d5281c);
    opacity: calc(0.15 + var(--d, 0) / 150);
  }
  @media (prefers-reduced-motion: no-preference) {
    .picture {
      transition: opacity 0.4s;
    }
  }
`;

const trayNames = ['Developer', 'Stop bath', 'Fixer'];

/**
 * A print that goes through the trays of a darkroom, and a log of what its hooks do. The print is a component:
 * its `mounted` starts a timer that develops it and returns the cleanup that stops it, an effect created in
 * `mounted` stops with the component, and `unmounted` runs after the cleanup. Moving the print to another tray is a
 * move of the node, which runs the cleanup, `unmounted` and `mounted` again. A throw in a hook reaches the `error`
 * prop of the print with its phase, and the hooks after it still run.
 *
 * @returns The example.
 */
export const create = () => {
  const density = signal(0);
  const present = signal(false);
  const lines = signal<string[]>([]);
  const trays: HTMLElement[] = [];
  let at = 0;
  let fumbling = false;

  /**
   * Writes a line of the log. It keeps the last five and does not read the log as a dependency, so it can be called from an effect.
   *
   * @param text - The line.
   */
  const say = (text: string) => {
    lines.value = [...lines.peek(), text].slice(-5);
  };

  const print = em.Print(
    {
      css: printCss,
      error: (error, { phase }) => say(`error in ${phase}: ${(error as Error).message}`),
      mounted: () => {
        present.value = true;
        say('mounted: timer started');
        const timer = setInterval(() => {
          density.value = Math.min(100, density.peek() + 10);
        }, 500);
        effect(() => {
          if (density.value === 100) say('effect: the print is fully developed');
        });
        return () => {
          clearInterval(timer);
          say('cleanup: timer stopped');
          if (fumbling) {
            fumbling = false;
            throw new Error('the tongs slipped');
          }
        };
      },
      unmounted: () => {
        present.value = false;
        say('unmounted');
      },
    },
    div({ class: 'picture', style: { '--d': () => density.value } }),
  );

  /**
   * Puts the print in the first tray, or moves it to the next one.
   */
  const move = () => {
    at = present.peek() ? (at + 1) % trayNames.length : 0;
    (trays[at] as HTMLElement).append(print);
  };

  /**
   * Takes the print out of the trays, after the tongs slip when `slip` is set.
   *
   * @param slip - Whether the tongs slip.
   */
  const takeOut = (slip: boolean) => {
    if (!present.peek()) return;
    fumbling = slip;
    print.remove();
  };

  return em.Darkroom(
    { css },
    div(
      { class: 'trays' },
      trayNames.map((name, index) =>
        div(
          {
            class: 'tray',
            ref: (element) => {
              trays[index] = element as HTMLElement;
            },
          },
          name,
          index === 0 && print,
        ),
      ),
    ),
    div(
      { class: 'acts' },
      button({ type: 'button', onclick: move }, () =>
        present.value ? 'Move to the next tray' : 'Put the print in',
      ),
      button(
        {
          type: 'button',
          'aria-disabled': () => String(!present.value),
          onclick: () => takeOut(false),
        },
        'Pull out',
      ),
      button(
        {
          type: 'button',
          'aria-disabled': () => String(!present.value),
          onclick: () => takeOut(true),
        },
        'Drop it',
      ),
    ),
    div(
      { class: 'log', 'aria-live': 'polite' },
      ol(() => lines.value.map((line) => li(line))),
    ),
  );
};
