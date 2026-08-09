import { NextResponse } from 'next/server';
import { campaigns } from '@/lib/dummy-data';

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

  const startTime = new Date(campaign.started_at).getTime();
  const now = campaign.completed_at
    ? new Date(campaign.completed_at).getTime()
    : Date.now();
  const durationSeconds = Math.floor((now - startTime) / 1000);

  return NextResponse.json({
    success: true,
    data: {
      campaign_id: campaign.id,
      status: campaign.status,
      valid_leads: campaign.valid_count,
      target_leads: campaign.target_leads,
      percentage: Math.round((campaign.valid_count / campaign.target_leads) * 100),
      candidates_found: campaign.candidates_found,
      validated_count: campaign.validated_count,
      valid_count: campaign.valid_count,
      invalid_count: campaign.invalid_count,
      duplicate_count: campaign.duplicate_count,
      started_at: campaign.started_at,
      duration_seconds: durationSeconds,
    },
  });
}
