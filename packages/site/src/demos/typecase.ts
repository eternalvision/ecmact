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

const display = css`
  font-family:
    Impact, Haettenschweiler, 'Franklin Gothic Bold', 'Arial Narrow Bold', 'Arial Black', sans-serif;
`;

const Bench = styled.div`
  color-scheme: light;
  padding: 22px 26px 18px 18px;
  background: ${(props) => String(props.theme.stock)};
  color: ${(props) => String(props.theme.ink)};
  font-family:
    system-ui,
    -apple-system,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
`;

const Poster = styled.div<{ $pressing: boolean }>`
  ${display}
  padding: 18px 14px 20px;
  background: ${(props) => String(props.theme.ink)};
  color: ${(props) => String(props.theme.stock)};
  box-shadow: 10px 10px 0
    color-mix(
      in srgb,
      ${(props) => String(props.theme.ink)} 30%,
      ${(props) => String(props.theme.stock)}
    );
  text-align: center;
  text-transform: uppercase;
  animation: ${(props) => (props.$pressing ? press : 'none')} 0.5s ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Small = styled.div`
  font-size: 16px;
  letter-spacing: 0.14em;
`;

const Headline = styled.div`
  margin: 6px 0 4px;
  font-size: clamp(46px, 16vw, 70px);
  line-height: 0.92;
  overflow-wrap: anywhere;
`;

const Tools = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  margin-top: 24px;
`;

const Swatch = styled.button<{ $color: string; $on: boolean }>`
  width: 30px;
  height: 30px;
  padding: 0;
  border: 3px solid ${(props) => String(props.theme.ink)};
  border-radius: 0;
  background: ${(props) => props.$color};
  box-shadow: ${(props) => (props.$on ? `4px 4px 0 ${String(props.theme.ink)}` : 'none')};
  transform: ${(props) => (props.$on ? 'translate(-2px, -2px)' : 'none')};
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${(props) => String(props.theme.ink)};
    outline-offset: 5px;
  }
`;

const Pull = styled.button`
  ${display}
  margin-left: auto;
  padding: 8px 16px;
  border: 0;
  border-radius: 0;
  background: ${(props) => String(props.theme.ink)};
  color: ${(props) => String(props.theme.stock)};
  font-size: 18px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;

  &:focus-visible {
    outline: 3px solid ${(props) => String(props.theme.ink)};
    outline-offset: 3px;
  }
`;

const Field = styled.label`
  display: flex;
  flex: 1 1 100%;
  min-width: 0;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 700;

  input {
    flex: 1;
    min-width: 0;
    padding: 8px 10px;
    border: 0;
    border-bottom: 4px solid ${(props) => String(props.theme.ink)};
    border-radius: 0;
    background: color-mix(
      in srgb,
      ${(props) => String(props.theme.ink)} 5%,
      ${(props) => String(props.theme.stock)}
    );
    color: ${(props) => String(props.theme.ink)};
    font: inherit;
    font-size: 16px;
    font-weight: 700;
  }

  input:focus-visible {
    outline: 3px solid ${(props) => String(props.theme.ink)};
    outline-offset: 3px;
  }
`;

const Colophon = styled.p`
  margin: 14px 0 0;
  font-size: 13.5px;
  font-weight: 600;
`;

const inks = [
  { name: 'Black', color: '#111111' },
  { name: 'Red', color: '#c4161c' },
  { name: 'Blue', color: '#2b2bff' },
];

const stocks = [
  { name: 'Mint', color: '#c8f7dc' },
  { name: 'White', color: '#ffffff' },
  { name: 'Lemon', color: '#fff27a' },
];

/**
 * A wood-type poster. The ink and the stock are one theme signal: every styled component below the provider
 * restyles when it changes, and a proof plays the keyframes of the press.
 *
 * @returns The example.
 */
export const create = () => {
  const theme = signal<Theme>({
    ink: '#2b2bff',
    inkName: 'Blue',
    stock: '#c8f7dc',
    stockName: 'Mint',
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
