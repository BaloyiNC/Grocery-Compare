# Maintenance guide

Follow each list in order. Do not skip steps.

## Refresh catalogue offers

1. Review My Catalogue for current offers. Verify the product, price, stated end date and Gauteng/branch applicability. The site warns that offers may not apply at all local stores.
2. Replace or update the offer rows in `data/products.csv`, retaining each source URL. Do not infer missing pack sizes or regular prices.
3. Set `"updated"` in `data/config.json` to the capture date, `YYYY-MM-DD`.
4. Run `npm run build-data` and `npm test`; fix any reported errors before publishing.
5. Add an entry at the top of `docs/data-changelog.md` (date, source, rows changed and limitations).
6. Commit and push. The GitHub Pages workflow reruns the build and tests before deploying.

If a refresh turns out to be wrong, see "Roll back a bad refresh" below.

## Roll back a bad refresh

1. Run `git log --oneline data/` and find the commit before the bad refresh.
2. Run `git revert <the bad commit id>`.
3. Run `npm run build-data` and `npm test`, then push.
4. Add a line to `docs/data-changelog.md` saying the refresh was rolled back and why.

## Add a store

1. In `data/config.json`, add the store name and display colour.
2. Add verified offer rows for it to `data/products.csv`, including end dates and source URLs.
3. Run `npm run build-data` and `npm test`.

## Add a category

1. In `data/config.json` add the name to the categories list, after "All".
2. Give at least one product that category in `data/products.csv`. The validator warns when a category has no products.
3. Run `npm run build-data` and `npm test`.

## Add a branch

Branch selection is disabled while `dataMode` is `catalogue-offers`, because these catalogue offers are not verified store-specific prices. Re-enable branch selection only after importing verified branch-level data.

## Release v1.0.0

1. Refresh expired offers and verify store/region coverage. Add regular prices and matched full-basket comparisons only when their data is available.
2. Configure repository Settings → Pages → Build and deployment → GitHub Actions.
3. Make sure `npm run build-data` and `npm test` both pass and everything is committed.
4. Run `git tag -a v1.0.0 -m "First release"`.
5. Run `git push origin v1.0.0`.
