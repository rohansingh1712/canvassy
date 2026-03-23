import { create } from 'zustand';
import { Node, Edge, Connection, applyNodeChanges, applyEdgeChanges } from 'reactflow';

export interface CardData {
  id: string;
  body: string;
  summary: string;
  wordCount: number;
  isNew?: boolean;
}

interface CanvasState {
  nodes: Node<CardData>[];
  edges: Edge[];
  isSpacebarHeld: boolean;
  draggingNodeId: string | null;
  isConnecting: boolean;
  connectionSourceNode: string | null;
  connectionTargetNode: string | null;
  addCard: (position: { x: number; y: number }) => void;
  addWelcomeCard: () => void;
  deleteCard: (id: string) => void;
  updateCard: (id: string, data: Partial<CardData>) => void;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (connection: Connection) => void;
  updateEdge: (id: string, data: Partial<Edge>) => void;
  deleteEdge: (id: string) => void;
  setSpacebarHeld: (held: boolean) => void;
  setDraggingNodeId: (id: string | null) => void;
  setConnectionState: (isConnecting: boolean, sourceNode: string | null, targetNode: string | null) => void;
  clearConnectionState: () => void;
  loadFromLocalStorage: () => void;
  saveToLocalStorage: () => void;
}

const STORAGE_KEY = 'canvassy-data';

// Helper function to calculate optimal target handle based on geometric relationship
function calculateOptimalHandle(sourceNode: Node | undefined, targetNode: Node | undefined): string {
  if (!sourceNode || !targetNode) return 'top';

  // Get center positions of both cards
  // Full view: 320px width, ~200px height
  // Summary view: 280px width, similar height
  const sourceCenterX = sourceNode.position.x + 160;
  const sourceCenterY = sourceNode.position.y + 100;
  const targetCenterX = targetNode.position.x + 160;
  const targetCenterY = targetNode.position.y + 100;

  // Calculate angle from source to target
  const dx = targetCenterX - sourceCenterX;
  const dy = targetCenterY - sourceCenterY;
  const angleRadians = Math.atan2(dy, dx);
  const angleDegrees = (angleRadians * 180) / Math.PI;

  // Map angle to nearest handle
  // -45° to 45° → right (target is to the right)
  // 45° to 135° → bottom (target is below)
  // 135° to -135° (beyond ±135°) → left (target is to the left)
  // -135° to -45° → top (target is above)
  if (angleDegrees >= -45 && angleDegrees < 45) {
    return 'left'; // Target is to the right, so connect to its left handle
  } else if (angleDegrees >= 45 && angleDegrees < 135) {
    return 'top'; // Target is below, so connect to its top handle
  } else if (angleDegrees >= 135 || angleDegrees < -135) {
    return 'right'; // Target is to the left, so connect to its right handle
  } else {
    return 'bottom'; // Target is above, so connect to its bottom handle
  }
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  nodes: [],
  edges: [],
  isSpacebarHeld: false,
  draggingNodeId: null,
  isConnecting: false,
  connectionSourceNode: null,
  connectionTargetNode: null,

  addCard: (position) => {
    const newCard: Node<CardData> = {
      id: `card-${Date.now()}`,
      type: 'customCard',
      position,
      data: {
        id: `card-${Date.now()}`,
        body: '',
        summary: '',
        wordCount: 0,
        isNew: true,
      },
    };

    set((state) => ({
      nodes: [...state.nodes, newCard],
    }));

    get().saveToLocalStorage();
  },

  addWelcomeCard: () => {
    const welcomeCard: Node<CardData> = {
      id: `card-${Date.now()}`,
      type: 'customCard',
      position: { x: 100, y: 100 },
      data: {
        id: `card-${Date.now()}`,
        body: `# Welcome to canvassy

Canvassy is a writing tool that lets you rearrange your notes spatially.


It's most useful for starting first drafts and capturing ideas that loosely relate to each other. Use the canvas to move your ideas around, connect them in different ways, and shape the the next draft.

## How to use canvassy
* **Double click** anywhere to create a new note.
* Use **markdown** to write notes.
* Use the **connectors** to connect ideas.
* **Grab** the note header to move it.
* Hit **spacebar** to move the canvas, try pinching to zoom.
* Write **@summary** in cards and try out the summary mode to see your ideas at a high level.
* Use **focus mode 🧘** to write in a card distraction free.
* **Export** your note to save a copy.`,
        summary: 'Welcome card — explains how to use Canvassy',
        wordCount: 122,
      },
    };

    set((state) => ({
      nodes: [...state.nodes, welcomeCard],
    }));

    get().saveToLocalStorage();
  },

  deleteCard: (id) => {
    set((state) => ({
      nodes: state.nodes.filter((node) => node.id !== id),
      edges: state.edges.filter((edge) => edge.source !== id && edge.target !== id),
    }));

    get().saveToLocalStorage();
  },

  updateCard: (id, data) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    }));

    get().saveToLocalStorage();
  },

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
    get().saveToLocalStorage();
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
    get().saveToLocalStorage();
  },

  onConnect: (connection) => {
    // Get source and target nodes from state
    const sourceNode = get().nodes.find(n => n.id === connection.source);
    const targetNode = get().nodes.find(n => n.id === connection.target);

    // Calculate optimal handles based on geometric positions
    const optimalTargetHandle = calculateOptimalHandle(sourceNode, targetNode);

    // If source used the center handle, calculate optimal source handle too
    let sourceHandle = connection.sourceHandle;
    if (connection.sourceHandle === 'center') {
      // Calculate optimal source handle (opposite direction from target)
      const sourceCenterX = sourceNode!.position.x + 160;
      const sourceCenterY = sourceNode!.position.y + 100;
      const targetCenterX = targetNode!.position.x + 160;
      const targetCenterY = targetNode!.position.y + 100;

      const dx = targetCenterX - sourceCenterX;
      const dy = targetCenterY - sourceCenterY;
      const angleRadians = Math.atan2(dy, dx);
      const angleDegrees = (angleRadians * 180) / Math.PI;

      // Map angle to source handle (opposite of target logic)
      if (angleDegrees >= -45 && angleDegrees < 45) {
        sourceHandle = 'right'; // Connecting to the right
      } else if (angleDegrees >= 45 && angleDegrees < 135) {
        sourceHandle = 'bottom'; // Connecting downward
      } else if (angleDegrees >= 135 || angleDegrees < -135) {
        sourceHandle = 'left'; // Connecting to the left
      } else {
        sourceHandle = 'top'; // Connecting upward
      }
    }

    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      source: connection.source!,
      target: connection.target!,
      sourceHandle: sourceHandle,
      targetHandle: optimalTargetHandle, // Use calculated optimal handle
    };

    set((state) => ({
      edges: [...state.edges, newEdge],
    }));

    get().saveToLocalStorage();
  },

  updateEdge: (id, data) => {
    set((state) => ({
      edges: state.edges.map((edge) =>
        edge.id === id ? { ...edge, data: { ...edge.data, ...data } } : edge
      ),
    }));

    get().saveToLocalStorage();
  },

  deleteEdge: (id) => {
    set((state) => ({
      edges: state.edges.filter((edge) => edge.id !== id),
    }));

    get().saveToLocalStorage();
  },

  setSpacebarHeld: (held) => {
    set({ isSpacebarHeld: held });
  },

  setDraggingNodeId: (id) => {
    set({ draggingNodeId: id });
  },

  setConnectionState: (isConnecting, sourceNode, targetNode) => {
    set({
      isConnecting,
      connectionSourceNode: sourceNode,
      connectionTargetNode: targetNode
    });
  },

  clearConnectionState: () => {
    set({
      isConnecting: false,
      connectionSourceNode: null,
      connectionTargetNode: null
    });
  },

  loadFromLocalStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const { nodes, edges } = JSON.parse(stored);
        set({ nodes, edges });
      } else {
        // Create a default card with content
        const defaultCard: Node<CardData> = {
          id: 'default-card',
          type: 'customCard',
          position: { x: 100, y: 100 },
          data: {
            id: 'default-card',
            body: `# Welcome to canvassy

Canvassy is a writing tool that lets you rearrange your notes spatially.


It's most useful for starting first drafts and capturing ideas that loosely relate to each other. Use the canvas to move your ideas around, connect them in different ways, and shape the the next draft.

## How to use canvassy
* **Double click** anywhere to create a new note.
* Use **markdown** to write notes.
* Use the **connectors** to connect ideas.
* **Grab** the note header to move it.
* Hit **spacebar** to move the canvas, try pinching to zoom.
* Write **@summary** in cards and try out the summary mode to see your ideas at a high level.
* Use **focus mode 🧘** to write in a card distraction free.
* **Export** your note to save a copy.`,
            summary: 'Welcome card — explains how to use Canvassy',
            wordCount: 122,
          },
        };

        set({ nodes: [defaultCard], edges: [] });
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  },

  saveToLocalStorage: () => {
    try {
      const { nodes, edges } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
}));
