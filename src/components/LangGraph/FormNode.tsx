import React, { useState } from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { Trash2, ChevronDown, ChevronUp, FileText, Edit } from 'lucide-react';
import { useLangGraphStore } from '../../stores/langGraphStore';
import { FormBuilderModal } from './FormBuilderModal';

interface FormNodeProps {
  id: string;
  data: {
    label: string;
    formConfig: any;
  };
}

export const FormNode: React.FC<FormNodeProps> = ({ id, data }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [showFormBuilder, setShowFormBuilder] = useState(false);
  const { updateNodeData, deleteNode } = useLangGraphStore();

  const handleLabelChange = (newLabel: string) => {
    updateNodeData(id, { label: newLabel });
  };

  const handleSaveForm = (formConfig: any) => {
    updateNodeData(id, { formConfig });
  };

  return (
    <>
      <FormBuilderModal
        isOpen={showFormBuilder}
        onClose={() => setShowFormBuilder(false)}
        onSave={handleSaveForm}
        initialSchema={data.formConfig}
      />
      <div className="bg-white border-2 border-[#10b981] rounded-lg shadow-lg min-w-[280px] hover:shadow-xl transition-all">
        <Handle type="target" position={Position.Left} className="w-3 h-3 bg-[#10b981] border-2 border-white" />
        <Handle type="source" position={Position.Right} className="w-3 h-3 bg-[#10b981] border-2 border-white" />

        <div className="bg-[#10b981] text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <FileText className="w-4 h-4" />
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
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Form Node</div>
            </div>

            <div>
              <button
                onClick={() => setShowFormBuilder(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                {data.formConfig ? 'Edit Form' : 'Create Form'}
              </button>
            </div>

            {data.formConfig && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Form Schema (JSON)
                </label>
                <textarea
                  value={JSON.stringify(data.formConfig, null, 2)}
                  readOnly
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded font-mono resize-none h-64 focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] bg-gray-50"
                />
                <p className="text-xs text-gray-500 mt-2">
                  This JSON schema will be used to render the dynamic form
                </p>
              </div>
            )}

            {!data.formConfig && (
              <div className="text-xs text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded">
                Click "Create Form" to build your form
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
