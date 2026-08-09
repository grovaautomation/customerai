import { NextResponse } from 'next/server';
import { leads } from '@/lib/dummy-data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const campaignLeads = leads.filter((lead) => lead.campaign_id === id);

  return NextResponse.json({
    success: true,
    data: campaignLeads,
  });
}
