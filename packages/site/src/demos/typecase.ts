import {
  computed,
  css,
  keyframes,
  signal,
  styled,
  tags,
  ThemeProvider,
  useTheme,
  type Theme,
} from 'ecmact';

const { div, span } = tags;

const press = keyframes`
  0% { opacity: 0.1; transform: scale(1.03); }
  100% { opacity: 1; transform: none; }
`;

const slab = css`
  font-family: Rockwell, 'Roboto Slab', 'Courier New', Georgia, serif;
`;

const Bench = styled.div`
  ${slab}
  color-scheme: light;
  padding: 18px;
  background:
    radial-gradient(rgba(90, 60, 20, 0.1) 0.7px, transparent 1px) 0 0 / 4px 4px,
    ${(props) => String(props.theme.stock)};
  color: ${(props) => String(props.theme.ink)};
  text-align: center;
`;

const Poster = styled.div<{ $pressing: boolean }>`
  padding: 10px 8px 14px;
  border: 3px double ${(props) => String(props.theme.ink)};
  animation: ${(props) => (props.$pressing ? press : 'none')} 0.5s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Small = styled.div`
  font-size: 11px;
  letter-spacing: 0.34em;
  text-transform: uppercase;
`;

const Headline = styled.div`
  margin: 0.4em 0 0.35em;
  font-size: clamp(30px, 9vw, 58px);
  font-weight: 900;
  line-height: 0.95;
  text-transform: uppercase;
  overflow-wrap: anywhere;
  transform: scaleY(1.25);
  opacity: 0.92;
`;

const Tools = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
`;

const Swatch = styled.button<{ $color: string; $on: boolean }>`
  width: 28px;
  height: 28px;
  padding: 0;
  border: 2px solid ${(props) => String(props.theme.ink)};
  border-radius: 50%;
  background: ${(props) => props.$color};
  box-shadow: ${(props) => (props.$on ? `0 0 0 3px ${String(props.theme.stock)}, 0 0 0 5px ${String(props.theme.ink)}` : 'none')};
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${(props) => String(props.theme.ink)};
    outline-offset: 5px;
  }
`;

const Pull = styled.button`
  ${slab}
  padding: 6px 14px;
  border: 2px solid ${(props) => String(props.theme.ink)};
  background: ${(props) => String(props.theme.ink)};
  color: ${(props) => String(props.theme.stock)};
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${(props) => String(props.theme.ink)};
    outline-offset: 3px;
  }
`;

const Field = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;

  input {
    width: 11rem;
    max-width: 100%;
    padding: 4px 6px;
    border: 0;
    border-bottom: 2px solid ${(props) => String(props.theme.ink)};
    background: transparent;
    color: inherit;
    font: inherit;
    letter-spacing: 0.08em;
  }

  input:focus-visible {
    outline: 3px solid ${(props) => String(props.theme.ink)};
    outline-offset: 2px;
  }
`;

const Colophon = styled.p`
  margin: 12px 0 0;
  font-size: 11px;
  letter-spacing: 0.08em;
`;

const inks = [
  { name: 'Black', color: '#1a1a1a' },
  { name: 'Red', color: '#b3261e' },
  { name: 'Blue', color: '#1f3a5f' },
];

const stocks = [
  { name: 'Cream', color: '#eee3c9' },
  { name: 'White', color: '#fbfaf5' },
  { name: 'Kraft', color: '#d2b48c' },
];

/**
 * A wood-type poster. The ink and the stock are one theme signal: every styled component below the provider
 * restyles when it changes, and a proof plays the keyframes of the press.
 *
 * @returns The example.
 */
export const create = () => {
  const theme = signal<Theme>({
    ink: '#1a1a1a',
    inkName: 'Black',
    stock: '#eee3c9',
    stockName: 'Cream',
  });
  const headline = signal('Grand opening');
  const pressing = signal(false);

  /**
   * Starts the press animation, unless the visitor asked for less motion: with no animation running there would
   * be no event that ends it.
   */
  const proof = () => {
    pressing.value = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  };
  const colophon = signal<Element | undefined>(undefined);

  /**
   * Changes part of the theme and pulls a proof.
   *
   * @param change - The new values.
   */
  const choose = (change: Theme) => {
    theme.value = { ...theme.value, ...change };
    proof();
  };

  /**
   * Makes the swatches of one kind: one per choice, the chosen one ringed.
   *
   * @param kind - Which part of the theme the swatches set.
   * @param choices - The choices.
   * @returns The swatches.
   */
  const swatches = (kind: 'ink' | 'stock', choices: typeof inks) =>
    choices.map(({ name, color }) => {
      const on = computed(() => theme.value[kind] === color);
      return Swatch({
        type: 'button',
        $color: color,
        $on: on,
        'aria-label': `${name} ${kind}`,
        'aria-pressed': () => String(on.value),
        onclick: () => choose({ [kind]: color, [`${kind}Name`]: name }),
      });
    });

  return ThemeProvider(
    { theme },
    Bench(
      Poster(
        {
          $pressing: pressing,
          onanimationend: () => {
            pressing.value = false;
          },
          onanimationcancel: () => {
            pressing.value = false;
          },
        },
        Small('One night only'),
        Headline(headline),
        Small('Doors at eight'),
      ),
      Tools(
        Field(
          span('Headline'),
          tags.input({ bind: headline, maxlength: 24, 'aria-label': 'Headline' }),
        ),
      ),
      Tools(
        div(
          { role: 'group', 'aria-label': 'Ink', style: { display: 'flex', gap: '8px' } },
          swatches('ink', inks),
        ),
        div(
          { role: 'group', 'aria-label': 'Stock', style: { display: 'flex', gap: '8px' } },
          swatches('stock', stocks),
        ),
        Pull({ type: 'button', onclick: proof }, 'Pull a proof'),
      ),
      Colophon({ ref: (element) => (colophon.value = element) }, () => {
        const current = colophon.value && useTheme(colophon.value)?.value;
        return current ? `Set in ${current.inkName} ink on ${current.stockName} stock.` : '';
      }),
    ),
  );
};
