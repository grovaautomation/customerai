import { NextResponse } from 'next/server';
import { db } from '@/db';
import { connectors } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '@/lib/auth';

// GET /api/connectors - Get WhatsApp connector status
export async function GET() {
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Get all connectors or create default one
    let connectorList = await db.query.connectors.findMany();

    // If no connectors exist, create a default one
    if (connectorList.length === 0) {
      const [newConnector] = await db
        .insert(connectors)
        .values({
          name: 'Default WhatsApp Connector',
          status: 'DISCONNECTED',
        })
        .returning();

      connectorList = [newConnector];
    }

    return NextResponse.json({
      data: connectorList,
    });
  } catch (error) {
    console.error('Error fetching connectors:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connectors' },
      { status: 500 }
    );
  }
}
