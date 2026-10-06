# SA Grocery Price Comparison Tool — Project Scope v3.0

> **Version:** 3.0 — 2-month compressed timeline, cost-minimised infrastructure, monetisation roadmap included.
> **Update from v2.0:** Compressed from 12 to 8 weeks; added explicit cost breakdown and zero-cost stack; added Grocify competitive response; added monetisation roadmap; formalised Person A / Person B task split.

---

## 1. Project Overview

| Field | Detail |
|---|---|
| **Project Name** | TBD — working title *BasketCheck* (see naming note below) |
| **Team** | 2 developers (Person A — data/backend; Person B — frontend/UX) |
| **Type** | Web application (mobile-responsive) |
| **Timeline** | 8 weeks from Week 1 start date, including 1-week buffer |
| **Budget** | R0/month target for MVP — free-tier stack only |
| **Goal** | Let South African shoppers build a grocery basket and instantly see which store (Pick n Pay, Checkers, Spar, Woolworths) gives them the cheapest total shop |

### On the name
*"Supermarket Wizard"* reads as a setup-wizard utility rather than a money-saving tool — it doesn't lead with the benefit. *BasketCheck*, *TrolleyCheck*, or *ShopSmart* each communicate the "compare before you shop" idea more immediately. Decide before Week 2 — you need the domain and GitHub repo name early.

---

## 2. Competitive Reality — Grocify

A direct competitor, **Grocify** (by Johannesburg developer Ethan Stander), launched an invite-only preview in SA earlier this year and is likely publicly available now. It covers Checkers, Pick n Pay, Spar, and Woolworths with near-real-time pricing and location-aware store selection.

**What this means for your plan:**

- **Don't try to out-breadth Grocify on catalog or speed** — they have a head start and near-real-time data.
- **Your differentiator is basket-total comparison with manually verified, barcode-matched product accuracy.** Grocify's speed likely comes at the cost of fuzzy matching. A basket total that's *reliably accurate* is more useful to a shopper than a catalog that's *comprehensive but occasionally wrong*.
- **Download and test Grocify during Week 1** — treat it as a free UX research session. Note what it does poorly (matching accuracy, UX on mobile, Spar handling, specials visibility) and build directly at those gaps.

---

## 3. Objectives

1. Let users build a shopping list and see the **total cost per store** side by side
2. Compare prices on a **curated, barcode-matched** set of ~150–200 common grocery staples
3. Surface which store is cheapest overall and by category
4. Track **price history** over time (near-free once daily scraping is running)
5. Launch free, with infrastructure that costs **R0/month** until meaningful traffic justifies a paid tier
6. Build with **monetisation hooks in place** from the start (affiliate links, ad slots, premium upgrade path) without activating them until the data pipeline is trustworthy

---

## 4. Target Audience

- **Primary:** Budget-conscious households planning a weekly or monthly big shop — they want to know *before leaving home* which store to go to
- **Secondary:** Loyalty-program optimisers comparing Smart Shopper / Xtra Savings / WRewards discounted prices vs list price
- **Tertiary:** Media / journalists who cite basket comparison data — building relationships here (even informally) is a low-effort future traffic channel

---

## 5. Core Features

### MVP (Weeks 1–7)

| Feature | Description | Priority |
|---|---|---|
| **Basket Builder** | User adds items to a list; see total cost per store side by side — this is the hero feature | P0 |
| **Curated Staple Catalog** | ~150–200 hand-picked items (maize meal, milk, bread, eggs, rice, oil, tea, sugar, canned goods) matched by barcode or brand+size | P0 |
| **Daily Price Refresh** | Scheduled scraping (daily), not real-time — decoupled from user requests entirely | P0 |
| **Store Coverage** | Launch with 2 stores (determined by Week 1 spike results) | P0 |
| **Single-Item Comparison** | Price per store for one product — secondary to basket | P1 |
| **Cheapest Store Indicator** | Clear visual callout of which store wins the basket total | P1 |
| **Responsive Design** | Mobile-first — most SA price research happens on phones | P1 |
| **Data Disclaimer** | "Prices are indicative, independently sourced, updated daily" — visible everywhere | P0 |
| **Affiliate "Buy Online" Links** | Link to Sixty60 / ASAP! / Dash / Spar2U for items already in their delivery apps — zero cost, small revenue potential from day one | P2 |

### Phase 2 (Month 3–4)

| Feature | Description |
|---|---|
| Full 4-store coverage | Add remaining stores once pipeline is proven |
| Expanded catalog | Grow beyond 200 staples using the same matching approach |
| Price History | Chart trends per item/store using accumulated daily scrapes |
| Loyalty Price Toggle | List price vs Smart Shopper / Xtra Savings / WRewards |
| Specials / Promotions Tracking | Flag current deals per store — the biggest differentiator vs Grocify |
| Spar Regional Handling | Single reference store for MVP; location-aware in Phase 2 |
| User Accounts | Save baskets; requires Supabase Auth (already in stack, just not activated) |
| Price Alerts | Email when a tracked basket's cheapest store changes |

### Phase 3 (6+ months)

| Feature | Description |
|---|---|
| Browser Extension | Compare while browsing a retailer's site |
| More Retailers | Boxer, Food Lover's Market, Makro |
| Public API (paid tier) | Normalised price data for developers / media |
| ML-Assisted Matching | Reduce manual curation as catalog scales |

---

## 6. Out of Scope (v1)

- Processing payments or fulfilling orders
- Fresh produce / non-SKU'd items (weight-variable, not reliably matchable)
- Native mobile apps
- Real-time pricing
- Full catalog parity with any retailer
- Location-aware pricing per store (Phase 2)
- User accounts (Phase 2)
- Price alerts (Phase 2)

---

## 7. Technical Architecture

### Stack — Zero-Cost MVP

| Layer | Technology | Cost |
|---|---|---|
| **Frontend + API Routes** | Next.js 14 (App Router) + Tailwind CSS | Free (Vercel) |
| **Hosting** | Vercel (free tier — 100GB bandwidth/month) | R0 |
| **Database** | Supabase (PostgreSQL, free tier — 500MB, 2GB bandwidth) | R0 |
| **Cache** | Upstash Redis (serverless, free tier — 10,000 req/day, 256MB) | R0 |
| **Scheduled Scraping Jobs** | GitHub Actions (free — 2,000 min/month on free plan) | R0 |
| **Error Monitoring** | Sentry (free tier — 5,000 errors/month) | R0 |
| **Analytics** | Umami (self-hosted on Vercel, or free cloud tier) | R0 |
| **Domain** | .co.za or .com — cheapest registrar (~R100–150/year) | ~R12/month |
| **Auth (Phase 2)** | Supabase Auth (already in stack) | R0 |

**Total monthly cost for MVP: ~R12/month (domain only)**

### Why This Stack Specifically

- **No separate backend service:** Next.js API Routes handle all backend logic, eliminating Railway/Render costs.
- **GitHub Actions as scraper runtime:** Cron-scheduled workflows run scrapers on GitHub's servers for free — 2,000 minutes/month covers 2 daily scrapes of 2 stores with headroom to spare.
- **Supabase over raw Postgres:** Gives you a free managed database *and* an Auth system ready for Phase 2 user accounts without adding another service.
- **Upstash over self-hosted Redis:** Serverless billing means R0 at low traffic; seamlessly scales if you add paid tier later.

### When to Upgrade (and to What)

| Trigger | Upgrade |
|---|---|
| >100GB/month bandwidth on Vercel | Vercel Pro (~$20/month) or move to Railway |
| >500MB database | Supabase Pro ($25/month) — only when needed |
| >2,000 GH Actions minutes/month (scraping 4 stores, expanded catalog) | Move scrapers to a small Railway/Fly.io service |
| User accounts go live | Supabase Auth is already there — no new cost |

### High-Level Architecture

```
GitHub Actions (cron: daily)
       │
       ▼
Scrapers per store (Playwright/Puppeteer)
       │
       ▼
Raw Staging Table (Supabase/Postgres)
       │
       ▼
Normalization Job (barcode/brand+size → curated product list)
Anomaly check (flag >50% price swing as bad scrape, not real change)
       │
       ▼
Products & Prices table ◄── price history accumulates here
       │
       ▼
Upstash Redis (cache served results — TTL: 1 hour)
       │
       ▼
Next.js API Routes ──► Next.js Frontend ──► User
```

The frontend and API **never scrape live.** All scraping is scheduled and fully decoupled from user requests. This keeps request volume to each retailer low (≈2 requests/product/day), which is the single most important factor in staying unblocked.

### Data Sourcing Strategy — Ranked by Risk

1. **schema.org / JSON-LD structured product data** on retailer sites (published for Google Shopping/SEO — lowest legal and technical risk; check this first for every store in Week 1)
2. **Retailer delivery-app web endpoints** (Sixty60, ASAP!, Spar2U, Woolworths Dash) — what journalists already use for per-item online pricing; treat as higher risk since these aren't published for third-party use; keep volume low, don't bypass login/paywalls
3. **Headless browser page scraping** (Playwright) — last resort; most brittle; most likely to break on redesign or get rate-limited

### Product Matching

- **Primary key:** Barcode (EAN), where exposed
- **Fallback:** Brand + product name + pack size, curated manually for the initial list
- Manual curation is deliberate for MVP — automated fuzzy matching is a Phase 3 problem
- Build a shared `product_master` table with canonical IDs that every store's data maps to

---

## 8. Monetisation Roadmap

The product launches free. The infrastructure is deliberately cheap so there is no pressure to monetise before the data pipeline is trustworthy. Here's the progression:

### From Day 1 (activate when ready, not on launch day)

- **Affiliate / referral links:** Link basket items to Sixty60, ASAP!, Dash, Spar2U for online purchase. Pick n Pay, Checkers, and Woolworths all have affiliate or referral programmes — check Commission Junction / affiliate programme pages. Zero cost to implement; earns a small percentage per order.

### Month 2–3 (once you have consistent traffic)

- **Google AdSense:** Non-intrusive display ads in the sidebar / below results. Revenue scales with traffic. Apply once you have ~1,000 monthly users minimum — Google's bar for approval.
- **"Featured Deal" slots:** Retailers or brands pay to have a promoted deal shown at the top of relevant category results. Keep this clearly labelled as sponsored.

### Month 4–6 (once data quality is proven)

- **Premium tier (freemium):** Free = basket comparison; Paid (~R39/month) = price alerts, saved baskets, price history export, loyalty price toggle. Use Supabase Auth + Stripe (or PayFast for ZAR) — both have free tiers until revenue starts.
- **Data licensing:** Normalised basket data sold to media companies (Daily Investor, BusinessTech) or market research firms. Your daily-refreshed dataset has real commercial value to journalists who currently do this manually.

### Long-term

- **Public API (paid tier):** Developers pay for access to the normalised product/price API. Start with a waitlist.
- **White-label:** License the basket-comparison tool to a bank, insurer, or retailer loyalty programme.

---

## 9. 8-Week Project Timeline

Work begins **Week 1** (next week). Total duration: 8 weeks including 1-week buffer at the end.

---

### WEEK 1 — Data Feasibility Spike + Project Setup
**Both together — this is a go/no-go checkpoint before any product code is written**

| Task | Owner |
|---|---|
| Download and benchmark Grocify — document what it does well and poorly | Both |
| Check `robots.txt` for all 4 retailers | Both |
| Check for `schema.org` / JSON-LD product data on each site's category pages | Both |
| Test-fetch pricing for ~20 known staple items per store (delivery apps where needed) | Both |
| Rank each store: Easy / Medium / Hard | Both |
| **Decide the 2 launch stores based on data results, not preference** | Both |
| Read full Terms of Service for all 4 retailers (not just skim) | Both |
| Register domain; create GitHub org/repo, project board, branch protection rules | Person B |
| Set up Supabase project (free tier) | Person A |
| Set up Vercel project connected to repo | Person B |
| Finalise project name | Both |

**Week 1 Exit Criteria:** Know your 2 launch stores. Know your data access approach for each. ToS read and documented. Repo and hosting live.

---

### WEEK 2 — Foundation & Schema
**Split work begins here**

| Task | Owner |
|---|---|
| Hand-pick the curated ~150–200 staple item list (do this together in one sitting) | Both |
| Design and implement `product_master`, `store_prices`, `price_history` database schema in Supabase | Person A |
| Seed `product_master` with the curated list (barcodes where findable, brand/size as fallback) | Person A |
| Set up Next.js 14 project with Tailwind, ESLint, folder structure | Person B |
| Wire Vercel deployment to GitHub (auto-deploy on `main` merge) | Person B |
| Set up Upstash Redis and connect to Next.js project | Person B |
| Wireframe 3 core pages: Home, Basket Builder, Comparison Results | Person B |
| Set up GitHub Actions workflow structure (cron jobs placeholder) | Person A |

**Week 2 Exit Criteria:** Database live with product list seeded. Next.js project deployed (even if blank). Wireframes agreed on.

---

### WEEK 3 — Scraper for Store 1 + Normalization Pipeline

| Task | Owner |
|---|---|
| Build scraper for Store 1 (structured data / delivery app endpoint first; headless browser fallback) | Person A |
| Build raw staging table ingest pipeline | Person A |
| Build normalization job: raw data → `product_master` lookup (barcode first, then brand/size) | Person A |
| Add anomaly detection (flag price swings >50% as suspect — log, don't publish) | Person A |
| Schedule scraper as GitHub Actions cron (daily, off-peak hours) | Person A |
| Build Home page UI (search bar, category browse, "how it works" explainer) | Person B |
| Build Basket Builder UI — item add/remove, quantity, running subtotal per store | Person B |

**Week 3 Exit Criteria:** Store 1 scraper running on schedule, raw data flowing into Postgres, normalization job matching >80% of the curated list.

---

### WEEK 4 — Scraper for Store 2 + Backend API

| Task | Owner |
|---|---|
| Build scraper for Store 2 using same pipeline pattern | Person A |
| Validate and fix product matching for Store 2 — manual spot-checks against known prices | Person A |
| Build Next.js API Routes: `POST /api/basket` (return totals per store), `GET /api/product/[id]` (single item prices) | Person A |
| Add Redis caching to API routes (TTL: 1 hour) | Person A |
| Build Comparison Results page — basket totals side by side, cheapest store highlighted | Person B |
| Build Single-Item Comparison view (secondary) | Person B |
| Connect Basket Builder → API → Results page (end-to-end flow) | Person B |

**Week 4 Exit Criteria:** End-to-end flow working with real scraped data — user can add items to basket and see real prices from both stores.

---

### WEEK 5 — Polish, Affiliate Links + Store 3 Prep

| Task | Owner |
|---|---|
| Add affiliate / "Buy Online" links to items (Sixty60, ASAP!, Spar2U, Dash) | Person A |
| Research and confirm affiliate programme sign-ups | Person A |
| Add price freshness indicator ("prices last updated X hours ago") to all views | Person A |
| Instrument Sentry error monitoring | Person A |
| Mobile UX polish pass on all three pages | Person B |
| Add data disclaimer, footer, basic About page | Person B |
| Umami analytics integration | Person B |
| Accessibility pass (keyboard nav, contrast, semantic HTML) | Person B |
| Begin Store 3 feasibility and scraper build (Phase 2 prep) | Person A |

**Week 5 Exit Criteria:** Product looks finished on mobile. Sentry and analytics live. Affiliate links in place.

---

### WEEK 6 — Integration QA + Performance

| Task | Owner |
|---|---|
| Full QA pass: test basket builder with 20+ real items, verify totals against manually checked prices | Both |
| Fix matching errors surfaced by QA | Person A |
| Performance audit (Lighthouse — target >85 on mobile) | Person B |
| Fix performance issues (image optimisation, bundle size, caching headers) | Person B |
| Write unit tests for normalization and matching logic (highest-risk code) | Person A |
| Write integration tests for basket API endpoint | Person A |
| Document scraper setup and normalization logic in README | Person A |
| Document frontend setup and deployment in README | Person B |

**Week 6 Exit Criteria:** All P0 and P1 features working correctly with real data. Test coverage on normalization logic. Lighthouse >85 mobile.

---

### WEEK 7 — Soft Launch

| Task | Owner |
|---|---|
| Remove any unlicensed use of store logos or trademarks — use text names only unless you have permission | Both |
| Final ToS compliance check | Both |
| Draft response plan for a retailer takedown/access request | Both |
| Soft launch to friends and family (~20–30 people) | Both |
| Monitor Sentry errors and fix critical bugs from first users | Both |
| Gather qualitative feedback (WhatsApp group, Google Form) | Both |
| Begin Store 3 scraper integration (if feasibility confirmed in Week 5) | Person A |
| Set up Google Search Console for the domain | Person B |

**Week 7 Exit Criteria:** Product is publicly accessible. No P0 bugs in Sentry. First real user feedback gathered.

---

### WEEK 8 — Buffer / Iteration
*This is deliberately unscheduled. Use it for:*

- Fixing issues surfaced by soft launch users
- Completing Store 3 integration if it's ready
- Price history groundwork (data is already accumulating from Week 3 onward)
- Planning Phase 2 feature prioritisation
- Wider launch announcement (social media, ProductHunt SA, tech community channels)

---

## 10. Work Division Summary

| Area | Primary Owner | Notes |
|---|---|---|
| **Data Feasibility Spike** | Both (together, Week 1) | Highest-risk decision — do it together |
| **Curated Product List** | Both (together, Week 2) | One joint session, not async |
| **Database Schema** | Person A | Supabase / Postgres |
| **Scrapers (both stores)** | Person A | GitHub Actions cron jobs |
| **Normalization + Matching** | Person A | Most critical code in the project |
| **Anomaly Detection** | Person A | Flags bad scrapes |
| **Backend API Routes** | Person A | Next.js API Routes (basket, product) |
| **Redis Caching** | Person A | Upstash |
| **Affiliate Link Integration** | Person A | After scraper pipeline is stable |
| **Next.js Project Setup** | Person B | Tailwind, ESLint, Vercel |
| **Wireframes / Design** | Person B | Before coding UI |
| **Home Page** | Person B | |
| **Basket Builder UI** | Person B | Hero feature — prioritise this |
| **Comparison Results Page** | Person B | |
| **Single-Item View** | Person B | Secondary feature |
| **Mobile Polish** | Person B | |
| **Analytics (Umami)** | Person B | |
| **Error Monitoring (Sentry)** | Person A | |
| **Performance Audit** | Person B | Lighthouse |
| **ToS + Legal Review** | Both | Don't skip this |
| **README + Docs** | Both | Each documents their own area |

---

## 11. Roles & Responsibilities

| Role | Person | Key Deliverables |
|---|---|---|
| **Data Engineer / Backend** | Person A | Scrapers, normalization pipeline, API routes, DB schema, caching |
| **Frontend / UX** | Person B | All UI pages, design system, mobile responsiveness, analytics |
| **DevOps** | Rotate | GitHub Actions setup (Person A), Vercel deployment (Person B) |
| **Legal / Compliance** | Both | ToS review, disclaimer copy, trademark check |
| **Product / QA** | Both | Week 6 joint QA session is mandatory |

---

## 12. Definition of Done

A feature is complete when it:
- Passes all written tests (normalization/matching logic mandatory; UI happy path mandatory)
- Has been reviewed in a pull request by the other person
- Is deployed to the Vercel preview URL and manually tested against real scraped data
- Is documented (inline comments + README section)
- Does not introduce a new Sentry error in staging

---

## 13. Key Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Scraping blocked / ToS issue | High | High | Start with structured/SEO data; keep frequency low (daily); read ToS before writing code; be ready to drop a store without treating it as a crisis |
| Product mismatch across stores | High | High | Barcode-first matching; manual curation for initial list; anomaly detection on price jumps; weekly spot-check against manual prices |
| Grocify already covers the space | High | Medium | Differentiate on basket-accuracy and specials tracking, not catalog breadth; use Week 1 to document Grocify's gaps |
| Site redesigns breaking scrapers | Medium | Medium | Keep scrapers isolated per store; monitor for silent failures (data stops updating) not just errors |
| Spar franchised pricing inconsistency | Medium | Low | Explicitly deferred to Phase 2; use a single reference store for MVP and document it clearly in the UI |
| Scope creep (full-catalog temptation) | Medium | High | Lock the curated list at ~200 items for MVP; log expansion ideas as GitHub issues for Phase 2 |
| Free-tier limits hit unexpectedly | Low | Medium | Monitor Supabase storage and Vercel bandwidth weekly from Week 3; have the upgrade path budgeted and ready |
| 2-person burnout | Medium | High | Week 1 spike is a real go/no-go — if both launch stores are "hard," consider delaying or narrowing scope further rather than pushing |

---

## 14. Success Metrics

| Metric | MVP Target (Week 7) | 3-Month Target |
|---|---|---|
| Stores covered | 2 | 4 |
| Curated items | 150–200 | 500+ |
| Data refresh reliability | Daily, >85% item match rate | Daily, >95% |
| Monthly active users | 50–100 (soft launch) | 1,000+ |
| Basket comparisons run | Track from Week 7 | Core engagement metric |
| Affiliate link clicks | Track from Week 5 | Conversion baseline for monetisation |
| Lighthouse mobile score | >85 | >90 |

---

## 15. Infrastructure Cost Projection

| Phase | Monthly Cost | Notes |
|---|---|---|
| MVP (2 stores, 200 items) | ~R12 | Domain only — everything else free tier |
| Phase 2 (4 stores, 1,000 items) | ~R12–R200 | Likely still free tier; possible Vercel Pro if bandwidth spikes |
| Phase 3 (5+ stores, user accounts) | ~R300–R600 | Supabase Pro + possibly Railway for scrapers |
| Revenue break-even (AdSense + affiliate) | ~1,500–3,000 MAU | Conservative estimate based on SA ad rates |

---

## 16. Immediate Actions This Week (Before Week 1 Formally Starts)

1. **Both:** Agree on a project name and check `.co.za` and `.com` domain availability
2. **Both:** Download and spend 20 minutes using Grocify — document your observations
3. **Person A:** Create the Supabase project and invite Person B as collaborator
4. **Person B:** Create the GitHub org/repo and Vercel project; invite Person A
5. **Both:** Block out Week 1 time together for the feasibility spike — this must not be done asynchronously

---

*Document version: 3.0 — 2-month compressed timeline, cost-minimised, monetisation-ready. Update after Week 1 spike with actual store difficulty rankings and confirmed launch pair.*
