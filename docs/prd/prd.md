# ihateurl — Product Requirements Document

# Table of Contents

1. [Product](#1-product)
2. [Problem](#2-problem)
3. [Product Goals](#3-product-goals)
4. [MVP Plan](#4-mvp-plan)
5. [Phase 1 — Personal Curation](#phase-1--personal-curation)
6. [MVP Phase 2 — Public Sharing](#5-mvp-phase-2--public-sharing)
7. [Final Product](#6-final-product)
8. [Architecture](#7-architecture)
9. [URL Metadata Service](#8-url-metadata-service)
10. [Database Schema](#9-database-schema)
11. [Relationships](#10-relationships)
12. [Routes](#11-routes)
13. [Server Actions](#12-server-actions)
14. [SEO](#13-seo)
15. [Performance](#14-performance)
16. [Security](#15-security)
17. [Product Metrics](#16-product-metrics)
18. [Development Order](#17-development-order)
19. [MVP Boundary](#18-mvp-boundary)
20. [Product Direction](#19-product-direction)

---

## 1. Product

**ihateurl** is a platform for saving URLs into collections and sharing those collections publicly.

Core flow:

`Save → Organize → Share → Maintain`

Example:

`ihateurl.com/u/vinay/ai-engineering`

A collection can contain docs, articles, tools, videos, repositories, and other useful URLs.

---

## 2. Problem

People save useful URLs in bookmarks, Notion, chats, and documents. Over time:

- Links become hard to find.
- Curated lists are difficult to maintain.
- Sharing a useful list usually means copying links manually.
- Public lists and private bookmarks live in separate tools.

ihateurl combines private collections with public sharing.

---

## 3. Product Goals

- Make saving a URL quick.
- Organize URLs into collections.
- Keep collections private by default.
- Let users publish selected collections.
- Give every user a shareable public profile.
- Make public collections indexable and easy to share.
- Keep the architecture simple enough to extend later.

### Non-goals

Do not build initially:

- Social networking
- Comments or likes
- Mobile apps
- Payments
- AI assistant
- Complex recommendation system
- Nested folders
- Custom domains

---

# 4. MVP Plan

## Phase 1 — Personal Curation

### Goal

Validate that users create and return to collections.

### Features

#### Authentication

- Google OAuth
- GitHub OAuth
- Session management

#### User Profile

- Username
- Display name
- Bio
- Avatar
- Social links (plan 7): YouTube, Instagram, X, GitHub, LinkedIn handles; up to 3 Website / Other `https://` links

Username:

- Unique
- 3–30 characters
- Lowercase normalized
- Allow `a-z`, `0-9`, `-`, `_`
- Reserve system usernames

#### Collections

Users can:

- Create
- Edit
- Delete
- Rename
- Change slug
- Set description
- Set visibility

Visibility:

```text
PRIVATE
PUBLIC
```

New collections are `PRIVATE`.

#### Links

Users can:

- Add URL
- Edit metadata
- Delete URL
- Remove URL from collection
- Reorder URLs
- Move a URL to another collection

When a URL is added, fetch:

- Title
- Description
- Favicon
- OG image
- Domain

The user can edit fetched metadata.

#### Search

Search only the current user's data.

Search fields:

- Collection title
- Collection description
- Link title
- Link domain

### Phase 1 Acceptance Criteria

A user can:

1. Sign in.
2. Claim a username.
3. Create a collection.
4. Add URLs.
5. Get URL metadata automatically.
6. Edit and reorder links.
7. Search their collections.
8. Make a collection private or public.
9. Edit and delete collections.

---

# 5. MVP Phase 2 — Public Sharing

### Goal

Validate whether users publish and share collections.

## Public Profile

URL:

```text
/u/{username}
```

Show:

- Avatar
- Name
- Bio
- Social links (icons; only filled platforms, plan 7)
- Public collections

Never expose private collections.

## Public Collection

URL:

```text
/u/{username}/{collection-slug}/{publicId}
```

Show:

- Collection title
- Description
- Owner
- Resource count
- Last updated
- Links

Visitors do not need an account.

## Sharing

Support:

- Copy profile URL
- Copy collection URL
- Native browser share where available
- OpenGraph metadata
- Twitter/X metadata

## Explore

URL:

```text
/explore
```

Allow visitors to:

- Search public collections
- Search public links
- Filter by category/domain if available

Do not build recommendations yet.

## Save Collection

Logged-in users can copy a public collection into their account.

For MVP, copy the collection and its links. Do not implement live syncing.

### Phase 2 Acceptance Criteria

A visitor can:

1. Open a public profile.
2. Browse public collections.
3. Open links.
4. Share a collection.
5. Search public content.

A logged-in user can:

6. Copy a public collection into their account.
7. Publish their own collection.

---

# 6. Final Product

The final product should become a network of maintained resource collections.

## Link Health

Periodically check links.

Statuses:

```text
UNKNOWN
ACTIVE
REDIRECTED
BROKEN
TIMEOUT
```

Show broken or redirected links to collection owners.

## Freshness

Track:

- Last checked
- Last status change
- HTTP status
- Redirect URL

## Tags

Optional tags for collections/resources.

Examples:

```text
#AI
#React
#Backend
#Design
```

## Fork Collections

Allow users to copy a public collection while keeping source attribution.

## Follow

Users can follow profiles or collections.

## Analytics

For collection owners:

- Profile views
- Collection views
- Link clicks
- Collection copies/forks

Do not expose visitor identity.

## AI

Only add AI after the core product has usage.

Possible uses:

- Suggest tags
- Categorize links
- Detect similar resources
- Organize collections
- Generate collection summaries

AI must support curation, not replace the core product.

---

# 7. Architecture

Use a single Next.js application initially.

```text
Browser
  ↓
Next.js App Router
  ├── Server Components
  ├── Server Actions
  ├── Route Handlers
  └── Public Pages
        ↓
    PostgreSQL
        ↓
      Prisma
```

### Stack

- Next.js
- TypeScript
- React
- Tailwind CSS
- PostgreSQL
- Prisma
- Clerk or Auth.js
- S3-compatible storage for images

Do not add a separate Express backend unless required.

Do not add Redis, queues, Elasticsearch, or microservices initially.

---

# 8. URL Metadata Service

When a user adds a URL:

```text
URL
 ↓
Validate
 ↓
Fetch metadata
 ↓
Store metadata
 ↓
Return link
```

Security requirements:

- Only HTTP/HTTPS
- Request timeout
- Response size limit
- Redirect limit
- Block private/internal IPs
- Protect against SSRF
- Do not execute downloaded content

Metadata fetching can move to a background worker later.

---

# 9. Database Schema

## User

```prisma
model User {
  id          String       @id @default(cuid())
  username    String       @unique
  displayName String?
  bio         String?
  avatarUrl   String?

  collections Collection[]
  links       Link[]

  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt
}
```

## Collection

```prisma
model Collection {
  id            String       @id @default(cuid())
  userId        String

  title         String
  slug          String
  description   String?
  visibility    Visibility   @default(PRIVATE)
  coverImageUrl String?

  user          User         @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  items         CollectionItem[]

  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  @@unique([userId, slug])
  @@index([userId])
  @@index([visibility])
}
```

## Link

```prisma
model Link {
  id            String   @id @default(cuid())
  userId        String

  url           String
  normalizedUrl String

  title         String?
  description   String?
  domain        String?
  faviconUrl    String?
  imageUrl      String?

  user          User     @relation(
    fields: [userId],
    references: [id],
    onDelete: Cascade
  )

  collections   CollectionItem[]

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId])
  @@index([normalizedUrl])
  @@index([domain])
}
```

## CollectionItem

Use a join table so one link can exist in multiple collections.

```prisma
model CollectionItem {
  id           String     @id @default(cuid())
  collectionId String
  linkId       String

  position     Int
  note         String?

  collection   Collection @relation(
    fields: [collectionId],
    references: [id],
    onDelete: Cascade
  )

  link         Link       @relation(
    fields: [linkId],
    references: [id],
    onDelete: Cascade
  )

  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  @@unique([collectionId, linkId])
  @@index([collectionId, position])
}
```

## Visibility

```prisma
enum Visibility {
  PRIVATE
  PUBLIC
}
```

---

# 10. Relationships

```text
User
 ├── Collections
 │      └── CollectionItems
 │              └── Link
 │
 └── Links
```

Relationship rules:

```text
User 1:N Collection
User 1:N Link
Collection 1:N CollectionItem
Link 1:N CollectionItem
```

---

# 11. Routes

## Authentication

```text
/login
/onboarding
```

## Dashboard

```text
/dashboard
/dashboard/collections
/dashboard/collections/new
/dashboard/collections/[id]
/settings
```

## Public

```text
/[username]
/[username]/[collection-slug]
```

## Discovery

```text
/explore
/search
```

---

# 12. Server Actions

Use server actions for application mutations.

```text
createCollection()
updateCollection()
deleteCollection()

createLink()
updateLink()
deleteLink()

addLinkToCollection()
removeLinkFromCollection()
reorderCollectionItems()

updateProfile()
```

Every mutation must verify the authenticated user's ownership.

Never trust a user ID sent by the client.

---

# 13. SEO

Only public content should be indexable.

Public pages need:

- Server-rendered content
- Dynamic title/description
- Canonical URL
- OpenGraph metadata
- Sitemap
- Robots.txt

Private collections must never appear in public search or sitemap data.

SEO depends on useful collections, not simply the number of generated pages.

---

# 14. Performance

Priorities:

- Server-render public pages.
- Keep client-side JavaScript low.
- Add database indexes for common queries.
- Cache public pages where useful.
- Optimize images.

Do not optimize for large-scale traffic before there is actual traffic.

---

# 15. Security

Required from Phase 1:

- Validate all inputs.
- Validate ownership on mutations.
- Use parameterized ORM queries.
- Protect private collections.
- Rate-limit authentication and expensive endpoints.
- Validate URLs before metadata fetching.
- Prevent SSRF.
- Limit metadata request size and time.
- Sanitize user-provided text where rendered as HTML.

---

# 16. Product Metrics

## Phase 1

Track:

- Signups
- Users creating a collection
- Users adding 3+ links
- Collections per user
- Links per collection
- 7-day returning users
- 30-day returning users

## Phase 2

Track:

- Public collections
- Public collection views
- Link clicks
- Shares
- Collection copies
- Public searches

The key validation question:

> Do users create, maintain, and share collections?

---

# 17. Development Order

## Phase 1

```text
1. Project setup
2. Auth
3. User onboarding
4. Username
5. Profile
6. Collection CRUD
7. Link CRUD
8. URL metadata
9. Reordering
10. Private/public visibility
11. Dashboard
12. User search
```

## Phase 2

```text
13. Public profile
14. Public collection
15. SEO metadata
16. Sitemap
17. Sharing
18. Public search
19. Explore
20. Copy collection
21. Basic analytics
```

## Final Product

```text
22. Link health
23. Freshness checks
24. Tags
25. Categories
26. Forking
27. Following
28. Advanced search
29. AI-assisted organization
30. Advanced analytics
31. Custom domains
32. Monetization
```

---

# 18. MVP Boundary

The first production version should be:

```text
Auth
 ↓
Profile
 ↓
Collections
 ↓
Links
 ↓
Automatic metadata
 ↓
Private/Public
 ↓
Public profile
 ↓
Public collection
 ↓
Sharing
 ↓
Basic public search
```

Do not expand the scope until this workflow is working reliably.

---

# 19. Product Direction

### Phase 1

**Personal resource organization**

> "I need a place to organize useful links."

### Phase 2

**Public resource sharing**

> "I want to publish and share my collections."

### Final

**Maintained resource collections**

> "I want useful collections that can be discovered, reused, and kept up to date."

The product should stay focused on one core object:

**a useful collection of links.**
