import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { campaigns } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/campaigns/[id]/progress - SSE stream for live progress
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { id } = await params;

    // Verify campaign exists
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, id),
    });

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    // Create SSE response
    const encoder = new TextEncoder();
    let isClosed = false;

    const stream = new ReadableStream({
      async start(controller) {
        // Send initial data
        const sendData = (data: any) => {
          if (!isClosed) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            );
          }
        };

        // Send initial campaign state
        sendData({
          type: 'init',
          campaign: {
            id: campaign.id,
            status: campaign.status,
            validCount: campaign.validCount,
            targetLeads: campaign.targetLeads,
            candidatesFound: campaign.candidatesFound,
            validatedCount: campaign.validatedCount,
            invalidCount: campaign.invalidCount,
            duplicateCount: campaign.duplicateCount,
            startedAt: campaign.startedAt,
          },
        });

        // Poll for updates
        let lastStatus = campaign.status;
        let lastValidCount = campaign.validCount;
        let pollInterval: NodeJS.Timeout;

        const checkForUpdates = async () => {
          try {
            const updated = await db.query.campaigns.findFirst({
              where: eq(campaigns.id, id),
            });

            if (!updated) {
              isClosed = true;
              controller.close();
              return;
            }

            // Send update if anything changed
            if (
              updated.status !== lastStatus ||
              updated.validCount !== lastValidCount ||
              updated.candidatesFound !== campaign.candidatesFound ||
              updated.validatedCount !== campaign.validatedCount ||
              updated.invalidCount !== campaign.invalidCount ||
              updated.duplicateCount !== campaign.duplicateCount
            ) {
              sendData({
                type: 'update',
                campaign: {
                  id: updated.id,
                  status: updated.status,
                  validCount: updated.validCount,
                  targetLeads: updated.targetLeads,
                  candidatesFound: updated.candidatesFound,
                  validatedCount: updated.validatedCount,
                  invalidCount: updated.invalidCount,
                  duplicateCount: updated.duplicateCount,
                  startedAt: updated.startedAt,
                  completedAt: updated.completedAt,
                },
              });

              lastStatus = updated.status;
              lastValidCount = updated.validCount;
            }

            // Close stream when campaign is done
            if (
              updated.status === 'COMPLETED' ||
              updated.status === 'FAILED' ||
              updated.status === 'CANCELLED'
            ) {
              isClosed = true;
              clearInterval(pollInterval);
              controller.close();
              return;
            }
          } catch (error) {
            console.error('Error polling campaign:', error);
          }
        };

        // Poll every 1 second
        pollInterval = setInterval(checkForUpdates, 1000);

        // Cleanup on close
        request.signal.addEventListener('abort', () => {
          isClosed = true;
          clearInterval(pollInterval);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Error creating SSE stream:', error);
    return NextResponse.json(
      { error: 'Failed to create progress stream' },
      { status: 500 }
    );
  }
}
