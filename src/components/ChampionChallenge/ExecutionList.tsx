import React from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { ChampionChallengeExecution } from '../../types/championChallenge';
import { Eye, Clock, CheckCircle, XCircle, Trophy } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ExecutionListProps {
  executions: ChampionChallengeExecution[];
  onViewExecution: (executionId: string) => void;
}

export const ExecutionList: React.FC<ExecutionListProps> = ({
  executions,
  onViewExecution,
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'running':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      default:
        return null;
    }
  };

  const calculateWinner = (execution: ChampionChallengeExecution) => {
    const championTime = execution.metrics.champion.reduce(
      (sum, m) => sum + m.executionTimeMs,
      0
    );
    const challengeTime = execution.metrics.challenge.reduce(
      (sum, m) => sum + m.executionTimeMs,
      0
    );

    if (championTime === challengeTime) return 'tie';
    return championTime < challengeTime ? 'champion' : 'challenge';
  };

  const sortedExecutions = [...executions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedExecutions.map((execution) => {
        const winner = calculateWinner(execution);
        const duration = execution.completedAt
          ? (
              (new Date(execution.completedAt).getTime() -
                new Date(execution.startedAt).getTime()) /
              1000
            ).toFixed(2)
          : null;

        return (
          <Card
            key={execution.id}
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => onViewExecution(execution.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getStatusIcon(execution.status)}
                  <h3 className="text-lg font-semibold">{execution.name}</h3>
                  {execution.status === 'completed' && winner !== 'tie' && (
                    <div
                      className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        winner === 'champion'
                          ? 'bg-red-100 text-wells-red'
                          : 'bg-yellow-100 text-gray-800'
                      }`}
                    >
                      <Trophy className="w-3 h-3" />
                      {winner.charAt(0).toUpperCase() + winner.slice(1)} Won
                    </div>
                  )}
                </div>

                {execution.description && (
                  <p className="text-sm text-gray-600 mb-3">
                    {execution.description}
                  </p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-gray-600">Champion Nodes</div>
                    <div className="text-lg font-semibold">
                      {execution.metrics.champion.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Challenge Nodes</div>
                    <div className="text-lg font-semibold">
                      {execution.metrics.challenge.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Status</div>
                    <div
                      className={`text-sm font-semibold ${
                        execution.status === 'completed'
                          ? 'text-green-600'
                          : execution.status === 'running'
                          ? 'text-blue-600'
                          : 'text-red-600'
                      }`}
                    >
                      {execution.status.toUpperCase()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-600">Duration</div>
                    <div className="text-sm font-semibold font-mono">
                      {duration ? `${duration}s` : '-'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div>
                    Created {formatDistanceToNow(new Date(execution.createdAt), { addSuffix: true })}
                  </div>
                  <div>•</div>
                  <div>Champion: {execution.championWorkflowId}</div>
                  <div>•</div>
                  <div>Challenge: {execution.challengeWorkflowId}</div>
                </div>
              </div>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewExecution(execution.id);
                }}
                className="ml-4"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
