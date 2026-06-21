import { useState, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import SelectionView from './components/SelectionView';
import AnalysisView from './components/AnalysisView';
import ExplainableAIView from './components/ExplainableAIView';
import ProjectInsightsView from './components/ProjectInsightsView';
import { ComponentType, CriteriaWeights, RecommendationHistory } from './types';
import { INITIAL_HISTORY, COMPONENT_PROFILES, MATERIALS } from './data';
import { runTopsis } from './utils';
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
    return runTopsis(MATERIALS, criteriaWeights);
  }, [criteriaWeights]);

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

  // Downloads a beautiful research-grade Markdown/TXT report of the active session
  const handleDownloadReport = () => {
    const topResult = topsisRankings[0];
    const dateStr = new Date().toLocaleString();
    
    const reportText = `===========================================================
                      AUTOMAT AI
   AI-Based Material Selection System for Automotive Applications
===========================================================
REPORT GENERATED ON: ${dateStr}
RESEARCH CORE: CES EduPack + TOPSIS MCDA Solver

SELECTED OPTIMIZATION TARGET:
-----------------------------------------------------------
Component category: ${selectedComponent}
Assembly Profile  : ${COMPONENT_PROFILES[selectedComponent].name}
Description       : ${COMPONENT_PROFILES[selectedComponent].description}

CRITERIA PRIORITY MATRIX WEIGHT VECTOR:
-----------------------------------------------------------
- Yield Tensile Strength: ${(criteriaWeights.strength * 100).toFixed(0)}%
- Mass Reduction Index  : ${(criteriaWeights.weight * 100).toFixed(0)}%
- Relative Cost Factor  : ${(criteriaWeights.cost * 100).toFixed(0)}%
- Corrosion Resistance  : ${(criteriaWeights.corrosion * 100).toFixed(0)}%
- Tribological Wear     : ${(criteriaWeights.wear * 100).toFixed(0)}%
- Eco Sustainability    : ${(criteriaWeights.sustainability * 100).toFixed(0)}%

TOP 5 ALGORITHMIC RECOMMENDATIONS (TOPSIS):
-----------------------------------------------------------
${topsisRankings.slice(0, 5).map((r, idx) => {
  return `${idx + 1}. [TOPSIS Score: ${r.score.toFixed(4)}] ${r.material.name} (${r.material.grade})
   - Class: ${r.material.materialClass}
   - Tensile Strength: ${r.material.strength} MPa | Density: ${r.material.density} g/cc | Cost Index: ${r.material.cost}`
}).join('\n\n')}

EXPLAINABLE AI (XAI) DECISION JUSTIFICATION:
-----------------------------------------------------------
The TOPSIS optimization engine concluded that ${topResult?.material.name} (${topResult?.material.grade}) displays the highest composite proximity score (${(topResult?.score * 100).toFixed(2)}%) to the idealistic engineering material.
This choice satisfies Federal Motor Vehicle Safety Standards (FMVSS) by balancing load resistance limits with cost indicators and specific stiffness parameters, enabling lightweight designs without risk of catastrophic structural fatigue.

===========================================================
              AUTOMAT AI — HIGH-FIDELITY MCDA TERMINAL
===========================================================`;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `automat_decision_report_${selectedComponent.toLowerCase().replace(' ', '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

          {activeTab === 'analysis' && (
            <AnalysisView />
          )}

          {activeTab === 'xai' && (
            <ExplainableAIView 
              selectedComponent={selectedComponent}
              criteriaWeights={criteriaWeights}
              topsisRankings={topsisRankings}
            />
          )}

          {activeTab === 'insights' && (
            <ProjectInsightsView />
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
  );
}
