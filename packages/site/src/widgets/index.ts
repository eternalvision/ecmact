import { defineCountdownTimer } from '@site/widgets/countdownTimer';
import { definePollWidget } from '@site/widgets/pollWidget';
import { definePriceCalculator } from '@site/widgets/priceCalculator';
import { defineRepoCard } from '@site/widgets/repoCard';
import { defineWeatherNow } from '@site/widgets/weatherNow';

/**
 * Registers every widget of the gallery, each once. The script that host pages load calls it; calling it again
 * does nothing.
 */
export const defineAll = () => {
  [
    ['price-calculator', definePriceCalculator],
    ['weather-now', defineWeatherNow],
    ['repo-card', defineRepoCard],
    ['poll-widget', definePollWidget],
    ['countdown-timer', defineCountdownTimer],
  ].forEach(([name, define]) => {
    if (!customElements.get(name as string)) (define as () => unknown)();
  });
};
