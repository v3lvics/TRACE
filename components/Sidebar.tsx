'use client';

import { motion } from 'framer-motion';

type SidebarProps = {
  username: string;
  onUsernameChange: (value: string) => void;
  onScan: () => void;
  statusSteps: string[];
  footprintsCount: number;
  highestConfidence: number;
  isScanning: boolean;
  blocked: boolean;
};

export default function Sidebar({
  username,
  onUsernameChange,
  onScan,
  statusSteps,
  footprintsCount,
  highestConfidence,
  isScanning,
  blocked
}: SidebarProps) {
  return (
    <aside className="relative z-20 flex h-full w-[320px] flex-col gap-6 border-r border-white/5 bg-ink/60 p-6 backdrop-blur">
      <div>
        <p className="text-xs uppercase tracking-[0.4em] text-slate-500">OSINT UI</p>
        <h1 className="mt-2 text-3xl font-semibold text-white glow-text">TRACE</h1>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-xs uppercase tracking-[0.3em] text-slate-400">Username</label>
        <input
          value={username}
          onChange={(event) => onUsernameChange(event.target.value)}
          placeholder="torvalds"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-pulse/60"
        />
        <button
          onClick={onScan}
          disabled={!username || isScanning}
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pulse/80 to-aurora/80 px-4 py-3 text-sm font-semibold text-ink transition hover:from-pulse hover:to-aurora disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isScanning ? 'Scanning…' : 'Scan'}
        </button>
        {blocked ? (
          <p className="text-xs text-red-300">Username is blocked by opt-out denylist.</p>
        ) : null}
      </div>

      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Process</p>
        <div className="mt-3 space-y-2">
          {statusSteps.map((step, index) => (
            <motion.div
              key={`${step}-${index}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05 }}
              className="text-sm text-slate-200"
            >
              {step}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Footprints</p>
          <motion.p
            key={footprintsCount}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 text-2xl font-semibold"
          >
            {footprintsCount}
          </motion.p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Top Confidence</p>
          <motion.p
            key={highestConfidence}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 text-2xl font-semibold"
          >
            {highestConfidence}%
          </motion.p>
        </div>
      </div>

      <p className="mt-auto text-xs text-slate-500">
        Public signals. Correlation, not confirmation.
      </p>
    </aside>
  );
}
