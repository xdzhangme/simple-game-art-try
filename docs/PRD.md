# PRD: Cowork Tutorial Game (Pixel Office)

Status: Draft v1 (step 1 of the dev flow: PRD -> visuals -> front-end confirmation -> issues -> development)

## 1. Goal

A lightweight, reusable, static website that helps employees of customer companies
discover and practice Cowork through a 2D top-down pixel-art office game.
The author delivers Cowork to customer companies; each delivery can be customized by
swapping content (and later, the map) without changing game code.

- Not a competitive or level-based game. It is an exploration + learning game.
- Primary value: practice real work cases and earn visual rewards.
- Priority: fast time to a working result; small, simple repo.

## 2. Player

Employees of a customer company, with mixed roles and little prior Cowork experience.
The author (a Cowork delivery lead) is the content owner and operator.

## 3. Product Shape

A single-page static site with a header (company badge + name, EN/NL toggle, Disclaimer
button) and four tabs:

1. **Tutorial Game** (first/default tab): the pixel-office game.
2. **Use Case Library**: all use cases as full, readable cards.
3. **How to start**: static content.
4. **Responsible AI**: static content.

The Library is the content source. It serves two purposes: readable directly by users,
and shared as the data that drives the game.

## 4. Core Loop

1. Player walks around the office map (free exploration; a light guide points to a first spot).
2. Player presses **E** at an interactable object to open a use case.
3. The **full use case card** is shown (same card as in the Library).
4. Player copies the prompt / opens Cowork, tries it in the real product.
5. Player clicks **"I finished"** (self-reported; completion cannot be verified).
6. A visual reward is unlocked and appears in the office (decor, furniture, plants, etc.).

Guidance: first-time players get a short guided path; afterwards they can explore freely.

## 5. Use Case Card (content model)

Fields per card:

- Title, one-line summary, icon
- Metadata chips: department, role, workload, credits, execution mode, capability, collaboration scope
- **The prompt**: text with highlighted fill-in fields; buttons **Copy prompt**, **Try in Cowork**, **Open in game**
- **See it run**: simulated/fictional run walkthrough
- **Fit it into your work**: adapt the prompt to the user's job
- **How it works**: tailor, vary, turn into a skill
- **Why Cowork**: short rationale
- Bilingual text (EN/NL)
- Reward id (which visual item the use case unlocks)

## 6. Library -> Game Data Contract

- One JSON entry per use case, in a single data file shared by the Library tab and the game.
- Game object placement on the map references a use case by id.
- **Open in game** switches to the Tutorial Game tab and moves focus to that use case's object.
- Adding or editing a use case = editing JSON only; no code change.
- The Library lists all use cases; the map places some or all of them as interactables.

## 7. Rules -> Entities / States / Interactions

| Concept | Description |
| --- | --- |
| Player | Moves with arrow keys/WASD, interacts with E |
| Interactable | Map object bound to a use case id |
| Use case state | `new` -> `completed` (self-reported) |
| Reward | Visual item bound to a use case; locked -> unlocked, rendered in the office |
| Progress | Completed use case ids stored in `localStorage` |

No win/lose condition. Progress indicator: number of use cases completed and rewards unlocked.

## 8. MVP Scope

- Single map (tile-based, data-driven JSON), one player character
- Movement, collision, E-key interaction
- Full use case card view inside the game
- Self-reported completion and reward unlock, persisted in `localStorage`
- Library tab with all use cases, shared JSON data, "Open in game" deep link
- EN/NL language toggle
- Header, Disclaimer, How to start, Responsible AI as static content
- Static deployment (no backend)

## 9. Later (not MVP)

- Multiple maps / per-customer map themes
- Branding per customer (name, badge, colors) via config
- Additional reward types (character looks, new rooms, badges)
- Optional feedback export

## 10. Non-Goals

- Backend, accounts, server-side progress
- Real verification of completion
- Multiplayer
- Combat or level-based gameplay
- Map editor
- More than two languages, more than one map in v1

## 11. Constraints

- Lightweight: simple game, few files, no heavy frameworks; fast to build.
- Existing prototype (branch `xdzhangme-pixel-office-template`: Vite + Canvas, JSON map, E-key interaction, `src/rules.js` hook) is a technical reference, not final.
- All repository documentation is English.

## 12. Open Questions (to resolve in later steps)

- Visual style, character, reward art (step 2: visuals)
- Exact tab layout and card rendering in-game (step 3: front-end confirmation)
- Number of initial use cases and reward list (content from the Use Case Library effort)
