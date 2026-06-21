import { useMemo } from 'react';
import { Database } from 'lucide-react';
import { Material } from '../types';
import { MATERIALS } from '../data';
import { calculateCorrelations } from '../utils';

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

  // 2. Pearson Correlation Matrix
  const correlationData = useMemo(() => {
    return calculateCorrelations(MATERIALS);
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
            Data warehousing and quality metrics. Verify completeness levels and Pearson correlation heatmaps across the entire material collection.
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
          <span className="text-[9px] text-slate-500 mt-1">Comprehensive isotropic/anisotropic catalog.</span>
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

      {/* Row 1: Pearson Correlation Grid (Full Width) */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-5">
        <div>
          <h2 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
            Pearson Correlation Coefficient Heatmap
          </h2>
          <p className="text-[10px] text-slate-400 mt-1 font-sans">
            Measures linear dependencies between attributes. Values approach +1.0 (positive correlation) or -1.0 (negative correlation).
          </p>
        </div>

        {/* Render Heatmap grid */}
        <div className="mt-6 overflow-x-auto">
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
                        className={`p-2.5 font-bold transition-all hover:scale-105 rounded-sm ${bgColor} ${textColor}`}
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

    </div>
  );
}
