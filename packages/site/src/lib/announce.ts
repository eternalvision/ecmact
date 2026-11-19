let frame = 0;
let timer: ReturnType<typeof setTimeout> | undefined;

/**
 * Gives the page its polite status region, kept out of sight, once. The app calls it at start, so that the region is
 * known to assistive technology before the first message; later calls return the same element.
 *
 * @returns The region.
 */
export const announcer = () => {
  let region = document.querySelector('.sr-status');
  if (!region) {
    region = document.createElement('div');
    region.className = 'sr-only sr-status';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    document.body.append(region);
  }
  return region;
};

/**
 * Says a message to assistive technology through the status region. The region is emptied first and filled on the
 * next frame, so that the same message said twice is read twice. One shared timer empties it again, so that a later
 * message is never wiped by the timer of an earlier one.
 *
 * @param message - The message.
 */
export const announce = (message: string) => {
  const region = announcer();
  cancelAnimationFrame(frame);
  clearTimeout(timer);
  region.textContent = '';
  frame = requestAnimationFrame(() => {
    region.textContent = message;
  });
  timer = setTimeout(() => {
    region.textContent = '';
  }, 1500);
};
