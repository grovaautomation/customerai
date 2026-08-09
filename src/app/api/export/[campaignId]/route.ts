import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { campaigns } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';
import { exportCampaignToExcel } from '@/services/excel-export.service';

interface RouteParams {
  params: Promise<{ campaignId: string }>;
}

// GET /api/export/[campaignId] - Download Excel file
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { campaignId } = await params;

    // Check if campaign exists
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Generate Excel file
    const excelBuffer = await exportCampaignToExcel(campaignId);

    // Generate filename
    const filename = `campaign-${campaign.keyword}-${campaign.region}-${new Date().toISOString().split('T')[0]}.xlsx`;

    return new Response(excelBuffer, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting campaign:', error);
    return NextResponse.json(
      { error: 'Failed to export campaign' },
      { status: 500 }
    );
  }
}
