export type SignalType = 'profile_location' | 'repo_language_hint' | 'demo';

export type Precision = 'city' | 'country';

export type Footprint = {
  id: string;
  source: 'github';
  username: string;
  signal_type: SignalType;
  location: {
    label: string;
    lat: number;
    lng: number;
    precision: Precision;
  };
  confidence: number;
  confidence_breakdown: Record<string, number>;
  explanation: string;
  url: string;
  created_at: string;
};

export type GitHubProfile = {
  login: string;
  html_url: string;
  location: string | null;
  created_at: string;
};

export type GitHubRepo = {
  id: number;
  name: string;
  html_url: string;
  language: string | null;
  updated_at: string;
};
