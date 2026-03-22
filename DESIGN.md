# Design Guidelines

**Product:** Canvassy
**Last Updated:** March 19, 2026

---

## Design Philosophy

Canvassy should feel like sitting at a warm desk at night with a good lamp on. Not clinical. Not stark. The light is soft and amber, the surface is comfortable, and everything in view invites you to think and write. Nothing competes for attention. The UI recedes — the ideas come forward.

> Reference feeling: warm incandescent light from a nightstand. Intimate, calm, slightly golden.

---

## Color Palette

All colors are defined as CSS variables in `theme/tokens.css`. No hardcoded values anywhere else in the codebase.

### Base Colors

| Token | Value | Usage |
|---|---|---|
| `--color-canvas-bg` | `#F5F0E8` | Infinite canvas background — warm parchment |
| `--color-card-bg` | `#FDFAF5` | Card surface — slightly lighter and brighter than canvas |
| `--color-card-summary-bg` | `#F0EBE1` | Summary section at bottom of card — visually distinct from body |
| `--color-card-border` | `#E2D9CC` | Card border — subtle, warm |
| `--color-text-primary` | `#2A1F1A` | Main body text — warm near-black, never pure #000 |
| `--color-text-secondary` | `#8C7B6E` | Secondary text, placeholders, labels, system copy |
| `--color-text-muted` | `#B5A99A` | Word count, metadata, very low-emphasis text |

### Accent (Dusty Rose)

| Token | Value | Usage |
|---|---|---|
| `--color-accent` | `#C08B85` | Primary accent — buttons, active states, arrow highlights |
| `--color-accent-hover` | `#AE7A74` | Hover state for accent elements |
| `--color-accent-soft` | `#EDD9D6` | Soft accent background — selected card border, focus rings |

### Functional Colors

| Token | Value | Usage |
|---|---|---|
| `--color-word-count-warn` | `#C9924A` | Word count warning (approaching 500) — warm amber, not red |
| `--color-word-count-limit` | `#B85C4A` | Word count at limit — muted terracotta |
| `--color-connection-default` | `#B5A99A` | Default arrow/connection color |
| `--color-connection-selected` | `#C08B85` | Selected connection — uses accent |

---

## Typography

Typography is split by context: **serif for writing, sans-serif for everything else.**

### Fonts

| Token | Font | Usage |
|---|---|---|
| `--font-writing` | `'Lora', Georgia, serif` | Card body text — the writing experience |
| `--font-ui` | `'Inter', system-ui, sans-serif` | All UI chrome: labels, buttons, titles, word count, summary |

### Type Scale

| Token | Size | Weight | Usage |
|---|---|---|---|
| `--text-card-body` | `16px` | `400` | Card body writing (serif) |
| `--text-card-summary` | `13px` | `400` | Summary section text (sans-serif) |
| `--text-label` | `11px` | `500` | System labels, word count, metadata (sans-serif, uppercase tracking) |
| `--text-connection-label` | `12px` | `400` | Arrow label text (sans-serif) |

### Headings

All headings use serif font (Iowan Old Style, Palatino, Georgia) with weight 600, line-height 1.3, and **no margins**.

**Base font size**: 16px (all em calculations are relative to this)

| Level | Font Size | Padding (Top/Bottom) |
|---|---|---|
| H1 | `2em` (32px) | `0.3em` (4.8px) |
| H2 | `1.7em` (27.2px) | `0.255em` (4.08px) |
| H3 | `1.4em` (22.4px) | `0.21em` (3.36px) |

**Padding formula**: Top and bottom padding = 0.15× the heading font size.

### Line Height & Spacing

- Body writing: `line-height: 1.75` — generous, easy to read, feels like a real document
- Headings: `line-height: 1.3` — tighter for hierarchy
- UI text: `line-height: 1.4`
- Paragraph spacing inside cards: `margin-bottom: 1em`
- List indentation: `padding-left: 1.5em`

---

## Cards

Cards are the core unit of the app. They should feel like a modern note-taking app — bounded, clean, and comfortable to write in. Not sticky notes. Not whiteboard boxes.

### Anatomy

```
┌─────────────────────────────┐
│  ≡  ·  ·  ·  ·  [✏️] [🗑]   │  ← header bar: drag handle + edit + delete
├─────────────────────────────┤
│  Body text lives here.      │  ← serif, primary text color
│  Markdown rendered inline.  │  ← click to edit inline
│                             │
├─────────────────────────────┤
│  Summary                    │  ← visually distinct section
│  User-written summary text  │  ← slightly darker bg, sans-serif
├─────────────────────────────┤
│  58 / 500 words             │  ← word count (when body has content)
└─────────────────────────────┘
```

### Header Bar
- Always visible — not hidden on hover
- Background: `#E2D9CC` — clearly a different zone but not jarring
- Height: compact (28px) — functional, not decorative
- Contains a subtle **drag indicator** (row of dots) on the left
- Contains an **edit button** (✏️) to open full-screen editor
- Contains a **delete icon** (🗑) on the right — turns red on first click for confirmation
- Cursor changes to `grab` on hover, `grabbing` while dragging

### Connection Handles
- Appear on hover anywhere over the card
- 4 handles total — one at the center of each edge (top, bottom, left, right)
- Small filled circles, ~8px diameter
- Color: `var(--color-accent)` — dusty rose, so they're clearly interactive
- Subtle scale-up on hover (`1.0` → `1.2`) to confirm interactivity
- Disappear when cursor leaves the card

### Style Rules

- **Width:** Fixed width (~320px), height grows with content
- **Border radius:** `12px` — modern, not bubbly
- **Border:** `1px solid var(--color-card-border)`
- **Shadow:** Soft, warm — `0 2px 12px rgba(42, 31, 26, 0.07)` — suggests lift without drama
- **Shadow on hover/selected:** Slightly more pronounced — `0 4px 20px rgba(42, 31, 26, 0.12)`
- **Selected state:** Border changes to `var(--color-accent-soft)`, 2px
- **No sharp corners, no harsh lines**

### Summary Section

- Separated from body by a subtle 1px warm divider
- Background: `#F0EBE1` — clearly a different zone
- Label: `SUMMARY` in small caps, `var(--color-text-muted)`
- Text: `var(--font-ui)`, `var(--color-text-secondary)`

### Semantic Zoom

Cards adapt their display based on zoom level to help users see the "big picture":

**Zoomed In (≥ 60% zoom):**
- Full card view with header, body, summary, and word count
- Connection handles visible on hover
- All editing features available

**Zoomed Out (< 60% zoom):**
- Cards collapse to show **summary only**
- Compact size (280px width vs 320px)
- Centered text, muted colors
- Connection handles remain functional (invisible)
- Perfect for seeing canvas structure and relationships
- Summary text becomes the card's identity at this zoom level

This allows users to zoom out and see their entire thinking landscape, then zoom in to read and edit specific cards.

---

## Writing Experience

Canvassy offers **two editing modes** to match different workflows:

### Inline Editing (Quick Edits)
- Click directly on card body or summary to edit in place
- Textarea appears with same styling as rendered view
- Markdown preview updates when you click outside
- Perfect for quick changes and short notes
- No modal, stays in canvas context

### Full-Screen Editor (Deep Focus)
- Click the **✏️ edit button** in card header
- Overlay dims the canvas (backdrop-filter blur)
- **TipTap WYSIWYG editor** — full-width, full-height
  - Rich text editing with visual formatting
  - StarterKit extensions (headings, bold, italic, lists)
  - Placeholder text when empty
  - Character count for word limit enforcement
  - Prose styling with Lora serif font
- Word count badge in header with color-coded warnings:
  - Normal: gray badge, `#F5F0E8` background (< 450 words)
  - Warning: `#C9924A` text, `#FFF3E0` background (450-499 words)
  - Limit: `#B85C4A` text, `#FFEBEE` background (500 words)
- Summary input field at bottom
- Close with **Escape key** or **X button**
- Click outside overlay to close and save
- Smooth animations: fade-in overlay + slide-up editor (300ms)

---

## Connections (Arrows)

Arrows should be understated by default — they're connective tissue, not the main event.

- **Default color:** `#8C7B6E` (warm gray) via CSS variable
- **Line weight:** 2px
- **Line styles:** Solid, dashed (5,5), or dotted (2,2)
- **Arrowheads:**
  - Forward (A → B): Arrowhead at end
  - Backward (B → A): Arrowhead at start
  - Both (A ↔ B): Arrowheads at both ends
  - None (A — B): No arrowheads
  - SVG markers dynamically generated per edge with unique IDs
- **Labels:**
  - Small text (16px), sans-serif, positioned at midpoint of line
  - Semi-transparent warm background (`rgba(253, 250, 245, 0.9)`)
  - Rounded corners (4px), subtle border
  - Hover effect: background becomes opaque, border shows accent color
  - Fully clickable with proper pointer-events handling
- **Invisible wider path:** 20px wide transparent path for easier clicking

### Label Editing (Double-Click or Click Label)
Double-clicking an arrow or clicking an existing label opens inline editing:

- **Inline input field** appears at connection midpoint
- **Auto-focused** with text pre-selected for quick replacement
- **Width:** 200px, centered on connection
- **Styling:** White background, accent border (2px), soft shadow
- **Save:** Press Enter or click outside to save
- **Cancel:** Press Escape to discard changes
- **Empty labels:** Removed from display (connection shown without label)

### Arrow Popover (Single-Click)
Single-clicking an arrow reveals a floating control panel via `foreignObject` SVG element:

- **Position:** Anchored near midpoint of the line (25px below)
- **Styling:** Warm white background, soft shadow, 8px border radius
- **Size:** 300px width, 60px height (single row)
- **Contains:**
  - Line style dropdown — solid/dashed/dotted options
  - Directionality dropdown — A→B / B→A / A↔B / A—B with arrow symbols
- **Dismisses automatically:**
  - When clicking elsewhere on canvas
  - When pressing Escape key
- **Delete connection:** Press Delete or Backspace key while popover is open
- **Does not close:** When clicking the same edge again (stays open)
- All changes save immediately to store + localStorage

---

## Canvas

- **Background:** `#F5F0E8` (warm parchment) — plain, no grid, no dots
- The warmth of the canvas color itself creates texture without adding visual noise
- **Infinite pan and zoom:** Smooth trackpad/scroll wheel support via React Flow
- **Double-click to create:** Click canvas twice to add a new card at that position

### Settings Panel

**Settings Button** (top-right corner):
- Floating button with ⚙️ gear icon
- 48x48px, rounded corners (12px radius)
- Background: `#FDFAF5` with `#E2D9CC` border
- Hover: lifts up 2px with enhanced shadow
- Z-index: 1000 (above canvas, below modals)

**Settings Panel** (slides from right):
- Width: 400px (max 90vw on mobile)
- No backdrop - canvas remains fully interactive
- Slides in from right with 300ms ease-out transition
- **Structure:**
  - Header: Title + close button, `#F0EBE1` background
  - Content: Scrollable area with sections and settings
  - Footer: "Done" button, `#F0EBE1` background
- **Close methods:**
  - Escape key
  - X button in header
  - Done button in footer
- Purpose: Test different interface concepts and settings

### Navigation Controls

**MiniMap** (bottom-right):
- Small overview showing all cards as rectangles
- Node color: `#E2D9CC`, border radius: 8px
- Background: `#FDFAF5` with 1px border
- Mask color: semi-transparent overlay
- Click to jump to canvas areas quickly

**Controls** (bottom-left):
- Zoom in/out buttons (+/−)
- Fit view button (center all content)
- Lock/unlock interaction button
- Styled with warm colors matching theme
- Background: `#FDFAF5` with 1px border

---

## Interaction & Motion

- Keep animations minimal and purposeful
- **Card appear:** subtle fade + scale up from 0.95 → 1.0, ~150ms ease-out
- **Writing mode expand:** smooth width/height transition, ~200ms ease-in-out
- **Zoom:** native React Flow zoom, no custom animation needed
- **No bouncy or springy animations** — the mood is calm, not playful

---

## What to Avoid

- Pure white (`#FFFFFF`) or pure black (`#000000`) anywhere
- Bright, saturated colors — every color should feel like it has a little warmth mixed in
- Heavy drop shadows or excessive depth
- Busy backgrounds — the canvas is empty on purpose
- System-default blue focus rings — replace with `var(--color-accent-soft)` outlines
- Clutter near the writing area — when someone is writing, nothing should compete

---
