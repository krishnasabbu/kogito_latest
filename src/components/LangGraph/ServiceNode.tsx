import React, { useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { Trash2, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { useLangGraphStore } from '../../stores/langGraphStore';

interface ServiceNodeProps {
  id: string;
  data: {
    label: string;
    url: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    request: string;
  };
}

export const ServiceNode: React.FC<ServiceNodeProps> = ({ id, data }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const { updateNodeData, deleteNode } = useLangGraphStore();

  const handleLabelChange = (newLabel: string) => {
    updateNodeData(id, { label: newLabel });
  };

  return (
    <div className="bg-white border-2 border-blue-500 rounded-lg shadow-lg min-w-[280px]">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500" />

      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-t-md flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1">
          <Globe className="w-4 h-4" />
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
            className="p-1 hover:bg-blue-700 rounded transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => deleteNode(id)}
            className="p-1 hover:bg-red-600 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
            Service Node
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">URL</label>
            <input
              type="text"
              value={data.url}
              onChange={(e) => updateNodeData(id, { url: e.target.value })}
              placeholder="https://api.example.com/endpoint"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Method</label>
            <select
              value={data.method}
              onChange={(e) => updateNodeData(id, { method: e.target.value as any })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Request Body</label>
            <textarea
              value={data.request}
              onChange={(e) => updateNodeData(id, { request: e.target.value })}
              placeholder='{"key": "value"}'
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md font-mono resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500" />
    </div>
  );
};
