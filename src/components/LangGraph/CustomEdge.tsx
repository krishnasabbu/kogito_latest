import React from 'react';
import { EdgeProps, getBezierPath } from 'react-flow-renderer';
import { Settings } from 'lucide-react';

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  style = {},
  markerEnd,
}) => {
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

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={path}
        markerEnd={markerEnd}
        style={{
          stroke: '#3b82f6',
          strokeWidth: 3,
          ...style,
        }}
      />

      <foreignObject
        width={40}
        height={40}
        x={labelX - 20}
        y={labelY - 20}
        style={{ overflow: 'visible' }}
      >
        <div
          className="flex items-center justify-center w-10 h-10 bg-white border-3 border-blue-500 rounded-full shadow-lg cursor-pointer hover:bg-blue-50 hover:border-blue-600 hover:scale-110 transition-all"
          style={{ pointerEvents: 'all' }}
        >
          <Settings className="w-5 h-5 text-blue-600" />
        </div>
      </foreignObject>

      {data?.condition && (
        <foreignObject
          width={200}
          height={30}
          x={labelX + 25}
          y={labelY - 15}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap">
            {data.condition}
          </div>
        </foreignObject>
      )}
    </>
  );
};
