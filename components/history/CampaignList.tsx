'use client';

import { Campaign } from '@/types';
import Table from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDate, formatDateTime, calculateDuration } from '@/lib/utils';
import { Download, Eye } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CampaignListProps {
  campaigns: Campaign[];
  onViewDetail: (campaign: Campaign) => void;
  onDownload: (campaign: Campaign) => void;
}

export default function CampaignList({ campaigns, onViewDetail, onDownload }: CampaignListProps) {
  const columns = [
    {
      key: 'keyword',
      header: 'Campaign',
      render: (campaign: Campaign) => (
        <div>
          <p className="font-medium text-slate-900">{campaign.keyword}</p>
          <p className="text-xs text-slate-500">{formatDate(campaign.created_at)}</p>
        </div>
      ),
    },
    {
      key: 'region',
      header: 'Wilayah',
    },
    {
      key: 'target',
      header: 'Target',
      render: (campaign: Campaign) => (
        <span className="text-slate-600">{campaign.target_leads} leads</span>
      ),
    },
    {
      key: 'valid',
      header: 'Valid',
      render: (campaign: Campaign) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full"
              style={{
                width: `${(campaign.valid_count / campaign.target_leads) * 100}%`,
              }}
            />
          </div>
          <span className="text-sm font-medium text-green-600">
            {campaign.valid_count}/{campaign.target_leads}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (campaign: Campaign) => <StatusBadge status={campaign.status} />,
    },
    {
      key: 'actions',
      header: '',
      className: 'w-24',
      render: (campaign: Campaign) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetail(campaign);
            }}
            className="gap-1"
          >
            <Eye className="w-4 h-4" />
            Detail
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(campaign);
            }}
            className="gap-1"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={campaigns}
      onRowClick={onViewDetail}
      emptyMessage="Tidak ada campaign history"
    />
  );
}
