import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Handle, Position, NodeProps, useStore } from 'reactflow';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { useCanvasStore, CardData } from '../../store/canvasStore';
import { useSettingsStore } from '../../store/settingsStore';
import { CardEditor } from '../CardEditor/CardEditor';
import { extractSummary } from '../../utils/markdown';
import { SummaryHighlight } from '../../utils/summaryHighlightExtension';
import { countWords } from '../../utils/wordCount';
import './Card.css';

export function Card({ id, data }: NodeProps<CardData>) {
  const [showHandles, setShowHandles] = useState(false);
  const [showDeletePopover, setShowDeletePopover] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [bodyText, setBodyText] = useState(data?.body || '');
  const deletePopoverRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Get current zoom level and summary mode settings
  const zoom = useStore((state) => state.transform[2]);
  const { summaryMode, showSummaries, cardWidth } = useSettingsStore();
  const { isSpacebarHeld, draggingNodeId, isConnecting } = useCanvasStore();
  const isDragging = draggingNodeId === id || isSpacebarHeld;

  // Map card width setting to pixel values
  const widthMap = {
    narrow: { full: 320, summary: 280 },
    medium: { full: 420, summary: 380 },
    wide: { full: 560, summary: 520 },
  };
  const cardWidthPx = widthMap[cardWidth];

  // Determine whether to show summary based on mode
  const shouldShowSummary =
    summaryMode === 'zoom'
      ? zoom < 0.6  // V1: Check zoom level
      : showSummaries;  // V2: Check toggle state

  const { deleteCard, updateCard } = useCanvasStore();

  // Debounced autosave function
  const debouncedSave = useCallback((markdown: string, words: number) => {
    // Clear existing timer
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }

    // Set new timer
    autosaveTimerRef.current = setTimeout(() => {
      const extractedSummary = extractSummary(markdown);
      updateCard(id, { body: markdown, summary: extractedSummary, wordCount: words, isNew: false });
    }, 1000); // 1 second debounce
  }, [id, updateCard]);

  // TipTap editor for inline editing
  const inlineEditor = useEditor({
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
    editable: !isSpacebarHeld,
    autofocus: data?.isNew ? 'end' : false,
    editorProps: {
      attributes: {
        class: 'card-inline-editor',
      },
    },
    onUpdate: ({ editor }) => {
      const markdown = editor.storage.markdown.getMarkdown();
      setBodyText(markdown);
      // Autosave with debounce
      const words = countWords(editor.state.doc.textContent);
      debouncedSave(markdown, words);
    },
    onBlur: () => {
      handleBodyBlur();
    },
  });

  // Sync editor content when bodyText changes from external sources
  // Only update if content actually differs to avoid cursor jumps
  useEffect(() => {
    if (inlineEditor) {
      const currentMarkdown = inlineEditor.storage.markdown.getMarkdown();
      if (currentMarkdown !== bodyText) {
        inlineEditor.commands.setContent(bodyText);
      }
    }
  }, [bodyText, inlineEditor]);

  // Update editor editable state when spacebar mode changes
  useEffect(() => {
    if (inlineEditor) {
      inlineEditor.setEditable(!isSpacebarHeld);
    }
  }, [isSpacebarHeld, inlineEditor]);

  // Clear isNew flag after editor is focused (for newly created cards)
  useEffect(() => {
    if (data?.isNew && inlineEditor && inlineEditor.isFocused) {
      // Clear the flag after a brief delay to ensure autofocus has completed
      const timer = setTimeout(() => {
        updateCard(id, { isNew: false });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [data?.isNew, inlineEditor, inlineEditor?.isFocused, id, updateCard]);

  // Cleanup editor and autosave timer on unmount
  useEffect(() => {
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
      if (inlineEditor) {
        inlineEditor.destroy();
      }
    };
  }, [inlineEditor]);

  // Close delete popover on Escape key or click outside
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDeletePopover) {
        setShowDeletePopover(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (deletePopoverRef.current && !deletePopoverRef.current.contains(e.target as Node)) {
        setShowDeletePopover(false);
      }
    };

    if (showDeletePopover) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDeletePopover]);

  // Calculate word count using markdown-aware function
  const wordCount = inlineEditor
    ? countWords(inlineEditor.state.doc.textContent)
    : countWords(bodyText);
  const isApproachingLimit = wordCount >= 450;
  const isAtLimit = wordCount >= 500;

  // Enforce word limit in inline editor
  useEffect(() => {
    if (!inlineEditor) return;

    let previousContent = inlineEditor.getHTML();

    const updateHandler = ({ editor: currentEditor }: any) => {
      const text = currentEditor.state.doc.textContent;
      const words = text.split(/\s+/).filter(w => w.length > 0);

      if (words.length > 500) {
        currentEditor.commands.setContent(previousContent, false);
      } else {
        previousContent = currentEditor.getHTML();
      }
    };

    inlineEditor.on('update', updateHandler);

    return () => {
      inlineEditor.off('update', updateHandler);
    };
  }, [inlineEditor]);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeletePopover(!showDeletePopover);
  };

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCard(id);
  };

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeletePopover(false);
  };

  const handleOpenEditor = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Capture the card's position and size for FLIP animation
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      // Store the bounds to pass to CardEditor
      (window as any).__cardEditorInitialBounds = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
    }
    setShowEditor(true);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    // Refresh local state when editor closes
    const node = useCanvasStore.getState().nodes.find(n => n.id === id);
    if (node?.data) {
      setBodyText(node.data.body || '');
    }
  };

  const handleBodyBlur = () => {
    // Clear any pending autosave
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    // Immediate save on blur
    if (inlineEditor) {
      const markdown = inlineEditor.storage.markdown.getMarkdown();
      setBodyText(markdown);
      const extractedSummary = extractSummary(markdown);
      updateCard(id, { body: markdown, summary: extractedSummary, wordCount, isNew: false });
    }
  };

  // Render collapsed view based on summary mode
  if (shouldShowSummary) {
    return (
      <div
        ref={cardRef}
        className={isDragging ? 'card-dragging' : ''}
        style={{
          width: cardWidthPx.summary,
          background: '#F0EBE1',
          border: isDragging ? '4px solid #D4C8BA' : '2px solid #E2D9CC',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: isDragging
            ? '0 8px 24px rgba(42, 31, 26, 0.15)'
            : '0 2px 8px rgba(42, 31, 26, 0.1)',
          opacity: isDragging ? 0.98 : 1,
          transform: isDragging ? 'scale(1.03)' : 'none',
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'all 0.2s',
        }}
        onMouseEnter={() => setShowHandles(true)}
        onMouseLeave={() => setShowHandles(false)}
      >
        {/* Connection Handles */}
        <Handle type="source" position={Position.Top} id="top" isConnectable={!isSpacebarHeld} style={{ width: 15, height: 15, background: '#8C7B6E', border: 'none', opacity: (showHandles || isConnecting) && !isSpacebarHeld ? 1 : 0 }} />
        <Handle type="source" position={Position.Right} id="right" isConnectable={!isSpacebarHeld} style={{ width: 15, height: 15, background: '#8C7B6E', border: 'none', opacity: (showHandles || isConnecting) && !isSpacebarHeld ? 1 : 0 }} />
        <Handle type="source" position={Position.Bottom} id="bottom" isConnectable={!isSpacebarHeld} style={{ width: 15, height: 15, background: '#8C7B6E', border: 'none', opacity: (showHandles || isConnecting) && !isSpacebarHeld ? 1 : 0 }} />
        <Handle type="source" position={Position.Left} id="left" isConnectable={!isSpacebarHeld} style={{ width: 15, height: 15, background: '#8C7B6E', border: 'none', opacity: (showHandles || isConnecting) && !isSpacebarHeld ? 1 : 0 }} />

        {/* Summary Only */}
        <div
          style={{
            fontSize: '13px',
            color: '#2A1F1A',
            fontWeight: 500,
            lineHeight: 1.4,
            textAlign: 'center',
          }}
        >
          {data?.summary || 'Untitled card'}
        </div>
      </div>
    );
  }

  // Full card view when zoomed in
  return (
    <div
      ref={cardRef}
      className={isDragging ? 'card-dragging' : ''}
      style={{
        width: cardWidthPx.full,
        background: '#FDFAF5',
        border: isDragging ? '4px solid #D4C8BA' : '1px solid #E2D9CC',
        borderRadius: '12px',
        boxShadow: isDragging
          ? '0 8px 24px rgba(42, 31, 26, 0.15)'
          : '0 2px 12px rgba(42, 31, 26, 0.07)',
        overflow: 'hidden',
        opacity: isDragging ? 0.98 : 1,
        transform: isDragging ? 'scale(1.03)' : 'none',
        transformOrigin: 'center center',
        transition: isDragging ? 'none' : 'all 0.2s',
      }}
      onMouseEnter={() => setShowHandles(true)}
      onMouseLeave={() => setShowHandles(false)}
    >
      {/* Visible connection handles - Only using source type, which works for both connecting FROM and TO in loose mode */}
      <Handle
        type="source"
        position={Position.Top}
        id="top"
        isConnectable={!isSpacebarHeld}
        style={{
          width: 15,
          height: 15,
          background: '#8C7B6E',
          opacity: (showHandles || isConnecting) && !isSpacebarHeld ? 1 : 0,
          transition: 'opacity 0.2s',
          top: -28,
        }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={!isSpacebarHeld}
        style={{
          width: 15,
          height: 15,
          background: '#8C7B6E',
          opacity: (showHandles || isConnecting) && !isSpacebarHeld ? 1 : 0,
          transition: 'opacity 0.2s',
          right: -28,
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        isConnectable={!isSpacebarHeld}
        style={{
          width: 15,
          height: 15,
          background: '#8C7B6E',
          opacity: (showHandles || isConnecting) && !isSpacebarHeld ? 1 : 0,
          transition: 'opacity 0.2s',
          bottom: -28,
        }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        isConnectable={!isSpacebarHeld}
        style={{
          width: 15,
          height: 15,
          background: '#8C7B6E',
          opacity: (showHandles || isConnecting) && !isSpacebarHeld ? 1 : 0,
          transition: 'opacity 0.2s',
          left: -28,
        }}
      />

      {/* Header Bar - Drag Handle */}
      <div
        style={{
          height: '28px',
          background: '#E2D9CC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 8px',
          cursor: 'grab',
        }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="2" cy="2" r="1" fill="#8C7B6E" />
          <circle cx="6" cy="2" r="1" fill="#8C7B6E" />
          <circle cx="10" cy="2" r="1" fill="#8C7B6E" />
          <circle cx="2" cy="6" r="1" fill="#8C7B6E" />
          <circle cx="6" cy="6" r="1" fill="#8C7B6E" />
          <circle cx="10" cy="6" r="1" fill="#8C7B6E" />
        </svg>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className="nodrag"
            onClick={handleOpenEditor}
            disabled={isSpacebarHeld}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: isSpacebarHeld ? 'default' : 'pointer',
              fontSize: '14px',
              padding: '2px 6px',
              borderRadius: '4px',
              color: '#8C7B6E',
              transition: 'all 0.2s',
              opacity: isSpacebarHeld ? 0.3 : 1,
            }}
            title="Open full editor"
          >
            🧘
          </button>
          <button
            className="nodrag"
            onClick={handleDeleteClick}
            disabled={isSpacebarHeld}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              cursor: isSpacebarHeld ? 'default' : 'pointer',
              fontSize: '14px',
              padding: '2px 6px',
              borderRadius: '4px',
              color: '#8C7B6E',
              transition: 'all 0.2s',
              opacity: isSpacebarHeld ? 0.3 : 1,
            }}
            title="Delete card"
          >
            🗑

            {/* Delete Confirmation Popover */}
            {showDeletePopover && (
              <div
                ref={deletePopoverRef}
                className="nodrag"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: '#FDFAF5',
                  border: '1px solid #E2D9CC',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  boxShadow: '0 4px 12px rgba(42, 31, 26, 0.15)',
                  zIndex: 1000,
                  minWidth: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Arrow pointing up to trash icon */}
                <div
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    right: '8px',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderBottom: '6px solid #E2D9CC',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '9px',
                    width: 0,
                    height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderBottom: '5px solid #FDFAF5',
                  }}
                />

                <div
                  style={{
                    fontSize: '13px',
                    color: '#2A1F1A',
                    fontFamily: 'Inter, system-ui, sans-serif',
                    marginBottom: '4px',
                  }}
                >
                  Delete note?
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={handleConfirmDelete}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      background: '#B85C4A',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    style={{
                      flex: 1,
                      padding: '4px 8px',
                      background: '#F0EBE1',
                      color: '#2A1F1A',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      fontFamily: 'Inter, system-ui, sans-serif',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Body */}
      <div
        className={isSpacebarHeld ? '' : 'nodrag'}
        style={{
          padding: '16px',
          minHeight: '100px',
          cursor: isSpacebarHeld ? 'grab' : 'text',
          pointerEvents: isDragging ? 'none' : 'auto',
          userSelect: isDragging ? 'none' : 'auto',
        }}
      >
        {inlineEditor && (
          <div className="card-body-content card-inline-editor">
            <EditorContent editor={inlineEditor} />
          </div>
        )}
      </div>

      {/* Word Count */}
      {wordCount > 0 && (
        <div
          className={isSpacebarHeld ? '' : 'nodrag'}
          style={{
            padding: '8px 16px',
            fontSize: '11px',
            color: isAtLimit ? '#D32F2F' : isApproachingLimit ? '#F57C00' : '#8C7B6E',
            fontWeight: 500,
            borderTop: '1px solid #E2D9CC',
            background: isAtLimit ? '#FFEBEE' : isApproachingLimit ? '#FFF3E0' : 'transparent',
            cursor: isSpacebarHeld ? 'grab' : 'default',
          }}
        >
          {wordCount} / 500 words
          {isAtLimit && ' (limit reached)'}
          {isApproachingLimit && !isAtLimit && ' (approaching limit)'}
        </div>
      )}

      {/* Full-Screen Editor Modal */}
      {showEditor && (
        <CardEditor
          cardId={id}
          initialBody={bodyText}
          onClose={handleCloseEditor}
        />
      )}
    </div>
  );
}
