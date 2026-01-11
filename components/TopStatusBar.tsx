'use client';

import { motion } from 'framer-motion';

type TopStatusBarProps = {
  status: string;
  demoMode: boolean;
  error?: string | null;
};

export default function TopStatusBar({ status, demoMode, error }: TopStatusBarProps) {
  return (
    <div className="pointer-events-none absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-6 py-4 text-xs uppercase tracking-[0.2em] text-slate-400">
      <motion.div
        key={status}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {status || 'Idle' }
      </motion.div>
      <div className="flex items-center gap-3">
        {error ? (
          <span className="rounded-full border border-red-400/40 px-3 py-1 text-[10px] text-red-300">
            {error}
          </span>
        ) : null}
        {demoMode ? (
          <span className="rounded-full border border-pulse/40 px-3 py-1 text-[10px] text-pulse">
            Demo Mode
          </span>
        ) : null}
      </div>
    </div>
  );
}
