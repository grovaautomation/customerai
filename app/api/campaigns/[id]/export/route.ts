import { NextResponse } from 'next/server';
import { leads } from '@/lib/dummy-data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const campaignLeads = leads.filter(
    (lead) => lead.campaign_id === id && lead.validation_status === 'VALID'
  );

  // In a real implementation, this would generate an Excel file
  // For now, we return a JSON response indicating the export would be created

  const exportData = campaignLeads.map((lead) => ({
    'Business Name': lead.business_name,
    'WhatsApp': lead.phone,
    'Address': lead.address || '',
    'Region': lead.region,
    'Category': lead.category || '',
    'Website': lead.website || '',
    'Email': lead.email || '',
    'Instagram': lead.instagram || '',
    'Validation Status': lead.validation_status,
  }));

  return NextResponse.json({
    success: true,
    message: `Export ready for ${campaignLeads.length} leads`,
    data: exportData,
    download_url: `/api/campaigns/${id}/export/download`,
  });
}
