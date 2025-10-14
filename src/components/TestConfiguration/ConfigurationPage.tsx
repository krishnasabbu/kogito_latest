import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ServiceConfigForm } from './ServiceConfigForm';
import { testGroupService } from '../../services/testGroupService';
import { CreateTestGroupRequest, ServiceConfiguration, TestGroup } from '../../types/championChallenger';
import toast from 'react-hot-toast';
import { Loader2, Plus, Save } from 'lucide-react';

interface ServiceFormData {
  name: string;
  controller_url: string;
  request_details: string;
  header_details: string;
  health_url: string;
}

const emptyServiceData: ServiceFormData = {
  name: '',
  controller_url: '',
  request_details: '{}',
  header_details: '{}',
  health_url: '',
};

export function ConfigurationPage() {
  const navigate = useNavigate();
  const { testId } = useParams<{ testId: string }>();
  const isEditMode = !!testId;

  const [testName, setTestName] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [championData, setChampionData] = useState<ServiceFormData>(emptyServiceData);
  const [challengersData, setChallengersData] = useState<ServiceFormData[]>([{ ...emptyServiceData }]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [existingTestGroup, setExistingTestGroup] = useState<TestGroup | null>(null);

  useEffect(() => {
    if (isEditMode && testId) {
      loadTestGroup(testId);
    }
  }, [isEditMode, testId]);

  const loadTestGroup = async (id: string) => {
    setIsLoading(true);
    try {
      const testGroup = await testGroupService.getTestGroup(id);
      if (testGroup) {
        setExistingTestGroup(testGroup);
        setTestName(testGroup.name);
        setTestDescription(testGroup.description);

        const services = testGroup.services || [];
        const champion = services.find((s) => s.type === 'champion');
        const challengers = services.filter((s) => s.type === 'challenger');

        if (champion) {
          setChampionData({
            name: champion.name,
            controller_url: champion.controller_url,
            request_details: JSON.stringify(champion.request_details || {}, null, 2),
            header_details: JSON.stringify(champion.header_details || {}, null, 2),
            health_url: champion.health_url,
          });
        }

        if (challengers.length > 0) {
          setChallengersData(
            challengers.map((c) => ({
              name: c.name,
              controller_url: c.controller_url,
              request_details: JSON.stringify(c.request_details || {}, null, 2),
              header_details: JSON.stringify(c.header_details || {}, null, 2),
              health_url: c.health_url,
            }))
          );
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load test group');
    } finally {
      setIsLoading(false);
    }
  };

  const addChallenger = () => {
    setChallengersData([...challengersData, { ...emptyServiceData }]);
  };

  const removeChallenger = (index: number) => {
    if (challengersData.length > 1) {
      setChallengersData(challengersData.filter((_, i) => i !== index));
    }
  };

  const updateChallenger = (index: number, data: ServiceFormData) => {
    const updated = [...challengersData];
    updated[index] = data;
    setChallengersData(updated);
  };

  const validateForm = (): boolean => {
    if (!testName.trim()) {
      toast.error('Test name is required');
      return false;
    }

    if (!championData.name.trim() || !championData.controller_url.trim() || !championData.health_url.trim()) {
      toast.error('Champion configuration is incomplete');
      return false;
    }

    for (let i = 0; i < challengersData.length; i++) {
      const challenger = challengersData[i];
      if (!challenger.name.trim() || !challenger.controller_url.trim() || !challenger.health_url.trim()) {
        toast.error(`Challenger ${i + 1} configuration is incomplete`);
        return false;
      }
    }

    try {
      JSON.parse(championData.request_details || '{}');
      JSON.parse(championData.header_details || '{}');
      challengersData.forEach((c) => {
        JSON.parse(c.request_details || '{}');
        JSON.parse(c.header_details || '{}');
      });
    } catch (err) {
      toast.error('Invalid JSON in request or header details');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    try {
      const requestData: CreateTestGroupRequest = {
        name: testName,
        description: testDescription,
        champion: {
          name: championData.name,
          controller_url: championData.controller_url,
          request_details: JSON.parse(championData.request_details || '{}'),
          header_details: JSON.parse(championData.header_details || '{}'),
          health_url: championData.health_url,
        },
        challengers: challengersData.map((c) => ({
          name: c.name,
          controller_url: c.controller_url,
          request_details: JSON.parse(c.request_details || '{}'),
          header_details: JSON.parse(c.header_details || '{}'),
          health_url: c.health_url,
        })),
      };

      if (isEditMode && testId) {
        await testGroupService.updateTestGroup(testId, {
          name: requestData.name,
          description: requestData.description,
        });

        const services = existingTestGroup?.services || [];
        const champion = services.find((s) => s.type === 'champion');
        if (champion) {
          await testGroupService.updateServiceConfiguration(champion.id, {
            name: requestData.champion.name,
            controller_url: requestData.champion.controller_url,
            request_details: requestData.champion.request_details,
            header_details: requestData.champion.header_details,
            health_url: requestData.champion.health_url,
          });
        }

        toast.success('Test group updated successfully');
      } else {
        await testGroupService.createTestGroup(requestData);
        toast.success('Test group created successfully');
      }

      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save test group');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isEditMode ? 'Edit Test Configuration' : 'Create New Test Configuration'}
          </h1>
          <p className="text-gray-600">
            Configure your champion and challenger services for A/B testing
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Test Details</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="test-name">Test Name</Label>
                <Input
                  id="test-name"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  placeholder="e.g., Payment Service A/B Test"
                />
              </div>
              <div>
                <Label htmlFor="test-description">Description</Label>
                <textarea
                  id="test-description"
                  value={testDescription}
                  onChange={(e) => setTestDescription(e.target.value)}
                  placeholder="Describe the purpose of this test..."
                  className="w-full min-h-[100px] px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <ServiceConfigForm
            type="champion"
            data={championData}
            onChange={setChampionData}
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Challengers</h2>
              <Button onClick={addChallenger} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Challenger
              </Button>
            </div>

            {challengersData.map((challenger, index) => (
              <ServiceConfigForm
                key={index}
                type="challenger"
                data={challenger}
                onChange={(data) => updateChallenger(index, data)}
                onRemove={challengersData.length > 1 ? () => removeChallenger(index) : undefined}
              />
            ))}
          </div>

          <div className="flex gap-4">
            <Button onClick={handleSave} disabled={isSaving} className="flex-1">
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
