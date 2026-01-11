import cities from './geo/cities.json';
import countries from './geo/countries.json';
import type { Footprint, GitHubProfile, GitHubRepo, Precision } from './types';

const normalize = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const hashSeed = (value: string) =>
  value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

const pickConfidence = (min: number, max: number, seed: string) => {
  const span = max - min;
  const offset = hashSeed(seed) % (span + 1);
  return min + offset;
};

type LocationMatch = {
  label: string;
  lat: number;
  lng: number;
  precision: Precision;
  confidence: number;
  breakdown: Record<string, number>;
  explanation: string;
};

type CityEntry = {
  name: string;
  country: string;
  lat: number;
  lng: number;
};

type CountryEntry = {
  name: string;
  lat: number;
  lng: number;
  alt?: string[];
};

const cityEntries = cities as CityEntry[];
const countryEntries = countries as Record<string, CountryEntry>;

const countryNameMap = new Map<string, { code: string; entry: CountryEntry }>();

for (const [code, entry] of Object.entries(countryEntries)) {
  countryNameMap.set(normalize(entry.name), { code, entry });
  countryNameMap.set(code.toLowerCase(), { code, entry });
  entry.alt?.forEach((alt) => {
    countryNameMap.set(normalize(alt), { code, entry });
  });
}

export function resolveLocationFromString(input: string): LocationMatch | null {
  const normalized = normalize(input);
  if (!normalized) return null;

  const cityMatch = cityEntries.find((city) => {
    const name = normalize(city.name);
    return normalized.includes(name);
  });

  if (cityMatch) {
    const country = countryEntries[cityMatch.country];
    const label = country ? `${cityMatch.name}, ${cityMatch.country}` : cityMatch.name;
    const confidence = pickConfidence(70, 90, `${input}-${cityMatch.name}`);
    return {
      label,
      lat: cityMatch.lat,
      lng: cityMatch.lng,
      precision: 'city',
      confidence,
      breakdown: {
        city_match: confidence
      },
      explanation: `Matched city string "${cityMatch.name}" in profile location.`
    };
  }

  const countryMatch = Array.from(countryNameMap.entries()).find(([name]) =>
    normalized.includes(name)
  );

  if (countryMatch) {
    const { entry, code } = countryMatch[1];
    const confidence = pickConfidence(40, 65, `${input}-${code}`);
    return {
      label: entry.name,
      lat: entry.lat,
      lng: entry.lng,
      precision: 'country',
      confidence,
      breakdown: {
        country_match: confidence
      },
      explanation: `Matched country string "${entry.name}" in profile location.`
    };
  }

  return null;
}

export function inferFootprintsFromGithub(
  profile: GitHubProfile,
  repos: GitHubRepo[]
): Footprint[] {
  const footprints: Footprint[] = [];
  const now = new Date().toISOString();

  if (profile.location) {
    const match = resolveLocationFromString(profile.location);
    if (match) {
      footprints.push({
        id: `profile-${profile.login}`,
        source: 'github',
        username: profile.login,
        signal_type: 'profile_location',
        location: {
          label: match.label,
          lat: match.lat,
          lng: match.lng,
          precision: match.precision
        },
        confidence: match.confidence,
        confidence_breakdown: match.breakdown,
        explanation: match.explanation,
        url: profile.html_url,
        created_at: now
      });
    }
  }

  const languageSignal = repos
    .map((repo) => repo.language)
    .filter(Boolean)
    .slice(0, 3) as string[];

  if (languageSignal.length > 0) {
    const language = languageSignal[0];
    const regionHint = languageRegionHint(language);
    if (regionHint) {
      footprints.push({
        id: `lang-${profile.login}`,
        source: 'github',
        username: profile.login,
        signal_type: 'repo_language_hint',
        location: {
          label: regionHint.label,
          lat: regionHint.lat,
          lng: regionHint.lng,
          precision: 'country'
        },
        confidence: regionHint.confidence,
        confidence_breakdown: {
          repo_language_hint: regionHint.confidence
        },
        explanation: `Low-confidence regional hint based on predominant repo language (${language}).`,
        url: profile.html_url,
        created_at: now
      });
    }
  }

  return footprints;
}

function languageRegionHint(language: string) {
  const map: Record<string, { label: string; lat: number; lng: number }> = {
    Rust: { label: 'Finland', lat: 61.92, lng: 25.75 },
    Go: { label: 'United States', lat: 39.78, lng: -98.58 },
    Ruby: { label: 'Japan', lat: 36.2, lng: 138.25 },
    Swift: { label: 'United States', lat: 39.78, lng: -98.58 },
    Kotlin: { label: 'Germany', lat: 51.17, lng: 10.45 }
  };

  const hint = map[language];
  if (!hint) return null;

  return {
    ...hint,
    confidence: pickConfidence(10, 25, language)
  };
}

export function seedDemoFootprints(username: string): Footprint[] {
  const pool = [
    { name: 'Berlin', country: 'DE', lat: 52.52, lng: 13.405 },
    { name: 'Singapore', country: 'SG', lat: 1.3521, lng: 103.8198 },
    { name: 'New York', country: 'US', lat: 40.7128, lng: -74.006 },
    { name: 'Sao Paulo', country: 'BR', lat: -23.5505, lng: -46.6333 },
    { name: 'Tokyo', country: 'JP', lat: 35.6762, lng: 139.6503 },
    { name: 'London', country: 'GB', lat: 51.5074, lng: -0.1278 },
    { name: 'Sydney', country: 'AU', lat: -33.8688, lng: 151.2093 }
  ];

  const seed = hashSeed(username || 'trace');
  const selected = pool.filter((_, index) => (seed + index) % 2 === 0).slice(0, 5);
  const now = new Date().toISOString();

  return selected.map((city, index) => ({
    id: `demo-${username}-${index}`,
    source: 'github',
    username,
    signal_type: 'demo',
    location: {
      label: `${city.name}, ${city.country}`,
      lat: city.lat,
      lng: city.lng,
      precision: 'city'
    },
    confidence: pickConfidence(55, 75, `${username}-${city.name}`),
    confidence_breakdown: {
      demo_seed: pickConfidence(20, 30, `${city.name}-seed`)
    },
    explanation: 'Demo mode footprint seeded locally after missing public signals.',
    url: `https://github.com/${username}`,
    created_at: now
  }));
}
