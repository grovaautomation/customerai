'use client';

import { Connector } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { formatDateTime } from '@/lib/utils';
import { RefreshCw, Plug, Unplug, Wifi, WifiOff, Phone } from 'lucide-react';

interface ConnectorStatusProps {
  connector: Connector;
  onRefresh: () => void;
  onConnect: () => void;
  onDisconnect: () => void;
  loading?: boolean;
}

export default function ConnectorStatus({
  connector,
  onRefresh,
  onConnect,
  onDisconnect,
  loading,
}: ConnectorStatusProps) {
  const isConnected = connector.status === 'CONNECTED';
  const isOnline = connector.connection_status === 'online';

  return (
    <Card className="mb-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              isConnected && isOnline
                ? 'bg-green-100'
                : 'bg-red-100'
            }`}
          >
            {isConnected && isOnline ? (
              <Wifi className="w-6 h-6 text-green-600" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-lg font-semibold text-slate-900">
                {connector.name}
              </h2>
              <Badge
                variant={isConnected && isOnline ? 'success' : 'error'}
              >
                {isConnected && isOnline ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              Instance: {connector.account_identifier}
            </p>
          </div>
        </div>
      </div>

      {/* Connection Info */}
      <div className="space-y-4">
        {connector.phone_number && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <Phone className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Nomor WhatsApp</p>
              <p className="text-sm font-medium text-slate-900">
                +{connector.phone_number}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
          <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
            <span className="text-xs text-slate-600">i</span>
          </div>
          <div>
            <p className="text-xs text-slate-500">Last Checked</p>
            <p className="text-sm font-medium text-slate-900">
              {formatDateTime(connector.last_checked_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-6 pt-6 border-t border-slate-200">
        <Button
          variant="outline"
          onClick={onRefresh}
          loading={loading}
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Status
        </Button>
        {isConnected ? (
          <Button
            variant="outline"
            onClick={onDisconnect}
            loading={loading}
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <Unplug className="w-4 h-4" />
            Disconnect
          </Button>
        ) : (
          <Button
            onClick={onConnect}
            loading={loading}
            className="gap-2"
          >
            <Plug className="w-4 h-4" />
            Connect
          </Button>
        )}
      </div>
    </Card>
  );
}
