import { useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Cell 
} from 'recharts';
import { 
  Award, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Compass, 
  Info,
  Scale
} from 'lucide-react';
import { ComponentType, CriteriaWeights, TopsisResult } from '../types';
import { MATERIALS, COMPONENT_PROFILES } from '../data';
import { runTopsis } from '../services/topsis_service';
import { runWeightedScoring } from '../services/weighted_scoring_service';
import { EXPECTED_LITERATURE_CLASSES } from '../services/validation_service';

interface BenchmarkViewProps {
  selectedComponent: ComponentType;
  criteriaWeights: CriteriaWeights;
  topsisRankings: TopsisResult[];
}

export default function BenchmarkView({
  selectedComponent,
  criteriaWeights,
  topsisRankings
}: BenchmarkViewProps) {

  // Calculate benchmark comparisons across all 6 default component profiles
  const benchmarkAnalysis = useMemo(() => {
    const components = Object.keys(COMPONENT_PROFILES) as ComponentType[];
    
    let topsisVsSawMatches = 0;
    let topsisVsLitMatches = 0;
    let sawVsLitMatches = 0;

    const cases = components.map(comp => {
      const profile = COMPONENT_PROFILES[comp];
      
      // Run TOPSIS
      const topsisRes = runTopsis(MATERIALS, profile.weights);
      const topsisTop = topsisRes[0].material;
      
      // Run Simple Additive Weighting (SAW)
      const sawRes = runWeightedScoring(MATERIALS, profile.weights);
      const sawTop = sawRes[0].material;

      // Literature expected
      const expectedClasses = EXPECTED_LITERATURE_CLASSES[comp];
      
      const topsisMatchSaw = topsisTop.id === sawTop.id;
      const topsisMatchLit = expectedClasses.includes(topsisTop.materialClass);
      const sawMatchLit = expectedClasses.includes(sawTop.materialClass);

      if (topsisMatchSaw) topsisVsSawMatches++;
      if (topsisMatchLit) topsisVsLitMatches++;
      if (sawMatchLit) sawVsLitMatches++;

      return {
        component: comp,
        literatureExpected: expectedClasses.join(' / '),
        topsisMaterial: `${topsisTop.name} (${topsisTop.grade})`,
        topsisClass: topsisTop.materialClass,
        sawMaterial: `${sawTop.name} (${sawTop.grade})`,
        sawClass: sawTop.materialClass,
        topsisScore: topsisRes[0].score,
        sawScore: sawRes[0].score,
        topsisMatchSaw,
        topsisMatchLit,
        sawMatchLit
      };
    });

    const total = components.length;
    return {
      cases,
      topsisVsSawAgreement: Math.round((topsisVsSawMatches / total) * 100),
      topsisVsLitAgreement: Math.round((topsisVsLitMatches / total) * 100),
      sawVsLitAgreement: Math.round((sawVsLitMatches / total) * 100)
    };
  }, []);

  // Compare active component TOPSIS rankings with SAW rankings
  const activeComparisonData = useMemo(() => {
    // Run SAW on active component weights
    const sawRankings = runWeightedScoring(MATERIALS, criteriaWeights);
    
    // Grab top 5 TOPSIS recommendations
    return topsisRankings.slice(0, 5).map(t => {
      const sawItem = sawRankings.find(s => s.material.id === t.material.id);
      return {
        name: t.material.name,
        'TOPSIS Score': t.score,
        'Weighted Scoring Score': sawItem ? sawItem.score : 0,
        topsisRank: t.rank,
        sawRank: sawItem ? sawItem.rank : 99,
        rankDelta: sawItem ? Math.abs(t.rank - sawItem.rank) : 99
      };
    });
  }, [criteriaWeights, topsisRankings]);

  return (
    <div id="benchmark-laboratory" className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-900/20 pb-5">
        <div>
          <h1 className="font-sans font-bold text-xl text-white tracking-tight uppercase flex items-center gap-2.5">
            <Scale className="w-5 h-5 text-blue-400" />
            Decision Benchmark Laboratory
          </h1>
          <p className="text-[11px] font-sans text-slate-400 mt-1">
            Methodological benchmarking arena. Contrast rankings derived from TOPSIS vector distances, Simple Additive Weighting (SAW), and literature baselines.
          </p>
        </div>
      </div>

      {/* Overview Agreement Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: TOPSIS vs SAW */}
        <div className="bg-blue-950/20 border border-blue-900/30 rounded p-4 flex flex-col justify-between">
          <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">TOPSIS vs. SAW Concordance</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-white">{benchmarkAnalysis.topsisVsSawAgreement}%</span>
            <span className="text-[10px] text-emerald-400">Agreement</span>
          </div>
          <span className="text-[9px] text-slate-500 mt-1">Direct Rank #1 material identity matches across all component presets.</span>
        </div>

        {/* Card 2: TOPSIS vs Literature */}
        <div className="bg-blue-950/20 border border-blue-900/30 rounded p-4 flex flex-col justify-between">
          <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">TOPSIS vs. Literature Baseline</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-emerald-450">{benchmarkAnalysis.topsisVsLitAgreement}%</span>
            <span className="text-[10px] text-slate-400">Alignment</span>
          </div>
          <span className="text-[9px] text-slate-500 mt-1">Material class conformance with traditional literature-based standard standards.</span>
        </div>

        {/* Card 3: SAW vs Literature */}
        <div className="bg-blue-950/20 border border-blue-900/30 rounded p-4 flex flex-col justify-between">
          <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">SAW vs. Literature Baseline</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-white">{benchmarkAnalysis.sawVsLitAgreement}%</span>
            <span className="text-[10px] text-slate-400">Alignment</span>
          </div>
          <span className="text-[9px] text-slate-500 mt-1">Weighted scoring recommendation accuracy compared against literature defaults.</span>
        </div>

      </div>

      {/* Cross-Method Comparison Table */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-5">
        <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-3">
          Methodological Concordance Grid (6 Components)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 pl-2">Component</th>
                <th className="py-2.5">Literature Expected Class</th>
                <th className="py-2.5">TOPSIS Rank #1</th>
                <th className="py-2.5">SAW Rank #1</th>
                <th className="py-2.5 text-center">TOPSIS vs SAW</th>
                <th className="py-2.5 text-center">TOPSIS vs Lit</th>
                <th className="py-2.5 text-center pr-2">SAW vs Lit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono text-[11px] text-slate-300">
              {benchmarkAnalysis.cases.map(c => (
                <tr key={c.component} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 pl-2 font-sans font-semibold text-white">{c.component}</td>
                  <td className="py-3 text-slate-450">{c.literatureExpected}</td>
                  <td className="py-3 text-blue-300">{c.topsisMaterial} <span className="text-[8px] opacity-40 block">{c.topsisClass}</span></td>
                  <td className="py-3 text-yellow-350">{c.sawMaterial} <span className="text-[8px] opacity-40 block">{c.sawClass}</span></td>
                  <td className="py-3 text-center">
                    {c.topsisMatchSaw ? (
                      <span className="text-emerald-400 font-bold">MATCH</span>
                    ) : (
                      <span className="text-amber-500">DIFF</span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    {c.topsisMatchLit ? (
                      <span className="text-emerald-400 font-bold">MATCH</span>
                    ) : (
                      <span className="text-amber-500">DIFF</span>
                    )}
                  </td>
                  <td className="py-3 text-center pr-2">
                    {c.sawMatchLit ? (
                      <span className="text-emerald-400 font-bold">MATCH</span>
                    ) : (
                      <span className="text-amber-500">DIFF</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Active Component Method Rank Delta Line/Bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Scores Contrast chart (col 7) */}
        <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[360px]">
          <div>
            <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Score Normalization Contrast: TOPSIS vs. SAW
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">
              Displays differences in normalized scores for the top 5 recommended materials for <span className="text-blue-400 font-bold uppercase">{selectedComponent}</span>.
            </p>
          </div>

          <div className="flex-1 min-h-[220px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activeComparisonData} margin={{ top: 5, right: 10, bottom: -10, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px' }} />
                <Bar dataKey="TOPSIS Score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Weighted Scoring Score" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rank Deltas table (col 5) */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[360px]">
          <div>
            <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Method Rank Discrepancy
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">
              Compares rank order deltas for top candidates. Large deltas indicate TOPSIS non-linear matrix normalization dominance.
            </p>
          </div>

          <div className="flex-1 mt-4 overflow-y-auto pr-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[9px] font-mono text-slate-500 uppercase">
                  <th className="py-2">Material</th>
                  <th className="py-2 text-center">TOPSIS Rank</th>
                  <th className="py-2 text-center">SAW Rank</th>
                  <th className="py-2 text-right pr-2">Rank Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px] font-mono text-slate-300">
                {activeComparisonData.map((d, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="py-2.5 text-slate-350">{d.name}</td>
                    <td className="py-2.5 text-center font-bold text-blue-400">#{d.topsisRank}</td>
                    <td className="py-2.5 text-center font-bold text-amber-500">#{d.sawRank}</td>
                    <td className="py-2.5 text-right pr-2 font-bold">
                      {d.rankDelta === 0 ? (
                        <span className="text-emerald-400">0 (Concordant)</span>
                      ) : (
                        <span className="text-rose-400">+{d.rankDelta} slots</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
