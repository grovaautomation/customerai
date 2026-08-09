import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { leads } from '@/db/schema';
import { desc, like, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

// GET /api/leads - List all leads with filters
export async function GET(request: NextRequest) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region');
    const category = searchParams.get('category');
    const keyword = searchParams.get('keyword');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where conditions
    const conditions = [];

    if (region) {
      conditions.push(like(leads.region, `%${region}%`));
    }

    if (category) {
      conditions.push(like(leads.category, `%${category}%`));
    }

    if (keyword) {
      conditions.push(like(leads.businessName, `%${keyword}%`));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const leadList = await db.query.leads.findMany({
      where: whereClause,
      orderBy: [desc(leads.createdAt)],
      limit,
      offset,
    });

    return NextResponse.json({
      data: leadList,
      total: leadList.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
