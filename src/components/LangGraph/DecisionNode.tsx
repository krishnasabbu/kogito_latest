import React, { useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { Trash2, ChevronDown, ChevronUp, GitBranch } from 'lucide-react';
import { useLangGraphStore } from '../../stores/langGraphStore';

interface DecisionNodeProps {
  id: string;
  data: {
    label: string;
    script: string;
  };
}

export const DecisionNode: React.FC<DecisionNodeProps> = ({ id, data }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const { updateNodeData, deleteNode } = useLangGraphStore();

  const handleLabelChange = (newLabel: string) => {
    updateNodeData(id, { label: newLabel });
  };

  return (
    <div className="bg-white border-2 border-[#FFCD41] rounded-lg shadow-lg min-w-[280px] hover:shadow-xl transition-all">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#FFCD41] border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#FFCD41] border-2 border-white" />

      <div className="bg-[#FFCD41] text-gray-900 px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <GitBranch className="w-4 h-4" />
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
            className="p-1 hover:bg-[#E6B800] rounded transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => deleteNode(id)}
            className="p-1 hover:bg-[#E6B800] rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#FFCD41] rounded-full"></div>
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Decision Node</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              Decision Script
            </label>
            <textarea
              value={data.script}
              onChange={(e) => updateNodeData(id, { script: e.target.value })}
              placeholder="state['field'] == 'value'"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded font-mono resize-none h-32 focus:outline-none focus:ring-2 focus:ring-[#FFCD41] focus:border-[#FFCD41] bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-2">
              Write a condition to evaluate the workflow state
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
