/**
 * Says a message to assistive technology through a polite status region that is added to the page once and kept
 * out of sight.
 *
 * @param message - The message; an empty text clears the region.
 */
export const announce = (message: string) => {
  let region = document.querySelector('.sr-status');
  if (!region) {
    region = document.createElement('div');
    region.className = 'sr-only sr-status';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    document.body.append(region);
  }
  region.textContent = message;
};
