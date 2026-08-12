import { db } from '../db';
import { apiConfigs } from '../db/schema';
import { eq } from 'drizzle-orm';

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

interface DiscoveryResult {
  candidates: LeadCandidate[];
  provider: string;
}

/**
 * Get all enabled API providers
 */
async function getEnabledProviders(): Promise<Array<{ provider: string; apiKey: string }>> {
  const configs = await db.select().from(apiConfigs).where(eq(apiConfigs.isActive, true));
  return configs
    .filter(c => c.apiKey)
    .map(c => ({ provider: c.provider, apiKey: c.apiKey! }));
}

/**
 * Discover leads using SERP API (Google Search)
 */
async function discoverFromSerpApi(
  keyword: string,
  region: string,
  apiKey: string,
  targetCount: number = 50
): Promise<LeadCandidate[]> {
  const candidates: LeadCandidate[] = [];
  
  try {
    // Search query: business keyword + location
    const query = encodeURIComponent(`${keyword} ${region}`);
    const apiUrl = `https://serpapi.com/search.json?q=${query}&api_key=${apiKey}&num=${targetCount}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      console.error(`SERP API error: ${response.status}`);
      return candidates;
    }
    
    const data = await response.json();
    const results = data.organic_results || [];
    
    for (const result of results) {
      // Extract phone if available in snippet
      const phoneRegex = /(\+?62|08)[0-9]{8,12}/g;
      const snippet = result.snippet || '';
      const phones = snippet.match(phoneRegex) || [];
      
      // Also try to get phone from "People also search for" or similar
      const phone = phones[0] || '';
      
      candidates.push({
        businessName: result.title || keyword,
        phone: phone,
        address: result.snippet || '',
        region: region,
        category: keyword,
        website: result.link || '',
        source: 'serpapi',
        sourceReference: result.link || '',
      });
    }
    
    console.log(`SERP API: Found ${candidates.length} candidates`);
  } catch (error) {
    console.error('SERP API error:', error);
  }
  
  return candidates;
}

/**
 * Discover leads using Apify (Google Places scraping)
 */
async function discoverFromApify(
  keyword: string,
  region: string,
  apiKey: string,
  targetCount: number = 50
): Promise<LeadCandidate[]> {
  const candidates: LeadCandidate[] = [];
  
  try {
    // Apify Google Places Scraper API
    const apiUrl = `https://api.apify.com/v2/acts/apify~google-places-scraper/run-sync-get-dataset-items`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        searchString: `${keyword} ${region}`,
        maxCrawledPlaces: targetCount,
      }),
    });
    
    if (!response.ok) {
      console.error(`Apify API error: ${response.status}`);
      return candidates;
    }
    
    const data = await response.json();
    const results = Array.isArray(data) ? data : data.dataset || [];
    
    for (const result of results) {
      candidates.push({
        businessName: result.name || keyword,
        phone: result.phoneNumber || result.phone || '',
        address: result.address || result.location?.address || '',
        region: region,
        category: keyword,
        website: result.website || '',
        email: result.emails?.[0] || '',
        instagram: result.instagramUrl || '',
        source: 'apify',
        sourceReference: result.placeId || result.url || '',
      });
    }
    
    console.log(`Apify: Found ${candidates.length} candidates`);
  } catch (error) {
    console.error('Apify error:', error);
  }
  
  return candidates;
}

/**
 * Discover leads using Foursquare Places API
 */
async function discoverFromFoursquare(
  keyword: string,
  region: string,
  apiKey: string,
  targetCount: number = 50
): Promise<LeadCandidate[]> {
  const candidates: LeadCandidate[] = [];
  
  try {
    // Foursquare Places API v3
    const query = encodeURIComponent(`${keyword} ${region}`);
    const apiUrl = `https://api.foursquare.com/v3/places/search?query=${query}&near=${encodeURIComponent(region)}&limit=${targetCount}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json',
        'Authorization': apiKey,
      },
    });
    
    if (!response.ok) {
      console.error(`Foursquare API error: ${response.status}`);
      return candidates;
    }
    
    const data = await response.json();
    const results = data.results || [];
    
    for (const result of results) {
      const contact = result.contact || {};
      
      candidates.push({
        businessName: result.name || keyword,
        phone: contact.phoneString || contact.formattedPhone || '',
        address: result.location?.formatted_address || result.location?.address || '',
        region: region,
        category: keyword,
        website: result.website || '',
        email: contact.email || '',
        instagram: contact.instagram || '',
        source: 'foursquare',
        sourceReference: result.fsq_id || '',
      });
    }
    
    console.log(`Foursquare: Found ${candidates.length} candidates`);
  } catch (error) {
    console.error('Foursquare error:', error);
  }
  
  return candidates;
}

/**
 * Main discovery function - uses all enabled APIs
 */
export async function discoverLeads(
  keyword: string,
  region: string,
  targetCount: number = 100
): Promise<LeadCandidate[]> {
  const allCandidates: LeadCandidate[] = [];
  const seenPhones = new Set<string>();
  
  // Get enabled providers
  const providers = await getEnabledProviders();
  
  if (providers.length === 0) {
    console.log('No enabled API providers found!');
    return allCandidates;
  }
  
  console.log(`Discovering leads using ${providers.length} enabled provider(s): ${providers.map(p => p.provider).join(', ')}`);
  
  // Discover from each provider
  for (const { provider, apiKey } of providers) {
    try {
      let candidates: LeadCandidate[] = [];
      
      switch (provider) {
        case 'serpapi':
          candidates = await discoverFromSerpApi(keyword, region, apiKey, targetCount);
          break;
        case 'apify':
          candidates = await discoverFromApify(keyword, region, apiKey, targetCount);
          break;
        case 'foursquare':
          candidates = await discoverFromFoursquare(keyword, region, apiKey, targetCount);
          break;
        default:
          console.log(`Unknown provider: ${provider}`);
      }
      
      // Deduplicate by phone number
      for (const candidate of candidates) {
        const normalizedPhone = normalizePhone(candidate.phone);
        if (normalizedPhone && !seenPhones.has(normalizedPhone)) {
          seenPhones.add(normalizedPhone);
          allCandidates.push(candidate);
        }
      }
    } catch (error) {
      console.error(`Error from ${provider}:`, error);
    }
  }
  
  console.log(`Total unique candidates: ${allCandidates.length}`);
  return allCandidates;
}

/**
 * Normalize phone number for comparison
 */
function normalizePhone(phone: string): string {
  if (!phone) return '';
  // Remove spaces, dashes, parentheses
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  // Ensure starts with 62 or 08
  if (normalized.startsWith('0')) {
    normalized = '62' + normalized.substring(1);
  }
  return normalized;
}

export const leadDiscovery = {
  discoverLeads,
  getEnabledProviders,
};
