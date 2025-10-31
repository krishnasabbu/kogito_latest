import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeft } from 'lucide-react';
import { Button } from '../ui/button';

interface WorkflowConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (requestMapping: string) => void;
  initialValue: string;
  initialInputs: Record<string, any>;
  workflowName: string;
  onBack: () => void;
}

export const WorkflowConfigModal: React.FC<WorkflowConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialValue,
  initialInputs,
  workflowName,
  onBack,
}) => {
  const [requestMapping, setRequestMapping] = useState(initialValue || '{}');
  const [draggedField, setDraggedField] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRequestMapping(initialValue || '{}');
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const getFieldPaths = (obj: any, prefix = 'input'): string[] => {
    let paths: string[] = [];
    for (const key in obj) {
      const newPath = `${prefix}.${key}`;
      paths.push(newPath);
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        paths = paths.concat(getFieldPaths(obj[key], newPath));
      }
    }
    return paths;
  };

  const fieldPaths = getFieldPaths(initialInputs);

  const handleDragStart = (field: string) => {
    setDraggedField(field);
  };

  const handleDragEnd = () => {
    setDraggedField(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedField) {
      const cursorPosition = (e.target as HTMLTextAreaElement).selectionStart || 0;
      const textBefore = requestMapping.substring(0, cursorPosition);
      const textAfter = requestMapping.substring(cursorPosition);
      const newText = `${textBefore}{${draggedField}}${textAfter}`;
      setRequestMapping(newText);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSave = () => {
    onSave(requestMapping);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[9999]">
      <div className="bg-white w-full h-full flex flex-col">
        <div className="bg-purple-500 text-white px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-purple-600 rounded transition-colors"
              title="Back to workflow"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-bold">Configure Workflow Request</h2>
              <p className="text-sm text-purple-100 mt-1">Workflow: {workflowName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-purple-600 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Available Fields</h3>
            <p className="text-sm text-gray-600 mb-6">Drag fields to the JSON template on the right</p>
            <div className="space-y-3">
              {fieldPaths.map((field) => (
                <div
                  key={field}
                  draggable
                  onDragStart={() => handleDragStart(field)}
                  onDragEnd={handleDragEnd}
                  className="bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-base font-mono cursor-move hover:bg-purple-50 hover:border-purple-500 transition-all shadow-md hover:shadow-lg"
                >
                  {field}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Request Mapping</h3>
            <p className="text-sm text-gray-600 mb-4">
              Map input fields to the workflow's expected input format. Use single braces {'{'} and {'}'} to wrap field references.
            </p>
            <textarea
              value={requestMapping}
              onChange={(e) => setRequestMapping(e.target.value)}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="flex-1 w-full px-6 py-4 text-base font-mono border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white resize-none"
              placeholder='{\n  "input": {\n    "message": "{input.data}"\n  }\n}'
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-8 py-6 flex justify-end gap-4">
          <Button variant="outline" onClick={onClose} className="px-6 py-3 text-base">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 text-base"
          >
            Save Mapping
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
