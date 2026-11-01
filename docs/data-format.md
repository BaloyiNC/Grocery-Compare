# Data format

This page is for whoever supplies prices. The app reads one generated file, `data/data.js`. You never edit that file. You edit `data/products.csv` and `data/config.json`, then run `npm run build-data`.

## products.csv (current catalogue-offer mode)

One row per listed offer. Current headers:

| Column | Required | Meaning |
| --- | --- | --- |
| `id` | yes | Unique whole number. Never reuse an id, because saved lists in people's browsers point to it |
| `name` | yes | Shown on the card |
| `category` | yes | Must match a category in `config.json` (not "All") |
| `size` | yes | Listed pack size, or `Size not stated` if the source omits it |
| `divisor` | yes | Unit-price divisor; use `1` when size is not stated |
| `unit` | yes | Unit display; current unspecified-size offers use `/offer` |
| `brand` | yes | Brand stated by the listing, or `Not specified` |
| `barcode` | no | Empty in current offer rows; when available, GTIN 8, 12, 13 or 14 digits |
| `store` | yes | One of the stores in `config.json` |
| `offer_price` | yes | Listed offer price in rands. This is not a regular shelf price |
| `offer_until` | yes | Last stated offer date, `YYYY-MM-DD`; the app hides the offer after that date |
| `source_url` | yes | My Catalogue page showing the offer |

Rows are not assumed to be the same product across retailers. Merge offers into one comparison only after matching brand, product type and exact size (or barcode).

## config.json

Stores, colours, loyalty card names, categories, the `updated` date (`YYYY-MM-DD`), and `dataMode: "catalogue-offers"`. The legacy regular-price CSV format is available when switching to `dataMode: "retail-prices"`.

In legacy `retail-prices` mode, each branch is `[name, latitude, longitude, price factor]`.

- Put the suburb or town in the branch name. Branch search only looks at the name.
- The first branch of each store is the default for people who do not pick one or share their location. Make it a central, busy branch.
- The price factor multiplies the store's prices for that branch. Until real branch prices exist this is a sample factor.

## Branches in legacy regular-price mode

If the user shares their location and a store has no branch within 75 km, that store keeps the branch it already had and the page says so. Branch controls are disabled in catalogue-offer mode because the source snapshot is not branch-specific.

## Offer dates

The importer places each listed deal price in the relevant store's price map and records its end date and source URL in `of`:

```js
{ id: 1, n: "Product offer", p: { "Checkers": 15.99 }, of: { "Checkers": { "until": "2026-11-08", "source": "https://my-catalogue.co.za/checkers-specials" } } }
```

The app hides an offer after its stated end date. Regular prices and loyalty-card specials are not inferred from catalogue offers.
