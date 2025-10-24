import React from 'react';
import { EdgeProps, getBezierPath } from 'react-flow-renderer';

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
  style,
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
        strokeWidth={2.5}
        stroke="#64748b"
        fill="none"
        markerEnd={markerEnd}
        style={{ ...style, strokeOpacity: 0.8 }}
      />

      <circle
        cx={labelX}
        cy={labelY}
        r={8}
        fill="white"
        stroke="#3b82f6"
        strokeWidth={2.5}
        className="cursor-pointer hover:fill-blue-50 hover:stroke-blue-600 transition-all"
      />

      {data?.condition && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <foreignObject
            width={140}
            height={28}
            x={14}
            y={-14}
            style={{ pointerEvents: 'none' }}
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap overflow-hidden text-ellipsis shadow-lg">
              {data.condition}
            </div>
          </foreignObject>
        </g>
      )}
    </>
  );
};
