import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Tabs } from '../ui/tabs';

interface ServiceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: ServiceConfig) => void;
  initialConfig: ServiceConfig;
  initialInputs: Record<string, any>;
}

export interface ServiceConfig {
  requestBody: string;
  headers: Array<{ key: string; value: string }>;
  authType: 'none' | 'bearer' | 'basic' | 'oauth2' | 'api-key';
  authConfig: {
    bearerToken?: string;
    basicUsername?: string;
    basicPassword?: string;
    oauth2ClientId?: string;
    oauth2ClientSecret?: string;
    oauth2TokenUrl?: string;
    oauth2Scope?: string;
    apiKeyHeader?: string;
    apiKeyValue?: string;
  };
  tlsConfig: {
    enabled: boolean;
    verifyCertificate: boolean;
    clientCertificate?: string;
    clientKey?: string;
  };
  timeout: number;
  retryConfig: {
    enabled: boolean;
    maxRetries: number;
    retryDelay: number;
  };
}

export const ServiceConfigModal: React.FC<ServiceConfigModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialConfig,
  initialInputs,
}) => {
  const [config, setConfig] = useState<ServiceConfig>(initialConfig);
  const [draggedField, setDraggedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'request' | 'headers' | 'auth' | 'tls' | 'advanced'>('request');

  useEffect(() => {
    if (isOpen) {
      setConfig(initialConfig);
    }
  }, [isOpen, initialConfig]);

  if (!isOpen) return null;

  const getFieldPaths = (obj: any, prefix = 'input'): string[] => {
    let paths: string[] = [];
    for (const key in obj) {
      const newPath = `${prefix}.${key}`;
      paths.push(newPath);
      if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
        paths = paths.concat(getFieldPaths(obj[key], newPath));
      }
    }
    return paths;
  };

  const fieldPaths = getFieldPaths(initialInputs);

  const handleDragStart = (field: string) => {
    setDraggedField(field);
  };

  const handleDragEnd = () => {
    setDraggedField(null);
  };

  const handleDrop = (e: React.DragEvent, fieldName: 'requestBody' | string) => {
    e.preventDefault();
    if (draggedField) {
      const cursorPosition = (e.target as HTMLTextAreaElement).selectionStart || 0;
      const currentValue = fieldName === 'requestBody' ? config.requestBody : '';
      const textBefore = currentValue.substring(0, cursorPosition);
      const textAfter = currentValue.substring(cursorPosition);
      const newText = `${textBefore}{${draggedField}}${textAfter}`;

      if (fieldName === 'requestBody') {
        setConfig({ ...config, requestBody: newText });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const addHeader = () => {
    setConfig({
      ...config,
      headers: [...config.headers, { key: '', value: '' }],
    });
  };

  const removeHeader = (index: number) => {
    setConfig({
      ...config,
      headers: config.headers.filter((_, i) => i !== index),
    });
  };

  const updateHeader = (index: number, field: 'key' | 'value', value: string) => {
    const newHeaders = [...config.headers];
    newHeaders[index][field] = value;
    setConfig({ ...config, headers: newHeaders });
  };

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[9999]">
      <div className="bg-white w-full h-full flex flex-col">
        <div className="bg-[#D71E28] text-white px-8 py-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Configure Service Request</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#BB1A21] rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/4 border-r border-gray-200 p-6 overflow-y-auto bg-gray-50">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Available Fields</h3>
            <p className="text-sm text-gray-600 mb-6">Drag fields to the inputs on the right</p>
            <div className="space-y-3">
              {fieldPaths.map((field) => (
                <div
                  key={field}
                  draggable
                  onDragStart={() => handleDragStart(field)}
                  onDragEnd={handleDragEnd}
                  className="bg-white border-2 border-gray-300 rounded-lg px-4 py-3 text-sm font-mono cursor-move hover:bg-blue-50 hover:border-blue-500 transition-all shadow-md hover:shadow-lg"
                >
                  {field}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              {(['request', 'headers', 'auth', 'tls', 'advanced'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 font-semibold text-sm capitalize transition-colors ${
                    activeTab === tab
                      ? 'text-[#D71E28] border-b-2 border-[#D71E28]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'request' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Request Body</h3>
                <p className="text-sm text-gray-600">
                  Drop fields here or type manually. Use single braces {'{'} and {'}'} to wrap field references.
                </p>
                <textarea
                  value={config.requestBody}
                  onChange={(e) => setConfig({ ...config, requestBody: e.target.value })}
                  onDrop={(e) => handleDrop(e, 'requestBody')}
                  onDragOver={handleDragOver}
                  className="w-full h-96 px-6 py-4 text-base font-mono border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D71E28] focus:border-[#D71E28] bg-white resize-none"
                  placeholder='{\n  "key": "{input.field.name}",\n  "value": "static value"\n}'
                />
              </div>
            )}

            {activeTab === 'headers' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-800">HTTP Headers</h3>
                  <Button
                    onClick={addHeader}
                    className="bg-[#10b981] hover:bg-[#059669] text-white"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Header
                  </Button>
                </div>
                <div className="space-y-3">
                  {config.headers.map((header, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <input
                        type="text"
                        placeholder="Header Name"
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28]"
                      />
                      <input
                        type="text"
                        placeholder="Header Value"
                        value={header.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28]"
                      />
                      <button
                        onClick={() => removeHeader(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {config.headers.length === 0 && (
                    <p className="text-sm text-gray-500 italic">No headers added yet</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'auth' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Authentication</h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Auth Type</label>
                  <select
                    value={config.authType}
                    onChange={(e) => setConfig({ ...config, authType: e.target.value as any })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28]"
                  >
                    <option value="none">None</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Auth</option>
                    <option value="oauth2">OAuth 2.0</option>
                    <option value="api-key">API Key</option>
                  </select>
                </div>

                {config.authType === 'bearer' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Bearer Token</label>
                    <input
                      type="password"
                      placeholder="Enter bearer token"
                      value={config.authConfig.bearerToken || ''}
                      onChange={(e) => setConfig({
                        ...config,
                        authConfig: { ...config.authConfig, bearerToken: e.target.value }
                      })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28]"
                    />
                  </div>
                )}

                {config.authType === 'basic' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                      <input
                        type="text"
                        placeholder="Enter username"
                        value={config.authConfig.basicUsername || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          authConfig: { ...config.authConfig, basicUsername: e.target.value }
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                      <input
                        type="password"
                        placeholder="Enter password"
                        value={config.authConfig.basicPassword || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          authConfig: { ...config.authConfig, basicPassword: e.target.value }
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28]"
                      />
                    </div>
                  </>
                )}

                {config.authType === 'oauth2' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Client ID</label>
                      <input
                        type="text"
                        placeholder="Enter client ID"
                        value={config.authConfig.oauth2ClientId || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          authConfig: { ...config.authConfig, oauth2ClientId: e.target.value }
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Client Secret</label>
                      <input
                        type="password"
                        placeholder="Enter client secret"
                        value={config.authConfig.oauth2ClientSecret || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          authConfig: { ...config.authConfig, oauth2ClientSecret: e.target.value }
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Token URL</label>
                      <input
                        type="text"
                        placeholder="https://oauth.example.com/token"
                        value={config.authConfig.oauth2TokenUrl || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          authConfig: { ...config.authConfig, oauth2TokenUrl: e.target.value }
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Scope (optional)</label>
                      <input
                        type="text"
                        placeholder="read write"
                        value={config.authConfig.oauth2Scope || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          authConfig: { ...config.authConfig, oauth2Scope: e.target.value }
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28]"
                      />
                    </div>
                  </>
                )}

                {config.authType === 'api-key' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Header Name</label>
                      <input
                        type="text"
                        placeholder="X-API-Key"
                        value={config.authConfig.apiKeyHeader || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          authConfig: { ...config.authConfig, apiKeyHeader: e.target.value }
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">API Key</label>
                      <input
                        type="password"
                        placeholder="Enter API key"
                        value={config.authConfig.apiKeyValue || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          authConfig: { ...config.authConfig, apiKeyValue: e.target.value }
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28]"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'tls' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">TLS/SSL Configuration</h3>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="tlsEnabled"
                    checked={config.tlsConfig.enabled}
                    onChange={(e) => setConfig({
                      ...config,
                      tlsConfig: { ...config.tlsConfig, enabled: e.target.checked }
                    })}
                    className="w-4 h-4 text-[#D71E28] rounded focus:ring-[#D71E28]"
                  />
                  <label htmlFor="tlsEnabled" className="text-sm font-semibold text-gray-700">
                    Enable TLS/SSL
                  </label>
                </div>

                {config.tlsConfig.enabled && (
                  <>
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id="verifyCert"
                        checked={config.tlsConfig.verifyCertificate}
                        onChange={(e) => setConfig({
                          ...config,
                          tlsConfig: { ...config.tlsConfig, verifyCertificate: e.target.checked }
                        })}
                        className="w-4 h-4 text-[#D71E28] rounded focus:ring-[#D71E28]"
                      />
                      <label htmlFor="verifyCert" className="text-sm font-semibold text-gray-700">
                        Verify Server Certificate
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Client Certificate (PEM format)
                      </label>
                      <textarea
                        placeholder="-----BEGIN CERTIFICATE-----&#10;...&#10;-----END CERTIFICATE-----"
                        value={config.tlsConfig.clientCertificate || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          tlsConfig: { ...config.tlsConfig, clientCertificate: e.target.value }
                        })}
                        className="w-full h-32 px-3 py-2 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28] resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Client Private Key (PEM format)
                      </label>
                      <textarea
                        placeholder="-----BEGIN PRIVATE KEY-----&#10;...&#10;-----END PRIVATE KEY-----"
                        value={config.tlsConfig.clientKey || ''}
                        onChange={(e) => setConfig({
                          ...config,
                          tlsConfig: { ...config.tlsConfig, clientKey: e.target.value }
                        })}
                        className="w-full h-32 px-3 py-2 text-xs font-mono border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28] resize-none"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-800">Advanced Settings</h3>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Timeout (milliseconds)
                  </label>
                  <input
                    type="number"
                    value={config.timeout}
                    onChange={(e) => setConfig({ ...config, timeout: parseInt(e.target.value) || 30000 })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28]"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="retryEnabled"
                    checked={config.retryConfig.enabled}
                    onChange={(e) => setConfig({
                      ...config,
                      retryConfig: { ...config.retryConfig, enabled: e.target.checked }
                    })}
                    className="w-4 h-4 text-[#D71E28] rounded focus:ring-[#D71E28]"
                  />
                  <label htmlFor="retryEnabled" className="text-sm font-semibold text-gray-700">
                    Enable Retry on Failure
                  </label>
                </div>

                {config.retryConfig.enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Max Retries
                      </label>
                      <input
                        type="number"
                        value={config.retryConfig.maxRetries}
                        onChange={(e) => setConfig({
                          ...config,
                          retryConfig: { ...config.retryConfig, maxRetries: parseInt(e.target.value) || 3 }
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Retry Delay (milliseconds)
                      </label>
                      <input
                        type="number"
                        value={config.retryConfig.retryDelay}
                        onChange={(e) => setConfig({
                          ...config,
                          retryConfig: { ...config.retryConfig, retryDelay: parseInt(e.target.value) || 1000 }
                        })}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#D71E28]"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-8 py-6 flex justify-end gap-4">
          <Button variant="outline" onClick={onClose} className="px-6 py-3 text-base">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-[#D71E28] hover:bg-[#BB1A21] text-white px-8 py-3 text-base"
          >
            Save Configuration
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
