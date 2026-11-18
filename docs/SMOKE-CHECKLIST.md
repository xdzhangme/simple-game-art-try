# Manual smoke checklist

Run against the deployed GitHub Pages site (or `npm run preview`) in a desktop browser. Open the developer console first and keep it visible.

## Load
- [ ] On first visit a department picker (and then a short tutorial) appears; Skip/Close dismisses each.
- [ ] Page loads with no errors or warnings in the console.
- [ ] Header shows the company badge, name and the Disclaimer button; fonts render as pixel/legible fonts (no fallback serif).
- [ ] The office map renders on the canvas and the player is visible.

## Tabs
- [ ] Four tabs are present: Tutorial Game, Use Case Library, How to start, Responsible AI.
- [ ] Clicking each tab shows only its panel; the selected tab is highlighted.
- [ ] How to start and Responsible AI show their steps and text.
- [ ] Disclaimer button opens the dialog; Close dismisses it.

## Language
- [ ] Open the menu in the bottom bar and switch to Dutch: tabs, bottom bar, library cards and info pages are all translated.
- [ ] Reload the page: Dutch is still selected.
- [ ] Switch back to English.

## Game loop
- [ ] Move with arrow keys / WASD; the player cannot walk through walls or furniture.
- [ ] Walk next to an object and press E: the use case card opens (title, prompt, steps).
- [ ] Copy prompt works; the prompt placeholders are shown.
- [ ] Press "I finished! Unlock reward": the case is marked finished, a reward appears in the room, progress counter increases.
- [ ] Tasks panel shows progress, unlocked rewards and the next recommended case.
- [ ] Map button shows the office map; the department picker shows an arrow to the chosen room.
- [ ] Reload the page: progress and rewards are kept.

## Reset
- [ ] Menu > Reset progress shows a confirmation.
- [ ] Cancel keeps all progress.
- [ ] "Yes, reset" clears completed cases and rewards; the counter returns to 0.

## Deep link
- [ ] In the Use Case Library, click "Open in game" on a card.
- [ ] The Tutorial Game tab opens, the player stands next to the matching object and its card is open.

## Final
- [ ] Console still has no errors after all steps above.
