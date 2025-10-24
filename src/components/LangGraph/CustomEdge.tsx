import React, { useState } from 'react';
import { EdgeProps, getBezierPath } from 'react-flow-renderer';
import { useLangGraphStore } from '../../stores/langGraphStore';
import { Edit2 } from 'lucide-react';

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  label,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [condition, setCondition] = useState(data?.condition || '');
  const { updateEdgeCondition } = useLangGraphStore();

  const edgePath = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const [path] = edgePath;
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2;

  const handleSave = () => {
    updateEdgeCondition(id, condition);
    setIsEditing(false);
  };

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={path}
        strokeWidth={2}
        stroke="#94a3b8"
        fill="none"
      />
      <g transform={`translate(${labelX}, ${labelY})`}>
        <foreignObject
          width={200}
          height={50}
          x={-100}
          y={-25}
          className="overflow-visible"
        >
          <div className="flex items-center justify-center">
            {isEditing ? (
              <div className="bg-white border-2 border-gray-300 rounded-lg shadow-lg p-2">
                <input
                  type="text"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') {
                      setCondition(data?.condition || '');
                      setIsEditing(false);
                    }
                  }}
                  placeholder="Enter condition..."
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white border border-gray-300 rounded-full px-3 py-1 text-xs shadow-md hover:shadow-lg transition-shadow flex items-center gap-1.5 group"
                title="Click to edit condition"
              >
                <Edit2 className="w-3 h-3 text-gray-500 group-hover:text-blue-600" />
                <span className="text-gray-700 group-hover:text-blue-600 font-medium">
                  {data?.condition || 'Add condition'}
                </span>
              </button>
            )}
          </div>
        </foreignObject>
      </g>
    </>
  );
};
