import React, { useState, useEffect } from 'react';
import { useChampionChallengeStore } from '../../stores/championChallengeStore';
import { ComparisonDashboard } from './ComparisonDashboard';
import { ExecutionCreator } from './ExecutionCreator';
import { ExecutionList } from './ExecutionList';
import { CompareAllAnalyticsDashboard } from './CompareAllAnalyticsDashboard';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Trophy, Plus, BarChart3 } from 'lucide-react';
import { championChallengeService } from '../../services/championChallengeService';
import toast from 'react-hot-toast';

type View = 'list' | 'create' | 'dashboard';
type Tab = 'individual' | 'compareAll';

export const ChampionChallengeApp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('individual');
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedExecutionId, setSelectedExecutionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { executions, addExecution, setCurrentExecution } = useChampionChallengeStore();

  useEffect(() => {
    loadExecutions();
  }, []);

  const loadExecutions = async () => {
    setIsLoading(true);
    try {
      const executionList = await championChallengeService.listExecutions();
      executionList.forEach(exec => addExecution(exec));
    } catch (error) {
      console.error('Failed to load executions:', error);
      toast.error('Failed to load executions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentView('create');
  };

  const handleExecutionCreated = (executionId: string) => {
    setSelectedExecutionId(executionId);
    setCurrentView('dashboard');
    loadExecutions();
  };

  const handleViewExecution = async (executionId: string) => {
    try {
      const execution = await championChallengeService.loadExecution(executionId);
      if (execution) {
        setCurrentExecution(execution);
        setSelectedExecutionId(executionId);
        setCurrentView('dashboard');
      } else {
        throw new Error('Execution not found');
      }
    } catch (error) {
      console.error('Failed to load execution:', error);
      toast.error('Failed to load execution details');
    }
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedExecutionId(null);
  };

  return (
    <div className="h-full flex flex-col bg-light-bg dark:bg-dark-bg">
      {/* Page Header */}
      <div className="border-b border-light-border dark:border-dark-border bg-white dark:bg-dark-surface">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-wells-red to-wells-gold rounded-xl flex items-center justify-center shadow-card">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-wells text-light-text-primary dark:text-dark-text-primary">
                  Champion vs Challenge
                </h1>
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary font-wells">
                  Compare BPMN workflow executions
                </p>
              </div>
            </div>

            {activeTab === 'individual' && (
              <div className="flex items-center gap-3">
                {currentView !== 'list' && (
                  <Button
                    onClick={handleBackToList}
                    variant="outline"
                    className="border-light-border dark:border-dark-border"
                  >
                    Back to List
                  </Button>
                )}
                {currentView === 'list' && (
                  <Button
                    onClick={handleCreateNew}
                    className="bg-gradient-to-r from-wells-red to-wells-gold hover:from-wells-red-hover hover:to-wells-gold text-white"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    New Comparison
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-light-border dark:border-dark-border px-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('individual')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'individual'
                  ? 'border-wells-red text-wells-red'
                  : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
              }`}
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Individual Comparison
              </div>
            </button>
            <button
              onClick={() => setActiveTab('compareAll')}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'compareAll'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Compare All
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'compareAll' ? (
          <CompareAllAnalyticsDashboard />
        ) : (
          <>
        {currentView === 'list' && (
          <div className="h-full overflow-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wells-red mx-auto mb-4"></div>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary">
                    Loading executions...
                  </p>
                </div>
              </div>
            ) : executions.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Card className="p-12 text-center max-w-md">
                  <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold mb-2 text-light-text-primary dark:text-dark-text-primary">
                    No Comparisons Yet
                  </h3>
                  <p className="text-light-text-secondary dark:text-dark-text-secondary mb-6">
                    Create your first champion vs challenge comparison to get started
                  </p>
                  <Button
                    onClick={handleCreateNew}
                    className="bg-gradient-to-r from-wells-red to-wells-gold hover:from-wells-red-hover hover:to-wells-gold text-white"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Comparison
                  </Button>
                </Card>
              </div>
            ) : (
              <div className="max-w-7xl mx-auto">
                <ExecutionList
                  executions={executions}
                  onViewExecution={handleViewExecution}
                />
              </div>
            )}
          </div>
        )}

        {currentView === 'create' && (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-4xl mx-auto">
              <ExecutionCreator
                onExecutionCreated={handleExecutionCreated}
                onCancel={handleBackToList}
              />
            </div>
          </div>
        )}

        {currentView === 'dashboard' && selectedExecutionId && (
          <div className="h-full">
            <ComparisonDashboard executionId={selectedExecutionId} />
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
};
