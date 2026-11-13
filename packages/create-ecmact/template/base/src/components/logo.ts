import { em, tags } from 'ecmact';
import logo from '../assets/ecmact-logo.png';

const logoCss = `
  :host {
    display: block;
  }
  img {
    display: block;
    width: min(26rem, 82vw);
    height: auto;
    filter: drop-shadow(0 0 1.6rem var(--glow-strong));
    transition: filter 0.3s, transform 0.3s;
  }
  img:hover {
    transform: scale(1.02);
    filter: drop-shadow(0 0 2.4rem var(--glow-strong));
  }
  @media (prefers-color-scheme: dark) {
    img { filter: brightness(1.9) drop-shadow(0 0 1.6rem var(--glow-strong)); }
    img:hover { filter: brightness(2) drop-shadow(0 0 2.4rem var(--glow-strong)); }
  }
`;

/**
 * The ECMact logo: the hexagon mark and the wordmark, as an image with a transparent background.
 * In the dark color scheme the wordmark is lightened so it stays readable.
 *
 * @returns The logo component.
 */
export const Logo = () =>
  em.Logo({ css: logoCss }, tags.img({ src: logo, alt: 'ECMact', width: 856, height: 283 }));
