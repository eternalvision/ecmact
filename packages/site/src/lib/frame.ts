/**
 * Makes an iframe as tall as the page inside it, and keeps it so while that page grows or shrinks, so that the
 * frame never has a scrollbar of its own. It works for pages of the same origin.
 *
 * @param frame - The iframe.
 */
export const fitFrame = (frame: HTMLIFrameElement) => {
  /** Sets the height of the frame to the height of its page. */
  const fit = () => {
    const page = frame.contentDocument?.documentElement;
    if (page) frame.style.height = `${page.scrollHeight}px`;
  };
  frame.setAttribute('scrolling', 'no');
  frame.addEventListener('load', () => {
    fit();
    const body = frame.contentDocument?.body;
    if (body) new ResizeObserver(fit).observe(body);
  });
};
