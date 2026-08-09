import { NextResponse } from 'next/server';
import { campaigns, leads } from '@/lib/dummy-data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const campaign = campaigns.find((c) => c.id === id);

  if (!campaign) {
    return NextResponse.json(
      { success: false, error: 'Campaign not found' },
      { status: 404 }
    );
  }

  const campaignLeads = leads.filter((lead) => lead.campaign_id === id);

  return NextResponse.json({
    success: true,
    data: {
      campaign,
      leads: campaignLeads,
    },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const campaign = campaigns.find((c) => c.id === id);

  if (!campaign) {
    return NextResponse.json(
      { success: false, error: 'Campaign not found' },
      { status: 404 }
    );
  }

  // In real implementation, this would update the campaign status to CANCELLED
  return NextResponse.json({
    success: true,
    message: 'Campaign cancelled',
  });
}
