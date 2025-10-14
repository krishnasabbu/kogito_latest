import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useChampionChallengeStore } from '../../stores/championChallengeStore';
import { championChallengeService } from '../../services/championChallengeService';
import { PlayCircle, Loader2, FileCode } from 'lucide-react';
import toast from 'react-hot-toast';

interface ExecutionCreatorProps {
  onExecutionCreated: (executionId: string) => void;
  onCancel: () => void;
}

export const ExecutionCreator: React.FC<ExecutionCreatorProps> = ({
  onExecutionCreated,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [championWorkflowId, setChampionWorkflowId] = useState('');
  const [challengeWorkflowId, setChallengeWorkflowId] = useState('');
  const [requestPayload, setRequestPayload] = useState('{\n  "userId": "123",\n  "action": "process"\n}');
  const [isExecuting, setIsExecuting] = useState(false);

  const { addExecution, updateExecution } = useChampionChallengeStore();

  const validateJson = (json: string): boolean => {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
  };

  const handleExecute = async () => {
    if (!name.trim()) {
      toast.error('Please enter a comparison name');
      return;
    }

    if (!championWorkflowId.trim() || !challengeWorkflowId.trim()) {
      toast.error('Please select both champion and challenge workflows');
      return;
    }

    if (!validateJson(requestPayload)) {
      toast.error('Invalid JSON in request payload');
      return;
    }

    setIsExecuting(true);
    const loadingToast = toast.loading('Executing champion vs challenge comparison...');

    try {
      const execution = await championChallengeService.executeComparison(
        championWorkflowId,
        challengeWorkflowId,
        JSON.parse(requestPayload),
        name,
        description
      );

      addExecution(execution);
      toast.dismiss(loadingToast);
      toast.success('Comparison created successfully!');

      setTimeout(() => {
        toast.success('Execution completed! View results now.');
      }, 2500);

      onExecutionCreated(execution.id);
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(`Execution failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const sampleWorkflows = [
    { id: 'workflow-v1', name: 'Payment Processing v1' },
    { id: 'workflow-v2', name: 'Payment Processing v2' },
    { id: 'workflow-v3', name: 'Payment Processing v3' },
    { id: 'order-flow-1', name: 'Order Fulfillment v1' },
    { id: 'order-flow-2', name: 'Order Fulfillment v2' },
  ];

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Create New Comparison</h2>
          <p className="text-gray-600">
            Execute both champion and challenge workflows simultaneously to compare
            performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="font-semibold">
                Comparison Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Payment Flow Optimization Test"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of this comparison"
                className="w-full mt-1 px-3 py-2 border rounded-md resize-none h-24"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="champion" className="font-semibold flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                Champion Workflow *
              </Label>
              <select
                id="champion"
                value={championWorkflowId}
                onChange={(e) => setChampionWorkflowId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-white"
              >
                <option value="">Select champion workflow</option>
                {sampleWorkflows.map((wf) => (
                  <option key={wf.id} value={wf.id}>
                    {wf.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="challenge" className="font-semibold flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                Challenge Workflow *
              </Label>
              <select
                id="challenge"
                value={challengeWorkflowId}
                onChange={(e) => setChallengeWorkflowId(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-white"
              >
                <option value="">Select challenge workflow</option>
                {sampleWorkflows.map((wf) => (
                  <option key={wf.id} value={wf.id}>
                    {wf.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="payload" className="font-semibold flex items-center gap-2">
            <FileCode className="w-4 h-4" />
            Request Payload *
          </Label>
          <p className="text-sm text-gray-600 mb-2">
            JSON payload sent to both workflows
          </p>
          <textarea
            id="payload"
            value={requestPayload}
            onChange={(e) => setRequestPayload(e.target.value)}
            className="w-full mt-1 px-3 py-2 border rounded-md font-mono text-sm resize-none h-48 bg-gray-50"
            spellCheck={false}
          />
          {!validateJson(requestPayload) && requestPayload && (
            <p className="text-sm text-red-600 mt-1">Invalid JSON format</p>
          )}
        </div>

        <Card className="p-4 bg-red-50 border-wells-red">
          <h4 className="font-semibold mb-2 text-wells-red font-wells">How it works:</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Both workflows execute simultaneously with identical input</li>
            <li>• Metrics are collected for every node in each workflow</li>
            <li>• Performance is compared side-by-side with detailed analysis</li>
            <li>• View request/response data and apply filters for deep insights</li>
          </ul>
        </Card>

        <div className="flex items-center gap-3 pt-4 border-t">
          <Button
            onClick={handleExecute}
            disabled={isExecuting}
            className="flex-1 bg-gradient-to-r from-wells-red to-wells-gold hover:from-wells-red-hover hover:to-wells-gold"
            size="lg"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <PlayCircle className="w-5 h-5 mr-2" />
                Execute Comparison
              </>
            )}
          </Button>
          <Button onClick={onCancel} variant="outline" size="lg" disabled={isExecuting}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};
