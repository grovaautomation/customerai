import { NextResponse } from 'next/server';
import { db } from '../../../src/db/index';
import { apiConfigs } from '../../../src/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const configs = await db.select().from(apiConfigs);
    return NextResponse.json({ success: true, data: configs });
  } catch (error) {
    console.error('Error fetching api configs:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { provider, api_key, is_active } = body;

    if (!provider) {
      return NextResponse.json({ success: false, error: 'Provider required' }, { status: 400 });
    }

    const existing = await db.query.apiConfigs.findFirst({
      where: eq(apiConfigs.provider, provider),
    });

    if (existing) {
      await db.update(apiConfigs)
        .set({
          apiKey: api_key ?? existing.apiKey,
          isActive: is_active ?? existing.isActive,
          updatedAt: new Date(),
        })
        .where(eq(apiConfigs.id, existing.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating api config:', error);
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 });
  }
}

// Test API key
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider, api_key } = body;

    if (!provider) {
      return NextResponse.json({ success: false, error: 'Provider required' }, { status: 400 });
    }

    let success = false;
    let error = '';

    // Test based on provider
    switch (provider) {
      case 'serpapi': {
        try {
          const res = await fetch(`https://serpapi.com/search.json?q=test&api_key=${api_key}&num=1`);
          success = res.ok;
          if (!success) {
            const data = await res.json();
            error = data.error || `HTTP ${res.status}`;
          }
        } catch (e: any) {
          error = e.message;
        }
        break;
      }
      case 'apify': {
        try {
          // Apify test - just verify key format
          const res = await fetch('https://api.apify.com/v2/user-info', {
            headers: { 'Authorization': `Bearer ${api_key}` },
          });
          success = res.ok;
          if (!success) {
            error = `HTTP ${res.status}`;
          }
        } catch (e: any) {
          error = e.message;
        }
        break;
      }
      case 'foursquare': {
        try {
          const res = await fetch('https://api.foursquare.com/v3/places/nearby?near=Jakarta', {
            headers: { 'Accept': 'application/json', 'Authorization': api_key },
          });
          success = res.ok;
          if (!success) {
            error = `HTTP ${res.status}`;
          }
        } catch (e: any) {
          error = e.message;
        }
        break;
      }
      default:
        error = 'Unknown provider';
    }

    // Update test result in database
    const existing = await db.query.apiConfigs.findFirst({
      where: eq(apiConfigs.provider, provider),
    });

    if (existing) {
      await db.update(apiConfigs)
        .set({
          testPassed: success,
          testError: error || null,
          updatedAt: new Date(),
        })
        .where(eq(apiConfigs.id, existing.id));
    }

    return NextResponse.json({ success: true, test_passed: success, test_error: error });
  } catch (error) {
    console.error('Error testing api config:', error);
    return NextResponse.json({ success: false, error: 'Failed to test' }, { status: 500 });
  }
}
