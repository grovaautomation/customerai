'use client';

import { Connector } from '@/types';
import Card from '@/components/ui/Card';
import { CheckCircle, TrendingUp, AlertCircle } from 'lucide-react';

interface ConnectorInfoProps {
  connector: Connector;
}

export default function ConnectorInfo({ connector }: ConnectorInfoProps) {
  const healthStatus =
    connector.success_rate >= 90
      ? 'Excellent'
      : connector.success_rate >= 70
      ? 'Good'
      : 'Needs Attention';

  const healthColor =
    connector.success_rate >= 90
      ? 'text-green-600'
      : connector.success_rate >= 70
      ? 'text-blue-600'
      : 'text-amber-600';

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Health Status */}
      <Card padding="md">
        <div className="flex items-center gap-3 mb-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              connector.success_rate >= 90
                ? 'bg-green-100'
                : connector.success_rate >= 70
                ? 'bg-blue-100'
                : 'bg-amber-100'
            }`}
          >
            <CheckCircle
              className={`w-5 h-5 ${
                connector.success_rate >= 90
                  ? 'text-green-600'
                  : connector.success_rate >= 70
                  ? 'text-blue-600'
                  : 'text-amber-600'
              }`}
            />
          </div>
          <div>
            <p className="text-xs text-slate-500">Health Status</p>
            <p className={`text-lg font-semibold ${healthColor}`}>
              {healthStatus}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Based on validation success rate
        </p>
      </Card>

      {/* Validations Today */}
      <Card padding="md">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Validations Today</p>
            <p className="text-lg font-semibold text-slate-900">
              {connector.validations_today.toLocaleString()}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Total validations processed
        </p>
      </Card>

      {/* Success Rate */}
      <Card padding="md">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Success Rate</p>
            <p className="text-lg font-semibold text-green-600">
              {connector.success_rate}%
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Percentage of valid numbers
        </p>
      </Card>
    </div>
  );
}
