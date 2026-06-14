# Pantri

A clean, fast pantry inventory and household shopping list mobile app. Track
what you have, get notified when you're running low, and keep shopping lists
in sync across everyone in your household — all open source, self-hostable on
a free Convex + EAS deployment.

## What problem this solves

Most households lose track of what's in the pantry until they're standing in
front of an empty shelf. Shopping lists live in scattered notes, texts, and
memory. Recipes get re-typed into shopping lists every time. Pantri fixes all
three by tying pantry stock, shopping lists, and recipes together in one
place that everyone in the household can see and update in real time.

## Tech stack

- **Frontend**: React Native + Expo (Expo Router) + TypeScript
- **Styling**: NativeWind (Tailwind for React Native)
- **Motion**: React Native Reanimated + Moti (or Reanimated directly)
- **Icons**: `@tabler/icons-react-native` (or Lucide RN as fallback)
- **Backend**: Convex (database, server functions, real-time sync, cron jobs)
- **Auth**: Convex Auth (email/password + Google OAuth via Expo AuthSession,
  fully custom UI)
- **Navigation**: Expo Router (file-based, supports tabs + stacks natively)
- **Local persistence/offline cache**: Convex's React Native client + AsyncStorage
- **Build & distribution**: EAS Build + EAS Submit (Expo Application Services)
- **Hosting**: Convex Cloud (backend) — free tier; EAS free tier for builds

Every piece of this stack is free for a household-scale deployment. Other
self-hosters create their own free Convex account and EAS account, plug their
own keys into `.env`, and build their own app binaries — no shared
infrastructure, no cost to you.

---

## Core concepts

- **Household** — the top-level container. Has members, pantry, lists, recipes,
  and categories. A user belongs to one household (multi-household support is
  a possible future extension, not v1).
- **Roles** — `owner` (full control), `editor` (day-to-day use), `viewer`
  (read-only + tick off shopping items).
- **Categories** — group pantry items and shopping list items (e.g. Grains,
  Proteins, Dairy, Produce, Condiments, Cleaning). Predefined defaults, owner
  can add/rename/reorder.

---

## Module 1 — Pantry

The home inventory. This is the source of truth for what's in the house.

**Functionality**
- Dashboard with stats: total items, items running low, items expiring soon
- Add item: name, category, quantity type (count or amount+unit), current
  stock, minimum threshold, optional expiry date
- Quick +/- stock adjustment on each item
- Search by name, filter by category, sort by name/quantity/date added
- Visual stock level indicator (progress bar) per item
- Expiry tracking — visual warning within 3 days of expiry, distinct flag once
  expired
- **Auto low-stock detection** — when stock drops to or below the set
  threshold, the item is automatically added to the monthly restock list

**Screens** (Expo Router — `app/(tabs)/pantry/`)
- `index.tsx` — dashboard + item list (root tab, logo header)
- `add.tsx` — add item form (modal, X + Save header)
- `[id]/edit.tsx` — edit item form (modal, X + Save header)
- Category filter — bottom sheet component, not a route

---

## Module 2 — Lists

Shopping lists. Three flavours living in one module.

**Functionality**
- **Monthly restock list** — auto-populated from pantry low-stock items,
  grouped by category or store aisle (choosable per list), resets/archives
  monthly
- **Custom lists** — create freely for any purpose (trip, party, random
  errands), name it, add items manually
- Items can be typed manually or pulled from pantry
- Grouping style (category vs aisle) chosen per list
- Tick-off mode with satisfying check animation; ticked items move to bottom
- Optional setting: ticking an item updates the corresponding pantry stock
- Items tagged by origin — `auto` (from low-stock), `recipe` (pushed from a
  recipe), or plain manual entry
- Archive completed lists

**Screens** (Expo Router — `app/(tabs)/lists/`)
- `index.tsx` — all lists, monthly pinned at top (root tab, logo header)
- `[id].tsx` — list detail, grouped items, tick-off (stack screen, back header)
- New list — bottom sheet component, not a route

---

## Module 3 — Recipes

**Important scope note**: Recipes in Pantri are ingredient lists with serving
sizes — NOT cooking instructions. No steps, no method, no photos, no
nutrition info. Just: name, base servings, ingredients + quantities. The goal
is "save this ingredient list once, generate a scaled shopping list from it
anytime."

**Functionality**
- Create/edit recipe: name, base serving count, ingredient list (name,
  amount, unit, category)
- Drag to reorder ingredients
- Duplicate a recipe as a starting point for a variation
- Push to list flow:
  1. Adjust servings — quantities scale proportionally, shown as
     before → after
  2. Choose target list — existing list or create new
  3. Confirm — ingredients merge into the list; duplicates combine
     quantities rather than duplicating entries
- Recipes are saved permanently and reusable indefinitely

**Screens** (Expo Router — `app/(tabs)/recipes/`)
- `index.tsx` — saved recipes as cards (root tab, logo header)
- `new.tsx` — create recipe (modal, X + Save header)
- `[id]/edit.tsx` — edit recipe (modal, X + Save header)
- `[id]/push.tsx` — 3-step push flow (modal/full-screen, tab bar hidden, X to
  dismiss)

---

## Module 4 — Household & Settings

**Functionality**
- Profile — name, avatar, email, password (disabled for Google accounts)
- Household — rename, view stats (members/items/lists), danger zone (delete
  household)
- Members — list with roles, role management (owner only), remove member
- Invites — generate shareable link with role + expiry (default 7 days or
  first-use), copy to clipboard, regenerate
- Categories — reorder (drag), rename, add custom, delete custom (owner only,
  default categories can't be deleted)
- Preferences — low stock alerts toggle, expiry reminder toggle, auto-update
  pantry on tick toggle, language (English only for now, i18n-ready)
- Push notification permission prompt (Expo Notifications)
- Sign out / delete account

**Screens** (Expo Router — `app/(tabs)/settings/`)
- `index.tsx` — main settings (root tab, logo header)
- `profile.tsx` — edit profile (modal, X + Save header)
- `household.tsx` — household info + members + invites (stack screen, back
  header — primarily a viewing/management screen)
- `categories.tsx` — category list with reorder/delete (stack screen, back
  header — viewing/management screen)
- Add/rename category — modal (X + Save header), launched from
  `categories.tsx`
- Invite member — modal (X + Generate header), launched from `household.tsx`
- Change member role — bottom sheet, not a route

---

## Auth & invite flow

- `app/(auth)/login.tsx` — "Continue with Google" only (Expo AuthSession)
- `app/(auth)/signup.tsx` — same Google sign-in; on first login with no
  existing household, auto-creates a new household + owner membership +
  default categories. (May be merged into a single `welcome.tsx` screen since
  there's no separate form — "Continue with Google" does both.)
- `app/(auth)/join.tsx` — deep link `pantri://join?code=...` (and universal
  link fallback), reads invite code, shows household preview, "Continue with
  Google" to authenticate, then creates `householdMembers` record with the
  invite's pre-set role

### Invite flow, step by step

1. **Owner generates an invite** — from `settings/household.tsx`, opens the
   "Invite member" modal, picks a role (editor/viewer). A Convex mutation
   creates an `invites` row: random code, role, `createdBy`, `expiresAt` (7
   days default).
2. **Owner shares the link** — `pantri://join?code=xk92p`, with a web
   fallback URL (simple landing page) for sharing via WhatsApp/iMessage/email.
3. **Invitee opens the link** — if Pantri is installed, deep link routes
   directly to `join.tsx`. If not, the web fallback shows install
   instructions + App Store/Play Store links.
4. **Join screen validates the code** — Convex query checks the invite
   exists, isn't expired, isn't used. Shows a preview: "You've been invited to
   join **The Okafor House** as **Editor**." Invalid/expired codes show a
   clear error with no Google button.
5. **Invitee taps "Continue with Google"** — same OAuth flow as normal
   sign-in.
6. **Membership is created** — after Google auth succeeds, a Convex mutation
   re-validates the code, creates the `householdMembers` row with the
   invite's role, marks the invite as `usedBy`. Invitee lands in
   `(tabs)/pantry`.
7. **Existing-household edge case** — if the authenticated user is already a
   member of a different household (v1 doesn't support multi-household),
   `join.tsx` shows a message explaining they're already in a household and
   would need to leave it first, rather than silently switching them.

Role enforcement happens **server-side** via a shared `requireRole()` helper
called at the top of every Convex mutation — UI hides controls for lower
roles, but the backend is the actual gate.

---

## Data model (Convex schema, simplified)

```
users                 — managed by Convex Auth, extended with displayName, avatar
households            — name, ownerId, createdAt
householdMembers      — householdId, userId, role, joinedAt
invites               — householdId, code, role, createdBy, expiresAt, usedBy
categories            — householdId, name, icon, color, isDefault, order
pantryItems           — householdId, name, categoryId, qtyType, amount, unit,
                         threshold, expiryDate, addedAt
shoppingLists         — householdId, name, type, groupBy, createdAt, archivedAt
listItems             — listId, name, categoryId, amount, unit, ticked,
                         autoAdded, pantryItemId, recipeId
recipes               — householdId, name, baseServings, createdAt
recipeIngredients     — recipeId, name, amount, unit, categoryId
```

---

## Navigation pattern

- **Tab bar** — fixed across all screens, 4 tabs: Pantry, Lists, Recipes,
  Settings (Expo Router `(tabs)` layout group, native bottom tab navigator)
- **Header — root tabs** — Pantri logo left, contextual actions right
  (search/bell/avatar on Pantry, + New on Lists/Recipes, nothing extra on
  Settings)
- **Header — stack screens** — back arrow + screen title + contextual action,
  provided by Expo Router's native stack header. Used for screens that mainly
  *view or manage* something (list detail, household info, category list)
- **Header — modal screens** — X (or Cancel) on the left, screen title centre,
  primary action (Save / Generate / Add) on the right, `presentation: 'modal'`,
  tab bar hidden. **Rule of thumb: any screen whose sole purpose is to create
  or directly mutate a record — add item, edit item, new recipe, edit recipe,
  edit profile, add/rename category, invite member — is a modal.** List
  detail and household/category overview screens stay as stack screens since
  they're primarily for viewing, even though actions happen within them.
- **Focused multi-step flows** (e.g. recipe push-to-list) — also
  `presentation: 'modal'`, X to dismiss, tab bar hidden

---

## Design system notes

- Brand accent: teal green (`#1D9E75` / `#E1F5EE`)
- Module accents: Pantry = teal, Lists = amber, Recipes = purple
- Border radius system (via NativeWind): `rounded-lg` (8px, chips/badges/icon
  buttons), `rounded-xl` (12px, inputs/list items/cards), `rounded-2xl` (16px,
  modals/large cards), `rounded-full` (category filter pills)
- Light mode only for v1
- Iconography: `@tabler/icons-react-native`
- Motion: tick-off animations, progress bar fills, list reordering via
  Reanimated — used deliberately, not decoratively
- Safe area handling via `react-native-safe-area-context` throughout
  (notches, home indicators)

---

## Step-by-step build plan

### Stage 0 — Project setup
1. Scaffold project with `npx create-expo-app` (TypeScript template, Expo
   Router enabled)
2. Install and configure NativeWind + Tailwind config for React Native
3. Install Reanimated, `@tabler/icons-react-native`, `react-native-svg`,
   `react-native-safe-area-context`, `react-native-gesture-handler`
4. Set up Convex project (`npx convex dev`), install `convex/react` +
   AsyncStorage adapter for the RN client
5. Set up `app/(tabs)` layout group with native tab navigator (Pantry, Lists,
   Recipes, Settings) and shared header styling
6. Set up `app/(auth)` layout group for login/signup/join, outside the tab
   navigator

### Stage 1 — Auth & household foundation
7. Configure Convex Auth with Google OAuth provider
8. Wire Google OAuth via Expo AuthSession (`expo-auth-session` +
   `expo-web-browser`) into Convex Auth
9. Build `app/(auth)/login.tsx` (or `welcome.tsx`) — single "Continue with
   Google" screen
10. Define Convex schema: `households`, `householdMembers`, `categories`
    (seed defaults on household creation)
11. On first login with no existing household, auto-create household + owner
    membership + default categories
12. Build basic `app/(tabs)/settings/index.tsx` with sign out
13. Set up Expo deep linking scheme (`pantri://`) for invite links

### Stage 2 — Pantry module
14. Define `pantryItems` schema + Convex queries/mutations (scoped to
    household, role-checked)
15. Build `app/(tabs)/pantry/index.tsx` — dashboard stats + item list +
    search/filter
16. Build `pantry/add.tsx` and `pantry/[id]/edit.tsx`
17. Implement quick +/- stock controls
18. Implement expiry visual states
19. Implement low-stock auto-flagging logic (mutation-level check on stock
    update)

### Stage 3 — Lists module
20. Define `shoppingLists` + `listItems` schema + queries/mutations
21. Build `app/(tabs)/lists/index.tsx` — list overview, monthly list
    auto-created per household
22. Build `lists/[id].tsx` — grouped items, tick-off mode, progress bar
23. Wire low-stock pantry items → auto-add to monthly list (Convex mutation
    triggered from Stage 2 step 19)
24. Build "new list" bottom sheet (`@gorhom/bottom-sheet`) for custom lists
25. Implement optional "tick updates pantry stock" behaviour

### Stage 4 — Recipes module
26. Define `recipes` + `recipeIngredients` schema + queries/mutations
27. Build `app/(tabs)/recipes/index.tsx` — recipe cards
28. Build `recipes/new.tsx` and `recipes/[id]/edit.tsx` — ingredient builder
    with drag reorder (`react-native-draggable-flatlist`)
29. Build `recipes/[id]/push.tsx` as a modal screen — 3-step flow (adjust
    servings → choose list → confirm), including merge-by-name logic

### Stage 5 — Household & roles
30. Build `app/(tabs)/settings/household.tsx` — household info, member list,
    role management
31. Build invite generation (`invites` table) + `app/(auth)/join.tsx` deep
    link flow
32. Implement `requireRole()` helper, apply to all write mutations
33. Build `app/(tabs)/settings/categories.tsx` — reorder/rename/add/delete

### Stage 6 — Polish
34. Empty states for all modules (Pantry, Lists, Recipes)
35. Motion pass — tick animations, progress bars, screen transitions
    (Reanimated)
36. Notification preferences + `expo-notifications` setup (local first, push
    later)
37. App icon, splash screen (`expo-splash-screen`), and branding assets
38. Tablet/larger-screen layout check

### Stage 7 — Open source readiness
39. Write `.env.example` with all required keys (Convex deployment, Google
    OAuth client IDs for iOS/Android/web)
40. Write self-hosting README: Convex setup, EAS account setup, building
    your own dev/preview/production builds
41. Add `eas.json` with build profiles (development, preview, production)
42. Add LICENSE
43. Final pass on seed data / onboarding for first-run households

### Stage 8 — Build & ship
44. EAS development build for testing on physical devices
45. EAS preview builds shared via internal distribution (for household
    beta testing)
46. EAS production build + submit to App Store ($99/yr) and Google Play
    ($25 one-time) when ready

### Stage 9 — Future (post-v1)
- Activity log / member activity feed
- Push notifications (low stock, expiry) via `expo-notifications` +
  Convex scheduled functions
- i18n — additional languages (`expo-localization` + i18next)
- Multi-household support per user
- Offline queue for actions made without connectivity
