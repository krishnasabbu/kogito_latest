import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { mockHealthService } from '../../services/mockHealthService';
import { testGroupService } from '../../services/testGroupService';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Info, Loader2, Play } from 'lucide-react';

export function MockEndpointsHelper() {
  const [isCreating, setIsCreating] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();
  const mockEndpoints = mockHealthService.getMockEndpoints();

  const createSampleTestGroup = async () => {
    setIsCreating(true);
    try {
      const testGroup = await testGroupService.createTestGroup({
        name: 'Payment Gateway A/B Test',
        description: 'Testing new payment processing service against current production service',
        champion: {
          name: 'Production Payment Service',
          controller_url: 'https://mock-api-champion.example.com',
          health_url: 'https://mock-api-champion.example.com/health',
          request_details: {
            method: 'POST',
            timeout: 5000,
            retries: 3,
          },
          header_details: {
            'Authorization': 'Bearer prod-token-xyz',
            'Content-Type': 'application/json',
          },
        },
        challengers: [
          {
            name: 'Fast Challenger',
            controller_url: 'https://mock-api-challenger-1.example.com',
            health_url: 'https://mock-api-challenger-1.example.com/health',
            request_details: {
              method: 'POST',
              timeout: 3000,
              retries: 2,
            },
            header_details: {
              'Authorization': 'Bearer test-token-abc',
              'Content-Type': 'application/json',
            },
          },
          {
            name: 'Standard Challenger',
            controller_url: 'https://mock-api-challenger-2.example.com',
            health_url: 'https://mock-api-challenger-2.example.com/health',
            request_details: {
              method: 'POST',
              timeout: 5000,
              retries: 3,
            },
            header_details: {
              'Authorization': 'Bearer test-token-def',
              'Content-Type': 'application/json',
            },
          },
          {
            name: 'Slow Challenger',
            controller_url: 'https://mock-api-challenger-3.example.com',
            health_url: 'https://mock-api-challenger-3.example.com/health',
            request_details: {
              method: 'POST',
              timeout: 8000,
              retries: 5,
            },
            header_details: {
              'Authorization': 'Bearer test-token-ghi',
              'Content-Type': 'application/json',
            },
          },
          {
            name: 'Failing Challenger',
            controller_url: 'https://mock-api-challenger-4.example.com',
            health_url: 'https://mock-api-challenger-4.example.com/health',
            request_details: {
              method: 'POST',
              timeout: 5000,
              retries: 3,
            },
            header_details: {
              'Authorization': 'Bearer test-token-jkl',
              'Content-Type': 'application/json',
            },
          },
        ],
      });

      toast.success('Sample test group created successfully');
      navigate(`/monitor/${testGroup.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create sample test group');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="p-6 bg-blue-50 border-blue-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-blue-900">Mock Services Available</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInfo(!showInfo)}
        >
          {showInfo ? 'Hide' : 'Show'} Details
        </Button>
      </div>

      <p className="text-sm text-blue-800 mb-4">
        Use these mock service endpoints to test the Champion-Challenger system without setting up real services.
      </p>

      {showInfo && (
        <div className="space-y-3 mb-4">
          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">Available Mock Endpoints:</h4>
            <div className="space-y-2">
              {mockEndpoints.map((endpoint, index) => (
                <div key={index} className="text-sm">
                  <div className="flex items-center justify-between">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                      {endpoint.url}
                    </code>
                    <span className={`text-xs font-medium ${endpoint.shouldFail ? 'text-red-600' : 'text-green-600'}`}>
                      {endpoint.shouldFail ? 'Fails' : 'Healthy'} ({endpoint.responseTime}ms)
                    </span>
                  </div>
                  <p className="text-gray-600 mt-1">{endpoint.name}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-900 mb-2">How to Use:</h4>
            <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
              <li>Click "Create Sample Test" below to auto-populate a test group</li>
              <li>Or manually create a test using any of the mock URLs above</li>
              <li>Test connections to see different response times and health statuses</li>
              <li>The "Failing Challenger" will always return an error for testing purposes</li>
            </ol>
          </div>
        </div>
      )}

      <Button
        onClick={createSampleTestGroup}
        disabled={isCreating}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isCreating ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Creating Sample Test...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 mr-2" />
            Create Sample Test Group
          </>
        )}
      </Button>
    </Card>
  );
}
