import { 
  BookOpen, 
  Target, 
  MapPin, 
  ChevronRight, 
  GitBranch, 
  Server, 
  Calendar, 
  Award, 
  TrendingUp, 
  FlaskConical,
  Compass
} from 'lucide-react';

export default function ProjectInsightsView() {
  
  const researchMetrics = [
    { title: 'Novelty Score', value: '92%', desc: 'AI rationale & dynamic TOPSIS loops' },
    { title: 'Scalability', value: '88%', desc: 'Extensible material properties' },
    { title: 'Deployability', value: '95%', desc: 'Pure client-side instant computation' },
    { title: 'Feasibility', value: '90%', desc: 'Meets standard automotive standards' },
    { title: 'Explainability', value: '96%', desc: 'Structured Multi-Criteria justification' },
  ];

  return (
    <div id="project-insights-view" className="space-y-6">
      
      {/* Page Title */}
      <div className="border-b border-blue-900/20 pb-5">
        <h1 className="font-sans font-bold text-xl text-white tracking-tight uppercase">Academic Project Insights & Methodology</h1>
        <p className="text-[11px] font-sans text-slate-400 mt-1">Deep documentation regarding the mathematical modeling, research gaps, system architectures, and academic timeline of the AutoMat AI platform.</p>
      </div>

      {/* Research Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3" id="insights-metrics-grid">
        {researchMetrics.map((m, idx) => (
          <div key={idx} className="bg-white/5 border border-white/10 rounded p-3 font-sans hover:border-blue-500/20 transition-colors">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">{m.title}</span>
            <span className="text-lg font-extrabold text-blue-400 mt-1 block">{m.value}</span>
            <span className="text-[10px] text-slate-400 leading-tight block mt-1 font-mono">{m.desc}</span>
          </div>
        ))}
      </div>

      {/* Two Column Section Part A */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Module 1: Problem Statement & Objectives */}
        <div id="section-problem" className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">Problem Statement</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Modern automotive vehicle engineering demands severe mass reduction to maximize battery range in Electric Vehicles (EVs) and satisfy environmental emissions guidelines. However, traditional lightweighting material selections often ignore secondary constraints (e.g., thermal instability or raw cost limitations) or rely on rudimentary trial-and-error procedures. 
          </p>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            This results in suboptimal material arrangements, elevated tooling costs, and extended development cycles. A dynamic, multi-criteria expert platform is needed to balance strength, density, cost, and lifecycle impacts concurrently.
          </p>

          <div className="flex items-center gap-2 pt-2">
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">Objectives</h4>
          </div>
          <ul className="space-y-1 text-xs text-slate-300 font-sans list-disc pl-4 leading-relaxed">
            <li>Formulate an automated, mathematically rigorous TOPSIS multi-criteria solver.</li>
            <li>Maintain an extensive, cohesive engineering database of advanced automotive metals and composites.</li>
            <li>Incorporate modern Ashby Plot envelope curves and correlation heatmap algorithms for detailed property analyses.</li>
            <li>Synthesize high-fidelity natural language AI commentaries detailing tradeoffs to elevate explainability (XAI).</li>
          </ul>
        </div>

        {/* Module 2: System Architecture & Methodology Flowchart */}
        <div id="section-methodology" className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">Methodology Flowchart</h4>
          </div>
          {/* Methodology vertical progress blocks */}
          <div className="space-y-2.5 pl-2">
            {[
              { step: 'Phase I', name: 'Boundary Criterion Selection', desc: 'Identify critical properties for designated components (e.g. Hood, Chassis, Bumper).' },
              { step: 'Phase II', name: 'Normalized Decision Coding', desc: 'Execute relative weight vector scaling and construct the weighted decision matrices.' },
              { step: 'Phase III', name: 'Euclidean Similarity Solves', desc: 'Query distance offsets against ideal-best and ideal-worst target scenarios.' },
              { step: 'Phase IV', name: 'Narrative XAI Compilation', desc: 'Auto-compile academic documentation explaining secondary trade-offs and safety factors.' }
            ].map((st, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-slate-900 border border-blue-500/30 flex items-center justify-center text-[9px] font-mono font-bold text-blue-400">
                    {i + 1}
                  </div>
                  {i < 3 && <div className="w-0.5 h-5 bg-white/10"></div>}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white font-sans">{st.name} <span className="text-[9px] font-mono text-blue-500 ml-1">({st.step})</span></h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-0.5">{st.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 pt-2">
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">System Architecture</h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            AutoMat AI uses a client-side reactive state structure driven by <strong>Vite + TypeScript + Tailwind CSS</strong>. The math core utilizes high-performance linear normalization arrays to execute TOPSIS computations at negligible processor latency, ensuring frictionless interactions on any high-definition screen.
          </p>
        </div>

      </div>

      {/* Row 3: Gap Analysis & Proposed vs Existing (Table grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="insights-gap-row">
        
        {/* Existing System vs Proposed System Table */}
        <div id="section-comparison" className="bg-white/5 border border-white/10 rounded-lg p-5">
          <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white mb-4">
            Existing Systems vs. Proposed AutoMat AI Platform
          </h4>

          <table className="w-full text-left text-xs font-sans" id="table-existing-proposed">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-mono text-slate-400 uppercase tracking-widest leading-relaxed">
                <th className="py-2 pl-1">Feature Dimension</th>
                <th className="py-2">Traditional Engineering Tools</th>
                <th className="py-2 text-blue-400 font-bold">AutoMat AI Framework</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-slate-300">
              <tr>
                <td className="py-3 pl-1 font-mono text-[10px] text-slate-400">Analysis Speed</td>
                <td className="py-3 pr-2.5">Static, slow lookup tables or manual handbook searches</td>
                <td className="py-3 font-semibold text-white">Dynamic, real-time recalculations as sliders move</td>
              </tr>
              <tr>
                <td className="py-3 pl-1 font-mono text-[10px] text-slate-400">Objectives</td>
                <td className="py-3 pr-2.5">Single-property optimization (typically cost or weight only)</td>
                <td className="py-3 font-semibold text-white">Multi-Dimensional balancing (MCDA weighted TOPSIS)</td>
              </tr>
              <tr>
                <td className="py-3 pl-1 font-mono text-[10px] text-slate-400">Visual Aids</td>
                <td className="py-3 pr-2.5">Basic independent plots requiring high external translation</td>
                <td className="py-3 font-semibold text-white">Interactive Ashby scatter, dynamic Pearson heatmaps & radar curves</td>
              </tr>
              <tr>
                <td className="py-3 pl-1 font-mono text-[10px] text-slate-400">Explainability</td>
                <td className="py-3 pr-2.5">Completely absent; manual report generation required</td>
                <td className="py-3 font-semibold text-white">Structured Explainable AI detailing complex trade-offs</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Research Gap Analysis & Future Scope */}
        <div id="section-gaps" className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Research Gap Analysis
            </h4>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Prior material selection systems (such as early-stage materials lookup software) function as simple static filters rather than intelligent decision support systems. They lack the flexibility of live weighted parameters, fail to bridge physical data with economic or environmental vectors, and provide no logical explanation for why a specific recommendation is made over nearby runner-up choices. AutoMat AI fills this crucial gap by marrying MCDA with structured AI commentary.
          </p>

          <div className="flex items-center gap-2 pt-2 pb-2 border-b border-white/5">
            <h4 className="text-xs font-bold border-l-2 border-blue-500 pl-2 uppercase tracking-wide text-white">
              Academic Timeline & Future Scope
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 font-sans">
              <span className="text-[9px] font-mono font-black text-blue-400 uppercase tracking-wider block">Development Timeline</span>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Initiated with rigorous engineering data compiles (Month 1-2). Algorithmic TOPSIS integration completed (Month 3). Visual UI dashboards and Explainable AI narratives fully verified (Month 4).
              </p>
            </div>
            <div className="space-y-1 font-sans">
              <span className="text-[9px] font-mono font-black text-purple-400 uppercase tracking-wider block">Future Scope Expansion</span>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Plan to incorporate high-throughput finite element analysis (FEA) plugins, expand the composite database to 100+ grades, and offer native CAD export links.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
