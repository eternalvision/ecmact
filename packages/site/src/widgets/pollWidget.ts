import { combine, computed, createStore, defineWidget, effect, persist, type Store } from 'ecmact';
import { tag } from '@site/lib/component';
import { part, sheet } from '@site/widgets/kit';

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
    position: relative; overflow: hidden; width: 100%; padding: 0.7rem 0.9rem; text-align: left;
    border: 2px solid var(--w-border, #1d1b3a); border-radius: calc(var(--w-radius, 18px) * 0.6);
    background: transparent; color: inherit; font: inherit; font-weight: 600; cursor: pointer;
  }
  button.option:hover { background: color-mix(in srgb, var(--w-accent, #ff4f81) 14%, transparent); }
  .bar { position: absolute; inset: 0 auto 0 0; z-index: 0; background: color-mix(in srgb, var(--w-accent, #ff4f81) 35%, transparent); transition: width 0.5s; }
  .row { position: relative; z-index: 1; display: flex; justify-content: space-between; gap: 1rem; }
  .row .mine::after { content: ' ✓'; }
  .foot { display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; font-size: 0.82rem; color: var(--w-muted, #6b6890); }
  .foot button { border: 0; padding: 0; background: none; color: var(--w-accent, #ff4f81); font: inherit; font-weight: 700; cursor: pointer; text-decoration: underline; }
`;

/** The state of a poll: the votes of every option and the option that this visitor chose. */
interface PollState {
  /** The votes of every option. */
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
 * Creates the store of a poll. The votes are kept in `localStorage` under the id of the poll, so that they survive
 * a reload and are shared by every copy of the same poll on the page.
 *
 * @param poll - The id of the poll.
 * @param seed - The votes that the poll starts with, by option.
 * @returns The store.
 */
export const createPollStore = (poll: string, seed: Record<string, number>): Store<PollState> =>
  createStore<PollState>(
    persist(
      combine(
        { votes: { ...seed } as Record<string, number>, chosen: null as string | null },
        (set) => ({
          vote: (option: string) => {
            set((state) => {
              const votes = { ...state.votes };
              if (state.chosen) votes[state.chosen] = Math.max(0, (votes[state.chosen] ?? 0) - 1);
              votes[option] = (votes[option] ?? 0) + 1;
              return { votes, chosen: option };
            });
          },
          reset: () => {
            set((state) => {
              const votes = { ...state.votes };
              if (state.chosen) votes[state.chosen] = Math.max(0, (votes[state.chosen] ?? 0) - 1);
              return { votes, chosen: null };
            });
          },
        }),
      ),
      {
        name: `ecmact-poll:${poll}`,
        /**
         * Picks what to persist: the votes and the choice.
         *
         * @param state - The state.
         * @returns The part to store.
         */
        partialize: (state) => ({ votes: state.votes, chosen: state.chosen }),
      },
    ),
  ) as Store<PollState>;

/**
 * Registers `<poll-widget>`: a one-question poll whose votes are kept in the browser.
 * Attributes: `question`, `options` (comma separated), `poll` (the id, read once), `seed` (comma separated starting votes).
 * Event: `vote` with `{ option }`.
 * Custom properties: `--w-accent`, `--w-bg`, `--w-fg`, `--w-muted`, `--w-border`, `--w-radius`, `--w-font`.
 *
 * @returns The registered element class.
 */
export const definePollWidget = () =>
  defineWidget(
    'poll-widget',
    ({ props, emit }) => {
      const options = computed(() => parseList(props.options.value ?? 'Yes, No'));
      const seeds = parseList(props.seed.value).map(Number);
      const store = createPollStore(
        props.poll.value ?? 'default',
        Object.fromEntries(options.value.map((option, index) => [option, seeds[index] ?? 0])),
      );
      const votes = store.select((state) => state.votes);
      const chosen = store.select((state) => state.chosen);
      /**
       * Reads the votes of an option; an option added after the poll started has none.
       *
       * @param option - The option.
       * @returns The votes.
       */
      const count = (option: string) => votes.value[option] ?? 0;
      const total = computed(() => options.value.reduce((sum, option) => sum + count(option), 0));

      const row = (option: string) => {
        const share = computed(() => Math.round((count(option) / Math.max(1, total.value)) * 100));
        return tag('li', {
          children: [
            tag('button', {
              class: 'option',
              type: 'button',
              'aria-pressed': computed(() => String(chosen.value === option)),
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
                  tag('span', { content: computed(() => (chosen.value ? `${share.value}%` : '')) }),
                ),
              ],
            }),
          ],
        });
      };

      const list = tag('ul');
      const root = tag('div', {
        class: 'poll',
        mounted: () => effect(() => list.setState({ children: options.value.map(row) })),
        children: [
          tag('h3', { content: computed(() => props.question.value ?? 'What do you think?') }),
          list,
          part(
            'div',
            'foot',
            tag('span', {
              content: computed(() => `${total.value} ${total.value === 1 ? 'vote' : 'votes'}`),
            }),
            tag('button', {
              type: 'button',
              content: 'Take my vote back',
              hidden: computed(() => !chosen.value),
              onclick: () => store.getState().reset(),
            }),
          ),
        ],
      });
      return sheet(css, root);
    },
    { attributes: ['question', 'options', 'poll', 'seed'] },
  );
