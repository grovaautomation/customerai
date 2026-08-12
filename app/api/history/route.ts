import { NextResponse } from 'next/server';
import { db } from '../../../src/db/index';
import { campaigns } from '../../../src/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const allCampaigns = await db
      .select()
      .from(campaigns)
      .orderBy(desc(campaigns.createdAt));

    const result = allCampaigns.map(c => ({
      id: c.id,
      keyword: c.keyword,
      region: c.region,
      target_leads: c.targetLeads,
      status: c.status,
      candidates_found: c.candidatesFound ?? 0,
      validated_count: c.validatedCount ?? 0,
      valid_count: c.validCount ?? 0,
      invalid_count: c.invalidCount ?? 0,
      duplicate_count: c.duplicateCount ?? 0,
      started_at: c.startedAt,
      completed_at: c.completedAt,
      created_at: c.createdAt,
      updated_at: c.updatedAt,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('History API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
