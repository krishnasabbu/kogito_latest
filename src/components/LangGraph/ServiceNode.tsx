import React, { useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { Trash2, ChevronDown, ChevronUp, Globe, Settings } from 'lucide-react';
import { useLangGraphStore } from '../../stores/langGraphStore';
import { ServiceConfigModal } from './ServiceConfigModal';
import { Button } from '../ui/button';

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
  const [showConfigModal, setShowConfigModal] = useState(false);
  const { updateNodeData, deleteNode, inputs } = useLangGraphStore();

  const handleLabelChange = (newLabel: string) => {
    updateNodeData(id, { label: newLabel });
  };

  return (
    <div className="bg-white border-2 border-[#D71E28] rounded-lg shadow-lg min-w-[280px] hover:shadow-xl transition-all">
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#D71E28] border-2 border-white" />
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#D71E28] border-2 border-white" />

      <div className="bg-[#D71E28] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
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
            className="p-1 hover:bg-[#BB1A21] rounded transition-colors"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => deleteNode(id)}
            className="p-1 hover:bg-[#BB1A21] rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-3 bg-white">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-[#D71E28] rounded-full"></div>
            <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Service Node</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">URL</label>
            <input
              type="text"
              value={data.url}
              onChange={(e) => updateNodeData(id, { url: e.target.value })}
              placeholder="https://api.example.com/endpoint"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28] focus:border-[#D71E28]"
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
            <div className="relative">
              <textarea
                value={data.request}
                onChange={(e) => updateNodeData(id, { request: e.target.value })}
                placeholder='{"key": "{{field.name}}"}'
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded font-mono resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[#D71E28] focus:border-[#D71E28] bg-gray-50"
                readOnly
                onClick={() => setShowConfigModal(true)}
              />
              <button
                onClick={() => setShowConfigModal(true)}
                className="absolute top-2 right-2 p-1 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                title="Configure Request"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>

          <Button
            onClick={() => setShowConfigModal(true)}
            className="w-full bg-[#D71E28] hover:bg-[#BB1A21] text-white text-xs py-2"
          >
            <Settings className="w-3 h-3 mr-1" />
            Configure Request
          </Button>
        </div>
      )}

      {showConfigModal && (
        <ServiceConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          onSave={(requestBody) => updateNodeData(id, { request: requestBody })}
          initialValue={data.request}
          initialInputs={inputs}
        />
      )}


    </div>
  );
};
