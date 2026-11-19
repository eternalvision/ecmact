import type { Router } from 'ecmact';

/**
 * Scrolls to the element that the hash of an address names and moves the focus there, so the next Tab continues
 * from the section. The router scrolls to the top after it navigates, and the browser looks for the element before
 * the page has it, so a link to a section of another page needs this.
 *
 * @param address - An address, with or without a hash. Ids on the site are plain ASCII, so the hash is used as it is.
 * @returns Whether an element was found.
 */
export const scrollToHash = (address: string) => {
  const hash = address.includes('#') ? address.slice(address.indexOf('#') + 1) : '';
  const target = hash ? document.getElementById(hash) : null;
  target?.scrollIntoView();
  target?.focus({ preventScroll: true });
  return target !== null;
};

/**
 * Makes the links that `parseInline` marked as internal navigate through the router instead of reloading the page.
 * One listener on the container covers every such link, including the ones added later.
 *
 * @param container - The element that holds the links.
 * @param router - The router to navigate with.
 * @param fallback - Called after the page opens when the address names no section, to put the focus somewhere: the link that had it is gone.
 */
export const followInternalLinks = (
  container: HTMLElement,
  router: Router,
  fallback?: () => void,
) => {
  container.addEventListener('click', (event) => {
    const target = event.target;
    const anchor =
      target instanceof Element ? target.closest<HTMLAnchorElement>('a[data-internal]') : null;
    const plain =
      event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
    if (!anchor || !plain || event.defaultPrevented) return;
    event.preventDefault();
    const to = anchor.dataset.internal as string;
    void router.navigate(to).then(() => {
      if (!scrollToHash(to)) fallback?.();
    });
  });
};
