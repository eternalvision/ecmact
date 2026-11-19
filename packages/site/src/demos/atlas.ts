import { em, signal, tags, type Route, type RouteContext, type Router } from 'ecmact';

const { button, div, h3, nav, p, span } = tags;

const css = `
  :host {
    display: block;
    color-scheme: light;
    padding: 18px;
    background:
      radial-gradient(rgba(74, 53, 32, 0.12) 0.7px, transparent 1px) 0 0 / 5px 5px,
      #efe2c2;
    color: #4a3520;
    font-family: 'Hoefler Text', 'Baskerville', Georgia, serif;
  }
  .addr {
    margin: 0;
    padding: 4px 8px;
    border: 1px solid #4a3520;
    background: #f7eed6;
    font: 12px/1.5 ui-monospace, Menlo, monospace;
    overflow-wrap: anywhere;
  }
  .sea {
    position: relative;
    height: 150px;
    margin: 12px 4px 10px;
    border: 1px solid #4a3520;
    outline: 1px solid #4a3520;
    outline-offset: 3px;
    background: repeating-linear-gradient(0deg, transparent 0 9px, rgba(74, 53, 32, 0.14) 9px 10px);
  }
  .isle {
    position: absolute;
    inset: 16px 22px 18px 26px;
    border: 1.5px solid #4a3520;
    border-radius: 58% 42% 55% 45% / 46% 60% 40% 54%;
    background: #e6d3a3;
    box-shadow:
      0 0 0 4px #efe2c2,
      0 0 0 5px rgba(74, 53, 32, 0.5),
      0 0 0 9px #efe2c2,
      0 0 0 10px rgba(74, 53, 32, 0.25);
  }
  .place {
    position: absolute;
    padding: 4px 3px;
    border-bottom: 1px dotted #4a3520;
    color: #4a3520;
    font: italic 15px/1.2 'Hoefler Text', Georgia, serif;
    text-decoration: none;
  }
  .place[aria-current='page'] {
    border-bottom: 2px solid #4a3520;
    font-weight: 700;
  }
  .rose {
    position: absolute;
    right: 6px;
    bottom: 2px;
    font-size: 22px;
  }
  a:focus-visible,
  button:focus-visible,
  .sheet:focus-visible {
    outline: 3px solid #4a3520;
    outline-offset: 2px;
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 14px;
    margin: 0 0 10px;
    font-size: 14px;
  }
  .controls a {
    color: inherit;
  }
  .controls a[aria-current='page'] {
    font-weight: 700;
  }
  button {
    padding: 3px 10px;
    border: 1px solid #4a3520;
    border-radius: 0;
    background: #f7eed6;
    color: #4a3520;
    font: inherit;
    cursor: pointer;
  }
  button[aria-pressed='true'] {
    background: #4a3520;
    color: #f7eed6;
  }
  .note {
    margin: 0;
    font-size: 15px;
    font-style: italic;
  }
  .sheet {
    min-height: 120px;
    font-size: 15px;
  }
  .sheet h3 {
    margin: 0 0 4px;
    font-size: 19px;
    font-style: italic;
  }
  .sheet p {
    margin: 0 0 8px;
  }
  .layers {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 0 0 8px;
  }
  .notice {
    padding: 6px 10px;
    border-left: 4px solid #8a2d1b;
    background: #f7eed6;
  }
  .sheet a {
    color: inherit;
  }
  @media (prefers-reduced-motion: no-preference) {
    .waiting {
      animation: unroll 1.2s ease-in-out infinite alternate;
    }
    @keyframes unroll {
      to {
        opacity: 0.4;
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
      p('Choose a place, or press the sun to see the lighthouse open.'),
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
          onclick: () => {
            queueMicrotask(() => sheet.focus());
          },
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
                class: 'place',
                style: { left: `${place.left}%`, top: `${place.top}%` },
              },
              place.name,
            ),
          ),
        ),
        div(
          { class: 'controls' },
          router.link({ to: '/examples/atlas' }, 'The whole island'),
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
