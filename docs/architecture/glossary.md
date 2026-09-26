# Glossary

## Table of Contents
1. [Terms](#1-terms)

---

## 1. Terms

| Term | Meaning | Not to be confused with |
|---|---|---|
| Collection | A user's named, ordered list of links, `PRIVATE` or `PUBLIC` | A category |
| Link | One saved URL with its metadata, owned by a user. Shared by every collection that holds it | A collection item |
| Collection item | The placement of a link in one collection, with a `position` | The link itself: removing an item does not edit the link |
| `normalizedUrl` | The URL after normalization (D15). Used to block duplicates per user | `url`, the address as the user entered it |
| `publicId` | A collection's permanent 6-char public URL segment (`/u/{username}/{slug}/{publicId}`), set once at creation, unchanged by rename or slug change (C3.1) | The collection's `id` (internal, never in a public URL); the `slug` (changes on rename) |
| Remove (link) | Deletes one collection item; deletes the link if it was the last item | Delete (link): removes the link from every collection |
| Move (link) | Changes which collection an item belongs to | Copy |
| Metadata | Title, description, domain, favicon URL, image URL fetched when a URL is first saved; user-editable | Page SEO metadata (`generateMetadata`) |
| Visibility | `PRIVATE` (default, owner only) or `PUBLIC` (anyone, indexable) | Access control on `/app` routes |
| System category | Seeded category (`userId = null`), same for all users, used in explore filter | Custom category: created by one user, visible on their items only |
| Copy (collection) | Snapshot of another user's public collection into your account, starts `PRIVATE`; keeps `sourceCollectionId`, no sync | Fork (final product): copy with visible attribution |
| Allow copy | Per-collection setting (`allowCopy`, default on, C3.2): whether other members can copy a `PUBLIC` collection. Off hides the Save button and refuses `copyCollection` | Visibility: a `PRIVATE` collection can't be copied regardless of this setting |
| Member / onboarded user | Has a Clerk session and a `User` row with a username | Signed-in user without a `User` row |
| Reserved username | Name blocked because it matches an app route or system word | A taken username |
| Owner | The user whose `userId` is on a record | Admin |
| Social link | A profile link (plan 7, `SocialLink`): a handle for YouTube, Instagram, X, GitHub or LinkedIn (URL built from a fixed prefix), or a full `https://` URL for Website/Other. Public on `/u/{username}` | A link: a saved URL inside collections |
