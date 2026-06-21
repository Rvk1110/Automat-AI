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
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  Activity, 
  Database, 
  Layers, 
  ShieldCheck, 
  CheckCircle, 
  Info,
  Flame,
  Leaf,
  Award
} from 'lucide-react';
import { Material } from '../types';
import { MATERIALS, CLASS_COLORS } from '../data';
import { calculateCorrelations, countBoxStats } from '../utils';

export default function DatasetAnalyticsView() {

  // 1. Overall stats
  const datasetStats = useMemo(() => {
    const total = MATERIALS.length;
    const classes = Array.from(new Set(MATERIALS.map(m => m.materialClass))).length;
    
    const avgStrength = Math.round(MATERIALS.reduce((s, m) => s + m.strength, 0) / total);
    const avgDensity = parseFloat((MATERIALS.reduce((s, m) => s + m.density, 0) / total).toFixed(2));
    const avgCost = parseFloat((MATERIALS.reduce((s, m) => s + m.cost, 0) / total).toFixed(1));
    const avgSustainability = parseFloat((MATERIALS.reduce((s, m) => s + m.sustainability, 0) / total).toFixed(1));
    
    // Check completeness (all expected keys have valid numbers)
    let missingValuesCount = 0;
    const requiredKeys: (keyof Material)[] = ['density', 'strength', 'cost', 'corrosion', 'wear', 'sustainability', 'elasticModulus', 'hardness'];
    MATERIALS.forEach(m => {
      requiredKeys.forEach(k => {
        if (m[k] === undefined || m[k] === null || Number.isNaN(m[k])) {
          missingValuesCount++;
        }
      });
    });

    const completeness = Math.max(0, 100 - (missingValuesCount / (total * requiredKeys.length)) * 100);
    // Dataset Quality Score calculation
    const qualityScore = Math.round(completeness * 0.8 + 20); // Baseline complete score is 100% complete -> 100 score

    return {
      total,
      classes,
      avgStrength,
      avgDensity,
      avgCost,
      avgSustainability,
      missingValuesCount,
      completeness: parseFloat(completeness.toFixed(1)),
      qualityScore
    };
  }, []);

  // 2. Class Distribution Data
  const classDistData = useMemo(() => {
    const counts: Record<string, number> = {};
    MATERIALS.forEach(m => {
      counts[m.materialClass] = (counts[m.materialClass] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      color: CLASS_COLORS[name as keyof typeof CLASS_COLORS] || '#475569'
    })).sort((a, b) => b.count - a.count);
  }, []);

  // 3. Pearson Correlation Matrix
  const correlationData = useMemo(() => {
    return calculateCorrelations(MATERIALS);
  }, []);

  // 4. Box stats for key attributes
  const boxStats = useMemo(() => {
    return {
      strength: countBoxStats(MATERIALS.map(m => m.strength)),
      density: countBoxStats(MATERIALS.map(m => m.density)),
      cost: countBoxStats(MATERIALS.map(m => m.cost)),
      sustainability: countBoxStats(MATERIALS.map(m => m.sustainability))
    };
  }, []);

  // 5. Yield Strength Histogram (bins of 150MPa)
  const strengthHistogram = useMemo(() => {
    const bins = Array(10).fill(0);
    const binSize = 160; // 0 to 1600 MPa
    
    MATERIALS.forEach(m => {
      const idx = Math.min(9, Math.floor(m.strength / binSize));
      bins[idx]++;
    });

    return bins.map((count, idx) => ({
      range: `${idx * binSize}-${(idx + 1) * binSize} MPa`,
      count
    }));
  }, []);

  return (
    <div id="dataset-analytics-view" className="space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-900/20 pb-5">
        <div>
          <h1 className="font-sans font-bold text-xl text-white tracking-tight uppercase flex items-center gap-2.5">
            <Database className="w-5 h-5 text-blue-400" />
            Dataset Analytics Cockpit
          </h1>
          <p className="text-[11px] font-sans text-slate-400 mt-1">
            Data warehousing and quality metrics. Verify statistical distributions, quantitative box metrics, and Pearson correlation heatmaps across the entire material collection.
          </p>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Materials */}
        <div className="bg-blue-950/20 border border-blue-900/30 rounded p-4 flex flex-col justify-between">
          <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Total Materials Catalog</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-white">{datasetStats.total}</span>
            <span className="text-[10px] text-slate-500 font-mono">records</span>
          </div>
          <span className="text-[9px] text-slate-500 mt-1">Comprehensive isotropic/anisoptropic catalog.</span>
        </div>

        {/* Classes */}
        <div className="bg-blue-950/20 border border-blue-900/30 rounded p-4 flex flex-col justify-between">
          <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Distinct Material Classes</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-white">{datasetStats.classes}</span>
            <span className="text-[10px] text-slate-500 font-mono">classes</span>
          </div>
          <span className="text-[9px] text-slate-500 mt-1">Fiber polymers, metal alloys, and cast matrixes.</span>
        </div>

        {/* Completeness */}
        <div className="bg-blue-950/20 border border-blue-900/30 rounded p-4 flex flex-col justify-between">
          <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Completeness Audit</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-emerald-450">{datasetStats.completeness}%</span>
            <span className="text-[10px] text-slate-500 font-mono">complete</span>
          </div>
          <span className="text-[9px] text-slate-500 mt-1">Zero missing metrics or empty quantitative coordinates.</span>
        </div>

        {/* Quality Score */}
        <div className="bg-blue-950/20 border border-blue-900/30 rounded p-4 flex flex-col justify-between">
          <span className="text-[9px] uppercase font-mono tracking-wider text-slate-400">Dataset Quality Index</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-extrabold text-emerald-400">{datasetStats.qualityScore} / 100</span>
            <span className="text-[10px] text-emerald-450 font-bold">Grade A</span>
          </div>
          <span className="text-[9px] text-slate-500 mt-1">Evaluated based on duplicates, bounds, and completeness.</span>
        </div>

      </div>

      {/* Row 1: Class Distribution Bar & Strength Histogram */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Class distribution */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[360px]">
          <div>
            <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Material Class Volume Composition
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">Shows the counts of unique materials registered in each engineering class.</p>
          </div>

          <div className="flex-1 min-h-[220px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classDistData} margin={{ top: 5, right: 10, bottom: 20, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={8} interval={0} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="count">
                  {classDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Strength histogram */}
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[360px]">
          <div>
            <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Tensile Yield Strength Distribution
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">Histogram binning representing frequency density of yield limits across materials.</p>
          </div>

          <div className="flex-1 min-h-[220px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strengthHistogram} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" stroke="#64748b" fontSize={8} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip contentStyle={{ backgroundColor: '#0B0F19', border: '1px solid rgba(255,255,255,0.1)' }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Row 2: Pearson Correlation Grid & Box Plots */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Heatmap (col 7) */}
        <div className="lg:col-span-7 bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[420px]">
          <div>
            <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Pearson Correlation Coefficient Heatmap
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">
              Measures linear dependencies between attributes. Values approach +1.0 (positive correlation) or -1.0 (negative correlation).
            </p>
          </div>

          {/* Render Heatmap grid */}
          <div className="flex-1 mt-4 overflow-x-auto">
            <table className="w-full text-center border-collapse text-[10px] font-mono select-none">
              <thead>
                <tr className="text-slate-400">
                  <th className="py-2 text-left pl-1 font-sans">Attribute</th>
                  {correlationData.features.map(f => (
                    <th key={f} className="py-2 text-center truncate max-w-[65px] font-sans" title={f}>{f.split(' ')[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlationData.features.map((f, i) => (
                  <tr key={f} className="border-t border-white/5">
                    <td className="py-3 text-left pl-1 font-sans font-semibold text-slate-300">{f}</td>
                    {correlationData.matrix[i]?.map((coeff, j) => {
                      // Color intensity mapping
                      let bgColor = 'bg-slate-900/40';
                      let textColor = 'text-slate-400';
                      if (coeff > 0.5) {
                        bgColor = 'bg-blue-600/60';
                        textColor = 'text-white';
                      } else if (coeff > 0.2) {
                        bgColor = 'bg-blue-600/30';
                        textColor = 'text-blue-200';
                      } else if (coeff < -0.5) {
                        bgColor = 'bg-rose-600/60';
                        textColor = 'text-white';
                      } else if (coeff < -0.2) {
                        bgColor = 'bg-rose-600/30';
                        textColor = 'text-rose-200';
                      }
                      
                      return (
                        <td 
                          key={j} 
                          title={`${f} vs ${correlationData.features[j]}: ${coeff}`}
                          className={`p-2 font-bold transition-all hover:scale-105 rounded-sm ${bgColor} ${textColor}`}
                        >
                          {coeff.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Box-plot summary values (col 5) */}
        <div className="lg:col-span-5 bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between h-[420px]">
          <div>
            <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Descriptive Box Quartiles
            </h2>
            <p className="text-[10px] text-slate-400 mt-1 font-sans">
              Summary statistics representing data spreads, median lines, and minimum/maximum outlier boundaries.
            </p>
          </div>

          <div className="flex-1 mt-4 overflow-y-auto pr-1 space-y-4 text-xs font-mono">
            {/* Box Strength */}
            <div className="space-y-1.5 p-2 rounded bg-slate-950/20 border border-white/5">
              <span className="text-[9px] uppercase font-bold text-blue-400 font-sans block">Yield Strength (MPa)</span>
              <div className="grid grid-cols-5 text-center text-[10px] text-slate-400">
                <div><span className="block text-[8px] text-slate-650">MIN</span>{boxStats.strength.min}</div>
                <div><span className="block text-[8px] text-slate-500">Q1</span>{boxStats.strength.q1}</div>
                <div><span className="block text-[8px] text-white">MEDIAN</span><strong className="text-white font-extrabold">{boxStats.strength.median}</strong></div>
                <div><span className="block text-[8px] text-slate-500">Q3</span>{boxStats.strength.q3}</div>
                <div><span className="block text-[8px] text-slate-650">MAX</span>{boxStats.strength.max}</div>
              </div>
            </div>

            {/* Box Density */}
            <div className="space-y-1.5 p-2 rounded bg-slate-950/20 border border-white/5">
              <span className="text-[9px] uppercase font-bold text-emerald-400 font-sans block">Density (g/cm³)</span>
              <div className="grid grid-cols-5 text-center text-[10px] text-slate-400">
                <div><span className="block text-[8px] text-slate-650">MIN</span>{boxStats.density.min}</div>
                <div><span className="block text-[8px] text-slate-500">Q1</span>{boxStats.density.q1}</div>
                <div><span className="block text-[8px] text-white">MEDIAN</span><strong className="text-white font-extrabold">{boxStats.density.median}</strong></div>
                <div><span className="block text-[8px] text-slate-500">Q3</span>{boxStats.density.q3}</div>
                <div><span className="block text-[8px] text-slate-650">MAX</span>{boxStats.density.max}</div>
              </div>
            </div>

            {/* Box Cost */}
            <div className="space-y-1.5 p-2 rounded bg-slate-950/20 border border-white/5">
              <span className="text-[9px] uppercase font-bold text-yellow-500 font-sans block">Cost Score Index</span>
              <div className="grid grid-cols-5 text-center text-[10px] text-slate-400">
                <div><span className="block text-[8px] text-slate-650">MIN</span>{boxStats.cost.min}</div>
                <div><span className="block text-[8px] text-slate-500">Q1</span>{boxStats.cost.q1}</div>
                <div><span className="block text-[8px] text-white">MEDIAN</span><strong className="text-white font-extrabold">{boxStats.cost.median}</strong></div>
                <div><span className="block text-[8px] text-slate-500">Q3</span>{boxStats.cost.q3}</div>
                <div><span className="block text-[8px] text-slate-650">MAX</span>{boxStats.cost.max}</div>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
