# Canvassy

A canvas-style note-taking web app for spatial thinking and focused writing.

## Running the App

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## How to Use

### Creating Cards
- **Double-click** anywhere on the empty canvas to create a new card

### Editing Cards
- **Click the card body** to edit the main content (Markdown supported)
- **Click the summary section** to add/edit the summary text

### Moving Cards
- **Drag the header bar** (the top row with dots) to move a card around the canvas

### Deleting Cards
- **Click the 🗑 icon** in the header bar
- Click again to confirm deletion

### Connecting Cards
- **Hover over any card** to reveal connection handles (small circles on each edge)
- **Drag from a handle** to another card to create an arrow connection

### Editing Connections
- **Click on any arrow** to open the connection editor
- You can:
  - Change line style (solid/dashed/dotted)
  - Change directionality (A→B / A↔B / A—B)
  - Add a text label
  - Delete the connection

### Canvas Navigation
- **Pan:** Click and drag on empty canvas areas
- **Zoom:** Use trackpad pinch or mouse wheel
- **Minimap:** Bottom-right corner shows overview of your canvas
- **Controls:** Bottom-left corner for zoom in/out and fit view

### Persistence
All your work is automatically saved to browser localStorage and persists across page refreshes.

## Features Implemented

✅ Infinite pannable/zoomable canvas
✅ Create, move, and delete cards
✅ Markdown support in card body
✅ Summary section on each card
✅ Connection arrows between cards
✅ Customizable arrow styles and labels
✅ Word count tracking (500 word limit)
✅ localStorage persistence
✅ Minimap for navigation
✅ Warm, focused design aesthetic

## Project Structure

```
src/
  components/
    Canvas/       # Infinite canvas wrapper using React Flow
    Card/         # Individual note cards with body & summary
    Connection/   # Custom arrows with labels and styles
  theme/
    tokens.css    # All design tokens (colors, fonts, spacing)
  store/
    canvasStore.ts # Zustand state management
  utils/
    wordCount.ts  # Word counting logic
    markdown.ts   # Markdown helpers
```

## Tech Stack

- **React + TypeScript** - UI framework
- **React Flow** - Canvas, node dragging, edge drawing
- **Zustand** - Lightweight state management
- **React Markdown** - Markdown rendering
- **Vite** - Build tool and dev server

## Design Philosophy

Canvassy follows a warm, focused aesthetic inspired by "sitting at a warm desk at night with a good lamp on." The design uses:
- Warm parchment colors instead of stark white
- Serif fonts for writing, sans-serif for UI
- Subtle shadows and soft borders
- Dusty rose accents
- No harsh colors or excessive decoration

All design tokens are in `src/theme/tokens.css` for easy customization.

## What's Next

Future enhancements could include:
- Full-screen focused writing mode with CodeMirror
- Semantic zoom (collapse to summary when zoomed out)
- Improved Markdown editor with toolbar
- Export to PDF/Markdown
- Multiple canvas/project support
- Keyboard shortcuts

---

Built as a prototype for spatial thinking and focused writing.
