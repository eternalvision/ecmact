import { em } from 'ecmact';

const mark = `
  <svg class="mark" viewBox="0 0 100 100" fill="none" aria-hidden="true">
    <path d="M50 4 89.8 27v46L50 96 10.2 73V27z" fill="#1677ff" stroke="#1677ff" stroke-width="6" stroke-linejoin="round" />
    <path d="M50 14 81 32v36L50 86 19 68V32z" fill="#2f8cff" stroke="#2f8cff" stroke-width="4" stroke-linejoin="round" />
    <path d="M43 39 32 50l11 11M57 39l11 11-11 11" stroke="#0a4fc4" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
  <span class="word">ECMACT</span>
`;

const logoCss = `
  div {
    display: inline-flex;
    align-items: center;
    gap: 1.1rem;
  }
  .mark {
    width: clamp(4.5rem, 14vw, 6.5rem);
    height: auto;
    filter: drop-shadow(0 0 1.6rem rgba(30, 123, 255, 0.65));
    transition: filter 0.3s, transform 0.3s;
  }
  div:hover .mark {
    filter: drop-shadow(0 0 2.4rem rgba(30, 123, 255, 0.95));
    transform: scale(1.04);
  }
  .word {
    font-family: Impact, 'Arial Narrow Bold', 'Oswald', ui-sans-serif, sans-serif;
    font-size: clamp(2.6rem, 9vw, 4.4rem);
    font-weight: 800;
    letter-spacing: 0.04em;
    line-height: 1;
    background: linear-gradient(180deg, var(--primary-bright), var(--primary));
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
`;

/**
 * The ECMact logo: the hexagon mark with the wordmark next to it.
 *
 * @returns The logo component.
 */
export const Logo = () => em.Logo({ tag: 'div', css: logoCss, html: mark, 'aria-label': 'ECMact' });
