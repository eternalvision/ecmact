import { em, keyframes, signal, styled, ThemeProvider } from 'ecmact';

const spin = keyframes`
  from { rotate: 0deg; }
  to { rotate: 360deg; }
`;

const Button = styled.button<{ $primary?: boolean }>`
  padding: 0.55rem 1.1rem;
  border: 1px solid transparent;
  border-radius: 10px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  color: ${(props) => (props.$primary ? 'white' : 'inherit')};
  background: ${(props) => (props.$primary ? String(props.theme.accent) : 'transparent')};
  border-color: ${(props) => (props.$primary ? 'transparent' : String(props.theme.accent))};

  &:hover {
    filter: brightness(1.12);
  }
`;

const Spinner = styled.div`
  width: 1.6rem;
  height: 1.6rem;
  border: 3px solid transparent;
  border-top-color: ${(props) => String(props.theme.accent)};
  border-radius: 50%;
  animation: ${spin} 0.9s linear infinite;
`;

const Swatch = styled.button<{ $color: string }>`
  width: 1.8rem;
  height: 1.8rem;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 0 1px var(--border);
  background: ${(props) => props.$color};
  cursor: pointer;
`;

const colors = ['#1665e0', '#d6336c', '#2f9e44', '#e67700'];

/**
 * Styled components with props, a theme from a signal, and an animation. Change the swatch: every styled
 * component below the provider restyles.
 *
 * @returns The demo.
 */
export const create = () => {
  const theme = signal<Record<string, unknown>>({ accent: colors[0] });

  return ThemeProvider({
    theme,
    style: { display: 'flex', gap: '0.9rem', alignItems: 'center', flexWrap: 'wrap' },
    children: [
      Button({ content: 'Primary', $primary: true }),
      Button({ content: 'Outline' }),
      Spinner(),
      em.Swatches({
        style: { display: 'flex', gap: '0.5rem' },
        children: colors.map((color) =>
          Swatch({
            $color: color,
            'aria-label': `Use ${color}`,
            onclick: () => (theme.value = { accent: color }),
          }),
        ),
      }),
    ],
  });
};
