import { NextResponse } from 'next/server';
import { campaigns, leads } from '@/lib/dummy-data';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: campaigns,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { keyword, region, target_leads } = body;

    if (!keyword || !region || !target_leads) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newCampaign = {
      id: `camp_${Date.now()}`,
      keyword,
      region,
      target_leads: parseInt(target_leads),
      status: 'QUEUED',
      candidates_found: 0,
      validated_count: 0,
      valid_count: 0,
      invalid_count: 0,
      duplicate_count: 0,
      started_at: new Date().toISOString(),
      completed_at: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newCampaign,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
