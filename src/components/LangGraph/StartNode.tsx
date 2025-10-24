import React from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { Play } from 'lucide-react';

export const StartNode: React.FC = () => {
  return (
    <div className="bg-green-500 text-white rounded-full w-24 h-24 flex items-center justify-center shadow-lg border-4 border-green-600">
      <div className="text-center">
        <Play className="w-8 h-8 mx-auto mb-1 fill-white" />
        <div className="text-sm font-bold">START</div>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-700 border-2 border-white"
      />
    </div>
  );
};
