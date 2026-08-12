import { db } from '../db';
import { connectors, validationLogs } from '../db/schema';
import { eq } from 'drizzle-orm';

interface ValidationResult {
  valid: boolean;
  existsWhatsApp: boolean;
  message?: string;
}

interface EvolutionApiConfig {
  url: string;
  apiKey: string;
  instanceName?: string;
}

class WhatsAppConnectorService {
  private config: EvolutionApiConfig;
  private connectorUrl: string;

  constructor() {
    this.config = {
      url: process.env.EVOLUTION_API_URL || '',
      apiKey: process.env.EVOLUTION_API_KEY || '',
      instanceName: process.env.INSTANCE_NAME || 'customerai',
    };
    // Use the local connector API which proxies to Evolution API
    this.connectorUrl = process.env.WHATSAPP_CONNECTOR_URL || 'http://localhost:8083';
  }

  /**
   * Check if Evolution API is configured
   */
  isConfigured(): boolean {
    return (
      this.config.url.length > 0 &&
      this.config.url !== 'https://placeholder.evolution-api.com' &&
      this.config.apiKey.length > 0 &&
      this.config.apiKey !== 'placeholder-api-key'
    );
  }

  /**
   * Check WhatsApp number validation
   * Uses the WhatsApp connector API which proxies to Evolution API
   */
  async validatePhone(
    phoneNumber: string,
    campaignId?: string,
    leadId?: string
  ): Promise<ValidationResult> {
    const normalizedPhone = this.normalizePhoneNumber(phoneNumber);

    // If not configured, return error instead of mock data
    if (!this.isConfigured()) {
      console.log(
        'Evolution API not configured, cannot validate phone number'
      );

      // Log the attempt
      if (campaignId) {
        await db.insert(validationLogs).values({
          campaignId,
          leadId,
          phone: normalizedPhone,
          result: 'ERROR',
          error: 'Evolution API not configured',
          attempt: 1,
        });
      }

      return {
        valid: false,
        existsWhatsApp: false,
        message: 'Validation service not configured',
      };
    }

    try {
      // Call the local WhatsApp connector API which proxies to Evolution API
      const response = await fetch(
        `${this.connectorUrl}/checkNumber/${normalizedPhone}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();

      // The connector returns { exists: boolean } or similar
      const existsWhatsApp = data?.exists === true || data?.numberExists === true || data?.valid === true;

      // Log successful check
      if (campaignId) {
        await db.insert(validationLogs).values({
          campaignId,
          leadId,
          phone: normalizedPhone,
          result: existsWhatsApp ? 'VALID' : 'INVALID',
          attempt: 1,
        });
      }

      return {
        valid: existsWhatsApp,
        existsWhatsApp,
        message: existsWhatsApp ? 'Number has WhatsApp' : 'Number has no WhatsApp',
      };
    } catch (error: any) {
      console.error('WhatsApp validation error:', error);

      // Log error
      if (campaignId) {
        await db.insert(validationLogs).values({
          campaignId,
          leadId,
          phone: normalizedPhone,
          result: 'ERROR',
          error: error.message || 'Unknown error',
          attempt: 1,
        });
      }

      return {
        valid: false,
        existsWhatsApp: false,
        message: 'Connection error',
      };
    }
  }

  /**
   * Normalize phone number to WhatsApp format
   * Expected format: 6281234567890 (with country code, no + sign)
   */
  normalizePhoneNumber(phone: string): string {
    // Remove all non-digit characters
    let normalized = phone.replace(/\D/g, '');

    // If starts with 0, replace with 62 (Indonesia)
    if (normalized.startsWith('0')) {
      normalized = '62' + normalized.substring(1);
    }

    // If doesn't start with country code, assume Indonesia (62)
    if (!normalized.startsWith('62') && !normalized.startsWith('+62')) {
      normalized = '62' + normalized;
    }

    return normalized;
  }

  /**
   * Update connector status in database
   */
  async updateConnectorStatus(
    status: 'CONNECTED' | 'DISCONNECTED' | 'ERROR'
  ) {
    const connector = await db.query.connectors.findFirst();

    if (connector) {
      await db
        .update(connectors)
        .set({
          status,
          lastCheckedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(connectors.id, connector.id));
    }
  }

  /**
   * Get connector status
   */
  async getConnectorStatus() {
    const connector = await db.query.connectors.findFirst();
    return connector;
  }
}

// Singleton instance
export const whatsappConnector = new WhatsAppConnectorService();
