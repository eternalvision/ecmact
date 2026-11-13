import { createStore, defineWidget, each, tags } from 'ecmact';
import { readNumber, widgetCss } from '@site/widgets/kit';

const { button, div, h3, li, span, ul } = tags;

const css = `
  :host {
    display: block;
    max-width: 24rem;
    font-family: var(--w-font, 'Trebuchet MS', 'Segoe UI', sans-serif);
  }
  .poll {
    padding: 1.3rem;
    border-radius: var(--w-radius, 18px);
    background: var(--w-bg, #fff);
    color: var(--w-fg, #1d1b3a);
    border: 2px solid var(--w-border, #1d1b3a);
    box-shadow: 6px 6px 0 var(--w-accent, #ff4f81);
  }
  h3 { margin: 0 0 1rem; font-size: 1.15rem; line-height: 1.3; }
  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.6rem; }
  button.option {
    position: relative; overflow: hidden; width: 100%; padding: 0.7rem 0.9rem; text-align: start;
    border: 2px solid var(--w-border, #1d1b3a); border-radius: calc(var(--w-radius, 18px) * 0.6);
    background: transparent; color: inherit; font: inherit; font-weight: 600; cursor: pointer;
  }
  button.option:hover { background: color-mix(in srgb, var(--w-accent, #ff4f81) 14%, transparent); }
  .bar { position: absolute; inset-block: 0; inset-inline-start: 0; z-index: 0; background: color-mix(in srgb, var(--w-accent, #ff4f81) 35%, transparent); transition: width 0.5s; }
  .row { position: relative; z-index: 1; display: flex; justify-content: space-between; gap: 1rem; }
  .row .mine::after { content: ' ✓'; }
  .foot { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; font-size: 0.82rem; color: var(--w-muted, #6b6890); }
  .foot button { border: 0; padding: 0; background: none; color: var(--w-accent, #ff4f81); font: inherit; font-weight: 700; cursor: pointer; text-decoration: underline; }
`;

/** The values of a poll. */
interface PollValues {
  /** The votes of every option, by the text of the option. */
  votes: Record<string, number>;
  /** The option this visitor voted for, or `null`. */
  chosen: string | null;
}

/**
 * Splits a list written in an attribute, `Yes, No, Maybe`, into its items.
 *
 * @param value - The attribute value.
 * @returns The items without blanks.
 */
export const parseList = (value: string | null | undefined) =>
  (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

/**
 * Reads the votes of an option from a record that is keyed by user-written text. Only own properties count, so an
 * option named `constructor` or `toString` does not read the function it would inherit.
 *
 * @param votes - The votes by option.
 * @param option - The option.
 * @returns The votes, 0 for an option that has none.
 */
export const votesFor = (votes: Record<string, number>, option: string) =>
  Object.hasOwn(votes, option) ? (votes[option] as number) : 0;

/**
 * Returns the votes with the count of one option changed. The record is rebuilt with `Object.fromEntries`, which
 * defines own properties, so an option named `__proto__` is stored like any other.
 *
 * @param votes - The votes by option.
 * @param option - The option to change.
 * @param change - What to add to its count; the count never goes below zero.
 * @returns A new record.
 */
export const changeVotes = (votes: Record<string, number>, option: string, change: number) =>
  Object.fromEntries([
    ...Object.entries(votes).filter(([name]) => name !== option),
    [option, Math.max(0, votesFor(votes, option) + change)],
  ]) as Record<string, number>;

/**
 * Takes what the storage returned and keeps only what a poll can use: a record of finite, non-negative counts and
 * the text of a choice. Anything else leaves the starting state, so a corrupted or hand-edited value cannot break
 * the widget.
 *
 * @template T - The state of the store: the values of the poll and its actions.
 * @param persisted - The stored state, of unknown shape.
 * @param current - The starting state.
 * @returns The state to use.
 */
const readStored = <T extends PollValues>(persisted: unknown, current: T): T => {
  const stored = typeof persisted === 'object' && persisted !== null ? persisted : {};
  const { votes, chosen } = stored as { votes?: unknown; chosen?: unknown };
  const record = typeof votes === 'object' && votes !== null && !Array.isArray(votes);
  return {
    ...current,
    votes: record
      ? (Object.fromEntries(
          Object.entries(votes).filter(
            ([, count]) => typeof count === 'number' && Number.isFinite(count) && count >= 0,
          ),
        ) as Record<string, number>)
      : current.votes,
    chosen: typeof chosen === 'string' ? chosen : null,
  };
};

/**
 * Creates the store of a poll: the votes of every option, the option this visitor chose, and the actions `vote`
 * and `reset`. The votes are kept in `localStorage` under the id of the poll, so that they survive a reload. This
 * makes a store of its own; widgets get the one shared by their poll id from `pollStore`.
 *
 * @param poll - The id of the poll.
 * @param seed - The votes that the poll starts with, by option.
 * @returns The store.
 */
export const createPollStore = (poll: string, seed: Record<string, number>) =>
  createStore(
    { votes: { ...seed }, chosen: null } as PollValues,
    (set) => ({
      /**
       * Adds this visitor's vote; an earlier vote is withdrawn.
       *
       * @param option - The option.
       */
      vote: (option: string) => {
        set(({ votes, chosen }) => ({
          votes: changeVotes(chosen ? changeVotes(votes, chosen, -1) : votes, option, 1),
          chosen: option,
        }));
      },
      /** Takes this visitor's vote back. */
      reset: () => {
        set(({ votes, chosen }) => ({
          votes: chosen ? changeVotes(votes, chosen, -1) : votes,
          chosen: null,
        }));
      },
    }),
    {
      persist: {
        name: `ecmact-poll:${poll}`,
        /**
         * Picks what to persist: the votes and the choice.
         *
         * @param state - The state.
         * @returns The part to store.
         */
        partialize: ({ votes, chosen }) => ({ votes, chosen }),
        merge: readStored,
      },
    },
  );

/** The store of a poll. */
export type PollStore = ReturnType<typeof createPollStore>;

const stores = new Map<string, PollStore>();

/**
 * Finds the store of a poll, creating it the first time. Every copy of the same poll on the page gets the same
 * store, so a vote in one copy shows in the others at once; the starting votes of the first copy count.
 *
 * @param poll - The id of the poll.
 * @param seed - The votes that the poll starts with, by option.
 * @returns The shared store.
 */
export const pollStore = (poll: string, seed: Record<string, number>) => {
  let store = stores.get(poll);
  if (!store) {
    store = createPollStore(poll, seed);
    stores.set(poll, store);
  }
  return store;
};

/**
 * Registers `<poll-widget>`: a one-question poll whose votes are kept in the browser.
 * Attributes: `question`, `options` (comma separated), `poll` (the id, read once; copies with the same id share
 * their votes; without it the id is made from the question and the options), `seed` (comma separated starting
 * votes, a malformed one counts as 0).
 * Event: `vote` with `{ option }`.
 * Custom properties: `--w-accent`, `--w-bg`, `--w-fg`, `--w-muted`, `--w-border`, `--w-radius`, `--w-font`.
 *
 * @returns The registered element class.
 */
export const definePollWidget = () =>
  defineWidget(
    'poll-widget',
    ({ host, props, emit }) => {
      const written = parseList(props.options);
      const seeds = parseList(props.seed).map((item) => readNumber(item, 0));
      const store = pollStore(
        host.getAttribute('poll') ??
          `${host.getAttribute('question') ?? ''}|${host.getAttribute('options') ?? ''}`,
        Object.fromEntries(
          written
            .filter((option, index) => written.indexOf(option) === index)
            .map((option) => [option, seeds[written.indexOf(option)] ?? 0]),
        ),
      );
      /**
       * Reads the options to show, each once.
       *
       * @returns The options.
       */
      const options = () => [...new Set(parseList(props.options))];
      /**
       * Counts the votes of the options that are shown.
       *
       * @returns The number of votes.
       */
      const total = () => options().reduce((sum, option) => sum + votesFor(store.votes, option), 0);
      /**
       * Builds the row of an option: a button that votes for it and, once the visitor has voted, shows its share.
       *
       * @param option - The option.
       * @returns The row.
       */
      const row = (option: string) => {
        /**
         * Writes the share of the option, once the visitor has voted; an option added after the poll started has
         * no votes.
         *
         * @returns The percentage, or `undefined` before the vote.
         */
        const share = () =>
          store.chosen
            ? `${Math.round((votesFor(store.votes, option) / Math.max(1, total())) * 100)}%`
            : undefined;
        return li(
          button(
            {
              class: 'option',
              type: 'button',
              /**
               * Tells assistive technology whether this is the visitor's choice.
               *
               * @returns `true` or `false`, as text.
               */
              'aria-pressed': () => String(store.chosen === option),
              /** Votes for the option and announces it. */
              onclick: () => {
                store.vote(option);
                emit('vote', { option });
              },
            },
            span({
              class: 'bar',
              style: {
                /**
                 * Makes the bar as wide as the share.
                 *
                 * @returns The width.
                 */
                width: () => share() ?? '0%',
              },
            }),
            span(
              { class: 'row' },
              span(
                {
                  class: {
                    /**
                     * Marks the visitor's choice.
                     *
                     * @returns Whether this option is the choice.
                     */
                    mine: () => store.chosen === option,
                  },
                },
                option,
              ),
              span({ class: 'share' }, share),
            ),
          ),
        );
      };

      return div(
        { class: 'poll' },
        h3(() => props.question),
        ul(each(options, row)),
        div(
          { class: 'foot' },
          span({ class: 'total' }, () => `${total()} ${total() === 1 ? 'vote' : 'votes'}`),
          button(
            {
              type: 'button',
              /**
               * Hides the link until there is a vote to take back.
               *
               * @returns `true` before the visitor has voted.
               */
              hidden: () => !store.chosen,
              onclick: store.reset,
            },
            'Take my vote back',
          ),
        ),
      );
    },
    {
      attributes: { question: 'What do you think?', options: 'Yes, No', poll: '', seed: '' },
      css: widgetCss(css),
    },
  );
