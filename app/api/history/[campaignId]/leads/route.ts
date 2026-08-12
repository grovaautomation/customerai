import { NextResponse } from 'next/server';
import { db } from '../../../../../src/db/index';
import { campaignLeads, leads } from '../../../../../src/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> }
) {
  try {
    const { campaignId } = await params;

    const campaignLeadsData = await db
      .select({
        id: leads.id,
        businessName: leads.businessName,
        phone: leads.phone,
        normalizedPhone: leads.normalizedPhone,
        address: leads.address,
        region: leads.region,
        category: leads.category,
        website: leads.website,
        email: leads.email,
        instagram: leads.instagram,
        source: leads.source,
        sourceReference: leads.sourceReference,
        validationStatus: campaignLeads.validationStatus,
        validatedAt: campaignLeads.validatedAt,
        acceptedAt: campaignLeads.acceptedAt,
        createdAt: leads.createdAt,
      })
      .from(campaignLeads)
      .innerJoin(leads, eq(campaignLeads.leadId, leads.id))
      .where(eq(campaignLeads.campaignId, campaignId));

    const result = campaignLeadsData.map(cl => ({
      id: cl.id,
      campaign_id: campaignId,
      business_name: cl.businessName,
      phone: cl.phone,
      normalized_phone: cl.normalizedPhone,
      address: cl.address,
      region: cl.region,
      category: cl.category,
      website: cl.website,
      email: cl.email,
      instagram: cl.instagram,
      source: cl.source,
      source_reference: cl.sourceReference,
      validation_status: cl.validationStatus,
      validated_at: cl.validatedAt,
      accepted_at: cl.acceptedAt,
      created_at: cl.createdAt,
    }));

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Campaign leads API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
