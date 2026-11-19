import { em, signal, tags, type Route, type RouteContext, type Router } from 'ecmact';

const { button, div, h3, nav, p, span } = tags;

const css = `
  :host {
    display: block;
    color-scheme: light;
    padding: 16px;
    background: #f1faff;
    color: #0b2b3a;
    font-family: Seravek, 'Gill Sans Nova', 'Gill Sans', Ubuntu, Calibri, 'DejaVu Sans', sans-serif;
  }
  .addr {
    position: relative;
    margin: 0 0 12px;
    padding: 8px 14px 8px 34px;
    border-radius: 999px;
    background: #ffffff;
    box-shadow: 0 2px 8px rgba(0, 70, 110, 0.14);
    color: #44606c;
    font-size: 14.5px;
    overflow-wrap: anywhere;
  }
  .addr::before {
    content: '';
    position: absolute;
    left: 14px;
    top: 50%;
    width: 10px;
    height: 10px;
    margin-top: -5px;
    border-radius: 50%;
    background: #19c37d;
  }
  .sea {
    position: relative;
    height: 216px;
    border-radius: 26px;
    background:
      radial-gradient(70px 16px at 78% 16%, #c4eeff 97%, transparent),
      radial-gradient(54px 12px at 86% 82%, #c4eeff 97%, transparent),
      radial-gradient(40px 10px at 8% 92%, #c4eeff 97%, transparent), #8fdbff;
    overflow: hidden;
  }
  .isle {
    position: absolute;
    inset: 22px 76px 30px 26px;
    border-radius: 58% 42% 55% 45% / 48% 60% 40% 52%;
    background: #8ee06b;
    box-shadow:
      inset -12px -16px 0 #6fcb4e,
      0 0 0 9px #f7e8a6,
      0 10px 0 9px #6cc6ec;
  }
  .place {
    position: absolute;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 12px 6px 9px;
    border-radius: 999px;
    background: #ffffff;
    color: #0b2b3a;
    font-size: 14.5px;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    box-shadow: 0 4px 0 rgba(11, 60, 40, 0.28);
  }
  .place::before {
    content: '';
    flex: none;
    width: 13px;
    height: 13px;
    border-radius: 50% 50% 50% 0;
    background: #ff5a47;
    transform: rotate(-45deg);
  }
  .place[aria-current='page'] {
    background: #0b2b3a;
    color: #ffffff;
    box-shadow:
      0 4px 0 rgba(11, 60, 40, 0.28),
      0 0 0 6px rgba(255, 90, 71, 0.35);
  }
  .rose {
    position: absolute;
    top: 12px;
    right: 12px;
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #ffffff;
    color: #ff5a47;
    font-size: 20px;
    box-shadow: 0 4px 0 rgba(0, 70, 110, 0.2);
  }
  .note {
    margin: 12px 0 0;
    font-size: 15.5px;
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin: 12px 0;
  }
  .controls a,
  button {
    display: inline-flex;
    align-items: center;
    min-height: 36px;
    padding: 0 14px;
    border: 0;
    border-radius: 999px;
    background: #ddf2fd;
    color: #0b2b3a;
    font: inherit;
    font-size: 14.5px;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
  }
  .controls a[aria-current='page'] {
    background: #0b2b3a;
    color: #ffffff;
  }
  .controls button {
    margin-left: auto;
    gap: 8px;
    background: #ffe27a;
    color: #3b2e00;
  }
  .controls button::before {
    content: '';
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #ff9f1a;
  }
  .controls button[aria-pressed='true'] {
    background: #0b2b3a;
    color: #ffffff;
  }
  .controls button[aria-pressed='true']::before {
    background: transparent;
    box-shadow: inset -4px -2px 0 #ffe27a;
  }
  .sheet {
    position: relative;
    min-height: 120px;
    padding: 22px 18px 16px;
    border-radius: 24px 24px 14px 14px;
    background: #ffffff;
    box-shadow: 0 10px 24px rgba(0, 70, 110, 0.16);
  }
  .sheet::before {
    content: '';
    position: absolute;
    top: 8px;
    left: 50%;
    width: 38px;
    height: 4px;
    margin-left: -19px;
    border-radius: 999px;
    background: #c9d9e0;
  }
  .sheet h3 {
    margin: 0 0 4px;
    font-size: 21px;
  }
  .sheet p {
    margin: 0 0 10px;
    font-size: 15.5px;
    line-height: 1.45;
  }
  .sheet p:last-child {
    margin-bottom: 0;
  }
  .sheet a {
    color: #0e6b85;
    font-weight: 600;
  }
  .layers {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0 0 10px;
  }
  .layers button {
    min-height: 34px;
    border-radius: 14px 4px 14px 4px;
    background: #e6f6ff;
    font-size: 14.5px;
  }
  .layers button[aria-pressed='true'] {
    background: #0e6b85;
    color: #ffffff;
  }
  .notice {
    padding: 10px 14px;
    border-radius: 14px;
    background: #ffeeeb;
    color: #8a1c14;
  }
  :focus-visible {
    outline: 3px solid #0b2b3a;
    outline-offset: 3px;
  }
  @media (prefers-reduced-motion: no-preference) {
    .waiting {
      animation: unroll 1.2s ease-in-out infinite alternate;
    }
    .place[aria-current='page']::after {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      animation: ping 1.8s ease-out infinite;
    }
    @keyframes unroll {
      to {
        opacity: 0.72;
      }
    }
    @keyframes ping {
      from {
        box-shadow: 0 0 0 0 rgba(255, 90, 71, 0.6);
      }
      to {
        box-shadow: 0 0 0 16px rgba(255, 90, 71, 0);
      }
    }
  }
  @media (max-width: 480px) {
    :host {
      padding: 14px 12px;
    }
  }
`;

/** A place on the island. */
interface Place {
  /** The segment of the address. */
  id: string;
  /** The name on the map. */
  name: string;
  /** Where the name stands on the island, from the left, in percent. */
  left: number;
  /** Where the name stands on the island, from the top, in percent. */
  top: number;
  /** What the sheet of the place says. */
  story: string;
}

const places: Place[] = [
  {
    id: 'north-shoal',
    name: 'North Shoal',
    left: 12,
    top: 14,
    story: 'Seals rest on the bar at low water. The sheet is loaded on demand.',
  },
  {
    id: 'saltmarsh',
    name: 'Saltmarsh',
    left: 38,
    top: 46,
    story: 'Reeds, creeks and a boardwalk that floods twice a day.',
  },
  {
    id: 'lighthouse',
    name: 'The Lighthouse',
    left: 8,
    top: 70,
    story: 'The keeper is at the lamp, and the stairs are open.',
  },
];

const [, , lamp] = places as [Place, Place, Place];

const layers = [
  {
    id: 'tides',
    name: 'Tides',
    text: 'High water at 06:40 and 19:05. The boardwalk is under water an hour either side.',
  },
  {
    id: 'birds',
    name: 'Birds',
    text: 'Avocets on the creeks, a marsh harrier over the reeds, waders on the flats.',
  },
  { id: 'paths', name: 'Paths', text: 'The boardwalk to the hide, and a sea wall that stays dry.' },
];

/**
 * Waits while a sheet is "loaded", for a short time. A real application would `import()` the view here.
 */
const unroll = () => new Promise<void>((resolve) => setTimeout(resolve, 700));

/**
 * Makes the click handler of a link of the atlas: a plain click navigates without scrolling the page to the top,
 * which `router.link` does by itself; a click with a modifier key is left to the browser.
 *
 * @param router - The router.
 * @param to - The path to go to.
 * @param after - Runs once the navigation is done.
 * @returns The handler.
 */
const stay = (router: Router, to: string, after?: () => void) => (event: MouseEvent) => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return;
  event.preventDefault();
  void router.navigate(to, { scroll: false }).then(after);
};

/**
 * Draws the island with the names of its places, as the teaser in the gallery does.
 *
 * @param name - What to put in the place of each name.
 * @returns The sea with its island.
 */
const island = (name: (place: Place) => Node) =>
  div(
    { class: 'sea' },
    div(
      { class: 'isle' },
      places.map((place) => name(place)),
    ),
    span({ class: 'rose', 'aria-hidden': 'true' }, '✦'),
  );

/**
 * What the gallery shows of the example: the island, and no way to walk it, because the example is a branch of
 * the routes of this site. A link beside it opens the real thing.
 *
 * @returns The teaser.
 */
export const create = () =>
  em.Atlasplate(
    { css },
    p({ class: 'addr' }, '/examples/atlas'),
    island((place) =>
      span({ class: 'place', style: { left: `${place.left}%`, top: `${place.top}%` } }, place.name),
    ),
    p({ class: 'note' }, 'The whole island. Open the atlas to walk it.'),
  );

/**
 * Makes the routes of the atlas: a layout with the map and an outlet for the sheet of a place. The routes are
 * the ones of `createRouter`, written as the site writes its own: the layout and its children, a guard that sends
 * the closed lighthouse back to the island, a sheet that is loaded lazily and one with a layer in its query.
 * The site mounts this branch at `/examples/atlas`; the places link with `router.link`, so the current one has
 * `aria-current="page"`.
 *
 * @param frame - Puts the map into the page that shows it. The default shows the map alone.
 * @returns The layout route.
 */
export const atlasRoute = (frame: (stage: Node) => Node = (stage) => stage): Route => {
  const night = signal(true);
  const waiting = signal('');
  let ticket = 0;
  let sheet: HTMLElement;

  /**
   * Starts a sheet: notes that a newer one replaced the one being loaded, and what is being waited for.
   *
   * @param name - The name of the place whose sheet is loading, or the empty text for a sheet that is there at once.
   * @returns The number of this start.
   */
  const enter = (name: string) => {
    waiting.value = name;
    return ++ticket;
  };

  /**
   * Makes a view of the island that has no place.
   *
   * @param context - The matched route.
   * @returns The view.
   */
  const whole = ({ query }: RouteContext) => {
    enter('');
    return div(
      h3('The whole island'),
      p('Choose a place, or turn Night off to see the lighthouse open.'),
      query.get('closed') === 'lighthouse' &&
        p(
          { class: 'notice' },
          'The lighthouse is closed at night: the guard sent you back to the island.',
        ),
    );
  };

  /**
   * Makes the sheet of the lighthouse. The guard of its route lets a visitor in only by day.
   *
   * @returns The view.
   */
  const lighthouse = () => {
    enter('');
    return div(h3('The Lighthouse'), p(lamp.story));
  };

  /**
   * Makes the sheet of a place that is not on the island, with a way back.
   *
   * @param name - What the address asked for.
   * @param router - The router.
   * @returns The view.
   */
  const missing = (name: string, router: Router) => {
    enter('');
    return div(
      { class: 'missing' },
      h3('No such place'),
      p(`The atlas has no sheet called "${name}".`),
      router.link(
        {
          to: '/examples/atlas',
          /**
           * Puts the focus on the sheet, because the link that had it leaves with the view.
           */
          onclick: stay(router, '/examples/atlas', () => sheet.focus()),
        },
        'Back to the island',
      ),
    );
  };

  /**
   * Makes the sheet of a place that has layers, and switches the layer through the query of the address.
   *
   * @param place - The place.
   * @param context - The matched route.
   * @returns The view.
   */
  const withLayers = (place: Place, { query, router }: RouteContext) => {
    enter('');
    const asked = query.get('layer');
    const chosen = layers.find((layer) => layer.id === asked) ?? (layers[0] as (typeof layers)[0]);
    return div(
      h3(place.name),
      p(place.story),
      div(
        { class: 'layers', role: 'group', 'aria-label': 'Layer' },
        layers.map((layer) =>
          button(
            {
              type: 'button',
              'data-layer': layer.id,
              'aria-pressed': String(layer.id === chosen.id),
              /**
               * Changes the layer in the query. The view is made again, so the focus goes to the same button of the new one.
               */
              onclick: () => {
                void router
                  .navigate(`/examples/atlas/${place.id}?layer=${layer.id}`, { scroll: false })
                  .then(() =>
                    sheet.querySelector<HTMLElement>(`[data-layer="${layer.id}"]`)?.focus(),
                  );
              },
            },
            layer.name,
          ),
        ),
      ),
      p(chosen.text),
    );
  };

  /**
   * Makes the sheet of a place, loading it first if it is the lazy one.
   *
   * @param context - The matched route.
   * @returns The view, or a promise of it.
   */
  const placeView = (context: RouteContext) => {
    const place = places.find((candidate) => candidate.id === context.params.place);
    if (!place) return missing(context.params.place as string, context.router);
    if (place.id === 'saltmarsh') return withLayers(place, context);
    const own = enter(place.name);
    return unroll().then(() => {
      if (own === ticket) waiting.value = '';
      return div(h3(place.name), p(place.story));
    });
  };

  /**
   * Makes the map: the address, the places, the switch between night and day, and the sheet.
   *
   * @param context - The matched route.
   * @returns The map, in the frame of the page.
   */
  const layout = ({ router }: RouteContext) =>
    frame(
      em.Atlas(
        { css },
        p({ class: 'addr' }, () => {
          const { path, query } = router.location.value;
          const search = query.toString();
          return search ? `${path}?${search}` : path;
        }),
        nav(
          { 'aria-label': 'Places' },
          island((place) =>
            router.link(
              {
                to: `/examples/atlas/${place.id}`,
                onclick: stay(router, `/examples/atlas/${place.id}`),
                class: 'place',
                style: { left: `${place.left}%`, top: `${place.top}%` },
              },
              place.name,
            ),
          ),
        ),
        div(
          { class: 'controls' },
          router.link(
            { to: '/examples/atlas', onclick: stay(router, '/examples/atlas') },
            'The whole island',
          ),
          button(
            {
              type: 'button',
              'aria-pressed': () => String(night.value),
              onclick: () => {
                night.value = !night.value;
              },
            },
            'Night',
          ),
        ),
        div(
          {
            class: 'sheet',
            tabindex: -1,
            'aria-live': 'polite',
            'aria-busy': () => String(waiting.value !== ''),
            ref: (element) => {
              sheet = element as HTMLElement;
            },
          },
          p(
            { class: 'waiting', hidden: () => waiting.value === '' },
            () => `Unrolling the sheet of ${waiting.value}...`,
          ),
          div({ hidden: () => waiting.value !== '' }, router.outlet()),
        ),
      ),
    );

  return {
    path: '/examples/atlas',
    view: layout,
    children: [
      { path: '', view: whole },
      {
        path: 'lighthouse',
        view: lighthouse,
        /**
         * Sends the visitor back to the island while the lighthouse is closed.
         *
         * @returns A path to go to instead, or `true` to go in.
         */
        beforeEnter: () => (night.value ? '/examples/atlas?closed=lighthouse' : true),
      },
      { path: ':place', view: placeView },
    ],
  };
};
