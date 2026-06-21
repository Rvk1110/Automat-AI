import { useState, useMemo, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Legend, 
  Tooltip 
} from 'recharts';
import { 
  Fingerprint, 
  Search, 
  Plus, 
  X, 
  Layers, 
  Sliders, 
  Scale, 
  RefreshCw, 
  Info,
  Check
} from 'lucide-react';
import { Material, ComponentType, CriteriaWeights, TopsisResult } from '../types';
import { MATERIALS, CLASS_COLORS, COMPONENT_PROFILES } from '../data';
import { runTopsis } from '../utils';

interface MaterialFingerprintProps {
  selectedComponent: ComponentType;
  setSelectedComponent: (component: ComponentType) => void;
  criteriaWeights: CriteriaWeights;
  setCriteriaWeights: (weights: CriteriaWeights) => void;
  topsisRankings: TopsisResult[];
}

export default function MaterialFingerprint({
  selectedComponent,
  setSelectedComponent,
  criteriaWeights,
  setCriteriaWeights,
  topsisRankings
}: MaterialFingerprintProps) {
  
  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('All');
  
  // Available material classes for filtering
  const materialClasses = useMemo(() => {
    return Array.from(new Set(MATERIALS.map(m => m.materialClass)));
  }, []);

  // Initialize with top 3 recommended materials from TOPSIS if empty
  useEffect(() => {
    if (selectedCompareIds.length === 0 && topsisRankings.length > 0) {
      setSelectedCompareIds(topsisRankings.slice(0, 3).map(r => r.material.id));
    }
  }, [topsisRankings]);

  // Load top 3 recommendations of current TOPSIS configuration
  const handleLoadTop3 = () => {
    setSelectedCompareIds(topsisRankings.slice(0, 3).map(r => r.material.id));
  };

  // Resolve compared material objects
  const comparedMaterials = useMemo(() => {
    return selectedCompareIds
      .map(id => MATERIALS.find(m => m.id === id))
      .filter((m): m is Material => !!m);
  }, [selectedCompareIds]);

  // Toggle material comparison
  const handleToggleCompare = (materialId: string) => {
    setSelectedCompareIds(prev => {
      if (prev.includes(materialId)) {
        return prev.filter(id => id !== materialId);
      } else {
        if (prev.length >= 6) return prev; // Limit comparison to 6 for chart readability
        return [...prev, materialId];
      }
    });
  };

  // Search filtered materials (max 8 for autocomplete list dropdown)
  const searchResults = useMemo(() => {
    if (!searchQuery && classFilter === 'All') return [];
    
    return MATERIALS.filter(mat => {
      const matchesSearch = searchQuery ? (
        mat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mat.grade.toLowerCase().includes(searchQuery.toLowerCase())
      ) : true;
      
      const matchesClass = classFilter !== 'All' ? mat.materialClass === classFilter : true;
      
      return matchesSearch && matchesClass;
    }).slice(0, 8);
  }, [searchQuery, classFilter]);

  // Dimensions configuration for normalization
  const dimensions = useMemo(() => [
    { key: 'strength', label: 'Strength' },
    { key: 'weightEff', label: 'Weight Efficiency' },
    { key: 'costEff', label: 'Cost Efficiency' },
    { key: 'corrosion', label: 'Corrosion Shield' },
    { key: 'wear', label: 'Wear Resistance' },
    { key: 'sustainability', label: 'Sustainability' }
  ], []);

  // Compute multi-series chart data for comparative radar
  const radarChartData = useMemo(() => {
    return dimensions.map(dim => {
      const row: any = { subject: dim.label };
      comparedMaterials.forEach(mat => {
        let val = 0;
        if (dim.key === 'strength') {
          val = Math.min(100, Math.round((mat.strength / 1600) * 100));
        } else if (dim.key === 'weightEff') {
          val = Math.min(100, Math.max(0, Math.round(((8.0 - mat.density) / (8.0 - 1.45)) * 100)));
        } else if (dim.key === 'costEff') {
          val = Math.min(100, Math.max(0, Math.round(((75.0 - mat.cost) / (75.0 - 1.4)) * 100)));
        } else if (dim.key === 'corrosion') {
          val = mat.corrosion * 10;
        } else if (dim.key === 'wear') {
          val = mat.wear * 10;
        } else if (dim.key === 'sustainability') {
          val = mat.sustainability * 10;
        }
        row[`val_${mat.id}`] = val;
      });
      return row;
    });
  }, [comparedMaterials, dimensions]);

  // Individual material normalization helper
  const getSingleMaterialNormalized = (mat: Material) => {
    return {
      strength: Math.min(100, Math.round((mat.strength / 1600) * 100)),
      weightEff: Math.min(100, Math.max(0, Math.round(((8.0 - mat.density) / (8.0 - 1.45)) * 100))),
      costEff: Math.min(100, Math.max(0, Math.round(((75.0 - mat.cost) / (75.0 - 1.4)) * 100))),
      corrosion: mat.corrosion * 10,
      wear: mat.wear * 10,
      sustainability: mat.sustainability * 10,
    };
  };

  // Adjust specific weight slider locally
  const handleWeightChange = (key: keyof CriteriaWeights, value: number) => {
    const updated = { ...criteriaWeights, [key]: value };
    // Normalize sum to 1.0
    const total = Object.values(updated).reduce((sum, w) => sum + w, 0);
    const normalized = Object.keys(updated).reduce((acc, k) => {
      acc[k as keyof CriteriaWeights] = parseFloat((updated[k as keyof CriteriaWeights] / total).toFixed(4));
      return acc;
    }, {} as CriteriaWeights);
    
    setCriteriaWeights(normalized);
  };

  // Presets trigger from component profiles
  const handlePresetSelect = (comp: ComponentType) => {
    setSelectedComponent(comp);
    setCriteriaWeights(COMPONENT_PROFILES[comp].weights);
  };

  return (
    <div id="material-fingerprint-view" className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-900/20 pb-5">
        <div>
          <h1 className="font-sans font-bold text-xl text-white tracking-tight uppercase flex items-center gap-2.5">
            <Fingerprint className="w-5 h-5 text-blue-400" />
            Material Fingerprint Analysis
          </h1>
          <p className="text-[11px] font-sans text-slate-400 mt-1">
            Visual fingerprint modeling. Multi-criteria performance radar shapes define the unique identifier of automotive engineering candidates.
          </p>
        </div>
        <button 
          onClick={handleLoadTop3}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] uppercase font-bold tracking-wider transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset to Top 3 recommendations
        </button>
      </div>

      {/* Control Area: Component Weights and Full Search Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Parameters and Material Selection Search */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Component Presets & Active Sliders */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
            <div>
              <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
                MCDA Profile Presets
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Toggle weights based on component assembly requirements.</p>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {Object.keys(COMPONENT_PROFILES).map((key) => (
                <button
                  key={key}
                  onClick={() => handlePresetSelect(key as ComponentType)}
                  className={`px-2.5 py-1 rounded text-[10px] font-semibold border transition-all duration-200 cursor-pointer ${
                    selectedComponent === key
                      ? 'bg-blue-600/10 border-blue-500 text-blue-400'
                      : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            <div className="border-t border-white/5 pt-3 space-y-2.5">
              <span className="text-[10px] font-mono text-slate-450 uppercase block">Adjust Importances (Real-time TOPSIS recalculation)</span>
              {Object.entries(criteriaWeights).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span className="capitalize text-slate-400">{key === 'weight' ? 'Weight Red.' : key}</span>
                    <span className="text-blue-400 font-bold">{(val * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="0.80"
                    step="0.05"
                    value={val}
                    onChange={(e) => handleWeightChange(key as keyof CriteriaWeights, parseFloat(e.target.value))}
                    className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Search Engine for 2700+ materials */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4 relative">
            <div>
              <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
                Add Material to Arena
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Search all available items and overlay them on the fingerprint chart.</p>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by name or grade (e.g. Al, Steel, Grade)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0B0F19] border border-white/10 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>

              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="bg-[#0B0F19] border border-white/10 rounded px-2 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50 max-w-[120px]"
              >
                <option value="All">All Categories</option>
                {materialClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>
            </div>

            {/* Results Autocomplete Popover */}
            {searchResults.length > 0 && (
              <div className="absolute left-4 right-4 bg-[#0B0F19] border border-white/10 rounded shadow-2xl z-20 divide-y divide-white/5 max-h-[220px] overflow-y-auto">
                {searchResults.map((mat) => {
                  const isCompared = selectedCompareIds.includes(mat.id);
                  return (
                    <div 
                      key={mat.id}
                      className="flex items-center justify-between p-2 text-xs hover:bg-white/5 transition-colors"
                    >
                      <div className="truncate pr-4">
                        <span className="font-semibold text-slate-200">{mat.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 ml-1.5">{mat.grade}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded ml-2" style={{ color: CLASS_COLORS[mat.materialClass], backgroundColor: `${CLASS_COLORS[mat.materialClass]}10`, border: `1px solid ${CLASS_COLORS[mat.materialClass]}20` }}>
                          {mat.materialClass}
                        </span>
                      </div>
                      <button
                        onClick={() => handleToggleCompare(mat.id)}
                        disabled={!isCompared && selectedCompareIds.length >= 6}
                        className={`p-1 rounded cursor-pointer transition-colors flex items-center justify-center ${
                          isCompared 
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                            : 'bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 disabled:opacity-30 disabled:cursor-not-allowed'
                        }`}
                        title={isCompared ? 'Remove' : 'Add to compare'}
                      >
                        {isCompared ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Comparative Radar Arena */}
        <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col h-[460px]">
          <div className="flex justify-between items-center border-b border-white/5 pb-3">
            <div>
              <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
                Comparative Fingerprint Arena
              </h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Multi-series radar profile overlay. Maximum 6 materials.</p>
            </div>
            <div className="text-[9px] font-mono text-slate-500 uppercase">
              Comparing: {comparedMaterials.length} / 6
            </div>
          </div>

          <div className="flex-1 min-h-[300px] flex items-center justify-center relative mt-2">
            {comparedMaterials.length === 0 ? (
              <div className="text-center space-y-2">
                <Info className="w-8 h-8 text-slate-650 mx-auto" />
                <p className="text-xs text-slate-500">No materials selected for validation. Add items to render radar charts.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                  <PolarGrid stroke="#1e293b" />
                  <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                  
                  {comparedMaterials.map((mat) => (
                    <Radar
                      key={mat.id}
                      name={`${mat.name} (${mat.grade})`}
                      dataKey={`val_${mat.id}`}
                      stroke={CLASS_COLORS[mat.materialClass]}
                      fill={CLASS_COLORS[mat.materialClass]}
                      fillOpacity={0.12}
                      animationDuration={600}
                    />
                  ))}
                  
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#0B0F19] border border-white/10 p-3 rounded shadow-2xl space-y-1.5">
                            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase">{payload[0].payload.subject}</p>
                            <div className="space-y-1 max-h-[150px] overflow-y-auto pr-1">
                              {payload.map((entry: any) => {
                                const matId = entry.dataKey.split('val_')[1];
                                const mat = comparedMaterials.find(m => m.id === matId);
                                if (!mat) return null;
                                return (
                                  <div key={entry.dataKey} className="flex items-center gap-4 justify-between text-xs font-mono">
                                    <span className="text-slate-300 truncate max-w-[120px]" style={{ color: CLASS_COLORS[mat.materialClass] }}>
                                      {mat.name} ({mat.grade})
                                    </span>
                                    <span className="text-white font-bold">{entry.value}%</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', color: '#94a3b8', paddingTop: '10px' }} />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* Comparison Tray List */}
      {comparedMaterials.length > 0 && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
          <span className="text-[10px] font-mono text-slate-450 uppercase tracking-wide block">Active Candidates ({comparedMaterials.length})</span>
          <div className="flex flex-wrap gap-2.5">
            {comparedMaterials.map((mat) => (
              <div 
                key={mat.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border text-xs"
                style={{ 
                  borderColor: `${CLASS_COLORS[mat.materialClass]}40`,
                  backgroundColor: `${CLASS_COLORS[mat.materialClass]}08`
                }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CLASS_COLORS[mat.materialClass] }}></span>
                <span className="font-semibold text-slate-200">{mat.name}</span>
                <span className="text-[10px] font-mono text-slate-500">{mat.grade}</span>
                <button
                  onClick={() => handleToggleCompare(mat.id)}
                  className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors ml-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Side-by-Side Fingerprint Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {comparedMaterials.map((mat) => {
          const norm = getSingleMaterialNormalized(mat);
          const miniRadarData = [
            { subject: 'STR', value: norm.strength },
            { subject: 'WGT', value: norm.weightEff },
            { subject: 'CST', value: norm.costEff },
            { subject: 'COR', value: norm.corrosion },
            { subject: 'WER', value: norm.wear },
            { subject: 'SUS', value: norm.sustainability }
          ];

          return (
            <div 
              key={mat.id}
              className="bg-white/5 border rounded-lg p-4.5 flex flex-col justify-between relative overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:bg-white/8"
              style={{ borderColor: `${CLASS_COLORS[mat.materialClass]}30` }}
            >
              {/* Top Row: Name and badge */}
              <div className="space-y-1 border-b border-white/5 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-bold font-sans text-white truncate max-w-[140px]" title={mat.name}>
                    {mat.name}
                  </h3>
                  <span 
                    className="text-[9px] font-mono px-2 py-0.5 rounded border uppercase flex-shrink-0"
                    style={{ 
                      color: CLASS_COLORS[mat.materialClass],
                      borderColor: `${CLASS_COLORS[mat.materialClass]}30`,
                      backgroundColor: `${CLASS_COLORS[mat.materialClass]}10`
                    }}
                  >
                    {mat.materialClass}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400">Grade ID: <strong className="text-slate-200">{mat.grade}</strong></p>
              </div>

              {/* Middle Row: Mini Radar Chart & Numeric Specs */}
              <div className="grid grid-cols-12 gap-3 py-3 items-center">
                
                {/* Mini radar visualization */}
                <div className="col-span-5 h-[95px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={miniRadarData}>
                      <PolarGrid stroke="#334155" strokeWidth={0.5} />
                      <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={7} />
                      <Radar
                        name={mat.name}
                        dataKey="value"
                        stroke={CLASS_COLORS[mat.materialClass]}
                        fill={CLASS_COLORS[mat.materialClass]}
                        fillOpacity={0.25}
                        animationDuration={500}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Raw values stats */}
                <div className="col-span-7 space-y-1.5 text-[10px] font-mono text-slate-400 pl-1.5 border-l border-white/5">
                  <div className="flex justify-between">
                    <span>Density:</span>
                    <strong className="text-slate-200">{mat.density} g/cc</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Strength:</span>
                    <strong className="text-slate-200">{mat.strength} MPa</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost Score:</span>
                    <strong className="text-slate-200">{mat.cost} idx</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Elastic Mod:</span>
                    <strong className="text-slate-200">{mat.elasticModulus} GPa</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Hardness:</span>
                    <strong className="text-slate-200">{mat.hardness} HB</strong>
                  </div>
                </div>

              </div>

              {/* Bottom Row: Detailed progress normalized scores */}
              <div className="border-t border-white/5 pt-3.5 space-y-2 text-[9px] font-mono text-slate-400">
                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span>Strength Efficiency</span>
                    <span className="text-slate-200 font-bold">{norm.strength}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${norm.strength}%`, backgroundColor: CLASS_COLORS[mat.materialClass] }}></div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span>Weight Efficiency</span>
                    <span className="text-slate-200 font-bold">{norm.weightEff}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${norm.weightEff}%`, backgroundColor: CLASS_COLORS[mat.materialClass] }}></div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span>Cost Efficiency</span>
                    <span className="text-slate-200 font-bold">{norm.costEff}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${norm.costEff}%`, backgroundColor: CLASS_COLORS[mat.materialClass] }}></div>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <div className="flex justify-between">
                    <span>Eco Sustainability</span>
                    <span className="text-slate-200 font-bold">{norm.sustainability}%</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${norm.sustainability}%`, backgroundColor: CLASS_COLORS[mat.materialClass] }}></div>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
