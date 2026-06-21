import { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  Cell
} from 'recharts';
import { 
  Sliders, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  Info,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { Material, ComponentType, CriteriaWeights, TopsisResult } from '../types';
import { MATERIALS, COMPONENT_PROFILES } from '../data';
import { runTopsis } from '../services/topsis_service';

interface SensitivityAnalysisViewProps {
  selectedComponent: ComponentType;
  setSelectedComponent: (component: ComponentType) => void;
  criteriaWeights: CriteriaWeights;
  setCriteriaWeights: (weights: CriteriaWeights) => void;
  topsisRankings: TopsisResult[];
}

export default function SensitivityAnalysisView({
  selectedComponent,
  setSelectedComponent,
  criteriaWeights,
  setCriteriaWeights,
  topsisRankings
}: SensitivityAnalysisViewProps) {
  
  const [focusCriterion, setFocusCriterion] = useState<keyof CriteriaWeights>('strength');

  const criteriaKeys = useMemo<(keyof CriteriaWeights)[]>(
    () => ['strength', 'weight', 'cost', 'corrosion', 'wear', 'sustainability'],
    []
  );

  // Compute Tornado Chart Data
  const tornadoData = useMemo(() => {
    if (topsisRankings.length === 0) return [];
    
    const baseTopResult = topsisRankings[0];
    const baseTopMat = baseTopResult.material;
    const baseScore = baseTopResult.score;

    return criteriaKeys.map(targetKey => {
      // 1. Vary targetKey up by +0.15
      const weightsPlus = { ...criteriaWeights };
      weightsPlus[targetKey] = Math.min(0.95, weightsPlus[targetKey] + 0.15);
      const totalPlus = criteriaKeys.reduce((s, k) => s + weightsPlus[k], 0);
      criteriaKeys.forEach(k => weightsPlus[k] /= totalPlus);
      const rankingsPlus = runTopsis(MATERIALS, weightsPlus);
      const scorePlus = rankingsPlus.find(r => r.material.id === baseTopMat.id)?.score || baseScore;

      // 2. Vary targetKey down by -0.15
      const weightsMinus = { ...criteriaWeights };
      weightsMinus[targetKey] = Math.max(0.01, weightsMinus[targetKey] - 0.15);
      const totalMinus = criteriaKeys.reduce((s, k) => s + weightsMinus[k], 0);
      criteriaKeys.forEach(k => weightsMinus[k] /= totalMinus);
      const rankingsMinus = runTopsis(MATERIALS, weightsMinus);
      const scoreMinus = rankingsMinus.find(r => r.material.id === baseTopMat.id)?.score || baseScore;

      return {
        rawName: targetKey,
        name: targetKey === 'weight' ? 'Weight Red.' : targetKey.charAt(0).toUpperCase() + targetKey.slice(1),
        'Low (-0.15)': parseFloat((scoreMinus - baseScore).toFixed(4)),
        'High (+0.15)': parseFloat((scorePlus - baseScore).toFixed(4)),
        spread: Math.abs(scorePlus - scoreMinus)
      };
    }).sort((a, b) => b.spread - a.spread);
  }, [criteriaWeights, topsisRankings, criteriaKeys]);

  // Compute Rank Evolution Chart Data
  const rankEvolutionData = useMemo(() => {
    const steps = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    
    // Track current top 5 candidates
    const baseTop5 = topsisRankings.slice(0, 5).map(r => r.material);

    return steps.map(val => {
      const tempWeights = { ...criteriaWeights };
      tempWeights[focusCriterion] = val;
      
      const otherKeys = criteriaKeys.filter(k => k !== focusCriterion);
      const sumOtherBase = otherKeys.reduce((s, k) => s + criteriaWeights[k], 0) || 1;
      const remainder = 1 - val;
      
      criteriaKeys.forEach(k => {
        if (k === focusCriterion) {
          tempWeights[k] = val;
        } else {
          tempWeights[k] = remainder > 0 ? (criteriaWeights[k] / sumOtherBase) * remainder : 0;
        }
      });

      const stepRankings = runTopsis(MATERIALS, tempWeights);
      const row: any = { step: `${Math.round(val * 100)}%` };
      
      baseTop5.forEach(mat => {
        const item = stepRankings.find(r => r.material.id === mat.id);
        row[mat.name] = item ? item.rank : 30; // default to low rank if out of bounds
      });

      return row;
    });
  }, [focusCriterion, criteriaWeights, topsisRankings, criteriaKeys]);

  // Compute Confidence Variation Chart Data
  const confidenceVariationData = useMemo(() => {
    const steps = [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

    return steps.map(val => {
      const tempWeights = { ...criteriaWeights };
      tempWeights[focusCriterion] = val;
      
      const otherKeys = criteriaKeys.filter(k => k !== focusCriterion);
      const sumOtherBase = otherKeys.reduce((s, k) => s + criteriaWeights[k], 0) || 1;
      const remainder = 1 - val;
      
      criteriaKeys.forEach(k => {
        if (k === focusCriterion) {
          tempWeights[k] = val;
        } else {
          tempWeights[k] = remainder > 0 ? (criteriaWeights[k] / sumOtherBase) * remainder : 0;
        }
      });

      const stepRankings = runTopsis(MATERIALS, tempWeights);
      const gap = stepRankings.length >= 2 ? (stepRankings[0].score - stepRankings[1].score) : 0;
      return {
        step: `${Math.round(val * 100)}%`,
        'Confidence Gap': parseFloat(gap.toFixed(4))
      };
    });
  }, [focusCriterion, criteriaWeights, criteriaKeys]);

  // Check for large rank changes from baseline profile
  const baselineTop = useMemo(() => {
    const profile = COMPONENT_PROFILES[selectedComponent];
    if (!profile) return null;
    const baseRanks = runTopsis(MATERIALS, profile.weights);
    return baseRanks[0]?.material;
  }, [selectedComponent]);

  const activeTop = topsisRankings[0]?.material;
  const isRankShifted = baselineTop && activeTop && baselineTop.id !== activeTop.id;

  // Radar weights data
  const radarWeightsData = useMemo(() => {
    return criteriaKeys.map(k => ({
      subject: k === 'weight' ? 'Weight Red.' : k.charAt(0).toUpperCase() + k.slice(1),
      value: Math.round(criteriaWeights[k] * 100)
    }));
  }, [criteriaWeights, criteriaKeys]);

  const handleSliderChange = (key: keyof CriteriaWeights, val: number) => {
    const updated = { ...criteriaWeights, [key]: val };
    const total = criteriaKeys.reduce((s, k) => s + updated[k], 0) || 1;
    const normalized = criteriaKeys.reduce((acc, k) => {
      acc[k] = parseFloat((updated[k] / total).toFixed(4));
      return acc;
    }, {} as CriteriaWeights);
    
    setCriteriaWeights(normalized);
  };

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div id="sensitivity-analysis-view" className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-900/20 pb-5">
        <div>
          <h1 className="font-sans font-bold text-xl text-white tracking-tight uppercase flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-blue-400" />
            Live Sensitivity Laboratory
          </h1>
          <p className="text-[11px] font-sans text-slate-400 mt-1">
            Real-time sensitivity analysis. Adjust criteria importance vectors to inspect TOPSIS boundary shifts, rank evolution curves, and statistical deltas.
          </p>
        </div>
      </div>

      {/* Interactive Alerts */}
      {isRankShifted && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded p-4 flex gap-3 items-center">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 animate-bounce" />
          <div className="text-xs">
            <span className="font-bold text-white uppercase block">Rank #1 Material Shift Detected!</span>
            <p className="text-slate-400 mt-0.5">
              Current weight adjustments have overridden the standard baseline recommended material <strong className="text-amber-400 font-bold">{baselineTop?.name}</strong>, ranking <strong className="text-emerald-400 font-bold">{activeTop?.name}</strong> as the optimal solution.
            </p>
          </div>
        </div>
      )}

      {/* Main Cockpit Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sliders Controller (col 4) */}
        <div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
          <div>
            <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Weight Adjusters
            </h2>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">Vary criteria importances directly to witness vector dynamics.</p>
          </div>

          <div className="space-y-3.5">
            {criteriaKeys.map(k => (
              <div key={k} className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="capitalize text-slate-400">{k === 'weight' ? 'Weight Red.' : k}</span>
                  <span className="text-blue-400 font-bold">{(criteriaWeights[k] * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.80"
                  step="0.01"
                  value={criteriaWeights[k]}
                  onChange={(e) => handleSliderChange(k, parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            ))}
          </div>

          <div className="border-t border-white/5 pt-4 space-y-3">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase block">Selected Focus Parameter (Vary 0%-100% below)</span>
              <select
                value={focusCriterion}
                onChange={(e) => setFocusCriterion(e.target.value as keyof CriteriaWeights)}
                className="w-full bg-[#0B0F19] border border-white/10 rounded p-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 mt-1"
              >
                {criteriaKeys.map(k => (
                  <option key={k} value={k}>
                    {k === 'weight' ? 'Weight Reduction' : k.charAt(0).toUpperCase() + k.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tornado Chart & Spider Weight (col 8) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Tornado Spread */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[360px]">
            <div>
              <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
                TOPSIS Tornado Chart
              </h2>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">
                Varies weights individually by +/- 0.15. Displays delta effect on Rank #1 TOPSIS score.
              </p>
            </div>
            
            <div className="flex-1 min-h-[220px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tornadoData} layout="vertical" margin={{ top: 5, right: 10, bottom: -10, left: 15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" stroke="#64748b" fontSize={9} tickFormatter={(v) => v.toFixed(3)} />
                  <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={9} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '9px' }} />
                  <Bar dataKey="Low (-0.15)" fill="#ef4444" radius={[4, 0, 0, 4]} />
                  <Bar dataKey="High (+0.15)" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Spider weights radar */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[360px]">
            <div>
              <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
                Weight Vector Distribution
              </h2>
              <p className="text-[10px] text-slate-400 mt-1 font-sans">Visual proportion map of current MCDA criteria weights.</p>
            </div>
            
            <div className="flex-1 min-h-[220px] flex items-center justify-center mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarWeightsData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                  <Radar 
                    name="Importance Weight (%)" 
                    dataKey="value" 
                    stroke="#3b82f6" 
                    fill="#3b82f6" 
                    fillOpacity={0.25} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* Row 2: Rank Evolution & Confidence Variation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Rank Evolution Curve (inverted line chart) */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[360px]">
          <div>
            <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Rank Evolution Curve
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">
              Traces rank changes for top 5 candidates as <span className="text-blue-400 font-bold uppercase">{focusCriterion === 'weight' ? 'Weight Red.' : focusCriterion}</span> weight scales from 0% to 100%. (Rank 1 at top).
            </p>
          </div>

          <div className="flex-1 min-h-[220px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rankEvolutionData} margin={{ top: 5, right: 10, bottom: -10, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="step" stroke="#64748b" fontSize={9} />
                {/* Invert the YAxis: 1 is top, 20 is bottom */}
                <YAxis reversed domain={[1, 15]} stroke="#64748b" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px' }} />
                {topsisRankings.slice(0, 5).map((r, idx) => (
                  <Line
                    key={r.material.id}
                    type="monotone"
                    dataKey={r.material.name}
                    stroke={colors[idx % colors.length]}
                    strokeWidth={2}
                    dot={{ r: 2 }}
                    activeDot={{ r: 5 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Confidence Gap Variation */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[360px]">
          <div>
            <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Confidence Gap Sensitivity Profile
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">
              Measures score separation (ΔS = Rank 1 - Rank 2) as <span className="text-blue-400 font-bold uppercase">{focusCriterion === 'weight' ? 'Weight Red.' : focusCriterion}</span> weight varies from 0% to 100%. Higher separation represents more stable choices.
            </p>
          </div>

          <div className="flex-1 min-h-[220px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={confidenceVariationData} margin={{ top: 5, right: 10, bottom: -10, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="step" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '9px' }} />
                <Line
                  type="monotone"
                  dataKey="Confidence Gap"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
