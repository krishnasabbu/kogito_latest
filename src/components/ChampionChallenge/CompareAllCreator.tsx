import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ChampionChallengeExecution } from '../../types/championChallenge';
import { comparisonApiService } from '../../services/comparisonApiService';
import toast from 'react-hot-toast';
import { CheckCircle, Circle } from 'lucide-react';

interface CompareAllCreatorProps {
  executions: ChampionChallengeExecution[];
  onComparisonCreated: (comparisonId: string) => void;
  onCancel: () => void;
}

export const CompareAllCreator: React.FC<CompareAllCreatorProps> = ({
  executions,
  onComparisonCreated,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedExecutions, setSelectedExecutions] = useState<Set<string>>(new Set());
  const [isCreating, setIsCreating] = useState(false);

  const workflowPairs = useMemo(() => {
    const pairs = new Map<string, { champion: string; challenge: string; count: number }>();

    executions.forEach((exec) => {
      const key = `${exec.championWorkflowId}::${exec.challengeWorkflowId}`;
      if (pairs.has(key)) {
        pairs.get(key)!.count++;
      } else {
        pairs.set(key, {
          champion: exec.championWorkflowId,
          challenge: exec.challengeWorkflowId,
          count: 1,
        });
      }
    });

    return Array.from(pairs.values());
  }, [executions]);

  const [selectedPair, setSelectedPair] = useState<{ champion: string; challenge: string } | null>(
    workflowPairs.length > 0 ? workflowPairs[0] : null
  );

  const filteredExecutions = useMemo(() => {
    if (!selectedPair) return [];
    return executions.filter(
      (exec) =>
        exec.championWorkflowId === selectedPair.champion &&
        exec.challengeWorkflowId === selectedPair.challenge
    );
  }, [executions, selectedPair]);

  const toggleExecution = (executionId: string) => {
    const newSet = new Set(selectedExecutions);
    if (newSet.has(executionId)) {
      newSet.delete(executionId);
    } else {
      newSet.add(executionId);
    }
    setSelectedExecutions(newSet);
  };

  const selectAll = () => {
    setSelectedExecutions(new Set(filteredExecutions.map((e) => e.id)));
  };

  const deselectAll = () => {
    setSelectedExecutions(new Set());
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a comparison name');
      return;
    }

    if (selectedExecutions.size === 0) {
      toast.error('Please select at least one execution');
      return;
    }

    if (!selectedPair) {
      toast.error('Please select a workflow pair');
      return;
    }

    setIsCreating(true);
    try {
      const result = await comparisonApiService.createComparison({
        name: name.trim(),
        description: description.trim() || undefined,
        championWorkflowId: selectedPair.champion,
        challengeWorkflowId: selectedPair.challenge,
        executionIds: Array.from(selectedExecutions),
      });

      toast.success('Comparison created successfully');
      onComparisonCreated(result.id);
    } catch (error) {
      console.error('Failed to create comparison:', error);
      toast.error('Failed to create comparison');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Comparison</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Comparison Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Q4 Payment Optimization"
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this comparison"
              />
            </div>
          </div>

          {/* Workflow Pair Selection */}
          <div>
            <Label>Select Workflow Pair</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {workflowPairs.map((pair, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedPair?.champion === pair.champion &&
                    selectedPair?.challenge === pair.challenge
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-light-border dark:border-dark-border hover:border-purple-300'
                  }`}
                  onClick={() => setSelectedPair({ champion: pair.champion, challenge: pair.challenge })}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                        {pair.champion} vs {pair.challenge}
                      </div>
                      <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                        {pair.count} executions available
                      </div>
                    </div>
                    {selectedPair?.champion === pair.champion &&
                      selectedPair?.challenge === pair.challenge && (
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Execution Selection */}
          {selectedPair && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Select Executions ({selectedExecutions.size} selected)</Label>
                <div className="space-x-2">
                  <Button onClick={selectAll} size="sm" variant="outline">
                    Select All
                  </Button>
                  <Button onClick={deselectAll} size="sm" variant="outline">
                    Deselect All
                  </Button>
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto border border-light-border dark:border-dark-border rounded-lg">
                {filteredExecutions.map((exec) => (
                  <div
                    key={exec.id}
                    className={`p-4 border-b border-light-border dark:border-dark-border cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      selectedExecutions.has(exec.id) ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                    }`}
                    onClick={() => toggleExecution(exec.id)}
                  >
                    <div className="flex items-center gap-3">
                      {selectedExecutions.has(exec.id) ? (
                        <CheckCircle className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                          {exec.name}
                        </div>
                        {exec.description && (
                          <div className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                            {exec.description}
                          </div>
                        )}
                        <div className="text-xs text-light-text-tertiary dark:text-dark-text-tertiary mt-1">
                          {new Date(exec.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-light-border dark:border-dark-border">
            <Button onClick={onCancel} variant="outline" disabled={isCreating}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={isCreating || !name.trim() || selectedExecutions.size === 0}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white"
            >
              {isCreating ? 'Creating...' : `Create Comparison (${selectedExecutions.size} executions)`}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
