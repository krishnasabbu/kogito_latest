import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Trophy, Plus, BarChart3, TrendingUp } from 'lucide-react';
import { ComparisonMaster, AggregateMetrics, ChampionChallengeExecution } from '../../types/championChallenge';
import { comparisonApiService } from '../../services/comparisonApiService';
import { championChallengeService } from '../../services/championChallengeService';
import toast from 'react-hot-toast';
import { ComparisonListSidebar } from './ComparisonListSidebar';
import { CompareAllDashboard } from './CompareAllDashboard';
import { CompareAllCreator } from './CompareAllCreator';

type View = 'list' | 'create' | 'dashboard';

export const CompareAllApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('list');
  const [comparisons, setComparisons] = useState<ComparisonMaster[]>([]);
  const [selectedComparison, setSelectedComparison] = useState<ComparisonMaster | null>(null);
  const [aggregateMetrics, setAggregateMetrics] = useState<AggregateMetrics | null>(null);
  const [availableExecutions, setAvailableExecutions] = useState<ChampionChallengeExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [comparisonList, executions] = await Promise.all([
        comparisonApiService.listComparisons(),
        championChallengeService.listExecutions(),
      ]);
      setComparisons(comparisonList);
      setAvailableExecutions(executions);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load comparisons');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentView('create');
  };

  const handleComparisonCreated = async (comparisonId: string) => {
    await loadData();
    const comparison = comparisons.find(c => c.id === comparisonId);
    if (comparison) {
      handleSelectComparison(comparison);
    }
    setCurrentView('dashboard');
  };

  const handleSelectComparison = async (comparison: ComparisonMaster) => {
    setSelectedComparison(comparison);
    setCurrentView('dashboard');

    if (comparison.totalExecutions > 0) {
      try {
        const metrics = await comparisonApiService.getAggregateMetrics(comparison.id);
        setAggregateMetrics(metrics);
      } catch (error) {
        console.error('Failed to load metrics:', error);
        toast.error('Failed to load metrics');
      }
    }
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedComparison(null);
    setAggregateMetrics(null);
  };

  const handleDeleteComparison = async (comparisonId: string) => {
    try {
      await comparisonApiService.deleteComparison(comparisonId);
      toast.success('Comparison deleted');
      await loadData();
      if (selectedComparison?.id === comparisonId) {
        handleBackToList();
      }
    } catch (error) {
      console.error('Failed to delete comparison:', error);
      toast.error('Failed to delete comparison');
    }
  };

  return (
    <div className="h-full flex flex-col bg-light-bg dark:bg-dark-bg">
      {/* Page Header */}
      <div className="border-b border-light-border dark:border-dark-border bg-white dark:bg-dark-surface">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-card">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-wells text-light-text-primary dark:text-dark-text-primary">
                  Compare All Executions
                </h1>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                  Aggregate analysis across multiple test runs
                </p>
              </div>
            </div>

            {currentView === 'list' && (
              <Button
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Comparison
              </Button>
            )}

            {currentView !== 'list' && (
              <Button
                onClick={handleBackToList}
                variant="outline"
              >
                Back to List
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {currentView === 'list' && (
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-light-text-secondary dark:text-dark-text-secondary">
                  Loading comparisons...
                </div>
              </div>
            ) : comparisons.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64">
                <TrendingUp className="w-16 h-16 text-light-text-tertiary dark:text-dark-text-tertiary mb-4" />
                <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-2">
                  No Comparisons Yet
                </h3>
                <p className="text-light-text-secondary dark:text-dark-text-secondary mb-4">
                  Create your first comparison to analyze multiple executions
                </p>
                <Button onClick={handleCreateNew} className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Comparison
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {comparisons.map((comparison) => (
                  <Card
                    key={comparison.id}
                    className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => handleSelectComparison(comparison)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-light-text-primary dark:text-dark-text-primary mb-1">
                          {comparison.name}
                        </h3>
                        {comparison.description && (
                          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-2">
                            {comparison.description}
                          </p>
                        )}
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        comparison.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        comparison.status === 'ANALYZING' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        {comparison.status}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-light-text-secondary dark:text-dark-text-secondary">Executions</span>
                        <span className="font-semibold text-light-text-primary dark:text-dark-text-primary">
                          {comparison.totalExecutions}
                        </span>
                      </div>
                      {comparison.outlierCount > 0 && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-light-text-secondary dark:text-dark-text-secondary">Outliers</span>
                          <span className="font-semibold text-orange-600 dark:text-orange-400">
                            {comparison.outlierCount}
                          </span>
                        </div>
                      )}
                      <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary pt-2 border-t border-light-border dark:border-dark-border">
                        {new Date(comparison.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'create' && (
          <div className="flex-1 overflow-y-auto">
            <CompareAllCreator
              executions={availableExecutions}
              onComparisonCreated={handleComparisonCreated}
              onCancel={handleBackToList}
            />
          </div>
        )}

        {currentView === 'dashboard' && selectedComparison && (
          <div className="flex-1 flex overflow-hidden">
            <ComparisonListSidebar
              comparisons={comparisons}
              selectedComparison={selectedComparison}
              onSelectComparison={handleSelectComparison}
              onDeleteComparison={handleDeleteComparison}
            />
            <div className="flex-1 overflow-y-auto">
              <CompareAllDashboard
                comparison={selectedComparison}
                metrics={aggregateMetrics}
                onRefresh={() => handleSelectComparison(selectedComparison)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
