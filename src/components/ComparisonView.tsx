import { useState, useMemo, useEffect, useRef } from 'react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  Tooltip, 
  Legend, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  Search, 
  Plus, 
  X, 
  Layers, 
  Flame, 
  Activity, 
  Leaf, 
  ShieldCheck, 
  Sparkles, 
  Info,
  Sliders,
  DollarSign
} from 'lucide-react';
import { Material } from '../types';
import { MATERIALS, CLASS_COLORS } from '../data';

export default function ComparisonView() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [activeChartTab, setActiveChartTab] = useState<'radar' | 'heatmap' | 'bubble' | 'ashby' | 'parallel'>('radar');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load first 3 materials as default if empty
  useMemo(() => {
    if (selectedIds.length === 0 && MATERIALS.length > 0) {
      // Find a steel, aluminum, and GFRP/CFRP to compare
      const defaultIds = [
        MATERIALS.find(m => m.materialClass === 'Steel')?.id,
        MATERIALS.find(m => m.materialClass === 'Aluminum Alloys')?.id,
        MATERIALS.find(m => m.materialClass === 'Glass Fiber Reinforced Polymer')?.id
      ].filter((id): id is string => !!id);
      
      setSelectedIds(defaultIds);
    }
  }, []);

  const comparedMaterials = useMemo(() => {
    return selectedIds
      .map(id => MATERIALS.find(m => m.id === id))
      .filter((m): m is Material => !!m);
  }, [selectedIds]);

  const toggleSelectMaterial = (id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(mid => mid !== id);
      } else {
        if (prev.length >= 5) return prev; // Limit to 5
        // Clear search, filter and close popover
        setSearchQuery('');
        setClassFilter('All');
        setShowDropdown(false);
        return [...prev, id];
      }
    });
  };

  const filteredSearch = useMemo(() => {
    if (!searchQuery && classFilter === 'All') return [];
    return MATERIALS.filter(mat => {
      const matchText = searchQuery ? (
        mat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mat.grade.toLowerCase().includes(searchQuery.toLowerCase())
      ) : true;
      const matchClass = classFilter !== 'All' ? mat.materialClass === classFilter : true;
      return matchText && matchClass;
    }).slice(0, 8);
  }, [searchQuery, classFilter]);

  const materialClasses = useMemo(() => {
    return Array.from(new Set(MATERIALS.map(m => m.materialClass)));
  }, []);

  // Compute "best" values in comparison set
  const bestValues = useMemo(() => {
    if (comparedMaterials.length === 0) return {} as any;
    
    return {
      density: Math.min(...comparedMaterials.map(m => m.density)),
      strength: Math.max(...comparedMaterials.map(m => m.strength)),
      cost: Math.min(...comparedMaterials.map(m => m.cost)),
      corrosion: Math.max(...comparedMaterials.map(m => m.corrosion)),
      wear: Math.max(...comparedMaterials.map(m => m.wear)),
      sustainability: Math.max(...comparedMaterials.map(m => m.sustainability)),
      elasticModulus: Math.max(...comparedMaterials.map(m => m.elasticModulus)),
      hardness: Math.max(...comparedMaterials.map(m => m.hardness))
    };
  }, [comparedMaterials]);

  // Normalized dimensions mapping helper
  const normalizeProp = (val: number, key: string) => {
    if (key === 'strength') return Math.min(100, Math.round((val / 1600) * 100));
    if (key === 'density') return Math.min(100, Math.max(0, Math.round(((8.0 - val) / (8.0 - 1.45)) * 100)));
    if (key === 'cost') return Math.min(100, Math.max(0, Math.round(((75.0 - val) / (75.0 - 1.4)) * 100)));
    return val * 10;
  };

  // Chart Data: Radar Chart (overlaid fingerprints)
  const radarChartData = useMemo(() => {
    const dimensions = [
      { key: 'strength', label: 'Strength' },
      { key: 'density', label: 'Weight Eff.' },
      { key: 'cost', label: 'Cost Eff.' },
      { key: 'corrosion', label: 'Corrosion' },
      { key: 'wear', label: 'Wear' },
      { key: 'sustainability', label: 'Sustainability' }
    ];

    return dimensions.map(dim => {
      const row: any = { subject: dim.label };
      comparedMaterials.forEach(m => {
        row[`val_${m.id}`] = normalizeProp(m[dim.key as keyof Material] as number, dim.key);
      });
      return row;
    });
  }, [comparedMaterials]);

  // Chart Data: Parallel Coordinates
  const parallelData = useMemo(() => {
    const dimensions = ['Strength', 'Weight Eff.', 'Cost Eff.', 'Corrosion', 'Wear', 'Sustainability'];
    return dimensions.map(dim => {
      const row: any = { name: dim };
      comparedMaterials.forEach(m => {
        let val = 0;
        if (dim === 'Strength') val = normalizeProp(m.strength, 'strength');
        else if (dim === 'Weight Eff.') val = normalizeProp(m.density, 'density');
        else if (dim === 'Cost Eff.') val = normalizeProp(m.cost, 'cost');
        else if (dim === 'Corrosion') val = m.corrosion * 10;
        else if (dim === 'Wear') val = m.wear * 10;
        else if (dim === 'Sustainability') val = m.sustainability * 10;
        
        row[m.name] = val;
      });
      return row;
    });
  }, [comparedMaterials]);

  // Chart Data: Heatmap Matrix
  const heatmapData = useMemo(() => {
    const props = [
      { key: 'density', label: 'Weight Eff.' },
      { key: 'strength', label: 'Strength' },
      { key: 'cost', label: 'Cost Eff.' },
      { key: 'corrosion', label: 'Corrosion' },
      { key: 'wear', label: 'Wear' },
      { key: 'sustainability', label: 'Sustainability' }
    ];

    return comparedMaterials.map(m => {
      return {
        materialName: `${m.name} (${m.grade})`,
        materialClass: m.materialClass,
        scores: props.map(p => ({
          label: p.label,
          val: normalizeProp(m[p.key as keyof Material] as number, p.key)
        }))
      };
    });
  }, [comparedMaterials]);

  // Chart Data: Ashby Coordinates (Elastic Modulus vs Density)
  const ashbyScatterData = useMemo(() => {
    return comparedMaterials.map(m => ({
      name: `${m.name} (${m.grade})`,
      density: m.density,
      elasticModulus: m.elasticModulus,
      class: m.materialClass,
      color: CLASS_COLORS[m.materialClass]
    }));
  }, [comparedMaterials]);

  // Chart Data: Bubble Chart Coordinates (Strength vs Density, bubble size is Sustainability)
  const bubbleChartData = useMemo(() => {
    return comparedMaterials.map(m => ({
      name: `${m.name} (${m.grade})`,
      density: m.density,
      strength: m.strength,
      sustainability: m.sustainability,
      color: CLASS_COLORS[m.materialClass]
    }));
  }, [comparedMaterials]);

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  return (
    <div id="material-comparison-laboratory" className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-900/20 pb-5">
        <div>
          <h1 className="font-sans font-bold text-xl text-white tracking-tight uppercase flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-blue-400" />
            Material Comparison Laboratory
          </h1>
          <p className="text-[11px] font-sans text-slate-400 mt-1">
            Visual trade-off comparison analyzer. Select up to five candidate materials to run cross-dimensional property reviews and parallel coordinate mapping.
          </p>
        </div>
      </div>

      {/* Control Area: Search and active list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Search for Materials Box */}
        <div ref={searchContainerRef} className="lg:col-span-1 bg-white/5 border border-white/10 rounded-lg p-4 space-y-4 relative">
          <div>
            <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Add Material to Comparison
            </h2>
            <p className="text-[10px] text-slate-500 font-sans mt-0.5">Filter the dataset and add materials side-by-side.</p>
          </div>

          <div className="space-y-2.5">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-550" />
              <input
                type="text"
                placeholder="Search materials (e.g. AA, SS, grade)..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
                className="w-full bg-[#0B0F19] border border-white/10 rounded pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
              />
            </div>

            <select
              value={classFilter}
              onChange={(e) => {
                setClassFilter(e.target.value);
                setShowDropdown(true);
              }}
              className="w-full bg-[#0B0F19] border border-white/10 rounded p-1.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/50"
            >
              <option value="All">All Categories</option>
              {materialClasses.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && filteredSearch.length > 0 && (
            <div className="absolute left-4 right-4 bg-[#0B0F19] border border-white/10 rounded shadow-2xl z-20 divide-y divide-white/5 max-h-[220px] overflow-y-auto">
              {filteredSearch.map(mat => {
                const isSelected = selectedIds.includes(mat.id);
                return (
                  <div key={mat.id} className="flex justify-between items-center p-2 text-xs hover:bg-white/5">
                    <div className="truncate pr-4">
                      <span className="font-semibold text-slate-200">{mat.name}</span>
                      <span className="text-[9px] font-mono text-slate-500 ml-1.5">{mat.grade}</span>
                    </div>
                    <button
                      onClick={() => toggleSelectMaterial(mat.id)}
                      disabled={!isSelected && selectedIds.length >= 5}
                      className={`p-1 rounded cursor-pointer transition-colors flex items-center justify-center ${
                        isSelected 
                          ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                          : 'bg-blue-600/10 text-blue-400 hover:bg-blue-600/20 disabled:opacity-30 disabled:cursor-not-allowed'
                      }`}
                    >
                      {isSelected ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Tray list */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Selected Comparison Tray
            </h2>
            <p className="text-[10px] text-slate-550 font-sans mt-0.5">Maximum 5 materials compared.</p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {comparedMaterials.map((mat, idx) => (
              <div 
                key={mat.id}
                className="flex items-center gap-2 px-2.5 py-1 rounded border text-xs"
                style={{ 
                  borderColor: `${CLASS_COLORS[mat.materialClass]}40`,
                  backgroundColor: `${CLASS_COLORS[mat.materialClass]}08`
                }}
              >
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: CLASS_COLORS[mat.materialClass] }}></span>
                <div className="flex flex-col">
                  <span className="font-bold text-slate-200 truncate max-w-[120px]">{mat.name}</span>
                  <span className="text-[8px] font-mono text-slate-500">{mat.grade}</span>
                </div>
                <button
                  onClick={() => toggleSelectMaterial(mat.id)}
                  className="text-slate-500 hover:text-red-400 p-0.5 rounded cursor-pointer ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {comparedMaterials.length === 0 && (
              <span className="text-xs text-slate-500 mt-2 font-mono">Tray empty. Search and add items to compare.</span>
            )}
          </div>

          <div className="text-[9px] font-mono text-slate-500 uppercase text-right mt-3 border-t border-white/5 pt-2">
            Capacity: {comparedMaterials.length} / 5
          </div>
        </div>

      </div>

      {/* Comparison Grid Details */}
      {comparedMaterials.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Property comparison table (col 6) */}
          <div className="lg:col-span-6 bg-white/5 border border-white/10 rounded-lg p-4 overflow-x-auto">
            <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-3">
              Performance Dimension Matrix
            </h2>
            
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[9px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-2">Property</th>
                  {comparedMaterials.map(m => (
                    <th key={m.id} className="py-2 px-2 text-center" style={{ color: CLASS_COLORS[m.materialClass] }}>
                      <span className="block truncate max-w-[80px]" title={m.name}>{m.name}</span>
                      <span className="text-[8px] font-mono opacity-50 block">{m.grade}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[11px] font-mono text-slate-350">
                {/* Density Row */}
                <tr>
                  <td className="py-2.5 font-sans font-semibold text-slate-300">Density (g/cc)</td>
                  {comparedMaterials.map(m => {
                    const isBest = m.density === bestValues.density;
                    return (
                      <td key={m.id} className={`py-2.5 text-center ${isBest ? 'text-emerald-400 font-bold bg-emerald-500/5' : ''}`}>
                        {m.density.toFixed(2)} {isBest && '★'}
                      </td>
                    );
                  })}
                </tr>

                {/* Strength Row */}
                <tr>
                  <td className="py-2.5 font-sans font-semibold text-slate-300">Strength (MPa)</td>
                  {comparedMaterials.map(m => {
                    const isBest = m.strength === bestValues.strength;
                    return (
                      <td key={m.id} className={`py-2.5 text-center ${isBest ? 'text-emerald-400 font-bold bg-emerald-500/5' : ''}`}>
                        {m.strength} {isBest && '★'}
                      </td>
                    );
                  })}
                </tr>

                {/* Cost index Row */}
                <tr>
                  <td className="py-2.5 font-sans font-semibold text-slate-300">Cost index</td>
                  {comparedMaterials.map(m => {
                    const isBest = m.cost === bestValues.cost;
                    return (
                      <td key={m.id} className={`py-2.5 text-center ${isBest ? 'text-emerald-400 font-bold bg-emerald-500/5' : ''}`}>
                        {m.cost.toFixed(1)} {isBest && '★'}
                      </td>
                    );
                  })}
                </tr>

                {/* Modulus Row */}
                <tr>
                  <td className="py-2.5 font-sans font-semibold text-slate-300">Elastic Modulus (GPa)</td>
                  {comparedMaterials.map(m => {
                    const isBest = m.elasticModulus === bestValues.elasticModulus;
                    return (
                      <td key={m.id} className={`py-2.5 text-center ${isBest ? 'text-emerald-400 font-bold bg-emerald-500/5' : ''}`}>
                        {m.elasticModulus} {isBest && '★'}
                      </td>
                    );
                  })}
                </tr>

                {/* Hardness Row */}
                <tr>
                  <td className="py-2.5 font-sans font-semibold text-slate-300">Hardness (HB)</td>
                  {comparedMaterials.map(m => {
                    const isBest = m.hardness === bestValues.hardness;
                    return (
                      <td key={m.id} className={`py-2.5 text-center ${isBest ? 'text-emerald-400 font-bold bg-emerald-500/5' : ''}`}>
                        {m.hardness} {isBest && '★'}
                      </td>
                    );
                  })}
                </tr>

                {/* Corrosion Row */}
                <tr>
                  <td className="py-2.5 font-sans font-semibold text-slate-300">Corrosion Shield</td>
                  {comparedMaterials.map(m => {
                    const isBest = m.corrosion === bestValues.corrosion;
                    return (
                      <td key={m.id} className={`py-2.5 text-center ${isBest ? 'text-emerald-400 font-bold bg-emerald-500/5' : ''}`}>
                        {m.corrosion}/10 {isBest && '★'}
                      </td>
                    );
                  })}
                </tr>

                {/* Wear Row */}
                <tr>
                  <td className="py-2.5 font-sans font-semibold text-slate-300">Wear Resistance</td>
                  {comparedMaterials.map(m => {
                    const isBest = m.wear === bestValues.wear;
                    return (
                      <td key={m.id} className={`py-2.5 text-center ${isBest ? 'text-emerald-400 font-bold bg-emerald-500/5' : ''}`}>
                        {m.wear}/10 {isBest && '★'}
                      </td>
                    );
                  })}
                </tr>

                {/* Sustainability Row */}
                <tr>
                  <td className="py-2.5 font-sans font-semibold text-slate-300">Sustainability</td>
                  {comparedMaterials.map(m => {
                    const isBest = m.sustainability === bestValues.sustainability;
                    return (
                      <td key={m.id} className={`py-2.5 text-center ${isBest ? 'text-emerald-400 font-bold bg-emerald-500/5' : ''}`}>
                        {m.sustainability}/10 {isBest && '★'}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right: Charts Laboratory (col 6) */}
          <div className="lg:col-span-6 bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[420px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-2">
              <div>
                <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
                  Comparative Visualization
                </h2>
              </div>
              
              {/* Chart Tab buttons */}
              <div className="flex flex-wrap gap-1">
                {['radar', 'heatmap', 'bubble', 'ashby', 'parallel'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveChartTab(tab as any)}
                    className={`px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider transition-colors cursor-pointer ${
                      activeChartTab === tab 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Rendering active chart tab */}
            <div className="flex-1 mt-4 relative min-h-[280px]">
              
              {/* Radar chart */}
              {activeChartTab === 'radar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarChartData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" fontSize={8} />
                    {comparedMaterials.map(m => (
                      <Radar
                        key={m.id}
                        name={`${m.name} (${m.grade})`}
                        dataKey={`val_${m.id}`}
                        stroke={CLASS_COLORS[m.materialClass]}
                        fill={CLASS_COLORS[m.materialClass]}
                        fillOpacity={0.1}
                      />
                    ))}
                    <Tooltip contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '9px' }} />
                  </RadarChart>
                </ResponsiveContainer>
              )}

              {/* Heatmap implementation */}
              {activeChartTab === 'heatmap' && (
                <div className="flex flex-col gap-2 overflow-y-auto max-h-[300px] pr-1">
                  {heatmapData.map((row, idx) => (
                    <div key={idx} className="space-y-1">
                      <span className="text-[10px] font-mono" style={{ color: CLASS_COLORS[row.materialClass] }}>{row.materialName}</span>
                      <div className="grid grid-cols-6 gap-1">
                        {row.scores.map((s, sIdx) => (
                          <div 
                            key={sIdx} 
                            style={{ backgroundColor: `${CLASS_COLORS[row.materialClass]}${Math.round(20 + s.val * 0.7)}` }} 
                            className="p-1 rounded text-center text-white border border-white/5"
                          >
                            <span className="block text-[8px] font-mono text-slate-400 truncate">{s.label}</span>
                            <span className="text-[10px] font-mono font-bold">{s.val}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Parallel coordinates line chart */}
              {activeChartTab === 'parallel' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={parallelData} margin={{ top: 5, right: 10, bottom: -10, left: -25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={9} />
                    <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} />
                    <Tooltip contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '9px' }} />
                    {comparedMaterials.map((m, idx) => (
                      <Line 
                        key={m.id}
                        type="monotone" 
                        dataKey={m.name} 
                        stroke={CLASS_COLORS[m.materialClass]} 
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}

              {/* Bubble chart */}
              {activeChartTab === 'bubble' && (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 15, right: 10, bottom: -5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" dataKey="density" name="Density" unit="g/cc" stroke="#64748b" fontSize={9} />
                    <YAxis type="number" dataKey="strength" name="Strength" unit="MPa" stroke="#64748b" fontSize={9} />
                    <ZAxis type="number" dataKey="sustainability" range={[60, 400]} name="Sustainability" unit="/10" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#0B0F19] border border-white/10 p-2.5 rounded shadow-2xl text-[10px] font-mono space-y-0.5">
                              <p className="font-bold text-white mb-1">{data.name}</p>
                              <p>Density: <span className="text-blue-400">{data.density} g/cc</span></p>
                              <p>Strength: <span className="text-blue-400">{data.strength} MPa</span></p>
                              <p>Sustainability: <span className="text-emerald-400">{data.sustainability}/10</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '9px' }} />
                    {bubbleChartData.map((entry, idx) => (
                      <Scatter 
                        key={idx}
                        name={entry.name} 
                        data={[entry]} 
                        fill={entry.color} 
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              )}

              {/* Ashby Scatter plot */}
              {activeChartTab === 'ashby' && (
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 15, right: 10, bottom: -5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis type="number" dataKey="density" name="Density" unit="g/cc" stroke="#64748b" fontSize={9} />
                    <YAxis type="number" dataKey="elasticModulus" name="Elastic Modulus" unit="GPa" stroke="#64748b" fontSize={9} />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-[#0B0F19] border border-white/10 p-2.5 rounded shadow-2xl text-[10px] font-mono space-y-0.5">
                              <p className="font-bold text-white mb-1">{data.name}</p>
                              <p>Density: <span className="text-blue-400">{data.density} g/cc</span></p>
                              <p>Elastic Modulus: <span className="text-blue-400">{data.elasticModulus} GPa</span></p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '9px' }} />
                    {ashbyScatterData.map((entry, idx) => (
                      <Scatter 
                        key={idx}
                        name={entry.name} 
                        data={[entry]} 
                        fill={entry.color} 
                      />
                    ))}
                  </ScatterChart>
                </ResponsiveContainer>
              )}

            </div>
          </div>

        </div>
      )}

    </div>
  );
}
