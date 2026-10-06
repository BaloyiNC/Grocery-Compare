# Project Scope: Product Comparison Website

---

## 1. Project Overview

**Project Name:** (TBD — e.g., "PriceStack" / "CompareCart")  
**Team:** 2 developers (you + friend)  
**Type:** Web Application  
**Goal:** Build a website that allows users to search for products and compare prices, features, and availability across multiple online stores — helping them make faster, more informed purchasing decisions.

---

## 2. Objectives

- Allow users to search for a product by name or category
- Display results aggregated from multiple stores side by side
- Enable direct price and feature comparisons in a clean UI
- Provide links to the original product pages for purchase
- Build a scalable architecture that can add new stores over time

---

## 3. Target Audience

- Online shoppers looking for the best price
- Budget-conscious consumers comparing specs (e.g. electronics, appliances)
- Casual browsers doing research before buying

---

## 4. Core Features

### MVP (Minimum Viable Product)

| Feature | Description |
|---|---|
| Product Search | Search bar with keyword/category filtering |
| Store Aggregation | Pull product data from at least 2–3 stores |
| Comparison View | Side-by-side table of price, rating, availability |
| Product Detail Page | Expanded view of a single product with store breakdown |
| External Links | "Buy Now" buttons linking to store product pages |
| Responsive Design | Mobile-friendly layout |

### Phase 2 (Post-MVP)

| Feature | Description |
|---|---|
| User Accounts | Save favourite products, comparison lists |
| Price History | Track and display historical price trends |
| Price Alerts | Email/push notification when a price drops |
| Category Browsing | Browse by category without searching |
| Product Ratings Aggregation | Average rating across all stores |
| Filters & Sorting | Sort by price, rating, store, availability |
| Affiliate Links | Monetisation through store affiliate programs |

### Phase 3 (Growth)

| Feature | Description |
|---|---|
| Browser Extension | Compare prices while browsing any product page |
| API Access | Public API for third-party developers |
| Admin Dashboard | Manage store integrations, flag outdated data |
| SEO Landing Pages | Auto-generated pages per product for organic traffic |

---

## 5. Out of Scope (v1)

- Processing payments or acting as a store itself
- Selling or warehousing products
- Native mobile apps (iOS/Android)
- Customer support or dispute resolution
- Real-time inventory tracking (polling-based is fine for MVP)

---

## 6. Technical Architecture

### Recommended Stack

| Layer | Technology Options |
|---|---|
| Frontend | React + Tailwind CSS (or Next.js for SSR/SEO) |
| Backend | Node.js + Express **or** Python + FastAPI |
| Database | PostgreSQL (products, stores, prices) + Redis (caching) |
| Data Source | Store APIs, affiliate feeds (e.g. Amazon PA API, eBay API), or web scraping |
| Hosting | Vercel (frontend) + Railway/Render (backend) |
| Auth (Phase 2) | Clerk, Auth0, or Supabase Auth |
| Search | Algolia or PostgreSQL full-text search (MVP) |

### High-Level Architecture

```
User → Frontend (Next.js)
          ↓
      Backend API (Node/Python)
          ↓              ↓
   Database (PG)    Data Layer
   (cached via       ↓         ↓
     Redis)     Store APIs   Scrapers
```

### Data Approach for Store Aggregation

Choose one or a combination:

1. **Official APIs** — Amazon Product Advertising API, eBay Browse API, Best Buy API (most reliable, rate-limited)
2. **Affiliate Data Feeds** — CSV/XML product feeds from affiliate networks (e.g. Awin, CJ Affiliate)
3. **Web Scraping** — Puppeteer / Playwright for stores without APIs (check TOS carefully)
4. **Third-party aggregator APIs** — e.g. PriceAPI.com, Rainforest API (paid, easiest to start)

---

## 7. Project Phases & Milestones

### Phase 1 — Foundation (Weeks 1–3)
- [ ] Finalise project name, domain, and branding
- [ ] Set up GitHub repo, project board (GitHub Projects / Notion / Linear)
- [ ] Agree on tech stack and development environment
- [ ] Design wireframes (Figma or Excalidraw)
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Register for at least 2 store APIs or affiliate feeds

### Phase 2 — MVP Build (Weeks 4–10)
- [ ] Build database schema (products, stores, prices, categories)
- [ ] Build data ingestion layer (fetch + normalise product data)
- [ ] Build backend REST API (search, product detail endpoints)
- [ ] Build frontend: homepage, search results page, comparison page
- [ ] Add basic caching (Redis or in-memory) for API responses
- [ ] Write unit tests for core backend logic
- [ ] Deploy MVP to staging environment

### Phase 3 — MVP Launch (Weeks 11–12)
- [ ] QA testing across devices and browsers
- [ ] Performance audit (Lighthouse scores)
- [ ] Set up error monitoring (Sentry)
- [ ] Set up analytics (Plausible / Google Analytics)
- [ ] Launch to production
- [ ] Share with friends/family for initial feedback

### Phase 4 — Iteration (Month 4+)
- [ ] User accounts and saved products
- [ ] Price history and alerts
- [ ] Expand store integrations
- [ ] SEO optimisation
- [ ] Monetisation (affiliate links, ads)

---

## 8. Roles & Responsibilities

Since you're a two-person team, consider splitting ownership by area:

| Area | Owner | Notes |
|---|---|---|
| Frontend UI | Person A | Pages, components, design system |
| Backend API | Person B | Endpoints, business logic |
| Data Ingestion | Shared | Store APIs, scrapers, normalisation |
| DevOps / Infra | Rotate | Hosting, CI/CD, monitoring |
| Product / Design | Shared | Feature decisions, wireframes |

Review and reassign based on each person's strengths.

---

## 9. Definition of Done (DoD)

A feature is considered complete when it:
- Passes all written tests
- Has been reviewed in a pull request by the other person
- Is deployed to staging and manually tested
- Is documented (inline comments + README update if needed)

---

## 10. Key Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| Store API access denied or rate-limited | Medium | Use multiple data sources; cache aggressively |
| Web scraping blocked | High | Prefer official APIs; use rotating proxies as last resort |
| Data normalisation complexity | High | Define a strict internal product schema early |
| Scope creep | Medium | Lock Phase 1 features; log new ideas for later phases |
| Burnout (2-person team) | Medium | Time-box each phase; celebrate small wins |

---

## 11. Success Metrics

| Metric | MVP Target | 6-Month Target |
|---|---|---|
| Stores covered | 2–3 | 8–10 |
| Products indexed | 1,000 | 100,000+ |
| Monthly active users | 50 (friends/family) | 1,000+ |
| Page load time | < 3s | < 1.5s |
| Uptime | 95% | 99.5% |

---

## 12. Next Immediate Actions

1. **Today:** Agree on project name and register a domain
2. **This week:** Set up a shared GitHub org, project board, and Figma workspace
3. **This week:** Each person signs up for 1–2 store APIs to test access
4. **Next week:** Sketch wireframes for the 3 core pages (home, search results, comparison)
5. **Next week:** Write the database schema together before writing any code

---

*Document version: 1.0 — update as the project evolves.*
