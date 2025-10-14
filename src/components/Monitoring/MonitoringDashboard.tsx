import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { testGroupService } from '../../services/testGroupService';
import { TestGroup, ServiceConfiguration, ConnectionTestResult } from '../../types/championChallenger';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, RefreshCw, CheckCircle2, XCircle, Circle, Activity } from 'lucide-react';
import { format } from 'date-fns';

export function MonitoringDashboard() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [testGroup, setTestGroup] = useState<TestGroup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, ConnectionTestResult>>({});

  useEffect(() => {
    if (testId) {
      loadTestGroup(testId);
    }
  }, [testId]);

  const loadTestGroup = async (id: string) => {
    setIsLoading(true);
    try {
      const group = await testGroupService.getTestGroup(id);
      setTestGroup(group);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load test group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAllConnections = async () => {
    if (!testId) return;

    setIsTesting(true);
    try {
      const results = await testGroupService.testAllConnections(testId);
      setTestResults(results);

      const allHealthy = Object.values(results).every((r) => r.success);
      if (allHealthy) {
        toast.success('All services are healthy');
      } else {
        toast.error('Some services are unhealthy');
      }

      await loadTestGroup(testId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to test connections');
    } finally {
      setIsTesting(false);
    }
  };

  const handleTestConnection = async (serviceId: string) => {
    if (!testId) return;

    try {
      const result = await testGroupService.testConnection(serviceId);
      setTestResults((prev) => ({ ...prev, [serviceId]: result }));

      if (result.success) {
        toast.success('Service is healthy');
      } else {
        toast.error(`Service is unhealthy: ${result.error || 'Unknown error'}`);
      }

      await loadTestGroup(testId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to test connection');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'unhealthy':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50';
      case 'unhealthy':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!testGroup) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Group Not Found</h2>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const champion = testGroup.services?.find((s) => s.type === 'champion');
  const challengers = testGroup.services?.filter((s) => s.type === 'challenger') || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate('/dashboard')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{testGroup.name}</h1>
              <p className="text-gray-600">{testGroup.description}</p>
            </div>
            <Button onClick={handleTestAllConnections} disabled={isTesting}>
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Test All Connections
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Champion Service
            </h2>
            {champion ? (
              <ServiceMonitorCard
                service={champion}
                onTest={() => handleTestConnection(champion.id)}
                testResult={testResults[champion.id]}
              />
            ) : (
              <Card className="p-6">
                <p className="text-gray-600">No champion service configured</p>
              </Card>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Challenger Services ({challengers.length})
            </h2>
            {challengers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {challengers.map((challenger) => (
                  <ServiceMonitorCard
                    key={challenger.id}
                    service={challenger}
                    onTest={() => handleTestConnection(challenger.id)}
                    testResult={testResults[challenger.id]}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-6">
                <p className="text-gray-600">No challenger services configured</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface ServiceMonitorCardProps {
  service: ServiceConfiguration;
  onTest: () => void;
  testResult?: ConnectionTestResult;
}

function ServiceMonitorCard({ service, onTest, testResult }: ServiceMonitorCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="w-6 h-6 text-green-600" />;
      case 'unhealthy':
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Circle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'border-green-500 bg-green-50';
      case 'unhealthy':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  return (
    <Card className={`p-6 border-2 ${getStatusColor(service.connection_status)}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{service.name}</h3>
            <p className="text-sm text-gray-600">{service.type.charAt(0).toUpperCase() + service.type.slice(1)}</p>
          </div>
          {getStatusIcon(service.connection_status)}
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Controller URL</p>
            <p className="text-sm font-medium text-gray-900 break-all">{service.controller_url}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Health URL</p>
            <p className="text-sm font-medium text-gray-900 break-all">{service.health_url}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <p className={`text-sm font-semibold ${
                service.connection_status === 'healthy' ? 'text-green-600' :
                service.connection_status === 'unhealthy' ? 'text-red-600' : 'text-gray-600'
              }`}>
                {service.connection_status.charAt(0).toUpperCase() + service.connection_status.slice(1)}
              </p>
            </div>

            {service.response_time_ms && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Response Time</p>
                <p className="text-sm font-medium text-gray-900">{service.response_time_ms}ms</p>
              </div>
            )}
          </div>

          {service.last_tested && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Last Tested</p>
              <p className="text-sm font-medium text-gray-900">
                {format(new Date(service.last_tested), 'MMM d, yyyy HH:mm:ss')}
              </p>
            </div>
          )}

          {testResult?.error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded">
              <p className="text-xs font-medium text-red-800">Error: {testResult.error}</p>
            </div>
          )}
        </div>

        <Button onClick={onTest} variant="outline" className="w-full">
          <RefreshCw className="w-4 h-4 mr-2" />
          Test Connection
        </Button>
      </div>
    </Card>
  );
}
