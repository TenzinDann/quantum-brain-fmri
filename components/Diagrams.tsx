/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, Brain, Database, Layers, Network, Search, Utensils } from 'lucide-react';

const evidenceSteps = [
  {
    label: 'CNeuroMod',
    title: 'Friends fMRI',
    detail: '4 subjects x 137k TRs x 1,000 parcels',
    icon: Database,
    color: '#4c7c96',
  },
  {
    label: 'NMF',
    title: '50-run consensus',
    detail: 'k = 20 components per subject',
    icon: Layers,
    color: '#8d5a97',
  },
  {
    label: 'Match',
    title: 'Cross-subject ranks',
    detail: '10 matched groups, 7 retained candidates',
    icon: Network,
    color: '#b88a44',
  },
  {
    label: 'Validate',
    title: 'Stimulus evidence',
    detail: 'social coding, food frames, target zones',
    icon: Search,
    color: '#2f7f69',
  },
] as const;

const componentProfiles = {
  1: {
    label: 'Rank 1',
    network: 'Somatomotor',
    theme: 'Dialogue / cognitive context',
    stability: 'mean r = 0.654',
    color: '#4c7c96',
    values: [0.95, 0.88, 0.74, 0.31, 0.22, 0.58, 0.67, 0.42, 0.25, 0.78, 0.62, 0.36],
  },
  2: {
    label: 'Rank 2',
    network: 'DefaultMode',
    theme: 'Observable action and dining context',
    stability: 'mean r = 0.440',
    color: '#b88a44',
    values: [0.24, 0.32, 0.55, 0.76, 0.83, 0.91, 0.44, 0.57, 0.63, 0.35, 0.71, 0.69],
  },
  4: {
    label: 'Rank 4',
    network: 'Visual',
    theme: 'Visual food-related candidate',
    stability: 'lower-confidence shared',
    color: '#8d5a97',
    values: [0.82, 0.91, 0.97, 0.73, 0.52, 0.37, 0.84, 0.89, 0.66, 0.41, 0.58, 0.76],
  },
  6: {
    label: 'Rank 6',
    network: 'DefaultMode',
    theme: 'Face / expression content',
    stability: 'secondary evidence',
    color: '#2f7f69',
    values: [0.38, 0.51, 0.73, 0.57, 0.44, 0.69, 0.81, 0.61, 0.33, 0.29, 0.47, 0.66],
  },
} as const;

const socialBars = [
  { rank: 'Rank 1', label: 'Dialogue / context', top: 47.0, matched: 29.0, q: '0.00485', color: '#4c7c96' },
  { rank: 'Rank 2', label: 'Observable action', top: 39.0, matched: 18.0, q: '0.000150', color: '#b88a44' },
  { rank: 'Rank 4', label: 'Observable action', top: 46.0, matched: 17.0, q: '3.27e-8', color: '#8d5a97' },
  { rank: 'Rank 6', label: 'Face / expression', top: 40.5, matched: 25.5, q: '0.0204', color: '#2f7f69' },
] as const;

const foodBars = [
  { label: 'Visible food', rank: 'Rank 4', value: 2637, max: 3660, detail: 'Visual-dominant candidate', color: '#8d5a97' },
  { label: 'Cup-only context', rank: 'Rank 2', value: 1023, max: 3660, detail: 'Dining / narrative context', color: '#b88a44' },
  { label: 'Target hits', rank: 'Rank 4', value: 5, max: 50, detail: '5 of top 50 parcels', color: '#4c7c96' },
] as const;

export const EvidenceChainDiagram: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [playbackReset, setPlaybackReset] = useState(0);

  const selectStep = (index: number) => {
    setActiveStep(index);
    setPlaybackReset((reset) => reset + 1);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((step) => (step + 1) % evidenceSteps.length);
    }, 1700);
    return () => clearInterval(interval);
  }, [playbackReset]);

  return (
    <div className="bg-white border border-[#ded7c7] rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="font-serif text-2xl text-slate-950">Capstone Evidence Chain</h3>
          <p className="text-sm text-slate-600">How the project moves from raw fMRI to validated interpretation.</p>
        </div>
        <Brain className="text-[#4c7c96] shrink-0" size={28} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {evidenceSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === activeStep;
          return (
            <div key={step.label} className="relative">
              <motion.div
                role="button"
                tabIndex={0}
                aria-pressed={isActive}
                aria-label={`Show ${step.title} evidence step`}
                onClick={() => selectStep(index)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectStep(index);
                  }
                }}
                animate={{
                  y: isActive ? -4 : 0,
                  borderColor: isActive ? step.color : '#e2e8f0',
                }}
                className="h-full rounded-lg border bg-[#f7f9fa] p-4 cursor-pointer outline-none transition-colors hover:bg-white focus-visible:ring-2 focus-visible:ring-[#4c7c96] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{step.label}</div>
                  <div className="h-9 w-9 rounded-full flex items-center justify-center" style={{ backgroundColor: `${step.color}1f`, color: step.color }}>
                    <Icon size={18} />
                  </div>
                </div>
                <h4 className="font-serif text-lg text-slate-950 mb-2">{step.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{step.detail}</p>
              </motion.div>
              {index < evidenceSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-3 h-[1px] bg-slate-300" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 h-2 rounded-full bg-slate-100 overflow-hidden">
        <motion.div
          className="h-full bg-[#4c7c96]"
          animate={{ width: `${((activeStep + 1) / evidenceSteps.length) * 100}%` }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        />
      </div>
    </div>
  );
};

export const ComponentMatrixDiagram: React.FC = () => {
  const ranks = [1, 2, 4, 6] as const;
  const [selectedRank, setSelectedRank] = useState<(typeof ranks)[number]>(1);
  const profile = componentProfiles[selectedRank];

  const cells = useMemo(() => {
    return Array.from({ length: 72 }, (_, index) => {
      const base = profile.values[index % profile.values.length];
      const wave = 0.16 * Math.sin(index * 1.7 + selectedRank);
      return Math.max(0.08, Math.min(1, base + wave));
    });
  }, [profile.values, selectedRank]);

  return (
    <div className="bg-white/8 border border-white/10 rounded-lg p-6 shadow-xl backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d8b46d] mb-2">Interactive Component View</div>
          <h3 className="font-serif text-2xl text-white">Temporal rank and spatial footprint</h3>
        </div>
        <div className="flex gap-2">
          {ranks.map((rank) => (
            <button
              key={rank}
              type="button"
              onClick={() => setSelectedRank(rank)}
              className={`px-3 py-2 rounded-md text-sm font-semibold transition-colors border ${
                selectedRank === rank
                  ? 'bg-[#d8b46d] text-slate-950 border-[#d8b46d]'
                  : 'bg-transparent text-slate-300 border-white/15 hover:border-white/35'
              }`}
            >
              R{rank}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-1 mb-6">
        {cells.map((value, index) => (
          <motion.div
            key={`${selectedRank}-${index}`}
            className="aspect-square rounded-[3px]"
            initial={{ opacity: 0.25, scale: 0.92 }}
            animate={{ opacity: 0.38 + value * 0.62, scale: 1 }}
            transition={{ delay: (index % 12) * 0.01 }}
            style={{ backgroundColor: profile.color }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-lg bg-white/8 border border-white/10 p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Selected</div>
          <div className="font-serif text-xl text-white">{profile.label}</div>
        </div>
        <div className="rounded-lg bg-white/8 border border-white/10 p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Network</div>
          <div className="font-serif text-xl text-white">{profile.network}</div>
        </div>
        <div className="rounded-lg bg-white/8 border border-white/10 p-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Evidence</div>
          <div className="font-serif text-xl text-white">{profile.stability}</div>
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-300 leading-relaxed">
        {profile.theme}
      </p>
    </div>
  );
};

export const FindingsMetricDiagram: React.FC = () => {
  const [view, setView] = useState<'social' | 'food'>('social');

  return (
    <div className="bg-slate-950 text-slate-100 rounded-lg border border-slate-800 shadow-xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d8b46d] mb-2">Evidence Summary</div>
          <h3 className="font-serif text-3xl text-white">Component validation metrics</h3>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView('social')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold border transition-colors ${
              view === 'social' ? 'bg-[#d8b46d] text-slate-950 border-[#d8b46d]' : 'border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <BarChart2 size={16} />
            Social
          </button>
          <button
            type="button"
            onClick={() => setView('food')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold border transition-colors ${
              view === 'food' ? 'bg-[#d8b46d] text-slate-950 border-[#d8b46d]' : 'border-slate-700 text-slate-300 hover:border-slate-500'
            }`}
          >
            <Utensils size={16} />
            Food
          </button>
        </div>
      </div>

      {view === 'social' ? (
        <div className="space-y-5">
          {socialBars.map((item) => (
            <div key={`${item.rank}-${item.label}`} className="grid grid-cols-1 md:grid-cols-[190px_1fr_92px] gap-4 md:items-center">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-slate-500">{item.rank}</div>
                <div className="font-serif text-xl text-white">{item.label}</div>
              </div>
              <div className="space-y-2">
                <MetricBar label="High response" value={item.top} max={55} color={item.color} />
                <MetricBar label="Matched random" value={item.matched} max={55} color="#64748b" />
              </div>
              <div className="font-mono text-sm text-[#d8b46d] md:text-right">q = {item.q}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {foodBars.map((item) => (
            <div key={item.label} className="rounded-lg bg-white/8 border border-white/10 p-5">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">{item.label}</div>
              <div className="font-serif text-3xl text-white mb-2">{item.value.toLocaleString()}</div>
              <div className="text-sm text-slate-400 mb-5">{item.rank} - {item.detail}</div>
              <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: item.color }}
                  animate={{ width: `${(item.value / item.max) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 80, damping: 16 }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MetricBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span>{value.toFixed(1)}%</span>
      </div>
      <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ type: 'spring', stiffness: 85, damping: 18 }}
        />
      </div>
    </div>
  );
};
