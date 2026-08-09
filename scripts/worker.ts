import 'dotenv/config';
import { campaignService } from '../src/services/campaign.service';

const POLL_INTERVAL_MS = parseInt(process.env.CAMPAIGN_POLL_INTERVAL_MS || '5000');

let isRunning = true;

async function processQueuedCampaigns() {
  try {
    // Get next queued campaign
    const campaign = await campaignService.getNextQueuedCampaign();

    if (!campaign) {
      return; // No queued campaigns
    }

    console.log(`Processing campaign: ${campaign.id}`);
    console.log(`Keyword: ${campaign.keyword}, Region: ${campaign.region}`);
    console.log(`Target: ${campaign.targetLeads} leads`);

    await campaignService.processCampaign(campaign.id);

    const updatedCampaign = await campaignService.getCampaignProgress(campaign.id);
    console.log(`Campaign ${campaign.id} finished with status: ${updatedCampaign?.status}`);
  } catch (error) {
    console.error('Error processing campaign:', error);
  }
}

async function workerLoop() {
  console.log('Campaign worker started');
  console.log(`Poll interval: ${POLL_INTERVAL_MS}ms`);

  while (isRunning) {
    try {
      await processQueuedCampaigns();
    } catch (error) {
      console.error('Worker loop error:', error);
    }

    // Wait before next poll
    await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
  }

  console.log('Campaign worker stopped');
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down...');
  isRunning = false;
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down...');
  isRunning = false;
});

// Start worker
workerLoop().catch(console.error);
