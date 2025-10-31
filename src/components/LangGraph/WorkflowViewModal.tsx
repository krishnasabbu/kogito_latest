import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import ReactFlow, { Background, Controls, MiniMap, BackgroundVariant, Node, Edge } from 'react-flow-renderer';
import { langGraphService } from '../../services/langGraphService';
import { ServiceNode } from './ServiceNode';
import { DecisionNode } from './DecisionNode';
import { LLMNode } from './LLMNode';
import { FormNode } from './FormNode';
import { WorkflowNode } from './WorkflowNode';
import { CustomEdge } from './CustomEdge';
import toast from 'react-hot-toast';

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

interface WorkflowViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowName: string;
}

export const WorkflowViewModal: React.FC<WorkflowViewModalProps> = ({
  isOpen,
  onClose,
  workflowName,
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(false);
  const [workflowContext, setWorkflowContext] = useState('');

  useEffect(() => {
    if (isOpen && workflowName) {
      loadWorkflow();
    }
  }, [isOpen, workflowName]);

  const loadWorkflow = async () => {
    try {
      setLoading(true);
      const workflow = await langGraphService.getWorkflowByName(workflowName);
      if (workflow) {
        setWorkflowContext(workflow.context || '');
        if (workflow.data) {
          const parsedData = typeof workflow.data === 'string' ? JSON.parse(workflow.data) : workflow.data;
          setNodes(parsedData.nodes || []);
          setEdges(parsedData.edges || []);
        }
      }
    } catch (error) {
      console.error('Failed to load workflow:', error);
      toast.error('Failed to load workflow');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[9999]">
      <div className="bg-white w-full h-full flex flex-col">
        <div className="bg-purple-500 text-white px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{workflowName}</h2>
            {workflowContext && (
              <p className="text-sm text-purple-100 mt-1">{workflowContext}</p>
            )}
            <p className="text-xs text-purple-200 mt-1">Read-only view</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-purple-600 rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 relative">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading workflow...</p>
              </div>
            </div>
          ) : (
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              zoomOnScroll={true}
              panOnScroll={false}
              panOnDrag={true}
              fitView
              fitViewOptions={{ padding: 0.2 }}
            >
              <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
              <Controls showInteractive={false} />
              <MiniMap
                nodeColor={(node) => {
                  switch (node.type) {
                    case 'serviceNode':
                      return '#3b82f6';
                    case 'decisionNode':
                      return '#f59e0b';
                    case 'llmNode':
                      return '#10b981';
                    case 'formNode':
                      return '#ec4899';
                    case 'workflowNode':
                      return '#8b5cf6';
                    default:
                      return '#6b7280';
                  }
                }}
                maskColor="rgba(0, 0, 0, 0.1)"
              />
            </ReactFlow>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
