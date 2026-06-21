import { useMemo, useState, useEffect } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  GitCommit, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight,
  Award,
  Loader2,
  AlertTriangle,
  Sliders,
  Scale,
  Cpu
} from 'lucide-react';
import { Material, ComponentType, CriteriaWeights, TopsisResult } from '../types';
import { fetchExplanation } from '../services/gemini_service';
import { calculateAttribution } from '../services/attribution_service';
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

  // Calculate stability index
  const stabilityStats = useMemo(() => {
    if (!topResult || !runnerUpResult) {
      return { gap: 0, level: 'Low Stability', color: 'text-yellow-400', barColor: 'bg-yellow-500', progressPct: 0 };
    }
    
    const gap = topResult.score - runnerUpResult.score;
    let level = 'Low Stability';
    let color = 'text-yellow-500';
    let barColor = 'bg-yellow-500';
    
    if (gap > 0.1) {
      level = 'High Stability';
      color = 'text-emerald-400';
      barColor = 'bg-emerald-500';
    } else if (gap >= 0.05) {
      level = 'Moderate Stability';
      color = 'text-blue-400';
      barColor = 'bg-blue-500';
    }

    // Scale gap onto progress percentage 0-100 (using 0.20 as maximum reference stability)
    const progressPct = Math.min(100, Math.max(0, Math.round((gap / 0.20) * 100)));

    return { gap, level, color, barColor, progressPct };
  }, [topResult, runnerUpResult]);

  // Contribution attribution values for the Rank 1 material selection
  const contributions = useMemo(() => {
    if (!topResult) return [];
    
    const attr = calculateAttribution(topResult.material, criteriaWeights);
    const keys = ['strength', 'weight', 'cost', 'corrosion', 'wear', 'sustainability'];
    const labels = ['Mechanical Strength', 'Weight Reduction', 'Cost Efficiency', 'Corrosion Resistance', 'Wear Resistance', 'Sustainability'];
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-yellow-500', 'bg-purple-500', 'bg-cyan-500', 'bg-teal-500'];

    return keys.map((key, idx) => ({
      label: labels[idx],
      percent: attr[key] || 0,
      colorClass: colors[idx]
    }));
  }, [topResult, criteriaWeights]);

  const [aiExplanation, setAiExplanation] = useState<{
    summary: string;
    comparison: string;
    tradeoffs: string;
    conclusion: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!topResult || !runnerUpResult) return;

    let isMounted = true;
    setLoading(true);
    setApiError(null);

    const controller = new AbortController();

    async function loadExplanation() {
      try {
        const data = await fetchExplanation(
          selectedComponent,
          topResult.material,
          runnerUpResult.material,
          topResult.score,
          runnerUpResult.score,
          criteriaWeights,
          controller.signal
        );
        if (isMounted) {
          setAiExplanation(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('Failed to load AI explanation:', err);
          if (isMounted) {
            setApiError(err.message || 'Unknown error');
            setLoading(false);
          }
        }
      }
    }

    const debounceTimer = setTimeout(() => {
      loadExplanation();
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [selectedComponent, topResult?.material?.id, runnerUpResult?.material?.id, criteriaWeights]);

  // Structured academic commentary text (fallback if API fails or is loading)
  const localExpl = useMemo(() => {
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

  const scientificExpl = aiExplanation && !loading ? aiExplanation : localExpl;

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
              <span className="text-[9px] font-mono text-slate-500 uppercase block">Stability Level</span>
              <span className={`text-sm font-extrabold font-mono ${stabilityStats.color}`}>{stabilityStats.level.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Recommendation Stability Index */}
        <div id="xai-stability-index" className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[300px]">
          <div className="w-full text-left">
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-1">
              Recommendation Stability Index
            </h4>
            <p className="text-[10px] text-slate-500 font-mono">Statistical separation between leading candidates</p>
          </div>

          {/* Clean horizontal progress bar and status */}
          <div className="w-full space-y-4 my-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-slate-400">Stability Rating</span>
              <span className={`text-xs font-extrabold font-mono uppercase tracking-wider ${stabilityStats.color}`}>
                {stabilityStats.level}
              </span>
            </div>
            
            <div className="w-full h-2.5 bg-slate-900 border border-white/5 rounded-full overflow-hidden">
              <div 
                className={`h-full ${stabilityStats.barColor} transition-all duration-1000 ease-out`}
                style={{ width: `${stabilityStats.progressPct}%` }}
              />
            </div>
          </div>

          <div className="w-full grid grid-cols-3 gap-2 border-t border-white/10 pt-4 font-mono text-center">
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">Rank #1</span>
              <span className="text-xs font-bold text-white mt-1 block">{topResult?.score.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">Rank #2</span>
              <span className="text-xs font-semibold text-slate-400 mt-1 block">{runnerUpResult?.score.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-500 uppercase block">ΔScore</span>
              <span className="text-xs font-bold text-blue-400 mt-1 block">{stabilityStats.gap.toFixed(4)}</span>
            </div>
          </div>

          <p className="text-[9.5px] text-slate-500 leading-normal mt-2 italic font-mono">
            *Stability index quantifies recommendation dominance under active weight priorities.
          </p>
        </div>

        {/* Card 3: Criteria Contributions */}
        <div id="xai-contribution-bars" className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[300px]">
          <div>
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-2">
              Criteria Contributions
            </h4>
            <p className="text-[10px] text-slate-500 font-mono">Relative attribution to Rank #1 TOPSIS score</p>
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

      {/* Rationale and Transparency Card Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Large AI Explanation Card - Academic Discussion layout */}
        <div id="ai-explanation-academic-card" className="lg:col-span-3 bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-3">
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Systematic AI Decision Rationale & Discussion
            </h4>
            {loading && (
              <div className="flex items-center gap-1.5 text-[10px] text-blue-400 font-mono animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Querying Gemini 2.5-flash...</span>
              </div>
            )}
            {!loading && apiError && (
              <div className="flex items-center gap-1.5 text-[9px] text-amber-500 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20" title={apiError}>
                <AlertTriangle className="w-3 h-3" />
                <span>Local Model Fallback (API Key Offline)</span>
              </div>
            )}
            {!loading && !apiError && aiExplanation && (
              <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>AI Rationale Synced</span>
              </div>
            )}
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 font-sans leading-relaxed ${loading ? 'opacity-40 animate-pulse select-none' : ''}`}>
            
            {/* Why Selected */}
            <div className="space-y-1 p-3 rounded bg-white/5 border border-white/10">
              <h4 className="font-mono text-[10px] font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                1. Why the Material Was Selected
              </h4>
              <p className="pt-1">{scientificExpl.summary}</p>
            </div>

            {/* Comparison */}
            <div className="space-y-1 p-3 rounded bg-white/5 border border-white/10">
              <h4 className="font-mono text-[10px] font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <GitCommit className="w-3.5 h-3.5" />
                2. Comparison With Runner-Up Material
              </h4>
              <p className="pt-1">{scientificExpl.comparison}</p>
            </div>

            {/* Trade-offs */}
            <div className="space-y-1 p-3 rounded bg-white/5 border border-white/10">
              <h4 className="font-mono text-[10px] font-black text-yellow-500 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                3. Engineering Trade-Offs
              </h4>
              <p className="pt-1">{scientificExpl.tradeoffs}</p>
            </div>

            {/* Application Specific */}
            <div className="space-y-1 p-3 rounded bg-white/5 border border-white/10">
              <h4 className="font-mono text-[10px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                4. Practical Engineering Implications
              </h4>
              <p className="pt-1">{scientificExpl.conclusion}</p>
            </div>

          </div>
        </div>

        {/* AI Explanation Source Transparency Card */}
        <div id="ai-transparency-card" className="bg-[#0B0F19]/60 border border-white/10 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-4">
              AI Explanation Source
            </h4>
            
            <div className="space-y-3 font-mono text-[10px] text-slate-400">
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span>Ranking Method</span>
                <span className="text-white font-bold">TOPSIS</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span>Explanation Engine</span>
                <span className="text-white font-bold">Gemini 2.5 Flash</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span>Dataset Size</span>
                <span className="text-white font-bold">2762 Materials</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-1.5">
                <span>Material Classes</span>
                <span className="text-white font-bold">9 Classes</span>
              </div>
              <div className="flex justify-between">
                <span>Decision Basis</span>
                <span className="text-white font-bold text-right pl-2 leading-tight">Multi-Criteria Decision Making</span>
              </div>
            </div>
          </div>

          <div className="mt-6 p-2 rounded bg-blue-500/5 border border-blue-500/10 text-[9px] text-slate-500 leading-normal text-center">
            Verifiable Decision Records • IEEE-MCDA-1204
          </div>
        </div>

      </div>

      {/* Decision Flow Diagram */}
      <div id="panel-decision-flowchart" className="bg-white/5 border border-white/10 rounded-lg p-5">
        <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-4">
          Decision Flow Pipeline
        </h4>

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2">
          {/* Step 1 */}
          <div className="flex-1 w-full bg-[#0B0F19]/60 border border-white/5 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Step 1</span>
              <span className="text-[10px] font-mono font-bold text-slate-350">User Inputs</span>
            </div>
          </div>

          <div className="text-slate-700 hidden md:block">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 2 */}
          <div className="flex-1 w-full bg-[#0B0F19]/60 border border-white/5 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Step 2</span>
              <span className="text-[10px] font-mono font-bold text-slate-350">Weight Normalization</span>
            </div>
          </div>

          <div className="text-slate-700 hidden md:block">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 3 */}
          <div className="flex-1 w-full bg-blue-950/10 border border-blue-500/25 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 rounded bg-blue-500/20 text-blue-300">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[8px] font-mono text-blue-400 uppercase block font-bold">Step 3</span>
              <span className="text-[10px] font-mono font-bold text-white">TOPSIS Engine</span>
            </div>
          </div>

          <div className="text-slate-700 hidden md:block">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 4 */}
          <div className="flex-1 w-full bg-[#0B0F19]/60 border border-white/5 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Step 4</span>
              <span className="text-[10px] font-mono font-bold text-slate-350">Material Ranking</span>
            </div>
          </div>

          <div className="text-slate-700 hidden md:block">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 5 */}
          <div className="flex-1 w-full bg-[#0B0F19]/60 border border-white/5 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[8px] font-mono text-slate-500 uppercase block font-bold">Step 5</span>
              <span className="text-[10px] font-mono font-bold text-slate-350">Gemini Explanation</span>
            </div>
          </div>

          <div className="text-slate-700 hidden md:block">
            <ArrowRight className="w-4 h-4" />
          </div>

          {/* Step 6 */}
          <div className="flex-1 w-full bg-emerald-950/10 border border-emerald-500/25 rounded-lg p-3 flex items-center gap-3">
            <div className="p-2 rounded bg-emerald-500/20 text-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[8px] font-mono text-emerald-400 uppercase block font-bold">Step 6</span>
              <span className="text-[10px] font-mono font-bold text-emerald-300">Final Recommendation</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
