export interface Link {
  id: string;
  shortCode: string;
  longUrl: string;
  clicks: number;
  createdAt: string;
  alias?: string;
  expiryDate?: string;
  password?: string;
  qrCodeUrl?: string;
  title?: string;
  description?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  isProtected?: boolean;
}

export interface ClickEvent {
  id: string;
  linkId: string;
  timestamp: string;
  country: string;
  city: string;
  device: string;
  browser: string;
  os: string;
  referrer: string;
}

export interface CustomDomain {
  id: string;
  domain: string;
  status: 'active' | 'pending' | 'error';
  createdAt: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed?: string;
}

export interface DashboardStats {
  totalClicks: number;
  activeLinks: number;
  qrCodesGenerated: number;
  customDomains: number;
}
