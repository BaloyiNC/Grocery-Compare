# Price source notes

## Current source

[My Catalogue](https://my-catalogue.co.za/) is the current source for the dated catalogue offers in `data/products.csv`. The project owner has confirmed permission to reproduce the relevant public product and price information. The importer stores a link to the relevant My Catalogue retailer or product page with every offer.

This is an offer catalogue, not a regular shelf-price feed. The site warns that specials may not be valid at all local stores. Current listings do not establish that every offer is specifically available across Gauteng, and some listings omit pack sizes. Source links and stated offer end dates are retained so shoppers can verify the details. Do not infer a regular price, loyalty-card requirement, pack size, barcode or branch coverage when the listing does not state it.

## Capture record

The current catalogue snapshot was reviewed on 2026-11-01. The offer end date is stored per row. Products with a size not stated by the listing use `Size not stated`; they are not safe to compare as equivalent products. Offers are not automatically refreshed; rerun the source review and update the CSV and changelog before the recorded offers expire.

Only retailer offers that were visible on the linked source pages were entered. Regular prices, region-specific availability, and store stock are not supplied by this dataset.
