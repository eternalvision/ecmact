/**
 * The compatibility inventory of the documentation redesign (plan 1.2, "Rules added"): what must keep answering
 * while the gallery is rewritten. The stories #54 to #58 reuse it.
 */
export const inventory = {
  /** The twelve ids of the old demos, which the guides and links use. */
  demoIds: [
    'counter',
    'todo',
    'styled',
    'store',
    'form',
    'context',
    'http',
    'github',
    'posts',
    'weather',
    'lifecycle',
    'widget',
  ],
  /** The five tags of the first gallery, with the widget that replaced each; the reference keeps an anchor for the old tag. */
  widgetTags: {
    'price-calculator': 'print-quote',
    'weather-now': 'moon-dial',
    'repo-card': 'feed-lamp',
    'poll-widget': 'row-counter',
    'countdown-timer': 'proof-clock',
  } as Record<string, string>,
  /** The four host pages, under the base path, as files of `public`. */
  hosts: ['/hosts/cafe.html', '/hosts/terminal.html', '/hosts/zine.html', '/hosts/kids.html'],
  /** The addresses that the Pages workflow assembles, under the base path, and the step that writes each. */
  deployed: {
    '/starter/': 'site/starter',
    '/widget/': 'site/widget',
    '/widget/embed.html': 'embed.html',
    '/widget/price-widget.js': 'site/widget/price-widget.js',
  } as Record<string, string>,
};
