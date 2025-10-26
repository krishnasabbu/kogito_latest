import React, { useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { Trash2, ChevronDown, ChevronUp, Bot } from 'lucide-react';
import { useLangGraphStore } from '../../stores/langGraphStore';

interface LLMNodeProps {
  id: string;
  data: {
    label: string;
    model: string;
    prompt: string;
  };
}

export const LLMNode: React.FC<LLMNodeProps> = ({ id, data }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const { updateNodeData, deleteNode } = useLangGraphStore();

  const handleLabelChange = (newLabel: string) => {
    updateNodeData(id, { label: newLabel });
  };

  return (
    <div className="bg-white border-2 border-[#10b981] rounded-lg shadow-lg min-w-[280px] hover:shadow-xl transition-all">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#10b981] border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#10b981] border-2 border-white" />

      <div className="bg-[#10b981] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Bot className="w-4 h-4" />
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
            className="p-1 hover:bg-[#059669] rounded transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => deleteNode(id)}
            className="p-1 hover:bg-[#059669] rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#10b981] rounded-full"></div>
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">LLM Node</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Model</label>
            <input
              type="text"
              value={data.model}
              onChange={(e) => updateNodeData(id, { model: e.target.value })}
              placeholder="gpt-4, claude-3-sonnet, gemini-pro"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Prompt</label>
            <textarea
              value={data.prompt}
              onChange={(e) => updateNodeData(id, { prompt: e.target.value })}
              placeholder="Enter your prompt template here..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded font-mono resize-none h-32 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-2">
              Use variables like {'{state.variable}'} to reference workflow state
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
