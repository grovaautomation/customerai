'use client';

import { Campaign, Lead } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Table from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/Badge';
import { formatDateTime, formatPhoneNumber, calculateDuration } from '@/lib/utils';
import { X, Download, CheckCircle, XCircle, Users, Clock } from 'lucide-react';

interface CampaignDetailProps {
  campaign: Campaign;
  leads: Lead[];
  onClose: () => void;
  onDownload: () => void;
}

export default function CampaignDetail({ campaign, leads, onClose, onDownload }: CampaignDetailProps) {
  const validLeads = leads.filter((lead) => lead.validation_status === 'VALID');
  const duration = calculateDuration(campaign.started_at, campaign.completed_at);

  const columns = [
    {
      key: 'business_name',
      header: 'Nama Bisnis',
      render: (lead: Lead) => (
        <div>
          <p className="font-medium text-slate-900">{lead.business_name}</p>
          {lead.address && (
            <p className="text-xs text-slate-500">{lead.address}</p>
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'WhatsApp',
      render: (lead: Lead) => (
        <span className="font-mono text-sm">{formatPhoneNumber(lead.phone)}</span>
      ),
    },
    {
      key: 'region',
      header: 'Wilayah',
    },
    {
      key: 'category',
      header: 'Kategori',
    },
    {
      key: 'website',
      header: 'Website',
      render: (lead: Lead) =>
        lead.website ? (
          <a
            href={lead.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            Link
          </a>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
    {
      key: 'instagram',
      header: 'Instagram',
      render: (lead: Lead) =>
        lead.instagram ? (
          <span className="text-slate-600">{lead.instagram}</span>
        ) : (
          <span className="text-slate-400">-</span>
        ),
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              Campaign Detail
            </h2>
            <p className="text-sm text-slate-500">
              {campaign.keyword} • {campaign.region}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card padding="sm">
              <p className="text-xs text-slate-500 mb-1">Valid Leads</p>
              <p className="text-2xl font-bold text-green-600">{campaign.valid_count}</p>
              <p className="text-xs text-slate-500">of {campaign.target_leads} target</p>
            </Card>
            <Card padding="sm">
              <p className="text-xs text-slate-500 mb-1">Candidates Found</p>
              <p className="text-2xl font-bold text-blue-600">{campaign.candidates_found}</p>
            </Card>
            <Card padding="sm">
              <p className="text-xs text-slate-500 mb-1">Invalid / Duplicate</p>
              <p className="text-2xl font-bold text-slate-600">
                {campaign.invalid_count + campaign.duplicate_count}
              </p>
            </Card>
            <Card padding="sm">
              <p className="text-xs text-slate-500 mb-1">Duration</p>
              <p className="text-2xl font-bold text-slate-600">{duration}</p>
            </Card>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mb-6 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm text-slate-600">
                <span className="font-semibold">{campaign.valid_count}</span> Valid
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-slate-600">
                <span className="font-semibold">{campaign.invalid_count}</span> Invalid
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" />
              <span className="text-sm text-slate-600">
                <span className="font-semibold">{campaign.duplicate_count}</span> Duplicate
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              <span className="text-sm text-slate-600">
                Started: {formatDateTime(campaign.started_at)}
              </span>
            </div>
          </div>

          {/* Download Button */}
          <div className="mb-4">
            <Button onClick={onDownload} className="gap-2">
              <Download className="w-4 h-4" />
              Download Excel ({validLeads.length} leads)
            </Button>
          </div>

          {/* Leads Table */}
          <Table
            columns={columns}
            data={validLeads}
            emptyMessage="Tidak ada lead valid"
          />
        </div>
      </div>
    </div>
  );
}
