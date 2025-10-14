import React from 'react';
import { Card } from '../ui/card';
import { ComparisonMaster } from '../../types/championChallenge';
import { CheckCircle, AlertCircle, Loader, Trash2 } from 'lucide-react';

interface ComparisonListSidebarProps {
  comparisons: ComparisonMaster[];
  selectedComparison: ComparisonMaster | null;
  onSelectComparison: (comparison: ComparisonMaster) => void;
  onDeleteComparison: (comparisonId: string) => void;
}

export const ComparisonListSidebar: React.FC<ComparisonListSidebarProps> = ({
  comparisons,
  selectedComparison,
  onSelectComparison,
  onDeleteComparison,
}) => {
  return (
    <div className="w-80 border-r border-light-border dark:border-dark-border bg-white dark:bg-dark-surface overflow-y-auto">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-light-text-secondary dark:text-dark-text-secondary mb-4 uppercase tracking-wide">
          Comparisons
        </h3>
        <div className="space-y-2">
          {comparisons.map((comparison) => {
            const isSelected = selectedComparison?.id === comparison.id;
            return (
              <Card
                key={comparison.id}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20'
                    : 'hover:shadow-md'
                }`}
                onClick={() => onSelectComparison(comparison)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-light-text-primary dark:text-dark-text-primary line-clamp-1">
                      {comparison.name}
                    </h4>
                    <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                      {comparison.totalExecutions} executions
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {comparison.status === 'COMPLETED' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {comparison.status === 'ANALYZING' && (
                      <Loader className="w-4 h-4 text-blue-500 animate-spin" />
                    )}
                    {comparison.status === 'FAILED' && (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>

                {comparison.outlierCount > 0 && (
                  <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400 mb-2">
                    <AlertCircle className="w-3 h-3" />
                    <span>{comparison.outlierCount} outliers</span>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-light-border dark:border-dark-border">
                  <span className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary">
                    {new Date(comparison.createdAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteComparison(comparison.id);
                    }}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
