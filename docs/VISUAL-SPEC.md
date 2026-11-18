# Visual Spec: Cowork Tutorial Game (Pixel Office)

Status: Draft v4 (step 2), art direction approved by the user, awaiting final confirmation to commit. Companion: `docs/PRD.md`.
**Art target: `docs/visual/art-direction-pixel.png`** (original concept image generated with an AI image tool from a text description of the style; the reference artwork was not used as an input). Layout/UI sample: `docs/visual/sample.png` (page with site chrome: `docs/visual/sample.html`).
References: a pixel hospital floor plan (primary: structure and style), a cozy multi-room pixel house, Pixel Agents (pixel-agents.com). Inspiration only. All art and code are our own; the reference artwork is never copied or traced.

## 1. Scope of the pixel style

- The site chrome (header, language toggle, Disclaimer, tabs) stays the normal green site UI.
- **Everything inside the Tutorial Game tab is pixel art**: map, use case card panel, bottom buttons, dialogs, icons, borders, progress and reward UI.
- **Colors inside the game are theme tokens, not fixed.** No green is baked into the game; the sample uses a neutral blue-grey default. Each customer can recolor via `theme.json`.

## 2. Layout (from the user's sketch)

```
Site header + tabs (normal UI)
+--------------------------------------+--------------+
| Game map viewport (~68%)             | Use case     |
| camera follows the player            | card (~32%)  |
+--------------------------------------+--------------+
| [Tasks] [Map] [Tutorial] [Menu / EN|NL]   (pixel buttons)
```

- Desktop only. The map is a portrait world shown through a viewport that scrolls with the player at an integer scale (2x) with `image-rendering: pixelated`. The Map button opens a full-map overview and a room jump list.
- Card column: idle shows progress, unlocked rewards and the next recommended case; on `E` near an object it shows the full use case card (title bar, chips, prompt with highlighted fill-ins, Copy / Try in Cowork / Open in game, collapsible steps 2-4, "I finished").
- Bottom buttons: Today's tasks (progress), Map, Tutorial, Menu (language EN/NL, sound, reset progress).

## 3. Pixel style

- **Final art target** is `art-direction-pixel.png`: chunky visible pixels, hard edges, no anti-aliasing or gradients, limited palette, flat shading. It is a direction, not a shippable asset sheet: production tiles and props are redrawn or cleaned up as true pixel art in that style. `sample.png` is the layout mockup (art target map + card + buttons).
- 16x16 tiles, thin blue-grey outline, 1 px top highlight and 1-2 px bottom shade on props.
- Same structure as the floor-plan reference: irregular portrait building outline, top lobby, stairwell, one narrow central corridor, rooms of different sizes and offsets on both sides, open doorways, thick pale walls with a tinted back-wall face (2 tiles) and a wainscot band, subtle tile grid floors.
- Dense decoration: rugs with borders, floor lamps, bins, water coolers, boxes, book piles, coat racks, wall frames, windows, clocks, posters, plants, desks with monitors, shelves, sofas, vending machines. People sit or stand at desks.
- UI panels and buttons use the same palette: pale panel, thin slate outline with inner white line, bottom bevel, no rounded corners, no gradients.
- **Text must be readable.** Do not bake text into the map PNG except short room signs. Card and button text is real HTML text in bundled OFL fonts, minimum 14 px on screen, supports lowercase and Dutch characters. Pixel text (titles, buttons, labels, signs) uses Jersey 10 (`docs/visual/Jersey10.ttf`); Pixelify Sans is not used because its "f" and "5" are misread. Long card and dialog text (prompt block, descriptions) uses Atkinson Hyperlegible (`docs/visual/AtkinsonHyperlegible-*.ttf`) at 16 px or larger, line height 1.7, high contrast, ligatures disabled. The pixel frame stays around the card. Scope rule: a player's required tasks are their own department's cases plus the general cases; other departments are optional, encouraged exploration with bonus rewards. The UI mock lives in `docs/ui/index.html`. Room signs use a pixel font drawn into the sprite.

## 4. Palette (theme tokens, overridable per customer)

| Token | Default | Use |
| --- | --- | --- |
| `outline` | `#7b88a3` | Walls and panel outlines |
| `wall` | `#f2f5f8` | Wall body, panel highlight |
| `floor` / `grid` | `#c8d7df` / `#c3d1da` | Corridor and default floor |
| `accent` | `#6f86a8` (dark `#4a5d7c`) | Room signs, wainscot, card title bar, primary button |
| `panel` / `panelDark` | `#eaf0f4` / `#c3d1da` | Card panel, buttons |
| `marker` | `#e8b84a` | Use case marker, prompt highlights |
| `done` | `#4fa95c` | Completed check |
| `locked` | `#b2bac6` (outline `#7a8498`) | Locked silhouettes |

Room floor tints (soft, one per room, from config): mint `#c9e8d8`, lavender `#ddd3f0`, blush `#f2cfcf`, sky `#c4dbf2`, butter `#f0e2b8`, sage `#cbe3cf`, peach `#f1d9c3`, ice `#c4e1ec`, sand `#e0d9bf`, grey `#d6dde2`. Each room also has its own floor pattern (`floor` in the room data: grid, checker, dots, tiles8, stripes, bands, planks, hatch, diamond, zigzag), a wall sign plaque with a room icon, and its own furniture set and desk layout.

## 5. Character

One default character, 16x24 px, small head with a dark outline (our earlier procedural version, not the larger concept-image figures), 4 directions x 3 walk frames (+ idle). Later: palette swaps as look rewards.

### 5.1 Ambient NPCs

Decorative NPCs (human coworkers, robots, hybrid creatures) idle or wander in rooms. They never block the player (not solid) and keep out of interaction slots, objects and doors.

- Data: `src/data/npcs.json` lists NPCs by room id and look only; tiles are chosen at load time from each room's free floor, so NPCs follow layout changes.
- Sprites: `src/art/npc-sprites.js` generates them procedurally (humans 16x24, 4 directions, walk frames). Outfits, robots and creatures use theme tokens; skin and hair use fixed natural tones.
- Humans: 7 skin tones, hair styles (short, bald, long, braids, bun, curly, scarf), builds, heights, glasses, beards, and mobility aids (wheelchair, cane, white cane, prosthetic leg or arm). All are depicted with equal dignity and no stereotypes.
- Wandering is disabled under `prefers-reduced-motion`.
- Created programmatically; no image-generation API key was available, and third-party references were used as ideas only.
## 6. Map and rooms

Data-driven tile map (sample has 15 spaces):
- 9 department rooms (5 use cases each; names, tints and decor from config, department names not fixed yet). Sample: Finance, HR, Sales, Legal, Ops, Marketing, IT, Procurement, Service.
- 1 big General meeting room (10 general cases).
- Tip rooms showing Cowork tips: Reception/lobby, Print, Open workspace, Lounge/pantry (more can be added: restaurant, etc.).
- About 55 use case objects. The plan can grow by adding rooms along the corridor.

## 7. Rewards and states

Categories: furniture, plants, wall decor, small appliances. Each use case owns one reward item placed in its room.
- Locked: gray silhouette (`locked`) at its final position.
- Unlocked: full color with a short pixel sparkle.
- Room decor progression: rooms gain extra decoration (rugs, lamps, frames) as their progress grows.

## 8. Use case markers (room-level)

- Room sign shows progress (e.g. `FINANCE 2/5`).
- Optional first-run department pick with a guide arrow to that room's door.
- Inside the current room: yellow `!` bubble = not done, green check = done. Other rooms show no blinking markers.
- `E` prompt only within 1 tile of an object.

## 9. Customization

Per customer without code changes: `theme.json` (palette tokens, room tints), room and department names, company name/badge, use case and reward data. Sprites are drawn in a limited indexed palette so the theme can recolor them; the sprite sheet can also be replaced.

## 10. Out of scope

Game code, final production assets, mobile layout, animations beyond walk cycle and unlock sparkle.


