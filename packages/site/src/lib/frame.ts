/**
 * Makes an iframe as tall as the page inside it, and keeps it so while that page grows or shrinks, so that the
 * frame never has a scrollbar of its own. It works for pages of the same origin. The height of the page is read from
 * its root element's own box, not from `scrollHeight`, which browsers never let fall below the height of the frame.
 *
 * @param frame - The iframe.
 */
export const fitFrame = (frame: HTMLIFrameElement) => {
  let observer: ResizeObserver | undefined;
  /** Sets the height of the frame to the height of its page plus the frame's own border. */
  const fit = () => {
    const page = frame.contentDocument?.documentElement;
    if (page)
      frame.style.height = `${page.offsetHeight + frame.offsetHeight - frame.clientHeight}px`;
  };
  frame.setAttribute('scrolling', 'no');
  frame.addEventListener('load', () => {
    fit();
    observer?.disconnect();
    const page = frame.contentDocument?.documentElement;
    if (!page) return;
    observer = new ResizeObserver(fit);
    observer.observe(page);
  });
};
