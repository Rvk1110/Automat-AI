import { useMemo } from 'react';
import { 
  Sparkles, 
  Percent, 
  HelpCircle, 
  GitCommit, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Calculator,
  Compass,
  CornerDownRight,
  Award
} from 'lucide-react';
import { motion } from 'motion/react';
import { Material, ComponentType, CriteriaWeights, TopsisResult } from '../types';
import { CLASS_COLORS } from '../data';
import { generateScientificExplanation } from '../utils';

interface ExplainableAIViewProps {
  selectedComponent: ComponentType;
  criteriaWeights: CriteriaWeights;
  topsisRankings: TopsisResult[];
}

export default function ExplainableAIView({
  selectedComponent,
  criteriaWeights,
  topsisRankings
}: ExplainableAIViewProps) {

  // Candidates
  const topResult = topsisRankings[0];
  const runnerUpResult = topsisRankings[1];

  // Calculate confidence gap
  const confidenceStats = useMemo(() => {
    if (!topResult || !runnerUpResult) return { gap: 0, level: 'Low', color: 'text-yellow-400', pct: 0 };
    
    const gap = topResult.score - runnerUpResult.score;
    let level = 'Low';
    let color = 'text-yellow-500';
    let stroke = '#eab308';
    
    if (gap >= 0.10) {
      level = 'High';
      color = 'text-emerald-400';
      stroke = '#10b981';
    } else if (gap >= 0.04) {
      level = 'Medium';
      color = 'text-blue-400';
      stroke = '#3b82f6';
    }

    // Scale gap onto gauge percentage 0-100 (using 0.25 as maximum expected deviation)
    const pct = Math.min(100, Math.round((gap / 0.25) * 100));

    return { gap, level, color, stroke, pct };
  }, [topResult, runnerUpResult]);

  // Contribution values
  const contributions = useMemo(() => {
    const keys: (keyof CriteriaWeights)[] = ['strength', 'weight', 'cost', 'corrosion', 'wear', 'sustainability'];
    const labels = ['Mechanical Strength', 'Mass Reduction', 'Cost efficiency', 'Corrosion Shield', 'Wear Resistance', 'Eco Sustainability'];
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-yellow-500', 'bg-purple-500', 'bg-cyan-500', 'bg-teal-500'];
    const total = keys.reduce((sum, k) => sum + criteriaWeights[k], 0);

    return keys.map((key, idx) => {
      const weight = criteriaWeights[key];
      const percent = total > 0 ? (weight / total) * 100 : 16.6;
      return {
        label: labels[idx],
        percent: Math.round(percent),
        colorClass: colors[idx]
      };
    });
  }, [criteriaWeights]);

  // Formatted Mathematical Weight Vectors for academic look
  const vectorString = useMemo(() => {
    const keys: (keyof CriteriaWeights)[] = ['strength', 'weight', 'cost', 'corrosion', 'wear', 'sustainability'];
    const total = keys.reduce((sum, k) => sum + criteriaWeights[k], 0);
    const elements = keys.map(k => {
      const w = total > 0 ? criteriaWeights[k] / total : 0.166;
      return w.toFixed(3);
    });
    return `W⃗ = [${elements.join(', ')}]`;
  }, [criteriaWeights]);

  // Structured academic commentary text
  const scientificExpl = useMemo(() => {
    if (!topResult || !runnerUpResult) {
      return { summary: '', comparison: '', tradeoffs: '', conclusion: '' };
    }
    return generateScientificExplanation(
      selectedComponent,
      topResult.material,
      runnerUpResult.material,
      topResult.score,
      runnerUpResult.score,
      criteriaWeights
    );
  }, [selectedComponent, topResult, runnerUpResult, criteriaWeights]);

  return (
    <div id="explainable-ai-view" className="space-y-6">
      
      {/* Title */}
      <div className="border-b border-blue-900/20 pb-5">
        <h1 className="font-sans font-bold text-xl text-white tracking-tight uppercase">Explainable AI (XAI) Laboratory</h1>
        <p className="text-[11px] font-sans text-slate-400 mt-1">Audit decision pathways, model sensitivity metrics, and review the deep mathematical synthesis for selection rankings.</p>
      </div>

      {/* Top Cockpit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Recommendation Header Card */}
        <div id="xai-best-recommendation-card" className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[300px]">
          <div>
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 font-bold">AI Decision Core</span>
            
            <div className="mt-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Optimal Candidate</span>
              <h2 className="text-lg font-bold text-white uppercase leading-tight mt-0.5">{topResult?.material.name}</h2>
              <p className="text-xs font-mono text-slate-400">{topResult?.material.grade} — {topResult?.material.materialClass}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10">
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Secondary Candidate (Runner-up)</span>
              <h3 className="text-sm font-semibold text-slate-300 leading-tight mt-0.5">{runnerUpResult?.material.name}</h3>
              <p className="text-[10px] font-mono text-slate-500">{runnerUpResult?.material.grade} — {runnerUpResult?.material.materialClass}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-4 mt-2">
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block">TOPSIS Index</span>
              <span className="text-sm font-extrabold text-blue-400 font-mono">{topResult?.score.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Confidence Level</span>
              <span className={`text-sm font-extrabold font-mono ${confidenceStats.color}`}>{confidenceStats.level}</span>
            </div>
          </div>
        </div>

        {/* Card 2: TOPSIS Confidence Arc Gauge */}
        <div id="xai-confidence-meter" className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between items-center h-[300px]">
          <div className="w-full text-left">
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-1">
              TOPSIS Confidence Meter
            </h4>
            <p className="text-[10px] text-slate-500 font-mono">Quantifies statistical score separation gap: ΔS = {confidenceStats.gap.toFixed(4)}</p>
          </div>

          {/* Semi-circular arc gauge SVG */}
          <div className="relative w-44 h-24 flex items-center justify-center mt-3 scale-110">
            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
              {/* Arc background */}
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke="#1e293b" 
                strokeWidth="8" 
                strokeLinecap="round" 
              />
              {/* Color arc trace based on confidence gap */}
              <path 
                d="M 10 50 A 40 40 0 0 1 90 50" 
                fill="none" 
                stroke={confidenceStats.stroke} 
                strokeWidth="8" 
                strokeLinecap="round" 
                strokeDasharray="125.6"
                strokeDashoffset={125.6 - (125.6 * confidenceStats.pct) / 100}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute bottom-1 text-center font-sans">
              <span className={`text-xs font-mono font-black ${confidenceStats.color} uppercase tracking-widest`}>
                {confidenceStats.level} Verification
              </span>
              <p className="text-[10px] text-slate-500 font-mono mt-0.5">({confidenceStats.pct}% confidence scale)</p>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 text-center leading-relaxed max-w-xs mt-2 italic font-mono px-1">
            *High confidence indicates a distinct, mathematically dominant material envelope.
          </p>
        </div>

        {/* Card 3: Weight Contribution Bars */}
        <div id="xai-contribution-bars" className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[300px]">
          <div>
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-2">
              Weight Sensitivity Vectors
            </h4>
          </div>

          {/* Horizontal custom progress bars */}
          <div className="space-y-2.5 flex-1 mt-4 overflow-y-auto pr-1">
            {contributions.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                  <span>{item.label}</span>
                  <span className="font-bold text-white">{item.percent}%</span>
                </div>
                <div className="w-full h-1 bg-slate-800 overflow-hidden">
                  <div 
                    className={`h-full ${item.colorClass} opacity-85 transition-all duration-500`}
                    style={{ width: `${item.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Provenance Weight Vectors Tag Row */}
      <div id="research-provenance-bar" className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600/10 border border-blue-500/20 p-2 rounded text-blue-400">
            <Percent className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-mono font-bold text-white uppercase">Research Provenance Vectors</p>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">Scientific mathematical coordinates applied to normal matrices.</p>
          </div>
        </div>
        
        {/* Math string element looks extremely intelligent */}
        <div className="bg-[#0B0F19] border border-white/10 p-2 rounded.5 font-mono text-xs text-blue-300 font-bold tracking-wider select-all">
          {vectorString}
        </div>
      </div>

      {/* Large AI Explanation Card - Academic Discussion layout */}
      <div id="ai-explanation-academic-card" className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
        <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-2">
          Systematic AI Decision Rationale & Discussion
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 font-sans leading-relaxed">
          
          {/* Why Selected */}
          <div className="space-y-1 p-3 rounded bg-white/5 border border-white/10">
            <h4 className="font-mono text-[10px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              1. Optimal Criterion Target Integration
            </h4>
            <p className="pt-1">{scientificExpl.summary}</p>
          </div>

          {/* Comparison */}
          <div className="space-y-1 p-3 rounded bg-white/5 border border-white/10">
            <h4 className="font-mono text-[10px] font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <GitCommit className="w-3.5 h-3.5" />
              2. Comparative Differential Analysis
            </h4>
            <p className="pt-1">{scientificExpl.comparison}</p>
          </div>

          {/* Trade-offs */}
          <div className="space-y-1 p-3 rounded bg-white/5 border border-white/10">
            <h4 className="font-mono text-[10px] font-black text-yellow-500 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              3. Inter-Criterion Trade-offs & specific rigidity
            </h4>
            <p className="pt-1">{scientificExpl.tradeoffs}</p>
          </div>

          {/* Application Specific */}
          <div className="space-y-1 p-3 rounded bg-white/5 border border-white/10">
            <h4 className="font-mono text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              4. FMVSS Compliance & Safety Structural Synthesis
            </h4>
            <p className="pt-1">{scientificExpl.conclusion}</p>
          </div>

        </div>
      </div>

      {/* Decision Flow Diagram - styled SVG connectivity */}
      <div id="panel-decision-flowchart" className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-3">
          Decision Flow Pipeline Path Diagram
        </h4>

        {/* Scalable custom vector cards layout */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2 text-center text-[10px] font-mono font-bold">
          {/* Vector Node 1 */}
          <div className="relative p-2 rounded border border-white/10 bg-[#0B0F19]">
            <span className="text-slate-500 uppercase font-black text-[9px] block">Stage 01</span>
            <span className="text-slate-300">User Weights Profile</span>
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 text-slate-700 hidden md:block">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Vector Node 2 */}
          <div className="relative p-2 rounded border border-white/10 bg-[#0B0F19]">
            <span className="text-slate-500 uppercase font-black text-[9px] block">Stage 02</span>
            <span className="text-slate-300">Normalized Weights</span>
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 text-slate-700 hidden md:block">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Vector Node 3 */}
          <div className="relative p-2 rounded border border-blue-500/20 bg-blue-950/10">
            <span className="text-blue-400 uppercase font-black text-[9px] block">Stage 03</span>
            <span className="text-white">TOPSIS Norm Engine</span>
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 text-blue-500 hidden md:block">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Vector Node 4 */}
          <div className="relative p-2 rounded border border-white/10 bg-[#0B0F19]">
            <span className="text-slate-500 uppercase font-black text-[9px] block">Stage 04</span>
            <span className="text-slate-300">Material Rank Sorted</span>
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 text-slate-700 hidden md:block">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Vector Node 5 */}
          <div className="relative p-2 rounded border border-white/10 bg-[#0B0F19]">
            <span className="text-slate-500 uppercase font-black text-[9px] block">Stage 05</span>
            <span className="text-slate-300">AI Narrative Rationale</span>
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 text-slate-700 hidden md:block">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Vector Node 6 */}
          <div className="p-2 rounded border border-emerald-500/20 bg-emerald-950/10">
            <span className="text-emerald-400 uppercase font-black text-[9px] block">Result</span>
            <span className="text-emerald-300">Structural Recommendation</span>
          </div>
        </div>
      </div>

    </div>
  );
}
