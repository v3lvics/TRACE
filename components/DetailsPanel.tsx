'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Footprint } from '../lib/types';

const panelVariants = {
  hidden: { x: 320, opacity: 0 },
  visible: { x: 0, opacity: 1 }
};

type DetailsPanelProps = {
  footprint: Footprint | null;
};

export default function DetailsPanel({ footprint }: DetailsPanelProps) {
  const handleCopy = async () => {
    if (!footprint) return;
    await navigator.clipboard.writeText(JSON.stringify(footprint, null, 2));
  };

  return (
    <AnimatePresence>
      {footprint ? (
        <motion.aside
          className="pointer-events-auto absolute right-0 top-0 z-20 flex h-full w-[320px] flex-col gap-4 border-l border-white/5 bg-ink/70 p-6 backdrop-blur"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={panelVariants}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Footprint dossier</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">
              {footprint.location.label}
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Precision: {footprint.location.precision.toUpperCase()} · Confidence {footprint.confidence}%
            </p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Explanation</p>
            <p className="mt-2 leading-relaxed">{footprint.explanation}</p>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Confidence breakdown</p>
            <div className="mt-2 space-y-2">
              {Object.entries(footprint.confidence_breakdown).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between text-slate-300">
                  <span>{key.replace(/_/g, ' ')}</span>
                  <span>{value}%</span>
                </div>
              ))}
            </div>
          </div>

          <a
            href={footprint.url}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-pulse transition hover:border-pulse/60"
          >
            View source
          </a>

          <button
            onClick={handleCopy}
            className="rounded-lg border border-white/10 bg-gradient-to-r from-pulse/70 to-aurora/70 px-4 py-3 text-sm font-semibold text-ink transition hover:from-pulse hover:to-aurora"
          >
            Copy report
          </button>
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
