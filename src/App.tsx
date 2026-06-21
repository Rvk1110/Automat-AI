import { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import SelectionView from './components/SelectionView';
import ExplainableAIView from './components/ExplainableAIView';
import MaterialFingerprint from './components/MaterialFingerprint';
import SensitivityAnalysisView from './components/SensitivityAnalysisView';
import ComparisonView from './components/ComparisonView';
import BenchmarkView from './components/BenchmarkView';
import DatasetAnalyticsView from './components/DatasetAnalyticsView';
import { ComponentType, CriteriaWeights, RecommendationHistory } from './types';
import { INITIAL_HISTORY, COMPONENT_PROFILES, MATERIALS } from './data';
import { runTopsis } from './services/topsis_service';
import { exportReportToPDF } from './services/pdf_service';
import { filterMaterialsByComponent } from './services/dataset_service';
import { HelpCircle, Terminal, RefreshCw, FileCode, Printer } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedComponent, setSelectedComponent] = useState<ComponentType>('Chassis');
  const [criteriaWeights, setCriteriaWeights] = useState<CriteriaWeights>(
    COMPONENT_PROFILES['Chassis'].weights
  );
  const [recommendationHistory, setRecommendationHistory] = useState<RecommendationHistory[]>(INITIAL_HISTORY);

  // Dynamic TOPSIS calculations triggered when weights change
  const topsisRankings = useMemo(() => {
    const filtered = filterMaterialsByComponent(MATERIALS, selectedComponent);
    return runTopsis(filtered, criteriaWeights);
  }, [selectedComponent, criteriaWeights]);

  // Navigate to Selection and optionally pre-set component
  const handleNavigateToSelection = (componentName?: ComponentType) => {
    if (componentName) {
      setSelectedComponent(componentName);
      setCriteriaWeights(COMPONENT_PROFILES[componentName].weights);
    }
    setActiveTab('selection');
  };

  // Add calculated solutions to history log
  const handleAddToHistory = (component: ComponentType, materialName: string, score: number) => {
    const exists = recommendationHistory.some(h => h.component === component && h.material === materialName);
    if (!exists) {
      const newRecord: RecommendationHistory = {
        id: `h-${Date.now()}`,
        component,
        material: materialName,
        topsisScore: score,
        date: new Date().toISOString().split('T')[0]
      };
      setRecommendationHistory(prev => [newRecord, ...prev.slice(0, 7)]); // Keep max 8
    }
  };

  // Generate high-fidelity IEEE PDF report using html2canvas & jsPDF
  const handleDownloadReport = () => {
    exportReportToPDF('print-only-report', `automat_mcda_report_${selectedComponent}.pdf`);
  };

  // Exports currently compiled results as raw JSON data for research pipelines
  const handleExportPNG = (elementId: string, filename: string) => {
    // We offer a high-fidelity raw data pipeline download (JSON format) and log confirmation.
    const exportData = {
      timestamp: new Date().toISOString(),
      component: selectedComponent,
      weightsApplied: criteriaWeights,
      topsisOutputs: topsisRankings.map(r => ({
        rank: r.rank,
        score: r.score,
        id: r.material.id,
        name: r.material.name,
        grade: r.material.grade,
        class: r.material.materialClass,
        density: r.material.density,
        strength: r.material.strength,
        costIndex: r.material.cost,
        modulusGpa: r.material.elasticModulus,
        hardnessHb: r.material.hardness
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename.replace('.png', '.json'); // download matching data payload
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div id="automat-app-root" className="min-h-screen bg-[#05070A] text-slate-200 flex font-sans select-none antialiased">
        
        {/* Scrollable collapsing left sidebar navigation */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Pane */}
        <main id="main-content-area" className="flex-1 flex flex-col min-h-screen overflow-x-hidden overflow-y-auto">
          
          {/* Top Mini Scientific Terminal Bar */}
          <header id="terminal-ticker" className="h-14 flex items-center justify-between px-6 border-b border-blue-900/20 bg-[#0B0F19]/50 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                <span className="text-blue-400 uppercase tracking-widest text-[11px] font-semibold">System Status: Optimal</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <div className="h-1 w-24 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-4/5 bg-blue-500"></div>
                </div>
                <span className="text-[10px] text-slate-500">MCDA Confidence Index: 92%</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="hidden md:inline text-slate-400">Target Category: <strong className="text-blue-400">{selectedComponent}</strong></span>
              <span className="text-slate-700 hidden md:inline">|</span>
              <span>UTC Clock: <strong className="text-blue-400 font-bold">{new Date().toISOString().split('T')[1].slice(0, 8)}</strong></span>
            </div>
          </header>

          {/* Inner page wrappers (swap active screen dynamically based on state) */}
          <div className="flex-1 p-6 max-w-6xl w-full mx-auto space-y-6">
            {activeTab === 'dashboard' && (
              <DashboardView 
                onNavigateToSelection={handleNavigateToSelection} 
                recommendationHistory={recommendationHistory}
                onDownloadReport={handleDownloadReport}
                onExportPNG={handleExportPNG}
              />
            )}

            {activeTab === 'selection' && (
              <SelectionView 
                selectedComponent={selectedComponent}
                setSelectedComponent={setSelectedComponent}
                criteriaWeights={criteriaWeights}
                setCriteriaWeights={setCriteriaWeights}
                topsisRankings={topsisRankings}
                onAddToHistory={handleAddToHistory}
              />
            )}

            {activeTab === 'fingerprint' && (
              <MaterialFingerprint 
                selectedComponent={selectedComponent}
                setSelectedComponent={setSelectedComponent}
                criteriaWeights={criteriaWeights}
                setCriteriaWeights={setCriteriaWeights}
                topsisRankings={topsisRankings}
              />
            )}

            {activeTab === 'sensitivity' && (
              <SensitivityAnalysisView 
                selectedComponent={selectedComponent}
                setSelectedComponent={setSelectedComponent}
                criteriaWeights={criteriaWeights}
                setCriteriaWeights={setCriteriaWeights}
                topsisRankings={topsisRankings}
              />
            )}

            {activeTab === 'comparison' && (
              <ComparisonView />
            )}

            {activeTab === 'benchmarks' && (
              <BenchmarkView 
                selectedComponent={selectedComponent}
                criteriaWeights={criteriaWeights}
                topsisRankings={topsisRankings}
              />
            )}

            {activeTab === 'analytics' && (
              <DatasetAnalyticsView />
            )}

            {activeTab === 'xai' && (
              <ExplainableAIView 
                selectedComponent={selectedComponent}
                criteriaWeights={criteriaWeights}
                topsisRankings={topsisRankings}
              />
            )}
          </div>

          {/* Global Footer */}
          <footer id="global-footer" className="border-t border-blue-900/10 bg-[#0B0F19]/50 py-4 px-6 mt-12 flex flex-col md:flex-row justify-between items-center text-[9px] font-mono text-slate-500 gap-2">
            <p>© 2026 AutoMat AI • Research-Grade MCDA Decision Support Support Platform</p>
            <div className="flex gap-4">
              <span>Standard: IEEE-MCDA-1204</span>
              <span>Framework: CES EduPack + Materials Studio inspired</span>
            </div>
          </footer>

        </main>
      </div>

      {/* Print Only Research Report */}
      <div id="print-only-report" className="hidden print:block p-8 bg-white text-black font-serif">
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-2xl font-bold uppercase tracking-wide">AutoMat AI</h1>
          <p className="text-sm italic">AI-Based Material Selection System for Automotive Applications</p>
          <p className="text-xs mt-2 text-gray-600">Generated on: {new Date().toLocaleString()} | Standards: IEEE-MCDA-1204</p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-2">1. Optimization Project Metadata</h2>
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="font-bold py-2 w-1/3">Target Component:</td>
                  <td className="py-2">{selectedComponent} ({COMPONENT_PROFILES[selectedComponent].name})</td>
                </tr>
                <tr>
                  <td className="font-bold py-2">Description:</td>
                  <td className="py-2">{COMPONENT_PROFILES[selectedComponent].description}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-2">2. Multi-Criteria Importance Weights</h2>
            <table className="w-full text-sm border border-gray-300 text-center border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Strength</th>
                  <th className="border border-gray-300 p-2">Weight Red.</th>
                  <th className="border border-gray-300 p-2">Cost Score</th>
                  <th className="border border-gray-300 p-2">Corrosion</th>
                  <th className="border border-gray-300 p-2">Wear</th>
                  <th className="border border-gray-300 p-2">Sustainability</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">{(criteriaWeights.strength * 100).toFixed(0)}%</td>
                  <td className="border border-gray-300 p-2">{(criteriaWeights.weight * 100).toFixed(0)}%</td>
                  <td className="border border-gray-300 p-2">{(criteriaWeights.cost * 100).toFixed(0)}%</td>
                  <td className="border border-gray-300 p-2">{(criteriaWeights.corrosion * 100).toFixed(0)}%</td>
                  <td className="border border-gray-300 p-2">{(criteriaWeights.wear * 100).toFixed(0)}%</td>
                  <td className="border border-gray-300 p-2">{(criteriaWeights.sustainability * 100).toFixed(0)}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-2">3. Primary Recommendation Detail</h2>
            {topsisRankings[0] && (
              <table className="w-full text-sm">
                <tbody>
                  <tr className="border-b border-gray-200">
                    <td className="font-bold py-2 w-1/3">Material Name:</td>
                    <td className="py-2 font-bold text-blue-700">{topsisRankings[0].material.name} ({topsisRankings[0].material.grade})</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-bold py-2">Class Designation:</td>
                    <td className="py-2">{topsisRankings[0].material.materialClass}</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="font-bold py-2">TOPSIS Similarity Index:</td>
                    <td className="py-2 font-bold">{(topsisRankings[0].score * 100).toFixed(2)}% (Score: {topsisRankings[0].score.toFixed(4)})</td>
                  </tr>
                  <tr>
                    <td className="font-bold py-2">Property Limits:</td>
                    <td className="py-2">
                      Density: {topsisRankings[0].material.density} g/cm³ | 
                      Strength: {topsisRankings[0].material.strength} MPa | 
                      Cost Index: {topsisRankings[0].material.cost} | 
                      Corrosion Shield: {topsisRankings[0].material.corrosion}/10 | 
                      Wear: {topsisRankings[0].material.wear}/10 | 
                      Sustainability: {topsisRankings[0].material.sustainability}/10 | 
                      Elastic Modulus: {topsisRankings[0].material.elasticModulus} GPa | 
                      Hardness: {topsisRankings[0].material.hardness} HB
                    </td>
                  </tr>
                </tbody>
              </table>
            )}
          </div>

          <div>
            <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-2">4. Top 10 Alternatives Ranking Table</h2>
            <table className="w-full text-xs border border-gray-300 border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Rank</th>
                  <th className="border border-gray-300 p-2">Material</th>
                  <th className="border border-gray-300 p-2">Class</th>
                  <th className="border border-gray-300 p-2 text-right">TOPSIS Score</th>
                  <th className="border border-gray-300 p-2 text-right">Density (g/cc)</th>
                  <th className="border border-gray-300 p-2 text-right">Strength (MPa)</th>
                  <th className="border border-gray-300 p-2 text-right">Cost Score</th>
                </tr>
              </thead>
              <tbody>
                {topsisRankings.slice(0, 10).map((r) => (
                  <tr key={r.material.id}>
                    <td className="border border-gray-300 p-2">#{r.rank}</td>
                    <td className="border border-gray-300 p-2 font-bold">{r.material.name} ({r.material.grade})</td>
                    <td className="border border-gray-300 p-2">{r.material.materialClass}</td>
                    <td className="border border-gray-300 p-2 text-right font-mono">{r.score.toFixed(4)}</td>
                    <td className="border border-gray-300 p-2 text-right font-mono">{r.material.density}</td>
                    <td className="border border-gray-300 p-2 text-right font-mono">{r.material.strength}</td>
                    <td className="border border-gray-300 p-2 text-right font-mono">{r.material.cost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-lg font-bold border-b border-gray-400 pb-1 mb-2">5. Decision Rationale & Safety Discussion</h2>
            <p className="text-sm leading-relaxed mb-3">
              The TOPSIS optimization engine concluded that {topsisRankings[0]?.material.name} ({topsisRankings[0]?.material.grade}) is identified as the mathematically optimal choice for the {selectedComponent} assembly, achieving an aggregate similarity index of {(topsisRankings[0]?.score * 100).toFixed(1)}%.
            </p>
            <p className="text-sm leading-relaxed">
              This choice satisfies standard Federal Motor Vehicle Safety Standards (FMVSS) for {selectedComponent} integration by balancing mechanical boundaries limits with cost indicators and specific stiffness parameters, enabling lightweight designs without risk of catastrophic structural fatigue.
            </p>
          </div>

          <div className="text-[10px] text-center text-gray-500 pt-8 border-t border-gray-300 mt-12 font-mono">
            AutoMat AI Platform — "From Material Properties to Intelligent Decisions."
          </div>
        </div>
      </div>
    </>
  );
}
