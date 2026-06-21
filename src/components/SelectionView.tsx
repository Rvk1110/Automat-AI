import { useState, useMemo, useEffect, ChangeEvent } from 'react';
import { 
  ChevronDown, 
  HelpCircle, 
  Settings, 
  Layers, 
  Award, 
  Flame, 
  ShieldAlert, 
  ArrowUpDown,
  History,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip 
} from 'recharts';
import { Material, ComponentType, CriteriaWeights, TopsisResult } from '../types';
import { MATERIALS, CLASS_COLORS, COMPONENT_PROFILES } from '../data';
import { runTopsis } from '../utils';

interface SelectionViewProps {
  selectedComponent: ComponentType;
  setSelectedComponent: (component: ComponentType) => void;
  criteriaWeights: CriteriaWeights;
  setCriteriaWeights: (weights: CriteriaWeights | ((prev: CriteriaWeights) => CriteriaWeights)) => void;
  topsisRankings: TopsisResult[];
  onAddToHistory: (component: ComponentType, materialName: string, score: number) => void;
}

export default function SelectionView({
  selectedComponent,
  setSelectedComponent,
  criteriaWeights,
  setCriteriaWeights,
  topsisRankings,
  onAddToHistory
}: SelectionViewProps) {

  // Table sorting states
  const [sortField, setSortField] = useState<keyof TopsisResult | 'density' | 'strength' | 'name'>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Load default weights when the component selection is changed by user
  const handleComponentChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const comp = e.target.value as ComponentType;
    setSelectedComponent(comp);
    setCriteriaWeights(COMPONENT_PROFILES[comp].weights);
  };

  // Drag sliders - triggers real-time state updates
  const handleSliderChange = (key: keyof CriteriaWeights, value: number) => {
    setCriteriaWeights(prev => ({
      ...prev,
      [key]: parseFloat(value.toFixed(2))
    }));
  };

  // Top overall recommendation
  const topResult = topsisRankings[0];
  const runnerUpResult = topsisRankings[1];

  // Auto-record the top recommendation into the history when a highly optimal score is computed
  useEffect(() => {
    if (topResult) {
      // De-bounce or do once per selection change to prevent duplicate logs
      const timer = setTimeout(() => {
        onAddToHistory(selectedComponent, `${topResult.material.name} (${topResult.material.grade})`, topResult.score);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [selectedComponent, topResult?.material?.id]);

  // Fingerprint calculation for the currently selected best material
  const fingerprintData = useMemo(() => {
    if (!topResult) return [];
    
    const mat = topResult.material;
    
    // Normalize properties to 0-100 index for consistent signature display
    return [
      { subject: 'Tensile Strength', value: Math.round((mat.strength / 1600) * 100) },
      // Weight efficiency is scaled so lighter material is closer to 100
      { subject: 'Weight Efficiency', value: Math.round(((8.0 - mat.density) / (8.0 - 1.45)) * 100) },
      // Cost efficiency scaled so cheaper material is closer to 100
      { subject: 'Cost Efficiency', value: Math.round(((75.0 - mat.cost) / (75.0 - 1.4)) * 100) },
      { subject: 'Corrosion Shield', value: mat.corrosion * 10 },
      { subject: 'Wear Resistance', value: mat.wear * 10 },
      { subject: 'Sustainability', value: mat.sustainability * 10 }
    ];
  }, [topResult]);

  // Handle alternative sorting dynamically
  const sortedAlternatives = useMemo(() => {
    const alts = [...topsisRankings].slice(0, 5); // top 5
    
    return alts.sort((a, b) => {
      let valA: any;
      let valB: any;

      if (sortField === 'score' || sortField === 'rank') {
        valA = a[sortField as keyof TopsisResult];
        valB = b[sortField as keyof TopsisResult];
      } else if (sortField === 'density' || sortField === 'strength' || sortField === 'name') {
        valA = a.material[sortField as keyof Material];
        valB = b.material[sortField as keyof Material];
      } else {
        valA = a.score;
        valB = b.score;
      }

      if (typeof valA === 'string') {
        return sortDirection === 'asc' 
          ? valA.localeCompare(valB) 
          : valB.localeCompare(valA);
      } else {
        return sortDirection === 'asc' 
          ? valA - valB 
          : valB - valA;
      }
    });
  }, [topsisRankings, sortField, sortDirection]);

  // Sort toggle handler
  const requestSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div id="selection-view" className="space-y-6">
      
      {/* Title */}
      <div className="border-b border-blue-900/20 pb-5">
        <h1 className="font-sans font-bold text-xl text-white tracking-tight uppercase">Algorithmic Material Selection</h1>
        <p className="text-[11px] font-sans text-slate-400 mt-1">Configure importance vectors and compute optimal options dynamically using the TOPSIS engine.</p>
      </div>

      {/* Two-Column Cockpit Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Input Panel (Span 5) */}
        <div id="left-input-panel" className="lg:col-span-12 xl:col-span-5 bg-white/5 border border-white/10 rounded-lg p-4 space-y-5">
          
          {/* Component Dropdown Choice */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              01. Automotive Assembly Target
            </h4>
            <div className="relative">
              <select
                id="component-select"
                value={selectedComponent}
                onChange={handleComponentChange}
                className="w-full bg-[#0B0F19] border border-white/10 rounded py-2 px-3 text-xs text-white font-sans font-semibold appearance-none focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                {Object.keys(COMPONENT_PROFILES).map((key) => (
                  <option key={key} value={key}>
                    {key} — {COMPONENT_PROFILES[key as ComponentType].name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed pl-1 italic">
              "{COMPONENT_PROFILES[selectedComponent].description}"
            </p>
          </div>

          {/* Real-time slider metrics sliders */}
          <div className="space-y-4 pt-2 border-t border-white/5">
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              02. Importance Criteria Weights (MCDA)
            </h4>

            {/* Slider 1: Strength */}
            <div className="space-y-1" id="slider-strength-group">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-mono text-slate-400 pr-1">
                <span>Mechanical Strength</span>
                <span className="font-bold text-blue-400">{(criteriaWeights.strength * 100).toFixed(0)}%</span>
              </div>
              <input 
                id="slider-strength"
                type="range"
                min={0}
                max={1.0}
                step={0.05}
                value={criteriaWeights.strength}
                onChange={(e) => handleSliderChange('strength', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Slider 2: Weight */}
            <div className="space-y-1" id="slider-weight-group">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-mono text-slate-400 pr-1">
                <span>Mass Reduction</span>
                <span className="font-bold text-emerald-400">{(criteriaWeights.weight * 100).toFixed(0)}%</span>
              </div>
              <input 
                id="slider-weight"
                type="range"
                min={0}
                max={1.0}
                step={0.05}
                value={criteriaWeights.weight}
                onChange={(e) => handleSliderChange('weight', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Slider 3: Cost */}
            <div className="space-y-1" id="slider-cost-group">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-mono text-slate-400 pr-1">
                <span>Cost Index limit</span>
                <span className="font-bold text-yellow-400">{(criteriaWeights.cost * 100).toFixed(0)}%</span>
              </div>
              <input 
                id="slider-cost"
                type="range"
                min={0}
                max={1.0}
                step={0.05}
                value={criteriaWeights.cost}
                onChange={(e) => handleSliderChange('cost', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 accent-yellow-500 cursor-pointer"
              />
            </div>

            {/* Slider 4: Corrosion Resistance */}
            <div className="space-y-1" id="slider-corrosion-group">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-mono text-slate-400 pr-1">
                <span>Corrosion immunity</span>
                <span className="font-bold text-purple-400">{(criteriaWeights.corrosion * 100).toFixed(0)}%</span>
              </div>
              <input 
                id="slider-corrosion"
                type="range"
                min={0}
                max={1.0}
                step={0.05}
                value={criteriaWeights.corrosion}
                onChange={(e) => handleSliderChange('corrosion', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 accent-purple-500 cursor-pointer"
              />
            </div>

            {/* Slider 5: Wear Resistance */}
            <div className="space-y-1" id="slider-wear-group">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-mono text-slate-400 pr-1">
                <span>Wear resistance</span>
                <span className="font-bold text-cyan-400">{(criteriaWeights.wear * 100).toFixed(0)}%</span>
              </div>
              <input 
                id="slider-wear"
                type="range"
                min={0}
                max={1.0}
                step={0.05}
                value={criteriaWeights.wear}
                onChange={(e) => handleSliderChange('wear', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 accent-cyan-500 cursor-pointer"
              />
            </div>

            {/* Slider 6: Sustainability */}
            <div className="space-y-1" id="slider-sustainability-group">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-mono text-slate-400 pr-1">
                <span>Eco Sustainability</span>
                <span className="font-bold text-teal-400">{(criteriaWeights.sustainability * 100).toFixed(0)}%</span>
              </div>
              <input 
                id="slider-sustainability"
                type="range"
                min={0}
                max={1.0}
                step={0.05}
                value={criteriaWeights.sustainability}
                onChange={(e) => handleSliderChange('sustainability', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-800 accent-teal-500 cursor-pointer"
              />
            </div>
          </div>

          <div className="bg-[#111c3a]/30 border border-white/5 rounded p-3 text-[10px] text-slate-400 leading-relaxed font-mono">
            <span className="text-blue-400 font-bold">MCDA DECISION CORE: </span>
             Recalculates closeness coefficient indexes for all 14 options instantly using standard multi-dimensional Euclidean boundary vectors.
          </div>
        </div>

        {/* Right Column: Results Panel (Span 7) */}
        <div id="right-results-panel" className="lg:col-span-12 xl:col-span-7 space-y-6">
          
          {/* Top segment: Best recommended Card + Silhouette */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Dynamic Best Recommendation Card */}
            <div id="results-best-card" className="bg-white/5 border border-white/10 rounded-lg p-4 relative overflow-hidden flex flex-col justify-between h-[235px]">
              <div className="absolute top-0 right-0 p-3.5 bg-blue-500/10 rounded-bl">
                <Award className="w-4 h-4 text-blue-400 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest block font-bold">Rank #1 Recommendation</span>
                <h2 className="text-lg font-bold text-white uppercase mt-1.5">{topResult?.material.name}</h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">Grade: <span className="text-blue-400 font-bold">{topResult?.material.grade}</span></p>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[8px] rounded uppercase font-bold">Active Solution</span>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] rounded uppercase font-bold">Highest Proximity</span>
                </div>
                <p className="text-xs text-slate-300 mt-2.5 font-sans leading-relaxed">
                  Excellent pairing for standard <strong className="text-white">{selectedComponent}</strong> specifications.
                </p>
              </div>
              <div className="flex items-center gap-2 border-t border-white/10 pt-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">TOPSIS Score:</span>
                <span className="text-xs font-bold text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded">{topResult?.score.toFixed(4)}</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono ml-auto">Class: {topResult?.material.materialClass}</span>
              </div>
            </div>

            {/* Dynamic Component Silhouette */}
            <div id="component-silhouette-card" className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col items-center justify-between h-[235px]">
              <div className="w-full flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">{selectedComponent} Layout Silhouette</span>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CLASS_COLORS[topResult?.material.materialClass as keyof typeof CLASS_COLORS] }}></span>
              </div>

              {/* Centered Drawing SVG Silhouette */}
              <div className="w-full flex items-center justify-center p-3 h-28">
                <svg viewBox="0 0 40 40" className="w-20 h-20 transition-all duration-300" style={{ stroke: CLASS_COLORS[topResult?.material.materialClass as keyof typeof CLASS_COLORS] }}>
                  <path 
                    d={COMPONENT_PROFILES[selectedComponent].silhouetteSvgPath} 
                    fill="none" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="drop-shadow-[0_0_12px_rgba(59,130,246,0.35)]"
                  />
                </svg>
              </div>

              {/* Status footer details */}
              <div className="w-full text-center">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">Highlighted Material Family</p>
                <p className="text-xs font-bold font-sans tracking-wide mt-0.5" style={{ color: CLASS_COLORS[topResult?.material.materialClass as keyof typeof CLASS_COLORS] }}>
                  {topResult?.material.materialClass.toUpperCase()} — {topResult?.material.name}
                </p>
              </div>
            </div>

          </div>

          {/* Unique Fingerprint Radar block */}
          <div id="results-radar-fingerprint" className="bg-white/5 border border-white/10 rounded-lg p-4">
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-3">
              Dynamic Material Fingerprint signature
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
              <div className="h-[180px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="150%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={fingerprintData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={8} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={7} />
                    <Radar 
                      name={topResult?.material.name} 
                      dataKey="value" 
                      stroke={CLASS_COLORS[topResult?.material.materialClass as keyof typeof CLASS_COLORS]} 
                      fill={CLASS_COLORS[topResult?.material.materialClass as keyof typeof CLASS_COLORS]} 
                      fillOpacity={0.35} 
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Text specifications bullet grid */}
              <div className="space-y-2 font-mono text-[11px] text-slate-400">
                <p className="text-xs text-white font-sans font-bold mb-1 border-b border-white/10 pb-1">Mechanical Limits:</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  <p>Tensile Str: <span className="text-white font-bold">{topResult?.material.strength} MPa</span></p>
                  <p>Density: <span className="text-white font-bold">{topResult?.material.density} g/cc</span></p>
                  <p>Cost Index: <span className="text-white font-bold">{topResult?.material.cost} USD</span></p>
                  <p>E-Modulus: <span className="text-white font-bold">{topResult?.material.elasticModulus} GPa</span></p>
                  <p>Hardness: <span className="text-white font-bold">{topResult?.material.hardness} HB</span></p>
                </div>
                <p className="text-xs text-white font-sans font-bold mt-3 mb-1 border-b border-white/10 pb-1">Chemical Properties:</p>
                <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                  <p>Corrosion: <span className="text-white font-bold">{topResult?.material.corrosion}/10</span></p>
                  <p>Wear Resist: <span className="text-white font-bold">{topResult?.material.wear}/10</span></p>
                  <p>Eco-Sust: <span className="text-white font-bold">{topResult?.material.sustainability}/10</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Alternatives Sortable Table */}
          <div id="results-alternatives-table" className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
                Top 5 Ranked Material Candidates
              </h4>
              <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded">
                Runner-up Margin: <strong className="text-white">+{((topResult?.score - runnerUpResult?.score) * 100).toFixed(1)}%</strong>
              </span>
            </div>

            <div className="overflow-x-auto mt-4">
              <table id="table-selection-alternatives" className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    <th className="py-2.5 pl-2 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('rank')}>
                      Rank <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                    </th>
                    <th className="py-2.5 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('name')}>
                      Material Name <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                    </th>
                    <th className="py-2.5">Class Designation</th>
                    <th className="py-2.5 text-right cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('score')}>
                      TOPSIS score <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                    </th>
                    <th className="py-2.5 text-right cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('density')}>
                      Density (g/cc) <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                    </th>
                    <th className="py-2.5 text-right pr-2 cursor-pointer hover:text-white transition-colors" onClick={() => requestSort('strength')}>
                      Strength (MPa) <ArrowUpDown className="inline w-3 h-3 ml-0.5" />
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {sortedAlternatives.map((res, index) => {
                    const isBest = res.rank === 1;
                    return (
                      <tr 
                        key={res.material.id} 
                        className={`transition-colors ${isBest ? 'bg-blue-600/10 font-semibold text-white' : 'text-slate-300 hover:bg-white/5'}`}
                      >
                        <td className="py-3 pl-2 font-mono">
                          {isBest ? (
                            <span className="flex items-center gap-1 text-blue-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
                              #1
                            </span>
                          ) : `#${res.rank}`}
                        </td>
                        <td className="py-3 font-medium">
                          {res.material.name} 
                          <span className="text-[10px] font-mono text-slate-500 block">{res.material.grade}</span>
                        </td>
                        <td className="py-3">
                          <span 
                            className="inline-block w-2.5 h-2.5 rounded-full mr-2" 
                            style={{ backgroundColor: CLASS_COLORS[res.material.materialClass] }}
                          />
                          <span className="text-slate-400 text-[11px] font-mono">{res.material.materialClass}</span>
                        </td>
                        <td className="py-3 text-right">
                          <span className={`font-mono px-2 py-0.5 rounded text-[11px] ${isBest ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-800 text-slate-400'}`}>
                            {res.score.toFixed(4)}
                          </span>
                        </td>
                        <td className="py-3 text-right font-mono text-slate-400">{res.material.density.toFixed(2)}</td>
                        <td className="py-3 text-right font-mono text-slate-400 pr-2">{res.material.strength}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
