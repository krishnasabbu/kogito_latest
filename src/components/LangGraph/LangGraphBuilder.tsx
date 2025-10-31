import React, { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ReactFlow, { Background, Controls, MiniMap, BackgroundVariant, ConnectionLineType } from 'react-flow-renderer';
import { useLangGraphStore } from '../../stores/langGraphStore';
import { langGraphService } from '../../services/langGraphService';
import { ServiceNode } from './ServiceNode';
import { DecisionNode } from './DecisionNode';
import { LLMNode } from './LLMNode';
import { FormNode } from './FormNode';
import { WorkflowNode } from './WorkflowNode';
import { CustomEdge } from './CustomEdge';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Plus, Download, Trash2, GitBranch, Code, Save, Upload, Play, Maximize2, Minimize2, ArrowLeft, Workflow } from 'lucide-react';
import toast from 'react-hot-toast';
import { WorkflowExecuteModal } from './WorkflowExecuteModal';

const nodeTypes = {
  serviceNode: ServiceNode,
  decisionNode: DecisionNode,
  llmNode: LLMNode,
  formNode: FormNode,
  workflowNode: WorkflowNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

export const LangGraphBuilder: React.FC = () => {
  const { workflowId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [workflowName, setWorkflowName] = useState('');
  const [workflowContext, setWorkflowContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showJSONPreview, setShowJSONPreview] = useState(false);
  const [inputJSON, setInputJSON] = useState('{\n  "message": {}\n}');
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [edgeCondition, setEdgeCondition] = useState('');
  const [showExecuteModal, setShowExecuteModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const returnTo = (location.state as any)?.returnTo;

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addServiceNode,
    addDecisionNode,
    addLLMNode,
    addFormNode,
    addWorkflowNode,
    clearCanvas,
    exportJSON,
    importJSON,
    setInputs,
    updateEdgeCondition,
    setEdges,
  } = useLangGraphStore();

  useEffect(() => {
    if (workflowId && workflowId !== 'new') {
      loadWorkflow();
    }
  }, [workflowId]);

  useEffect(() => {
    console.log('Navigation state:', { returnTo, pathname: location.pathname, state: location.state });
  }, [location]);

  const handleBackNavigation = () => {
    console.log('Back button clicked, returnTo:', returnTo);
    if (returnTo) {
      navigate(returnTo, { replace: false });
    } else {
      navigate('/langgraph', { replace: false });
    }
  };

  const loadWorkflow = async () => {
    try {
      setIsLoading(true);
      const decodedName = decodeURIComponent(workflowId!);
      const workflow = await langGraphService.getWorkflowByName(decodedName);
      if (workflow) {
        setWorkflowName(workflow.name);
        setWorkflowContext(workflow.context || '');
        if (workflow.data) {
          importJSON(JSON.stringify(workflow.data));
        }
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
      toast.error('Failed to load workflow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWorkflow = async () => {
    if (!workflowName.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    if (!workflowContext.trim()) {
      toast.error('Please enter workflow context');
      return;
    }

    try {
      setIsLoading(true);
      const graphData = JSON.parse(exportJSON());

      if (workflowId && workflowId !== 'new') {
        await langGraphService.updateWorkflow(workflowName, workflowContext, graphData);
        toast.success('Workflow updated successfully');
      } else {
        const newWorkflow = await langGraphService.createWorkflow(workflowName, workflowContext, graphData);
        toast.success('Workflow created successfully');
        navigate(`/langgraph/builder/${encodeURIComponent(newWorkflow.name)}`, { replace: true });
      }
      setShowSaveDialog(false);
    } catch (error) {
      console.error('Failed to save workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleAddFormNode = () => {
    const position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
    };
    addFormNode(position);
    toast.success('Form node added');
  };

  const handleAddWorkflowNode = () => {
    const position = {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
    };
    addWorkflowNode(position);
    toast.success('Workflow node added');
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

  const handleLoadJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const jsonString = event.target?.result as string;
            importJSON(jsonString);
            toast.success('Workflow loaded successfully');
          } catch (error) {
            toast.error('Failed to load JSON');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExecuteWorkflow = () => {
    try {
      const parsedInput = JSON.parse(inputJSON);
      setInputs(parsedInput);
      setShowExecuteModal(true);
    } catch (error) {
      toast.error('Invalid input JSON format');
    }
  };

  const handleExportJSON = async () => {
    if (nodes.length === 0) {
      toast.error('Cannot save an empty graph');
      return;
    }
    setShowSaveDialog(true);
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
    <>
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {workflowId && workflowId !== 'new' ? 'Update Workflow' : 'Save Workflow'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to {workflowId && workflowId !== 'new' ? 'update' : 'save'} this workflow?
            </p>
            <div className="space-y-4">
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowSaveDialog(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveWorkflow}
                  disabled={isLoading}
                  className="bg-[#D71E28] hover:bg-[#BB1A21] text-white"
                >
                  {isLoading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className={`flex bg-light-bg dark:bg-dark-bg ${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'}`}>
        <div className={`border-r border-light-border dark:border-dark-border bg-white dark:bg-dark-surface overflow-y-auto ${isFullscreen ? 'w-80' : 'w-80'}`}>
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    onClick={handleBackNavigation}
                    variant="outline"
                    size="sm"
                    className="p-1"
                    title={returnTo ? 'Back to parent workflow' : 'Back to dashboard'}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-xl font-bold text-light-text-primary dark:text-dark-text-primary">
                    {workflowName || 'LangGraph Builder'}
                  </h2>
                </div>
                {returnTo && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 mb-2">
                    Nested workflow - click back arrow to return to parent
                  </p>
                )}
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Drag and drop nodes to build your workflow
                </p>
              </div>
            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              variant="outline"
              size="sm"
              className="p-2"
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
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
            <Button
              onClick={handleAddFormNode}
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Form Node
            </Button>
            <Button
              onClick={handleAddWorkflowNode}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Workflow className="w-4 h-4 mr-2" />
              Workflow Node
            </Button>
          </Card>

          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Input Configuration</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Define workflow name and global context
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Workflow Name
              </label>
              <input
                type="text"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Enter workflow name"
                disabled={workflowId && workflowId !== 'new'}
              />
              {workflowId && workflowId !== 'new' && (
                <p className="text-xs text-gray-500 mt-1">Name cannot be changed</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Global Context
              </label>
              <textarea
                value={workflowContext}
                onChange={(e) => setWorkflowContext(e.target.value)}
                className="w-full h-24 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-700 dark:text-white"
                placeholder="Enter context to pass to all nodes"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Input Request
              </label>
              <textarea
                value={inputJSON}
                onChange={(e) => setInputJSON(e.target.value)}
                className="w-full h-32 px-3 py-2 text-xs font-mono border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:bg-gray-700 dark:text-white"
                placeholder='{\n  "message": {}\n}'
              />
              <Button
                onClick={() => {
                  try {
                    const parsed = JSON.parse(inputJSON);
                    setInputs(parsed);
                    toast.success('Input request updated');
                  } catch (error) {
                    toast.error('Invalid JSON format');
                  }
                }}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Save className="w-3 h-3 mr-2" />
                Save Input Request
              </Button>
            </div>
          </Card>

          <Card className="p-4 space-y-3">
            <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Actions</h3>
            <Button
              onClick={handleExportJSON}
              className="w-full bg-[#D71E28] hover:bg-[#BB1A21] text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              {workflowId && workflowId !== 'new' ? 'Update Workflow' : 'Save Workflow'}
            </Button>
            <Button
              onClick={handleLoadJSON}
              className="w-full bg-[#10b981] hover:bg-[#059669] text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              Load JSON
            </Button>
            <Button
              onClick={handleExecuteWorkflow}
              className="w-full bg-gradient-to-r from-[#10b981] to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-semibold"
            >
              <Play className="w-4 h-4 mr-2" />
              Execute Workflow
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
              onClick={handleClearCanvas}
              variant="outline"
              className="w-full text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Canvas
            </Button>
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
              if (node.type === 'llmNode') return '#10b981';
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

      <WorkflowExecuteModal
        isOpen={showExecuteModal}
        onClose={() => setShowExecuteModal(false)}
        workflowJSON={exportJSON()}
      />
    </div>
    </>
  );
};
