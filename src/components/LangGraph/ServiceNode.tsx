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
    <div className="bg-white border-4 border-blue-600 rounded-xl shadow-2xl min-w-[300px] hover:shadow-blue-300 hover:border-blue-700 transition-all">
      <Handle type="target" position={Position.Top} className="w-5 h-5 bg-blue-600 border-3 border-white shadow-lg hover:bg-blue-700 hover:scale-110 transition-all" />
      <Handle type="source" position={Position.Right} className="w-5 h-5 bg-blue-600 border-3 border-white shadow-lg hover:bg-blue-700 hover:scale-110 transition-all" />

      <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between shadow-md">
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
        <div className="p-5 space-y-4 bg-gradient-to-br from-white to-blue-50">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full"></div>
            <div className="text-xs font-bold text-blue-700 uppercase tracking-wider">Service Node</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">URL</label>
            <input
              type="text"
              value={data.url}
              onChange={(e) => updateNodeData(id, { url: e.target.value })}
              placeholder="https://api.example.com/endpoint"
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Method</label>
            <select
              value={data.method}
              onChange={(e) => updateNodeData(id, { method: e.target.value as any })}
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-semibold transition-all"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Request Body</label>
            <textarea
              value={data.request}
              onChange={(e) => updateNodeData(id, { request: e.target.value })}
              placeholder='{"key": "value"}'
              className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg font-mono resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 transition-all"
            />
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-5 h-5 bg-blue-600 border-3 border-white shadow-lg hover:bg-blue-700 hover:scale-110 transition-all" />
    </div>
  );
};
