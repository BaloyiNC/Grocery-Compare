# QA record (sprint 8)

## Checked by the automated tests (`npm test`)

Adding, quantities and the 99 cap, focus staying on the button you pressed, saved state, damaged saved state, store totals, missing items, loyalty totals, expired specials, branch search, nothing nearby, old data warning, names with quotes or tags in them, the remove button, screen reader labels, and speed with about 4,000 products (the page draws 60 cards at a time).

## Colour contrast

Ratio of text colour to the colour behind it. WCAG AA asks for 4.5 or more for small text.

| Pair | Ratio | Result |
| --- | --- | --- |
| White text on accessible orange `#a93600` (buttons, chips) | 6.53 | Pass |
| Accessible orange `#a93600` text on white (list badge) | 6.53 | Pass |
| Accessible green `#176b2c` on white (cheapest price) | 6.61 | Pass |
| Accessible green `#176b2c` on a grey card ("Save up to") | 6.07 | Pass |
| Purple special price on white | 5.36 | Pass |
| Grey caption on white | 5.33 | Pass |
| Grey caption on a grey card | 4.89 | Pass |
| Main text on white | 13.39 | Pass |
| Dark mode: green on the page | 8.91 | Pass |
| Dark mode: purple on the page | 6.74 | Pass |
| Dark mode: grey caption on a card | 5.38 | Pass |
| Dark mode: main text on the page | 16.16 | Pass |
| Dark mode: white text on accessible orange `#a93600` | 6.53 | Pass |
| Dark mode: amber heading text and keyboard focus `#ffb000` on the page | 9.88 (page), 8.26 (card) | Pass |

Light mode uses the darker accessible orange and green for actions, badges, cheapest prices and savings. Dark mode uses a bright green token that retains contrast on dark surfaces. Keyboard focus uses a separate amber outline in dark mode.

## Postponed manual checks (not performed yet)

- [ ] Phone widths: 360, 390 and 768 px in the Chrome device toolbar, then at least two real phones
- [ ] Chrome, Safari, Firefox and Edge
- [ ] Keyboard only: Tab through the page, add an item, change its quantity, remove it, switch a store chip, open the branch panel
- [ ] Screen reader: one quick pass with VoiceOver or TalkBack on the add button, quantity buttons and chips
- [ ] Offline: load the page once, switch off the network, reload
- [ ] Cleared storage: clear site data and reload
- [ ] Use my location on a real phone, once allowed and once denied
