import { db } from '../db';
import {
  campaigns,
  leads,
  campaignLeads,
  validationLogs,
} from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { whatsappConnector } from './whatsapp-connector.service';
import { leadDiscovery } from './lead-discovery.service';
import type { Campaign, NewLead } from '../db/schema';

interface LeadCandidate {
  businessName: string;
  phone: string;
  address?: string;
  region?: string;
  category?: string;
  website?: string;
  email?: string;
  instagram?: string;
  source: string;
  sourceReference?: string;
}

class CampaignService {
  /**
   * Get next queued campaign
   */
  async getNextQueuedCampaign() {
    return db.query.campaigns.findFirst({
      where: eq(campaigns.status, 'QUEUED'),
    });
  }

  /**
   * Update campaign status
   */
  async updateCampaignStatus(campaignId: string, status: string) {
    const updates: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === 'DISCOVERING' || status === 'VERIFYING') {
      updates.startedAt = new Date();
    }

    if (status === 'COMPLETED' || status === 'FAILED' || status === 'CANCELLED') {
      updates.completedAt = new Date();
    }

    await db
      .update(campaigns)
      .set(updates)
      .where(eq(campaigns.id, campaignId));
  }

  /**
   * Update campaign counters
   */
  async updateCampaignCounters(campaignId: string, counters: {
    candidatesFound?: number;
    validatedCount?: number;
    validCount?: number;
    invalidCount?: number;
    duplicateCount?: number;
  }) {
    await db
      .update(campaigns)
      .set({
        ...counters,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId));
  }

  /**
   * Increment a specific counter
   */
  async incrementCounter(campaignId: string, counter: 'candidatesFound' | 'validatedCount' | 'validCount' | 'invalidCount' | 'duplicateCount') {
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),
    });

    if (!campaign) return;

    const currentValue = campaign[counter] || 0;

    await db
      .update(campaigns)
      .set({
        [counter]: currentValue + 1,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId));
  }

  /**
   * Check if phone is duplicate in campaign
   */
  async isPhoneDuplicate(campaignId: string, phone: string): Promise<boolean> {
    const normalizedPhone = whatsappConnector.normalizePhoneNumber(phone);

    // Check in campaign_leads
    const existingLead = await db.query.campaignLeads.findFirst({
      where: eq(campaignLeads.campaignId, campaignId),
    });

    if (!existingLead) return false;

    // Get all leads for this campaign
    const campaignLeadsData = await db.query.campaignLeads.findMany({
      where: eq(campaignLeads.campaignId, campaignId),
    });

    const leadIds = campaignLeadsData.map((cl) => cl.leadId);

    if (leadIds.length === 0) return false;

    // Check if any lead has this phone
    const leadsWithPhone = await db.query.leads.findMany({
      where: (leads, { inArray, or, eq }) =>
        inArray(leads.id, leadIds),
    });

    return leadsWithPhone.some(
      (l) =>
        l.normalizedPhone === normalizedPhone ||
        whatsappConnector.normalizePhoneNumber(l.phone || '') === normalizedPhone
    );
  }

  /**
   * Create or find lead
   */
  async createOrFindLead(candidate: LeadCandidate): Promise<string> {
    const normalizedPhone = whatsappConnector.normalizePhoneNumber(candidate.phone);

    // Check if lead with same phone exists
    const existingLead = await db.query.leads.findFirst({
      where: eq(leads.normalizedPhone, normalizedPhone),
    });

    if (existingLead) {
      // Update if new data is available
      await db
        .update(leads)
        .set({
          businessName: candidate.businessName || existingLead.businessName,
          phone: candidate.phone || existingLead.phone,
          address: candidate.address || existingLead.address,
          region: candidate.region || existingLead.region,
          category: candidate.category || existingLead.category,
          website: candidate.website || existingLead.website,
          email: candidate.email || existingLead.email,
          instagram: candidate.instagram || existingLead.instagram,
          updatedAt: new Date(),
        })
        .where(eq(leads.id, existingLead.id));

      return existingLead.id;
    }

    // Create new lead
    const [newLead] = await db
      .insert(leads)
      .values({
        businessName: candidate.businessName,
        phone: candidate.phone,
        normalizedPhone,
        address: candidate.address,
        region: candidate.region,
        category: candidate.category,
        website: candidate.website,
        email: candidate.email,
        instagram: candidate.instagram,
        source: candidate.source,
        sourceReference: candidate.sourceReference,
      })
      .returning();

    return newLead.id;
  }

  /**
   * Add lead to campaign
   */
  async addLeadToCampaign(
    campaignId: string,
    leadId: string,
    validationStatus: 'VALID' | 'INVALID' | 'ERROR'
  ) {
    const now = new Date();

    await db.insert(campaignLeads).values({
      campaignId,
      leadId,
      validationStatus,
      validationAttempts: 1,
      validatedAt: now,
      acceptedAt: validationStatus === 'VALID' ? now : null,
    });
  }

  /**
   * Validate a single phone number
   */
  async validatePhoneForCampaign(
    campaignId: string,
    phone: string,
    leadId?: string
  ): Promise<boolean> {
    const result = await whatsappConnector.validatePhone(
      phone,
      campaignId,
      leadId
    );

    return result.valid;
  }

  /**
   * Get campaign progress
   */
  async getCampaignProgress(campaignId: string) {
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),
    });

    return campaign;
  }

  /**
   * Process a campaign (main loop for worker)
   */
  async processCampaign(campaignId: string) {
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),
    });

    if (!campaign) {
      console.error('Campaign not found:', campaignId);
      return;
    }

    if (campaign.status !== 'QUEUED' && campaign.status !== 'DISCOVERING' && campaign.status !== 'VALIDATING') {
      console.log('Campaign already finished:', campaign.status);
      return;
    }

    // Update to SEARCHING
    await this.updateCampaignStatus(campaignId, 'DISCOVERING');

    // Simulate lead discovery (placeholder)
    // In production, this would call actual lead sources
    const candidates = await this.discoverCandidates(campaign);

    for (const candidate of candidates) {
      // Check if campaign is still active
      const currentCampaign = await this.getCampaignProgress(campaignId);
      if (!currentCampaign || currentCampaign.status === 'CANCELLED') {
        console.log('Campaign cancelled');
        return;
      }

      // Check if target reached
      if (currentCampaign.validCount >= currentCampaign.targetLeads) {
        await this.updateCampaignStatus(campaignId, 'COMPLETED');
        return;
      }

      // Increment candidates found
      await this.incrementCounter(campaignId, 'candidatesFound');

      // Check for duplicate
      const isDuplicate = await this.isPhoneDuplicate(
        campaignId,
        candidate.phone
      );

      if (isDuplicate) {
        await this.incrementCounter(campaignId, 'duplicateCount');
        continue;
      }

      // Update to VALIDATING
      await this.updateCampaignStatus(campaignId, 'VERIFYING');

      // Create or find lead
      const leadId = await this.createOrFindLead(candidate);

      // Increment validated count
      await this.incrementCounter(campaignId, 'validatedCount');

      // Validate phone
      const isValid = await this.validatePhoneForCampaign(
        campaignId,
        candidate.phone,
        leadId
      );

      // Add to campaign
      await this.addLeadToCampaign(
        campaignId,
        leadId,
        isValid ? 'VALID' : 'INVALID'
      );

      // Update counters
      if (isValid) {
        await this.incrementCounter(campaignId, 'validCount');
      } else {
        await this.incrementCounter(campaignId, 'invalidCount');
      }

      // Check if target reached after this validation
      const updatedCampaign = await this.getCampaignProgress(campaignId);
      if (updatedCampaign && updatedCampaign.validCount >= updatedCampaign.targetLeads) {
        await this.updateCampaignStatus(campaignId, 'COMPLETED');
        return;
      }
    }

    // If we got here, no more candidates
    const finalCampaign = await this.getCampaignProgress(campaignId);
    if (finalCampaign && finalCampaign.validCount < finalCampaign.targetLeads) {
      await this.updateCampaignStatus(campaignId, 'FAILED');
    }
  }

  /**
   * Discover candidates using enabled APIs
   */
  private async discoverCandidates(campaign: Campaign): Promise<LeadCandidate[]> {
    console.log(`Discovering candidates for: ${campaign.keyword} in ${campaign.region}`);

    // Use lead discovery service to get candidates from enabled APIs
    const candidates = await leadDiscovery.discoverLeads(
      campaign.keyword,
      campaign.region,
      campaign.targetLeads * 2 // Get more candidates than target in case some fail validation
    );

    console.log(`Found ${candidates.length} candidates`);
    return candidates;
  }
}

export const campaignService = new CampaignService();
