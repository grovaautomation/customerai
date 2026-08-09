'use client';

import { Campaign } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Progress from '@/components/ui/Progress';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDateTime, calculateDuration } from '@/lib/utils';
import { Clock, Users, Phone, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface ActiveCampaignProps {
  campaign: Campaign;
  onCancel: () => void;
  onCancelLoading?: boolean;
}

export default function ActiveCampaign({ campaign, onCancel, onCancelLoading }: ActiveCampaignProps) {
  const percentage = Math.round((campaign.valid_count / campaign.target_leads) * 100);
  const duration = calculateDuration(campaign.started_at, campaign.completed_at);

  const statusText = {
    QUEUED: 'Menunggu diproses...',
    SEARCHING: 'Mencari kandidat...',
    VALIDATING: 'Memvalidasi nomor WhatsApp...',
    COMPLETED: 'Campaign selesai!',
    FAILED: 'Campaign gagal',
    CANCELLED: 'Campaign dibatalkan',
  };

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50/50">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-semibold text-slate-900">
              {campaign.keyword}
            </h2>
            <StatusBadge status={campaign.status} />
          </div>
          <p className="text-sm text-slate-500">
            {campaign.region} • Target: {campaign.target_leads} leads
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
          loading={onCancelLoading}
          className="text-red-600 border-red-200 hover:bg-red-50"
        >
          Cancel
        </Button>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-slate-700">
            {campaign.valid_count} of {campaign.target_leads} Valid Leads
          </span>
          <span className="text-sm font-semibold text-blue-600">{percentage}%</span>
        </div>
        <Progress value={campaign.valid_count} max={campaign.target_leads} size="lg" />
        <p className="text-xs text-slate-500 mt-2">
          {statusText[campaign.status] as string}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-blue-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
            <Users className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Kandidat</p>
            <p className="text-sm font-semibold text-slate-700">{campaign.candidates_found}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
            <RefreshCw className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Divalidasi</p>
            <p className="text-sm font-semibold text-slate-700">{campaign.validated_count}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">WhatsApp Valid</p>
            <p className="text-sm font-semibold text-green-600">{campaign.valid_count}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">WhatsApp Invalid</p>
            <p className="text-sm font-semibold text-red-600">{campaign.invalid_count}</p>
          </div>
        </div>
      </div>

      {/* Duration */}
      <div className="mt-4 pt-4 border-t border-blue-200 flex items-center gap-2 text-sm text-slate-500">
        <Clock className="w-4 h-4" />
        <span>Mulai: {formatDateTime(campaign.started_at)}</span>
        <span className="mx-2">•</span>
        <span>Durasi: {duration}</span>
      </div>
    </Card>
  );
}
