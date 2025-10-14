import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle2, XCircle, Circle, Edit, Trash2, Activity, Loader2, Play } from 'lucide-react';
import { TestGroupWithStats } from '../../types/championChallenger';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface TestGroupCardProps {
  testGroup: TestGroupWithStats;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
}

export function TestGroupCard({ testGroup, onEdit, onDelete, onViewDetails }: TestGroupCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const getStatusIcon = () => {
    switch (testGroup.overall_health) {
      case 'healthy':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (testGroup.overall_health) {
      case 'healthy':
        return 'text-green-600';
      case 'unhealthy':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = () => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${colors[testGroup.status]}`}>
        {testGroup.status.charAt(0).toUpperCase() + testGroup.status.slice(1)}
      </span>
    );
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this test group?')) {
      setIsDeleting(true);
      await onDelete(testGroup.id);
      setIsDeleting(false);
    }
  };

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={() => onViewDetails(testGroup.id)}>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{testGroup.name}</h3>
              {getStatusBadge()}
            </div>
            {testGroup.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{testGroup.description}</p>
            )}
          </div>
          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="sm" onClick={() => onEdit(testGroup.id)}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-500 mb-1">Champion URL</p>
            <p className="text-sm font-medium text-gray-900 truncate" title={testGroup.champion_url}>
              {testGroup.champion_url || 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Challengers</p>
            <p className="text-sm font-medium text-gray-900">{testGroup.challenger_count}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Health Status</p>
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span className={`text-sm font-medium ${getStatusColor()}`}>
                {testGroup.overall_health.charAt(0).toUpperCase() + testGroup.overall_health.slice(1)}
              </span>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Created</p>
            <p className="text-sm font-medium text-gray-900">
              {format(new Date(testGroup.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        <div className="flex justify-between pt-2 border-t border-gray-200">
          <Button
            variant="default"
            size="sm"
            onClick={() => navigate(`/champion-challenge?testGroupId=${testGroup.id}`)}
          >
            <Play className="w-4 h-4 mr-2" />
            Run Test
          </Button>
          <Button variant="outline" size="sm" onClick={() => onViewDetails(testGroup.id)}>
            <Activity className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </div>
    </Card>
  );
}
