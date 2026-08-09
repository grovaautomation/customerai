'use client';

import { Lead } from '@/types';
import Table from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import { formatPhoneNumber } from '@/lib/utils';
import { Phone, MapPin, Globe, Mail, Image } from 'lucide-react';

interface LeadsTableProps {
  leads: Lead[];
  maxDisplay?: number;
}

export default function LeadsTable({ leads, maxDisplay = 10 }: LeadsTableProps) {
  const displayLeads = leads.slice(0, maxDisplay);

  const columns = [
    {
      key: 'business_name',
      header: 'Nama Bisnis',
      render: (lead: Lead) => (
        <div>
          <p className="font-medium text-slate-900">{lead.business_name}</p>
          {lead.category && (
            <p className="text-xs text-slate-500">{lead.category}</p>
          )}
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'WhatsApp',
      render: (lead: Lead) => (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-slate-400" />
          <span className="font-mono text-sm">{formatPhoneNumber(lead.phone)}</span>
        </div>
      ),
    },
    {
      key: 'validation_status',
      header: 'Status',
      render: (lead: Lead) => (
        <Badge
          variant={lead.validation_status === 'VALID' ? 'success' : lead.validation_status === 'INVALID' ? 'error' : 'warning'}
        >
          {lead.validation_status === 'VALID' ? '✓ Valid' : lead.validation_status === 'INVALID' ? '✗ Invalid' : '⏳ Pending'}
        </Badge>
      ),
    },
    {
      key: 'region',
      header: 'Wilayah',
      render: (lead: Lead) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-slate-400" />
          <span>{lead.region}</span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Kontak',
      render: (lead: Lead) => (
        <div className="flex items-center gap-2">
          {lead.website && (
            <span title="Website">
              <Globe className="w-4 h-4 text-slate-400" />
            </span>
          )}
          {lead.email && (
            <span title="Email">
              <Mail className="w-4 h-4 text-slate-400" />
            </span>
          )}
          {lead.instagram && (
            <span title={lead.instagram}>
              <Image className="w-4 h-4 text-slate-400" />
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-slate-900">Live Results</h2>
        <p className="text-sm text-slate-500">
          Menampilkan {displayLeads.length} dari {leads.length} hasil
        </p>
      </div>
      <Table
        columns={columns}
        data={displayLeads}
        emptyMessage="Belum ada lead yang ditemukan"
      />
    </div>
  );
}
