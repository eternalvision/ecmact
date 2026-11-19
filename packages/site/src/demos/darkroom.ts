import { effect, em, signal, tags } from 'ecmact';

const { button, div, li, ol } = tags;

const css = `
  :host {
    display: block;
    color-scheme: dark;
    padding: 18px;
    background: radial-gradient(ellipse at 50% -20%, #5a0a05, #120000 70%);
    color: #ff4a3a;
    font: 11px/1.4 ui-monospace, Menlo, Consolas, monospace;
    letter-spacing: 0.1em;
    text-transform: uppercase;
  }
  .trays {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
  .tray {
    min-height: 92px;
    padding: 6px;
    border: 1px solid #ff4a3a;
    border-radius: 3px 3px 10px 10px;
    box-shadow: inset 0 -14px 20px rgba(255, 74, 58, 0.14);
    overflow-wrap: anywhere;
  }
  .acts {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
  }
  button {
    padding: 5px 10px;
    border: 1px solid #ff4a3a;
    border-radius: 0;
    background: none;
    color: #ff4a3a;
    font: inherit;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
  }
  button:hover {
    background: #ff4a3a;
    color: #120000;
  }
  button[aria-disabled='true'] {
    opacity: 0.45;
    cursor: default;
  }
  button[aria-disabled='true']:hover {
    background: none;
    color: #ff4a3a;
  }
  button:focus-visible {
    outline: 3px solid #ffb3aa;
    outline-offset: 2px;
  }
  .log {
    min-height: 92px;
  }
  ol {
    margin: 12px 0 0;
    padding: 0 0 0 22px;
    color: #ff8a7d;
    text-transform: none;
    letter-spacing: 0;
    overflow-wrap: anywhere;
  }
  @media (max-width: 480px) {
    :host {
      padding: 14px 12px;
    }
    .trays {
      gap: 4px;
    }
    .tray {
      padding: 4px;
    }
  }
`;

const printCss = `
  :host {
    display: block;
    margin-top: 6px;
  }
  .picture {
    height: 56px;
    border: 1px solid #ff4a3a;
    background:
      radial-gradient(circle at 30% 40%, #ff4a3a 0 16%, transparent 17%),
      linear-gradient(160deg, transparent 55%, #ff4a3a 56% 70%, transparent 71%),
      #3a0603;
    opacity: calc(0.15 + var(--d, 0) / 118);
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
