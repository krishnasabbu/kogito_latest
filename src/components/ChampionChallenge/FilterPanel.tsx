import React from 'react';
import { Card } from '../ui/card';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { ComparisonFilter } from '../../types/championChallenge';
import { Filter, RotateCcw } from 'lucide-react';

interface FilterPanelProps {
  filters: ComparisonFilter;
  onChange: (filters: Partial<ComparisonFilter>) => void;
  availableNodeTypes?: string[];
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onChange,
  availableNodeTypes = [],
}) => {
  const resetFilters = () => {
    onChange({
      variant: 'both',
      status: 'all',
      nodeTypes: [],
      executionTimeRange: undefined,
    });
  };

  const handleVariantChange = (variant: ComparisonFilter['variant']) => {
    onChange({ variant });
  };

  const handleStatusChange = (status: ComparisonFilter['status']) => {
    onChange({ status });
  };

  const toggleNodeType = (nodeType: string) => {
    const currentTypes = filters.nodeTypes || [];
    const newTypes = currentTypes.includes(nodeType)
      ? currentTypes.filter((t) => t !== nodeType)
      : [...currentTypes, nodeType];
    onChange({ nodeTypes: newTypes });
  };

  const handleTimeRangeChange = (min?: number, max?: number) => {
    if (min !== undefined || max !== undefined) {
      onChange({
        executionTimeRange: {
          min: min ?? filters.executionTimeRange?.min ?? 0,
          max: max ?? filters.executionTimeRange?.max ?? 10000,
        },
      });
    } else {
      onChange({ executionTimeRange: undefined });
    }
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Filters</h3>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={resetFilters}
            className="text-sm"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-sm font-medium mb-2 block">Variant</Label>
            <div className="grid grid-cols-3 gap-2">
              {['both', 'champion', 'challenge'].map((variant) => (
                <button
                  key={variant}
                  onClick={() =>
                    handleVariantChange(variant as ComparisonFilter['variant'])
                  }
                  className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                    filters.variant === variant
                      ? variant === 'champion'
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : variant === 'challenge'
                        ? 'bg-purple-100 border-purple-500 text-purple-700'
                        : 'bg-gray-100 border-gray-500 text-gray-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {variant.charAt(0).toUpperCase() + variant.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium mb-2 block">Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {['all', 'success', 'error', 'skipped'].map((status) => (
                <button
                  key={status}
                  onClick={() =>
                    handleStatusChange(status as ComparisonFilter['status'])
                  }
                  className={`px-3 py-2 text-sm font-medium rounded-lg border-2 transition-all ${
                    filters.status === status
                      ? status === 'success'
                        ? 'bg-green-100 border-green-500 text-green-700'
                        : status === 'error'
                        ? 'bg-red-100 border-red-500 text-red-700'
                        : status === 'skipped'
                        ? 'bg-yellow-100 border-yellow-500 text-yellow-700'
                        : 'bg-gray-100 border-gray-500 text-gray-700'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {availableNodeTypes.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-2 block">Node Types</Label>
              <div className="flex flex-wrap gap-2">
                {availableNodeTypes.map((nodeType) => (
                  <button
                    key={nodeType}
                    onClick={() => toggleNodeType(nodeType)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                      filters.nodeTypes?.includes(nodeType)
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {nodeType}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className="text-sm font-medium mb-2 block">
              Execution Time Range (ms)
            </Label>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.executionTimeRange?.min ?? ''}
                  onChange={(e) =>
                    handleTimeRangeChange(
                      e.target.value ? Number(e.target.value) : undefined,
                      filters.executionTimeRange?.max
                    )
                  }
                  className="flex-1 px-3 py-2 text-sm border rounded-lg"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.executionTimeRange?.max ?? ''}
                  onChange={(e) =>
                    handleTimeRangeChange(
                      filters.executionTimeRange?.min,
                      e.target.value ? Number(e.target.value) : undefined
                    )
                  }
                  className="flex-1 px-3 py-2 text-sm border rounded-lg"
                />
              </div>
              {filters.executionTimeRange && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleTimeRangeChange()}
                  className="w-full text-xs"
                >
                  Clear Range
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="pt-3 border-t">
          <div className="text-sm text-gray-600">
            <div className="font-medium mb-1">Active Filters:</div>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Variant: {filters.variant}</li>
              <li>Status: {filters.status}</li>
              {filters.nodeTypes && filters.nodeTypes.length > 0 && (
                <li>Node Types: {filters.nodeTypes.length} selected</li>
              )}
              {filters.executionTimeRange && (
                <li>
                  Time: {filters.executionTimeRange.min}-
                  {filters.executionTimeRange.max}ms
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
};
