// Campaign Types
export type CampaignStatus =
  | 'QUEUED'
  | 'SEARCHING'
  | 'VALIDATING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

export interface Campaign {
  id: string;
  keyword: string;
  region: string;
  target_leads: number;
  status: CampaignStatus;
  candidates_found: number;
  validated_count: number;
  valid_count: number;
  invalid_count: number;
  duplicate_count: number;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Lead Types
export type ValidationStatus = 'PENDING' | 'VALID' | 'INVALID' | 'ERROR';

export interface Lead {
  id: string;
  campaign_id: string;
  business_name: string;
  phone: string;
  normalized_phone: string;
  address: string | null;
  region: string;
  category: string | null;
  website: string | null;
  email: string | null;
  instagram: string | null;
  source: string | null;
  source_reference: string | null;
  validation_status: ValidationStatus;
  validated_at: string | null;
  accepted_at: string | null;
  created_at: string;
}

// Connector Types
export type ConnectorStatus = 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING' | 'ERROR';
export type ConnectionStatus = 'online' | 'offline' | 'connecting';

export interface Connector {
  id: string;
  name: string;
  status: ConnectorStatus;
  connection_status: ConnectionStatus;
  account_identifier: string | null;
  phone_number: string | null;
  last_checked_at: string;
  validations_today: number;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface CampaignProgress {
  campaign_id: string;
  status: CampaignStatus;
  valid_leads: number;
  target_leads: number;
  percentage: number;
  candidates_found: number;
  validated_count: number;
  valid_count: number;
  invalid_count: number;
  duplicate_count: number;
  started_at: string;
  duration_seconds: number;
}

export interface CreateCampaignRequest {
  keyword: string;
  region: string;
  target_leads: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
