import { useMemo } from 'react';
import { 
  BarChart, 
  Sparkles, 
  Layers, 
  Activity, 
  TrendingUp, 
  Leaf, 
  Flame, 
  Award,
  Download,
  Printer
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend
} from 'recharts';
import { Material, RecommendationHistory, ComponentType } from '../types';
import { MATERIALS, CLASS_COLORS } from '../data';
import { runTopsis } from '../utils';

interface DashboardViewProps {
  onNavigateToSelection: (componentName?: ComponentType) => void;
  recommendationHistory: RecommendationHistory[];
  onDownloadReport: () => void;
  onExportPNG: (elementId: string, filename: string) => void;
}

export default function DashboardView({ 
  onNavigateToSelection, 
  recommendationHistory,
  onDownloadReport,
  onExportPNG
}: DashboardViewProps) {

  // Dynamic calculations of general KPI data
  const stats = useMemo(() => {
    const count = MATERIALS.length;
    const classes = Array.from(new Set(MATERIALS.map(m => m.materialClass))).length;
    
    // Average raw properties
    const totalStrength = MATERIALS.reduce((sum, m) => sum + m.strength, 0);
    const avgStrength = parseFloat((totalStrength / count).toFixed(1));
    
    const totalDensity = MATERIALS.reduce((sum, m) => sum + m.density, 0);
    const avgDensity = parseFloat((totalDensity / count).toFixed(2));
    
    const totalSustainability = MATERIALS.reduce((sum, m) => sum + m.sustainability, 0);
    const avgSustainability = parseFloat((totalSustainability / count).toFixed(1));
    
    // Top overall recommended material under uniform importance weights
    const uniformTopsis = runTopsis(MATERIALS, {
      strength: 0.166,
      weight: 0.166,
      cost: 0.166,
      corrosion: 0.166,
      wear: 0.166,
      sustainability: 0.166
    });
    
    const topMaterial = uniformTopsis[0];

    return {
      count,
      classes,
      avgStrength,
      avgDensity,
      avgSustainability,
      topMaterial: topMaterial.material,
      topScore: topMaterial.score
    };
  }, []);

  // 1. Material distribution pie chart data
  const pieData = useMemo(() => {
    const classCount: Record<string, number> = {};
    MATERIALS.forEach(m => {
      classCount[m.materialClass] = (classCount[m.materialClass] || 0) + 1;
    });

    return Object.entries(classCount).map(([name, value]) => ({
      name,
      value,
      color: CLASS_COLORS[name as keyof typeof CLASS_COLORS]
    }));
  }, []);

  // 2. Strength vs Density Scatter plot data
  const scatterData = useMemo(() => {
    return MATERIALS.map(m => ({
      name: `${m.name} (${m.grade})`,
      density: m.density,
      strength: m.strength,
      class: m.materialClass,
      color: CLASS_COLORS[m.materialClass]
    }));
  }, []);

  // 3. Normalized average fingerprint for visual identity radar chart
  const radarData = useMemo(() => {
    const totals = {
      strength: 0,
      weightEff: 0,
      costEff: 0,
      corrosion: 0,
      wear: 0,
      sustainability: 0
    };

    MATERIALS.forEach(m => {
      // Scale strength out of 100 max (reference = 1600 MPa)
      totals.strength += (m.strength / 1600) * 100;
      // Scale density to weight eff (lower density = higher weight eff, max is density of 1.45 to 8.0)
      totals.weightEff += ((8 - m.density) / (8 - 1.45)) * 100;
      // Scale cost to efficiency (lower cost = higher efficiency, cost is 1.4 to 72)
      totals.costEff += ((75 - m.cost) / (75 - 1.4)) * 100;
      totals.corrosion += m.corrosion * 10;
      totals.wear += m.wear * 10;
      totals.sustainability += m.sustainability * 10;
    });

    const mCount = MATERIALS.length;
    return [
      { subject: 'Strength Efficiency', value: Math.round(totals.strength / mCount) },
      { subject: 'Weight Red. Index', value: Math.round(totals.weightEff / mCount) },
      { subject: 'Cost Advantage', value: Math.round(totals.costEff / mCount) },
      { subject: 'Corrosion Shield', value: Math.round(totals.corrosion / mCount) },
      { subject: 'Tribological Wear', value: Math.round(totals.wear / mCount) },
      { subject: 'Eco Sustainability', value: Math.round(totals.sustainability / mCount) }
    ];
  }, []);

  // Generate dynamic tags based on the current best material's performance limits
  const currentBestTags = useMemo(() => {
    const mat = stats.topMaterial;
    const tags = [];
    if (mat.density < 2.0) tags.push({ label: 'Lightweight', style: 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' });
    if (mat.strength > 600) tags.push({ label: 'High Strength', style: 'bg-purple-950/40 text-purple-400 border-purple-500/30' });
    if (mat.corrosion >= 8) tags.push({ label: 'Corrosion Resistant', style: 'bg-cyan-950/40 text-cyan-400 border-cyan-500/30' });
    if (mat.sustainability >= 7) tags.push({ label: 'Sustainable', style: 'bg-teal-950/40 text-teal-400 border-teal-500/30' });
    return tags;
  }, [stats.topMaterial]);

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-900/20 pb-5">
        <div>
          <h1 className="font-sans font-bold text-xl text-white tracking-tight uppercase">System Overview & Dashboard</h1>
          <p className="text-[11px] font-sans text-slate-400 mt-1">Multi-Criteria Decision Analysis (MCDA) metrics for automotive structural materials.</p>
        </div>
        <div className="flex gap-2.5">
          <button 
            id="btn-print-dashboard"
            onClick={onDownloadReport}
            className="flex items-center gap-2 px-3 py-1.5 rounded border border-blue-500/50 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all duration-200"
          >
            <Printer className="w-3.5 h-3.5" />
            Print MCDA Report
          </button>
          <button 
            id="btn-export-dashboard"
            onClick={() => onExportPNG('dashboard-charts', 'automat_dashboard_analytics.png')}
            className="flex items-center gap-2 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all duration-200"
          >
            <Download className="w-3.5 h-3.5" />
            Export Charts PNG
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div id="kpi-grid" className="grid grid-cols-2 lg:grid-cols-5 gap-3">

        {/* Card 2 */}
        <div id="kpi-classes" className="bg-blue-900/10 border border-blue-800/30 rounded p-3 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase opacity-50">Classes</span>
            <Layers className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-blue-100 mt-2">{stats.classes}</p>
          <p className="text-[8px] font-mono text-slate-500 mt-0.5 uppercase tracking-tighter">Isotropic / Fiber</p>
        </div>

        {/* Card 3 */}
        <div id="kpi-strength" className="bg-blue-900/10 border border-blue-800/30 rounded p-3 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase opacity-50">Avg Strength</span>
            <Activity className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-blue-100 mt-2">{stats.avgStrength} <span className="text-[10px] text-slate-400">MPa</span></p>
          <p className="text-[8px] font-mono text-slate-500 mt-0.5 uppercase tracking-tighter">Mean safety limit</p>
        </div>

        {/* Card 4 */}
        <div id="kpi-density" className="bg-blue-900/10 border border-blue-800/30 rounded p-3 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase opacity-50">Avg Density</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-blue-100 mt-2">{stats.avgDensity} <span className="text-[10px] text-slate-400">g/cc</span></p>
          <p className="text-[8px] font-mono text-slate-500 mt-0.5 uppercase tracking-tighter">Specific gravity</p>
        </div>

        {/* Card 5 */}
        <div id="kpi-sustainability" className="bg-blue-900/10 border border-blue-800/30 rounded p-3 flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase opacity-50">Sustainability</span>
            <Leaf className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <p className="text-xl font-bold text-emerald-400 mt-2">{stats.avgSustainability}</p>
          <p className="text-[8px] font-mono text-slate-500 mt-0.5 uppercase tracking-tighter">Eco lifecycle</p>
        </div>

        {/* Card 6 */}
        <div id="kpi-top" className="bg-blue-900/10 border border-blue-800/30 rounded p-3 flex flex-col justify-center border-blue-500/30">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase text-blue-400 font-bold">Top Material</span>
            <Award className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
          </div>
          <p className="text-xs font-bold text-blue-100 mt-2 truncate">{stats.topMaterial.name}</p>
          <p className="text-[8px] font-mono text-slate-400 mt-0.5">SCORE: {stats.topScore}</p>
        </div>
      </div>

      {/* Main Charts Block - Grouped in #dashboard-charts for PNG export */}
      <div id="dashboard-charts" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart 1: Material Distribution Pie */}
        <div id="panel-pie" className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[380px]">
          <div>
            <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Class Distribution
            </h2>
            <p className="text-[11px] text-slate-400 mt-1.5 font-sans">Composition ratios of specialized automotive engineering materials.</p>
          </div>
          <div className="flex-1 min-h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Strength vs Density Ashby Scatter */}
        <div id="panel-scatter" className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[380px]">
          <div>
            <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Strength vs. Density Coordinates
            </h2>
            <p className="text-[11px] text-slate-400 mt-1.5 font-sans">Ashby scatter coordinates representing yield limit compared to overall mass density.</p>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 15, right: 10, bottom: -5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis 
                  type="number" 
                  dataKey="density" 
                  name="Density" 
                  unit="g/cc" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickFormatter={(v) => v.toFixed(1)}
                />
                <YAxis 
                  type="number" 
                  dataKey="strength" 
                  name="Strength" 
                  unit="MPa" 
                  stroke="#64748b" 
                  fontSize={10}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#0B0F19] border border-white/10 p-3 rounded shadow-xl">
                          <p className="text-xs font-bold text-white mb-1.5">{data.name}</p>
                          <div className="space-y-0.5 text-[11px] text-slate-400 font-mono">
                            <p>Class: <span style={{ color: data.color }} className="font-bold">{data.class}</span></p>
                            <p>Density: <span className="text-white">{data.density} g/cm³</span></p>
                            <p>Strength: <span className="text-white">{data.strength} MPa</span></p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Materials" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: System Visual Fingerprint Radar */}
        <div id="panel-radar" className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[380px]">
          <div>
            <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Aggregate Material Fingerprint
            </h2>
            <p className="text-[11px] text-slate-400 mt-1.5 font-sans">Multi-dimensional operational performance averaged across all available materials.</p>
          </div>
          <div className="flex-1 min-h-[220px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={9} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#64748b" fontSize={8} />
                <Radar 
                  name="System Average" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.35} 
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

      {/* Highlights & Past Activity History Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Featured Card: Current Best Material Card */}
        <div id="featured-material-card" className="lg:col-span-1 bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col justify-between relative overflow-hidden h-[330px]">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
          
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-blue-400 uppercase tracking-widest px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/20">Featured Candidate</span>
              <Award className="w-4 h-4 text-blue-400 animate-pulse" />
            </div>
            
            <h3 className="text-lg font-sans font-extrabold text-blue-100 mt-4 uppercase">{stats.topMaterial.name}</h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">Grade: <span className="text-blue-400 font-bold">{stats.topMaterial.grade}</span></p>
            
            <div className="grid grid-cols-3 gap-2 mt-5 border-t border-b border-white/5 py-3.5">
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Density</span>
                <span className="text-sm font-bold text-white">{stats.topMaterial.density} <span className="text-[10px] font-normal text-slate-450">g/cc</span></span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Strength</span>
                <span className="text-sm font-bold text-white">{stats.topMaterial.strength} <span className="text-[10px] font-normal text-slate-450">MPa</span></span>
              </div>
              <div>
                <span className="text-[9px] font-mono text-slate-500 uppercase block">Cost Score</span>
                <span className="text-sm font-bold text-white">{stats.topMaterial.cost} <span className="text-[10px] font-normal text-slate-400">Index</span></span>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mt-4">
              {currentBestTags.map((tag, idx) => (
                <span 
                  key={idx} 
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${tag.style}`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
          </div>
          
          <button 
            id="btn-nav-sel"
            onClick={() => onNavigateToSelection()}
            className="w-full mt-2 text-center py-2 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs uppercase font-bold tracking-wider cursor-pointer transition-colors"
          >
            Open Selection Panel
          </button>
        </div>

        {/* History Table Card */}
        <div id="history-panel" className="lg:col-span-2 bg-white/5 border border-white/10 rounded-lg p-5 flex flex-col justify-between h-[330px]">
          <div>
            <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Recommendation Audit History
            </h2>
            <p className="text-[11px] text-slate-400 mt-1.5 font-sans">Recent component constraints solved via TOPSIS algorithmic modeling runs.</p>
          </div>

          <div className="flex-1 mt-3 overflow-y-auto pr-1">
            <table className="w-full text-left" id="table-recommend-history">
              <thead>
                <tr className="border-b border-white/10 text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  <th className="py-2 pl-2">Component</th>
                  <th className="py-2">Selected Material</th>
                  <th className="py-2 text-right">TOPSIS Score</th>
                  <th className="py-2 text-right pr-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs font-sans">
                {recommendationHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors text-slate-300">
                    <td className="py-3 pl-2 font-semibold">{item.component}</td>
                    <td className="py-3 text-slate-400 font-mono text-[11px]">{item.material}</td>
                    <td className="py-3 text-right">
                      <span className="font-mono text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded text-[11px]">
                        {item.topsisScore.toFixed(3)}
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-500 font-mono pr-2">{item.date}</td>
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
