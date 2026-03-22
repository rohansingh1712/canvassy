import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useCanvasStore } from '../../store/canvasStore';
import { Card } from '../Card/Card';
import { Connection } from '../Connection/Connection';
import { Help } from '../Help/Help';
import './Canvas.css';

const nodeTypes = {
  customCard: Card,
};

const edgeTypes = {
  customEdge: Connection,
};

function CanvasContent() {
  const {
    nodes,
    edges,
    addCard,
    onNodesChange,
    onEdgesChange,
    onConnect,
    loadFromLocalStorage,
    setDraggingNodeId,
  } = useCanvasStore();

  const { screenToFlowPosition, getViewport, setViewport, fitView } = useReactFlow();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef(0);
  const [isSpacebarHeld, setIsSpacebarHeld] = useState(false);

  useEffect(() => {
    loadFromLocalStorage();
  }, [loadFromLocalStorage]);

  // Spacebar navigation mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only activate if spacebar is pressed and we're not in an input field
      if (e.code === 'Space' && !isSpacebarHeld) {
        const target = e.target as HTMLElement;
        const isInputField = target.tagName === 'INPUT' ||
                            target.tagName === 'TEXTAREA' ||
                            target.isContentEditable;

        if (!isInputField) {
          e.preventDefault(); // Prevent page scroll
          setIsSpacebarHeld(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacebarHeld(false);
      }
    };

    // Reset spacebar state when window loses focus (e.g., cmd+tab)
    const handleBlur = () => {
      setIsSpacebarHeld(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isSpacebarHeld]);

  const handlePaneClick = useCallback((event: React.MouseEvent) => {
    console.log('Pane clicked');
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    if (clickCountRef.current === 2) {
      console.log('Double click detected via click counter!');
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      console.log('Creating card at flow position:', position);
      console.log('Screen coords:', event.clientX, event.clientY);
      addCard(position);
      clickCountRef.current = 0;
    } else {
      clickTimerRef.current = setTimeout(() => {
        clickCountRef.current = 0;
      }, 300);
    }
  }, [screenToFlowPosition, addCard]);

  const handleNodeDragStart = useCallback((_event: React.MouseEvent, node: Node) => {
    setDraggingNodeId(node.id);
  }, [setDraggingNodeId]);

  const handleNodeDragStop = useCallback(() => {
    setDraggingNodeId(null);
  }, [setDraggingNodeId]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) {
      console.log('No wrapper ref');
      return;
    }

    const handleDoubleClick = (event: MouseEvent) => {
      console.log('Double click detected!', event);
      const target = event.target as HTMLElement;
      console.log('Target classes:', target.className);

      // Check if the target is the pane (not a node or edge)
      const isPane = target.classList.contains('react-flow__pane') ||
                     target.classList.contains('react-flow__renderer') ||
                     target.classList.contains('react-flow__background');

      console.log('Is pane?', isPane);

      if (isPane) {
        // Convert screen coordinates to flow coordinates
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        console.log('Creating card at position:', position);
        addCard(position);
      }
    };

    console.log('Adding dblclick listener to wrapper');
    wrapper.addEventListener('dblclick', handleDoubleClick);

    return () => {
      wrapper.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [screenToFlowPosition, addCard]);

  console.log('Store nodes:', nodes);

  return (
    <div className={`canvas-wrapper ${isSpacebarHeld ? 'nav-mode' : ''}`} ref={wrapperRef}>
      <Help />
      <div style={{ width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={handlePaneClick}
          onNodeDragStart={handleNodeDragStart}
          onNodeDragStop={handleNodeDragStop}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          panOnDrag={isSpacebarHeld}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={true}
          nodesDraggable={!isSpacebarHeld}
          nodesConnectable={false}
          elementsSelectable={false}
          selectNodesOnDrag={false}
          fitView
        >
          <Background color="var(--color-card-border)" />
        </ReactFlow>
      </div>
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasContent />
    </ReactFlowProvider>
  );
}
