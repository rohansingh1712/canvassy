import React, { useState, useEffect } from 'react';
import { EdgeProps, getBezierPath } from 'reactflow';
import { useCanvasStore } from '../../store/canvasStore';
import { useSettingsStore } from '../../store/settingsStore';
import './Connection.css';

export function Connection({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}: EdgeProps) {
  const [showPopover, setShowPopover] = useState(false);
  const [editingLabel, setEditingLabel] = useState(false);
  const [label, setLabel] = useState(data?.label || '');
  const [tempLabel, setTempLabel] = useState(data?.label || '');
  const { updateEdge, deleteEdge } = useCanvasStore();
  const { arrowWidth, arrowHeadSize } = useSettingsStore();

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const lineStyle = data?.lineStyle || 'solid';
  const directionality = data?.directionality || 'forward';

  const getStrokeDasharray = () => {
    switch (lineStyle) {
      case 'dashed':
        return '5,5';
      case 'dotted':
        return '2,2';
      default:
        return 'none';
    }
  };

  // Determine marker IDs based on directionality
  const markerEndId = directionality === 'forward' || directionality === 'both'
    ? `arrow-end-${id}`
    : undefined;
  const markerStartId = directionality === 'both' || directionality === 'backward'
    ? `arrow-start-${id}`
    : undefined;

  const handleEdgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Open popover (don't toggle) if we're not editing the label
    if (!editingLabel) {
      setShowPopover(true);
    }
  };

  const handleEdgeDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Start inline editing on double-click
    setTempLabel(data?.label || '');
    setEditingLabel(true);
    setShowPopover(false);
  };

  const closePopover = () => {
    setShowPopover(false);
  };

  const handleDelete = () => {
    deleteEdge(id);
    setShowPopover(false);
  };

  const handleLineStyleChange = (style: string) => {
    updateEdge(id, { lineStyle: style });
  };

  const handleDirectionalityChange = (dir: string) => {
    updateEdge(id, { directionality: dir });
  };

  const handleLabelClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTempLabel(data?.label || '');
    setEditingLabel(true);
    setShowPopover(false);
  };

  const handleLabelDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const saveLabelEdit = () => {
    setLabel(tempLabel);
    updateEdge(id, { label: tempLabel });
    setEditingLabel(false);
  };

  const cancelLabelEdit = () => {
    setTempLabel(data?.label || '');
    setEditingLabel(false);
  };

  const handleInlineLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempLabel(e.target.value);
  };

  const handleInlineLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveLabelEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelLabelEdit();
    }
  };

  const handleInlineLabelBlur = () => {
    saveLabelEdit();
  };

  // Sync label state with edge data
  useEffect(() => {
    setLabel(data?.label || '');
  }, [data?.label]);

  // Close popover when clicking outside
  useEffect(() => {
    if (!showPopover) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Don't close if clicking on the popover itself or its children
      if (target.closest('.connection-popover')) {
        return;
      }

      // Close the popover
      closePopover();
    };

    // Add a small delay to avoid immediately closing when opening
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showPopover]);

  // Handle keyboard shortcuts when popover is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showPopover) return;

      if (e.key === 'Escape') {
        closePopover();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      }
    };

    if (showPopover) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [showPopover]);

  return (
    <>
      {/* Arrow marker definitions - Chevron style */}
      <defs>
        {markerEndId && (
          <marker
            id={markerEndId}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth={arrowHeadSize}
            markerHeight={arrowHeadSize}
            orient="auto"
          >
            <path
              d="M 2 1 L 9 5 L 2 9"
              fill="none"
              stroke="var(--color-connection-default)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        )}
        {markerStartId && (
          <marker
            id={markerStartId}
            viewBox="0 0 10 10"
            refX="2"
            refY="5"
            markerWidth={arrowHeadSize}
            markerHeight={arrowHeadSize}
            orient="auto"
          >
            <path
              d="M 8 1 L 1 5 L 8 9"
              fill="none"
              stroke="var(--color-connection-default)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        )}
      </defs>

      {/* Invisible wider path for easier clicking */}
      <path
        d={edgePath}
        strokeWidth={20}
        stroke="transparent"
        fill="none"
        onClick={handleEdgeClick}
        onDoubleClick={handleEdgeDoubleClick}
        style={{ cursor: 'pointer' }}
      />

      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        style={{
          strokeWidth: `${arrowWidth}px`,
          '--arrow-width': `${arrowWidth}px`,
          pointerEvents: 'none'
        } as React.CSSProperties}
        stroke="var(--color-connection-default)"
        strokeDasharray={getStrokeDasharray()}
        fill="none"
        markerEnd={markerEndId ? `url(#${markerEndId})` : undefined}
        markerStart={markerStartId ? `url(#${markerStartId})` : undefined}
      />

      {/* Label display with large click area */}
      {!editingLabel && data?.label && (
        <foreignObject
          width={Math.max(data.label.length * 10, 100)}
          height={40}
          x={labelX - Math.max(data.label.length * 5, 50)}
          y={labelY - 20}
          className="connection-label-display"
          style={{ overflow: 'visible' }}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleLabelClick(e as any);
            }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-ui)',
              textAlign: 'center',
              padding: '4px 8px',
              borderRadius: '4px',
              background: 'rgba(253, 250, 245, 0.9)',
              border: '1px solid transparent',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(253, 250, 245, 1)';
              e.currentTarget.style.borderColor = 'var(--color-accent-soft)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(253, 250, 245, 0.9)';
              e.currentTarget.style.borderColor = 'transparent';
            }}
          >
            {data.label}
          </div>
        </foreignObject>
      )}

      {/* Inline label editor */}
      {editingLabel && (
        <foreignObject
          width={200}
          height={40}
          x={labelX - 100}
          y={labelY - 20}
          className="connection-label-editor-wrapper"
        >
          <input
            type="text"
            value={tempLabel}
            onChange={handleInlineLabelChange}
            onKeyDown={handleInlineLabelKeyDown}
            onBlur={handleInlineLabelBlur}
            className="connection-label-inline-input"
            autoFocus
            placeholder="Label..."
          />
        </foreignObject>
      )}

      {showPopover && (
        <foreignObject
          width={300}
          height={60}
          x={labelX - 150}
          y={labelY + 25}
          className="connection-popover-wrapper"
        >
          <div className="connection-popover">
            <div className="connection-popover-row">
              <div className="connection-control">
                <label>Style:</label>
                <select
                  value={lineStyle}
                  onChange={(e) => handleLineStyleChange(e.target.value)}
                >
                  <option value="solid">Solid</option>
                  <option value="dashed">Dashed</option>
                  <option value="dotted">Dotted</option>
                </select>
              </div>

              <div className="connection-control">
                <label>Direction:</label>
                <select
                  value={directionality}
                  onChange={(e) => handleDirectionalityChange(e.target.value)}
                >
                  <option value="forward">A → B</option>
                  <option value="backward">B → A</option>
                  <option value="both">A ↔ B</option>
                  <option value="none">A — B</option>
                </select>
              </div>
            </div>
          </div>
        </foreignObject>
      )}
    </>
  );
}
