import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { campaignLeads, leads } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/campaigns/[id]/leads - Get leads for a campaign
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const validationStatus = searchParams.get('validationStatus');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    let whereClause = eq(campaignLeads.campaignId, id);

    // Get campaign leads
    const leadsList = await db.query.campaignLeads.findMany({
      where: whereClause,
      limit,
      offset,
    });

    // Get full lead details for each campaign lead
    const leadIds = leadsList.map((cl) => cl.leadId);

    const fullLeads = await db.query.leads.findMany({
      where: (leads, { inArray }) => inArray(leads.id, leadIds),
    });

    // Combine campaign leads with full lead data
    const leadsWithStatus = leadsList.map((cl) => {
      const leadData = fullLeads.find((l) => l.id === cl.leadId);
      return {
        ...leadData,
        validationStatus: cl.validationStatus,
        validatedAt: cl.validatedAt,
        acceptedAt: cl.acceptedAt,
      };
    });

    // Filter by validation status if provided
    let filteredLeads = leadsWithStatus;
    if (validationStatus) {
      filteredLeads = leadsWithStatus.filter(
        (l) => l.validationStatus === validationStatus
      );
    }

    return NextResponse.json({
      data: filteredLeads,
      total: filteredLeads.length,
    });
  } catch (error) {
    console.error('Error fetching campaign leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch campaign leads' },
      { status: 500 }
    );
  }
}
