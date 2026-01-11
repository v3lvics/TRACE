'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Globe from '../components/Globe';
import Sidebar from '../components/Sidebar';
import DetailsPanel from '../components/DetailsPanel';
import TopStatusBar from '../components/TopStatusBar';
import { checkDenylist } from '../lib/denylist';
import { fetchGitHubProfile } from '../lib/github';
import { inferFootprintsFromGithub, seedDemoFootprints } from '../lib/inference';
import type { Footprint } from '../lib/types';

const STATUS_SEQUENCE = ['Enumerating', 'Correlating', 'Placing footprints'];

export default function HomePage() {
  const [username, setUsername] = useState('');
  const [footprints, setFootprints] = useState<Footprint[]>([]);
  const [selected, setSelected] = useState<Footprint | null>(null);
  const [status, setStatus] = useState('Idle');
  const [statusSteps, setStatusSteps] = useState<string[]>(['Awaiting target.']);
  const [isScanning, setIsScanning] = useState(false);
  const [demoMode, setDemoMode] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutsRef = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => window.clearTimeout(timeout));
    };
  }, []);

  const highestConfidence = useMemo(() => {
    return footprints.reduce((max, footprint) => Math.max(max, footprint.confidence), 0);
  }, [footprints]);

  const revealFootprints = useCallback((items: Footprint[]) => {
    setFootprints([]);
    items.forEach((item, index) => {
      const timeout = window.setTimeout(() => {
        setFootprints((prev) => [...prev, item]);
      }, 160 * index);
      timeoutsRef.current.push(timeout);
    });
  }, []);

  const handleScan = useCallback(async () => {
    if (!username.trim()) return;
    timeoutsRef.current.forEach((timeout) => window.clearTimeout(timeout));
    timeoutsRef.current = [];

    setIsScanning(true);
    setDemoMode(false);
    setSelected(null);
    setFootprints([]);
    setError(null);
    setBlocked(false);
    setStatusSteps(['Initializing scan...']);

    const denied = await checkDenylist(username);
    if (denied) {
      setBlocked(true);
      setIsScanning(false);
      setStatus('Blocked');
      setStatusSteps(['Access denied via opt-out list.']);
      return;
    }

    STATUS_SEQUENCE.forEach((step, index) => {
      const timeout = window.setTimeout(() => {
        setStatus(step);
        setStatusSteps((prev) => [...prev, step]);
      }, index * 650);
      timeoutsRef.current.push(timeout);
    });

    const result = await fetchGitHubProfile(username.trim());
    const rateLimited = result.rateLimited;

    if (rateLimited || result.error) {
      setDemoMode(true);
      setError(rateLimited ? 'Rate limited; demo mode.' : 'Network issue; demo mode.');
      const demo = seedDemoFootprints(username.trim());
      revealFootprints(demo);
      setIsScanning(false);
      setStatus('Demo results');
      return;
    }

    if (!result.profile) {
      setDemoMode(true);
      setError('No profile data; demo mode.');
      const demo = seedDemoFootprints(username.trim());
      revealFootprints(demo);
      setIsScanning(false);
      setStatus('Demo results');
      return;
    }

    const inferred = inferFootprintsFromGithub(result.profile, result.repos);

    if (inferred.length === 0) {
      setDemoMode(true);
      setError('No resolvable location; demo mode.');
      const demo = seedDemoFootprints(username.trim());
      revealFootprints(demo);
      setIsScanning(false);
      setStatus('Demo results');
      return;
    }

    revealFootprints(inferred);
    setIsScanning(false);
    setStatus('Scan complete');
  }, [revealFootprints, username]);

  return (
    <main className="relative h-screen w-screen overflow-hidden bg-ink">
      <Globe
        footprints={footprints}
        selectedId={selected?.id ?? null}
        onSelect={setSelected}
        scanning={isScanning}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-ink" />
      <div className="pointer-events-none absolute inset-0 radial-fade" />
      <TopStatusBar status={status} demoMode={demoMode} error={error} />

      <div className="absolute inset-0 flex">
        <Sidebar
          username={username}
          onUsernameChange={setUsername}
          onScan={handleScan}
          statusSteps={statusSteps}
          footprintsCount={footprints.length}
          highestConfidence={highestConfidence}
          isScanning={isScanning}
          blocked={blocked}
        />
        <div className="relative flex-1" />
      </div>
      <DetailsPanel footprint={selected} />
      {isScanning ? (
        <div className="scanline pointer-events-none absolute bottom-0 left-0 h-1 w-full opacity-60" />
      ) : null}
    </main>
  );
}
