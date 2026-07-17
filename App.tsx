/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, useEffect, useState } from 'react';
import { ComponentMatrixDiagram, EvidenceChainDiagram, FindingsMetricDiagram } from './components/Diagrams';
import {
  ArrowDown,
  BookOpen,
  Database,
  Layers,
  Menu,
  Network,
  Utensils,
  UserRound,
  X,
} from 'lucide-react';

const LazyHeroScene = React.lazy(() =>
  import('./components/QuantumScene').then((module) => ({
    default: module.HeroScene,
  })),
);

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'method', label: 'Method' },
  { id: 'component-space', label: 'Components' },
  { id: 'findings', label: 'Findings' },
  { id: 'food', label: 'Food Validation' },
] as const;

const PROJECT_STATS = [
  { value: '4', label: 'Subjects', detail: 'CNeuroMod Friends participants' },
  { value: '137k', label: 'TRs / subject', detail: 'Full-resolution BOLD samples' },
  { value: '1,000', label: 'Parcels', detail: 'Schaefer cortical atlas' },
  { value: '50', label: 'NMF runs', detail: 'Consensus per subject' },
] as const;

const METHOD_STEPS = [
  {
    icon: Database,
    title: 'Naturalistic fMRI',
    body: 'Four CNeuroMod subjects watched six seasons of Friends, producing long-form BOLD time series across 1,000 cortical parcels.',
  },
  {
    icon: Layers,
    title: 'Parcelbit component model',
    body: 'Each subject was decomposed into k = 20 non-negative components across 50 independent runs, then summarized into consensus components.',
  },
  {
    icon: Network,
    title: 'Cross-subject matching',
    body: 'Component time courses were aligned on shared stimulus runs and matched across subjects by temporal similarity.',
  },
  {
    icon: BookOpen,
    title: 'Stimulus validation',
    body: 'High-response moments were mapped back to frames, transcripts, social labels, and targeted food-dining annotations.',
  },
] as const;

const FINDING_CARDS = [
  {
    rank: 'Rank 1',
    title: 'Dialogue / cognitive context',
    metric: '47.0% vs 29.0%',
    detail: 'FDR q = 0.00485; strongest temporal stability with mean pairwise r = 0.654.',
  },
  {
    rank: 'Rank 2',
    title: 'Observable human action',
    metric: '39.0% vs 18.0%',
    detail: 'FDR q = 0.000150; DefaultMode-dominant component linked to social and dining context.',
  },
  {
    rank: 'Rank 4',
    title: 'Visual action and food candidate',
    metric: '46.0% vs 17.0%',
    detail: 'FDR q = 3.27e-8; Visual-dominant component with visible-food and target-zone support.',
  },
  {
    rank: 'Rank 6',
    title: 'Face / expression content',
    metric: '40.5% vs 25.5%',
    detail: 'FDR q = 0.0204; secondary social-representation evidence.',
  },
] as const;

const AUTHOR_CARDS = [
  {
    name: 'Danzeng Cairang',
    role: '',
    website: 'https://tenzindann.github.io/',
    avatar: `${import.meta.env.BASE_URL}cairang-danzeng-avatar.gif`,
    delay: '0s',
  },
] as const;

const FOOD_VALIDATION_RESULTS = [
  { label: ['Broad', 'Rank 2'], q: 0.002997, r: '0.0173', n: '3660', color: '#6f9224' },
  { label: ['Broad', 'Rank 4'], q: 0.002997, r: '0.0212', n: '3660', color: '#2f8a61' },
  { label: ['Visible food', 'Rank 4'], q: 0.011988, r: '0.0146', n: '2637', color: '#3475b7' },
  { label: ['Dining', 'context', 'Rank 2'], q: 0.005994, r: '0.0166', n: '1023', color: '#bd7c1d' },
  { label: ['Dining', 'context', 'Rank 4'], q: 0.005994, r: '0.0159', n: '1023', color: '#dda62d' },
] as const;

const AuthorCard = ({
  name,
  role,
  website,
  avatar,
  delay,
}: {
  name: string;
  role: string;
  website: string;
  avatar?: string;
  delay: string;
}) => {
  return (
    <a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col group animate-fade-in-up items-center p-8 bg-[#020617] rounded-lg border border-[#020617] shadow-sm hover:shadow-md transition-all duration-300 w-full max-w-[18rem] hover:border-nobel-gold/50 cursor-pointer"
      style={{ animationDelay: delay }}
    >
      {avatar ? (
        <img
          src={avatar}
          alt={`${name} avatar`}
          className="mb-7 h-56 w-56 rounded-md object-cover ring-2 ring-white/20"
        />
      ) : (
        <div className="mb-7 flex h-56 w-56 items-center justify-center rounded-md bg-[#111827] ring-2 ring-white/20">
          <UserRound className="h-40 w-40 fill-[#020617] text-[#020617]" strokeWidth={1.8} />
        </div>
      )}
      <h3 className="font-serif text-2xl text-white text-center mb-3">{name}</h3>
      <div className="w-12 h-0.5 bg-nobel-gold mb-4 opacity-60" />
      {role ? (
        <p className="text-xs text-white/80 font-bold uppercase tracking-widest text-center leading-relaxed">{role}</p>
      ) : null}
    </a>
  );
};

const FoodValidationChart = () => {
  const width = 860;
  const height = 620;
  const margin = { top: 102, right: 44, bottom: 142, left: 108 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const maxY = 3.25;
  const threshold = -Math.log10(0.05);
  const barGap = 30;
  const barWidth = (chartWidth - barGap * (FOOD_VALIDATION_RESULTS.length - 1)) / FOOD_VALIDATION_RESULTS.length;
  const ticks = [0, 1, 2, 3];
  const yForValue = (value: number) => margin.top + chartHeight - (value / maxY) * chartHeight;

  return (
    <figure className="rounded-lg border border-white/10 bg-white/[0.035] p-5 shadow-inner">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#d8b46d]">Notebook Figure</div>
          <h3 className="mt-1 font-serif text-2xl text-white">Targeted food-dining validation</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300">
          <span className="h-px w-8 border-t-2 border-dashed border-slate-400" />
          q = 0.05
        </div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Bar chart showing targeted food-dining validation significance values by condition and rank."
        className="h-auto w-full overflow-visible"
      >
        <rect x="0" y="0" width={width} height={height} fill="transparent" />

        {ticks.map((tick) => {
          const y = yForValue(tick);
          return (
            <g key={tick}>
              <line x1={margin.left} x2={width - margin.right} y1={y} y2={y} stroke="rgba(226,232,240,0.12)" strokeWidth="1" />
              <text x={margin.left - 22} y={y + 5} textAnchor="end" fill="#cbd5e1" fontSize="18">
                {tick.toFixed(1)}
              </text>
            </g>
          );
        })}

        <line
          x1={margin.left}
          x2={width - margin.right}
          y1={yForValue(threshold)}
          y2={yForValue(threshold)}
          stroke="#94a3b8"
          strokeWidth="3"
          strokeDasharray="10 8"
          opacity="0.82"
        />
        <line x1={margin.left} x2={margin.left} y1={margin.top} y2={margin.top + chartHeight} stroke="#e2e8f0" strokeWidth="2" opacity="0.75" />
        <line x1={margin.left} x2={width - margin.right} y1={margin.top + chartHeight} y2={margin.top + chartHeight} stroke="#e2e8f0" strokeWidth="2" opacity="0.75" />

        <text
          x={28}
          y={margin.top + chartHeight / 2}
          transform={`rotate(-90 28 ${margin.top + chartHeight / 2})`}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize="20"
          fontWeight="600"
        >
          -log10(FDR q)
        </text>

        {FOOD_VALIDATION_RESULTS.map((bar, index) => {
          const value = -Math.log10(bar.q);
          const x = margin.left + index * (barWidth + barGap);
          const y = yForValue(value);
          const barHeight = margin.top + chartHeight - y;
          const labelX = x + barWidth / 2;
          return (
            <g key={`${bar.label.join('-')}-${bar.q}`}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="4" fill={bar.color} />
              <text x={labelX} y={y - 62} textAnchor="middle" fill="#f8fafc" fontSize="15" fontWeight="600">
                q={bar.q.toFixed(4)}
              </text>
              <text x={labelX} y={y - 40} textAnchor="middle" fill="#e2e8f0" fontSize="15">
                r={bar.r}
              </text>
              <text x={labelX} y={y - 19} textAnchor="middle" fill="#cbd5e1" fontSize="15">
                n={bar.n}
              </text>
              {bar.label.map((labelLine, labelIndex) => (
                <text
                  key={labelLine}
                  x={labelX}
                  y={margin.top + chartHeight + 36 + labelIndex * 21}
                  textAnchor="middle"
                  fill={labelIndex === 0 ? '#e2e8f0' : '#cbd5e1'}
                  fontSize={labelIndex === 0 ? '16' : '15'}
                  fontWeight={labelIndex === 0 ? '600' : '500'}
                >
                  {labelLine}
                </text>
              ))}
            </g>
          );
        })}
      </svg>

    </figure>
  );
};

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const logoSrc = `${import.meta.env.BASE_URL}logo.svg`;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  const scrollToSection = (id: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (!element) return;

    const headerOffset = 0;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  };

  return (
    <div className="min-h-screen bg-[#e8eaff] text-slate-800 selection:bg-[#4c7c96] selection:text-white">
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-[#e8eaff]/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
        }`}
      >
        <div className="w-full px-4 md:px-6 flex justify-between items-center">
          <button
            type="button"
            aria-label="Back to top"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="inline-flex items-center gap-3 text-slate-950 text-lg cursor-pointer -ml-1 md:-ml-2 leading-none"
          >
            <img
              src={logoSrc}
              alt="PARCELBIT logo"
              className="block h-[1.9em] w-auto object-contain shrink-0"
            />
            <span className={`font-serif font-bold tracking-wide transition-opacity leading-none ${scrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
              PARCELBIT
            </span>
          </button>

          <div className="hidden md:flex items-center gap-7 text-sm font-medium tracking-wide text-slate-600">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={scrollToSection(item.id)}
                className="hover:text-[#4c7c96] transition-colors cursor-pointer uppercase"
              >
                {item.label}
              </a>
            ))}
            <a
              href="#authors"
              onClick={scrollToSection('authors')}
              className="px-5 py-2 bg-slate-950 text-white rounded-full hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
            >
              AUTHOR
            </a>
          </div>

          <button
            type="button"
            className="md:hidden text-slate-950 p-2"
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-controls="mobile-menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div id="mobile-menu" role="dialog" aria-modal="true" className="fixed inset-0 z-40 bg-[#e8eaff] flex flex-col items-center justify-center gap-8 text-xl font-serif animate-fade-in">
          {NAV_ITEMS.map((item) => (
            <a key={item.id} href={`#${item.id}`} onClick={scrollToSection(item.id)} className="hover:text-[#4c7c96] transition-colors cursor-pointer uppercase">
              {item.label}
            </a>
          ))}
          <a
            href="#authors"
            onClick={scrollToSection('authors')}
            className="px-6 py-3 bg-slate-950 text-white rounded-full shadow-lg cursor-pointer"
          >
            AUTHOR
          </a>
        </div>
      )}

      <header className="relative h-screen flex items-center justify-center overflow-hidden">
        <Suspense fallback={<div className="absolute inset-0 z-0 bg-[#E8EAFD]" />}>
          <LazyHeroScene />
        </Suspense>

        <div className="relative z-10 container mx-auto px-6 text-center">
          <h1 className="font-serif text-4xl md:text-6xl lg:text-8xl font-medium leading-tight md:leading-[0.94] mb-8 text-slate-950 drop-shadow-sm">
            Parcelbit
            <span className="block italic font-normal text-stone-600 dark:text-stone-700 text-3xl md:text-5xl lg:text-6xl mt-4">
              for Naturalistic fMRI
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-center text-lg md:text-xl text-stone-700 dark:text-stone-700 font-light leading-relaxed mb-12">
            A CNeuroMod analysis of Friends movie-watching responses that discovers stable latent brain components, then validates them through social-action coding and targeted food-dining evidence.
          </p>

          <div className="flex justify-center">
            <a href="#overview" onClick={scrollToSection('overview')} className="group flex flex-col items-center gap-2 text-sm font-medium text-stone-500 dark:text-stone-700 hover:text-stone-900 dark:hover:text-stone-900 transition-colors cursor-pointer">
              <span>DISCOVER</span>
              <span className="p-2 border border-stone-300 dark:border-stone-500 rounded-full group-hover:border-stone-900 dark:group-hover:border-stone-900 transition-colors bg-white/50 dark:bg-white/45">
                <ArrowDown size={16} />
              </span>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section id="overview" className="min-h-[112vh] py-32 bg-[#020617] flex flex-col justify-center">
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4">
              <div className="inline-block mb-3 text-xs font-bold tracking-widest text-[#d8b46d] uppercase">Overview</div>
              <h2 className="font-serif text-4xl md:text-5xl mb-6 leading-tight text-white">
                Finding interpretable structure in real-world brain responses.
              </h2>
              <div className="w-16 h-1 bg-[#b88a44] mb-6" />
            </div>
            <div className="lg:col-span-8 text-lg text-slate-300 leading-relaxed space-y-6">
              <p>
                Naturalistic fMRI captures cognition in a setting closer to everyday life, but a single scene can mix faces, speech, body movement, social context, food, and narrative meaning. This capstone uses unsupervised component discovery to ask which response dimensions emerge from the neural data before applying stimulus labels.
              </p>
              <p>
                The project applies 50-run consensus Bayesian non-negative matrix factorization to CNeuroMod Friends responses. Components are first discovered from fMRI time series, then matched across subjects and interpreted through HRF-aligned frame coding, transcript context, canonical network enrichment, and food-dining validation.
              </p>
            </div>
          </div>

          <div className="container mx-auto px-6 md:px-12 mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PROJECT_STATS.map((stat) => (
              <div key={stat.label} className="border border-white/10 bg-white/5 rounded-lg p-6">
                <div className="font-serif text-4xl text-white mb-2">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-widest text-[#d8b46d] mb-2">{stat.label}</div>
                <p className="text-sm text-slate-300 leading-relaxed">{stat.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="method" className="min-h-[112vh] py-32 bg-[#E8EBFB] border-y border-[#cbd3ee] flex items-center">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-4xl mb-14">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/60 text-[#4c5f83] text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-[#cbd3ee]">
                <BookOpen size={14} />
                Evidence Chain
              </div>
              <h2 className="font-serif text-4xl md:text-5xl mb-6 text-slate-950">Discovery first, interpretation second.</h2>
              <p className="text-lg text-slate-700 leading-relaxed">
                The NMF model never sees food labels, social labels, transcripts, or network assignments during decomposition. Those labels enter only after stable components have been discovered and matched across participants.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {METHOD_STEPS.map((step) => {
                  const Icon = step.icon;
                  return (
                    <div key={step.title} className="bg-white/75 border border-[#cbd3ee] rounded-lg p-6 shadow-sm">
                      <Icon size={24} className="text-[#4c7c96] mb-5" />
                      <h3 className="font-serif text-2xl text-slate-950 mb-3">{step.title}</h3>
                      <p className="text-sm text-slate-700 leading-relaxed">{step.body}</p>
                    </div>
                  );
                })}
              </div>
              <EvidenceChainDiagram />
            </div>
          </div>
        </section>

        <section id="component-space" className="min-h-[112vh] py-32 bg-slate-950 text-slate-100 overflow-hidden relative flex items-center">
          <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,#4c7c96_0,transparent_35%),radial-gradient(circle_at_80%_70%,#b88a44_0,transparent_32%)]" />
          <div className="container mx-auto px-6 md:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <ComponentMatrixDiagram />
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-[#d8b46d] text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-white/10">
                  <Layers size={14} />
                  Component Space
                </div>
                <h2 className="font-serif text-4xl md:text-5xl mb-6 text-white">Each rank joins a time course with a cortical footprint.</h2>
                <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                  Bayesian NMF estimates temporal profiles showing when a component activates and parcel weights showing where it is expressed. Cross-subject matching turns subject-specific components into ranked component groups.
                </p>
                <p className="text-lg text-slate-300 leading-relaxed">
                  The strongest interpretation comes from converging evidence: temporal reproducibility, network enrichment, HRF-aligned stimulus content, and targeted validation tests.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="findings" className="min-h-[112vh] py-32 bg-[#e8eaff] flex items-center">
          <div className="container mx-auto px-6 md:px-12">
            <div className="max-w-4xl mx-auto text-center mb-14">
              <div className="inline-block mb-3 text-xs font-bold tracking-widest text-slate-500 uppercase">Main Findings</div>
              <h2 className="font-serif text-4xl md:text-5xl mb-6 text-slate-950">The clearest recovered dimensions are social, action-related, and contextual.</h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                Response-first coding of 6,000 high-response and control frames identified FDR-supported associations in the retained component space.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-14">
              {FINDING_CARDS.map((finding) => (
                <div key={finding.rank} className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
                  <div className="text-xs font-bold uppercase tracking-widest text-[#4c7c96] mb-3">{finding.rank}</div>
                  <h3 className="font-serif text-2xl text-slate-950 mb-4">{finding.title}</h3>
                  <div className="font-mono text-xl text-[#8d5a97] mb-3">{finding.metric}</div>
                  <p className="text-sm text-slate-600 leading-relaxed">{finding.detail}</p>
                </div>
              ))}
            </div>

            <FindingsMetricDiagram />
          </div>
        </section>

        <section id="food" className="min-h-[112vh] py-32 bg-[#020617] border-t border-white/10 flex items-center">
          <div className="container mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 relative">
              <FoodValidationChart />
            </div>
            <div className="lg:col-span-6">
              <div className="inline-flex items-center gap-2 mb-3 text-xs font-bold tracking-widest text-[#d8b46d] uppercase">
                <Utensils size={15} className="text-[#b88a44]" />
                Targeted Food-Dining Validation
              </div>
              <h2 className="font-serif text-4xl md:text-5xl mb-6 text-white">A two-layer food result, not a simple food-object claim.</h2>
              <p className="text-lg text-slate-300 mb-6 leading-relaxed">
                The final stimulus-first food-dining set contains 3,660 manually reviewed positive frames. The split separates 2,637 visible-food frames from 1,023 cup-only dining-context frames.
              </p>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Visible-food frames support Rank 4 as the Visual-dominant food-related candidate. Cup-only dining-context frames strongly support Rank 2, consistent with a DefaultMode narrative-social dining-context component.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-white/5 border border-white/10 rounded-lg border-l-4 border-l-[#4c7c96]">
                  <div className="font-serif text-3xl text-white mb-1">2,637</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-300">Visible-food frames</div>
                </div>
                <div className="p-5 bg-white/5 border border-white/10 rounded-lg border-l-4 border-l-[#b88a44]">
                  <div className="font-serif text-3xl text-white mb-1">1,023</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-300">Cup-only context</div>
                </div>
                <div className="p-5 bg-white/5 border border-white/10 rounded-lg border-l-4 border-l-[#8d5a97]">
                  <div className="font-serif text-3xl text-white mb-1">4.76x</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-slate-300">Rank 4 target-zone enrichment</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="authors" className="min-h-[112vh] py-32 bg-[#e8eaff] border-t border-stone-300 flex items-center">
          <div className="container mx-auto px-6 -mt-28">
            <div className="text-center mb-16">
              <div className="inline-block mb-3 text-xs font-bold tracking-widest text-stone-500 uppercase">Contributor</div>
              <h2 className="font-serif text-3xl md:text-5xl mb-4 text-stone-900">AUTHOR</h2>
            </div>

            <div className="flex flex-col md:flex-row gap-10 justify-center items-center flex-wrap">
              {AUTHOR_CARDS.map((author) => (
                <AuthorCard
                  key={author.name}
                  name={author.name}
                  role={author.role}
                  website={author.website}
                  avatar={'avatar' in author ? author.avatar : undefined}
                  delay={author.delay}
                />
              ))}
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-[#020617]">
        <div className="container mx-auto px-6 flex justify-center pt-[58px] pb-[71px] md:pt-[59px] md:pb-[72px]">
          <img
            src={logoSrc}
            alt="Footer logo"
            className="h-[88px] w-auto object-contain"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
      </footer>
    </div>
  );
};

export default App;
