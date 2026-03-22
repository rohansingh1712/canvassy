# Product Requirements Document (PRD)

**Product Name:** Canvassy *(working title)*
**Status:** Draft
**Last Updated:** March 20, 2026
**Implementation Status:** ✅ MVP Complete

---

## Overview

Canvassy is a canvas-style note-taking web app that lets users think and write spatially. Users create notes in cards, arrange them freely on an infinite canvas, and connect them via arrows to map relationships between ideas. It also provides a focused, high-quality writing experience inside individual cards — supporting both the messy, exploratory phase of thinking and the deeper, focused phase of writing.

---

## Problem Statement

Writing and thinking are non-linear processes, but most note-taking apps force users to work in a linear, hierarchical structure (documents, folders, bullet lists). This creates friction when ideas are still forming — when you're brainstorming, outlining, or trying to see how thoughts relate to each other.

Existing canvas tools (e.g. Miro, FigJam) are built for diagrams and collaboration, not writing. Existing note apps (e.g. Notion, Obsidian) are powerful for writing but weak for spatial thinking.

Canvassy bridges both: a spatial canvas for organizing ideas *and* a great writing experience inside each note.

---

## Goals & Success Metrics

The goal for this version is a working personal prototype — not a polished product. Success means the core loop works end to end.

### MVP Success Criteria ✅
- ✅ A user can open the app and see an infinite canvas
- ✅ A user can create, move, and delete cards on the canvas
- ✅ A user can write in Markdown inside a card with live preview (both inline and full-screen)
- ✅ A user can add a summary to a card that appears at the bottom
- ✅ A user can connect two cards with an arrow and customize its label, direction, and line style
- ✅ Zooming out past a threshold (60%) collapses cards to show only their summary
- ✅ All data persists across page refreshes via localStorage
- ✅ The codebase is structured so individual modules (theme, editor, canvas, connections) can be edited in isolation

---

## Target Users

**Primary user:** Personal use only (single user, no collaboration required at this stage).

The user is someone who thinks non-linearly and wants a tool that matches their mental process — not a structured document editor, not an overly freeform whiteboard. The sweet spot is spatial organization *plus* focused writing.

---

## Features & Requirements

### Core Canvas ✅
- ✅ Infinite, pannable/zoomable canvas (React Flow)
- ✅ Create note cards anywhere via double-click
- ✅ Drag and reposition cards freely by header bar
- ✅ Draw arrows between cards via connection handles
- ✅ Smooth zoom in/out with trackpad/scroll wheel
- ✅ MiniMap in bottom-right for navigation
- ✅ Zoom controls in bottom-left (+/−, fit view, lock)

### Zoom Behavior (Semantic Zoom) ✅
- ✅ **Zoomed in (≥ 60%):** Full card content is visible and readable
- ✅ **Zoomed out (< 60%):** Cards collapse and display only the user-written **summary**
  - Compact size (280px width) with centered text
  - Muted colors to reduce visual noise
  - Connection handles remain functional
  - Perfect for seeing the "shape" of thinking at a glance

### Note Cards ✅
- ✅ Each card has:
  - A **header bar** (28px height, `#E2D9CC` background)
    - Drag handle icon (row of dots)
    - **Edit button** (✏️) — opens full-screen editor
    - **Delete button** (🗑) — requires confirmation (click twice within 3 seconds)
  - A **body** field (320px width, serif font)
    - Click to edit inline with textarea
    - Markdown preview when not editing
    - Click Edit button for full-screen CodeMirror editor
  - A **summary** field — distinct section at bottom
    - Click to edit inline
    - Shown exclusively when zoomed out < 60%
  - A **word count** indicator (when body has content)
    - Color-coded: gray → orange (450+) → red (500, limit reached)
- ✅ **500 word limit** enforced — typing blocked at limit

### Card Interactions ✅

**Creating a card**
- ✅ **Double-click** on canvas creates a new card at that position
- ✅ Cards start with empty body and summary

**Dragging a card**
- ✅ Cards are dragged by the **header bar** only
- ✅ Body and summary have `nodrag` class to prevent dragging
- ✅ Cursor shows `grab` on header, `grabbing` while dragging

**Deleting a card**
- ✅ Click **delete icon** (🗑) in header — button turns red
- ✅ Click again within 3 seconds to confirm deletion
- ✅ Timeout resets if you wait too long (safety feature)
- ✅ Deletes card and all connected edges automatically

**Connecting cards**
- ✅ Hover on card reveals **4 connection handles** (12px circles, brown `#8C7B6E`)
- ✅ Positioned at top, right, bottom, left edges
- ✅ Fade in/out with opacity transition (0.2s)
- ✅ Drag from any handle to another card's handle
- ✅ **Loose connection mode** — snaps to nearest handle within 50px radius
- ✅ Handles functional even when card is zoomed out/collapsed

### Writing Experience ✅

**Two editing modes implemented:**

**Inline Editing (Quick):**
- ✅ Click card body or summary to edit in place
- ✅ Textarea appears with matching styles
- ✅ Blur to save and return to Markdown preview
- ✅ No modal, stays in canvas context
- ✅ Perfect for quick edits

**Full-Screen Editor (Deep Focus):**
- ✅ Click **Edit button** (✏️) in header
- ✅ Full-screen overlay with backdrop blur
- ✅ **TipTap WYSIWYG editor:**
  - Rich text editing with formatting toolbar
  - Real-time visual editing (no separate preview needed)
  - Supports headings, bold, italic, lists, etc.
  - Character count and word limit enforcement
- ✅ Header shows word count badge with warnings
- ✅ Summary input field at bottom
- ✅ Close with **Escape** or close button
- ✅ Click outside to close and save
- ✅ Smooth animations (fade + slide-up, 300ms)
- ✅ Calm, focused experience — Lora serif font, warm colors

### Connections (Arrows) ✅
- ✅ Users draw connections by dragging from handle to handle
- ✅ **Loose connection mode** — auto-snaps within 50px radius
- ✅ **Default:** solid line, 2px weight, brown color (`#8C7B6E`)
- ✅ **Arrow markers implemented:**
  - Forward (A → B): Arrowhead at end
  - Backward (B → A): Arrowhead at start
  - Both (A ↔ B): Arrowheads at both ends
  - None (A — B): No arrowheads
  - SVG markers dynamically generated per edge
- ✅ **Invisible wider path** (20px) for easier clicking
- ✅ **Label editing:**
  - Double-click edge → Opens inline label editor with auto-focus
  - Click existing label → Opens inline editor
  - Press Enter to save, Escape to cancel, click away to save
  - Labels displayed along connection midpoint with clickable background
- ✅ **Single-click edge** opens popover with:
  - Line style dropdown (solid/dashed/dotted)
  - Directionality dropdown (A→B / B→A / A↔B / A—B)
  - Close with Escape key or click elsewhere on canvas
  - Delete connection with Delete/Backspace key when popover is open
- ✅ All changes save immediately to localStorage

### Canvas ✅
- ✅ Single infinite canvas powered by React Flow
- ✅ Warm parchment background (`#F5F0E8`)
- ✅ No grid or dots — clean, minimal
- ✅ **Settings Button** in top-right corner
  - ⚙️ gear icon, 48x48px floating button
  - Opens settings panel from right side
  - Canvas remains fully interactive when panel is open
- ✅ **Settings Panel**
  - Slides in from right (400px wide)
  - No backdrop - canvas fully usable while open
  - Close with Escape, X button, or Done button
  - Ready for interface concept testing
- ✅ **MiniMap** in bottom-right corner
  - Shows overview of all cards
  - Click to navigate quickly
  - Styled with warm theme colors
- ✅ **Zoom Controls** in bottom-left
  - Zoom in/out buttons (+/−)
  - Fit view button (centers all content)
  - Lock/unlock interaction
  - Styled to match theme

### Persistence ✅
- ✅ All canvas state saved to **localStorage** as JSON
  - Card positions, body, summary, word count
  - Connection data (style, direction, label, handles)
  - Auto-save on every change
- ✅ Data persists across page refreshes
- ✅ Default welcome card on first load with instructions

---

## Out of Scope

- Multiple canvases or project-level organization
- Multiplayer / collaboration features
- AI-generated summaries (summaries are always user-written)
- Mobile app (web only for now)

---

## Technical Considerations

### Stack ✅
- **Framework:** React 18 + TypeScript
- **Canvas / Graph engine:** React Flow 11 — handles infinite canvas, node dragging, edge drawing, zoom, and pan
- **State management:** Zustand 4 — lightweight, single-user app, clean store patterns
- **Rich text editor:**
  - `@tiptap/react` — Modern WYSIWYG editor (user-modified from CodeMirror)
  - `@tiptap/starter-kit` — Essential editing features
  - Extensions: Placeholder, CharacterCount
  - Full-screen editor with word limit enforcement
- **Markdown rendering:** `react-markdown` — for inline card preview
- **Persistence:** localStorage (JSON) — local-only, no backend
- **Styling:** Inline styles + component CSS modules — warm color palette throughout
- **Build:** Vite — fast dev server with HMR

### Module Structure ✅

The codebase is structured so each major concern lives in its own isolated folder:

```
src/
  components/
    Canvas/
      CanvasMinimal.tsx    ← Main canvas component with React Flow
      CanvasMinimal.css    ← Canvas styling (settings button)
      Canvas.tsx           ← (Legacy, CanvasMinimal is used in App.tsx)
    Card/
      Card.tsx             ← Card component with inline editing, semantic zoom
      Card.css             ← Card-specific styles
    CardEditor/
      CardEditor.tsx       ← Full-screen editor with CodeMirror + live preview
      CardEditor.css       ← Editor modal styling
    Connection/
      Connection.tsx       ← Arrow component with markers, popover, customization
      Connection.css       ← Connection styling
    Settings/
      SettingsPanel.tsx    ← Settings panel that slides from right
      SettingsPanel.css    ← Panel styling and animations
    Help/                  ← Help component
  theme/
    tokens.css             ← Design tokens (colors, spacing, typography)
  store/
    canvasStore.ts         ← Zustand store: cards, connections, localStorage
  utils/
    markdown.ts            ← Markdown helpers
    wordCount.ts           ← Word count logic
```

### Agent Surface Areas
| Concern | Folder / File |
|---|---|
| Color themes & visual design | `theme/tokens.css` |
| Writing / Markdown experience | `components/CardEditor/` |
| Canvas zoom, pan, background | `components/Canvas/` |
| Arrows, connections, line styles | `components/Connection/` |
| Card structure & summary | `components/Card/` |

---

## Implementation Notes

**Edit Button Placement:** ✅ Resolved
- Placed in card header bar, between drag handle and delete button
- Uses ✏️ emoji icon for clear affordance
- Opens full-screen CardEditor modal

**Editing Modes:** ✅ Implemented both approaches
- Inline editing for quick changes (click body/summary)
- Full-screen editor for focused writing (click Edit button)
- Both modes use same data store, seamless transitions

**Semantic Zoom Threshold:** ✅ Set at 60%
- Cards collapse to summary-only view below 60% zoom
- Threshold feels natural for overview vs detail work

**Connection Snapping:** ✅ Loose mode with 50px radius
- Makes connecting cards much easier
- Eliminates need for pixel-perfect handle targeting

## Future Enhancements (Out of MVP Scope)

- Export to PDF/Markdown
- Search across all cards
- Tags or categories
- Multiple canvas workspaces
- Keyboard shortcuts (beyond Escape)
- Custom themes / color schemes
- AI-assisted features (summaries, connections)

---
