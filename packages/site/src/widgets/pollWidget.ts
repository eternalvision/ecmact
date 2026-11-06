import { combine, computed, createStore, defineWidget, effect, persist, type Store } from 'ecmact';
import { part, readNumber, sheet, tag } from '@site/widgets/kit';

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

/** The state of a poll: the votes of every option and the option that this visitor chose. */
interface PollState {
  /** The votes of every option, by the text of the option. */
  votes: Record<string, number>;
  /** The option this visitor voted for, or `null`. */
  chosen: string | null;
  /**
   * Adds this visitor's vote. A second vote replaces the first.
   *
   * @param option - The option.
   */
  vote: (option: string) => void;
  /** Takes this visitor's vote back. */
  reset: () => void;
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
 * @param persisted - The stored state, of unknown shape.
 * @param current - The starting state.
 * @returns The state to use.
 */
const readStored = (persisted: unknown, current: PollState): PollState => {
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
 * Creates the store of a poll. The votes are kept in `localStorage` under the id of the poll, so that they survive
 * a reload. This makes a store of its own; widgets get the one shared by their poll id from `pollStore`.
 *
 * @param poll - The id of the poll.
 * @param seed - The votes that the poll starts with, by option.
 * @returns The store.
 */
export const createPollStore = (poll: string, seed: Record<string, number>): Store<PollState> =>
  createStore<PollState>(
    persist(
      combine({ votes: { ...seed }, chosen: null as string | null }, (set) => ({
        /**
         * Adds this visitor's vote; an earlier vote is withdrawn.
         *
         * @param option - The option.
         */
        vote: (option: string) => {
          set((state) => {
            const withdrawn = state.chosen
              ? changeVotes(state.votes, state.chosen, -1)
              : state.votes;
            return { votes: changeVotes(withdrawn, option, 1), chosen: option };
          });
        },
        /** Takes this visitor's vote back. */
        reset: () => {
          set((state) => ({
            votes: state.chosen ? changeVotes(state.votes, state.chosen, -1) : state.votes,
            chosen: null,
          }));
        },
      })),
      {
        name: `ecmact-poll:${poll}`,
        /**
         * Picks what to persist: the votes and the choice.
         *
         * @param state - The state.
         * @returns The part to store.
         */
        partialize: (state) => ({ votes: state.votes, chosen: state.chosen }),
        merge: readStored as (persisted: unknown, current: PollState) => PollState,
      },
    ),
  ) as Store<PollState>;

const stores = new Map<string, Store<PollState>>();

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
      const options = computed(() => [...new Set(parseList(props.options.value ?? 'Yes, No'))]);
      const seeds = parseList(props.seed.value).map((item) => readNumber(item, 0));
      const written = parseList(props.options.value ?? 'Yes, No');
      const store = pollStore(
        props.poll.value ?? `${props.question.value ?? ''}|${props.options.value ?? ''}`,
        Object.fromEntries(
          written
            .filter((option, index) => written.indexOf(option) === index)
            .map((option) => [option, seeds[written.indexOf(option)] ?? 0]),
        ),
      );
      const votes = store.select((state) => state.votes);
      const chosen = store.select((state) => state.chosen);
      /**
       * Reads the votes of an option; an option added after the poll started has none.
       *
       * @param option - The option.
       * @returns The votes.
       */
      const count = (option: string) => votesFor(votes.value, option);
      const total = computed(() => options.value.reduce((sum, option) => sum + count(option), 0));

      const rows = new Map<string, Node>();
      /**
       * Finds the row of an option, building it the first time, so that changing the options reuses the rows of the
       * options that stay.
       *
       * @param option - The option.
       * @returns The row.
       */
      const row = (option: string) => {
        const known = rows.get(option);
        if (known) return known;
        const share = computed(() => Math.round((count(option) / Math.max(1, total.value)) * 100));
        const built = tag('li', {
          children: [
            tag('button', {
              class: 'option',
              type: 'button',
              'aria-pressed': computed(() => String(chosen.value === option)),
              /** Votes for the option and announces it. */
              onclick: () => {
                store.getState().vote(option);
                emit('vote', { option });
              },
              children: [
                tag('span', {
                  class: 'bar',
                  style: { width: computed(() => (chosen.value ? `${share.value}%` : '0%')) },
                }),
                part(
                  'span',
                  'row',
                  tag('span', {
                    class: computed(() => (chosen.value === option ? 'mine' : '')),
                    content: option,
                  }),
                  tag('span', {
                    class: 'share',
                    content: computed(() => (chosen.value ? `${share.value}%` : '')),
                  }),
                ),
              ],
            }),
          ],
        });
        rows.set(option, built);
        return built;
      };

      const list = tag('ul');
      const root = tag('div', {
        class: 'poll',
        /**
         * Builds the rows of the list, and builds them again when the options change.
         *
         * @returns The cleanup that stops following the options.
         */
        mounted: () => effect(() => list.setState({ children: options.value.map(row) })),
        children: [
          tag('h3', { content: computed(() => props.question.value ?? 'What do you think?') }),
          list,
          part(
            'div',
            'foot',
            tag('span', {
              class: 'total',
              content: computed(() => `${total.value} ${total.value === 1 ? 'vote' : 'votes'}`),
            }),
            tag('button', {
              type: 'button',
              content: 'Take my vote back',
              hidden: computed(() => !chosen.value),
              /** Takes this visitor's vote back. */
              onclick: () => {
                store.getState().reset();
              },
            }),
          ),
        ],
      });
      return sheet(host, css, root);
    },
    { attributes: ['question', 'options', 'poll', 'seed'] },
  );
