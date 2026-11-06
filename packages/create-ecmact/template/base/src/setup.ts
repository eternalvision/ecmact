import { configure } from 'ecmact';
import reset from './reset.css?inline';

/**
 * Applies the application-wide ECMact configuration. The reset stylesheet is shared with every
 * shadow root, so components get box-sizing and base styles without repeating them.
 */
export const setup = () => {
  configure({ styles: [reset] });
};
