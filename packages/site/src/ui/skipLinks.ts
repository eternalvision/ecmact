import { tags } from 'ecmact';

const { a, div } = tags;

/** A link that moves the keyboard focus past a block of links. */
export interface SkipLink {
  /** The text of the link. */
  label: string;
  /** The id of the element to focus. It must be focusable by script: `tabindex="-1"` is enough. */
  target: string;
}

/**
 * Links that stay out of sight until a keyboard user reaches them, and that move the focus to a place of the page.
 * A plain address `#id` is the fallback; the click moves the focus itself, so the history gets no extra entry.
 *
 * @param links - The links, in order.
 * @returns The container.
 */
export const SkipLinks = (links: SkipLink[]) =>
  div(
    { class: 'skip-links' },
    links.map((link) =>
      a(
        {
          class: 'skip-link',
          href: `#${link.target}`,
          /**
           * Focuses the target and scrolls it into view.
           *
           * @param event - The click.
           */
          onclick: (event: MouseEvent) => {
            const target = document.getElementById(link.target);
            if (!target) return;
            event.preventDefault();
            target.focus();
            target.scrollIntoView({ block: 'start' });
          },
        },
        link.label,
      ),
    ),
  );
