'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import ConnectorStatus from '@/components/connector/ConnectorStatus';
import ConnectorInfo from '@/components/connector/ConnectorInfo';
import Card from '@/components/ui/Card';
import { connector as initialConnector } from '@/lib/dummy-data';

export default function ConnectorPage() {
  const [connector, setConnector] = useState(initialConnector);
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setConnector({
      ...connector,
      last_checked_at: new Date().toISOString(),
    });
    setLoading(false);
  };

  const handleConnect = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setConnector({
      ...connector,
      status: 'CONNECTED',
      connection_status: 'online',
      last_checked_at: new Date().toISOString(),
    });
    setLoading(false);
  };

  const handleDisconnect = async () => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setConnector({
      ...connector,
      status: 'DISCONNECTED',
      connection_status: 'offline',
    });
    setLoading(false);
  };

  return (
    <div>
      <Header
        title="WhatsApp Connector"
        description="Kelola koneksi WhatsApp untuk validasi nomor"
      />

      {/* Connector Status */}
      <ConnectorStatus
        connector={connector}
        onRefresh={handleRefresh}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
        loading={loading}
      />

      {/* Connector Info */}
      <Card className="mb-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Connector Statistics
        </h3>
        <ConnectorInfo connector={connector} />
      </Card>

      {/* Usage Guide */}
      <Card>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Cara Kerja Connector
        </h3>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-blue-600">1</span>
            </div>
            <div>
              <p className="font-medium text-slate-900">Pencarian Kandidat</p>
              <p className="text-sm text-slate-500">
                Sistem mencari bisnis berdasarkan kata kunci dan wilayah yang ditentukan.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-blue-600">2</span>
            </div>
            <div>
              <p className="font-medium text-slate-900">Ekstraksi Nomor</p>
              <p className="text-sm text-slate-500">
                Nomor telepon diekstrak dari data bisnis yang ditemukan.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-blue-600">3</span>
            </div>
            <div>
              <p className="font-medium text-slate-900">Validasi WhatsApp</p>
              <p className="text-sm text-slate-500">
                Setiap nomor divalidasi melalui WhatsApp Connector untuk memastikan
                nomor memiliki akun WhatsApp aktif.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-semibold text-green-600">4</span>
            </div>
            <div>
              <p className="font-medium text-slate-900">Lead Valid</p>
              <p className="text-sm text-slate-500">
                Nomor dengan WhatsApp valid dihitung sebagai lead dan disimpan
                untuk campaign.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
