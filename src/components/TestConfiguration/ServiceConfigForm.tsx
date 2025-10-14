import { useState } from 'react';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Loader2, CheckCircle2, XCircle, Trash2 } from 'lucide-react';

interface ServiceFormData {
  name: string;
  controller_url: string;
  request_details: string;
  header_details: string;
  health_url: string;
}

interface ServiceConfigFormProps {
  type: 'champion' | 'challenger';
  data: ServiceFormData;
  onChange: (data: ServiceFormData) => void;
  onTestConnection?: () => Promise<void>;
  onRemove?: () => void;
  connectionStatus?: 'healthy' | 'unhealthy' | 'untested';
  responseTime?: number;
  isTestingConnection?: boolean;
}

export function ServiceConfigForm({
  type,
  data,
  onChange,
  onTestConnection,
  onRemove,
  connectionStatus = 'untested',
  responseTime,
  isTestingConnection = false,
}: ServiceConfigFormProps) {
  const [jsonErrors, setJsonErrors] = useState<{ request?: string; header?: string }>({});

  const handleChange = (field: keyof ServiceFormData, value: string) => {
    onChange({ ...data, [field]: value });

    if (field === 'request_details' || field === 'header_details') {
      try {
        JSON.parse(value || '{}');
        setJsonErrors((prev) => ({ ...prev, [field === 'request_details' ? 'request' : 'header']: undefined }));
      } catch (err) {
        setJsonErrors((prev) => ({
          ...prev,
          [field === 'request_details' ? 'request' : 'header']: 'Invalid JSON format',
        }));
      }
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold">
            {type === 'champion' ? 'Champion Configuration' : `Challenger Configuration`}
          </h3>
          {connectionStatus !== 'untested' && (
            <div className="flex items-center gap-2">
              {connectionStatus === 'healthy' ? (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              <span className={`text-sm ${connectionStatus === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                {connectionStatus === 'healthy' ? 'Healthy' : 'Unhealthy'}
              </span>
              {responseTime && (
                <span className="text-sm text-gray-500">({responseTime}ms)</span>
              )}
            </div>
          )}
        </div>
        {type === 'challenger' && onRemove && (
          <Button variant="outline" size="sm" onClick={onRemove}>
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor={`${type}-name`}>Service Name</Label>
          <Input
            id={`${type}-name`}
            value={data.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Production Service"
          />
        </div>

        <div>
          <Label htmlFor={`${type}-controller-url`}>Controller URL</Label>
          <Input
            id={`${type}-controller-url`}
            value={data.controller_url}
            onChange={(e) => handleChange('controller_url', e.target.value)}
            placeholder="https://api.example.com"
            type="url"
          />
        </div>

        <div>
          <Label htmlFor={`${type}-health-url`}>Health URL</Label>
          <Input
            id={`${type}-health-url`}
            value={data.health_url}
            onChange={(e) => handleChange('health_url', e.target.value)}
            placeholder="https://api.example.com/health"
            type="url"
          />
        </div>

        <div>
          <Label htmlFor={`${type}-request-details`}>Request Details (JSON)</Label>
          <textarea
            id={`${type}-request-details`}
            value={data.request_details}
            onChange={(e) => handleChange('request_details', e.target.value)}
            placeholder='{"method": "GET", "timeout": 5000}'
            className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {jsonErrors.request && (
            <p className="text-sm text-red-600 mt-1">{jsonErrors.request}</p>
          )}
        </div>

        <div>
          <Label htmlFor={`${type}-header-details`}>Header Details (JSON)</Label>
          <textarea
            id={`${type}-header-details`}
            value={data.header_details}
            onChange={(e) => handleChange('header_details', e.target.value)}
            placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
            className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {jsonErrors.header && (
            <p className="text-sm text-red-600 mt-1">{jsonErrors.header}</p>
          )}
        </div>

        {onTestConnection && (
          <Button
            onClick={onTestConnection}
            disabled={isTestingConnection || !data.health_url}
            className="w-full"
          >
            {isTestingConnection ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing Connection...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>
        )}
      </div>
    </Card>
  );
}
