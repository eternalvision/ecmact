import { computed, defineWidget, effect, signal, tags, untracked } from 'ecmact';
import { loadFeed, type Feed, type FeedError } from '@site/widgets/api';
import { moveIndex, readNumber, widgetCss } from '@site/widgets/kit';

const { button, div } = tags;

const css = `
  :host {
    display: block;
    max-width: 24rem;
    font-family: var(--w-font, ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace);
  }
  .plate {
    position: relative;
    box-sizing: border-box;
    padding: 18px 16px 6px;
    border-radius: var(--w-radius, 10px);
    background:
      radial-gradient(circle at 10px 10px, #9ca3af 0 2.5px, #e5e7eb 3px 4.5px, transparent 5px),
      radial-gradient(circle at calc(100% - 10px) 10px, #9ca3af 0 2.5px, #e5e7eb 3px 4.5px, transparent 5px),
      radial-gradient(150px 120px at 64px 74px, color-mix(in srgb, var(--l) 34%, transparent), transparent 70%),
      linear-gradient(var(--w-bg, #ffffff), color-mix(in srgb, var(--w-bg, #ffffff) 92%, #9ca3af) 45%, color-mix(in srgb, var(--w-bg, #ffffff) 86%, #9ca3af));
    box-shadow: inset 0 1px 0 #ffffff, inset 0 -2px 0 #d1d5db, 0 8px 20px rgba(17, 24, 39, 0.14);
    color: var(--w-fg, #111827);
  }
  .plate[data-lamp='ok'] { --l: #19c37d; --hi: #9bffcb; --lo: #0a8a55; }
  .plate[data-lamp='wait'] { --l: #ffb020; --hi: #ffe2a3; --lo: #b36b00; }
  .plate[data-lamp='fail'] { --l: #ff4d4f; --hi: #ffb3b4; --lo: #b01618; }
  .plate[data-lamp='odd'] { --l: #c026d3; --hi: #f0abfc; --lo: #86198f; }
  .plate[data-lamp='idle'] { --l: #9ca3af; --hi: #e5e7eb; --lo: #6b7280; }
  .body { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: 18px; padding: 8px 6px 14px; }
  .lamp {
    width: 92px; height: 92px; border-radius: 50%;
    background: radial-gradient(circle at 34% 28%, #ffffff 0 5%, rgba(255, 255, 255, 0) 22%), radial-gradient(circle at 50% 42%, var(--hi), var(--l) 48%, var(--lo));
    box-shadow: 0 0 0 6px #d1d5db, 0 0 0 8px #ffffff, 0 2px 0 9px #b6bbc4, 0 14px 30px color-mix(in srgb, var(--l) 70%, transparent), inset 0 -10px 14px rgba(0, 0, 0, 0.22);
  }
  .state { padding-inline-end: 44px; font-size: 17px; font-weight: 700; line-height: 1.2; }
  .meta { margin-top: 6px; font-size: 12.5px; line-height: 1.5; color: color-mix(in srgb, var(--w-fg, #111827) 75%, var(--w-bg, #ffffff)); overflow-wrap: anywhere; }
  .tabs { display: flex; align-items: flex-end; gap: 2px; border-top: 2px solid #d1d5db; }
  .tabs button {
    flex: 1; min-width: 0; min-height: 44px; margin-top: -2px; padding: 0 2px; border: 0; border-top: 4px solid transparent;
    background: none; color: color-mix(in srgb, var(--w-fg, #111827) 75%, var(--w-bg, #ffffff)); font: inherit; font-size: 12.5px; font-weight: 600; cursor: pointer;
  }
  .tabs button[aria-selected='true'] { border-top-color: var(--l); color: var(--w-fg, #111827); font-weight: 700; }
  .refresh {
    position: absolute; top: 14px; inset-inline-end: 26px; width: 40px; height: 40px; padding: 0; border: 0; border-radius: 50%;
    background: linear-gradient(color-mix(in srgb, var(--w-fg, #111827) 4%, var(--w-bg, #ffffff)), color-mix(in srgb, var(--w-fg, #111827) 14%, var(--w-bg, #ffffff))); box-shadow: 0 2px 5px rgba(17, 24, 39, 0.25), inset 0 1px 0 color-mix(in srgb, var(--w-fg, #111827) 6%, var(--w-bg, #ffffff));
    color: var(--w-fg, #111827); font: inherit; font-size: 19px; cursor: pointer;
  }
  button:focus-visible { outline: 3px solid var(--w-fg, #111827); outline-offset: 2px; }
  @media (prefers-reduced-motion: no-preference) {
    .plate[data-lamp='wait'] .lamp { animation: breathe 2.4s ease-in-out infinite; }
    @keyframes breathe { 50% { filter: brightness(0.8) saturate(0.8); } }
  }
`;

/** One of the sample feeds that the tabs offer. */
interface Sample {
  /** The name on the tab. */
  name: string;
  /** The address of the feed. */
  url: string;
}

/** What the lamp tells now. */
interface Reading {
  /** The lamp: `idle`, `wait`, `ok`, `fail` or `odd`. */
  lamp: 'idle' | 'wait' | 'ok' | 'fail' | 'odd';
  /** The state, in a sentence. */
  state: string;
  /** The line under it. */
  note: string;
}

const lampNames = { idle: 'grey', wait: 'amber', ok: 'green', fail: 'red', odd: 'magenta' };

/**
 * Reads the `feeds` attribute: `ok=data/kiln.json, missing=data/none.json`. An entry with no `=` or no address is
 * left out.
 *
 * @param value - The attribute value.
 * @returns The samples, in order.
 */
export const parseFeeds = (value: string | null | undefined): Sample[] =>
  (value ?? '').split(',').flatMap((entry) => {
    const cut = entry.indexOf('=');
    const name = entry.slice(0, cut).trim();
    const url = entry.slice(cut + 1).trim();
    return cut > 0 && name && url ? [{ name, url }] : [];
  });

/**
 * Registers `<feed-lamp>`: a lamp that shows the state of a JSON feed, `{ "title": "Kiln is done", "detail": "..." }`.
 * It waits with an amber lamp, says when an answer is slow, shows a missing file, a timeout, a failing server and a
 * body that is not a feed each in its own words, keeps the last good reading, asks again after a failure as many
 * times as `retries` says, and cancels its request when `src` changes or the widget leaves the page. A `#lag=1500`
 * at the end of `src` makes it wait that long before asking, so a static file can show a slow answer.
 * Attributes: `src` (the address of the feed, which decides what is shown), `feeds` (sample feeds as tabs, `ok=a.json,
 * missing=b.json`; the first is shown when `src` is empty, and a change of `src` takes the tab off), `retries` (how
 * many more attempts a network failure, a timeout or a 5xx status gets, default `2`, at most `5`), `slow` (milliseconds
 * until the lamp says that the answer is slow, default `1500`), `timeout` (milliseconds until an attempt is given
 * up, default `8000`). A missing or malformed number gives its default.
 * Event: `loaded` with `{ src, title }`, when a feed has been read.
 * Custom properties: `--w-bg`, `--w-fg`, `--w-font`, `--w-radius`.
 *
 * @returns The registered element class.
 */
export const defineFeedLamp = () =>
  defineWidget(
    'feed-lamp',
    ({ props, emit }) => {
      const chosen = signal<number | null>(null);
      const reading = signal<Reading>({
        lamp: 'idle',
        state: 'No feed',
        note: 'Set the src attribute.',
      });
      const refresh = signal(0);
      let good: Feed | undefined;
      /**
       * Lists the sample feeds.
       *
       * @returns The samples.
       */
      const samples = () => parseFeeds(props.feeds);
      /**
       * Finds the tab that is shown: the one chosen, or the first when there is no `src`, or none.
       *
       * @returns The index of the sample, or -1.
       */
      const selected = () => {
        return chosen.value ?? (props.src.trim() === '' && samples().length > 0 ? 0 : -1);
      };
      /**
       * Finds the address to read: the tab that is shown, or `src`.
       *
       * @returns The address, or an empty text.
       */
      const source = () => {
        const index = selected();
        return index >= 0 ? (samples()[index] as Sample).url : props.src.trim();
      };
      /**
       * Reads how many more attempts a failure gets: a whole number from 0 to 5.
       *
       * @returns The number of retries.
       */
      const retries = () => Math.min(5, Math.floor(readNumber(props.retries, 2)));
      effect(() => {
        void props.src;
        void props.feeds;
        untracked(() => {
          chosen.value = null;
        });
      });

      effect(() => {
        const address = source();
        void refresh.value;
        const wait = readNumber(props.slow, 1500);
        const limit = readNumber(props.timeout, 8000, 1);
        const tries = retries();
        return untracked(() => {
          if (address === '') {
            reading.value = { lamp: 'idle', state: 'No feed', note: 'Set the src attribute.' };
            return undefined;
          }
          const controller = new AbortController();
          let attempt = 1;
          let slow = false;
          /**
           * Writes the line that says the answer is awaited.
           */
          const waiting = () => {
            reading.value = {
              lamp: 'wait',
              state: slow ? 'Slow answer' : 'Waiting',
              note: `${address.split('#')[0]} · attempt ${attempt} of ${tries + 1}`,
            };
          };
          waiting();
          const timer = setTimeout(() => {
            slow = true;
            waiting();
          }, wait);
          loadFeed(address, {
            retries: tries,
            timeout: limit,
            signal: controller.signal,
            /**
             * Notes the new attempt after a failure.
             *
             * @param next - The number of the attempt.
             */
            onAttempt: (next) => {
              attempt = next;
              waiting();
            },
          })
            .then((feed) => {
              good = feed;
              reading.value = {
                lamp: 'ok',
                state: feed.title,
                note: `${feed.detail ? `${feed.detail} · ` : ''}${feed.status} · attempt ${attempt} of ${tries + 1}`,
              };
              emit('loaded', { src: address.split('#')[0], title: feed.title });
            })
            .catch((error: unknown) => {
              if (controller.signal.aborted) return;
              const failure = error as FeedError;
              const kind = failure.failure;
              const states = {
                missing: ['fail', 'Not found'],
                timeout: ['fail', 'No answer in time'],
                offline: ['fail', 'No connection'],
                server: ['fail', `The server answered ${failure.status}`],
                malformed: ['odd', 'Not a feed'],
              } as const;
              const [lamp, state] = states[kind];
              reading.value = {
                lamp,
                state,
                note: `${address.split('#')[0]}${failure.status ? ` · ${failure.status}` : ''}${good ? ` · last good: ${good.title}` : ''}`,
              };
            })
            .finally(() => clearTimeout(timer));
          return () => {
            controller.abort();
            clearTimeout(timer);
          };
        });
      });
      const lampOf = computed(() => reading.value.lamp);
      const lampLabel = computed(() => `Lamp: ${lampNames[reading.value.lamp]}`);
      const stateText = computed(() => reading.value.state);
      const noteText = computed(() => reading.value.note);
      /** Reads the feed again. */
      const reload = () => {
        refresh.value++;
      };
      /**
       * Moves to another sample, from a tab.
       *
       * @param index - The sample.
       */
      const pick = (index: number) => {
        chosen.value = index;
      };
      /**
       * Makes the handler that shows a sample feed.
       *
       * @param index - The sample.
       * @returns The handler.
       */
      const chooser = (index: number) => () => {
        pick(index);
      };
      /**
       * Moves the tabs with the arrow keys, Home and End, and gives the new tab the focus.
       *
       * @param event - The key press.
       */
      const steer = (event: KeyboardEvent) => {
        const next = moveIndex(event.key, selected(), samples().length);
        if (next === undefined) return;
        event.preventDefault();
        pick(next);
        (event.currentTarget as HTMLElement)
          .querySelectorAll<HTMLElement>('[role="tab"]')
          [next]?.focus();
      };
      /**
       * Makes the tab of a sample feed.
       *
       * @param sample - The sample.
       * @param index - Its place.
       * @returns The tab.
       */
      const tab = (sample: Sample, index: number) =>
        button(
          {
            type: 'button',
            role: 'tab',
            'aria-selected': computed(() => String(selected() === index)),
            'aria-controls': 'panel',
            tabindex: computed(() => (selected() === index ? 0 : -1)),
            onclick: chooser(index),
          },
          sample.name,
        );

      return div(
        { class: 'plate', 'data-lamp': lampOf },
        button({ type: 'button', class: 'refresh', 'aria-label': 'Refresh', onclick: reload }, '↻'),
        div(
          { class: 'body', id: 'panel', role: 'tabpanel' },
          div({ class: 'lamp', role: 'img', 'aria-label': lampLabel }),
          div(div({ class: 'state', role: 'status' }, stateText), div({ class: 'meta' }, noteText)),
        ),
        () =>
          samples().length > 0 &&
          div(
            { class: 'tabs', role: 'tablist', 'aria-label': 'Feed', onkeydown: steer },
            samples().map(tab),
          ),
      );
    },
    {
      attributes: { src: '', feeds: '', retries: '2', slow: '1500', timeout: '8000' },
      css: widgetCss(css),
    },
  );
