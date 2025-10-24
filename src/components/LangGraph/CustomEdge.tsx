import React from 'react';
import { EdgeProps, getBezierPath } from 'react-flow-renderer';

export const CustomEdge: React.FC<EdgeProps> = (props) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    arrowHeadType,
    markerEndId,
  } = props;

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
        style={{ stroke: '#64748b', strokeWidth: 3 }}
        className="react-flow__edge-path"
        d={path}
        markerEnd={markerEndId ? `url(#${markerEndId})` : undefined}
      />

      <circle
        cx={labelX}
        cy={labelY}
        r={10}
        fill="white"
        stroke="#3b82f6"
        strokeWidth={3}
        style={{ cursor: 'pointer' }}
      />

      {data?.condition && (
        <text
          x={labelX + 15}
          y={labelY + 5}
          style={{
            fontSize: '12px',
            fill: '#3b82f6',
            fontWeight: '600',
          }}
        >
          {data.condition}
        </text>
      )}
    </>
  );
};
