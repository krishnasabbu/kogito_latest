import React, { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select } from '../ui/select';
import { JsonFilter } from '../../types/championChallenge';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface JsonFilterPanelProps {
  filters: JsonFilter[];
  onChange: (filters: JsonFilter[]) => void;
  availableKeys?: string[];
}

export const JsonFilterPanel: React.FC<JsonFilterPanelProps> = ({
  filters,
  onChange,
  availableKeys = [],
}) => {
  const [newPath, setNewPath] = useState('');
  const [newOperator, setNewOperator] = useState<JsonFilter['operator']>('equals');
  const [newValue, setNewValue] = useState('');

  const addFilter = () => {
    if (!newPath.trim()) return;

    const filter: JsonFilter = {
      id: uuidv4(),
      path: newPath.trim(),
      operator: newOperator,
      value: newValue,
      enabled: true,
    };

    onChange([...filters, filter]);
    setNewPath('');
    setNewValue('');
  };

  const removeFilter = (id: string) => {
    onChange(filters.filter((f) => f.id !== id));
  };

  const toggleFilter = (id: string) => {
    onChange(
      filters.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f))
    );
  };

  const updateFilter = (id: string, updates: Partial<JsonFilter>) => {
    onChange(filters.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  const operators = [
    { value: 'equals', label: 'Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'greater', label: 'Greater Than' },
    { value: 'less', label: 'Less Than' },
    { value: 'exists', label: 'Exists' },
    { value: 'notExists', label: 'Does Not Exist' },
  ];

  return (
    <Card className="p-4">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-1">JSON Filters</h3>
          <p className="text-sm text-gray-600">
            Filter nodes based on request/response data
          </p>
        </div>

        <div className="space-y-3">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className={`p-3 border rounded-lg transition-all ${
                filter.enabled
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-gray-50 opacity-60'
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      value={filter.path}
                      onChange={(e) =>
                        updateFilter(filter.id, { path: e.target.value })
                      }
                      placeholder="e.g., user.email"
                      className="flex-1 h-8 text-sm"
                    />
                    <select
                      value={filter.operator}
                      onChange={(e) =>
                        updateFilter(filter.id, {
                          operator: e.target.value as JsonFilter['operator'],
                        })
                      }
                      className="h-8 px-2 text-sm border rounded-md bg-white"
                    >
                      {operators.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!['exists', 'notExists'].includes(filter.operator) && (
                    <Input
                      value={filter.value}
                      onChange={(e) =>
                        updateFilter(filter.id, { value: e.target.value })
                      }
                      placeholder="Value"
                      className="h-8 text-sm"
                    />
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleFilter(filter.id)}
                    className="h-8 w-8 p-0"
                  >
                    {filter.enabled ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeFilter(filter.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-3">
          <Label className="text-sm font-medium">Add New Filter</Label>

          <div className="space-y-2">
            {availableKeys.length > 0 && (
              <div>
                <Label className="text-xs text-gray-600">Common Paths</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {availableKeys.slice(0, 10).map((key) => (
                    <button
                      key={key}
                      onClick={() => setNewPath(key)}
                      className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors"
                    >
                      {key}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex-1">
                <Label className="text-xs">JSON Path</Label>
                <Input
                  value={newPath}
                  onChange={(e) => setNewPath(e.target.value)}
                  placeholder="e.g., response.status"
                  className="h-9 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addFilter();
                  }}
                />
              </div>

              <div className="w-36">
                <Label className="text-xs">Operator</Label>
                <select
                  value={newOperator}
                  onChange={(e) =>
                    setNewOperator(e.target.value as JsonFilter['operator'])
                  }
                  className="w-full h-9 px-2 text-sm border rounded-md bg-white"
                >
                  {operators.map((op) => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!['exists', 'notExists'].includes(newOperator) && (
              <div>
                <Label className="text-xs">Value</Label>
                <Input
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Filter value"
                  className="h-9 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addFilter();
                  }}
                />
              </div>
            )}

            <Button onClick={addFilter} className="w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Filter
            </Button>
          </div>
        </div>

        {filters.length > 0 && (
          <div className="pt-3 border-t">
            <div className="text-sm text-gray-600">
              <span className="font-medium">
                {filters.filter((f) => f.enabled).length}
              </span>{' '}
              of {filters.length} filters active
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
