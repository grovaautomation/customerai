import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { campaigns } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

// GET /api/campaigns - List all campaigns
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let whereClause = undefined;
    if (status) {
      whereClause = eq(campaigns.status, status as any);
    }

    const campaignList = await db.query.campaigns.findMany({
      where: whereClause,
      orderBy: [desc(campaigns.createdAt)],
      limit,
      offset,
    });

    // Get total count
    const countResult = await db
      .select({ count: campaigns.id })
      .from(campaigns)
      .where(whereClause);

    return NextResponse.json({
      data: campaignList,
      total: countResult.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

// POST /api/campaigns - Create a new campaign
export async function POST(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json();
    const { keyword, region, targetLeads } = body;

    // Validation
    if (!keyword || typeof keyword !== 'string' || keyword.trim() === '') {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    if (!region || typeof region !== 'string' || region.trim() === '') {
      return NextResponse.json(
        { error: 'Region is required' },
        { status: 400 }
      );
    }

    if (!targetLeads || typeof targetLeads !== 'number' || targetLeads < 1) {
      return NextResponse.json(
        { error: 'Target leads must be at least 1' },
        { status: 400 }
      );
    }

    // Create campaign
    const [newCampaign] = await db
      .insert(campaigns)
      .values({
        keyword: keyword.trim(),
        region: region.trim(),
        targetLeads: targetLeads,
        status: 'QUEUED',
        candidatesFound: 0,
        validatedCount: 0,
        validCount: 0,
        invalidCount: 0,
        duplicateCount: 0,
      })
      .returning();

    return NextResponse.json(newCampaign, { status: 201 });
  } catch (error) {
    console.error('Error creating campaign:', error);
    return NextResponse.json(
      { error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}
