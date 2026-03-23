import { useEffect, useRef, useState } from 'react';
import ReactFlow, { ReactFlowProvider, useReactFlow, ConnectionMode, Controls, useStore } from 'reactflow';
import 'reactflow/dist/style.css';
import { useCanvasStore } from '../../store/canvasStore';
import { useSettingsStore } from '../../store/settingsStore';
import { Card } from '../Card/Card';
import { Connection } from '../Connection/Connection';
import { SettingsPanel } from '../Settings/SettingsPanel';
import { Export } from '../Export/Export';
import './CanvasMinimal.css'; // Settings button styling

const nodeTypes = {
  customCard: Card,
};

const edgeTypes = {
  default: Connection,
};

function CanvasContent() {
  const { nodes, edges, addCard, addWelcomeCard, loadFromLocalStorage, onNodesChange, onEdgesChange, onConnect, isSpacebarHeld, setSpacebarHeld, setDraggingNodeId, draggingNodeId, setConnectionState, clearConnectionState, connectionSourceNode } = useCanvasStore();
  const { loadSettings, summaryMode, showSummaries, toggleSummaries } = useSettingsStore();
  const { screenToFlowPosition } = useReactFlow();
  const lastClickTime = useRef(0);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Get current zoom level
  const zoom = useStore((state) => state.transform[2]);

  useEffect(() => {
    loadFromLocalStorage();
    loadSettings();
  }, [loadFromLocalStorage, loadSettings]);

  // Handle Escape key to close settings
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && settingsOpen) {
        setSettingsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settingsOpen]);

  // Spacebar navigation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isSpacebarHeld) {
        const target = e.target as HTMLElement;

        // Check if we're in an input field or editor
        const isInputField = target.tagName === 'INPUT' ||
                            target.tagName === 'TEXTAREA' ||
                            target.isContentEditable ||
                            target.closest('.ProseMirror') !== null ||
                            target.closest('.card-editor-overlay') !== null;

        if (!isInputField) {
          e.preventDefault();
          setSpacebarHeld(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacebarHeld(false);
      }
    };

    const handleBlur = () => {
      setSpacebarHeld(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isSpacebarHeld, setSpacebarHeld]);

  const handlePaneClick = (event: React.MouseEvent) => {
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;

    if (timeSinceLastClick < 300) {
      // Double click detected
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      addCard(position);
      lastClickTime.current = 0; // Reset
    } else {
      lastClickTime.current = now;
    }
  };

  const handleNodeDragStart = (_event: React.MouseEvent, node: any) => {
    setDraggingNodeId(node.id);
  };

  const handleNodeDragStop = () => {
    setDraggingNodeId(null);
  };

  const handleConnectStart = (_event: React.MouseEvent | React.TouchEvent, { nodeId }: { nodeId: string | null }) => {
    setConnectionState(true, nodeId, null);
  };

  const handleConnectEnd = () => {
    clearConnectionState();
  };

  const handleIsValidConnection = (connection: any) => {
    setConnectionState(true, connectionSourceNode, connection.target);
    return true; // Allow all connections
  };

  return (
    <div>
      {/* Summary Toggle Button - Only visible in toggle mode */}
      {summaryMode === 'toggle' && (
        <button
          className="summary-toggle-button"
          onClick={() => toggleSummaries()}
          title={showSummaries ? "Show Full Cards" : "Show Summaries"}
        >
          {showSummaries ? '📄' : '📋'}
        </button>
      )}

      {/* Welcome Note Button - Top Right */}
      <button
        className="welcome-note-button"
        onClick={() => addWelcomeCard()}
        title="Create Welcome Note"
      >
        👋
      </button>

      {/* Export Button - Top Right */}
      <Export />

      {/* Settings Button - Top Right */}
      <button
        className="settings-button"
        onClick={() => setSettingsOpen(true)}
        title="Settings"
      >
        ⚙️
      </button>

      {/* Canvas wrapper for navigation mode cursor */}
      <div className={`canvas-wrapper ${isSpacebarHeld ? 'nav-mode' : ''}`}>
        {/* Wavy background overlay - active during card dragging or spacebar mode */}
        <div className={`canvas-wave-overlay ${draggingNodeId !== null || isSpacebarHeld ? 'active' : ''}`} />

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectStart={handleConnectStart}
          onConnectEnd={handleConnectEnd}
          isValidConnection={handleIsValidConnection}
          onNodeDragStart={handleNodeDragStart}
          onNodeDragStop={handleNodeDragStop}
          connectionMode={ConnectionMode.Loose}
          connectionRadius={50}
          defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
          fitView
          onPaneClick={handlePaneClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          zoomOnDoubleClick={false}
          panOnDrag={isSpacebarHeld}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={true}
          preventScrolling={true}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          selectNodesOnDrag={false}
          deleteKeyCode={null}
        >
          {/* Zoom percentage indicator */}
          <div style={{
            position: 'absolute',
            bottom: '102px',
            left: '14px',
            background: '#FDFAF5',
            border: '1px solid #E2D9CC',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '13px',
            fontWeight: '500',
            color: '#5C5347',
            zIndex: 5,
          }}>
            {Math.round(zoom * 100)}%
          </div>

          <Controls
            showInteractive={false}
            style={{
              background: '#FDFAF5',
              border: '1px solid #E2D9CC',
            }}
          />
        </ReactFlow>
      </div>

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

export function CanvasMinimal() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
}
