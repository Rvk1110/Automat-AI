import { useState, useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Cell
} from 'recharts';
import { 
  Check, 
  X, 
  Plus, 
  Flame, 
  Info,
  Scale,
  Brain,
  Grid
} from 'lucide-react';
import { Material } from '../types';
import { MATERIALS, CLASS_COLORS } from '../data';
import { calculateCorrelations, countBoxStats } from '../utils';

export default function AnalysisView() {
  
  // Pre-initialize check list with 5 representative materials of different classes
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const reps = [
      MATERIALS.find(m => m.materialClass === 'Steel')?.id,
      MATERIALS.find(m => m.materialClass === 'Aluminum Alloys')?.id,
      MATERIALS.find(m => m.materialClass === 'Magnesium Alloys')?.id,
      MATERIALS.find(m => m.materialClass === 'Titanium Alloys')?.id,
      MATERIALS.find(m => m.materialClass === 'Carbon Fiber Reinforced Polymer')?.id,
    ].filter(Boolean) as string[];
    return reps.length >= 2 ? reps : MATERIALS.slice(0, 5).map(m => m.id);
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('All');

  const filteredChecklistMaterials = useMemo(() => {
    return MATERIALS.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            m.grade.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesClass = classFilter === 'All' || m.materialClass === classFilter;
      return (matchesSearch && matchesClass) || selectedIds.includes(m.id);
    }).slice(0, 15); // Limit to 15 items for clean layout
  }, [searchTerm, classFilter, selectedIds]);

  // Handle select/deselect limit to 5 max
  const handleToggleMaterial = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) { // Maintain at least 2 for comparison
        setSelectedIds(prev => prev.filter(x => x !== id));
      }
    } else {
      if (selectedIds.length < 5) {
        setSelectedIds(prev => [...prev, id]);
      }
    }
  };

  // Resolve selected materials
  const comparisonMaterials = useMemo(() => {
    return MATERIALS.filter(m => selectedIds.includes(m.id));
  }, [selectedIds]);

  // 1. Radar Chart Data for comparing selected 5 materials
  // Must normalize each property on 0-100 scale for comparison
  const radarComparisonData = useMemo(() => {
    const categories = [
      { name: 'Strength', key: 'strength', max: 1600 },
      { name: 'Elastic Modulus', key: 'elasticModulus', max: 210 },
      { name: 'Hardness', key: 'hardness', max: 460 },
      { name: 'Corrosion Shield', key: 'corrosion', max: 10 },
      { name: 'Wear Resistance', key: 'wear', max: 10 },
      { name: 'Sustainability', key: 'sustainability', max: 10 }
    ];

    return categories.map(cat => {
      const row: any = { subject: cat.name };
      comparisonMaterials.forEach(m => {
        const val = m[cat.key as keyof Material] as number;
        // Normalize
        row[m.name] = Math.round((val / cat.max) * 100);
      });
      return row;
    });
  }, [comparisonMaterials]);

  // 2. Bubble/Ashby Chart Data: Y=Strength, X=Cost Index, Size=Sustainability, density = X coordinate for Ashby
  const bubbleData = useMemo(() => {
    return MATERIALS.map(m => ({
      name: `${m.name} (${m.grade})`,
      cost: m.cost,
      strength: m.strength,
      density: m.density,
      sustainability: m.sustainability, // Used for bubble size
      class: m.materialClass,
      color: CLASS_COLORS[m.materialClass]
    }));
  }, []);

  // 3. Dynamic Heatmap correlations calculations
  const heatmapData = useMemo(() => {
    return calculateCorrelations(MATERIALS);
  }, []);

  // 4. Histogram data - binning strength of all 14 materials
  const histogramBins = useMemo(() => {
    // Range: 220 - 1600 MPa. Let's create 5 bins:
    // 0-350, 350-700, 700-1050, 1050-1400, 1400-1750
    const bins = [
      { name: '0-350 MPa', count: 0 },
      { name: '350-700 MPa', count: 0 },
      { name: '700-1050 MPa', count: 0 },
      { name: '1050-1400 MPa', count: 0 },
      { name: '1400+ MPa', count: 0 }
    ];

    MATERIALS.forEach(m => {
      const str = m.strength;
      if (str <= 350) bins[0].count++;
      else if (str <= 700) bins[1].count++;
      else if (str <= 1050) bins[2].count++;
      else if (str <= 1400) bins[3].count++;
      else bins[4].count++;
    });

    return bins;
  }, []);

  // 5. Density descriptive Box Plot stats (calculated over all 14 materials)
  const boxPlotStats = useMemo(() => {
    const densities = MATERIALS.map(m => m.density);
    return countBoxStats(densities);
  }, []);

  return (
    <div id="analysis-view" className="space-y-6">
      
      {/* Page Title */}
      <div className="border-b border-blue-900/20 pb-5">
        <h1 className="font-sans font-bold text-xl text-white tracking-tight uppercase">Material Analysis Laboratory</h1>
        <p className="text-[11px] font-sans text-slate-400 mt-1">Compare up to 5 individual material candidates, analyze macro correlations, and visualize Ashby envelopes.</p>
      </div>

      {/* Select Comparative Checkbox Panel */}
      <div id="selection-checkbox-bar" className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 border-b border-white/5 pb-3">
          <div>
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Select comparative candidates (Choose 2 to 5 materials):
            </h4>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Showing matching candidates. Currently selected: {selectedIds.length} / 5</p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input 
              type="text"
              placeholder="Search materials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0B0F19] border border-white/10 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-full md:w-44 font-mono animate-none"
            />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-[#0B0F19] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer font-sans"
            >
              <option value="All">All Classes</option>
              <option value="Steel">Steel</option>
              <option value="Stainless Steel">Stainless Steel</option>
              <option value="Aluminum Alloys">Aluminum Alloys</option>
              <option value="Magnesium Alloys">Magnesium Alloys</option>
              <option value="Titanium Alloys">Titanium Alloys</option>
              <option value="Cast Iron">Cast Iron</option>
              <option value="Copper Alloys">Copper Alloys</option>
              <option value="Carbon Fiber Reinforced Polymer">CFRP</option>
              <option value="Glass Fiber Reinforced Polymer">GFRP</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {filteredChecklistMaterials.map(m => {
            const isSelected = selectedIds.includes(m.id);
            const isAtMax = selectedIds.length >= 5 && !isSelected;
            const isAtMin = selectedIds.length <= 2 && isSelected;
            return (
              <button
                key={m.id}
                id={`btn-toggle-mat-${m.id}`}
                disabled={(isAtMax || isAtMin)}
                onClick={() => handleToggleMaterial(m.id)}
                style={{ borderColor: isSelected ? CLASS_COLORS[m.materialClass] : '' }}
                className={`flex flex-col text-left p-2 rounded border text-xs cursor-pointer transition-all duration-150 ${
                  isSelected 
                    ? 'bg-blue-600/10 text-white' 
                    : 'bg-[#0B0F19] border-white/10 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                } ${(isAtMax || isAtMin) ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className="font-sans font-bold truncate pr-1" title={m.name}>{m.name}</span>
                  {isSelected ? (
                    <Check className="w-3 h-3 flex-shrink-0" style={{ color: CLASS_COLORS[m.materialClass] }} />
                  ) : (
                    <Plus className="w-3 h-3 flex-shrink-0 text-slate-600" />
                  )}
                </div>
                <div className="flex justify-between items-center w-full mt-1">
                  <span className="text-[9px] font-mono text-slate-500">{m.grade}</span>
                  <span className="text-[8px] font-mono opacity-50 px-1 rounded bg-white/5 border border-white/5">{m.materialClass.split(' ')[0]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Specifications Table */}
      <div id="comparison-table-panel" className="bg-white/5 border border-white/10 rounded-lg p-4">
        <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-3">
          Quantitative Comparison Matrix
        </h4>

        <div className="overflow-x-auto">
          <table id="table-quantitative-comparison" className="w-full text-left font-sans text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-relaxed">
                <th className="py-2 pl-2">Mechanical Parameters</th>
                {comparisonMaterials.map(m => (
                  <th key={m.id} style={{ color: CLASS_COLORS[m.materialClass] }} className="py-2 font-bold">
                    {m.name} ({m.grade})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr>
                <td className="py-3 pl-2 font-mono text-slate-400">Density (g/cm³)</td>
                {comparisonMaterials.map(m => (
                  <td key={m.id} className="py-3 font-semibold text-white">{m.density.toFixed(2)}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pl-2 font-mono text-slate-400">Yield Strength (MPa)</td>
                {comparisonMaterials.map(m => (
                  <td key={m.id} className="py-3 font-semibold text-white">{m.strength}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pl-2 font-mono text-slate-400">Hardness (HB)</td>
                {comparisonMaterials.map(m => (
                  <td key={m.id} className="py-3 font-semibold text-white">{m.hardness || '—'}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pl-2 font-mono text-slate-400">Elastic Modulus (GPa)</td>
                {comparisonMaterials.map(m => (
                  <td key={m.id} className="py-3 font-semibold text-white">{m.elasticModulus || '—'}</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pl-2 font-mono text-slate-400">Corrosion Limit (Scale 1-10)</td>
                {comparisonMaterials.map(m => (
                  <td key={m.id} className="py-3 font-semibold text-white">{m.corrosion}/10</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pl-2 font-mono text-slate-400">Tribological Wear (Scale 1-10)</td>
                {comparisonMaterials.map(m => (
                  <td key={m.id} className="py-3 font-semibold text-white">{m.wear}/10</td>
                ))}
              </tr>
              <tr>
                <td className="py-3 pl-2 font-mono text-slate-400">Eco Sustainability Index</td>
                {comparisonMaterials.map(m => (
                  <td key={m.id} className="py-3 font-semibold text-white">{m.sustainability}/10</td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Main Charts Row 1: Radar Compare + Ashby Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Radar Compare Chart */}
        <div id="panel-compare-radar" className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[360px]">
          <div>
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-2">
              Comparative Scientific Signature
            </h4>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarComparisonData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis stroke="#64748b" fontSize={8} />
                {comparisonMaterials.map((m, idx) => (
                  <Radar
                    key={m.id}
                    name={m.name}
                    dataKey={m.name}
                    stroke={CLASS_COLORS[m.materialClass]}
                    fill={CLASS_COLORS[m.materialClass]}
                    fillOpacity={0.1}
                  />
                ))}
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ashby Plot (Tensile Strength vs Density) */}
        <div id="panel-compare-ashby" className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[360px]">
          <div>
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-2">
              Ashby Plot Envelope Chart
            </h4>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 10, bottom: -5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  type="number" 
                  dataKey="density" 
                  name="Density" 
                  unit="g/cc" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  tickFormatter={(v) => v.toFixed(1)}
                  domain={[1, 9]}
                />
                <YAxis 
                  type="number" 
                  dataKey="strength" 
                  name="Ultimate Tensile Strength" 
                  unit="MPa" 
                  stroke="#94a3b8" 
                  fontSize={10}
                  domain={[0, 1800]}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0f172a] border border-[#1e293b] p-3 rounded-lg shadow-xl font-sans text-xs">
                          <p className="font-bold text-white max-w-[170px] truncate">{data.name}</p>
                          <div className="space-y-0.5 text-[10px] text-slate-400 font-mono mt-1">
                            <p>Density: <span className="text-white">{data.density} g/cm³</span></p>
                            <p>Strength: <span className="text-white">{data.strength} MPa</span></p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="All Materials" data={bubbleData}>
                  {bubbleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 2: Bubble Chart + Dynamic Pearson Correlation Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Bubble Chart: Cost vs Strength (Sust = bubble size) */}
        <div id="panel-compare-bubble" className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[440px]">
          <div>
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-2">
              Cost vs. Strength Bubble Chart
            </h4>
            <p className="text-[10px] text-slate-500 mt-1 pl-1">Size of bubble denotes Green Sustainability index (larger is eco-superior).</p>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 10, bottom: -5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  type="number" 
                  dataKey="cost" 
                  name="Cost Index" 
                  unit="USD/kg" 
                  stroke="#94a3b8" 
                  fontSize={10} 
                  domain={[0, 80]}
                />
                <YAxis 
                  type="number" 
                  dataKey="strength" 
                  name="Yield Strength" 
                  unit="MPa" 
                  stroke="#94a3b8" 
                  fontSize={10}
                />
                <ZAxis type="number" dataKey="sustainability" range={[60, 450]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0f172a] border border-[#1e293b] p-3 rounded-lg shadow-xl font-sans text-xs">
                          <p className="font-bold text-white">{data.name}</p>
                          <div className="space-y-0.5 text-[10px] m-1 text-slate-400 font-mono mt-1">
                            <p>Cost index: <span className="text-white">${data.cost} /kg</span></p>
                            <p>Strength: <span className="text-white">{data.strength} MPa</span></p>
                            <p>Eco-Index: <span className="text-teal-400 font-bold">{data.sustainability}/10</span></p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Materials" data={bubbleData}>
                  {bubbleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dynamic Pearson Heatmap Grid */}
        <div id="panel-heatmap" className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[440px]">
          <div>
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-2">
              Pearson Correlation Matrix Heatmap
            </h4>
          </div>
          <div className="flex-1 mt-2 mb-1 flex items-center justify-center">
            <div className="grid grid-cols-9 gap-1 font-mono text-[9px] w-full max-w-[340px]">
              {/* Header Corner cell */}
              <div className="flex items-center justify-center p-1 font-bold text-slate-500">Parameters</div>
              {heatmapData.features.map((feat, idx) => (
                <div key={`header-${idx}`} className="flex items-center justify-center p-1 font-bold text-slate-400 truncate text-[8px] text-center" title={feat}>
                  {feat.slice(0, 4)}
                </div>
              ))}
              
              {/* Grid rows */}
              {heatmapData.features.map((featY, y) => (
                <div key={`row-${y}`} className="contents">
                  {/* Left row header name */}
                  <div className="flex items-center font-bold text-slate-400 p-1 truncate text-[8px]" title={featY}>
                    {featY}
                  </div>
                  {/* Row values */}
                  {heatmapData.matrix[y]?.map((v, x) => {
                    // Positive correlation is Blue, negative is Orange/Red, neutral is deep dark gray
                    const isPositive = v > 0;
                    const valAbs = Math.abs(v);
                    
                    let bgStyle = { backgroundColor: '#1e293b', color: '#94a3b8' };
                    if (v === 1.0) {
                      bgStyle = { backgroundColor: '#1e3a8a', color: '#ffffff' };
                    } else if (isPositive) {
                      bgStyle = { 
                        backgroundColor: `rgba(30, 64, 175, ${valAbs * 0.95})`, 
                        color: valAbs > 0.5 ? '#ffffff' : '#cbd5e1' 
                      };
                    } else {
                      bgStyle = { 
                        backgroundColor: `rgba(194, 65, 12, ${valAbs * 0.95})`, 
                        color: valAbs > 0.5 ? '#ffffff' : '#cbd5e1' 
                      };
                    }

                    return (
                      <div 
                        key={`cell-${y}-${x}`} 
                        style={bgStyle}
                        className="flex items-center justify-center p-1 w-full aspect-square md:p-1.5 rounded-md font-bold text-[8px] transition-all duration-200 cursor-help"
                        title={`Correlation of ${heatmapData.features[y]} and ${heatmapData.features[x]}: ${v}`}
                      >
                        {v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2)}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Row 3: Strength Histogram + Density Box Plot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2" id="results-stat-row">
        
        {/* Strength Distribution Histogram */}
        <div id="panel-stat-histogram" className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[300px]">
          <div>
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-2">
              Strength Distribution Histogram
            </h4>
          </div>
          <div className="flex-1 min-h-[180px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramBins} margin={{ top: 5, right: 10, bottom: -5, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} />
                <YAxis dataKey="count" stroke="#94a3b8" fontSize={9} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {histogramBins.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? '#3b82f6' : '#2563eb'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Custom SVG Density Box Plot */}
        <div id="panel-stat-boxplot" className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[300px]">
          <div>
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-2">
              Descriptive Density Box-Plot (g/cm³)
            </h4>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center px-4">
            {/* Draw Box Plot in responsive vector path */}
            <svg viewBox="0 0 400 100" className="w-full max-w-[360px] h-20 text-slate-400 stroke-blue-500 font-mono text-[9px]">
              {/* Left whisker line (Min to Q1) */}
              <line x1="40" y1="50" x2="120" y2="50" strokeWidth="2" strokeDasharray="4" />
              {/* Right whisker line (Q3 to Max) */}
              <line x1="280" y1="50" x2="360" y2="50" strokeWidth="2" strokeDasharray="4" />
              
              {/* Whiskers vertical end bars */}
              <line x1="40" y1="35" x2="40" y2="65" strokeWidth="2" />
              <line x1="360" y1="35" x2="360" y2="65" strokeWidth="2" />
              
              {/* Central Box (Q1 to Q3) */}
              <rect x="120" y="25" width="160" height="50" fill="#0f172a" strokeWidth="2.5" />
              
              {/* Median Line */}
              <line x1="160" y1="25" x2="160" y2="75" strokeWidth="3" stroke="#10b981" />
              
              {/* Labels and values underneath */}
              <text x="40" y="90" textAnchor="middle" fill="#94a3b8">Min: {boxPlotStats.min}</text>
              <text x="120" y="15" textAnchor="middle" fill="#94a3b8">Q1: {boxPlotStats.q1}</text>
              <text x="160" y="90" textAnchor="middle" fill="#10b981" className="font-bold">Median: {boxPlotStats.median}</text>
              <text x="280" y="15" textAnchor="middle" fill="#94a3b8">Q3: {boxPlotStats.q3}</text>
              <text x="360" y="90" textAnchor="middle" fill="#94a3b8">Max: {boxPlotStats.max}</text>
            </svg>
            <p className="text-[10px] text-slate-500 leading-relaxed text-center mt-3 max-w-sm">
              Displays standard five-number density envelope summary of available candidates (1.45 to 8.00 g/cm³). Interquartile Range (IQR) represents composite-to-metal weight differentials.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
