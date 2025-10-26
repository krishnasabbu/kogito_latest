import React, { useCallback, useState } from 'react';
import ReactFlow, { Background, Controls, MiniMap, BackgroundVariant, ConnectionLineType } from 'react-flow-renderer';
import { useLangGraphStore } from '../../stores/langGraphStore';
import { ServiceNode } from './ServiceNode';
import { DecisionNode } from './DecisionNode';
import { LLMNode } from './LLMNode';
import { CustomEdge } from './CustomEdge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Plus, Download, Trash2, GitBranch, Code, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const nodeTypes = {
  serviceNode: ServiceNode,
  decisionNode: DecisionNode,
  llmNode: LLMNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export const LangGraphBuilder: React.FC = () => {
  const [showJSONPreview, setShowJSONPreview] = useState(false);
  const [inputJSON, setInputJSON] = useState('{\n  "message": {}\n}');
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [edgeCondition, setEdgeCondition] = useState('');

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addServiceNode,
    addDecisionNode,
    addLLMNode,
    clearCanvas,
    exportJSON,
    setInputs,
    updateEdgeCondition,
    setEdges,
  } = useLangGraphStore();

  const handleEdgeButtonClick = useCallback((edge: any) => {
    setSelectedEdge(edge.id);
    const foundEdge = edges.find(e => e.id === edge.id);
    setEdgeCondition(foundEdge?.data?.condition || '');
  }, [edges]);

  const edgesWithHandler = edges.map(edge => ({
    ...edge,
    data: {
      ...edge.data,
      onEdgeClick: handleEdgeButtonClick,
    },
  }));

  const handleAddServiceNode = () => {
    const position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
    };
    addServiceNode(position);
    toast.success('Service node added');
  };

  const handleAddDecisionNode = () => {
    const position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
    };
    addDecisionNode(position);
    toast.success('Decision node added');
  };

  const handleAddLLMNode = () => {
    const position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
    };
    addLLMNode(position);
    toast.success('LLM node added');
  };

  const handleClearCanvas = () => {
    if (window.confirm('Are you sure you want to clear the entire canvas?')) {
      clearCanvas();
      toast.success('Canvas cleared');
    }
  };

  const handleSaveJSON = () => {
    try {
      const parsedInput = JSON.parse(inputJSON);
      setInputs(parsedInput);
      const json = exportJSON();
      navigator.clipboard.writeText(json);
      toast.success('JSON saved to clipboard');
    } catch (error) {
      toast.error('Invalid input JSON format');
    }
  };

  const handleExportJSON = () => {
    try {
      const parsedInput = JSON.parse(inputJSON);
      setInputs(parsedInput);
    } catch (error) {
      toast.error('Invalid input JSON format');
      return;
    }

    const json = exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `langgraph-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Graph exported successfully');
  };

  const handleTogglePreview = () => {
    try {
      const parsedInput = JSON.parse(inputJSON);
      setInputs(parsedInput);
      setShowJSONPreview(!showJSONPreview);
    } catch (error) {
      toast.error('Invalid input JSON format');
    }
  };

  const handleEdgeClick = useCallback((event: React.MouseEvent, edge: any) => {
    event.stopPropagation();
    setSelectedEdge(edge.id);
    setEdgeCondition(edge.data?.condition || '');
  }, []);


  const handleSaveCondition = () => {
    if (selectedEdge) {
      updateEdgeCondition(selectedEdge, edgeCondition);
      toast.success('Condition updated');
      setSelectedEdge(null);
    }
  };

  const handleDeleteEdge = () => {
    if (selectedEdge && window.confirm('Delete this edge?')) {
      const updatedEdges = edges.filter(e => e.id !== selectedEdge);
      setEdges(updatedEdges);
      setSelectedEdge(null);
      setEdgeCondition('');
      toast.success('Edge deleted');
    }
  };

  const handleClosePanel = () => {
    setSelectedEdge(null);
    setEdgeCondition('');
  };

  return (
    <div className="h-full flex bg-light-bg dark:bg-dark-bg">
      <div className="w-80 border-r border-light-border dark:border-dark-border bg-white dark:bg-dark-surface overflow-y-auto">
        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary mb-2">
              LangGraph Builder
            </h2>
            <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
              Drag and drop nodes to build your workflow
            </p>
          </div>

          <Card className="p-4 space-y-3 bg-white dark:bg-gray-800">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Add Nodes</h3>
            <Button
              onClick={handleAddServiceNode}
              className="w-full bg-[#D71E28] hover:bg-[#BB1A21] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Service Node
            </Button>
            <Button
              onClick={handleAddDecisionNode}
              className="w-full bg-[#FFCD41] hover:bg-[#E6B800] text-gray-900"
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Decision Node
            </Button>
            <Button
              onClick={handleAddLLMNode}
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              LLM Node
            </Button>
          </Card>

          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Input Configuration</h3>
            <p className="text-xs text-gray-600">
              Define the initial inputs for your workflow
            </p>
            <textarea
              value={inputJSON}
              onChange={(e) => setInputJSON(e.target.value)}
              className="w-full h-32 px-3 py-2 text-xs font-mono border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder='{\n  "message": {}\n}'
            />
          </Card>

          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-sm text-gray-900">Actions</h3>
            <Button
              onClick={handleSaveJSON}
              className="w-full bg-[#D71E28] hover:bg-[#BB1A21] text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save JSON
            </Button>
            <Button
              onClick={handleTogglePreview}
              variant="outline"
              className="w-full"
            >
              <Code className="w-4 h-4 mr-2" />
              {showJSONPreview ? 'Hide' : 'Show'} JSON Preview
            </Button>
            <Button
              onClick={handleExportJSON}
              variant="outline"
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Download JSON
            </Button>
            <Button
              onClick={handleClearCanvas}
              variant="outline"
              className="w-full text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Canvas
            </Button>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <h4 className="font-semibold text-sm text-blue-900 mb-2">Tips</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Double-click node titles to rename</li>
              <li>• Click the dot on edge to add conditions</li>
              <li>• Drag from node handles to connect</li>
              <li>• Click expand/collapse to show/hide details</li>
            </ul>
          </Card>
        </div>
      </div>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edgesWithHandler}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={handleEdgeClick}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{
            type: 'custom',
            animated: true,
            style: { stroke: '#D71E28', strokeWidth: 2 },
            markerEnd: { type: 'arrowclosed', color: '#D71E28' },
          }}
          connectionLineType={ConnectionLineType.SmoothStep}
          connectionLineStyle={{ stroke: '#D71E28', strokeWidth: 2 }}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          fitView
          fitViewOptions={{
            padding: 0.2,
          }}
          className="bg-gray-50 dark:bg-gray-900"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
          <Controls className="bg-white dark:bg-gray-800 shadow-lg rounded border border-gray-200 dark:border-gray-700" />
          <MiniMap
            nodeColor={(node) => {
              if (node.type === 'serviceNode') return '#D71E28';
              if (node.type === 'decisionNode') return '#FFCD41';
              return '#9ca3af';
            }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow"
          />
        </ReactFlow>

        {selectedEdge && (
          <div
            className="properties-panel absolute right-4 top-4 w-96 bg-white border-2 border-blue-500 rounded-xl shadow-2xl"
            style={{ zIndex: 1000, pointerEvents: 'all' }}
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-4 rounded-t-xl flex items-center justify-between">
              <h3 className="font-semibold text-lg">Edge Condition</h3>
              <button
                onClick={handleClosePanel}
                className="text-white hover:bg-blue-700 rounded-full p-1.5 transition-colors"
                type="button"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Condition Expression
                </label>
                <textarea
                  value={edgeCondition}
                  onChange={(e) => setEdgeCondition(e.target.value)}
                  placeholder="e.g., state['field'] == 'value'"
                  className="w-full h-32 px-4 py-3 text-sm border-2 border-gray-300 rounded-lg font-mono resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  style={{ pointerEvents: 'all', userSelect: 'text' }}
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">
                  Enter a condition that evaluates to true or false
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSaveCondition}
                  type="button"
                  className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all"
                  style={{ pointerEvents: 'all' }}
                >
                  Save
                </button>
                <button
                  onClick={handleDeleteEdge}
                  type="button"
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-all"
                  style={{ pointerEvents: 'all' }}
                >
                  Delete
                </button>
                <button
                  onClick={handleClosePanel}
                  type="button"
                  className="flex-1 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-medium transition-all"
                  style={{ pointerEvents: 'all' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {showJSONPreview && (
          <div
            className="absolute bottom-4 right-4 w-96 max-h-96 overflow-auto bg-white border-2 border-gray-300 rounded-lg shadow-xl"
            style={{ zIndex: 1001, pointerEvents: 'all' }}
          >
            <div className="sticky top-0 bg-gray-100 px-4 py-2 border-b border-gray-300 flex items-center justify-between">
              <h3 className="font-semibold text-sm text-gray-900">JSON Preview</h3>
              <button
                onClick={() => setShowJSONPreview(false)}
                className="text-gray-500 hover:text-gray-700 p-1"
                style={{ pointerEvents: 'all' }}
              >
                ✕
              </button>
            </div>
            <pre
              className="p-4 text-xs font-mono text-gray-800 whitespace-pre-wrap"
              style={{ pointerEvents: 'all', userSelect: 'text' }}
            >
              {exportJSON()}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
