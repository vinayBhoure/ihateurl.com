# ihateurl — Feature List

Every feature decided in `docs/prd/prd.md`, with its status, plus planned features not in the PRD (§7 Future Scope).

Last verified against the code: 2026-09-26 (`origin/main` at `bb8d659`).

| Status | Meaning |
|---|---|
| Done | Built and merged to `main` |
| In progress | Started, not finished or not live |
| Yet to start | Not built |

Update this file in the same commit as any change that moves a feature's status.

## Table of Contents
1. [Summary](#1-summary)
2. [Phase 1 — Personal Curation](#2-phase-1--personal-curation)
3. [Phase 2 — Public Sharing](#3-phase-2--public-sharing)
4. [SEO, Performance, Security](#4-seo-performance-security)
5. [Product Metrics](#5-product-metrics)
6. [Final Product](#6-final-product)
7. [Future Scope (not in PRD)](#7-future-scope-not-in-prd)

---

## 1. Summary

| Area | Done | In progress | Yet to start |
|---|---|---|---|
| Phase 1 | 30 | 1 | 0 |
| Phase 2 | 16 | 1 | 1 |
| SEO, Performance, Security | 17 | 0 | 2 |
| Product Metrics | 0 | 0 | 13 |
| Final Product | 1 | 0 | 12 |
| Future Scope | 0 | 1 | 12 |

---

## 2. Phase 1 — Personal Curation

### Authentication
| # | Feature | Status | Notes |
|---|---|---|---|
| 1.1 | Google OAuth | Done | Clerk |
| 1.2 | GitHub OAuth | In progress | Code ready; GitHub sign-in off in Clerk dashboard (BUG-002) |
| 1.3 | Session management | Done | Clerk |

### User profile
| # | Feature | Status | Notes |
|---|---|---|---|
| 1.4 | Username (unique, 3–30, lowercase, `a-z 0-9 - _`, reserved names) | Done | Onboarding + settings |
| 1.5 | Display name | Done | |
| 1.6 | Bio | Done | |
| 1.7 | Avatar | Done | From Clerk, synced on `/app` visit |
| 1.8 | Social links (YouTube, Instagram, X, GitHub, LinkedIn + up to 3 Website/Other) | Done | Plan 7 |

### Collections
| # | Feature | Status | Notes |
|---|---|---|---|
| 1.9 | Create | Done | |
| 1.10 | Edit | Done | |
| 1.11 | Delete | Done | Removes links left in no collection |
| 1.12 | Rename | Done | Public URL keeps working (`publicId`) |
| 1.13 | Change slug | Done | |
| 1.14 | Set description | Done | |
| 1.15 | Set visibility (PRIVATE / PUBLIC) | Done | |
| 1.16 | New collections are PRIVATE | Done | |

### Links
| # | Feature | Status | Notes |
|---|---|---|---|
| 1.17 | Add URL | Done | No duplicate URLs per user |
| 1.18 | Edit metadata | Done | Edits show in every collection holding the link |
| 1.19 | Delete URL | Done | |
| 1.20 | Remove URL from collection | Done | Last removal deletes the link |
| 1.21 | Reorder URLs | Done | Up/down buttons |
| 1.22 | Move URL to another collection | Done | |
| 1.23 | Auto-fetch title, description, favicon, OG image, domain | Done | SSRF-safe fetcher |
| 1.24 | User can edit fetched metadata | Done | |

### Search (own data)
| # | Feature | Status | Notes |
|---|---|---|---|
| 1.25 | Search collection title | Done | `/app/search` |
| 1.26 | Search collection description | Done | |
| 1.27 | Search link title | Done | |
| 1.28 | Search link domain | Done | |

### Phase 1 flows
| # | Feature | Status | Notes |
|---|---|---|---|
| 1.29 | Onboarding (claim username) | Done | `/app/onboarding` |
| 1.30 | Dashboard (my collections) | Done | `/app` |
| 1.31 | Private/public toggle on a collection | Done | |

---

## 3. Phase 2 — Public Sharing

### Public profile (`/u/{username}`)
| # | Feature | Status | Notes |
|---|---|---|---|
| 2.1 | Avatar, name, bio | Done | |
| 2.2 | Social link icons (filled platforms only) | Done | Plan 7 |
| 2.3 | Public collections list | Done | |
| 2.4 | Never expose private collections | Done | |

### Public collection (`/u/{username}/{slug}/{publicId}`)
| # | Feature | Status | Notes |
|---|---|---|---|
| 2.5 | Title, description, owner, resource count, last updated, links | Done | |
| 2.6 | Visitors need no account | Done | |

### Sharing
| # | Feature | Status | Notes |
|---|---|---|---|
| 2.7 | Copy profile URL | Done | |
| 2.8 | Copy collection URL | Done | |
| 2.9 | Native browser share | Done | Shown only where supported |
| 2.10 | OpenGraph metadata | Done | |
| 2.11 | Twitter/X metadata | Done | |

### Explore (`/explore`)
| # | Feature | Status | Notes |
|---|---|---|---|
| 2.12 | Search public collections | Done | With suggestions while typing; unchanged by the card redesign (F.13) |
| 2.13 | Search public links | Done | Finds collections by link title/domain |
| 2.14 | Filter by category | Done | System categories |
| 2.15 | Filter by domain | Yet to start | |

### Save collection
| # | Feature | Status | Notes |
|---|---|---|---|
| 2.16 | Save a public collection to Saved collections (bookmark, no copy) | In progress | Plan 9: built on `feature/collections/saved`, replaces copy-on-save; Done once merged to `main`. Owner can turn off new saves per collection |

### Phase 2 flows
| # | Feature | Status | Notes |
|---|---|---|---|
| 2.17 | Open links from public pages | Done | New tab |
| 2.18 | Publish own collection | Done | |

---

## 4. SEO, Performance, Security

### SEO
| # | Feature | Status | Notes |
|---|---|---|---|
| 3.1 | Server-rendered public pages | Done | |
| 3.2 | Dynamic title/description | Done | |
| 3.3 | Canonical URL | Done | |
| 3.4 | OpenGraph metadata | Done | |
| 3.5 | Sitemap | Done | Public content only |
| 3.6 | Robots.txt | Done | `/app`, `/login`, `/signup`, `/api` disallowed |
| 3.7 | Private collections never in public search or sitemap | Done | |

### Performance
| # | Feature | Status | Notes |
|---|---|---|---|
| 3.8 | Server-render public pages | Done | |
| 3.9 | Low client-side JavaScript | Done | Server components by default |
| 3.10 | Database indexes for common queries | Done | |
| 3.11 | Cache public pages | Yet to start | Public pages render per request |
| 3.12 | Optimize images | Yet to start | Favicons/OG images are hotlinked (D8) |

### Security
| # | Feature | Status | Notes |
|---|---|---|---|
| 3.13 | Validate all inputs | Done | Shared Zod schemas |
| 3.14 | Validate ownership on mutations | Done | |
| 3.15 | Parameterized ORM queries | Done | Prisma |
| 3.16 | Protect private collections | Done | |
| 3.17 | Rate-limit auth and expensive endpoints | Done | Clerk for auth; in-memory for add link, copy, suggestions |
| 3.18 | Validate URLs before metadata fetch | Done | |
| 3.19 | Prevent SSRF; limit fetch size and time | Done | |

---

## 5. Product Metrics

Not in MVP (decision D14).

| # | Metric | Status |
|---|---|---|
| 4.1 | Signups | Yet to start |
| 4.2 | Users creating a collection | Yet to start |
| 4.3 | Users adding 3+ links | Yet to start |
| 4.4 | Collections per user | Yet to start |
| 4.5 | Links per collection | Yet to start |
| 4.6 | 7-day returning users | Yet to start |
| 4.7 | 30-day returning users | Yet to start |
| 4.8 | Public collections | Yet to start |
| 4.9 | Public collection views | Yet to start |
| 4.10 | Link clicks | Yet to start |
| 4.11 | Shares | Yet to start |
| 4.12 | Collection copies | Yet to start |
| 4.13 | Public searches | Yet to start |

---

## 6. Final Product

| # | Feature | Status | Notes |
|---|---|---|---|
| 5.1 | Link health checks (ACTIVE / REDIRECTED / BROKEN / TIMEOUT) | Yet to start | |
| 5.2 | Freshness tracking (last checked, status change, HTTP status, redirect URL) | Yet to start | |
| 5.3 | Tags | Yet to start | |
| 5.4 | Categories | Done | Built in MVP (decision D11) |
| 5.5 | Fork collections with source attribution | Yet to start | Copies already store their source |
| 5.6 | Follow profiles or collections | Yet to start | Owner plan: "subscribers" (see F.5 for comments) |
| 5.7 | Owner analytics (views, clicks, copies) | Yet to start | Owner plan "Insights": profile views, total link clicks, clicks per link and per collection, full dashboard |
| 5.8 | Advanced search | Yet to start | |
| 5.9 | AI-assisted organization | Yet to start | Related: F.12 |
| 5.10 | Advanced analytics | Yet to start | |
| 5.11 | Custom domains for users | Yet to start | |
| 5.12 | Monetization | Yet to start | |
| 5.13 | Basic analytics (PRD dev order #21) | Yet to start | D14 |

---

## 7. Future Scope (not in PRD)

Planned by the owner on 2026-09-26. Not in the PRD yet; add to the PRD before planning any of them.

| # | Feature | Status | Notes |
|---|---|---|---|
| F.1 | Explore: **Trending** section (recent clicks × total clicks) | Yet to start | Needs click tracking (5.7) |
| F.2 | Explore: **Popular** section (most clicked), then all other collections | Yet to start | Needs click tracking (5.7) |
| F.3 | Link shortener | Yet to start | |
| F.4 | Business card: name, URL, QR code | Yet to start | |
| F.5 | Subscribers (signed-in users) can comment on collections | Yet to start | Conflicts with PRD non-goal "Comments or likes"; follow part is 5.6 |
| F.6 | More social platforms: Discord, Substack, others | Yet to start | Extends 1.8 |
| F.7 | Custom profile background and theme | Yet to start | Light/dark app theme already exists |
| F.8 | Public/private toggle per link inside a collection | Yet to start | A public collection shows only its public links to visitors |
| F.9 | Pin collections | Yet to start | |
| F.10 | Progressive Web App (install from browser) | Yet to start | PRD non-goal "Mobile apps" covers native apps only |
| F.11 | Hover card on @username in Explore rows: underline, avatar, collection count, bio | Yet to start | |
| F.12 | AI bot for search / curation | Yet to start | Owner's description incomplete; related to 5.9; PRD non-goal "AI assistant" (initially) |
| F.13 | Explore redesign (collection cards), from the owner's "Jev home page as ihateurl explore" | In progress | Plan 8: built on `feature/public/explore-cards` (cards on Explore, landing, profile; bookmark = save, plan 9); Done once merged to `main`. UserBadge: fixed floating, home page only (E6) |
