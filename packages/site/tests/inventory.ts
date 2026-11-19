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
  /** The five widget tags that the host pages use. */
  widgetTags: ['price-calculator', 'weather-now', 'repo-card', 'poll-widget', 'countdown-timer'],
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
