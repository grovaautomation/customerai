import { NextResponse } from 'next/server';
import { connector } from '@/lib/dummy-data';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: connector,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'connect') {
      // Simulate connecting
      return NextResponse.json({
        success: true,
        data: {
          ...connector,
          status: 'CONNECTED',
          connection_status: 'online',
          last_checked_at: new Date().toISOString(),
        },
      });
    }

    if (action === 'disconnect') {
      return NextResponse.json({
        success: true,
        data: {
          ...connector,
          status: 'DISCONNECTED',
          connection_status: 'offline',
        },
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action' },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
