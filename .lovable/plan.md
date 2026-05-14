# Plan

This is a large pass. I'll group it into 5 buildable chunks. Confirm before I build.

## 1. Books fit on mobile
- Add a responsive scale: detect viewport ≤640px and multiply each book's `width`/`height` by ~0.55 so the full row fits without wrapping or overflowing the shelf.
- Tighten gap between spines on small screens.
- Shelf grows to viewport width; books never extend past the plank.

## 2. Pet system rebuild
Pets are no longer prompts — they live in a "void" slot above each book.

Flow when the void above a book is clicked:
1. Charcoal popup: **"Would you like pet support today?"** — Yes / No only.
2. On Yes → selection sheet listing the 6 pets:
   - Cozy Cat 🐈, Romance Movie Dog 🐕, Whimsical Dragon 🐉, Spa Phoenix 🦩, Nature Bird 🐦, Planner Hamster 🐹
3. Below the picker, three toggles with checkbox-bubbles:
   - Enable light animations
   - Enable simple editable pet to-do list (when on, surfaces non-overwhelming suggested tasks the user can add/remove)
   - (room for future)
4. Footer button: **"Save for now? You can change anything at any time."**
5. Saved pet sits on top of the book. Click pet → same popup to change/delete.
6. In Basic atmosphere this slot is hidden on the shelf (will appear elsewhere later).

## 3. Side panel — strip down
- Remove the big "Menu" tab. Replace with a subtle right-edge arrow `‹`. Click once to open; click again (or click the same arrow when open) to hide the arrow entirely. Sliding from the right edge brings it back.
- Remove the "Workshop / Customize" header.
- Remove the word "swipe" everywhere in the panel.
- Make the panel skinny (~64vw / max 280px) with large simple type.
- Replace accordion sections with a flat, single-column list of individual rows — each row is one setting, top-to-bottom, scannable in seconds.
- Remove all per-book color pickers and theme-toggle from the panel (book-related settings live inside the book itself, kept hyper simple).
- Top of panel, in this exact order:
  1. **SLAP TO BASIC** — resets atmosphere/tone/mice/sound to Basic, leaves nothing else changed
  2. **SHUT IT!** — instantly mutes all SFX & resets sound prefs to Basic, nothing else changed
  3. **TALK TO ME** — toggles speech-to-text + visually-impaired support, with verbal on/off via common commands ("talk to me on/off", "stop listening")
- Bottom row: **"Remove Settings section from library"** (hides the Settings book on the shelf).

## 4. Atmospheres, Tones, Mice (the themed system)
Three submenus on the panel, each presenting the SAME labeled order everywhere:

`Basic · Cozy · Whimsical · Romantic · Spa · Nature · Paper Planner · Custom`

**Atmospheres (skins)** — visual themes:
- Basic (neutral default), Cozy (default look — hygge / French cozy / cozy game), Whimsical (hobbit-hole; sub-options Adventurer / Romantic Princess), Romantic (hearts + lace; color options red/hot pink/light pink/light purple/dark purple/black/grey), Spa (minimal nature meditation, no cultural appropriation), Nature (sub-options forest/desert/beach/garden/sky/night/pond/swamp + seasonal toggle each), Paper Planner, Custom (blank code slots in every field).

**Tones (voice/copy vibe)** — all gentle, lean humorous/quirky:
- Same 8 labels. Affects wording of notifications, button labels, microcopy.

**Mice trails** — same 8 options:
- Basic: grey, no sound ever
- Cozy: warm 90s cozy-game trail
- Whimsical: sparse goldenrod diamond-sparkle particles that pop like bubbles; gentle sparkle SFX if enabled
- Romantic: hearts in chosen romantic color, defaults red; pop SFX if enabled
- Spa: soft trail with gentle meditation-bell SFX if enabled
- Paper Planner: fine-tip black marker / highlighter; marker scratch SFX if enabled
- Nature: leafy/wind trail with wind SFX if enabled
- Custom: popup explaining where to paste custom mouse code + optional SFX slot

I will scaffold the system and infrastructure for all of these with clean toggles and the trail/sound dispatcher. The actual particle art for each (sparkles, hearts, bells, marker, wind) I'll implement as simple but tasteful CSS/canvas — open to refinement later.

## 5. Pop-up & color rules
- All popups across the app use the same light-charcoal sheet, gentle, never bombarding, always ask before displaying further options.
- Settings book opens straight into the side panel (not its own page).

## Out of scope this pass
- Real text-to-speech voices and live SFX assets (will stub buttons + play simple WebAudio tones; can wire ElevenLabs later if you want).
- Implementing the actual content of each Atmosphere skin's full visual treatment beyond color/typography presets (deep skin work is its own pass per atmosphere).
- The "elsewhere" location for pets in Basic mode (deferred per your note).

## Technical notes
- New file `useSettings` fields: `atmosphere`, `tone`, `mice`, `sfxEnabled`, `petsBookConfig` (per-book pet + animations + todoEnabled + todoItems), `talkToMe`, `arrowHidden`, `showSettingsBook`.
- New components: `PetPopup.tsx` (the Yes/No → picker → save flow), `ConfirmSheet.tsx` (reusable charcoal popup), `MiceTrails.tsx` (mounted globally, switches behavior on `mice`).
- Side panel rewritten as a flat list, no `<Section>` accordion.
- Mobile scale handled inside `BookSpine` via `useIsMobile` hook (already in repo).

Reply "go" to build, or tell me what to change.
