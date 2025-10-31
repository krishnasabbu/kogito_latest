import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { Trash2, ChevronDown, ChevronUp, Workflow, ExternalLink, RefreshCw } from 'lucide-react';
import { useLangGraphStore } from '../../stores/langGraphStore';
import { langGraphService, LangGraphWorkflow } from '../../services/langGraphService';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface WorkflowNodeProps {
  id: string;
  data: {
    label: string;
    selectedWorkflowName?: string;
    dynamicSelection?: boolean;
    workflowFieldPath?: string;
  };
}

export const WorkflowNode: React.FC<WorkflowNodeProps> = ({ id, data }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [workflows, setWorkflows] = useState<LangGraphWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const { updateNodeData, deleteNode } = useLangGraphStore();
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const allWorkflows = await langGraphService.getAllWorkflows();
      setWorkflows(allWorkflows);
    } catch (error) {
      console.error('Failed to load workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleLabelChange = (newLabel: string) => {
    updateNodeData(id, { label: newLabel });
  };

  const handleWorkflowChange = (workflowName: string) => {
    updateNodeData(id, { selectedWorkflowName: workflowName });
  };

  const handleDynamicSelectionToggle = (enabled: boolean) => {
    updateNodeData(id, { dynamicSelection: enabled });
    if (!enabled) {
      updateNodeData(id, { workflowFieldPath: undefined });
    }
  };

  const handleNavigateToWorkflow = () => {
    if (data.selectedWorkflowName) {
      const encodedName = encodeURIComponent(data.selectedWorkflowName);
      navigate(`/langgraph/builder/${encodedName}`);
    } else {
      toast.error('No workflow selected');
    }
  };

  const selectedWorkflow = workflows.find(w => w.name === data.selectedWorkflowName);

  return (
    <div className="bg-white border-2 border-purple-500 rounded-lg shadow-lg min-w-[280px] hover:shadow-xl transition-all">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-purple-500 border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-purple-500 border-2 border-white" />

      <div className="bg-purple-500 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Workflow className="w-4 h-4" />
          {isEditingLabel ? (
            <input
              type="text"
              value={data.label}
              onChange={(e) => handleLabelChange(e.target.value)}
              onBlur={() => setIsEditingLabel(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingLabel(false)}
              className="bg-white text-gray-900 px-2 py-1 rounded text-sm font-medium flex-1"
              autoFocus
            />
          ) : (
            <span
              className="font-medium text-sm cursor-pointer flex-1"
              onDoubleClick={() => setIsEditingLabel(true)}
              title="Double-click to edit"
            >
              {data.label}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-purple-600 rounded transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => deleteNode(id)}
            className="p-1 hover:bg-purple-600 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-purple-500 rounded-full"></div>
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Workflow Node</div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <input
                type="checkbox"
                checked={data.dynamicSelection || false}
                onChange={(e) => handleDynamicSelectionToggle(e.target.checked)}
                className="w-4 h-4 text-purple-500 rounded focus:ring-purple-500"
              />
              Dynamic Selection
            </label>
            <button
              onClick={loadWorkflows}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title="Refresh workflows"
            >
              <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {!data.dynamicSelection ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Select Workflow</label>
                <select
                  value={data.selectedWorkflowName || ''}
                  onChange={(e) => handleWorkflowChange(e.target.value)}
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium transition-all"
                  disabled={loading}
                >
                  <option value="">-- Select Workflow --</option>
                  {workflows.map((workflow) => (
                    <option key={workflow.name} value={workflow.name}>
                      {workflow.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedWorkflow && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 space-y-2">
                  <div className="text-xs font-semibold text-purple-900">Workflow Details</div>
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">Context:</span>{' '}
                    {selectedWorkflow.context || 'No context provided'}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">Version:</span> {selectedWorkflow.latest_version}
                  </div>
                  <Button
                    onClick={handleNavigateToWorkflow}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-white text-xs py-2 mt-2"
                    size="sm"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open Workflow
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Workflow Field Path
              </label>
              <input
                type="text"
                value={data.workflowFieldPath || ''}
                onChange={(e) => updateNodeData(id, { workflowFieldPath: e.target.value })}
                placeholder="input.workflowName"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Reference a field from previous nodes that contains the workflow name
              </p>
            </div>
          )}

          {!data.selectedWorkflowName && !data.dynamicSelection && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                Please select a workflow or enable dynamic selection
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
