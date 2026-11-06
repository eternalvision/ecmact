import { configure } from 'ecmact';
import reset from './reset.css?inline';
import tailwind from './tailwind.css?inline';

/**
 * Applies the application-wide ECMact configuration. Tailwind and the reset stylesheet are shared
 * with every shadow root, so utility classes work inside all components.
 */
export const setup = () => {
  configure({ styles: [tailwind, reset] });
};
