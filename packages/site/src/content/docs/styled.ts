import { callout, code, demo, h2, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** Styled components: tagged templates, attrs, extending, as, keyframes and themes. */
export const page: DocPage = {
  slug: 'styled',
  title: 'Styled components',
  summary:
    'CSS in tagged templates with props, signals, themes and animations, scoped to the component.',
  group: 'Core',
  blocks: [
    p(
      '`styled` turns CSS written in a tagged template into a component, in the style of styled-components. It is built into ECMact and works with its signals and Shadow DOM. The React library of the same name does not run on custom elements and is not involved.',
    ),
    demo('styled'),
    code(
      'ts',
      `
import { styled } from 'ecmact';

const Button = styled.button<{ $primary?: boolean }>\`
  padding: 0.5rem 1rem;
  border: 0;
  border-radius: 8px;
  color: white;
  background: \${(props) => (props.$primary ? '#1665e0' : '#6b7a90')};

  &:hover {
    filter: brightness(1.1);
  }
\`;

mount('#app', Button({ content: 'Save', $primary: true }), Button({ content: 'Cancel' }));
`,
    ),
    h2('What a template can contain'),
    ul(
      'Plain values, **signals** and **functions of the props**. `false`, `null` and `undefined` leave nothing behind, so `${(props) => props.$wide && "width: 100%;"}` works.',
      'Fragments made with `css`, to share between components.',
      '`keyframes` animations.',
      'Nested rules and `&`, using native CSS nesting (Chrome 120, Safari 17.2, Firefox 117 and newer).',
    ),
    p(
      "Props starting with `$` are **transient**: they reach the functions of the template but are never set on the element. Type them with the generic: `styled.button<{ $primary?: boolean }>`. The styles live in the shadow root, so they cannot leak out and the page's CSS cannot reach in. Styled components get a shadow root even when the app is configured with `shadow: false`, because their styles need one.",
    ),
    h2('Attributes, extending and as'),
    code(
      'ts',
      `
const Field = styled.input.attrs({ type: 'text', placeholder: 'Name' })\`
  padding: 0.5rem;
\`;

const DangerButton = styled(Button)\`
  background: crimson;
\`;

Button({ as: 'a', href: '/docs', content: 'Docs' });
`,
    ),
    table(
      ['Feature', 'Behavior'],
      [
        '`.attrs(props or fn)`',
        'Default props. Props passed to the component win. A function is called once, when the component is created.',
      ],
      [
        '`styled(Component)`',
        'Keeps the tag, templates and attrs of a styled component; its own template comes after, so it wins.',
      ],
      ['`as`', 'Renders another tag with the same styles. It is not put on the element.'],
    ),
    h2('Animations'),
    p(
      '`keyframes` writes the frames of an animation. The `@keyframes` rule is placed next to the styles of every component that uses it, because an animation defined outside a shadow root does not exist inside it.',
    ),
    code(
      'ts',
      `
import { keyframes, styled } from 'ecmact';

const spin = keyframes\`
  from { rotate: 0deg; }
  to { rotate: 360deg; }
\`;

const Spinner = styled.div\`
  animation: \${spin} 1s linear infinite;
\`;
`,
    ),
    h2('Themes'),
    p(
      '`ThemeProvider` offers a theme to every styled component below it and the template reads it as `props.theme`. The theme is an object, or a signal of one: change the signal and every component below restyles.',
    ),
    code(
      'ts',
      `
import { signal, styled, ThemeProvider } from 'ecmact';

const Button = styled.button\`
  background: \${(props) => String(props.theme.accent)};
\`;

const theme = signal({ accent: '#1665e0' });

mount('#app', ThemeProvider({ theme, children: [Button({ content: 'Save' })] }));

theme.value = { accent: '#d6336c' };
`,
    ),
    ul(
      'A provider inside another replaces the theme for its own subtree.',
      'The `theme` prop of one component overrides the context.',
      '`useTheme(element)` reads the theme signal for code that is not a styled component.',
      'For a theme that is only colors and sizes, CSS custom properties are simpler.',
    ),
    h2('What is different from styled-components'),
    callout(
      'note',
      'No selectors of other components (`${Link}:hover &`): every component has its own shadow root, and a selector cannot cross it. No `createGlobalStyle`: global styles are the opposite of isolation, use [shared stylesheets](/docs/styling). No `withConfig` and `shouldForwardProp`: `$`-prefixed props cover the same need. Props win over `.attrs` defaults.',
    ),
  ],
};
