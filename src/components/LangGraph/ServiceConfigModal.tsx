import React, { useState } from 'react';
import { X, Play } from 'lucide-react';
import { Button } from '../ui/button';

interface ServiceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (requestBody: string) => void;
  initialValue: string;
  initialInputs: Record<string, any>;
}

export const ServiceConfigModal: React.FC<ServiceConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialValue,
  initialInputs,
}) => {
  const [jsonTemplate, setJsonTemplate] = useState(initialValue || '{}');
  const [draggedField, setDraggedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const getFieldPaths = (obj: any, prefix = ''): string[] => {
    let paths: string[] = [];
    for (const key in obj) {
      const newPath = prefix ? `${prefix}.${key}` : key;
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
      const textBefore = jsonTemplate.substring(0, cursorPosition);
      const textAfter = jsonTemplate.substring(cursorPosition);
      const newText = `${textBefore}{{${draggedField}}}${textAfter}`;
      setJsonTemplate(newText);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSave = () => {
    onSave(jsonTemplate);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-[90%] h-[80%] flex flex-col">
        <div className="bg-[#D71E28] text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-xl font-bold">Configure Service Request</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#BB1A21] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 border-r border-gray-200 p-4 overflow-y-auto bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Available Fields</h3>
            <p className="text-xs text-gray-500 mb-4">Drag fields to the JSON template</p>
            <div className="space-y-2">
              {fieldPaths.map((field) => (
                <div
                  key={field}
                  draggable
                  onDragStart={() => handleDragStart(field)}
                  onDragEnd={handleDragEnd}
                  className="bg-white border border-gray-300 rounded px-3 py-2 text-sm font-mono cursor-move hover:bg-blue-50 hover:border-blue-400 transition-all shadow-sm"
                >
                  {field}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 p-4 flex flex-col">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">JSON Template</h3>
            <p className="text-xs text-gray-500 mb-2">
              Drop fields here or type manually. Use {'{{'} and {'}}'}  to wrap field references.
            </p>
            <textarea
              value={jsonTemplate}
              onChange={(e) => setJsonTemplate(e.target.value)}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className="flex-1 w-full px-4 py-3 text-sm font-mono border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D71E28] focus:border-[#D71E28] bg-white resize-none"
              placeholder='{\n  "key": "{{field.name}}",\n  "value": "static value"\n}'
            />
          </div>
        </div>

        <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#D71E28] hover:bg-[#BB1A21] text-white"
          >
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};
