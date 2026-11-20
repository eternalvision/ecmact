# Style matrix v2: twelve examples and eight widgets

Version 0.1 · approved by the owner as drawn (D63) · 19 November 2026 · belongs to the documentation redesign, requirements R09 and R10 of addendum 1.3 (`docs/plans/2026-11-19-docs-redesign-spec.md` in the repository) · mocks: `concepts-v2.html` in this folder.

The scripts and captures that produced the numbers below are not kept in the repository (D64). The functions, names, interactions and ECMact coverage of the approved concept sheet (D50) do not change; only the look does.

## 1. The rule

Six axes describe a piece: shape language, palette, type, surface, primary control and motion. Each axis has a closed set of values. Two pieces may share at most two values. On top of that: sharp corners at most twice, a dark stage at most five times, monospace as the main type at most twice, small uppercase monospace labels at most twice.

## 2. Compact matrix

| No. | Piece         | Shape      | Palette           | Type               | Surface       | Control            | Motion            |
| --- | ------------- | ---------- | ----------------- | ------------------ | ------------- | ------------------ | ----------------- |
| E1  | `exposure`    | pill       | mono-accent light | rounded            | neumorphic    | stepper            | key sinks         |
| E2  | `setlist`     | radius-md  | saturated         | grotesk            | sticker       | round icon buttons | card lifts        |
| E3  | `typecase`    | sharp      | duotone           | condensed display  | flat          | swatches           | press squash      |
| E4  | `fieldbook`   | wobble     | pastel            | hand               | paper         | tally rows         | write in          |
| E5  | `switchboard` | arch       | pastel            | humanist           | glow          | lamp buttons       | ring pulse        |
| E6  | `customs`     | squircle   | gradient light    | grotesk            | glass         | toggle switch      | stamp thud        |
| E7  | `catalog`     | leaf       | candy             | flare              | flat          | search field       | focus grow        |
| E8  | `departures`  | pill       | saturated         | din                | flat          | segmented          | shimmer           |
| E9  | `darkroom`    | squircle   | mono-accent dark  | thin               | neumorphic    | action bar         | develop fade      |
| E10 | `gels`        | concentric | neon dark         | geometric          | glow          | chips              | colour cross-fade |
| E11 | `seedpacket`  | zigzag     | pastel            | clarendon          | pattern       | inspector fields   | flap tilt         |
| E12 | `atlas`       | blob       | candy             | humanist           | layered       | map pins           | radar ping        |
| W1  | `print-quote` | notch      | saturated         | didone             | flat          | radio cards        | odometer          |
| W2  | `moon-dial`   | circle     | night dark        | old-style italic   | gradient mesh | dial               | terminator sweep  |
| W3  | `proof-clock` | blob       | pastel            | slab               | flat          | slider             | blob rise         |
| W4  | `row-counter` | circle     | saturated         | rounded            | pattern       | big round button   | spring bounce     |
| W5  | `feed-lamp`   | radius-sm  | mono-accent light | mono               | glossy        | underline tabs     | breathing lamp    |
| W6  | `morse-key`   | pill       | saturated         | mono               | clay          | hold key           | tape slide        |
| W7  | `fret-map`    | radius-md  | duotone           | geometric          | layered       | tap grid           | stagger pop       |
| W8  | `clue-box`    | radius-sm  | mono-accent dark  | transitional serif | flat          | letter cells       | flip wave         |

## 3. Details per piece

### E1 `exposure` · Exposure triangle

- Shape: **pill**. Capsule steppers, 22-24 px cards.
- Palette: **mono-accent light**. Field #E6EAF0 · ink #1F2933 · label #52606D · accent #FF5B14 · accent text #B83A00.
- Type: **rounded**. Ui-rounded stack, 800, numerals 26-34 px, sentence case.
- Surface: **neumorphic**. Raised and inset on one colour, two shadows.
- Control: **stepper**. - / + capsule per value; lock is a switch.
- Motion: **key sinks**. The pressed key flips from raised to inset.

### E2 `setlist` · Setlist for tonight

- Shape: **radius-md**. 14 px cards, round 32 px buttons.
- Palette: **saturated**. Field #FF5CA8 · ink #111111 · card #FFFFFF · lime #C6FF3D · yellow #FFE14A.
- Type: **grotesk**. System-ui 800-900, 16 px rows.
- Surface: **sticker**. 3 px ink outline with a hard 4 px offset shadow.
- Control: **round icon buttons**. Up, down, played, remove as circles.
- Motion: **card lifts**. The focused row moves up-left and its shadow grows.

### E3 `typecase` · Wood-type poster

- Shape: **sharp**. Square sheet, square swatches (sharp 1 of 2).
- Palette: **duotone**. Ink #2B2BFF / #C4161C / #111111 on stock #C8F7DC / #FFF27A / #FFFFFF.
- Type: **condensed display**. Impact stack, uppercase, 44-76 px headline.
- Surface: **flat**. Solid ink block with an offset tint of the same ink, like an overprint.
- Control: **swatches**. Ink and stock squares, one theme signal.
- Motion: **press squash**. The existing press keyframes, 0.5 s.

### E4 `fieldbook` · Field notebook

- Shape: **wobble**. Hand-drawn outlines: 255px 15px 225px 15px / 15px 225px 15px 255px.
- Palette: **pastel**. Note #FFF27A · ink #1B3BFF · tear #C81E4A · tape #FFFFFF at 55%.
- Type: **hand**. Bradley Hand / Segoe Print stack, 700, 18-24 px.
- Surface: **paper**. Sticky note with tape and a folded corner.
- Control: **tally rows**. A + per bird, an underlined field.
- Motion: **write in**. A new row is revealed left to right.

### E5 `switchboard` · Telephone exchange

- Shape: **arch**. Tiles 999px 999px 22px 22px.
- Palette: **pastel**. Field #ECE7FF · tile #FFFFFF · violet #5B3DF5 · ink #241B4B · signals #FFB020 #19C37D #FF4D4F.
- Type: **humanist**. Seravek / Gill Sans stack, 600, 14-15 px.
- Surface: **glow**. Coloured halo around the lamp ring, tile takes the state tint.
- Control: **lamp buttons**. A round jack inside a lamp ring per line.
- Motion: **ring pulse**. The ringing lamp sends rings outwards.

### E6 `customs` · Customs declaration

- Shape: **squircle**. 28 px card, pill fields.
- Palette: **gradient light**. Mesh #FFB3D9 #8FD0FF #8FF0D2 on #EEF0FF · ink #1B1F3B · accent #3B5BFF to #5B5BF0.
- Type: **grotesk**. System-ui 500-700, 13-20 px.
- Surface: **glass**. Frosted card: white at 50%, blur 18 px.
- Control: **toggle switch**. Checkboxes drawn as switches, pill text fields.
- Motion: **stamp thud**. The stamp lands scaled down from 1.6 with a turn.

### E7 `catalog` · Library card catalogue

- Shape: **leaf**. Book cards 4px 20px 20px 4px with a 10 px spine.
- Palette: **candy**. Field #FFFFFF · ink #18181B · spines #FF5A36 #2F5BFF #0FA968 #FFB800 · tints #FFEDE8 #E9EEFF #E3F7EE #FFF5D6.
- Type: **flare**. Optima / Candara stack, 700 titles 17 px.
- Surface: **flat**. Flat colour, no shadow.
- Control: **search field**. One large pill field, results follow typing.
- Motion: **focus grow**. The field ring grows on focus.

### E8 `departures` · Ferry departures

- Shape: **pill**. Capsule rows, segmented capsule.
- Palette: **saturated**. Field #FF8A1F · ink #111111 · rows #FFFFFF · cancelled #B00020.
- Type: **din**. DIN Alternate / Bahnschrift stack, 700, times 26 px.
- Surface: **flat**. Flat colour.
- Control: **segmented**. Three harbours in one capsule.
- Motion: **shimmer**. A light sweep over the rows while loading.

### E9 `darkroom` · Darkroom trays

- Shape: **squircle**. 26 px wells, pill buttons.
- Palette: **mono-accent dark**. Field #0A0000 · wells #140101 to #2B0403 · red #FF3B2F · soft red #FF6A5E.
- Type: **thin**. Helvetica Neue / Segoe UI Light stack, 300, 15-18 px. Deviation (D68): in the tray labels at 360 px the built example uses 14 px, so that "Developer" stays whole in a narrow tray.
- Surface: **neumorphic**. Inset wells lit from below by a red rim.
- Control: **action bar**. One filled primary pill and two quiet ones.
- Motion: **develop fade**. The picture gains density with --d.

### E10 `gels` · Lighting plot

- Shape: **concentric**. Nested 40 / 30 / 22 px zones.
- Palette: **neon dark**. Field #07070D · zone #0E0E18 · gels #FF5D73 #57C7FF #FFD166 #8AFF9C · text #F4F4FF.
- Type: **geometric**. Futura / Century Gothic stack, 500-600, 15-17 px.
- Surface: **glow**. Neon tube ring and bloom in the gel colour.
- Control: **chips**. A filled chip cycles the gel.
- Motion: **colour cross-fade**. Ring, bloom and actor fade to the new gel.

### E11 `seedpacket` · Seed packet

- Shape: **zigzag**. Pinked top edge by a conic mask.
- Palette: **pastel**. Field #EAF8EE · packet #FFFFFF · inks #0E7A46 #C92A1E #6D28D9 · text #14321F.
- Type: **clarendon**. Superclarendon / Bookman stack, 700, name 30 px.
- Surface: **pattern**. Scattered seed dots in two colours.
- Control: **inspector fields**. Select, number and text in a property panel.
- Motion: **flap tilt**. The packet tilts from its top corner when torn.

### E12 `atlas` · Pocket atlas

- Shape: **blob**. Island 58% 42% 55% 45% / 48% 60% 40% 52%.
- Palette: **candy**. Sea #8FDBFF · isle #8EE06B · sand #F7E8A6 · pin #FF5A47 · ink #0B2B3A · sheet #FFFFFF.
- Type: **humanist**. Seravek / Gill Sans stack, 600, 14-20 px.
- Surface: **layered**. Cut-paper layers with stepped shadows.
- Control: **map pins**. Place labels with a pin, links of the router.
- Motion: **radar ping**. The current place sends a ring.

### W1 `print-quote` · Print-run quote

- Shape: **notch**. Ticket with two bites and a perforation.
- Palette: **saturated**. Field #1E3BFF · text #FFFFFF · chosen #FFE94A · deep #0A1466.
- Type: **didone**. Didot / Bodoni stack, numeral 96-120 px.
- Surface: **flat**. Flat colour.
- Control: **radio cards**. One card per price break.
- Motion: **odometer**. The price digits roll to the new value.

### W2 `moon-dial` · Moon phase

- Shape: **circle**. Ring dial, sphere, round buttons.
- Palette: **night dark**. Sky #0B1030 to #3B1E73 · moon #FFF4CF · gold #FFC857 · text #E9E6FF.
- Type: **old-style italic**. Iowan Old Style / Palatino stack, italic 28 px.
- Surface: **gradient mesh**. Night sky from three radial fields, stars.
- Control: **dial**. A ring of 29 days with one handle.
- Motion: **terminator sweep**. The shadow edge glides across the disc.

### W3 `proof-clock` · Sourdough schedule

- Shape: **blob**. Dough 62% 38% 46% 54% / 55% 48% 52% 45%.
- Palette: **pastel**. Field #FFD9CF · berry #D81B60 · yolk #FFC93C · plum #3A0D2E · cream #FFF8EC.
- Type: **slab**. Rockwell stack, 700, timer 40 px.
- Surface: **flat**. Flat cut-out shapes.
- Control: **slider**. Kitchen temperature.
- Motion: **blob rise**. The dough breathes and grows per stage.

### W4 `row-counter` · Knitting row counter

- Shape: **circle**. One 170 px round button, round repeat dots.
- Palette: **saturated**. Field #12B5A6 · button #FFF9EE · coral #FF6B57 · ink #06302C · lip #0A7F74.
- Type: **rounded**. Ui-rounded stack, 900, numeral 72 px.
- Surface: **pattern**. Knit chevrons from four gradients.
- Control: **big round button**. One press, one row.
- Motion: **spring bounce**. The button dips and springs back.

### W5 `feed-lamp` · Status lamp for a JSON feed

- Shape: **radius-sm**. 10 px device plate.
- Palette: **mono-accent light**. Plate #FFFFFF to #E6E9EE, lit by the lamp · ink #111827 · meta #4B5563 · lamp #19C37D / #FFB020 / #FF4D4F / #C026D3.
- Type: **mono**. Ui-monospace stack, 700 state 17 px, meta 12.5 px (mono 1 of 2).
- Surface: **glossy**. Glass dome with a highlight, bezel and screws.
- Control: **underline tabs**. The four feeds as tabs, a round refresh.
- Motion: **breathing lamp**. The lamp breathes while it waits.

### W6 `morse-key` · Telegraph key

- Shape: **pill**. One wide capsule key, capsule tape, dots and dashes as pills.
- Palette: **saturated**. Field #6D28D9 · text #FFFFFF · key #FFF6E5 · key ink #2E1065 · lip #4C1D95 · live mark #FF8A1F.
- Type: **mono**. Ui-monospace stack, 700, letters 40 px (mono 2 of 2).
- Surface: **clay**. Inflated key and tape with inner light and a soft lip.
- Control: **hold key**. Press and hold: short is a dot, long a dash.
- Motion: **tape slide**. Marks enter from the right and the tape moves on.

### W7 `fret-map` · Fretboard scale map

- Shape: **radius-md**. 16 px board, round notes.
- Palette: **duotone**. Board #FFFFFF · notes #3B2BFF · root #FF2E93 · wire #C9CDD6 · ink #1A1A2E.
- Type: **geometric**. Futura / Century Gothic stack, 500-700.
- Surface: **layered**. A floating board, raised notes.
- Control: **tap grid**. Frets as cells, key chips above.
- Motion: **stagger pop**. Notes pop in fret by fret.

### W8 `clue-box` · One crossword clue

- Shape: **radius-sm**. 8 px cells and buttons.
- Palette: **mono-accent dark**. Field #18181B · cell #2A2A2E · text #FAFAFA · yellow #FACC15 · wrong #FB7185.
- Type: **transitional serif**. Charter / Cambria stack, 700 clue 24 px.
- Surface: **flat**. Flat colour.
- Control: **letter cells**. One cell per letter, arrows move.
- Motion: **flip wave**. Solved letters flip in a wave.

## 4. Checks

Pairwise, computed over all 190 pairs: 140 pairs share no axis value, 48 share one, 2 share two, none shares three or more.

Pairs that share two values, the allowed maximum:

- `departures` and `print-quote`: palette and surface.
- `departures` and `morse-key`: shape and palette.

| Limit                            | Allowed | Used | Pieces                                      |
| -------------------------------- | ------- | ---- | ------------------------------------------- |
| Sharp corners                    | 2       | 1    | `typecase`                                  |
| Dark stage                       | 5       | 4    | `darkroom`, `gels`, `moon-dial`, `clue-box` |
| Monospace as the main type       | 2       | 2    | `feed-lamp`, `morse-key`                    |
| Small uppercase monospace labels | 2       | 0    | none                                        |

How often a value is used (values used once are not listed):

- Shape: 13 values for 20 pieces. pill ×3 (exposure, departures, morse-key); radius-md ×2 (setlist, fret-map); squircle ×2 (customs, darkroom); blob ×2 (atlas, proof-clock); circle ×2 (moon-dial, row-counter); radius-sm ×2 (feed-lamp, clue-box)
- Palette: 9 values for 20 pieces. saturated ×5 (setlist, departures, print-quote, row-counter, morse-key); pastel ×4 (fieldbook, switchboard, seedpacket, proof-clock); mono-accent light ×2 (exposure, feed-lamp); duotone ×2 (typecase, fret-map); candy ×2 (catalog, atlas); mono-accent dark ×2 (darkroom, clue-box)
- Type: 15 values for 20 pieces. rounded ×2 (exposure, row-counter); grotesk ×2 (setlist, customs); humanist ×2 (switchboard, atlas); geometric ×2 (gels, fret-map); mono ×2 (feed-lamp, morse-key)
- Surface: 11 values for 20 pieces. flat ×6 (typecase, catalog, departures, print-quote, proof-clock, clue-box); neumorphic ×2 (exposure, darkroom); glow ×2 (switchboard, gels); pattern ×2 (seedpacket, row-counter); layered ×2 (atlas, fret-map)
- Control: 20 values for 20 pieces. Every piece has its own.
- Motion: 20 values for 20 pieces. Every piece has its own.

The five saturated fields are five different hues: pink (`setlist`), orange (`departures`), cobalt (`print-quote`), teal (`row-counter`), violet (`morse-key`).

Contrast, two ways. Declared colours: 100 pairs of text and background from the palettes above, lowest 4.69:1 (not kept, D64). Rendered page: every text node of every mock against the pixels behind it in Chromium, 286 boxes at 1280 px and 287 at 390 px, lowest 4.69:1 (not kept, D64). Two ornaments marked `aria-hidden` are left out: the flower of `seedpacket` and the compass star of `atlas` (the star is 3.09:1).

Lowest measured ratio per piece at 1280 px: `exposure` 4.73, `setlist` 14.50, `typecase` 5.31, `fieldbook` 4.87, `switchboard` 10.61, `customs` 5.04, `catalog` 6.68, `departures` 7.33, `darkroom` 4.88, `gels` 7.72, `seedpacket` 5.40, `atlas` 6.07, `print-quote` 4.88, `moon-dial` 8.97, `proof-clock` 4.69, `row-counter` 5.58, `feed-lamp` 6.05, `morse-key` 5.50, `fret-map` 5.07, `clue-box` 6.91.

Also checked in the sheet: no horizontal scroll at 1280 px and 390 px, no text below 12 px, no target below 24 px, a visible outline on each of the 120 focus stops reached with Tab, and no running animation with `prefers-reduced-motion: reduce` (three run without it: the ring of `switchboard`, the dough of `proof-clock`, the caret of `morse-key`).

## 5. Font stacks

System fonts only. The first name that exists on the device wins, so the look shifts between systems; the captures were made in Chromium on macOS only.

| Type value         | Stack                                                                                                                                    |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| grotesk            | `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`                                                      |
| thin               | `'Helvetica Neue', 'Segoe UI', Roboto, 'Noto Sans', Arial, sans-serif at weight 300`                                                     |
| humanist           | `Seravek, 'Gill Sans Nova', 'Gill Sans', Ubuntu, Calibri, 'DejaVu Sans', sans-serif`                                                     |
| flare              | `Optima, Candara, 'Noto Sans', 'Segoe UI', sans-serif`                                                                                   |
| geometric          | `Futura, 'Century Gothic', 'Avenir Next', Avenir, 'URW Gothic', sans-serif`                                                              |
| rounded            | `ui-rounded, 'SF Pro Rounded', 'Arial Rounded MT Bold', 'Hiragino Maru Gothic ProN', Quicksand, Comfortaa, Manjari, Calibri, sans-serif` |
| condensed display  | `Impact, Haettenschweiler, 'Franklin Gothic Bold', 'Arial Narrow Bold', 'Arial Black', sans-serif`                                       |
| din                | `'DIN Alternate', Bahnschrift, 'DIN Condensed', 'Franklin Gothic Medium', 'Roboto Condensed', 'Arial Narrow', sans-serif`                |
| slab               | `Rockwell, 'Rockwell Nova', 'Roboto Slab', 'DejaVu Serif', 'Sitka Small', serif`                                                         |
| clarendon          | `Superclarendon, 'Bookman Old Style', 'URW Bookman', 'URW Bookman L', 'Georgia Pro', Georgia, serif`                                     |
| old-style italic   | `'Iowan Old Style', 'Palatino Linotype', Palatino, 'URW Palladio L', P052, 'Book Antiqua', serif`                                        |
| didone             | `Didot, 'Bodoni MT', 'Bodoni 72', 'Noto Serif Display', 'URW Palladio L', Sylfaen, serif`                                                |
| transitional serif | `Charter, 'Bitstream Charter', 'Sitka Text', Cambria, Georgia, serif`                                                                    |
| hand               | `'Bradley Hand', 'Segoe Print', 'Chalkboard SE', 'Comic Sans MS', 'Comic Neue', cursive`                                                 |
| mono               | `ui-monospace, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace`                                                                 |

Not verified: how each stack resolves on Windows, Android and Linux, and in Firefox and WebKit. Known from the stacks themselves: Chromium on macOS has no `ui-rounded`, so the captures show Arial Rounded MT Bold; Windows without Office has no rounded face and falls to Calibri; Android has none of the display faces and falls to its default sans or serif.

## 6. Anti-patterns: devices of the first build that must not come back

Seen in the captures of the built examples (not kept, D64) and counted in the twelve sources `packages/site/src/demos/*.ts` on `feature/55-examples-requests-routes` (2465f22):

- A 1 px outlined rectangular button with no radius ("Borrow", "Reset"). `1px solid` is in 8 of the 12 sources and `border-radius: 0` in 6 of them, 10 times. A button is filled, or it carries the shape language of its piece.
- Small uppercase letter-spaced monospace labels above a value ("APERTURE", "PASSPORT, TWO LETTERS AND SIX DIGITS", "TAPE 10"). `text-transform: uppercase` is in 8 of the 12 sources and `letter-spacing` in 11. Labels are sentence case in the type of the piece, 12.5 px or more.
- A beige, cream or parchment paper background: `#f7eed6`, `#f4ecd6`, `#f1efe6`, `#f6f1e4`, `#f6efdc`, `#f3e7c6`, `#eee3c9`, `#d2b48c` are all in the sources. The one paper surface left is a lemon sticky note.
- A dark panel as the default stage. Dark is a choice with a reason (light is the subject in `gels`, `darkroom`, `moon-dial`), at most five times.
- A muted vintage palette: olive, rust, sepia, bottle green, LCD grey-green. Every palette names its hex values, and no two saturated fields share a hue.
- Thin 1 px rules and double rules as the main structure (card edges, fieldset boxes, table lines). Structure comes from fill, radius, shadow or spacing.
- One control type for everything: a row of small text buttons. Each piece has a primary control of its own.
- Monospace as the voice of a piece that shows no code or signal: a monospace stack is in 9 of the 12 sources. Two pieces may use it.
- A retro object as the whole idea of a look (LCD, enamel panel, index card, carbon paper, blueprint, e-ink, brass). The object may stay in the name; the look is a current interface.
- The same stage padding everywhere: `padding: 18px` is in 10 of the 12 sources. Spacing and radius belong to the shape language of the piece.
- Zero radius by default. Sharp corners appear in one piece, where the sheet of a poster is the subject.
- Allowed and not counted as monospace: a `code` element rendered in the UA monospace to show code (the `.tag` of `seedpacket`).

## 7. Not verified

- Any engine other than Chromium, and any system other than macOS.
- The looks in the real components: the mocks are static HTML and CSS, not ECMact.
- The `backdrop-filter` of `customs` in Firefox and WebKit, and the conic and radial masks of `seedpacket`, `print-quote` and `moon-dial` there.
- Contrast in states the mocks do not show (errors, waiting, disabled, the other ink and stock pairs of `typecase` beyond the seven computed).
- Whether the owner reads the twenty as different: that is his judgement of the captures.
