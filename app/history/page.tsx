'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import CampaignList from '@/components/history/CampaignList';
import CampaignDetail from '@/components/history/CampaignDetail';
import { campaigns, leads, getLeadsByCampaignId } from '@/lib/dummy-data';
import { Campaign } from '@/types';
import { Calendar, Filter, Download } from 'lucide-react';

export default function HistoryPage() {
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCampaigns = campaigns.filter(
    (campaign) =>
      campaign.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewDetail = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
  };

  const handleCloseDetail = () => {
    setSelectedCampaign(null);
  };

  const handleDownload = (campaign: Campaign) => {
    const campaignLeads = getLeadsByCampaignId(campaign.id).filter(
      (lead) => lead.validation_status === 'VALID'
    );
    console.log('Downloading:', campaignLeads.length, 'leads for campaign:', campaign.keyword);
    alert(`Download ${campaignLeads.length} leads for "${campaign.keyword}" campaign (Mock)`);
  };

  return (
    <div>
      <Header
        title="Campaign History"
        description="Riwayat campaign yang telah selesai"
      />

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Cari campaign..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Calendar className="w-4 h-4" />
              Date Range
            </Button>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Campaign List */}
      <Card>
        <CampaignList
          campaigns={filteredCampaigns}
          onViewDetail={handleViewDetail}
          onDownload={handleDownload}
        />
      </Card>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <CampaignDetail
          campaign={selectedCampaign}
          leads={getLeadsByCampaignId(selectedCampaign.id)}
          onClose={handleCloseDetail}
          onDownload={() => handleDownload(selectedCampaign)}
        />
      )}
    </div>
  );
}
