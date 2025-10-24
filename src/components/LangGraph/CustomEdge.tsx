import React from 'react';
import { EdgeProps, getSmoothStepPath } from 'react-flow-renderer';
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
  const edgePath = getSmoothStepPath({
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

  const handleButtonClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (data?.onEdgeClick) {
      data.onEdgeClick({ id });
    }
  };

  return (
    <g className="react-flow__edge">
      <path
        id={id}
        className="react-flow__edge-path"
        d={path}
        fill="none"
        stroke={style.stroke || '#3b82f6'}
        strokeWidth={style.strokeWidth || 4}
        markerEnd={markerEnd}
      />

      <circle
        cx={labelX}
        cy={labelY}
        r={18}
        fill="white"
        stroke="#3b82f6"
        strokeWidth={3}
        style={{ cursor: 'pointer' }}
        onClick={handleButtonClick}
      />

      <foreignObject
        width={36}
        height={36}
        x={labelX - 18}
        y={labelY - 18}
        style={{ pointerEvents: 'none' }}
      >
        <div className="flex items-center justify-center w-full h-full">
          <Settings className="w-5 h-5 text-blue-600" />
        </div>
      </foreignObject>

      {data?.condition && (
        <text
          x={labelX + 28}
          y={labelY + 5}
          fill="#3b82f6"
          fontSize={12}
          fontWeight={600}
        >
          {data.condition}
        </text>
      )}
    </g>
  );
};
