import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Play } from 'lucide-react';
import { Button } from '../ui/button';
import axios from 'axios';
import toast from 'react-hot-toast';

interface WorkflowExecuteModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowJSON: string;
}

export const WorkflowExecuteModal: React.FC<WorkflowExecuteModalProps> = ({
  isOpen,
  onClose,
  workflowJSON,
}) => {
  const [inputJson, setInputJson] = useState('{}');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const replaceTemplateVariables = (template: string, inputs: any): string => {
    let result = template;
    const regex = /\{\{([^}]+)\}\}/g;
    const matches = template.matchAll(regex);

    for (const match of matches) {
      const path = match[1];
      const value = getNestedValue(inputs, path);
      result = result.replace(match[0], JSON.stringify(value));
    }

    return result;
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const handleExecute = async () => {
    setIsLoading(true);
    setResponse('');
    try {
      const workflow = JSON.parse(workflowJSON);
      const inputs = JSON.parse(inputJson);

      // Send workflow execution request to dummy API
      const apiResponse = await fetch('https://jsonplaceholder.typicode.com/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflow: workflow,
          inputs: inputs,
        }),
      });

      if (!apiResponse.ok) {
        throw new Error('API request failed');
      }

      const apiResult = await apiResponse.json();

      // Simulate workflow execution results
      const nodes = workflow.graph?.nodes || [];
      let executionResults: any[] = [];

      for (const node of nodes) {
        if (node.type === 'service' && node.data?.url) {
          try {
            const processedBody = replaceTemplateVariables(node.data.request || '{}', inputs);
            let requestBody;
            try {
              requestBody = JSON.parse(processedBody);
            } catch {
              requestBody = processedBody;
            }

            const config: any = {
              method: node.data.method || 'POST',
              url: node.data.url,
            };

            if (config.method !== 'GET') {
              config.data = requestBody;
            }

            const result = await axios(config);
            executionResults.push({
              nodeId: node.id,
              label: node.data.label,
              status: 'success',
              response: result.data,
            });
          } catch (error: any) {
            executionResults.push({
              nodeId: node.id,
              label: node.data.label,
              status: 'error',
              error: error.response?.data || error.message,
            });
          }
        }
      }

      const finalResult = {
        apiSubmission: {
          id: apiResult.id,
          message: 'Workflow submitted to API successfully',
        },
        nodeExecutions: executionResults,
      };

      setResponse(JSON.stringify(finalResult, null, 2));
      toast.success('Workflow execution completed');
    } catch (error: any) {
      const errorMessage = error.message || 'Workflow execution failed';
      setResponse(JSON.stringify({ error: errorMessage }, null, 2));
      toast.error('Workflow execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[9999]">
      <div className="bg-white w-full h-full flex flex-col">
        <div className="bg-[#10b981] text-white px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Execute Workflow</h2>
            <p className="text-sm opacity-90 mt-1">Run the entire workflow with input data</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#059669] rounded transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/2 border-r border-gray-200 p-6 flex flex-col">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Input JSON</h3>
            <p className="text-sm text-gray-600 mb-4">
              Provide the input data for the workflow execution
            </p>
            <textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              className="flex-1 w-full px-6 py-4 text-base font-mono border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-[#10b981] bg-white resize-none"
              placeholder='{\n  "field": {\n    "name": "value"\n  }\n}'
            />
          </div>

          <div className="flex-1 p-6 flex flex-col bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Execution Results</h3>
            <div className="flex-1 w-full px-6 py-4 text-base font-mono border-2 border-gray-300 rounded-lg bg-white overflow-auto whitespace-pre-wrap">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-[#10b981] mx-auto mb-4" />
                    <p className="text-gray-600">Executing workflow...</p>
                  </div>
                </div>
              ) : response ? (
                response
              ) : (
                <span className="text-gray-400">Results will appear here after execution...</span>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 px-8 py-6 flex justify-between items-center">
          <Button variant="outline" onClick={onClose} className="px-6 py-3 text-base">
            Close
          </Button>
          <Button
            onClick={handleExecute}
            disabled={isLoading}
            className="bg-[#10b981] hover:bg-[#059669] text-white px-8 py-3 text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Execute Workflow
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
