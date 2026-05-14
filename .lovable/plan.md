# Stress-Free Home Help — Bookshelf Main Menu

A cozy, wall-mounted bookshelf as the app's home screen. Each menu item is a book standing on the shelf. Clicking a book pulls it forward and opens it to reveal a "table of contents" (the submenu). Books can be toggled on/off the shelf via a small edit affordance.

## Scope (this pass)

- Home route only (`/`). Submenu items are visual placeholders — they don't navigate anywhere yet.
- No backend, no persistence beyond `localStorage` for which books are on the shelf.
- Desktop + mobile responsive.

## Books on the shelf

Six books, each with a title, spine color, and table of contents:

1. **Dashboard** — Overview, Today, This Week, Quick Stats
2. **Spaces** — Home, Work, Garden, Projects, Kitchen
3. **Settings** — Profile, Preferences, Notifications, Theme
4. **About** — Our Story, How It Works, Credits
5. **Donate** — One-time, Monthly, Why Support Us

(I'll suggest a sensible TOC for Dashboard/Settings/About/Donate since you only specified Spaces — easy to tweak later.)

## Interaction model

- **Default view**: Books stand upright on a wooden shelf, spines facing out, slightly varied heights/widths/colors for warmth.
- **Hover**: Book tilts forward a few degrees, subtle shadow lift.
- **Click a book**: Book animates out of the shelf and "opens" center-screen as a two-page spread showing its title + table of contents. Click outside / close button returns it to the shelf.
- **Toggle on/off shelf**: A small "Arrange shelf" toggle (top-right) enters edit mode. In edit mode, each book gets a checkbox/pin icon — unchecking removes the book from the shelf (it slides off). Re-checking from a hidden-books tray puts it back. Persisted in `localStorage`.

## Aesthetic

- Cozy reading-nook palette: warm cream background, walnut/oak wood shelf, muted book spines (forest green, oxblood, mustard, dusty blue, cream, terracotta), soft warm lamp glow.
- Typography: a warm serif for book titles (e.g. Fraunces or Lora) + a clean sans for UI chrome.
- Subtle paper/wood textures via CSS gradients + noise. No stock photos.
- Soft ambient motion: gentle book sway on hover, page-turn easing on open.

## Technical notes

- New route file is unnecessary — replace the placeholder in `src/routes/index.tsx`.
- New components under `src/components/bookshelf/`:
  - `Bookshelf.tsx` — the shelf + book layout
  - `Book.tsx` — single book (spine view + open-book view)
  - `BookOpen.tsx` — opened book with TOC
  - `ShelfEditToggle.tsx` — edit-mode controller
- Books data lives in `src/components/bookshelf/books.ts` (id, title, spineColor, height, width, toc[]).
- State: local `useState` for which book is open + edit mode; `localStorage` (via small custom hook) for which book IDs are on the shelf.
- Animation: Tailwind transitions for hover/tilt; CSS transforms for open/close. No new libs needed (can add `motion` later if we want fancier page-turn).
- Design tokens (cream bg, wood, spine accents, warm shadow) added to `src/styles.css` as oklch CSS variables, mapped through `@theme inline` so we use semantic Tailwind classes — no hardcoded colors in components.
- Submenu items render as a styled list; clicking them does nothing yet (no-op handler with a `// TODO: route` comment) so the structure is ready for future routes.

## Out of scope (future passes)

- Real routes for each submenu item
- Persisting custom book order (drag-to-reorder)
- Sound effects (page turn, shelf creak)
- Dark mode / evening lamp variant

Tell me if you want to swap any of the inferred TOC entries, change the book lineup, or pick a specific palette/font before I build.