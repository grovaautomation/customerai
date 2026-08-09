import ExcelJS from 'exceljs';
import { db } from '@/db';
import { campaignLeads, leads, campaigns } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import type { Lead, Campaign } from '@/db/schema';

interface ExportData {
  campaign: Campaign;
  validLeads: (Lead & {
    validationStatus: string;
    validatedAt: Date | null;
    acceptedAt: Date | null;
  })[];
}

export async function exportCampaignToExcel(
  campaignId: string
): Promise<Buffer> {
  // Fetch campaign
  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, campaignId),
  });

  if (!campaign) {
    throw new Error('Campaign not found');
  }

  // Fetch valid leads for this campaign
  const campaignLeadsData = await db.query.campaignLeads.findMany({
    where: and(
      eq(campaignLeads.campaignId, campaignId),
      eq(campaignLeads.validationStatus, 'VALID')
    ),
  });

  const leadIds = campaignLeadsData.map((cl) => cl.leadId);

  const validLeads = await db.query.leads.findMany({
    where: (leads, { inArray }) => inArray(leads.id, leadIds),
  });

  // Combine with validation data
  const leadsWithStatus = validLeads.map((lead) => {
    const cl = campaignLeadsData.find((c) => c.leadId === lead.id);
    return {
      ...lead,
      validationStatus: cl?.validationStatus || 'UNKNOWN',
      validatedAt: cl?.validatedAt || null,
      acceptedAt: cl?.acceptedAt || null,
    };
  });

  // Create workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Customer AI';
  workbook.created = new Date();

  // Summary Sheet
  const summarySheet = workbook.addWorksheet('Campaign Summary');
  summarySheet.columns = [
    { header: 'Campaign ID', key: 'id', width: 36 },
    { header: 'Keyword', key: 'keyword', width: 30 },
    { header: 'Region', key: 'region', width: 20 },
    { header: 'Target Leads', key: 'targetLeads', width: 15 },
    { header: 'Valid Leads', key: 'validCount', width: 15 },
    { header: 'Candidates Found', key: 'candidatesFound', width: 18 },
    { header: 'Invalid', key: 'invalidCount', width: 12 },
    { header: 'Duplicates', key: 'duplicateCount', width: 12 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Started At', key: 'startedAt', width: 25 },
    { header: 'Completed At', key: 'completedAt', width: 25 },
  ];

  summarySheet.addRow({
    id: campaign.id,
    keyword: campaign.keyword,
    region: campaign.region,
    targetLeads: campaign.targetLeads,
    validCount: campaign.validCount,
    candidatesFound: campaign.candidatesFound,
    invalidCount: campaign.invalidCount,
    duplicateCount: campaign.duplicateCount,
    status: campaign.status,
    startedAt: campaign.startedAt?.toISOString() || '-',
    completedAt: campaign.completedAt?.toISOString() || '-',
  });

  // Leads Sheet
  const leadsSheet = workbook.addWorksheet('Valid Leads');
  leadsSheet.columns = [
    { header: 'No', key: 'no', width: 5 },
    { header: 'Business Name', key: 'businessName', width: 35 },
    { header: 'WhatsApp', key: 'phone', width: 20 },
    { header: 'Address', key: 'address', width: 40 },
    { header: 'Region', key: 'region', width: 20 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Website', key: 'website', width: 30 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Instagram', key: 'instagram', width: 25 },
    { header: 'Validated At', key: 'validatedAt', width: 25 },
  ];

  // Style header row
  leadsSheet.getRow(1).font = { bold: true };
  leadsSheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };
  leadsSheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  // Add leads data
  leadsWithStatus.forEach((lead, index) => {
    leadsSheet.addRow({
      no: index + 1,
      businessName: lead.businessName || '-',
      phone: lead.phone || '-',
      address: lead.address || '-',
      region: lead.region || '-',
      category: lead.category || '-',
      website: lead.website || '-',
      email: lead.email || '-',
      instagram: lead.instagram || '-',
      validatedAt: lead.validatedAt?.toISOString() || '-',
    });
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();

  if (!buffer) {
    throw new Error('Failed to generate Excel file');
  }

  return Buffer.from(buffer);
}
