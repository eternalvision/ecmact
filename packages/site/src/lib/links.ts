import type { Router } from 'ecmact';

/**
 * Makes the links that `parseInline` marked as internal navigate through the router instead of reloading the page.
 * One listener on the container covers every such link, including the ones added later.
 *
 * @param container - The element that holds the links.
 * @param router - The router to navigate with.
 */
export const followInternalLinks = (container: HTMLElement, router: Router) => {
  container.addEventListener('click', (event) => {
    const target = event.target;
    const anchor =
      target instanceof Element ? target.closest<HTMLAnchorElement>('a[data-internal]') : null;
    const plain =
      event.button === 0 && !(event.metaKey || event.ctrlKey || event.shiftKey || event.altKey);
    if (!anchor || !plain || event.defaultPrevented) return;
    event.preventDefault();
    void router.navigate(anchor.dataset.internal as string);
  });
};
