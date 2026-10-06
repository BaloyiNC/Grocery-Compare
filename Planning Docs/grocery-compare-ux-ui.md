# Grocery Compare: UX and UI Guide

This document explains how the Grocery Compare website is designed and how the front end is built, so the data side can plug into it easily. The front end is three files: `index.html`, `style.css` and `script.js`. It currently runs on sample prices.

## 1. The goal

People want to know where their whole shopping list is cheapest, not just where one item is cheapest. The design is built around that one question. Everything on the page either helps someone build a list or helps them understand which store, or which mix of stores, saves them the most money.

The app compares Checkers, Pick n Pay, Spar and Woolworths. It is designed mobile first because most people will use it on their phones while shopping, and it expands into a full website layout on a computer.

## 2. User flow

The flow has three steps. First, the user searches or browses for an item and taps the plus button to add it. Second, the list panel updates instantly and shows the total at each store, with the cheapest store marked. Third, the user can read the "Split your shop" suggestion, which shows what they would pay if they bought each item at its cheapest store, then copy the list to send to someone or take to the shops.

## 3. Page layout

The page has five parts.

**Top bar.** Sticky at the top. It holds the logo and a "My list" button with a count badge. The button jumps to the list panel.

**Hero.** A large two tone headline, one short line of explanation, and one big search box. Search is the main action, so nothing competes with it.

**Controls.** Category chips (All, Dairy, Bakery, Pantry, Meat), a sort dropdown (Name A to Z, Biggest saving, Lowest price), and store chips that let the user choose which stores to compare. At least one store always stays selected.

**Product grid.** One card per product. Each card shows the name, size and category, a plus button to add it, a price row for each selected store, the unit price in small text (for example R17.50/L), and a "Save up to R..." line. The lowest price is highlighted in green.

**List panel.** On a computer it sits on the right and stays in view while scrolling. On a phone it moves below the products. It shows the items with quantity buttons, the cheapest single store, totals for every store with the difference from the cheapest, the split shop suggestion, and a Copy list button.

## 4. Design system

The style is inspired by the Foodnoms design system: a bright white page, soft grey cards, very rounded shapes and a flat look with no shadows.

| Token | Value | Used for |
| --- | --- | --- |
| Ember Orange | `#ff5406` | Buttons, active chips, active add button, the word "My" in the list title |
| Verdant Green | `#00b33f` | Cheapest prices, savings, the word "Compare" in the main headline |
| Graphite | `#2f2f2f` | Main text |
| Fog | `#f5f5f5` | Card and input backgrounds |
| Paper White | `#ffffff` | Page background, price rows inside cards |
| Store dots | `#00a9dd` Checkers, `#5856de` Pick n Pay, `#bd4be5` Spar, `#2f2f2f` Woolworths | Small colored dot next to each store name |

Corner radius is 26px on every card, button, chip and input. Please keep it consistent. The font is DM Sans (weights 500, 600 and 700), which stands in for the paid font used by the original style. The page headline uses 60px bold on desktop and scales down on phones, section titles are 22px bold, body text is 17px, and small captions are 12 to 14px. Spacing uses steps of 8px. The maximum page width is 1200px.

A few rules keep the look clean. Use no box shadows and no gradients. Do not put colored text on a colored background. Use green only for good news such as the cheapest price and savings, and orange only for actions. Dark mode is built in and follows the user's device setting through CSS variables at the top of `style.css`.

## 5. Features included

| Feature | What it does |
| --- | --- |
| Search | Filters products as the user types |
| Category filter | Shows one category at a time |
| Sort | Name, biggest saving, or lowest price |
| Store selector | Compares only the stores the user picks |
| Unit prices | Shows price per litre, kg, 100g or egg so different sizes can be compared fairly |
| Shopping list | Add, remove and change quantity |
| Store totals | Total per store, cheapest highlighted, extra cost shown for the others |
| Split your shop | Total if each item is bought at its cheapest store, with a list of what to buy where |
| Saved list | The list is kept in the browser with localStorage, so it survives a refresh |
| Copy list | Copies the list and store totals as plain text |

## 6. What the data side needs to provide

The page reads one array called `I` at the top of `script.js`. Each product looks like this:

```js
{
  id: 1,                    // unique number for the product
  n: "Full cream milk",     // name shown on the card
  c: "Dairy",               // category, must match one of the CATS values
  s: "2 L",                 // size label shown to the user
  d: 2,                     // number used to work out the unit price (price divided by d)
  u: "/L",                  // unit label shown after the unit price
  p: {                      // current shelf price for each store, in rands
    "Checkers": 34.99,
    "Pick n Pay": 35.99,
    "Spar": 36.49,
    "Woolworths": 42.99
  }
}
```

The most important job is product matching. A card only makes sense when the same product at each store is the same size and type, so matching by barcode or a careful name and size match matters more than the number of products. If a store does not stock an item, the current code expects a price for every store, so a missing price needs to be handled. A simple fix is to skip the store for that item and show "Not available" in its row. This change is needed in `card()` and in the totals code before real data goes live.

Other things the UI is ready for once the data exists are a "Prices last updated" label (there is a note under the controls where it can go), a store location setting (prices depend on the branch), and later price history and price drop alerts.

## 7. File guide

| File | Purpose |
| --- | --- |
| `index.html` | Page structure only. The grid and list are filled in by JavaScript |
| `style.css` | All colors, spacing and layout. Change the tokens at the top to restyle the whole site |
| `script.js` | Sample data, rendering and all the behavior |

To run it, put the three files in one folder and double click `index.html`. To check the phone layout, press F12 in Chrome and use the device toolbar.

## 8. Open questions for us to decide

1. Which stores and product categories do we launch with?
2. Should prices depend on the user's location or branch?
3. Do we need user accounts, or is the saved list in the browser enough for now?
4. How often will prices be refreshed, and how do we show that to the user?
5. How do we handle items that are on special or have loyalty card prices?
