import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CharacterCount from '@tiptap/extension-character-count';
import { Markdown } from 'tiptap-markdown';
import { useCanvasStore } from '../../store/canvasStore';
import { extractSummary } from '../../utils/markdown';
import { SummaryHighlight } from '../../utils/summaryHighlightExtension';
import { countWords } from '../../utils/wordCount';
import './CardEditor.css';

interface CardEditorProps {
  cardId: string;
  initialBody: string;
  onClose: () => void;
}

export function CardEditor({ cardId, initialBody, onClose }: CardEditorProps) {
  const { updateCard } = useCanvasStore();

  // Experimental settings state
  const [experimentalSettings, setExperimentalSettings] = useState({
    lineHeight: 1.5,          // multiplier
    contentWidth: 600,        // px - start at max width
    paragraphSpacing: 0,      // em
  });

  const [showSettings, setShowSettings] = useState(false); // Start hidden
  const [bodyText, setBodyText] = useState(initialBody);
  const [isAnimating, setIsAnimating] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
      SummaryHighlight,
    ],
    content: bodyText,
    editable: true,
    editorProps: {
      attributes: {
        class: 'card-editor-prose',
        spellcheck: 'false',
      },
      handleKeyDown: () => false, // Return false to let all keys through
    },
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown();
      setBodyText(markdown);
    },
    autofocus: 'end',
  });

  // Calculate word count during render using markdown-aware function
  const wordCount = editor
    ? countWords(editor.state.doc.textContent)
    : 0;
  const isApproachingLimit = wordCount >= 450;
  const isAtLimit = wordCount >= 500;


  const handleClose = useCallback(() => {
    if (!editor) return;

    // Get the markdown content from the editor
    const body = editor.storage.markdown.getMarkdown();
    const extractedSummary = extractSummary(body);

    // Save changes before closing
    updateCard(cardId, { body, summary: extractedSummary, wordCount });
    onClose();
  }, [cardId, editor, wordCount, updateCard, onClose]);

  const handleBodyBlur = () => {
    if (editor) {
      const markdown = editor.storage.markdown.getMarkdown();
      setBodyText(markdown);
    }
  };

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    // Only focus if clicking on the content area itself (not the editor or other elements)
    if (e.target === e.currentTarget && editor) {
      editor.commands.focus('end'); // Move cursor to end of document
    }
  }, [editor]);

  // FLIP Animation: Expand from card position to full screen
  useEffect(() => {
    const initialBounds = (window as any).__cardEditorInitialBounds;

    if (initialBounds && editorRef.current && overlayRef.current) {
      // Get the final (full-screen) position
      const finalBounds = editorRef.current.getBoundingClientRect();

      // Calculate the scale and translation needed to match the card's initial position
      const scaleX = initialBounds.width / finalBounds.width;
      const scaleY = initialBounds.height / finalBounds.height;
      const translateX = initialBounds.left - finalBounds.left + (initialBounds.width - finalBounds.width) / 2;
      const translateY = initialBounds.top - finalBounds.top + (initialBounds.height - finalBounds.height) / 2;

      // Set initial state (INVERT step)
      editorRef.current.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scaleX}, ${scaleY})`;
      editorRef.current.style.borderRadius = '12px';
      editorRef.current.style.transition = 'none';
      overlayRef.current.style.opacity = '0';
      overlayRef.current.style.transition = 'none';

      // Force reflow to ensure initial styles are applied
      editorRef.current.getBoundingClientRect();

      // Animate to final state (PLAY step)
      requestAnimationFrame(() => {
        if (editorRef.current && overlayRef.current) {
          editorRef.current.style.transition = 'transform 0.35s cubic-bezier(0.4, 0.0, 0.2, 1), border-radius 0.35s cubic-bezier(0.4, 0.0, 0.2, 1)';
          editorRef.current.style.transform = 'translate(0, 0) scale(1, 1)';
          editorRef.current.style.borderRadius = '0px';

          overlayRef.current.style.transition = 'opacity 0.35s cubic-bezier(0.4, 0.0, 0.2, 1)';
          overlayRef.current.style.opacity = '1';

          // Mark animation as complete after it finishes
          setTimeout(() => {
            setIsAnimating(false);
            // Clean up the temporary bounds
            delete (window as any).__cardEditorInitialBounds;
          }, 350);
        }
      });
    } else {
      // No initial bounds, skip animation
      setIsAnimating(false);
    }
  }, []);

  // Handle Escape key to close editor
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  return createPortal(
    <div
      ref={overlayRef}
      className="card-editor-overlay"
      style={{
        '--editor-line-height': experimentalSettings.lineHeight,
        '--editor-content-width': `${experimentalSettings.contentWidth}px`,
        '--editor-paragraph-spacing': `${experimentalSettings.paragraphSpacing}em`,
      } as React.CSSProperties}
    >
      <div ref={editorRef} className="card-editor">
        {/* Header */}
        <div className="card-editor-header">
          <div className={`card-editor-wordcount ${
            isAtLimit ? 'limit' : isApproachingLimit ? 'warning' : ''
          }`}>
            {wordCount} / 500 words
            {isAtLimit && ' (limit reached)'}
          </div>
          <div className="card-editor-header-actions">
            <button
              className="card-editor-settings-toggle"
              onClick={() => setShowSettings(!showSettings)}
              title="Toggle Settings"
            >
              ⚙️
            </button>
            <button className="card-editor-close" onClick={handleClose} title="Close">
              ✕
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="card-editor-settings-panel">
            <div className="settings-group">
              <label>
                Line Height: {experimentalSettings.lineHeight}
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.05"
                  value={experimentalSettings.lineHeight}
                  onChange={(e) => setExperimentalSettings({
                    ...experimentalSettings,
                    lineHeight: Number(e.target.value)
                  })}
                />
              </label>
            </div>

            <div className="settings-group">
              <label>
                Content Width: {experimentalSettings.contentWidth}px
                <input
                  type="range"
                  min="500"
                  max="1200"
                  step="50"
                  value={experimentalSettings.contentWidth}
                  onChange={(e) => setExperimentalSettings({
                    ...experimentalSettings,
                    contentWidth: Number(e.target.value)
                  })}
                />
              </label>
            </div>

            <div className="settings-group">
              <label>
                Paragraph Spacing: {experimentalSettings.paragraphSpacing}em
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.25"
                  value={experimentalSettings.paragraphSpacing}
                  onChange={(e) => setExperimentalSettings({
                    ...experimentalSettings,
                    paragraphSpacing: Number(e.target.value)
                  })}
                />
              </label>
            </div>

            <div className="settings-values-display">
              <code>
                lineHeight: {experimentalSettings.lineHeight}, contentWidth: {experimentalSettings.contentWidth}, paragraphSpacing: {experimentalSettings.paragraphSpacing}
              </code>
            </div>
          </div>
        )}

        {/* Full-width Editor */}
        <div className="card-editor-content" onClick={handleContentClick}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>,
    document.getElementById('modal-root')!
  );
}
