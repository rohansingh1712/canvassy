import React, { useState } from 'react';
import './Help.css';

export function Help() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className="help-button"
        onClick={() => setIsOpen(true)}
        title="Help & Instructions"
      >
        ?
      </button>

      {isOpen && (
        <div className="help-overlay" onClick={() => setIsOpen(false)}>
          <div className="help-panel" onClick={(e) => e.stopPropagation()}>
            <div className="help-header">
              <h2>How to Use Canvassy</h2>
              <button
                className="help-close"
                onClick={() => setIsOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="help-content">
              <section className="help-section">
                <h3>Creating Notes</h3>
                <p><strong>Double-click</strong> anywhere on the empty canvas to create a new card.</p>
              </section>

              <section className="help-section">
                <h3>Editing Notes</h3>
                <ul>
                  <li><strong>Click the card body</strong> to edit the main content. Markdown is supported for formatting.</li>
                  <li><strong>Click the summary section</strong> (at the bottom of the card) to add or edit summary text.</li>
                  <li>Cards have a <strong>500 word limit</strong>. The word count appears in the bottom right corner.</li>
                </ul>
              </section>

              <section className="help-section">
                <h3>Moving Cards</h3>
                <p><strong>Drag the header bar</strong> (the top section with dots) to move a card around the canvas.</p>
              </section>

              <section className="help-section">
                <h3>Deleting Cards</h3>
                <p>Click the <strong>🗑 trash icon</strong> in the header bar, then click again to confirm deletion.</p>
              </section>

              <section className="help-section">
                <h3>Connecting Cards</h3>
                <ul>
                  <li><strong>Hover over any card</strong> to reveal connection handles (small circles on each edge).</li>
                  <li><strong>Drag from a handle</strong> to another card to create an arrow connection.</li>
                  <li><strong>Click on any arrow</strong> to customize it:
                    <ul>
                      <li>Change line style (solid, dashed, dotted)</li>
                      <li>Change direction (A→B, A↔B, A—B)</li>
                      <li>Add a text label</li>
                      <li>Delete the connection</li>
                    </ul>
                  </li>
                </ul>
              </section>

              <section className="help-section">
                <h3>Canvas Navigation</h3>
                <ul>
                  <li><strong>Pan:</strong> Click and drag on empty canvas areas</li>
                  <li><strong>Zoom:</strong> Use trackpad pinch gesture or mouse wheel</li>
                  <li><strong>Minimap:</strong> Bottom-right corner shows an overview</li>
                  <li><strong>Controls:</strong> Bottom-left corner for zoom and fit view</li>
                </ul>
              </section>

              <section className="help-section">
                <h3>Auto-Save</h3>
                <p>All your work is automatically saved to your browser and persists across page refreshes.</p>
              </section>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
