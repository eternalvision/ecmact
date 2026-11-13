import { callout, code, demo, h2, p, table, ul } from '@site/content/builders';
import type { DocPage } from '@site/content/types';

/** Styled components: tagged templates, attrs, extending, as, keyframes and themes. */
export const page: DocPage = {
  slug: 'styled',
  title: 'Styled components',
  summary:
    'CSS in tagged templates with props, signals, themes and animations, tied to a generated class.',
  group: 'Core',
  blocks: [
    p(
      '`styled` turns CSS written in a tagged template into a function that creates an element with those styles, in the style of styled-components. The result is the element itself: `Button(...)` below returns a `<button>` with a generated class. The React library of the same name is not involved.',
    ),
    demo('styled'),
    code(
      'ts',
      `
import { mount, styled } from 'ecmact';

const Button = styled.button<{ $primary?: boolean }>\`
  padding: 8px 16px;
  border: 0;
  border-radius: 8px;
  color: white;
  background: \${(props) => (props.$primary ? '#1665e0' : '#6b7a90')};

  &:hover {
    filter: brightness(1.1);
  }
\`;

mount(
  '#app',
  Button({ $primary: true, onclick: () => console.log('saved') }, 'Save'),
  Button('Cancel'),
);
`,
    ),
    p(
      'A styled element takes the same props and children as the element from `tags`. Put the tree into the page with `mount`: the styles are attached when the element enters the document, see [Mounting](/docs/components).',
    ),
    h2('What a template can contain'),
    ul(
      'Plain values, **signals** and **functions of the props**. `false`, `null` and `undefined` leave nothing behind, so `${(props) => props.$wide && "width: 100%;"}` works.',
      'Fragments made with `css`, to share between components.',
      '`keyframes` animations.',
      'Nested rules and `&`, using native CSS nesting (Chrome 120, Safari 17.2, Firefox 117 and newer).',
    ),
    p(
      'Props starting with `$` are **transient**: they reach the functions of the template but are never set on the element. Type them with the generic: `styled.button<{ $primary?: boolean }>`. A transient prop may be a signal, and the element restyles when it changes.',
    ),
    h2('Where the styles go'),
    p(
      'The styles are one rule for a generated class, such as `.em-1x2y3z`. The rule is put into the document, or into the shadow root of the `em` component or [widget](/docs/widgets) that the element is in. Elements with the same style text share one class and one rule. Your own `class` stays next to the generated one.',
    ),
    callout(
      'warning',
      'A styled element is isolated from the CSS of the page only inside a component or a widget. In the page itself it is an ordinary element with a class: the selectors of the page can match it, and inherited styles reach it. Every distinct style text adds a rule, and a rule is never removed. For a value that changes continuously, such as a position that follows the pointer, use the `style` prop instead of a template function.',
    ),
    h2('Attributes, extending and as'),
    code(
      'ts',
      `
import { mount, styled } from 'ecmact';

const Button = styled.button\`
  padding: 8px 16px;
  background: #1665e0;
  color: white;
\`;

const Field = styled.input.attrs({ type: 'text', placeholder: 'Name' })\`
  padding: 8px;
\`;

const DangerButton = styled(Button)\`
  background: crimson;
\`;

mount(
  '#app',
  Field(),
  DangerButton('Delete'),
  Button({ as: 'span', title: 'Not a button' }, 'A span with the same styles'),
  Button({ css: 'margin-left: 8px; &:focus-visible { outline: 2px solid; }' }, 'More'),
);
`,
    ),
    table(
      ['Feature', 'Behavior'],
      [
        '`.attrs(props or fn)`',
        'Default props. Props passed to the component win. A function is called once, when the element is created.',
      ],
      [
        '`styled(Component)`',
        'Keeps the tag, templates and attrs of a styled component. Its own template comes after, so it wins.',
      ],
      [
        '`as`',
        'Renders another tag with the same styles. It is not put on the element. The props and the returned element stay typed for the original tag.',
      ],
      [
        '`css`',
        'More CSS for one element: declarations and nested rules, put after the ones of the template. It may be a signal.',
      ],
    ),
    h2('Animations'),
    p(
      '`keyframes` writes the frames of an animation. The `@keyframes` rule is placed next to the styles of every element that uses it, so it also works inside a shadow root.',
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
  width: 24px;
  height: 24px;
  border: 3px solid #1665e0;
  border-top-color: transparent;
  border-radius: 50%;
  animation: \${spin} 1s linear infinite;
\`;
`,
    ),
    h2('Themes'),
    p(
      '`ThemeProvider` offers a theme to every styled element below it and the template reads it as `props.theme`. The theme is an object, or a signal of one: change the signal and every element below restyles. The provider is a `div` with `display: contents`, so it does not affect the layout.',
    ),
    code(
      'ts',
      `
import { mount, signal, styled, ThemeProvider } from 'ecmact';

const Button = styled.button\`
  background: \${(props) => String(props.theme.accent)};
  color: white;
\`;

const theme = signal({ accent: '#1665e0' });

mount(
  '#app',
  ThemeProvider(
    { theme },
    Button({ onclick: () => (theme.value = { accent: '#d6336c' }) }, 'Change the theme'),
  ),
);
`,
    ),
    ul(
      'A provider inside another replaces the theme for its own subtree.',
      'The `theme` prop of one element overrides the theme from the provider.',
      'Without a provider and without the prop, `props.theme` is an empty object.',
      '`useTheme(element)` reads the theme signal that applies to an element, for code that is not a styled component. It returns `undefined` when there is no provider above.',
      'For a theme that is only colors and sizes, CSS custom properties need less code.',
    ),
    h2('What is different from styled-components'),
    callout(
      'note',
      'No selectors of other components (`${Link}:hover &`): a class name is generated from the style text and is not known in advance. No `createGlobalStyle`: write global styles in the CSS of the page, or use [shared stylesheets](/docs/styling) for components. No `withConfig` and `shouldForwardProp`: `$`-prefixed props cover the same need. Props win over `.attrs` defaults.',
    ),
  ],
};
