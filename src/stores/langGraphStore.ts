import { create } from 'zustand';
import { Node, Edge, Connection, addEdge, applyNodeChanges, applyEdgeChanges, NodeChange, EdgeChange } from 'react-flow-renderer';

export interface ServiceNodeData {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  request: string;
  label: string;
}

export interface DecisionNodeData {
  script: string;
  label: string;
}

export interface LLMNodeData {
  model: string;
  prompt: string;
  label: string;
}

export interface FormNodeData {
  label: string;
  formConfig: any;
}

export type NodeData = ServiceNodeData | DecisionNodeData | LLMNodeData | FormNodeData;

export interface LangGraphEdge extends Edge {
  data?: {
    condition: string;
  };
}

interface LangGraphState {
  nodes: Node<NodeData>[];
  edges: LangGraphEdge[];
  inputs: Record<string, any>;

  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: LangGraphEdge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;

  addServiceNode: (position: { x: number; y: number }) => void;
  addDecisionNode: (position: { x: number; y: number }) => void;
  addLLMNode: (position: { x: number; y: number }) => void;
  addFormNode: (position: { x: number; y: number }) => void;
  updateNodeData: (nodeId: string, data: Partial<NodeData>) => void;
  deleteNode: (nodeId: string) => void;
  updateEdgeCondition: (edgeId: string, condition: string) => void;

  setInputs: (inputs: Record<string, any>) => void;
  clearCanvas: () => void;
  exportJSON: () => string;
  importJSON: (jsonString: string) => void;
}

let nodeIdCounter = 1;

export const useLangGraphStore = create<LangGraphState>((set, get) => ({
  nodes: [],
  edges: [],
  inputs: { message: {} },

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as Node<NodeData>[],
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges) as LangGraphEdge[],
    });
  },

  onConnect: (connection) => {
    const newEdge: LangGraphEdge = {
      ...connection,
      id: `edge-${connection.source}-${connection.target}-${Date.now()}`,
      data: { condition: '' },
      type: 'custom',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 4 },
    };
    set({
      edges: addEdge(newEdge, get().edges) as LangGraphEdge[],
    });
  },

  addServiceNode: (position) => {
    const id = `service-${nodeIdCounter++}`;
    const newNode: Node<ServiceNodeData> = {
      id,
      type: 'serviceNode',
      position,
      data: {
        label: id,
        url: '',
        method: 'GET',
        request: '',
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  addDecisionNode: (position) => {
    const id = `decision-${nodeIdCounter++}`;
    const newNode: Node<DecisionNodeData> = {
      id,
      type: 'decisionNode',
      position,
      data: {
        label: id,
        script: '',
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  addLLMNode: (position) => {
    const id = `llm-${nodeIdCounter++}`;
    const newNode: Node<LLMNodeData> = {
      id,
      type: 'llmNode',
      position,
      data: {
        label: id,
        model: '',
        prompt: '',
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  addFormNode: (position) => {
    const id = `form-${nodeIdCounter++}`;
    const newNode: Node<FormNodeData> = {
      id,
      type: 'formNode',
      position,
      data: {
        label: id,
        formConfig: null,
      },
    };
    set({ nodes: [...get().nodes, newNode] });
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } }
          : node
      ),
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((node) => node.id !== nodeId),
      edges: get().edges.filter(
        (edge) => edge.source !== nodeId && edge.target !== nodeId
      ),
    });
  },

  updateEdgeCondition: (edgeId, condition) => {
    set({
      edges: get().edges.map((edge) =>
        edge.id === edgeId
          ? { ...edge, data: { ...edge.data, condition } }
          : edge
      ),
    });
  },

  setInputs: (inputs) => set({ inputs }),

  clearCanvas: () => {
    set({ nodes: [], edges: [] });
    nodeIdCounter = 1;
  },

  exportJSON: () => {
    const state = get();
    const exportData = {
      graph: {
        nodes: state.nodes.map((node) => ({
          id: node.id,
          type: node.type === 'serviceNode' ? 'service' : node.type === 'decisionNode' ? 'decision' : node.type === 'formNode' ? 'form' : 'llm',
          data: node.data,
        })),
        edges: state.edges.map((edge) => ({
          source: edge.source,
          target: edge.target,
          condition: edge.data?.condition || '',
        })),
        inputs: state.inputs,
      },
    };
    return JSON.stringify(exportData, null, 2);
  },

  importJSON: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      const graph = data.graph || data;

      const importedNodes: Node<NodeData>[] = (graph.nodes || []).map((node: any, index: number) => {
        const nodeType = node.type === 'service' ? 'serviceNode' : node.type === 'decision' ? 'decisionNode' : node.type === 'form' ? 'formNode' : 'llmNode';
        return {
          id: node.id,
          type: nodeType,
          position: { x: 100 + (index * 50), y: 100 + (index * 50) },
          data: node.data,
        };
      });

      const importedEdges: LangGraphEdge[] = (graph.edges || []).map((edge: any) => ({
        id: `edge-${edge.source}-${edge.target}-${Date.now()}`,
        source: edge.source,
        target: edge.target,
        type: 'custom',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 4 },
        data: { condition: edge.condition || '' },
      }));

      set({
        nodes: importedNodes,
        edges: importedEdges,
        inputs: graph.inputs || {},
      });
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  },
}));
