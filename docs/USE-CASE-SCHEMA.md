# Use Case Data Schema

Implements the content model of PRD section 5 and the data contract of section 6.

- Data file: `src/data/use-cases.json` (a JSON array, one entry per use case).
- Shared by the Library tab and the game. Map objects reference a use case by `id`.
- Adding or editing a use case means editing this JSON only.
- Validate with `npm run validate` (`scripts/validate-use-cases.mjs`). It fails on missing or empty fields, invalid enum values, duplicate `id`s and duplicate `rewardId`s.

## Conventions

- **Bilingual text** (`{ "en": "...", "nl": "..." }`): both languages are required and non-empty.
- **Prompt fill-in fields** are written as `{{name}}` and highlighted in the UI. Use the same names in EN and NL.
- `id` and `rewardId` are lowercase kebab-case.

## Fields

| Field | Type | PRD item |
| --- | --- | --- |
| `id` | string, unique | Used by map objects and deep links |
| `icon` | string | Icon |
| `rewardId` | string, unique | Reward id (visual item unlocked) |
| `title` | bilingual text | Title |
| `summary` | bilingual text | One-line summary |
| `meta.department` | `finance`, `hr`, `sales`, `marketing`, `it`, `operations`, `legal`, `general` | Department chip |
| `meta.role` | string | Role chip |
| `meta.workload` | `low`, `medium`, `high` | Workload chip |
| `meta.credits` | integer >= 0 | Credits chip |
| `meta.executionMode` | `chat`, `local`, `cloud` | Execution mode chip |
| `meta.capability` | string | Capability chip |
| `meta.collaborationScope` | `individual`, `team`, `organization` | Collaboration scope chip |
| `prompt` | bilingual text | The prompt (with `{{fields}}`) |
| `seeItRun` | `{ en: string[], nl: string[] }`, non-empty | See it run (fictional walkthrough steps) |
| `fitIntoWork` | bilingual text | Fit it into your work |
| `howItWorks` | bilingual text | How it works |
| `whyCowork` | bilingual text | Why Cowork |

## Example

See `src/data/use-cases.json` for sample entries across several departments plus `general`.
