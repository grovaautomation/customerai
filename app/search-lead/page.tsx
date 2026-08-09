'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import CampaignForm from '@/components/search-lead/CampaignForm';
import ActiveCampaign from '@/components/search-lead/ActiveCampaign';
import LeadsTable from '@/components/search-lead/LeadsTable';
import Card from '@/components/ui/Card';
import { activeCampaign, leads } from '@/lib/dummy-data';

export default function SearchLeadPage() {
  const [campaign, setCampaign] = useState(activeCampaign);
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  const campaignLeads = campaign
    ? leads.filter((lead) => lead.campaign_id === campaign.id)
    : [];

  const handleSubmit = async (data: { keyword: string; region: string; target: number }) => {
    setLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    console.log('Creating campaign:', data);
    setLoading(false);
  };

  const handleCancel = async () => {
    setCancelLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setCampaign(null);
    setCancelLoading(false);
  };

  return (
    <div>
      <Header
        title="Search Lead"
        description="Cari dan temukan lead bisnis dengan validasi WhatsApp"
      />

      {/* Campaign Form */}
      <CampaignForm onSubmit={handleSubmit} loading={loading} />

      {/* Active Campaign */}
      {campaign && (
        <ActiveCampaign
          campaign={campaign}
          onCancel={handleCancel}
          onCancelLoading={cancelLoading}
        />
      )}

      {/* Empty State */}
      {!campaign && (
        <Card className="mb-6">
          <div className="text-center py-8">
            <p className="text-slate-500">
              Tidak ada campaign yang sedang berjalan. Buat campaign baru di atas.
            </p>
          </div>
        </Card>
      )}

      {/* Live Results */}
      {campaign && campaignLeads.length > 0 && (
        <Card>
          <LeadsTable leads={campaignLeads} />
        </Card>
      )}
    </div>
  );
}
