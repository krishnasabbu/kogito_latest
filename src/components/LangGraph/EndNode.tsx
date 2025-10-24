import React from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { Square } from 'lucide-react';

export const EndNode: React.FC = () => {
  return (
    <div className="bg-red-500 text-white rounded-full w-24 h-24 flex items-center justify-center shadow-lg border-4 border-red-600">
      <div className="text-center">
        <Square className="w-8 h-8 mx-auto mb-1 fill-white" />
        <div className="text-sm font-bold">END</div>
      </div>
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-red-700 border-2 border-white"
      />
    </div>
  );
};
